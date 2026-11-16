import assert from "node:assert/strict";
import test from "node:test";

import { getBodyEntries } from "../src/games/adapters/bodyVocabularyAdapter.ts";
import {
  assertBoardInvariants,
  collectRoundWords,
  columnsForRow,
  countOccupiedRows,
  createInitialBoard,
  createSeededRandom,
  createWave,
  DANGER_ROW,
  DEFEAT_ROW,
  detectDanger,
  detectDefeat,
  findDisconnectedBubbleIds,
  findSameColorGroup,
  getActiveColors,
  getHexCellCenter,
  getHexNeighbors,
  getWordBubbles,
  GRID_COLS,
  insertCeilingRow,
  INITIAL_FILL_ROWS,
  MIN_WORD_COUNT,
  MISSES_BEFORE_NEW_ROW,
  needsDensityTopUp,
  pickQueueColor,
  PLAYABLE_COLORS,
  reassignWordToConnectedBubble,
  replenishWordBubbles,
  resolveBubbleShot,
  segmentCircleFirstHit,
  selectNextObjective,
  TARGET_PLAYABLE_ROWS,
  TARGET_WORD_COUNT,
} from "../src/games/arcade/bubbleShooter/bubbleShooterModel.ts";
import {
  createBubbleShooterAnswerGate,
  resolvePedagogy,
} from "../src/games/arcade/bubbleShooter/bubbleShooterPedagogy.ts";
import { createBubbleShooterRound } from "../src/games/arcade/bubbleShooter/bubbleShooterRound.ts";
import {
  CLUSTER_DROP,
  FEEDBACK_MS,
  getClusterFallDurationMs,
  getLauncherFillColor,
  getPressureTimeLabel,
  getNewRowLabel,
  getPreviewFillColor,
  MAX_BOUNCES_PER_FRAME,
  PRESSURE_INTERVAL_MS,
  PROJECTILE_SPEED_MAX,
  PROJECTILE_SPEED_MIN,
  segmentWallCrossing,
  SLOT_Y,
  T_EPSILON,
  TIME_EPSILON,
  WALL_EPSILON,
} from "../src/games/arcade/bubbleShooter/bubbleShooterPresentation.ts";
import {
  createRoundState,
  finalizeRound,
  recordOutcome,
} from "../src/games/core/sessionEngine.ts";

const round = createBubbleShooterRound(2026);

/* ── round content ── */

test("round prepares ten deterministic body challenges", () => {
  const first = createBubbleShooterRound(2026);
  const second = createBubbleShooterRound(2026);
  const bodyIds = new Set(getBodyEntries().map((entry) => entry.id));

  assert.deepEqual(first, second);
  assert.equal(first.gameId, "bubble_shooter");
  assert.equal(first.challenges.length, 10);
  assert.equal(new Set(first.challenges.map((item) => item.correctChoiceId)).size, 10);
  for (const item of first.challenges) {
    assert(item.choices.some((choice) => choice.id === item.correctChoiceId));
    assert(item.choices.every((choice) => bodyIds.has(choice.id)));
  }
});

test("round covers all 24 body entries across seeds, with distinct words", () => {
  const allEntryIds = new Set(getBodyEntries().map((entry) => entry.id));
  assert.equal(allEntryIds.size, 24);
  const covered = new Set();

  for (let seed = 1; seed <= 10; seed++) {
    const seeded = createBubbleShooterRound(seed);
    const words = collectRoundWords(seeded);
    assert.equal(words.length, 10);
    assert.equal(new Set(words.map((word) => word.contentId)).size, 10);
    for (const word of words) {
      assert(allEntryIds.has(word.contentId));
      covered.add(word.contentId);
    }
  }

  assert.equal(covered.size, 24);
});

test("every body entry has a Portuguese translation distinct from its English term", () => {
  for (const entry of getBodyEntries()) {
    assert(entry.term.length > 0, `${entry.id} needs an English term`);
    assert(entry.translation.length > 0, `${entry.id} needs a translation`);
    assert.notEqual(entry.term.toLowerCase(), entry.translation.toLowerCase());
  }
});

/* ── no neutral bubbles ── */

test("the palette contains only playable colors and no neutral", () => {
  assert.deepEqual(PLAYABLE_COLORS, ["cyan", "violet", "wine"]);
  assert(!PLAYABLE_COLORS.includes("neutral"));

  const { board } = createInitialBoard(round, 7);
  for (const bubble of board) {
    assert(
      PLAYABLE_COLORS.includes(bubble.color),
      `Unexpected color ${bubble.color} on ${bubble.id}`,
    );
  }
});

test("every bubble color can form a match — none is indestructible", () => {
  for (const color of PLAYABLE_COLORS) {
    const board = [
      { id: "a", row: 0, column: 0, color, role: "normal" },
      { id: "b", row: 0, column: 1, color, role: "normal" },
    ];
    const resolution = resolveBubbleShot(
      board,
      "b",
      getHexCellCenter(0, 2),
      color,
      "shot",
    );
    assert(resolution, `${color} must resolve`);
    assert(resolution.matched, `${color} must be able to match`);
    assert.equal(resolution.removedGroupIds.length, 3);
  }
});

/* ── colour queue ── */

test("queue offers only colors currently present on the board", () => {
  const board = [
    { id: "a", row: 0, column: 0, color: "cyan", role: "normal" },
    { id: "b", row: 0, column: 1, color: "cyan", role: "normal" },
  ];
  assert.deepEqual(getActiveColors(board), ["cyan"]);

  const random = createSeededRandom(11);
  for (let i = 0; i < 200; i++) {
    assert.equal(pickQueueColor(board, random), "cyan");
  }
});

test("an eliminated color is never dealt again", () => {
  const board = [
    { id: "a", row: 0, column: 0, color: "cyan", role: "normal" },
    { id: "b", row: 0, column: 1, color: "wine", role: "normal" },
  ];
  const random = createSeededRandom(5);
  const seen = new Set();
  for (let i = 0; i < 500; i++) seen.add(pickQueueColor(board, random));
  assert(!seen.has("violet"), "violet is absent from the board and must not be dealt");
  assert(seen.has("cyan") && seen.has("wine"));
});

test("queue returns null only when the board is empty", () => {
  assert.equal(pickQueueColor([], createSeededRandom(1)), null);
});

/* ── match, no-match and drops ── */

test("a group of two does not explode and the shot stays on the grid", () => {
  const board = [
    { id: "a", row: 0, column: 0, color: "cyan", role: "normal" },
    { id: "b", row: 1, column: 4, color: "wine", role: "normal" },
  ];
  const resolution = resolveBubbleShot(
    board,
    "a",
    getHexCellCenter(0, 1),
    "cyan",
    "shot",
  );
  assert(resolution);
  assert.equal(resolution.matched, false);
  assert.equal(resolution.removedGroupIds.length, 0);
  assert(
    resolution.remainingBoard.some((bubble) => bubble.id === "shot"),
    "A shot without a match must remain on the board",
  );
});

test("a group of three or more explodes", () => {
  const board = [
    { id: "a", row: 0, column: 0, color: "cyan", role: "normal" },
    { id: "b", row: 0, column: 1, color: "cyan", role: "normal" },
  ];
  const resolution = resolveBubbleShot(board, "b", getHexCellCenter(0, 2), "cyan", "shot");
  assert(resolution);
  assert(resolution.matched);
  assert.equal(resolution.removedGroupIds.length, 3);
  assert.equal(resolution.remainingBoard.length, 0);
});

