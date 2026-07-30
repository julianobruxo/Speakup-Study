import assert from "node:assert/strict";
import test from "node:test";
import { PRESENT_TOBE_QUESTIONS } from "../src/content/data/presentTobeQuestions.ts";
import { buildBeatTheClockChallenges } from "../src/games/adapters/beatTheClockAdapter.ts";
import {
  BODY_GROUPS,
  getBodyEntries,
  getBodyGroupId,
} from "../src/games/adapters/bodyVocabularyAdapter.ts";
import { buildListeningChallenges } from "../src/games/adapters/listeningAdapter.ts";
import {
  getErrorHuntQuestions,
  getSentenceBuilderQuestions,
  isSelectableErrorToken,
  materializeSentence,
  toErrorHuntChallenge,
  toSentenceBuilderChallenge,
} from "../src/games/adapters/presentTobeAdapter.ts";
import { BEAT_THE_CLOCK_TIMERS_MS } from "../src/games/core/roundConfig.ts";
import { resolveBeatClockAttempt } from "../src/games/core/beatClockSettlement.ts";
import { selectChallenges } from "../src/games/core/selectChallenges.ts";
import { generateCrossword } from "../src/games/mechanics/crosswordGenerator.ts";

function tokenize(sentence) {
  return sentence
    .replace(/([.,!?;:])/g, " $1")
    .split(/\s+/)
    .filter(Boolean);
}

test("grammar game adapters safely materialize the complete canonical bank", () => {
  assert.equal(PRESENT_TOBE_QUESTIONS.length, 130);

  for (const question of PRESENT_TOBE_QUESTIONS) {
    const blanks = question.question.match(/___/g) ?? [];
    const answers = question.correctAnswer.split(" / ");
    assert.equal(
      blanks.length,
      answers.length,
      `${question.id} must provide one ordered answer per blank`,
    );
    assert.equal(materializeSentence(question).includes("___"), false, question.id);
  }

  const eligible = getSentenceBuilderQuestions();
  assert.equal(eligible.length, 110);
  assert.equal(new Set(eligible.map((question) => question.id)).size, eligible.length);
  for (const excludedId of [
    "present_tobe_easy_003",
    "present_tobe_easy_031",
    "present_tobe_medium_036",
    "present_tobe_medium_047",
    "present_tobe_medium_070",
  ]) {
    const question = PRESENT_TOBE_QUESTIONS.find((item) => item.id === excludedId);
    assert.ok(question, excludedId);
    assert.equal(toSentenceBuilderChallenge(question), null, excludedId);
  }
  for (const question of eligible) {
    const challenge = toSentenceBuilderChallenge(question);
    assert.ok(challenge, question.id);
    assert.deepEqual(challenge.tokens, tokenize(materializeSentence(question)), question.id);
    assert.deepEqual(challenge.correctOrder, challenge.tokens, question.id);
  }
});

test("error hunt challenges contain exactly one reviewed token difference", () => {
  const eligible = getErrorHuntQuestions();
  assert.equal(eligible.length, 115);
  assert.equal(new Set(eligible.map((question) => question.id)).size, eligible.length);
  const ambiguousCombo = PRESENT_TOBE_QUESTIONS.find(
    (question) => question.id === "present_tobe_medium_018",
  );
  assert.ok(ambiguousCombo);
  assert.equal(toErrorHuntChallenge(ambiguousCombo), null);

  for (const question of eligible) {
    const challenge = toErrorHuntChallenge(question);
    assert.ok(challenge, question.id);
    const correctTokens = tokenize(materializeSentence(question));
    const differences = challenge.displayTokens
      .map((token, index) => token.toLowerCase() !== correctTokens[index]?.toLowerCase())
      .filter(Boolean);
    assert.equal(differences.length, 1, question.id);
    assert.equal(
      challenge.correctToken.toLowerCase(),
      correctTokens[challenge.errorTokenIndex].toLowerCase(),
      question.id,
    );
    assert.equal(isSelectableErrorToken(challenge.displayTokens[challenge.errorTokenIndex]), true);
    assert.ok(
      challenge.displayTokens.some((token) => !isSelectableErrorToken(token)),
      `${question.id} should preserve sentence punctuation as non-selectable text`,
    );
  }
});

test("mixed game rounds are deterministic, unique and include every confirmed mode", () => {
  const beatRound = buildBeatTheClockChallenges(2026, 10);
  assert.deepEqual(beatRound, buildBeatTheClockChallenges(2026, 10));
  assert.equal(beatRound.length, 10);
  assert.equal(new Set(beatRound.map((challenge) => challenge.id)).size, 10);
  assert.deepEqual(
    new Set(beatRound.map((challenge) => challenge.kind)),
    new Set(["word_challenge", "sentence_typing", "sentence_builder", "error_hunt"]),
  );
  for (const challenge of beatRound) {
    const expectedTimer = {
      word_challenge: BEAT_THE_CLOCK_TIMERS_MS.word,
      sentence_typing: BEAT_THE_CLOCK_TIMERS_MS.sentenceTyping,
      sentence_builder: BEAT_THE_CLOCK_TIMERS_MS.sentenceUnscramble,
      error_hunt: BEAT_THE_CLOCK_TIMERS_MS.errorHunt,
    }[challenge.kind];
    assert.equal(challenge.timerMs, expectedTimer, challenge.id);
  }

  const listeningRound = buildListeningChallenges(2026, 10);
  assert.deepEqual(listeningRound, buildListeningChallenges(2026, 10));
  assert.equal(listeningRound.length, 10);
  assert.equal(new Set(listeningRound.map((challenge) => challenge.id)).size, 10);
  assert.deepEqual(
    new Set(listeningRound.map((challenge) => challenge.mode)),
    new Set(["select-image", "type-word", "assemble-sentence"]),
  );
});

