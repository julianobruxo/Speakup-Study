export type BookId = "intro";

export type BookSvgVariant =
  | "greeting"
  | "school"
  | "globe"
  | "clothing"
  | "transport"
  | "home"
  | "briefcase"
  | "food"
  | "sport"
  | "calendar"
  | "health"
  | "place"
  | "weekend"
  | "subject";

export interface BookVocabularyItem {
  id: string;
  en: string;
  pt: string;
  clipartUrl?: string;
  imageUrl?: string;
  svgVariant: BookSvgVariant;
  emoji: string;
}

export interface BookVocabularySet {
  id: string;
  title: string;
  subtitle: string;
  items: BookVocabularyItem[];
}

export type BookGrammarMode =
  | "fill_in_gaps"
  | "multiple_choice"
  | "word_scramble";

export interface BookGrammarExample {
  en: string;
  pt: string;
}

export interface BookFillInGapItem {
  id: string;
  sentence: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface BookMultipleChoiceItem {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface BookWordScrambleItem {
  id: string;
  target: string;
  tokens: string[];
  ptCue: string;
  explanation: string;
}

export interface BookGrammarTopic {
  id: string;
  order: number;
  title: string;
  summary: string;
  explanation: string[];
  examples: BookGrammarExample[];
  fill_in_gaps: BookFillInGapItem[];
  multiple_choice: BookMultipleChoiceItem[];
  word_scramble: BookWordScrambleItem[];
}

export interface BookDefinition {
  id: BookId;
  title: string;
  subtitle: string;
  grammarTopics: BookGrammarTopic[];
  vocabularySets: BookVocabularySet[];
}