test("a still-connected bubble stays while a disconnected island falls", () => {
  const board = [
    { id: "roof", row: 0, column: 0, color: "wine", role: "normal" },
    { id: "bridge1", row: 0, column: 1, color: "cyan", role: "normal" },
    { id: "bridge2", row: 0, column: 2, color: "cyan", role: "normal" },
    { id: "island", row: 1, column: 2, color: "wine", role: "normal" },
  ];
  const resolution = resolveBubbleShot(board, "bridge2", getHexCellCenter(0, 3), "cyan", "shot");
  assert(resolution);
  assert(resolution.matched, "three cyan must explode");
  assert(resolution.disconnectedIds.includes("island"), "island loses its support");
  assert(resolution.remainingBoard.some((bubble) => bubble.id === "roof"));
  assert.deepEqual(findDisconnectedBubbleIds(resolution.remainingBoard), []);
});

test("no disconnected bubble ever remains on the resolved board", () => {
  const { board } = createInitialBoard(round, 31);
  const target = board.find((bubble) => bubble.row === 2);
  const resolution = resolveBubbleShot(
    board,
    target.id,
    getHexCellCenter(target.row, target.column),
    board[0].color,
    "shot",
  );
  if (resolution) {
    assert.deepEqual(findDisconnectedBubbleIds(resolution.remainingBoard), []);
  }
});

/* ── word bonus bubbles ── */

test("the initial board carries five or six word bubbles on real, connected cells", () => {
  for (let seed = 1; seed <= 40; seed++) {
    const { board, placedContentIds } = createInitialBoard(round, seed);
    const words = getWordBubbles(board);

    assert(
      words.length >= MIN_WORD_COUNT && words.length <= TARGET_WORD_COUNT,
      `seed ${seed}: expected ${MIN_WORD_COUNT}-${TARGET_WORD_COUNT} words, got ${words.length}`,
    );
    assert.equal(words.length, placedContentIds.length);
    assert.equal(new Set(words.map((w) => w.contentId)).size, words.length);

    for (const word of words) {
      assert(word.column < columnsForRow(word.row), `seed ${seed}: invalid cell`);
      assert(word.label && word.label.length > 0);
      assert(PLAYABLE_COLORS.includes(word.color), "words use ordinary playable colors");
    }

    assert.deepEqual(
      findDisconnectedBubbleIds(board),
      [],
      `seed ${seed}: no bubble may float`,
    );
  }
});

test("words are spread across multiple rows, never an artificial answer row", () => {
  for (let seed = 1; seed <= 40; seed++) {
    const { board } = createInitialBoard(round, seed);
    const rows = new Set(getWordBubbles(board).map((word) => word.row));
    assert(rows.size >= 2, `seed ${seed}: words must span at least two rows`);
  }
});

test("word colors do not correlate with being the objective", () => {
  const colorCounts = new Map();
  for (let seed = 1; seed <= 200; seed++) {
    const { board } = createInitialBoard(round, seed);
    const objective = selectNextObjective(round, board, new Set());
    if (!objective) continue;
    const bubble = getWordBubbles(board).find(
      (word) => word.contentId === objective.correctChoiceId,
    );
    if (!bubble) continue;
    colorCounts.set(bubble.color, (colorCounts.get(bubble.color) ?? 0) + 1);
  }
  assert(colorCounts.size >= 2, "the objective must not always be the same color");
});

test("a word bubble explodes inside a valid match", () => {
  const board = [
    { id: "a", row: 0, column: 0, color: "cyan", role: "normal" },
    {
      id: "word:body_head",
      row: 0,
      column: 1,
      color: "cyan",
      role: "wordBonus",
      contentId: "body_head",
      label: "Head",
    },
  ];
  const resolution = resolveBubbleShot(board, "word:body_head", getHexCellCenter(0, 2), "cyan", "shot");
  assert(resolution);
  assert(resolution.matched);
  assert.equal(resolution.collectedWords.length, 1);
  assert.equal(resolution.collectedWords[0].contentId, "body_head");
  assert.equal(resolution.collectedWords[0].via, "match");
});

test("a word bubble falls when it loses its path to the ceiling", () => {
  const board = [
    { id: "roof", row: 0, column: 0, color: "wine", role: "normal" },
    { id: "b1", row: 0, column: 1, color: "cyan", role: "normal" },
    { id: "b2", row: 0, column: 2, color: "cyan", role: "normal" },
    {
      id: "word:body_elbow",
      row: 1,
      column: 2,
      color: "wine",
      role: "wordBonus",
      contentId: "body_elbow",
      label: "Elbow",
    },
  ];
  const resolution = resolveBubbleShot(board, "b2", getHexCellCenter(0, 3), "cyan", "shot");
  assert(resolution);
  assert.equal(resolution.collectedWords.length, 1);
  assert.equal(resolution.collectedWords[0].contentId, "body_elbow");
  assert.equal(resolution.collectedWords[0].via, "drop");
  assert.deepEqual(findDisconnectedBubbleIds(resolution.remainingBoard), []);
});

test("direct contact alone never collects a word", () => {
  const board = [
    { id: "a", row: 0, column: 0, color: "cyan", role: "normal" },
    {
      id: "word:body_nose",
      row: 0,
      column: 1,
      color: "wine",
      role: "wordBonus",
      contentId: "body_nose",
      label: "Nose",
    },
  ];
  // A cyan shot touches the wine word bubble but forms no group.
  const resolution = resolveBubbleShot(board, "word:body_nose", getHexCellCenter(0, 2), "cyan", "shot");
  assert(resolution);
  assert.equal(resolution.matched, false);
  assert.equal(resolution.collectedWords.length, 0, "touching must not collect");
  assert(resolution.remainingBoard.some((b) => b.id === "word:body_nose"));
});

/* ── pedagogy ── */

const objective = round.challenges[0];

test("collecting the objective word emits exactly one correct outcome", () => {
  const result = resolvePedagogy(objective, [
    { contentId: objective.correctChoiceId, label: "X", via: "match" },
  ]);
  assert(result.shouldEmitOutcome);
  assert.equal(result.collectedObjective.contentId, objective.correctChoiceId);
  assert.equal(result.bonusWords.length, 0);
});

test("a strategic shot that collects nothing emits no outcome", () => {
  const result = resolvePedagogy(objective, []);
  assert.equal(result.shouldEmitOutcome, false);
  assert.equal(result.collectedObjective, null);
  assert.equal(result.bonusWords.length, 0);
});

test("collecting a different word is a neutral bonus, never a language error", () => {
  const other = round.challenges[3].correctChoiceId;
  const result = resolvePedagogy(objective, [
    { contentId: other, label: "Other", via: "drop" },
  ]);
  assert.equal(result.shouldEmitOutcome, false, "must not be reported as an answer");
  assert.equal(result.collectedObjective, null);
  assert.deepEqual(result.bonusWords.map((w) => w.contentId), [other]);
  assert.deepEqual(result.returnedToPool, [other], "it must return to the pool");
});

