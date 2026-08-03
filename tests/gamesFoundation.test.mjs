import assert from "node:assert/strict";
import test from "node:test";
import {
  GAME_CATALOG,
  ROLLOUT_CONTENT,
  getCompatibleContent,
  getCompatibleGames,
  isGameCompatibleWithContent,
} from "../src/games/core/catalog.ts";
import { createCompletionCoordinator } from "../src/games/core/completionCoordinator.ts";
import {
  BEAT_THE_CLOCK_TIMERS_MS,
  GAME_XP_RULES,
  ROUND_SIZES,
  calculateRoundXp,
} from "../src/games/core/roundConfig.ts";
import { selectChallenges } from "../src/games/core/selectChallenges.ts";
import {
  createRoundState,
  finalizeRound,
  hasValidInteractionCount,
  recordOutcome,
} from "../src/games/core/sessionEngine.ts";
import { shuffleWithSeed } from "../src/games/core/shuffle.ts";

const grammar = { domain: "grammar", grammarTopicId: "present_tobe" };
const vocabulary = { domain: "vocabulary", vocabularyCategoryId: "body" };

test("catalog declares the nine DOM games and two arcades with central round sizes", () => {
  assert.equal(GAME_CATALOG.length, 11);
  assert.equal(new Set(GAME_CATALOG.map((game) => game.id)).size, GAME_CATALOG.length);
  for (const game of GAME_CATALOG) {
    assert.equal(game.defaultRoundSize, ROUND_SIZES[game.id].count);
  }
});

test("compatibility is limited to the canonical rollout content", () => {
  assert.deepEqual(ROLLOUT_CONTENT, [grammar, vocabulary]);
  assert.deepEqual(
    getCompatibleGames(grammar).map((game) => game.id),
    ["sentence_builder", "error_hunt", "beat_the_clock", "listening_ear"],
  );
  assert.deepEqual(
    getCompatibleGames(vocabulary).map((game) => game.id),
    [
      "beat_the_clock",
      "sorting_station",
      "secret_word",
      "matching_pairs",
      "crossword",
      "memory_match",
      "listening_ear",
      "bubble_shooter",
      "word_slice",
    ],
  );
  assert.equal(
    isGameCompatibleWithContent("sentence_builder", {
      domain: "grammar",
      grammarTopicId: "past_tobe",
    }),
    false,
  );
  assert.equal(
    isGameCompatibleWithContent("matching_pairs", {
      domain: "vocabulary",
      vocabularyCategoryId: "animals",
    }),
    false,
  );
  assert.deepEqual(getCompatibleContent("matching_pairs"), [vocabulary]);
  assert.deepEqual(getCompatibleContent("bubble_shooter"), [vocabulary]);
  assert.deepEqual(getCompatibleContent("word_slice"), [vocabulary]);
});

test("seeded shuffle and selection are deterministic, immutable and duplicate-free", () => {
  const pool = ["a", "b", "c", "d", "e", "f"];
  const original = [...pool];
  const first = shuffleWithSeed(pool, 2026);
  const second = shuffleWithSeed(pool, 2026);
  assert.deepEqual(first, second);
  assert.deepEqual(pool, original);
  assert.deepEqual(new Set(first), new Set(pool));

  const selection = selectChallenges(pool, 4, 2026);
  assert.equal(selection.length, 4);
  assert.equal(new Set(selection).size, 4);
  assert.deepEqual(selectChallenges(pool, 20, 2026), first);
  assert.deepEqual(selectChallenges(pool, -1, 2026), []);
  assert.deepEqual(
    selectChallenges(
      [
        { id: "a", value: 1 },
        { id: "a", value: 2 },
        { id: "b", value: 3 },
      ],
      3,
      2026,
    ).map((item) => item.id).sort(),
    ["a", "b"],
  );
});

test("round configuration keeps timers and XP economy within the approved contract", () => {
  assert.deepEqual(BEAT_THE_CLOCK_TIMERS_MS, {
    word: 10_000,
    sentenceTyping: 20_000,
    sentenceUnscramble: 10_000,
    errorHunt: 20_000,
  });
  assert.equal(calculateRoundXp(0, 0), 0);
  assert.equal(calculateRoundXp(0, 5), GAME_XP_RULES.perCompletedRound);
  assert.equal(calculateRoundXp(5, 5), 35);
  assert.equal(calculateRoundXp(20, 20), GAME_XP_RULES.maxPerRound);
});

