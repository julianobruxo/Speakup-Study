import {
  getBodyEntries,
  getBodyGroupId,
} from "../../adapters/bodyVocabularyAdapter.ts";
import { ROUND_SIZES } from "../../core/roundConfig.ts";
import { selectChallenges } from "../../core/selectChallenges.ts";
import { shuffleWithSeed } from "../../core/shuffle.ts";
import type { PreparedArcadeRound } from "../bridge/arcadeBridge";

export function createWordSliceRound(seed: number): PreparedArcadeRound {
  const entries = getBodyEntries();
  const selected = selectChallenges(entries, ROUND_SIZES.word_slice.count, seed);

  return {
    id: `word-slice-body-${seed}`,
    gameId: "word_slice",
    challenges: selected.map((correctEntry, index) => {
      const remaining = entries.filter((entry) => entry.id !== correctEntry.id);
      const sameGroup = remaining.filter(
        (entry) => getBodyGroupId(entry) === getBodyGroupId(correctEntry),
      );
      const differentGroup = remaining.filter(
        (entry) => getBodyGroupId(entry) !== getBodyGroupId(correctEntry),
      );
      const distractors = index < 2
        ? selectChallenges(differentGroup, 2, seed + (index + 1) * 137)
        : index < 5
          ? [
              ...selectChallenges(sameGroup, 1, seed + (index + 1) * 137),
              ...selectChallenges(differentGroup, 1, seed + (index + 1) * 173),
            ]
          : selectChallenges(sameGroup, 2, seed + (index + 1) * 137);
      return {
        id: `word_slice:${correctEntry.id}`,
        prompt: `Corte a palavra que significa "${correctEntry.translation}".`,
        choices: shuffleWithSeed(
          [correctEntry, ...distractors].map((entry) => ({
            id: entry.id,
            label: entry.term,
          })),
          seed + (index + 1) * 263,
        ),
        correctChoiceId: correctEntry.id,
      };
    }),
  };
}