test("several words in one chain still emit at most one outcome", () => {
  const a = round.challenges[2].correctChoiceId;
  const b = round.challenges[5].correctChoiceId;
  const result = resolvePedagogy(objective, [
    { contentId: a, label: "A", via: "drop" },
    { contentId: objective.correctChoiceId, label: "Obj", via: "match" },
    { contentId: b, label: "B", via: "drop" },
  ]);
  assert(result.shouldEmitOutcome);
  assert.equal(result.bonusWords.length, 2, "the other two are bonuses");
  assert.deepEqual(result.returnedToPool.sort(), [a, b].sort());
});

test("a chain may not auto-resolve a future objective twice", () => {
  const duplicated = resolvePedagogy(objective, [
    { contentId: objective.correctChoiceId, label: "Obj", via: "match" },
    { contentId: objective.correctChoiceId, label: "Obj", via: "drop" },
  ]);
  assert.equal(duplicated.collectedObjective !== null, true);
  assert.equal(duplicated.bonusWords.length, 1, "the repeat becomes a bonus, not a second outcome");
});

test("the answer gate stays idempotent under replay", () => {
  const accepted = [];
  const submit = createBubbleShooterAnswerGate(round, (outcome) => accepted.push(outcome));
  const answer = {
    challengeId: objective.id,
    choiceId: objective.correctChoiceId,
    answeredAt: new Date().toISOString(),
  };

  assert(submit(answer));
  assert.equal(submit(answer), null, "replay must be rejected");
  assert.equal(submit(answer), null);
  assert.equal(accepted.length, 1);
});

test("the gate accepts objectives out of round order but never unknown ids", () => {
  const accepted = [];
  const submit = createBubbleShooterAnswerGate(round, (outcome) => accepted.push(outcome));
  const later = round.challenges[4];

  assert(
    submit({
      challengeId: later.id,
      choiceId: later.correctChoiceId,
      answeredAt: new Date().toISOString(),
    }),
    "board order may differ from round order",
  );
  assert.equal(
    submit({ challengeId: "nope", choiceId: "nope", answeredAt: "" }),
    null,
  );
  assert.equal(accepted.length, 1);
});

/* ── objective selection ── */

test("the objective always prefers a word actually present on the board", () => {
  for (let seed = 1; seed <= 60; seed++) {
    const { board } = createInitialBoard(round, seed);
    const objectiveChallenge = selectNextObjective(round, board, new Set());
    assert(objectiveChallenge, `seed ${seed}: an objective must exist`);
    const onBoard = getWordBubbles(board).map((w) => w.contentId);
    assert(
      onBoard.includes(objectiveChallenge.correctChoiceId),
      `seed ${seed}: objective must be reachable on the board`,
    );
  }
});

test("resolved challenges are never selected again", () => {
  const { board } = createInitialBoard(round, 3);
  const first = selectNextObjective(round, board, new Set());
  const resolved = new Set([first.id]);
  const second = selectNextObjective(round, board, resolved);
  assert.notEqual(second?.id, first.id);
});

/* ── replenishment ── */

test("replenishment converts connected bubbles in place, never a free cell", () => {
  const { board, placedContentIds } = createInitialBoard(round, 5);
  const pool = collectRoundWords(round).filter(
    (word) => !placedContentIds.includes(word.contentId),
  );
  const stripped = board.map((bubble, index) =>
    bubble.role === "wordBonus"
      ? {
          ...bubble,
          id: `bubble:plain:${index}`,
          role: "normal",
          contentId: undefined,
          label: undefined,
        }
      : bubble,
  );

  const result = replenishWordBubbles(stripped, pool, createSeededRandom(3));
  assert.equal(
    result.placedContentIds.length,
    Math.min(TARGET_WORD_COUNT, pool.length),
    "it places as many pooled words as the target allows",
  );
  assert.equal(
    result.board.length,
    stripped.length,
    "no cell is created or removed — bubbles are converted in place",
  );
  for (const word of getWordBubbles(result.board)) {
    assert(word.row >= 1);
    assert(word.column < columnsForRow(word.row));
  }
  assert.deepEqual(findDisconnectedBubbleIds(result.board), []);
});

test("replenishment is a no-op when the board is already stocked", () => {
  const { board } = createInitialBoard(round, 8);
  const result = replenishWordBubbles(board, collectRoundWords(round), createSeededRandom(1));
  assert.equal(result.placedContentIds.length, 0);
});

test("replenishment never duplicates a word already on the board", () => {
  const { board, placedContentIds } = createInitialBoard(round, 14);
  const result = replenishWordBubbles(
    board,
    collectRoundWords(round),
    createSeededRandom(6),
    TARGET_WORD_COUNT + 3,
  );
  const ids = getWordBubbles(result.board).map((word) => word.contentId);
  assert.equal(new Set(ids).size, ids.length, "no duplicate word bubbles");
  for (const id of placedContentIds) assert(ids.includes(id));
});

test("the objective is always present on the board across a full round", () => {
  for (let seed = 1; seed <= 120; seed++) {
    const seededRound = createBubbleShooterRound(2000 + seed);
    const random = createSeededRandom(seed);
    let { board, placedContentIds } = createInitialBoard(seededRound, seed);
    let pool = collectRoundWords(seededRound).filter(
      (word) => !placedContentIds.includes(word.contentId),
    );
    const resolved = new Set();

    for (let step = 0; step < 10; step++) {
      const replenished = replenishWordBubbles(board, pool, random);
      if (replenished.placedContentIds.length > 0) {
        board = replenished.board;
        pool = pool.filter((word) => !replenished.placedContentIds.includes(word.contentId));
      }
      const objectiveChallenge = selectNextObjective(seededRound, board, resolved);
      if (!objectiveChallenge) break;
      assert(
        getWordBubbles(board).some(
          (word) => word.contentId === objectiveChallenge.correctChoiceId,
        ),
        `seed ${seed} step ${step}: objective must be reachable on the board`,
      );
      resolved.add(objectiveChallenge.id);
      board = board.filter(
        (bubble) => bubble.contentId !== objectiveChallenge.correctChoiceId,
      );
    }
  }
});

/* ── pressure and new rows ── */

test("a ceiling row enters connected and pushes the grid down", () => {
  const { board } = createInitialBoard(round, 9);
  const beforeRows = new Map(board.map((b) => [b.id, b.row]));
  const beforeWords = getWordBubbles(board).map((w) => w.contentId).sort();

  const { board: next } = insertCeilingRow(board, createSeededRandom(4));

  assert(next.some((b) => b.row === 0), "a new row must occupy the ceiling");
  assert.deepEqual(findDisconnectedBubbleIds(next), [], "the new row keeps everything connected");

  for (const bubble of next) {
    if (!beforeRows.has(bubble.id)) continue;
    assert.equal(
      bubble.row,
      beforeRows.get(bubble.id) + 1,
      `${bubble.id} must descend exactly one row`,
    );
  }

  const afterWords = getWordBubbles(next).map((w) => w.contentId).sort();
  assert.deepEqual(afterWords, beforeWords, "words descend with their own cells");
  assertBoardInvariants(next);
});

