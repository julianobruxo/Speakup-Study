import { PRESENT_TOBE_QUESTIONS } from "../../../content/data/presentTobeQuestions.ts";
import { selectChallenges } from "../../core/selectChallenges.ts";
import { shuffleWithSeed } from "../../core/shuffle.ts";
import type { PreparedArcadeRound } from "../bridge/arcadeBridge";

interface NinjaLevelDefinition {
  id: string;
  label: string;
  slots: readonly (readonly string[])[];
}

export const NINJA_TIMING_MS = {
  correctFeedback: 1_200,
  incorrectFeedback: 4_500,
  jump: 640,
  levelTransition: 1_100,
  regularRun: 720,
} as const;

export const NINJA_LEVELS: readonly NinjaLevelDefinition[] = [
  {
    id: "affirmative-basics",
    label: "Base afirmativa",
    slots: [
      ["present_tobe_easy_004", "present_tobe_easy_048"],
      ["present_tobe_easy_015", "present_tobe_easy_018"],
    ],
  },
  {
    id: "simple-sentences",
    label: "Frases simples",
    slots: [
      ["present_tobe_easy_001", "present_tobe_easy_002", "present_tobe_easy_006", "present_tobe_easy_008", "present_tobe_easy_009", "present_tobe_easy_012", "present_tobe_easy_014", "present_tobe_easy_016", "present_tobe_easy_019", "present_tobe_easy_020"],
      ["present_tobe_easy_003", "present_tobe_easy_005", "present_tobe_easy_007", "present_tobe_easy_010", "present_tobe_easy_011", "present_tobe_easy_013", "present_tobe_easy_017", "present_tobe_easy_034", "present_tobe_easy_038", "present_tobe_easy_050"],
    ],
  },
  {
    id: "negatives",
    label: "Negativas e contrações",
    slots: [
      ["present_tobe_easy_021", "present_tobe_easy_025", "present_tobe_easy_028", "present_tobe_easy_029", "present_tobe_easy_030"],
      ["present_tobe_easy_022", "present_tobe_easy_023", "present_tobe_easy_024", "present_tobe_easy_037"],
    ],
  },
  {
    id: "questions",
    label: "Perguntas",
    slots: [
      ["present_tobe_easy_026", "present_tobe_easy_031", "present_tobe_easy_033", "present_tobe_easy_035", "present_tobe_easy_042"],
      ["present_tobe_easy_027", "present_tobe_easy_036", "present_tobe_easy_041", "present_tobe_easy_043"],
    ],
  },
  {
    id: "final-mix",
    label: "Mistura final",
    slots: [
      ["present_tobe_medium_066"],
      ["present_tobe_medium_014", "present_tobe_medium_020", "present_tobe_medium_024", "present_tobe_medium_044", "present_tobe_medium_045", "present_tobe_medium_046", "present_tobe_medium_051", "present_tobe_medium_055"],
    ],
  },
] as const;

export const NINJA_FOUNDATION_CHALLENGE_COUNT = NINJA_LEVELS.reduce(
  (total, level) => total + level.slots.length,
  0,
);

const QUESTION_BY_ID = new Map(PRESENT_TOBE_QUESTIONS.map((question) => [question.id, question]));

export const NINJA_MOBILE_CHOICE_BUDGET_MS = 4_000;

function estimateStructuredRoundMs(
  challengeCount: number,
  incorrectAnswers: number,
  choiceBudgetMs: number,
) {
  const levelStarts = NINJA_LEVELS.length;
  const regularRuns = Math.max(0, challengeCount - levelStarts);
  const boundedIncorrect = Math.min(challengeCount, Math.max(0, Math.trunc(incorrectAnswers)));
  const feedback = boundedIncorrect * NINJA_TIMING_MS.incorrectFeedback +
    (challengeCount - boundedIncorrect) * NINJA_TIMING_MS.correctFeedback;
  return levelStarts * NINJA_TIMING_MS.levelTransition +
    regularRuns * NINJA_TIMING_MS.regularRun +
    challengeCount * (NINJA_TIMING_MS.jump + choiceBudgetMs) +
    feedback;
}

export const NINJA_MOBILE_DURATION_DECISION = {
  choiceBudgetMs: NINJA_MOBILE_CHOICE_BUDGET_MS,
  candidates: [
    { challengeCount: 5, estimatedMs: estimateStructuredRoundMs(5, 1, NINJA_MOBILE_CHOICE_BUDGET_MS), examplesPerStage: 1 },
    { challengeCount: 10, estimatedMs: estimateStructuredRoundMs(10, 2, NINJA_MOBILE_CHOICE_BUDGET_MS), examplesPerStage: 2 },
    { challengeCount: 15, estimatedMs: estimateStructuredRoundMs(15, 3, NINJA_MOBILE_CHOICE_BUDGET_MS), examplesPerStage: 3 },
  ],
  selectedChallengeCount: NINJA_FOUNDATION_CHALLENGE_COUNT,
  viewport: "390x844",
} as const;

export function estimateNinjaMobileRoundMs(incorrectAnswers = 2, choiceBudgetMs = 0) {
  return estimateStructuredRoundMs(
    NINJA_FOUNDATION_CHALLENGE_COUNT,
    incorrectAnswers,
    Math.max(0, choiceBudgetMs),
  );
}

export function isNinjaStageStart(round: PreparedArcadeRound, challengeIndex: number) {
  const stageId = round.challenges[challengeIndex]?.stage?.id;
  if (!stageId) return false;
  const previousStageId = challengeIndex === 0
    ? round.precedingStageId
    : round.challenges[challengeIndex - 1]?.stage?.id;
  return stageId !== previousStageId;
}

export function createNinjaFoundationRound(seed: number): PreparedArcadeRound {
  const selected = NINJA_LEVELS.flatMap((level, levelIndex) =>
    level.slots.map((slot, slotIndex) => {
      const candidates = slot.map((id) => {
        const question = QUESTION_BY_ID.get(id);
        if (!question) throw new Error(`Ninja canonical question not found: ${id}`);
        return question;
      });
      const [question] = selectChallenges(
        candidates,
        1,
        seed + (levelIndex + 1) * 1_009 + (slotIndex + 1) * 173,
      );
      return { level, levelIndex, question };
    }),
  );

  return {
    id: `ninja-present-tobe-${seed}`,
    gameId: "ninja",
    challenges: selected.map(({ level, levelIndex, question }, challengeIndex) => {
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
        stage: {
          id: level.id,
          index: levelIndex,
          label: level.label,
          total: NINJA_LEVELS.length,
        },
      };
    }),
  };
}
