import { useRef, useState } from "react";
import type { ContentDomain, GameId } from "./catalog";
import type { GameRoundResult } from "./sessionEngine";
import { createCompletionCoordinator, type CompletionCoordinator } from "./completionCoordinator";
import { saveGameSession } from "../../services/progress/localProgress";
import { recordGameRoundEngagement } from "../../services/progress/engagement";

/**
 * Serializes completion per session and retries the idempotent persistence
 * pipeline once. A terminal error is exposed to the result UI instead of
 * becoming an unhandled rejection.
 */
export function useGameCompletion(
  gameId: GameId,
  contentDomain: ContentDomain | readonly ContentDomain[],
) {
  const [completionError, setCompletionError] = useState<Error | null>(null);
  const generationRef = useRef(0);
  const lastResultRef = useRef<GameRoundResult | null>(null);
  const coordinatorRef = useRef<CompletionCoordinator<GameRoundResult> | null>(null);

  if (!coordinatorRef.current) {
    const contentDomains = [
      ...new Set(Array.isArray(contentDomain) ? contentDomain : [contentDomain]),
    ];
    const primaryContentDomain = contentDomains[0];
    coordinatorRef.current = createCompletionCoordinator({
      createSessionId: () => crypto.randomUUID(),
      persist: async (sessionId, result) => {
        await saveGameSession({
          sessionId,
          gameId,
          contentDomain: primaryContentDomain,
          contentDomains,
          totalChallenges: result.totalChallenges,
          correctCount: result.correctCount,
          xpEarned: result.xpEarned,
          score: result.score,
          completedAt: result.completedAt,
        });

        await recordGameRoundEngagement(
          sessionId,
          contentDomains,
          result.xpEarned,
          result.totalChallenges,
          new Date(result.completedAt),
        );
      },
    });
  }

  async function complete(result: GameRoundResult) {
    const generation = generationRef.current;
    lastResultRef.current = result;
    setCompletionError(null);
    try {
      await coordinatorRef.current!.complete(result);
    } catch (error) {
      if (generationRef.current === generation) {
        setCompletionError(error instanceof Error ? error : new Error("Não foi possível salvar o resultado."));
      }
    }
  }

  function retryCompletion() {
    if (lastResultRef.current) void complete(lastResultRef.current);
  }

  function resetSession() {
    generationRef.current += 1;
    coordinatorRef.current!.reset();
    lastResultRef.current = null;
    setCompletionError(null);
  }

  return {
    complete,
    completionError,
    resetSession,
    retryCompletion,
    sessionId: coordinatorRef.current.getSessionId(),
  };
}