test("a new row uses only active colors and valid cells", () => {
  const board = [
    { id: "a", row: 0, column: 0, color: "cyan", role: "normal" },
    { id: "b", row: 0, column: 1, color: "cyan", role: "normal" },
  ];
  const { board: next } = insertCeilingRow(board, createSeededRandom(2));
  const newRow = next.filter((bubble) => bubble.row === 0);
  assert.equal(newRow.length, columnsForRow(0));
  for (const bubble of newRow) {
    assert.equal(bubble.color, "cyan", "only colors present on the board may be used");
    assert(bubble.column < columnsForRow(0));
  }
});

test("a pending word can only re-enter through a structurally valid new row", () => {
  const { board } = createInitialBoard(round, 12);
  const pending = [{ challengeId: "c", contentId: "body_head", label: "Head" }];
  const { board: next, placedContentIds } = insertCeilingRow(
    board,
    createSeededRandom(8),
    pending,
  );

  assert.deepEqual(placedContentIds, ["body_head"]);
  const replaced = next.find((b) => b.contentId === "body_head");
  assert(replaced, "the word must be on the board");
  assert.equal(replaced.row, 0, "it enters inside the new connected row");
  assert.equal(replaced.role, "wordBonus");
  assert.deepEqual(findDisconnectedBubbleIds(next), []);
});

test("pressure threshold and defeat rows are coherent", () => {
  assert.equal(MISSES_BEFORE_NEW_ROW, 5);
  assert(DANGER_ROW < DEFEAT_ROW);
  assert(INITIAL_FILL_ROWS < DANGER_ROW);
});

test("defeat triggers when a bubble reaches the loss row", () => {
  const safe = [{ id: "a", row: 0, column: 0, color: "cyan", role: "normal" }];
  assert.equal(detectDefeat(safe), false);
  assert.equal(detectDanger(safe), false);

  const danger = [...safe, { id: "d", row: DANGER_ROW, column: 1, color: "wine", role: "normal" }];
  assert.equal(detectDanger(danger), true);
  assert.equal(detectDefeat(danger), false);

  const lost = [...safe, { id: "x", row: DEFEAT_ROW, column: 1, color: "wine", role: "normal" }];
  assert.equal(detectDefeat(lost), true);
});

test("repeated pressure eventually reaches the defeat row", () => {
  let { board } = createInitialBoard(round, 21);
  const random = createSeededRandom(77);
  let rows = 0;
  while (!detectDefeat(board) && rows < 40) {
    board = insertCeilingRow(board, random).board;
    rows++;
    assert.deepEqual(findDisconnectedBubbleIds(board), []);
  }
  assert(detectDefeat(board), "the grid must be able to reach defeat");
});

/* ── geometry (preserved behaviour) ── */

test("hex grid exposes six unique neighbours and alternating columns", () => {
  const neighbors = getHexNeighbors(2, 2);
  assert.equal(neighbors.length, 6);
  assert.equal(new Set(neighbors.map(({ row, column }) => `${row}:${column}`)).size, 6);
  assert.equal(GRID_COLS, 9);
  assert.equal(columnsForRow(0), 9);
  assert.equal(columnsForRow(1), 8);
});

test("same-colour flood fill only walks matching neighbours", () => {
  const board = [
    { id: "a", row: 0, column: 0, color: "cyan", role: "normal" },
    { id: "b", row: 0, column: 1, color: "cyan", role: "normal" },
    { id: "c", row: 0, column: 2, color: "wine", role: "normal" },
  ];
  assert.deepEqual(findSameColorGroup(board, "a").sort(), ["a", "b"]);
});

test("continuous collision prevents tunneling at high speed", () => {
  const t = segmentCircleFirstHit(100, 500, 100, -100, 100, 200, 18);
  assert(t !== null);
  const hitY = 500 + (-100 - 500) * t;
  assert(hitY >= 199 && hitY <= 219);
});

test("segmentCircleFirstHit returns the earliest hit and misses when short", () => {
  const t1 = segmentCircleFirstHit(0, 200, 0, 0, 0, 150, 15);
  const t2 = segmentCircleFirstHit(0, 200, 0, 0, 0, 50, 15);
  assert(t1 !== null && t2 !== null && t1 < t2);
  assert.equal(segmentCircleFirstHit(0, 200, 0, 180, 0, 100, 20), null);
});

/* ── launcher colour, preview and pressure label ── */

test("the launcher shows the real playable colour, never the old neutral white", () => {
  const NEUTRAL_WHITE = 0xdce4f8;
  for (const color of PLAYABLE_COLORS) {
    const fill = getLauncherFillColor(color);
    assert.equal(typeof fill, "number");
    assert.notEqual(fill, NEUTRAL_WHITE, `${color} must not render as neutral white`);
    assert.notEqual(fill, 0xffffff, `${color} must not render as plain white`);
  }
  // Each colour is visually distinct from the others.
  const fills = PLAYABLE_COLORS.map(getLauncherFillColor);
  assert.equal(new Set(fills).size, PLAYABLE_COLORS.length);
});

test("the preview uses the same palette as the launcher", () => {
  for (const color of PLAYABLE_COLORS) {
    assert.equal(getPreviewFillColor(color), getLauncherFillColor(color));
  }
});

test("the NEW ROW label counts down and never blames the player", () => {
  assert.equal(getNewRowLabel(0), "5 SHOTS UNTIL NEW ROW");
  assert.equal(getNewRowLabel(1), "4 SHOTS UNTIL NEW ROW");
  assert.equal(getNewRowLabel(2), "3 SHOTS UNTIL NEW ROW");
  assert.equal(getNewRowLabel(3), "2 SHOTS UNTIL NEW ROW");
  assert.equal(getNewRowLabel(4), "NEW ROW NEXT SHOT");

  for (let misses = 0; misses <= MISSES_BEFORE_NEW_ROW; misses++) {
    const label = getNewRowLabel(misses);
    for (const banned of ["MISS", "ERROR", "WRONG"]) {
      assert(!label.includes(banned), `"${label}" must not contain ${banned}`);
    }
  }
});

test("the label clamps instead of going negative", () => {
  assert.equal(getNewRowLabel(MISSES_BEFORE_NEW_ROW), "NEW ROW NEXT SHOT");
  assert.equal(getNewRowLabel(99), "NEW ROW NEXT SHOT");
});

/* ── timing and speed ── */

test("projectile speed was raised once by 10% over the 440–660 baseline", () => {
  assert.equal(PROJECTILE_SPEED_MIN, Math.round(440 * 1.1));
  assert.equal(PROJECTILE_SPEED_MAX, Math.round(660 * 1.1));
  // A second increase would overshoot these bounds.
  assert(PROJECTILE_SPEED_MIN < Math.round(440 * 1.1 * 1.1));
  assert(PROJECTILE_SPEED_MAX < Math.round(660 * 1.1 * 1.1));
});

test("feedback durations were raised once by 15% and game over holds 2.5s", () => {
  const BASE = { correct: 1100, wrong: 1100, combo: 1300, bigDrop: 1500, chain: 1500, score: 1100, danger: 1300 };
  for (const [key, base] of Object.entries(BASE)) {
    assert.equal(
      FEEDBACK_MS[key],
      Math.round(base * 1.15),
      `${key} must be exactly one 15% increase over ${base}`,
    );
  }
  assert.equal(FEEDBACK_MS.gameOver, 2500);
});

