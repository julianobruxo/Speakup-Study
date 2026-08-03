import { getBodyEntries } from "../../adapters/bodyVocabularyAdapter.ts";
import { ROUND_SIZES } from "../../core/roundConfig.ts";
import { selectChallenges } from "../../core/selectChallenges.ts";
import { shuffleWithSeed } from "../../core/shuffle.ts";
import type { PreparedArcadeRound } from "../bridge/arcadeBridge";

export function createBubbleShooterRound(seed: number): PreparedArcadeRound {
  const entries = getBodyEntries();
  const selected = selectChallenges(entries, ROUND_SIZES.bubble_shooter.count, seed);

  return {
    id: `bubble-shooter-body-${seed}`,
    gameId: "bubble_shooter",
    challenges: selected.map((correctEntry, index) => {
      const distractors = selectChallenges(
        entries.filter((entry) => entry.id !== correctEntry.id),
        2,
        seed + (index + 1) * 101,
      );
      const choices = shuffleWithSeed(
        [correctEntry, ...distractors].map((entry) => ({
          id: entry.id,
          label: entry.term,
        })),
        seed + (index + 1) * 211,
      );

      return {
        id: `bubble_shooter:${correctEntry.id}`,
        prompt: `Qual palavra em inglês significa "${correctEntry.translation}"?`,
        choices,
        correctChoiceId: correctEntry.id,
      };
    }),
  };
}
