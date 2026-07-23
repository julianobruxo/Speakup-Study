import type {
  AvailabilityStatus,
  CurriculumLevel,
  GrammarTopicId,
  PracticeDifficulty,
  QuestionId,
  VocabularyCategoryId,
  VocabularyEntryId,
  VocabularyGroupId,
} from "../../shared/types/domain";

export type MvpGrammarDifficulty = Extract<
  PracticeDifficulty,
  "easy" | "medium"
>;

export interface GrammarQuestionTargets {
  easy: number;
  medium: number;
}

export interface GrammarTopic {
  id: GrammarTopicId;
  title: string;
  sequence: number;
  entryLevel: CurriculumLevel;
  availableDifficulties: MvpGrammarDifficulty[];
  questionTargets: GrammarQuestionTargets;
  availabilityStatus: AvailabilityStatus;
  description?: string;
}

export interface PedagogicalFeedback {
  correct: string;
  incorrect: string;
  ruleReference?: string;
}

export interface AnswerOption {
  id: string;
  text: string;
}

export interface GrammarQuestion {
  id: QuestionId;
  topicId: GrammarTopicId;
  difficulty: PracticeDifficulty;
  prompt: string;
  options: AnswerOption[];
  correctOptionId: string;
  feedback: PedagogicalFeedback;
  grammarTarget: string;
  availabilityStatus: AvailabilityStatus;
  commonError?: string;
  tags?: string[];
}

export interface GrammarPracticeQuestion {
  id: QuestionId;
  topicId: GrammarTopicId;
  difficulty: MvpGrammarDifficulty;
  question: string;
  options: [string, string, string];
  correctAnswer: string;
  feedback: string;
}

export interface VocabularyCategory {
  id: VocabularyCategoryId;
  groupId: VocabularyGroupId;
  title: string;
  availabilityStatus: AvailabilityStatus;
  description?: string;
}

export interface VocabularyGroup {
  id: VocabularyGroupId;
  title: string;
  availabilityStatus: AvailabilityStatus;
  categories: VocabularyCategoryId[];
}

export interface VocabularyEntry {
  id: VocabularyEntryId;
  categoryId: VocabularyCategoryId;
  term: string;
  translation: string;
  availabilityStatus: AvailabilityStatus;
  curriculumLevel?: CurriculumLevel;
  exampleSentence?: string;
  exampleTranslation?: string;
  audioRef?: string;
  tags?: string[];
}

export type IrregularVerbPracticeMode =
  | "base-to-past"
  | "base-to-participle"
  | "past-to-base"
  | "participle-to-base"
  | "verb-to-translation"
  | "translation-to-verb"
  | "mixed";

export interface IrregularVerbEntry {
  id: VocabularyEntryId;
  baseForm: string;
  simplePast: string;
  pastParticiple: string;
  translation: string;
}