test("faster shots still collide without tunneling", () => {
  // One frame at the new top speed advances ~24px, well under the 18px contact
  // radius, so a bubble can never sit entirely between two sampled positions.
  const travelPerFrame = PROJECTILE_SPEED_MAX * 0.033;
  assert(
    travelPerFrame < 18 * 2,
    `a frame step of ${travelPerFrame.toFixed(1)}px must stay under the contact diameter`,
  );

  // A bubble ahead of a long fast sweep is still caught at its leading edge.
  const t = segmentCircleFirstHit(100, 500, 100, 500 - travelPerFrame * 8, 100, 420, 18);
  assert(t !== null, "a fast projectile must register the first impact");
  const hitY = 500 + (500 - travelPerFrame * 8 - 500) * t;
  assert(hitY >= 420 - 1 && hitY <= 420 + 19, `contact must be at the edge, got ${hitY}`);
});

/* ── message slots ── */

test("critical messages occupy distinct, correctly ordered slots", () => {
  const values = Object.values(SLOT_Y);
  assert.equal(new Set(values).size, values.length, "no two slots may share a Y");
  assert(SLOT_Y.gameOver < SLOT_Y.danger, "GAME OVER sits above DANGER");
  assert(SLOT_Y.danger < SLOT_Y.newRow, "DANGER sits above NEW ROW");
  assert(SLOT_Y.newRow < SLOT_Y.primary, "NEW ROW sits above the scoring chatter");
  assert(SLOT_Y.primary < SLOT_Y.combo);
  assert(SLOT_Y.combo < SLOT_Y.score);
});

/* ── defeat finalises a partial round ── */

test("a defeat finalises using only the outcomes that happened", () => {
  for (const answered of [1, 3, 9]) {
    let state = createRoundState("bubble_shooter");
    for (let index = 0; index < answered; index++) {
      state = recordOutcome(state, round.challenges[index].id, true, new Date().toISOString());
    }

    const finalResult = finalizeRound(state, new Date().toISOString(), 500);
    assert.equal(finalResult.totalChallenges, answered, "unreached words are not counted");
    assert.equal(finalResult.correctCount, answered);
    assert(
      finalResult.outcomes.length < round.challenges.length,
      "a partial round must finalise without ten outcomes",
    );
    assert(finalResult.xpEarned <= 60, "XP stays within the per-round cap");
  }
});

test("unreached challenges never receive fabricated wrong outcomes", () => {
  let state = createRoundState("bubble_shooter");
  state = recordOutcome(state, round.challenges[0].id, true, new Date().toISOString());

  const finalResult = finalizeRound(state, new Date().toISOString(), 100);
  const answeredIds = new Set(finalResult.outcomes.map((outcome) => outcome.challengeId));
  for (const challenge of round.challenges.slice(1)) {
    assert(
      !answeredIds.has(challenge.id),
      `${challenge.id} was never reached and must stay unanswered`,
    );
  }
  assert.equal(finalResult.outcomes.filter((outcome) => !outcome.correct).length, 0);
});

test("recordOutcome stays idempotent so a repeated run end cannot duplicate XP", () => {
  let state = createRoundState("bubble_shooter");
  const id = round.challenges[0].id;
  state = recordOutcome(state, id, true, new Date().toISOString());
  const afterRepeat = recordOutcome(state, id, true, new Date().toISOString());

  assert.equal(afterRepeat.outcomes.length, 1, "a repeat must not add an outcome");
  assert.equal(
    finalizeRound(afterRepeat, new Date().toISOString(), 0).xpEarned,
    finalizeRound(state, new Date().toISOString(), 0).xpEarned,
    "XP must not change on a duplicated end",
  );
});

test("a fresh round state carries nothing over from the previous run", () => {
  let played = createRoundState("bubble_shooter");
  played = recordOutcome(played, round.challenges[0].id, true, new Date().toISOString());
  const fresh = createRoundState("bubble_shooter");

  assert.equal(fresh.outcomes.length, 0);
  assert.equal(fresh.currentIndex, 0);
  assert.notEqual(played.outcomes.length, fresh.outcomes.length);
});

/* ── word bubbles collide exactly like ordinary bubbles ── */

test("a word bubble is physically identical to an ordinary bubble", () => {
  const { board } = createInitialBoard(round, 17);
  const words = getWordBubbles(board);
  assert(words.length > 0);

  for (const word of words) {
    // Same cell geometry, so the same drawn centre and the same hitbox.
    const wordCentre = getHexCellCenter(word.row, word.column);
    const asPlain = getHexCellCenter(word.row, word.column);
    assert.deepEqual(wordCentre, asPlain, "a word occupies a normal hex cell");
    assert(PLAYABLE_COLORS.includes(word.color), "and carries a playable colour");
  }
});

test("every board bubble, word or not, yields a collidable centre", () => {
  const { board } = createInitialBoard(round, 23);
  const centres = board.map((bubble) => getHexCellCenter(bubble.row, bubble.column));
  assert.equal(centres.length, board.length, "no bubble may be excluded from collision");

  const keys = new Set(centres.map((c) => `${c.x.toFixed(4)}:${c.y.toFixed(4)}`));
  assert.equal(keys.size, board.length, "no two bubbles may share a centre");
});

test("a shot stops at a word bubble instead of passing through it", () => {
  const board = [
    { id: "roof", row: 0, column: 0, color: "cyan", role: "normal" },
    {
      id: "word:body_elbow",
      row: 1,
      column: 0,
      color: "wine",
      role: "wordBonus",
      contentId: "body_elbow",
      label: "Elbow",
    },
  ];

  // A cyan shot travelling into the word bubble must register an impact even
  // though it cannot match its colour.
  const wordCentre = getHexCellCenter(1, 0);
  const t = segmentCircleFirstHit(
    wordCentre.x,
    wordCentre.y + 6,
    wordCentre.x,
    wordCentre.y - 6,
    wordCentre.x,
    wordCentre.y,
    1.6,
  );
  assert(t !== null, "the word bubble must be hit, not traversed");

  const resolution = resolveBubbleShot(board, "word:body_elbow", wordCentre, "cyan", "shot");
  assert(resolution, "the shot must resolve against the word bubble");
  assert.equal(resolution.matched, false, "no match, but it still stops");
  assert(resolution.remainingBoard.some((b) => b.id === "shot"));
  assert(resolution.remainingBoard.some((b) => b.id === "word:body_elbow"));
});

/* ── dropped future words survive the round ── */

test("a future word knocked down returns to the pool and is re-hosted", () => {
  const board = [
    { id: "roof", row: 0, column: 0, color: "cyan", role: "normal" },
    { id: "a", row: 0, column: 1, color: "wine", role: "normal" },
    { id: "b", row: 0, column: 2, color: "wine", role: "normal" },
    { id: "c", row: 0, column: 3, color: "cyan", role: "normal" },
  ];
  const word = { challengeId: "c1", contentId: "body_nose", label: "Nose" };

  const result = reassignWordToConnectedBubble(board, word, createSeededRandom(4));
  assert(result.placed, "a pooled word must find a connected host");

  const hosted = result.board.find((b) => b.contentId === "body_nose");
  assert(hosted, "the word is on the board again");
  assert.equal(hosted.role, "wordBonus");
  assert.equal(hosted.id, "word:body_nose");
  assert(PLAYABLE_COLORS.includes(hosted.color), "it keeps a playable colour");
  assert.deepEqual(findDisconnectedBubbleIds(result.board), [], "and stays connected");
  assert.equal(result.board.length, board.length, "no bubble is created or destroyed");
});

