import assert from "node:assert/strict";
import test from "node:test";
import {
  clampRaceLane,
  createSoloRaceProgress,
  getSoloRaceLayout,
  getSoloRaceSpeedMultiplier,
  isHorizontalRaceSwipe,
  laneAfterSwipe,
  laneFromPosition,
  settleSoloRaceProgress,
} from "../src/games/arcade/soloRace/soloRaceModel.ts";
import { createSoloRaceRound } from "../src/games/arcade/soloRace/soloRaceRound.ts";

test("Corrida individual prepares ten deterministic canonical grammar portals", () => {
  const first = createSoloRaceRound(2026, "grammar");
  const second = createSoloRaceRound(2026, "grammar");
  assert.deepEqual(first, second);
  assert.equal(first.gameId, "solo_race");
  assert.equal(first.challenges.length, 10);
  assert.equal(new Set(first.challenges.map((challenge) => challenge.id)).size, 10);
  for (const challenge of first.challenges) {
    assert.equal(challenge.choices.length, 3);
    assert.equal(new Set(challenge.choices.map((choice) => choice.id)).size, 3);
    assert(challenge.choices.some((choice) => choice.id === challenge.correctChoiceId));
    assert.match(challenge.id, /^solo_race:present_tobe_(easy|medium)_/);
  }
});

test("Corrida individual prepares ten unique body portals without copied banks", () => {
  const round = createSoloRaceRound(2026, "vocabulary");
  assert.equal(round.challenges.length, 10);
  assert.equal(new Set(round.challenges.map((challenge) => challenge.id)).size, 10);
  for (const challenge of round.challenges) {
    assert.equal(challenge.choices.length, 3);
    assert.equal(new Set(challenge.choices.map((choice) => choice.id)).size, 3);
    assert(challenge.choices.some((choice) => choice.id === challenge.correctChoiceId));
    assert.match(challenge.prompt, /^Qual palavra em inglês significa "/);
  }
});

test("race lane helpers clamp taps and intentional lateral swipes", () => {
  assert.equal(clampRaceLane(-3), 0);
  assert.equal(clampRaceLane(9), 2);
  assert.equal(laneFromPosition(10, 390), 0);
  assert.equal(laneFromPosition(195, 390), 1);
  assert.equal(laneFromPosition(389, 390), 2);
  assert.equal(laneAfterSwipe(1, 100, 125), 1);
  assert.equal(laneAfterSwipe(1, 100, 160), 2);
  assert.equal(laneAfterSwipe(1, 160, 100), 0);
  assert.equal(laneAfterSwipe(0, 160, 100), 0);
  assert.equal(isHorizontalRaceSwipe(100, 100, 150, 110), true);
  assert.equal(isHorizontalRaceSwipe(100, 100, 125, 105), false);
  assert.equal(isHorizontalRaceSwipe(100, 100, 150, 160), false);
});

test("correct portals boost score and speed while errors slow the car", () => {
  const initial = createSoloRaceProgress();
  const firstCorrect = settleSoloRaceProgress(initial, true);
  const secondCorrect = settleSoloRaceProgress(firstCorrect, true);
  const incorrect = settleSoloRaceProgress(secondCorrect, false);

  assert.deepEqual(initial, { combo: 0, score: 0, speedTier: 2 });
  assert.equal(firstCorrect.combo, 1);
  assert.equal(firstCorrect.score, 100);
  assert(getSoloRaceSpeedMultiplier(firstCorrect) > getSoloRaceSpeedMultiplier(initial));
  assert.equal(secondCorrect.combo, 2);
  assert.equal(secondCorrect.score, 225);
  assert.equal(incorrect.combo, 0);
  assert.equal(incorrect.score, 225);
  assert(getSoloRaceSpeedMultiplier(incorrect) < getSoloRaceSpeedMultiplier(secondCorrect));
});

test("race perspective keeps horizon, portals and vehicle in stable order", () => {
  for (const [width, height] of [[390, 460], [768, 560], [1120, 620]]) {
    const layout = getSoloRaceLayout(width, height);
    assert(layout.horizonY < layout.portalY);
    assert(layout.portalY < layout.vehicleY);
    assert(layout.vehicleY < layout.roadBottomY);
    assert(layout.roadHorizonHalf < layout.roadBottomHalf);
  }
});
