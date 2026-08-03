import assert from "node:assert/strict";
import test from "node:test";

import {
  getBodyEntries,
  getBodyGroupId,
} from "../src/games/adapters/bodyVocabularyAdapter.ts";
import {
  findFirstSlice,
  getWordSliceDifficulty,
  interpolateTrail,
  intersectSegmentCircle,
  triangleWave,
  WORD_SLICE_TRAIL_LIMIT,
} from "../src/games/arcade/wordSlice/wordSliceModel.ts";
import { createWordSliceRound } from "../src/games/arcade/wordSlice/wordSliceRound.ts";

const target = {
  center: { x: 50, y: 50 },
  choiceId: "hand",
  id: "moving:hand",
  radius: 20,
};

test("Corte a palavra prepares eight deterministic unique body challenges", () => {
  const first = createWordSliceRound(2026);
  const second = createWordSliceRound(2026);
  const bodyIds = new Set(getBodyEntries().map((entry) => entry.id));

  assert.deepEqual(first, second);
  assert.equal(first.gameId, "word_slice");
  assert.equal(first.challenges.length, 8);
  assert.equal(new Set(first.challenges.map((item) => item.correctChoiceId)).size, 8);
  for (const challenge of first.challenges) {
    assert.equal(challenge.choices.length, 3);
    assert.equal(new Set(challenge.choices.map((choice) => choice.id)).size, 3);
    assert(challenge.choices.some((choice) => choice.id === challenge.correctChoiceId));
    assert(challenge.choices.every((choice) => bodyIds.has(choice.id)));
  }

  const entriesById = new Map(getBodyEntries().map((entry) => [entry.id, entry]));
  first.challenges.forEach((challenge, index) => {
    const correct = entriesById.get(challenge.correctChoiceId);
    const sameGroupDistractors = challenge.choices
      .filter((choice) => choice.id !== challenge.correctChoiceId)
      .map((choice) => entriesById.get(choice.id))
      .filter((entry) => getBodyGroupId(entry) === getBodyGroupId(correct));
    assert.equal(sameGroupDistractors.length, index < 2 ? 0 : index < 5 ? 1 : 2);
  });
});

test("trail interpolation fills long pointer gaps without duplicating a stationary point", () => {
  assert.deepEqual(interpolateTrail({ x: 4, y: 7 }, { x: 4, y: 7 }), []);
  const points = interpolateTrail({ x: 0, y: 0 }, { x: 25, y: 0 }, 8);
  assert.equal(points.length, 4);
  assert.deepEqual(points.at(-1), { x: 25, y: 0 });
  assert(points.every((point, index) => index === 0 || point.x - points[index - 1].x <= 8));
  assert(WORD_SLICE_TRAIL_LIMIT <= 32);
});

test("continuous segment collision catches crossings, tangencies and misses", () => {
  assert.equal(intersectSegmentCircle({ x: 0, y: 50 }, { x: 100, y: 50 }, target), 0.3);
  assert.equal(intersectSegmentCircle({ x: 0, y: 30 }, { x: 100, y: 30 }, target), 0.5);
  assert.equal(intersectSegmentCircle({ x: 0, y: 20 }, { x: 100, y: 20 }, target), null);
  assert.equal(intersectSegmentCircle({ x: 50, y: 50 }, { x: 50, y: 50 }, target), 0);
  assert.equal(intersectSegmentCircle({ x: 0, y: 26 }, { x: 100, y: 26 }, target, 4), 0.5);
});

test("a segment crossing two words resolves only the first physical hit", () => {
  const second = {
    center: { x: 85, y: 50 },
    choiceId: "eye",
    id: "moving:eye",
    radius: 12,
  };
  const hit = findFirstSlice({ x: 0, y: 50 }, { x: 120, y: 50 }, [second, target]);
  assert.equal(hit?.object.id, target.id);
  assert(hit.t < 0.5);
});

test("difficulty grows gently and motion remains bounded", () => {
  assert.deepEqual(getWordSliceDifficulty(0), { speed: 0.95, sway: 0.35 });
  assert.deepEqual(getWordSliceDifficulty(3), { speed: 1, sway: 0.5 });
  assert.deepEqual(getWordSliceDifficulty(7), { speed: 1.03, sway: 0.6 });
  for (let value = -2; value <= 2; value += 0.05) {
    assert(triangleWave(value) >= 0 && triangleWave(value) <= 1);
  }
});
