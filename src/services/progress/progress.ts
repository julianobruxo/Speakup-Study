import type {
  AnswerResult,
  GrammarTopicId,
  IsoDateTimeString,
  LearningStatus,
  PracticeDifficulty,
  PracticeMode,
  PracticeQuestionCount,
  PracticeSessionId,
  ProfileId,
  QuestionId,
  SessionState,
  VocabularyCategoryId,
  VocabularyEntryId,
} from "../../shared/types/domain";

export interface QuestionProgress {
  questionId: QuestionId;
  timesSeen: number;
  correctCount: number;
  wrongCount: number;
  lastSeenAt?: IsoDateTimeString;
  lastResult?: AnswerResult;
  averageResponseMs?: number;
  masteryScore: number;
  nextReviewAt?: IsoDateTimeString;
}

export interface VocabularyProgress {
  vocabularyEntryId: VocabularyEntryId;
  status: LearningStatus;
  timesSeen: number;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt?: IsoDateTimeString;
  nextReviewAt?: IsoDateTimeString;
}

export interface SessionHistoryEntry {
  id: PracticeSessionId;
  profileId: ProfileId;
  mode: PracticeMode;
  state: SessionState;
  requestedQuestionCount: PracticeQuestionCount;
  correctCount: number;
  durationMs: number;
  startedAt: IsoDateTimeString;
  completedAt?: IsoDateTimeString;
  abandonedAt?: IsoDateTimeString;
  topicId?: GrammarTopicId;
  categoryId?: VocabularyCategoryId;
  difficulty?: PracticeDifficulty;
}

export interface ProgressSnapshot {
  profileId: ProfileId;
  questions: QuestionProgress[];
  vocabulary: VocabularyProgress[];
  sessions: SessionHistoryEntry[];
}

export interface AnswerProgressRecord {
  profileId: ProfileId;
  questionId: QuestionId;
  result: AnswerResult;
  responseMs: number;
  answeredAt: IsoDateTimeString;
}

export interface PendingReview {
  profileId: ProfileId;
  questionId?: QuestionId;
  vocabularyEntryId?: VocabularyEntryId;
  dueAt: IsoDateTimeString;
}

export interface ProgressRepository {
  getQuestionProgress(
    profileId: ProfileId,
    questionId: QuestionId,
  ): Promise<QuestionProgress | undefined>;
  listQuestionProgress(profileId: ProfileId): Promise<QuestionProgress[]>;
  saveAnswerResult(record: AnswerProgressRecord): Promise<void>;
  saveSession(entry: SessionHistoryEntry): Promise<void>;
  getInterruptedSession(
    profileId: ProfileId,
  ): Promise<SessionHistoryEntry | undefined>;
  listPendingReviews(
    profileId: ProfileId,
    now: IsoDateTimeString,
  ): Promise<PendingReview[]>;
  clearProfileProgress(profileId: ProfileId): Promise<void>;
}
