import { getBodyEntries } from "./bodyVocabularyAdapter";
import { getErrorHuntQuestions, getSentenceBuilderQuestions, materializeSentence, toErrorHuntChallenge } from "./presentTobeAdapter";
import { BEAT_THE_CLOCK_TIMERS_MS } from "../core/roundConfig";
import { shuffleWithSeed } from "../core/shuffle";
import type { BeatTheClockChallenge } from "../core/challengeTypes";

function buildWordChallenges(seed: number): BeatTheClockChallenge[] {
  const entries = getBodyEntries();
  return entries.map((entry) => {
    const distractors = shuffleWithSeed(
      entries.filter((other) => other.id !== entry.id),
      seed + entry.id.length,
    ).slice(0, 2);
    const options = shuffleWithSeed(
      [entry.term, ...distractors.map((item) => item.term)],
      seed + entry.id.length + 3,
    );
    return {
      kind: "word_challenge",
      id: `beat_word:${entry.id}`,
      sourceEntryId: entry.id,
      timerMs: BEAT_THE_CLOCK_TIMERS_MS.word,
      term: entry.term,
      translation: entry.translation,
      options,
      correctOption: entry.term,
    };
  });
}

function buildSentenceTypingChallenges(): BeatTheClockChallenge[] {
  const questions = getSentenceBuilderQuestions();
  return questions.map((question) => ({
    kind: "sentence_typing",
    id: `beat_typing:${question.id}`,
    sourceQuestionId: question.id,
    timerMs: BEAT_THE_CLOCK_TIMERS_MS.sentenceTyping,
    prompt: question.question,
    correctAnswer: materializeSentence(question),
  }));
}

function buildSentenceUnscrambleChallenges(seed: number): BeatTheClockChallenge[] {
  const questions = getSentenceBuilderQuestions();
  return questions.map((question) => {
    const sentence = materializeSentence(question);
    const tokens = sentence.replace(/([.,!?;:])/g, " $1").split(/\s+/).filter(Boolean);
    return {
      kind: "sentence_builder",
      id: `beat_unscramble:${question.id}`,
      sourceQuestionId: question.id,
      timerMs: BEAT_THE_CLOCK_TIMERS_MS.sentenceUnscramble,
      tokens: shuffleWithSeed(tokens, seed),
      correctOrder: tokens,
      topicId: question.topicId,
    };
  });
}

function buildErrorHuntChallenges(): BeatTheClockChallenge[] {
  const questions = getErrorHuntQuestions();
  return questions
    .map((question) => toErrorHuntChallenge(question))
    .filter((challenge): challenge is NonNullable<typeof challenge> => challenge !== null)
    .map((challenge) => ({ ...challenge, timerMs: BEAT_THE_CLOCK_TIMERS_MS.errorHunt }));
}

/** Balanced mix of the four Contra o relógio challenge types, grammar-first per the confirmed catalog. */
export function buildBeatTheClockChallenges(seed: number): BeatTheClockChallenge[] {
  const pool = [
    ...buildWordChallenges(seed),
    ...buildSentenceTypingChallenges(),
    ...buildSentenceUnscrambleChallenges(seed),
    ...buildErrorHuntChallenges(),
  ];
  return shuffleWithSeed(pool, seed);
}
