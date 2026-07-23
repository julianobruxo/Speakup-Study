import type { MvpGrammarDifficulty } from "../../content/model/content";
import type { GrammarTopicId } from "../../shared/types/domain";

const PREFERENCE_KEY = "last-practice-configuration";

export interface PracticePreferences {
  topicId: GrammarTopicId;
  difficulty: MvpGrammarDifficulty;
  questionCount: 10 | 20 | 30;
}

const defaultPreferences: PracticePreferences = {
  topicId: "present_tobe",
  difficulty: "easy",
  questionCount: 10,
};

export function getPracticePreferences(): PracticePreferences {
  try {
    const parsed = JSON.parse(localStorage.getItem(PREFERENCE_KEY) ?? "null") as Partial<
      PracticePreferences
    > | null;

    if (
      parsed?.topicId === "present_tobe" &&
      (parsed.difficulty === "easy" || parsed.difficulty === "medium") &&
      (parsed.questionCount === 10 ||
        parsed.questionCount === 20 ||
        parsed.questionCount === 30)
    ) {
      return parsed as PracticePreferences;
    }
  } catch {
    // A malformed local preference should never block a practice session.
  }

  return defaultPreferences;
}

export function savePracticePreferences(preferences: PracticePreferences): void {
  try {
    localStorage.setItem(PREFERENCE_KEY, JSON.stringify(preferences));
  } catch {
    // Practice remains available when browser storage is restricted.
  }
}
