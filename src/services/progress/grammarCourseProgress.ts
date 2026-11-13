import type { GrammarCourseId } from "../../content/data/grammarCourses";

const STORAGE_KEY = "speakup-grammar-courses-v1";
export const GRAMMAR_COURSE_PROGRESS_EVENT = "grammar-course-progress";

export interface GrammarCourseProgressRecord {
  answerCount: number;
  correctCount: number;
  practicedQuestionIds: string[];
  completedLevels: Record<string, number>;
  reviewAttempts: number;
  bestReview: number;
}

export type GrammarCourseProgress = Partial<
  Record<GrammarCourseId, GrammarCourseProgressRecord>
>;

export function readGrammarCourseProgress(): GrammarCourseProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function recordCourseAnswer(
  courseId: GrammarCourseId,
  questionId: string,
  correct: boolean,
) {
  const progress = readGrammarCourseProgress();
  const record = ensureRecord(progress, courseId);
  record.answerCount += 1;
  record.correctCount += correct ? 1 : 0;
  if (!record.practicedQuestionIds.includes(questionId)) {
    record.practicedQuestionIds.push(questionId);
  }
  save(progress);
}

export function recordCourseCompletion(
  courseId: GrammarCourseId,
  scope: `level-${number}` | "review",
  percentage: number,
) {
  const progress = readGrammarCourseProgress();
  const record = ensureRecord(progress, courseId);
  if (scope === "review") {
    record.reviewAttempts += 1;
    record.bestReview = Math.max(record.bestReview, percentage);
  } else {
    record.completedLevels[scope] = Math.max(
      record.completedLevels[scope] ?? 0,
      percentage,
    );
  }
  save(progress);
}

export function summarizeGrammarCourseProgress(progress = readGrammarCourseProgress()) {
  const records = Object.values(progress).filter(
    (record): record is GrammarCourseProgressRecord => Boolean(record),
  );
  const answerCount = records.reduce((total, record) => total + record.answerCount, 0);
  const correctCount = records.reduce((total, record) => total + record.correctCount, 0);
  return {
    answerCount,
    correctCount,
    accuracy: answerCount ? Math.round((correctCount / answerCount) * 100) : null,
    uniqueQuestions: new Set(records.flatMap((record) => record.practicedQuestionIds)).size,
    completedLevels: records.reduce(
      (total, record) => total + Object.keys(record.completedLevels).length,
      0,
    ),
    reviewAttempts: records.reduce((total, record) => total + record.reviewAttempts, 0),
  };
}

function ensureRecord(
  progress: GrammarCourseProgress,
  courseId: GrammarCourseId,
): GrammarCourseProgressRecord {
  const existing = progress[courseId];
  if (existing) return existing;
  const created: GrammarCourseProgressRecord = {
    answerCount: 0,
    correctCount: 0,
    practicedQuestionIds: [],
    completedLevels: {},
    reviewAttempts: 0,
    bestReview: 0,
  };
  progress[courseId] = created;
  return created;
}

function save(progress: GrammarCourseProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent(GRAMMAR_COURSE_PROGRESS_EVENT));
  } catch {
    // A prática continua mesmo quando o navegador bloqueia armazenamento local.
  }
}
