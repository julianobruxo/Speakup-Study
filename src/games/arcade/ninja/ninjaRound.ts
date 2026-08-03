import { PRESENT_TOBE_QUESTIONS } from "../../../content/data/presentTobeQuestions.ts";
import { selectChallenges } from "../../core/selectChallenges.ts";
import { shuffleWithSeed } from "../../core/shuffle.ts";
import type { PreparedArcadeRound } from "../bridge/arcadeBridge";

export const NINJA_FOUNDATION_CHALLENGE_COUNT = 5;

export function createNinjaFoundationRound(seed: number): PreparedArcadeRound {
  const easyQuestions = PRESENT_TOBE_QUESTIONS.filter(
    (question) => question.difficulty === "easy",
  );
  const selected = selectChallenges(easyQuestions, NINJA_FOUNDATION_CHALLENGE_COUNT, seed);

  return {
    id: `ninja-present-tobe-${seed}`,
    gameId: "ninja",
    challenges: selected.map((question, challengeIndex) => {
      const choices = question.options.map((label, optionIndex) => ({
        id: `${question.id}:option:${optionIndex}`,
        label,
      }));
      const correctOptionIndex = question.options.indexOf(question.correctAnswer);

      return {
        id: `ninja:${question.id}`,
        prompt: question.question,
        choices: shuffleWithSeed(choices, seed + (challengeIndex + 1) * 137),
        correctChoiceId: `${question.id}:option:${correctOptionIndex}`,
        feedback: question.feedback,
      };
    }),
  };
}
