import { PRESENT_TOBE_QUESTIONS } from "../../content/data/presentTobeQuestions";
import type { GrammarPracticeQuestion } from "../../content/model/content";
import type { ErrorHuntChallenge, SentenceBuilderChallenge } from "../core/challengeTypes";

/**
 * Questions whose correct answer is a two-clause short-answer fragment
 * (e.g. "Is Ana at home? Yes, she ___.") are excluded from Sentence Builder
 * and Error Hunt: reordering or corrupting a one-word answer clause produces
 * either an ambiguous word bank or a change that reads as a typo rather than
 * a clear grammar error. Confirmed by inventory: 13 of 130 questions.
 */
function isShortAnswerFragment(question: GrammarPracticeQuestion): boolean {
  return /^(Yes|No),/.test(question.question.trim()) || /\?\s*(Yes|No),/.test(question.question);
}

function splitAnswers(correctAnswer: string): string[] {
  return correctAnswer.split(" / ").map((part) => part.trim());
}

/** Replaces each ___ with its ordered answer, preserving punctuation/casing/contractions. */
export function materializeSentence(question: GrammarPracticeQuestion): string {
  const answers = splitAnswers(question.correctAnswer);
  let index = 0;
  return question.question.replace(/___/g, () => {
    const answer = answers[index] ?? answers[answers.length - 1];
    index += 1;
    return answer;
  });
}

function tokenize(sentence: string): string[] {
  return sentence
    .replace(/([.,!?;:])/g, " $1")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * A tokenized sentence is ambiguous for reordering when it contains repeated
 * non-trivial tokens (same word appearing twice) — the learner could produce
 * a different, still-grammatical arrangement. Punctuation and short function
 * words that legitimately repeat (a, the, is) are tolerated only when the
 * sentence has no other structural risk; here we reject exact reorderable
 * duplicates involving content words (length > 3) to be conservative.
 */
function hasAmbiguousOrdering(tokens: string[]): boolean {
  const contentTokens = tokens.filter((token) => /[a-zA-Z]/.test(token) && token.length > 3);
  const seen = new Set<string>();
  for (const token of contentTokens) {
    const normalized = token.toLowerCase();
    if (seen.has(normalized)) return true;
    seen.add(normalized);
  }
  return false;
}

/**
 * Returns only questions that are actually playable as Sentence Builder
 * challenges: excludes short-answer fragments and questions whose
 * materialized sentence has ambiguous reorderings (e.g. a repeated content
 * word). Selecting a round from this pool guarantees `toSentenceBuilderChallenge`
 * never returns null for a chosen item, so a round never silently shrinks
 * below its configured size.
 */
export function getSentenceBuilderQuestions(): GrammarPracticeQuestion[] {
  return PRESENT_TOBE_QUESTIONS.filter(
    (question) => !isShortAnswerFragment(question) && !hasAmbiguousOrdering(tokenize(materializeSentence(question))),
  );
}

export function toSentenceBuilderChallenge(
  question: GrammarPracticeQuestion,
): SentenceBuilderChallenge | null {
  const materialized = materializeSentence(question);
  const tokens = tokenize(materialized);
  if (hasAmbiguousOrdering(tokens)) return null;

  return {
    kind: "sentence_builder",
    id: `sentence_builder:${question.id}`,
    sourceQuestionId: question.id,
    tokens,
    correctOrder: tokens,
    topicId: question.topicId,
  };
}

/**
 * Builds an Error Hunt challenge by materializing the correct sentence and
 * substituting exactly one blank's correct answer with a reviewed distractor
 * from the question's own options — never a randomly generated error.
 * Returns null when the distractor's token count differs from the correct
 * answer's (e.g. "am not" vs "isn't"), since that would corrupt more than
 * one token or produce an unequal-length sentence instead of a single error.
 */
export function toErrorHuntChallenge(question: GrammarPracticeQuestion): ErrorHuntChallenge | null {
  const answers = splitAnswers(question.correctAnswer);
  const distractor = question.options.find((option) => option !== question.correctAnswer);
  if (!distractor) return null;

  // For multi-blank questions, corrupt only the first blank to guarantee a single target error.
  const corruptedAnswers = [...answers];
  const blankCount = (question.question.match(/___/g) || []).length;
  const distractorForFirstBlank =
    blankCount > 1 && distractor.includes(" / ")
      ? distractor.split(" / ")[0].trim()
      : distractor;
  corruptedAnswers[0] = distractorForFirstBlank;

  let blankIndex = 0;
  const corruptedSentence = question.question.replace(/___/g, () => {
    const value = corruptedAnswers[blankIndex] ?? corruptedAnswers[corruptedAnswers.length - 1];
    blankIndex += 1;
    return value;
  });

  const correctSentence = materializeSentence(question);
  const correctTokens = tokenize(correctSentence);
  const corruptedTokens = tokenize(corruptedSentence);
  if (correctTokens.length !== corruptedTokens.length) return null;

  const errorTokenIndex = corruptedTokens.findIndex(
    (token, index) => token.toLowerCase() !== correctTokens[index].toLowerCase(),
  );
  if (errorTokenIndex === -1) return null;

  return {
    kind: "error_hunt",
    id: `error_hunt:${question.id}`,
    sourceQuestionId: question.id,
    displayTokens: corruptedTokens,
    errorTokenIndex,
    correctToken: correctTokens[errorTokenIndex],
    topicId: question.topicId,
  };
}

/**
 * Returns only questions that are actually playable as Error Hunt challenges:
 * excludes short-answer fragments and questions whose only distractor has a
 * different token count than the correct answer (e.g. "am not" vs "isn't"),
 * which `toErrorHuntChallenge` rejects. Selecting a round from this pool
 * guarantees the challenge builder never returns null for a chosen item.
 */
export function getErrorHuntQuestions(): GrammarPracticeQuestion[] {
  return PRESENT_TOBE_QUESTIONS.filter(
    (question) => !isShortAnswerFragment(question) && toErrorHuntChallenge(question) !== null,
  );
}
