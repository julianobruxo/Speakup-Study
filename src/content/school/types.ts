// Conteúdo importado do app da escola (speakup-school-manager) e corrigido.
// Ainda NÃO está ligado à interface. Lista das correções: ./CORRECTIONS.md

export interface SchoolExample { english: string; portuguese: string }
export interface SchoolShortAnswer { question: string; yes: string; no: string }
export interface SchoolExtraSection { title: string; paragraphs: string[]; examples?: SchoolExample[] }
export interface SchoolGrammarTopic {
  id: string;
  title: string;
  summary: string;
  explanation: string[];
  uses: string[];
  pronouns?: { pronoun: string; form: string }[];
  structure: Record<string, string> | { lines: { label: string; text: string }[] };
  examples: { affirmative: SchoolExample[]; negative: SchoolExample[]; interrogative: SchoolExample[] };
  shortAnswers: SchoolShortAnswer[];
  commonMistake: { wrong: string; correct: string; note: string };
  extraSections?: SchoolExtraSection[];
  visualRules?: { preposition: string; translation: string; description: string; visualType: string; example: SchoolExample }[];
  spellingRules?: unknown;
}
export interface SchoolFlashcard { term: string; translation: string; visual?: string; imagePath?: string }
export interface SchoolVocabularySet { id: string; title: string; subtitle: string; items: SchoolFlashcard[] }
export interface SchoolIrregularVerb { base: string; past: string; participle: string; translation: string }
export interface SchoolAlphabetEntry { letter: string; pronunciation: string; example: string }
export interface SchoolNumberEntry { number: string; word: string }