test("session engine records only the first outcome for each challenge", () => {
  const initial = createRoundState("matching_pairs");
  const first = recordOutcome(initial, "body-hand", false, "2026-07-30T12:00:00.000Z");
  const duplicate = recordOutcome(first, "body-hand", true, "2026-07-30T12:00:01.000Z");
  const second = recordOutcome(first, "body-eye", true, "2026-07-30T12:00:02.000Z");

  assert.equal(duplicate, first);
  assert.equal(second.currentIndex, 2);
  assert.deepEqual(
    second.outcomes.map(({ challengeId, correct }) => ({ challengeId, correct })),
    [
      { challengeId: "body-hand", correct: false },
      { challengeId: "body-eye", correct: true },
    ],
  );

  const result = finalizeRound(second, "2026-07-30T12:01:00.000Z", 140);
  second.outcomes.push({
    challengeId: "body-foot",
    correct: true,
    answeredAt: "2026-07-30T12:00:03.000Z",
  });
  assert.equal(result.totalChallenges, 2);
  assert.equal(result.outcomes.length, 2);
  assert.equal(result.correctCount, 1);
  assert.equal(result.xpEarned, 15);
  assert.equal(result.score, 140);
  assert.equal(hasValidInteractionCount(result), false);

  const qualified = finalizeRound(
    ["a", "b", "c", "d", "e"].reduce(
      (state, id) => recordOutcome(state, id, true, `2026-07-30T12:00:0${state.currentIndex}.000Z`),
      createRoundState("secret_word"),
    ),
  );
  assert.equal(hasValidInteractionCount(qualified), true);
});

test("completion coordinator deduplicates simultaneous completion calls", async () => {
  let calls = 0;
  const coordinator = createCompletionCoordinator({
    createSessionId: () => "session-a",
    persist: async () => {
      calls += 1;
    },
  });

  const first = coordinator.complete({ score: 10 });
  const second = coordinator.complete({ score: 10 });
  assert.equal(first, second);
  await Promise.all([first, second]);
  await coordinator.complete({ score: 10 });
  assert.equal(calls, 1);
});

test("completion coordinator retries a partial failure with the same session id", async () => {
  const sessions = [];
  let saves = 0;
  let engagementWrites = 0;
  const coordinator = createCompletionCoordinator({
    createSessionId: () => "session-retry",
    persist: async (sessionId) => {
      sessions.push(sessionId);
      saves += 1;
      if (saves === 1) throw new Error("engagement unavailable after save");
      engagementWrites += 1;
    },
  });

  await coordinator.complete({ score: 20 });
  assert.deepEqual(sessions, ["session-retry", "session-retry"]);
  assert.equal(saves, 2);
  assert.equal(engagementWrites, 1);
});

test("completion coordinator permits an explicit retry after automatic attempts fail", async () => {
  let calls = 0;
  const coordinator = createCompletionCoordinator({
    createSessionId: () => "session-recover",
    persist: async () => {
      calls += 1;
      if (calls <= 2) throw new Error("offline");
    },
  });

  await assert.rejects(coordinator.complete({ score: 30 }), /offline/);
  await coordinator.complete({ score: 30 });
  assert.equal(calls, 3);
  assert.equal(coordinator.getSessionId(), "session-recover");
});

test("completion coordinator serializes a new session behind an in-flight reset", async () => {
  const resolvers = [];
  const started = [];
  let nextId = 0;
  const coordinator = createCompletionCoordinator({
    createSessionId: () => `session-${++nextId}`,
    persist: (sessionId) => {
      started.push(sessionId);
      return new Promise((resolve) => resolvers.push(resolve));
    },
  });

  const first = coordinator.complete({ score: 40 });
  await Promise.resolve();
  assert.deepEqual(started, ["session-1"]);

  assert.equal(coordinator.reset(), "session-2");
  const second = coordinator.complete({ score: 50 });
  await Promise.resolve();
  assert.deepEqual(started, ["session-1"]);

  resolvers.shift()();
  await first;
  await Promise.resolve();
  assert.deepEqual(started, ["session-1", "session-2"]);

  resolvers.shift()();
  await second;
  await coordinator.complete({ score: 50 });
  assert.deepEqual(started, ["session-1", "session-2"]);
});
