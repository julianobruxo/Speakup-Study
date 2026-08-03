import assert from "node:assert/strict";
import test from "node:test";

import { getBodyEntries } from "../src/games/adapters/bodyVocabularyAdapter.ts";
import {
  createChallengeBoard,
  findDisconnectedBubbleIds,
  findSameColorGroup,
  getChoiceColor,
  getHexCellCenter,
  getHexNeighbors,
  resolveBubbleShot,
} from "../src/games/arcade/bubbleShooter/bubbleShooterModel.ts";
import { createBubbleShooterRound } from "../src/games/arcade/bubbleShooter/bubbleShooterRound.ts";

const challenge = {
  id: "bubble_shooter:body_head",
  prompt: "Qual palavra em inglês significa cabeça?",
  choices: [
    { id: "body_head", label: "Head" },
    { id: "body_eye", label: "Eye" },
    { id: "body_hand", label: "Hand" },
  ],
  correctChoiceId: "body_head",
};

test("Bubble Shooter prepares six deterministic body challenges with reviewed choices", () => {
  const first = createBubbleShooterRound(2026);
  const second = createBubbleShooterRound(2026);
  const bodyIds = new Set(getBodyEntries().map((entry) => entry.id));

  assert.deepEqual(first, second);
  assert.equal(first.gameId, "bubble_shooter");
  assert.equal(first.challenges.length, 6);
  assert.equal(new Set(first.challenges.map((item) => item.correctChoiceId)).size, 6);
  for (const item of first.challenges) {
    assert.equal(item.choices.length, 3);
    assert.equal(new Set(item.choices.map((choice) => choice.id)).size, 3);
    assert(item.choices.some((choice) => choice.id === item.correctChoiceId));
    assert(item.choices.every((choice) => bodyIds.has(choice.id)));
  }
});

test("hex grid exposes six unique neighbors and starts with two-bubble color groups", () => {
  const neighbors = getHexNeighbors(2, 2);
  assert.equal(neighbors.length, 6);
  assert.equal(new Set(neighbors.map(({ row, column }) => `${row}:${column}`)).size, 6);

  const board = createChallengeBoard(challenge);
  assert.equal(board.length, 9);
  assert.equal(findSameColorGroup(board, "target:body_head").length, 2);
  assert.deepEqual(findDisconnectedBubbleIds(board), []);
});

test("a correct shot snaps into the matching group and drops the disconnected hanger", () => {
  const board = createChallengeBoard(challenge);
  const resolution = resolveBubbleShot(
    board,
    "target:body_head",
    getHexCellCenter(0, 1),
    getChoiceColor(challenge, "body_head"),
    "shot:head",
  );

  assert(resolution);
  assert.equal(resolution.removedGroupIds.length, 3);
  assert(resolution.removedGroupIds.includes("shot:head"));
  assert.deepEqual(resolution.disconnectedIds, ["hanger:body_head"]);
  assert.equal(resolution.remainingBoard.length, 6);
});

test("an incorrect neutral shot stays on the board without removing a group", () => {
  const board = createChallengeBoard(challenge);
  const resolution = resolveBubbleShot(
    board,
    "target:body_eye",
    getHexCellCenter(0, 3),
    "neutral",
    "shot:wrong",
  );

  assert(resolution);
  assert.deepEqual(resolution.removedGroupIds, []);
  assert.deepEqual(resolution.disconnectedIds, []);
  assert.equal(resolution.remainingBoard.length, 10);
});

test("snapping uses the free hex cell nearest to the physical impact point", () => {
  const board = createChallengeBoard(challenge);
  const rightImpact = resolveBubbleShot(
    board,
    "target:body_eye",
    getHexCellCenter(0, 3),
    "neutral",
    "shot:right",
  );
  const lowerImpact = resolveBubbleShot(
    board,
    "target:body_eye",
    getHexCellCenter(1, 1),
    "neutral",
    "shot:lower",
  );

  assert.deepEqual(
    { row: rightImpact?.shot.row, column: rightImpact?.shot.column },
    { row: 0, column: 3 },
  );
  assert.deepEqual(
    { row: lowerImpact?.shot.row, column: lowerImpact?.shot.column },
    { row: 1, column: 1 },
  );
});