test("reassignment never targets an empty cell or an occupied word bubble", () => {
  const board = [
    { id: "roof", row: 0, column: 0, color: "cyan", role: "normal" },
    {
      id: "word:body_ear",
      row: 0,
      column: 1,
      color: "wine",
      role: "wordBonus",
      contentId: "body_ear",
      label: "Ear",
    },
  ];
  const word = { challengeId: "c", contentId: "body_toe", label: "Toe" };
  const result = reassignWordToConnectedBubble(board, word, createSeededRandom(2));

  // Only "roof" is an ordinary bubble, and it sits on row 0 which is reserved.
  if (result.placed) {
    const hosts = result.board.filter((b) => b.role === "wordBonus");
    assert.equal(new Set(hosts.map((h) => h.contentId)).size, hosts.length, "no double-booking");
    assert(result.board.every((b) => b.id !== "word:body_ear" || b.contentId === "body_ear"));
  }
  const ear = result.board.find((b) => b.contentId === "body_ear");
  assert(ear, "the existing word must not be overwritten");
});

test("a word already on the board is never duplicated", () => {
  const { board } = createInitialBoard(round, 11);
  const existing = getWordBubbles(board)[0];
  const duplicate = {
    challengeId: "c",
    contentId: existing.contentId,
    label: existing.label,
  };

  const result = reassignWordToConnectedBubble(board, duplicate, createSeededRandom(9));
  assert.equal(result.placed, false, "an on-board word must not be placed twice");
  const copies = board.filter((b) => b.contentId === existing.contentId);
  assert.equal(copies.length, 1);
});

test("several future words dropped in one reaction are all recoverable", () => {
  const dropped = [
    { contentId: round.challenges[2].correctChoiceId, label: "A", via: "drop" },
    { contentId: round.challenges[5].correctChoiceId, label: "B", via: "drop" },
    { contentId: round.challenges[7].correctChoiceId, label: "C", via: "drop" },
  ];
  const objectiveChallenge = round.challenges[0];
  const pedagogy = resolvePedagogy(objectiveChallenge, dropped);

  assert.equal(pedagogy.shouldEmitOutcome, false, "none of them is the objective");
  assert.equal(pedagogy.returnedToPool.length, 3, "every one returns to the pool");
  assert.deepEqual(
    [...pedagogy.returnedToPool].sort(),
    dropped.map((d) => d.contentId).sort(),
    "no word is lost from the round",
  );
});

test("the objective dropped in a multi-word reaction still yields one outcome", () => {
  const objectiveChallenge = round.challenges[0];
  const pedagogy = resolvePedagogy(objectiveChallenge, [
    { contentId: round.challenges[3].correctChoiceId, label: "X", via: "drop" },
    { contentId: objectiveChallenge.correctChoiceId, label: "Obj", via: "drop" },
    { contentId: round.challenges[6].correctChoiceId, label: "Y", via: "drop" },
  ]);

  assert(pedagogy.shouldEmitOutcome, "the objective counts even when it falls");
  assert.equal(pedagogy.bonusWords.length, 2);
  assert.equal(pedagogy.returnedToPool.length, 2, "the other two stay pending");
});

/* ── cleared board becomes a wave or ends the round ── */

test("a wave rebuilds a playable, fully connected board", () => {
  const words = collectRoundWords(round).slice(0, 3);
  const wave = createWave(words, createSeededRandom(6));

  assert(wave.board.length >= columnsForRow(0) * 2, "a wave must be genuinely playable");
  assert.deepEqual(findDisconnectedBubbleIds(wave.board), [], "it is connected by construction");
  assertBoardInvariants(wave.board);
  assert(wave.board.some((b) => b.row === 0), "it hangs from the ceiling");
});

test("a wave carries the pending words, including the current objective", () => {
  const objectiveWord = collectRoundWords(round)[0];
  const wave = createWave([objectiveWord], createSeededRandom(3));

  assert(
    wave.placedContentIds.includes(objectiveWord.contentId),
    "the active objective must be present so the round can continue",
  );
  const hosted = getWordBubbles(wave.board).map((b) => b.contentId);
  assert(hosted.includes(objectiveWord.contentId));
});

test("a wave accounts for every word it was given — none may vanish", () => {
  for (let seed = 1; seed <= 120; seed++) {
    const words = collectRoundWords(round).slice(0, 6);
    const wave = createWave(words, createSeededRandom(seed));

    const onBoard = getWordBubbles(wave.board).map((bubble) => bubble.contentId);
    // Placement is reported from the finished board, so a word pushed off the
    // parity edge by a later row is returned as displaced, never lost.
    assert.deepEqual(
      [...wave.placedContentIds].sort(),
      [...onBoard].sort(),
      `seed ${seed}: placed must match what is really on the board`,
    );

    const accounted = new Set([...wave.placedContentIds, ...wave.displacedContentIds]);
    for (const word of words) {
      assert(
        accounted.has(word.contentId),
        `seed ${seed}: ${word.contentId} must be placed or reported as displaced`,
      );
    }
  }
});

test("a wave seeds words across rows and never duplicates one", () => {
  const words = collectRoundWords(round).slice(0, 4);
  const wave = createWave(words, createSeededRandom(15));
  const hosted = getWordBubbles(wave.board);

  assert.equal(
    new Set(hosted.map((b) => b.contentId)).size,
    hosted.length,
    "no word appears twice in a wave",
  );
  assert(new Set(hosted.map((b) => b.row)).size >= 2, "words spread over rows");
});

test("an empty board with pending words can always be revived", () => {
  for (let seed = 1; seed <= 40; seed++) {
    const pending = collectRoundWords(round).slice(0, 2);
    const wave = createWave(pending, createSeededRandom(seed));
    assert(wave.board.length > 0, `seed ${seed}: a wave must produce bubbles`);
    assert(
      getWordBubbles(wave.board).length > 0,
      `seed ${seed}: a wave must carry at least one word`,
    );
    assertBoardInvariants(wave.board);
  }
});

test("an empty board with no pending words ends the round instead of waving", () => {
  const resolved = new Set(round.challenges.map((challenge) => challenge.id));
  assert.equal(
    selectNextObjective(round, [], resolved),
    null,
    "with everything studied there is no objective left, so the round completes",
  );
});

/* ── cluster drop configuration ── */

test("the cluster drop is staged: break, block fall, then separation", () => {
  assert(CLUSTER_DROP.breakMs >= 80 && CLUSTER_DROP.breakMs <= 120, "short break-away");
  assert(CLUSTER_DROP.blockMs > 0, "the cluster falls as one body before splitting");
  assert(CLUSTER_DROP.reducedMs < CLUSTER_DROP.breakMs + CLUSTER_DROP.blockMs,
    "reduced motion uses a shorter sequence");
});

test("the drop carries arcade energy tied to the shot speed", () => {
  assert.equal(
    CLUSTER_DROP.separationSpeed,
    PROJECTILE_SPEED_MIN,
    "separation speed matches the projectile so the fall never feels like a feather",
  );
  assert(CLUSTER_DROP.gravity > 0, "gravity accelerates the fall");
  assert(CLUSTER_DROP.spin > 0 && CLUSTER_DROP.spreadX > 0, "bubbles get their own arcs");
});