test("beat clock settles once against the exact monotonic deadline", () => {
  assert.deepEqual(resolveBeatClockAttempt(true, 9_999, 10_000), {
    correct: true,
    remainingMs: 1,
    timedOut: false,
  });
  assert.deepEqual(resolveBeatClockAttempt(true, 10_000, 10_000), {
    correct: false,
    remainingMs: 0,
    timedOut: true,
  });
  assert.deepEqual(resolveBeatClockAttempt(true, 10_250, 10_000), {
    correct: false,
    remainingMs: 0,
    timedOut: true,
  });
  assert.deepEqual(resolveBeatClockAttempt(false, 8_000, 10_000), {
    correct: false,
    remainingMs: 2_000,
    timedOut: false,
  });
});

test("sorting station can select four reviewed entries from each anatomical group", () => {
  const entries = getBodyEntries();
  assert.equal(entries.length, 24);
  assert.deepEqual(
    new Set(entries.map((entry) => getBodyGroupId(entry))),
    new Set(BODY_GROUPS.map((group) => group.id)),
  );

  const selected = BODY_GROUPS.flatMap((group, index) =>
    selectChallenges(
      entries.filter((entry) => getBodyGroupId(entry) === group.id),
      4,
      2026 + index * 211,
    ),
  );
  assert.equal(selected.length, 12);
  assert.equal(new Set(selected.map((entry) => entry.id)).size, 12);
  for (const group of BODY_GROUPS) {
    assert.equal(
      selected.filter((entry) => getBodyGroupId(entry) === group.id).length,
      4,
      group.id,
    );
  }
});

function validateCrosswordGrid(grid) {
  const cells = new Map();
  for (const placement of grid.placements) {
    const word = placement.challenge.answer.toUpperCase();
    for (let index = 0; index < word.length; index += 1) {
      const row = placement.direction === "down" ? placement.row + index : placement.row;
      const col = placement.direction === "across" ? placement.col + index : placement.col;
      const key = `${row},${col}`;
      const owners = cells.get(key) ?? [];
      owners.push({
        direction: placement.direction,
        id: placement.challenge.id,
        letter: word[index],
        placementIndex: grid.placements.indexOf(placement),
      });
      cells.set(key, owners);
    }
  }

  for (const owners of cells.values()) {
    assert.ok(owners.length <= 2);
    assert.equal(new Set(owners.map((owner) => owner.letter)).size, 1);
    assert.equal(new Set(owners.map((owner) => owner.direction)).size, owners.length);
  }

  for (const [placementIndex, placement] of grid.placements.entries()) {
    const word = placement.challenge.answer.toUpperCase();
    const before = placement.direction === "down"
      ? `${placement.row - 1},${placement.col}`
      : `${placement.row},${placement.col - 1}`;
    const after = placement.direction === "down"
      ? `${placement.row + word.length},${placement.col}`
      : `${placement.row},${placement.col + word.length}`;
    assert.equal(cells.has(before), false, `${placement.challenge.id} has a joined prefix`);
    assert.equal(cells.has(after), false, `${placement.challenge.id} has a joined suffix`);

    let earlierIntersections = 0;
    for (let index = 0; index < word.length; index += 1) {
      const row = placement.direction === "down" ? placement.row + index : placement.row;
      const col = placement.direction === "across" ? placement.col + index : placement.col;
      const owners = cells.get(`${row},${col}`);
      if (owners.length === 2) {
        if (owners.some((owner) => owner.placementIndex < placementIndex)) {
          earlierIntersections += 1;
        }
        continue;
      }
      const sideA = placement.direction === "across" ? `${row - 1},${col}` : `${row},${col - 1}`;
      const sideB = placement.direction === "across" ? `${row + 1},${col}` : `${row},${col + 1}`;
      assert.equal(cells.has(sideA), false, `${placement.challenge.id} touches another word`);
      assert.equal(cells.has(sideB), false, `${placement.challenge.id} touches another word`);
    }
    if (placementIndex > 0) {
      assert.equal(earlierIntersections, 1, placement.challenge.id);
    }
  }
}

test("crossword generator is deterministic and rejects collisions across body seeds", () => {
  const entries = getBodyEntries();
  for (let seed = 1; seed <= 200; seed += 1) {
    const challenges = selectChallenges(entries, 8, seed).map((entry) => ({
      kind: "crossword_entry",
      id: `crossword_entry:${entry.id}`,
      sourceEntryId: entry.id,
      answer: entry.term,
      clue: entry.translation,
    }));
    const first = generateCrossword(challenges);
    const second = generateCrossword(challenges);
    assert.deepEqual(first, second);
    assert.ok(first.placements.length >= 2 && first.placements.length <= 8, `seed ${seed}`);
    validateCrosswordGrid(first);
  }
});
