import type { BookDefinition } from "./types.ts";
import { INTRO_GRAMMAR_TOPICS, getIntroGrammarTopic } from "./grammar.ts";
import { INTRO_VOCABULARY_SETS, getIntroVocabularySet } from "./vocabulary.ts";

export const LIVRO_INTRO: BookDefinition = {
  id: "intro",
  title: "Livro Intro",
  subtitle: "Interchange Intro — gramatica e vocabulario",
  grammarTopics: INTRO_GRAMMAR_TOPICS,
  vocabularySets: INTRO_VOCABULARY_SETS,
};

export {
  INTRO_GRAMMAR_TOPICS,
  INTRO_VOCABULARY_SETS,
  getIntroGrammarTopic,
  getIntroVocabularySet,
};
export type {
  BookDefinition,
  BookFillInGapItem,
  BookGrammarExample,
  BookGrammarMode,
  BookGrammarTopic,
  BookId,
  BookMultipleChoiceItem,
  BookSvgVariant,
  BookVocabularyItem,
  BookVocabularySet,
  BookWordScrambleItem,
} from "./types.ts";
