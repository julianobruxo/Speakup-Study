import type { GameId } from "./catalog";
import { calculateRoundXp } from "./roundConfig";

export interface ChallengeOutcome {
  challengeId: string;
  correct: boolean;
  answeredAt: string;
}

export interface GameRoundResult {
  gameId: GameId;
  totalChallenges: number;
  correctCount: number;
  outcomes: ChallengeOutcome[];
  xpEarned: number;
  score: number;
  completedAt: string;
}

export interface GameRoundState {
  gameId: GameId;
  currentIndex: number;
  outcomes: ChallengeOutcome[];
}

export function createRoundState(gameId: GameId): GameRoundState {
  return { gameId, currentIndex: 0, outcomes: [] };
}

export function recordOutcome(
  state: GameRoundState,
  challengeId: string,
  correct: boolean,
  answeredAt: string = new Date().toISOString(),
): GameRoundState {
  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    outcomes: [...state.outcomes, { challengeId, correct, answeredAt }],
  };
}

/**
 * Finalizes a round. Score defaults to the correct-answer count; mechanics
 * with speed/combo bonuses (e.g. Contra o relógio) should pass their own
 * `score` override, which only affects records/leaderboards, never XP.
 */
export function finalizeRound(
  state: GameRoundState,
  completedAt: string = new Date().toISOString(),
  scoreOverride?: number,
): GameRoundResult {
  const correctCount = state.outcomes.filter((outcome) => outcome.correct).length;
  const totalChallenges = state.outcomes.length;
  return {
    gameId: state.gameId,
    totalChallenges,
    correctCount,
    outcomes: state.outcomes,
    xpEarned: calculateRoundXp(correctCount, totalChallenges),
    score: scoreOverride ?? correctCount,
    completedAt,
  };
}

/** A round only counts toward streak/mission when it has at least 5 valid interactions. */
export function hasValidInteractionCount(result: GameRoundResult): boolean {
  return result.totalChallenges >= 5;
}

