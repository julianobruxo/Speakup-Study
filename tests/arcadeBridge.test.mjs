import assert from "node:assert/strict";
import test from "node:test";

import {
  acceptFirstArcadeOutcome,
  createArcadeAnswerGate,
  resolveArcadeAnswer,
} from "../src/games/arcade/bridge/arcadeBridge.ts";

const round = {
  id: "technical-round",
  gameId: "bridge_technical",
  challenges: [{
    id: "body-eye",
    prompt: "Qual palavra significa olho?",
    choices: [
      { id: "eye", label: "Eye" },
      { id: "ear", label: "Ear" },
    ],
    correctChoiceId: "eye",
  }],
};

test("arcade bridge resolves only choices from the prepared React round", () => {
  const correct = resolveArcadeAnswer(round, {
    challengeId: "body-eye",
    choiceId: "eye",
    answeredAt: "2026-07-30T12:00:00.000Z",
  });
  const incorrect = resolveArcadeAnswer(round, {
    challengeId: "body-eye",
    choiceId: "ear",
    answeredAt: "2026-07-30T12:00:01.000Z",
  });

  assert.deepEqual(correct, {
    challengeId: "body-eye",
    correct: true,
    answeredAt: "2026-07-30T12:00:00.000Z",
  });
  assert.equal(incorrect?.correct, false);
});

test("arcade bridge rejects unknown challenges and choices", () => {
  assert.equal(resolveArcadeAnswer(round, {
    challengeId: "unknown",
    choiceId: "eye",
    answeredAt: "2026-07-30T12:00:00.000Z",
  }), null);
  assert.equal(resolveArcadeAnswer(round, {
    challengeId: "body-eye",
    choiceId: "unknown",
    answeredAt: "2026-07-30T12:00:00.000Z",
  }), null);
});

test("arcade bridge ignores an invalid event before accepting the first valid outcome", () => {
  const invalid = {
    challengeId: "body-eye",
    choiceId: "unknown",
    answeredAt: "2026-07-30T12:00:00.000Z",
  };
  const valid = {
    challengeId: "body-eye",
    choiceId: "eye",
    answeredAt: "2026-07-30T12:00:01.000Z",
  };

  const afterInvalid = acceptFirstArcadeOutcome(null, round, invalid);
  const afterValid = acceptFirstArcadeOutcome(afterInvalid, round, valid);

  assert.equal(afterInvalid, null);
  assert.deepEqual(afterValid, {
    challengeId: "body-eye",
    correct: true,
    answeredAt: "2026-07-30T12:00:01.000Z",
  });
});

test("arcade bridge preserves the first valid outcome", () => {
  const first = acceptFirstArcadeOutcome(null, round, {
    challengeId: "body-eye",
    choiceId: "ear",
    answeredAt: "2026-07-30T12:00:00.000Z",
  });
  const second = acceptFirstArcadeOutcome(first, round, {
    challengeId: "body-eye",
    choiceId: "eye",
    answeredAt: "2026-07-30T12:00:01.000Z",
  });

  assert.equal(first?.correct, false);
  assert.equal(second, first);
});

test("arcade scene gate locks only after React accepts a valid outcome", () => {
  const accepted = [];
  const submit = createArcadeAnswerGate(round, (outcome) => accepted.push(outcome));

  assert.equal(submit({
    challengeId: "body-eye",
    choiceId: "unknown",
    answeredAt: "2026-07-30T12:00:00.000Z",
  }), false);
  assert.equal(submit({
    challengeId: "body-eye",
    choiceId: "eye",
    answeredAt: "2026-07-30T12:00:01.000Z",
  }), true);
  assert.equal(submit({
    challengeId: "body-eye",
    choiceId: "ear",
    answeredAt: "2026-07-30T12:00:02.000Z",
  }), false);
  assert.deepEqual(accepted, [{
    challengeId: "body-eye",
    correct: true,
    answeredAt: "2026-07-30T12:00:01.000Z",
  }]);
});
