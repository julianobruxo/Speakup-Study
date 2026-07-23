import type { MvpGrammarDifficulty } from "../../content/model/content";
import type { GrammarTopicId } from "../../shared/types/domain";

export interface QuestionProgress {
  questionId: string;
  topicId: GrammarTopicId;
  difficulty: MvpGrammarDifficulty;
  timesSeen: number;
  correctCount: number;
  wrongCount: number;
  lastSeenAt: string;
  lastResult: boolean;
}

export interface CompletedSessionProgress {
  sessionId: string;
  topicId: GrammarTopicId;
  difficulty: MvpGrammarDifficulty;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  bestStreak: number;
  completedAt: string;
}

export interface ProgressSnapshot {
  questions: QuestionProgress[];
  sessions: CompletedSessionProgress[];
}

export interface AnswerProgressRecord {
  questionId: string;
  topicId: GrammarTopicId;
  difficulty: MvpGrammarDifficulty;
  correct: boolean;
  answeredAt: string;
}

export interface ProgressSummary {
  uniqueQuestions: number;
  totalQuestions: 130;
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number | null;
  completedSessions: number;
  bestStreak: number;
  bestResult: number | null;
  lastActivity: string | null;
  reviewCount: number;
  easyPracticed: number;
  mediumPracticed: number;
  easyReviewCount: number;
  mediumReviewCount: number;
}

export interface ProgressRepository {
  getSnapshot(): Promise<ProgressSnapshot>;
  recordAnswer(record: AnswerProgressRecord): Promise<void>;
  saveSession(session: CompletedSessionProgress): Promise<void>;
  clear(): Promise<void>;
}
