import type {
  AnswerResult,
  GrammarTopicId,
  IsoDateTimeString,
  PracticeDifficulty,
  PracticeMode,
  PracticeQuestionCount,
  PracticeSessionId,
  ProfileId,
  QuestionId,
  SessionState,
} from "../../shared/types/domain";
import type { ProgressSnapshot } from "../progress/progress";

export interface PracticeSessionConfig {
  topicId: GrammarTopicId;
  difficulty: PracticeDifficulty;
  questionCount: PracticeQuestionCount;
  profileId: ProfileId;
}

export interface PlannedSessionItem {
  questionId: QuestionId;
}

export interface SessionPlan {
  config: PracticeSessionConfig;
  items: PlannedSessionItem[];
}

export interface SessionPlannerInput {
  topicId: GrammarTopicId;
  difficulty: PracticeDifficulty;
  questionCount: PracticeQuestionCount;
  progress: ProgressSnapshot;
}

export interface SessionPlanner {
  planSession(input: SessionPlannerInput): Promise<SessionPlan>;
}

export interface PracticeSession {
  id: PracticeSessionId;
  profileId: ProfileId;
  mode: PracticeMode;
  state: SessionState;
  topicId?: GrammarTopicId;
  difficulty?: PracticeDifficulty;
  requestedQuestionCount: number;
  selectedQuestionIds: QuestionId[];
  currentIndex: number;
  startedAt: IsoDateTimeString;
  completedAt?: IsoDateTimeString;
  abandonedAt?: IsoDateTimeString;
}

export interface SessionAnswer {
  questionId: QuestionId;
  selectedOptionId: string;
  result: AnswerResult;
  responseMs: number;
  answeredAt: IsoDateTimeString;
}

export interface SessionResultSummary {
  sessionId: PracticeSessionId;
  state: SessionState;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  durationMs: number;
}

export const SESSION_SELECTION_PRIORITY = [
  "unseen",
  "previously_wrong",
  "weak_skills",
  "due_reviews",
  "oldest_seen",
  "mastered_maintenance",
] as const;

