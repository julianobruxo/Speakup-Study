import { getBodyEntries } from "../../adapters/bodyVocabularyAdapter.ts";
import { ROUND_SIZES } from "../../core/roundConfig.ts";
import { selectChallenges } from "../../core/selectChallenges.ts";
import { shuffleWithSeed } from "../../core/shuffle.ts";
import type { PreparedArcadeRound } from "../bridge/arcadeBridge";

/**
 * Prepares the canonical round. Each challenge keeps a Portuguese prompt and the
 * English word that satisfies it.
 *
 * The arcade never asks the learner to pick between the listed choices: the
 * board itself carries word bonus bubbles, and a challenge is only resolved when
 * the matching bubble explodes or falls. The distractor choices stay in the
 * contract because the shared answer gate validates against them and the
 * simplified DOM mode presents them as an accessible multiple choice.
 */
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