test("fall duration scales with the distance left to the bottom", () => {
  const near = getClusterFallDurationMs(50);
  const far = getClusterFallDurationMs(600);
  assert(far > near, "a bubble higher up takes longer to clear the arena");
  assert(near >= 180, "even a short fall stays visible");
  assert(far < 3000, "but the drop never drags");
});

test("a zero distance still returns a positive, finite duration", () => {
  const duration = getClusterFallDurationMs(0);
  assert(Number.isFinite(duration) && duration > 0);
});

/* ── ricochet: the frame is swept along the real reflected path ── */

const FLIGHT = { radius: 18, width: 400 };
FLIGHT.left = FLIGHT.radius;
FLIGHT.right = FLIGHT.width - FLIGHT.radius;
FLIGHT.combined = FLIGHT.radius * 1.6;

/** Mirrors the scene's frame integration so the algorithm can be asserted. */
function flyProjectile(startX, startY, vx, vy, bubbles, deltaMs, maxFrames = 200) {
  let x = startX;
  let y = startY;
  let bounces = 0;
  let snaps = 0;

  for (let frame = 0; frame < maxFrames; frame++) {
    let remaining = Math.min(deltaMs, 33) / 1000;
    let guard = 0;

    while (remaining > TIME_EPSILON && guard++ <= MAX_BOUNCES_PER_FRAME) {
      const endX = x + vx * remaining;
      const endY = y + vy * remaining;
      const wallT = segmentWallCrossing(endX === x ? x : x, endX, FLIGHT.left, FLIGHT.right);

      let best = null;
      for (const bubble of bubbles) {
        const t = segmentCircleFirstHit(x, y, endX, endY, bubble.x, bubble.y, FLIGHT.combined);
        if (t !== null && (best === null || t < best.t)) best = { t, id: bubble.id };
      }

      if (best && (wallT === null || best.t <= wallT + T_EPSILON)) {
        snaps++;
        return { hit: best.id, bounces, snaps };
      }

      if (wallT !== null) {
        x += (endX - x) * wallT;
        y += (endY - y) * wallT;
        vx = x <= FLIGHT.width / 2 ? Math.abs(vx) : -Math.abs(vx);
        x += vx > 0 ? WALL_EPSILON : -WALL_EPSILON;
        bounces++;
        remaining *= 1 - wallT;
        continue;
      }

      x = endX;
      y = endY;
      remaining = 0;
    }

    if (x < FLIGHT.left - 0.5 || x > FLIGHT.right + 0.5) {
      return { hit: "ESCAPED", bounces, snaps };
    }
    if (y < -80) return { hit: null, bounces, snaps };
  }
  return { hit: "TIMEOUT", bounces, snaps };
}

test("a wall crossing is located only when the sweep actually leaves the arena", () => {
  assert.equal(segmentWallCrossing(200, 100, 18, 382), null, "stays inside");
  assert.equal(segmentWallCrossing(200, 200, 18, 382), null, "no horizontal motion");

  const leftT = segmentWallCrossing(100, 0, 18, 382);
  assert(leftT !== null && leftT > 0 && leftT < 1, "crossing the left wall is found");
  const rightT = segmentWallCrossing(300, 400, 18, 382);
  assert(rightT !== null && rightT > 0 && rightT < 1, "crossing the right wall is found");
});

test("a vertical shot stops at the first bubble in its path", () => {
  const bubbles = [
    { id: "near", x: 200, y: 250 },
    { id: "far", x: 200, y: 120 },
  ];
  const result = flyProjectile(200, 380, 0, -700, bubbles, 16);
  assert.equal(result.hit, "near", "the nearer bubble always wins");
  assert.equal(result.snaps, 1, "exactly one snap per shot");
});

test("a ricochet shot hits a word bubble tucked against the wall", () => {
  const bubbles = [{ id: "word", x: FLIGHT.left + 12, y: 180 }];
  let hits = 0;
  let escaped = 0;

  for (let angle = 200; angle <= 260; angle += 2) {
    const rad = (angle * Math.PI) / 180;
    const result = flyProjectile(
      FLIGHT.width / 2, 380,
      Math.cos(rad) * 700, Math.sin(rad) * 700,
      bubbles, 16,
    );
    if (result.hit === "word") hits++;
    if (result.hit === "ESCAPED") escaped++;
  }

  assert(hits > 0, "a bounced shot must be able to reach a wall-hugging word bubble");
  assert.equal(escaped, 0, "the projectile may never leave the arena");
});

test("the projectile never escapes the arena, whichever wall it meets", () => {
  const bubbles = [{ id: "b", x: 200, y: 60 }];
  for (const angle of [185, 195, 220, 250, 290, 320, 350]) {
    for (const speed of [500, 726, 900]) {
      const rad = (angle * Math.PI) / 180;
      const result = flyProjectile(
        FLIGHT.width / 2, 380,
        Math.cos(rad) * speed, Math.sin(rad) * speed,
        bubbles, 33,
      );
      // A near-horizontal shot may simply never reach a bubble; what must never
      // happen is the ball leaving the playfield through a wall.
      assert.notEqual(result.hit, "ESCAPED", `angle ${angle} at ${speed} escaped the arena`);
    }
  }
});

test("the outcome is identical at 16ms, 33ms and a clamped larger delta", () => {
  const bubbles = [
    { id: "word", x: FLIGHT.left + 14, y: 200 },
    { id: "plain", x: 300, y: 140 },
  ];

  for (let angle = 200; angle <= 260; angle += 4) {
    const rad = (angle * Math.PI) / 180;
    const vx = Math.cos(rad) * 700;
    const vy = Math.sin(rad) * 700;
    const a = flyProjectile(FLIGHT.width / 2, 380, vx, vy, bubbles, 16);
    const b = flyProjectile(FLIGHT.width / 2, 380, vx, vy, bubbles, 33);
    const c = flyProjectile(FLIGHT.width / 2, 380, vx, vy, bubbles, 120);

    assert.equal(a.hit, b.hit, `angle ${angle}: 16ms and 33ms must agree`);
    assert.equal(b.hit, c.hit, `angle ${angle}: a clamped delta must agree too`);
  }
});

test("a bubble contact beats a wall crossing on a tie, and only one snap occurs", () => {
  // A bubble sitting right at the wall must stop the shot rather than let it bounce.
  const bubbles = [{ id: "corner", x: FLIGHT.left + 2, y: 200 }];
  const result = flyProjectile(FLIGHT.width / 2, 380, -700, -300, bubbles, 33);
  assert(result.snaps <= 1, "a shot may never snap twice");
  assert.notEqual(result.hit, "ESCAPED");
});

test("bounces within a single frame stay bounded and never hang", () => {
  // A shallow, very fast shot bounces repeatedly: the guard must keep each
  // frame finite rather than spinning inside the wall-resolution loop.
  const result = flyProjectile(FLIGHT.width / 2, 380, -1400, -40, [], 33);
  assert(result.bounces <= MAX_BOUNCES_PER_FRAME * 200, "bounce handling terminates");
  assert.notEqual(result.hit, "ESCAPED", "it stays inside the arena while bouncing");
  assert.equal(result.snaps, 0, "with no bubbles present nothing may snap");
});

