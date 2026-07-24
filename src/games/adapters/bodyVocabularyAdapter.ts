import { getVocabularyEntriesByCategory } from "../../content/data/vocabulary";
import type { VocabularyEntry } from "../../content/model/content";
import type {
  MatchingPairChallenge,
  MemoryMatchChallenge,
  SecretWordChallenge,
  SortingChallenge,
} from "../core/challengeTypes";

export type BodyGroupId = "head_face" | "torso_upper_limbs" | "lower_limbs";

export const BODY_GROUPS: { id: BodyGroupId; label: string }[] = [
  { id: "head_face", label: "Cabeça e rosto" },
  { id: "torso_upper_limbs", label: "Tronco e membros superiores" },
  { id: "lower_limbs", label: "Membros inferiores" },
];

/**
 * Explicit, reviewed anatomical grouping. Never infer this silently from
 * text — Cada coisa no seu lugar depends on this map being curated by hand.
 */
const BODY_GROUP_BY_VISUAL_KEY: Record<string, BodyGroupId> = {
  head: "head_face",
  hair: "head_face",
  face: "head_face",
  eye: "head_face",
  ear: "head_face",
  nose: "head_face",
  mouth: "head_face",
  teeth: "head_face",
  tongue: "head_face",
  neck: "head_face",
  shoulder: "torso_upper_limbs",
  arm: "torso_upper_limbs",
  elbow: "torso_upper_limbs",
  hand: "torso_upper_limbs",
  finger: "torso_upper_limbs",
  thumb: "torso_upper_limbs",
  chest: "torso_upper_limbs",
  stomach: "torso_upper_limbs",
  back: "torso_upper_limbs",
  leg: "lower_limbs",
  knee: "lower_limbs",
  ankle: "lower_limbs",
  foot: "lower_limbs",
  toe: "lower_limbs",
};

export function getBodyEntries(): VocabularyEntry[] {
  return getVocabularyEntriesByCategory("body");
}

export function getBodyGroupId(entry: VocabularyEntry): BodyGroupId {
  const key = entry.visualKey ?? entry.id;
  const groupId = BODY_GROUP_BY_VISUAL_KEY[key];
  if (!groupId) {
    throw new Error(`Missing reviewed anatomical group for body entry: ${entry.id}`);
  }
  return groupId;
}

export function toSortingChallenge(entry: VocabularyEntry): SortingChallenge {
  return {
    kind: "sorting",
    id: `sorting:${entry.id}`,
    sourceEntryId: entry.id,
    term: entry.term,
    translation: entry.translation,
    visualKey: entry.visualKey,
    groupId: getBodyGroupId(entry),
  };
}

export function toMatchingPairChallenge(entry: VocabularyEntry): MatchingPairChallenge {
  return {
    kind: "matching_pair",
    id: `matching_pair:${entry.id}`,
    sourceEntryId: entry.id,
    term: entry.term,
    translation: entry.translation,
    visualKey: entry.visualKey,
  };
}

export function toMemoryMatchChallenge(entry: VocabularyEntry): MemoryMatchChallenge {
  return {
    kind: "memory_match",
    id: `memory_match:${entry.id}`,
    sourceEntryId: entry.id,
    term: entry.term,
    translation: entry.translation,
    visualKey: entry.visualKey,
  };
}

/**
 * Palavra secreta clues use the Portuguese translation as the clue and the
 * English term as the answer, per Hangman rules (clue in Portuguese, answer
 * in English). Multi-word terms are supported; spaces reveal automatically.
 */
export function toSecretWordChallenge(entry: VocabularyEntry): SecretWordChallenge {
  return {
    kind: "secret_word",
    id: `secret_word:${entry.id}`,
    sourceEntryId: entry.id,
    answer: entry.term,
    clue: entry.translation,
  };
}
