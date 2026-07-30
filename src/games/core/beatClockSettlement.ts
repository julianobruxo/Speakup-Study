export interface BeatClockSettlement {
  correct: boolean;
  remainingMs: number;
  timedOut: boolean;
}

export function resolveBeatClockAttempt(
  requestedCorrect: boolean,
  now: number,
  deadline: number,
): BeatClockSettlement {
  const remainingMs = Math.max(0, deadline - now);
  const timedOut = now >= deadline;
  return {
    correct: requestedCorrect && !timedOut,
    remainingMs,
    timedOut,
  };
}
