import { PRESENT_TOBE_QUESTIONS } from "../../../content/data/presentTobeQuestions.ts";
import {
  getBodyEntries,
  getBodyGroupId,
} from "../../adapters/bodyVocabularyAdapter.ts";
import type { ContentDomain } from "../../core/catalog.ts";
import { ROUND_SIZES } from "../../core/roundConfig.ts";
import { selectChallenges } from "../../core/selectChallenges.ts";
import { shuffleWithSeed } from "../../core/shuffle.ts";
import type { PreparedArcadeRound } from "../bridge/arcadeBridge";

export function createSoloRaceRound(
  seed: number,
  domain: ContentDomain = "grammar",
): PreparedArcadeRound {
  return domain === "vocabulary"
    ? createVocabularyRaceRound(seed)
    : createGrammarRaceRound(seed);
}

function createGrammarRaceRound(seed: number): PreparedArcadeRound {
  const roundSize = ROUND_SIZES.solo_race.count;
  const easyCount = Math.ceil(roundSize * 0.6);
  const easy = PRESENT_TOBE_QUESTIONS.filter((question) => question.difficulty === "easy");
  const medium = PRESENT_TOBE_QUESTIONS.filter((question) => question.difficulty === "medium");
  const selected = [
    ...selectChallenges(easy, easyCount, seed),
    ...selectChallenges(medium, roundSize - easyCount, seed + 701),
  ];

  return {
    id: `solo-race-present-tobe-${seed}`,
    gameId: "solo_race",
    challenges: selected.map((question, challengeIndex) => {
      const choices = question.options.map((label, optionIndex) => ({
        id: `${question.id}:option:${optionIndex}`,
        label,
      }));
      return {
        id: `solo_race:${question.id}`,
        prompt: question.question,
        choices: shuffleWithSeed(choices, seed + (challengeIndex + 1) * 149),
        correctChoiceId: `${question.id}:option:${question.options.indexOf(question.correctAnswer)}`,
        feedback: question.feedback,
      };
    }),
  };
}

function createVocabularyRaceRound(seed: number): PreparedArcadeRound {
  const entries = getBodyEntries();
  const selected = selectChallenges(entries, ROUND_SIZES.solo_race.count, seed);

  return {
    id: `solo-race-body-${seed}`,
    gameId: "solo_race",
    challenges: selected.map((correctEntry, challengeIndex) => {
      const candidates = entries.filter(
        (entry) => entry.id !== correctEntry.id &&
          getBodyGroupId(entry) === getBodyGroupId(correctEntry),
      );
      const fallback = entries.filter((entry) => entry.id !== correctEntry.id);
      const distractors = selectChallenges(
        candidates.length >= 2 ? candidates : fallback,
        2,
        seed + (challengeIndex + 1) * 173,
      );
      const choices = [correctEntry, ...distractors].map((entry) => ({
        id: entry.id,
        label: entry.term,
      }));
      return {
        id: `solo_race:${correctEntry.id}`,
        prompt: `Qual palavra em inglês significa "${correctEntry.translation}"?`,
        choices: shuffleWithSeed(choices, seed + (challengeIndex + 1) * 263),
        correctChoiceId: correctEntry.id,
        feedback: `${correctEntry.term} significa ${correctEntry.translation}.`,
      };
    }),
  };
}
