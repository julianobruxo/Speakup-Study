import { resolveArcadeAnswer } from "../bridge/arcadeBridge.ts";
import type {
  ArcadeAnswer,
  PreparedArcadeRound,
  PreparedArcadeChallenge,
} from "../bridge/arcadeBridge";
import type { ChallengeOutcome } from "../../core/sessionEngine";
import type { CollectedWord } from "./bubbleShooterModel";

/**
 * Interprets the *physical* result of a shot as a learning event.
 *
 * The core product rule: a shot is only a language answer when the word bubble
 * matching the current Portuguese objective is collected. Everything else — a
 * shot that merely snaps, a plain colour match, or a chain reaction that
 * happens to take another word down — is a strategic move and must never be
 * reported as an English mistake.
 */
export interface PedagogicalResolution {
  /** Words collected that were not the current objective. Arcade bonus only. */
  bonusWords: CollectedWord[];
  /** The objective word, when it was collected by this shot. */
  collectedObjective: CollectedWord | null;
  /** Content ids that must return to the pool so they can reappear later. */
  returnedToPool: string[];
  /** True only when React should be told the learner answered correctly. */
  shouldEmitOutcome: boolean;
}

/**
 * Idempotent answer gate for Bubble Shooter.
 *
 * Unlike the shared round gate, objectives here are resolved in board order,
 * not strict round order: the objective always follows a word that is actually
 * present on the grid. Each challenge is still accepted at most once, so replay,
 * refresh or a repeated chain reaction can never duplicate an outcome or XP.
 */
export function createBubbleShooterAnswerGate(
  round: PreparedArcadeRound,
  onAccepted: (outcome: ChallengeOutcome) => void,
) {
  const acceptedChallengeIds = new Set<string>();

  return (answer: ArcadeAnswer): ChallengeOutcome | null => {
    if (acceptedChallengeIds.has(answer.challengeId)) return null;
    const outcome = resolveArcadeAnswer(round, answer);
    if (!outcome) return null;
    acceptedChallengeIds.add(answer.challengeId);
    onAccepted(outcome);
    return outcome;
  };
}

export function resolvePedagogy(
  objective: PreparedArcadeChallenge | null,
  collectedWords: CollectedWord[],
): PedagogicalResolution {
  const objectiveContentId = objective?.correctChoiceId;

  let collectedObjective: CollectedWord | null = null;
  const bonusWords: CollectedWord[] = [];

  for (const word of collectedWords) {
    // At most one outcome per shot: a chain reaction may not auto-resolve the
    // next objective, so any further match of the same id counts as a bonus.
    if (
      objectiveContentId &&
      word.contentId === objectiveContentId &&
      !collectedObjective
    ) {
      collectedObjective = word;
      continue;
    }
    bonusWords.push(word);
  }

  return {
    bonusWords,
    collectedObjective,
    // Non-objective words go back to the pool: they may be needed later, and
    // they must be able to reappear through a valid structural operation.
    returnedToPool: bonusWords.map((word) => word.contentId),
    shouldEmitOutcome: collectedObjective !== null,
  };
}
