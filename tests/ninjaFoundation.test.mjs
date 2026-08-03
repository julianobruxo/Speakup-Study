import assert from "node:assert/strict";
import test from "node:test";
import { PRESENT_TOBE_QUESTIONS } from "../src/content/data/presentTobeQuestions.ts";

import {
  createNinjaTrackPool,
  getNinjaFoundationLayout,
  getNinjaParallaxOffsets,
  recycleNinjaTrackPool,
} from "../src/games/arcade/ninja/ninjaFoundationModel.ts";
import {
  NINJA_LEVELS,
  NINJA_MOBILE_DURATION_DECISION,
  NINJA_TIMING_MS,
  createNinjaFoundationRound,
  estimateNinjaMobileRoundMs,
  isNinjaStageStart,
} from "../src/games/arcade/ninja/ninjaRound.ts";
import {
  createNinjaProgress,
  recoverNinjaProgress,
  settleNinjaProgress,
} from "../src/games/arcade/ninja/ninjaProgressModel.ts";

test("Ninja prepares ten deterministic canonical grammar challenges across five levels", () => {
  const first = createNinjaFoundationRound(2026);
  const second = createNinjaFoundationRound(2026);
  assert.deepEqual(first, second);
  assert.equal(first.gameId, "ninja");
  assert.equal(first.challenges.length, 10);
  assert.equal(new Set(first.challenges.map((challenge) => challenge.id)).size, 10);
  assert.deepEqual(
    first.challenges.map((challenge) => challenge.stage?.id),
    NINJA_LEVELS.flatMap((level) => [level.id, level.id]),
  );
  first.challenges.forEach((challenge, index) => {
    assert.equal(challenge.stage?.index, Math.floor(index / 2));
    assert.equal(challenge.stage?.total, 5);
    assert.equal(challenge.stage?.label, NINJA_LEVELS[Math.floor(index / 2)].label);
  });
  first.challenges.forEach((challenge) => {
    assert.equal(challenge.choices.length, 3);
    assert.equal(new Set(challenge.choices.map((choice) => choice.id)).size, 3);
    assert(challenge.choices.some((choice) => choice.id === challenge.correctChoiceId));
    assert.match(challenge.id, /^ninja:present_tobe_(easy|medium)_/);
    assert(challenge.feedback?.length > 10);
    const canonicalId = challenge.id.replace("ninja:", "");
    const canonical = PRESENT_TOBE_QUESTIONS.find((question) => question.id === canonicalId);
    const correctChoice = challenge.choices.find(
      (choice) => choice.id === challenge.correctChoiceId,
    );
    assert.equal(correctChoice?.label, canonical?.correctAnswer);
  });
  assert(first.challenges.slice(0, 8).every((challenge) => {
    const canonical = PRESENT_TOBE_QUESTIONS.find(
      (question) => challenge.id === `ninja:${question.id}`,
    );
    return canonical?.difficulty === "easy";
  }));
  assert(first.challenges.slice(8).every((challenge) => {
    const canonical = PRESENT_TOBE_QUESTIONS.find(
      (question) => challenge.id === `ninja:${question.id}`,
    );
    return canonical?.difficulty === "medium";
  }));
});

test("Ninja duration budget keeps ten challenges under one minute before learner choice time", () => {
  assert.deepEqual(NINJA_TIMING_MS, {
    correctFeedback: 1_200,
    incorrectFeedback: 4_500,
    jump: 640,
    levelTransition: 1_100,
    regularRun: 720,
  });
  assert.equal(estimateNinjaMobileRoundMs(0), 27_500);
  assert.equal(estimateNinjaMobileRoundMs(2), 34_100);
  assert.equal(estimateNinjaMobileRoundMs(2, 4_000), 74_100);
  assert(estimateNinjaMobileRoundMs(2) < 60_000);
  assert.deepEqual(NINJA_MOBILE_DURATION_DECISION.candidates, [
    { challengeCount: 5, estimatedMs: 38_000, examplesPerStage: 1 },
    { challengeCount: 10, estimatedMs: 74_100, examplesPerStage: 2 },
    { challengeCount: 15, estimatedMs: 110_200, examplesPerStage: 3 },
  ]);
});

test("Ninja stage transitions respect a sliced recovery round", () => {
  const round = createNinjaFoundationRound(2026);
  assert(isNinjaStageStart(round, 0));
  assert(!isNinjaStageStart(round, 1));
  assert(isNinjaStageStart(round, 2));

  const recoveredInsideStage = {
    ...round,
    challenges: round.challenges.slice(3),
    precedingStageId: round.challenges[2].stage?.id,
  };
  assert(!isNinjaStageStart(recoveredInsideStage, 0));
  assert(isNinjaStageStart(recoveredInsideStage, 1));
});

test("Ninja level pools stay unique and ordered across seeds", () => {
  const expectedStages = NINJA_LEVELS.flatMap((level) => [level.id, level.id]);
  for (let seed = 1; seed <= 100; seed += 1) {
    const round = createNinjaFoundationRound(seed);
    assert.equal(new Set(round.challenges.map((challenge) => challenge.id)).size, 10);
    assert.deepEqual(round.challenges.map((challenge) => challenge.stage?.id), expectedStages);
  }
});

test("Ninja lives, score and combo progress without affecting round ownership", () => {
  let progress = createNinjaProgress();
  assert.deepEqual(progress, { combo: 0, gameOver: false, lives: 3, score: 0 });

  progress = settleNinjaProgress(progress, true, false);
  assert.deepEqual(progress, { combo: 1, gameOver: false, lives: 3, score: 100 });
  progress = settleNinjaProgress(progress, true, false);
  assert.deepEqual(progress, { combo: 2, gameOver: false, lives: 3, score: 225 });
  progress = settleNinjaProgress(progress, false, false);
  assert.deepEqual(progress, { combo: 0, gameOver: false, lives: 2, score: 225 });
});

test("Ninja enters partial game over and recovers without losing score", () => {
  let progress = createNinjaProgress();
  progress = settleNinjaProgress(progress, true, false);
  progress = settleNinjaProgress(progress, false, false);
  progress = settleNinjaProgress(progress, false, false);
  progress = settleNinjaProgress(progress, false, false);
  assert.deepEqual(progress, { combo: 0, gameOver: true, lives: 0, score: 100 });

  const recovered = recoverNinjaProgress(progress);
  assert.deepEqual(recovered, { combo: 0, gameOver: false, lives: 3, score: 100 });
});

test("Ninja lets round completion win over a final lost life", () => {
  const final = settleNinjaProgress(
    { combo: 2, gameOver: false, lives: 1, score: 300 },
    false,
    true,
  );
  assert.deepEqual(final, { combo: 0, gameOver: false, lives: 0, score: 300 });
});

test("Ninja caps the score bonus while allowing the combo to keep growing", () => {
  let progress = createNinjaProgress();
  for (let index = 0; index < 6; index += 1) {
    progress = settleNinjaProgress(progress, true, false);
  }
  assert.deepEqual(progress, {
    combo: 6,
    gameOver: false,
    lives: 3,
    score: 950,
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
