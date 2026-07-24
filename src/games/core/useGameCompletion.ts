import { useRef } from "react";
import type { ContentDomain, GameId } from "./catalog";
import type { GameRoundResult } from "./sessionEngine";
import { saveGameSession } from "../../services/progress/localProgress";
import { recordGameRoundEngagement } from "../../services/progress/engagement";

/**
 * Persists a finished game round exactly once per session, then reports the
 * result to the shared XP/mission/streak engine. Call `complete` from the
 * game's finish handler; the sessionId returned by `useGameSessionId` keeps
 * repeated calls (StrictMode double-invoke, re-render) idempotent.
 */
export function useGameCompletion(gameId: GameId, contentDomain: ContentDomain) {
  const sessionIdRef = useRef(crypto.randomUUID());
  const savedRef = useRef(false);

  async function complete(result: GameRoundResult) {
    if (savedRef.current) return;
    savedRef.current = true;
    const sessionId = sessionIdRef.current;

    await saveGameSession({
      sessionId,
      gameId,
      contentDomain,
      totalChallenges: result.totalChallenges,
      correctCount: result.correctCount,
      xpEarned: result.xpEarned,
      score: result.score,
      completedAt: result.completedAt,
    });

    await recordGameRoundEngagement(
      sessionId,
      contentDomain,
      result.xpEarned,
      result.totalChallenges,
      new Date(result.completedAt),
    );
  }

  function resetSession() {
    sessionIdRef.current = crypto.randomUUID();
    savedRef.current = false;
  }

  return { complete, resetSession, sessionId: sessionIdRef.current };
}
