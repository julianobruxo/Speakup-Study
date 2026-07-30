import { shuffleWithSeed } from "./shuffle.ts";

/** Deterministic, no-repeat selection of challenges for a game round. */
export function selectChallenges<T>(pool: T[], count: number, seed: number): T[] {
  const seenIds = new Set<unknown>();
  const seenValues = new Set<unknown>();
  const uniquePool = pool.filter((item) => {
    const hasId = typeof item === "object" && item !== null && "id" in item;
    const key = hasId ? item.id : item;
    const seen = hasId ? seenIds : seenValues;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const normalizedCount = Math.max(0, Math.trunc(count));
  return shuffleWithSeed(uniquePool, seed).slice(0, Math.min(normalizedCount, uniquePool.length));
}
