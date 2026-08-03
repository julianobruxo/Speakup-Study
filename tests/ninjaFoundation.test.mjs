import assert from "node:assert/strict";
import test from "node:test";
import { PRESENT_TOBE_QUESTIONS } from "../src/content/data/presentTobeQuestions.ts";

import {
  createNinjaTrackPool,
  getNinjaFoundationLayout,
  getNinjaParallaxOffsets,
  recycleNinjaTrackPool,
} from "../src/games/arcade/ninja/ninjaFoundationModel.ts";
import { createNinjaFoundationRound } from "../src/games/arcade/ninja/ninjaRound.ts";

test("Ninja 6B prepares three deterministic canonical grammar challenges", () => {
  const first = createNinjaFoundationRound(2026);
  const second = createNinjaFoundationRound(2026);
  assert.deepEqual(first, second);
  assert.equal(first.gameId, "ninja");
  assert.equal(first.challenges.length, 3);
  assert.equal(new Set(first.challenges.map((challenge) => challenge.id)).size, 3);
  first.challenges.forEach((challenge) => {
    assert.equal(challenge.choices.length, 3);
    assert.equal(new Set(challenge.choices.map((choice) => choice.id)).size, 3);
    assert(challenge.choices.some((choice) => choice.id === challenge.correctChoiceId));
    assert.match(challenge.id, /^ninja:present_tobe_easy_/);
    assert(challenge.feedback?.length > 10);
    const canonicalId = challenge.id.replace("ninja:", "");
    const canonical = PRESENT_TOBE_QUESTIONS.find((question) => question.id === canonicalId);
    const correctChoice = challenge.choices.find(
      (choice) => choice.id === challenge.correctChoiceId,
    );
    assert.equal(correctChoice?.label, canonical?.correctAnswer);
  });
});

test("Ninja foundation derives compact layouts with enough pooled track", () => {
  for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
    const layout = getNinjaFoundationLayout(width, height);
    assert(layout.groundY < height);
    assert(layout.runnerStartX >= 112 && layout.runnerStartX <= 230);
    assert(layout.poolSize * layout.segmentWidth >= width + layout.segmentWidth * 6);
  }
});

test("Ninja track recycling reuses identities and keeps a continuous runway", () => {
  const width = 220;
  const initial = createNinjaTrackPool(10, width);
  const recycled = recycleNinjaTrackPool(initial, 900, width);
  const ordered = [...recycled.segments].sort((left, right) => left.x - right.x);

  assert(recycled.reuseCount > 0);
  assert.deepEqual(
    new Set(recycled.segments.map((segment) => segment.id)),
    new Set(initial.map((segment) => segment.id)),
  );
  ordered.slice(1).forEach((segment, index) => {
    assert.equal(segment.x - ordered[index].x, width);
  });
});

test("Ninja parallax layers move at distinct bounded rates", () => {
  assert.deepEqual(getNinjaParallaxOffsets(-100), { clouds: 0, far: 0, near: 0 });
  const offsets = getNinjaParallaxOffsets(1000);
  assert(offsets.clouds < offsets.far);
  assert(offsets.far < offsets.near);
  assert(offsets.near < 1000);
});
