import type { GrammarTopicId, VocabularyEntryId } from "../../shared/types/domain";

export type ChallengeSourceId = string;

interface BaseChallenge {
  id: ChallengeSourceId;
  sourceQuestionId?: string;
  sourceEntryId?: VocabularyEntryId;
}

/** Monte a frase: reorder tokens to reconstruct the canonical sentence. */
export interface SentenceBuilderChallenge extends BaseChallenge {
  kind: "sentence_builder";
  tokens: string[];
  correctOrder: string[];
  topicId: GrammarTopicId;
}

/** Caça ao erro: exactly one token in the sentence is wrong; the learner taps it. */
export interface ErrorHuntChallenge extends BaseChallenge {
  kind: "error_hunt";
  displayTokens: string[];
  errorTokenIndex: number;
  correctToken: string;
  topicId: GrammarTopicId;
}

/** Cada coisa no seu lugar: move a vocabulary word card into its matching image slot. */
export interface SortingChallenge extends BaseChallenge {
  kind: "sorting";
  term: string;
  translation: string;
  visualKey?: string;
  targetId: string;
}

/** Palavra secreta: Hangman with a Portuguese clue and an English answer. */
export interface SecretWordChallenge extends BaseChallenge {
  kind: "secret_word";
  answer: string;
  clue: string;
}

/** Conectando: match an English word to its image. */
export interface MatchingPairChallenge extends BaseChallenge {
  kind: "matching_pair";
  term: string;
  translation: string;
  visualKey?: string;
}

/** Cruzando palavras: one entry placed on the generated crossword grid. */
export interface CrosswordEntryChallenge extends BaseChallenge {
  kind: "crossword_entry";
  answer: string;
  clue: string;
}

/** Par perfeito: memory-match card pair (word card + image card). */
export interface MemoryMatchChallenge extends BaseChallenge {
  kind: "memory_match";
  term: string;
  translation: string;
  visualKey?: string;
}

export type ListeningMode = "select-image" | "type-word" | "assemble-sentence";

/** Ouvido afiado: listen and respond in one of three confirmed modes. */
export interface ListeningChallenge extends BaseChallenge {
  kind: "listening";
  mode: ListeningMode;
  audioText: string;
  // select-image
  visualKey?: string;
  imageOptions?: { visualKey: string; label: string }[];
  // type-word
  expectedWord?: string;
  // assemble-sentence
  tokens?: string[];
  correctOrder?: string[];
}

export type BeatTheClockChallenge =
  | (SentenceBuilderChallenge & { timerMs: number })
  | (ErrorHuntChallenge & { timerMs: number })
  | (ListeningChallenge & { timerMs: number })
  | ({ kind: "word_challenge"; timerMs: number } & BaseChallenge & {
        term: string;
        translation: string;
        options: string[];
        correctOption: string;
      })
  | ({ kind: "sentence_typing"; timerMs: number } & BaseChallenge & {
        prompt: string;
        correctAnswer: string;
      });

export type GameChallenge =
  | SentenceBuilderChallenge
  | ErrorHuntChallenge
  | SortingChallenge
  | SecretWordChallenge
  | MatchingPairChallenge
  | CrosswordEntryChallenge
  | MemoryMatchChallenge
  | ListeningChallenge;