/* ── time-based pressure ── */

test("the pressure clock label counts whole seconds down", () => {
  assert.equal(getPressureTimeLabel(PRESSURE_INTERVAL_MS), "NEW ROW IN 30s");
  assert.equal(getPressureTimeLabel(18_000), "NEW ROW IN 18s");
  assert.equal(getPressureTimeLabel(1), "NEW ROW IN 1s");
  assert.equal(getPressureTimeLabel(0), "NEW ROW IN 0s");
  assert.equal(getPressureTimeLabel(-500), "NEW ROW IN 0s", "it never goes negative");
});

test("the interval is 30 seconds of active play", () => {
  assert.equal(PRESSURE_INTERVAL_MS, 30_000);
});

test("29.999s does not fire, 30.000s does", () => {
  let remaining = PRESSURE_INTERVAL_MS;
  remaining -= 29_999;
  assert(remaining > 0, "just under the interval must not trigger a row");

  remaining = PRESSURE_INTERVAL_MS - 30_000;
  assert(remaining <= 0, "reaching the interval triggers a row");
});

test("the shot label never blames the player and warns on the last shot", () => {
  assert.equal(getNewRowLabel(0), "5 SHOTS UNTIL NEW ROW");
  assert.equal(getNewRowLabel(3), "2 SHOTS UNTIL NEW ROW");
  assert.equal(getNewRowLabel(4), "NEW ROW NEXT SHOT");
  for (let misses = 0; misses <= MISSES_BEFORE_NEW_ROW; misses++) {
    const label = getNewRowLabel(misses);
    for (const banned of ["MISS", "ERROR", "WRONG"]) {
      assert(!label.includes(banned), `"${label}" must not contain ${banned}`);
    }
  }
});

test("both triggers firing together still add a single row", () => {
  // Mirrors finishShot: one combined check, one insertion, both cycles reset.
  const state = { misses: MISSES_BEFORE_NEW_ROW, timeLeft: 0, rows: 0 };
  const byMisses = state.misses >= MISSES_BEFORE_NEW_ROW;
  const byTime = state.timeLeft <= 0;
  if (byMisses || byTime) {
    state.misses = 0;
    state.timeLeft = PRESSURE_INTERVAL_MS;
    state.rows += 1;
  }

  assert.equal(state.rows, 1, "simultaneous triggers must not stack two rows");
  assert.equal(state.misses, 0, "the shot cycle restarts");
  assert.equal(state.timeLeft, PRESSURE_INTERVAL_MS, "the clock restarts");
});

test("a match resets the shot counter but not the clock", () => {
  const state = { misses: 3, timeLeft: 12_000 };
  // A matching shot only clears the miss counter.
  state.misses = 0;
  assert.equal(state.misses, 0);
  assert.equal(state.timeLeft, 12_000, "the 30s clock keeps running through a match");
});

/* ── density: words are restored structurally, never via the shooter ── */

test("a board that still owes words but lost its objective needs a top-up", () => {
  const { board } = createInitialBoard(round, 19);
  assert.equal(
    needsDensityTopUp(board, 4, true),
    false,
    "a healthy board with its objective present needs nothing",
  );
  assert.equal(
    needsDensityTopUp(board, 4, false),
    true,
    "a missing objective must be restored on the grid",
  );
});

test("a sparse board with pending words is topped up", () => {
  const sparse = [
    { id: "a", row: 0, column: 0, color: "cyan", role: "normal" },
    { id: "b", row: 0, column: 1, color: "wine", role: "normal" },
  ];
  assert.equal(countOccupiedRows(sparse), 1);
  assert.equal(needsDensityTopUp(sparse, 2, true), true, "one row is not playable");
});

test("a finished round never asks for more rows", () => {
  const { board } = createInitialBoard(round, 21);
  assert.equal(
    needsDensityTopUp(board, 0, true),
    false,
    "with nothing pending the board is left alone",
  );
});

test("row counting reflects real occupancy", () => {
  const board = [
    { id: "a", row: 0, column: 0, color: "cyan", role: "normal" },
    { id: "b", row: 0, column: 1, color: "cyan", role: "normal" },
    { id: "c", row: 2, column: 0, color: "wine", role: "normal" },
  ];
  assert.equal(countOccupiedRows(board), 2);
  assert.equal(countOccupiedRows([]), 0);
});

test("restoring density uses connected rows and keeps every word on the grid", () => {
  let board = [{ id: "a", row: 0, column: 0, color: "cyan", role: "normal" }];
  const random = createSeededRandom(31);
  const word = { challengeId: "c", contentId: "body_head", label: "Head" };

  while (countOccupiedRows(board) < TARGET_PLAYABLE_ROWS) {
    const result = insertCeilingRow(board, random, [word]);
    board = result.board;
  }

  assert(countOccupiedRows(board) >= TARGET_PLAYABLE_ROWS, "the board becomes playable");
  assert.deepEqual(findDisconnectedBubbleIds(board), [], "rows stay connected");
  assertBoardInvariants(board);
});

test("a word only ever lives on the board, never in the launcher queue", () => {
  // The queue is drawn from board colours alone: it cannot carry content.
  const { board } = createInitialBoard(round, 27);
  const random = createSeededRandom(8);

  for (let i = 0; i < 200; i++) {
    const color = pickQueueColor(board, random);
    assert(
      PLAYABLE_COLORS.includes(color),
      "the shooter may only ever hold a plain playable colour",
    );
    assert.equal(typeof color, "string", "a colour is never a content object");
  }
});

/* ── randomised invariant sweep ── */

test("1000 deterministic seeds never produce a floating bubble or invalid cell", () => {
  const failures = [];

  for (let seed = 1; seed <= 1000; seed++) {
    const random = createSeededRandom(seed);
    let { board } = createInitialBoard(round, seed);
    let step = "create";

    try {
      assertBoardInvariants(board);

      for (let shot = 0; shot < 12 && board.length > 0; shot++) {
        // Alternate real operations: shots, pressure rows and word re-entry.
        if (shot % 4 === 3) {
          step = `insertCeilingRow#${shot}`;
          board = insertCeilingRow(board, random).board;
          assertBoardInvariants(board);
          continue;
        }

        const color = pickQueueColor(board, random);
        if (!color) break;
        const impact = board[Math.floor(random() * board.length)];
        step = `shot#${shot}`;
        const resolution = resolveBubbleShot(
          board,
          impact.id,
          getHexCellCenter(impact.row, impact.column),
          color,
          `shot:${seed}:${shot}`,
        );
        if (!resolution) continue;
        board = resolution.remainingBoard;
        assertBoardInvariants(board);

        // The queue must never offer a colour that left the board.
        const active = getActiveColors(board);
        const next = pickQueueColor(board, random);
        if (next !== null) {
          assert(active.includes(next), `queue offered absent colour ${next}`);
        }
      }
    } catch (error) {
      failures.push({ seed, step, bubbles: board.length, message: error.message });
      if (failures.length >= 3) break;
    }
  }

  assert.deepEqual(
    failures,
    [],
    `Invariant violations:\n${failures.map((f) => JSON.stringify(f)).join("\n")}`,
  );
});
