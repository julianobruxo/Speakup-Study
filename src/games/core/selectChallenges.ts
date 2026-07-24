import { shuffleWithSeed } from "./shuffle";

/** Deterministic, no-repeat selection of challenges for a game round. */
export function selectChallenges<T>(pool: T[], count: number, seed: number): T[] {
  return shuffleWithSeed(pool, seed).slice(0, Math.min(count, pool.length));
}
