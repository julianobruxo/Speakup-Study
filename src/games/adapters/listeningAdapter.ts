import { getBodyEntries } from "./bodyVocabularyAdapter";
import { getSentenceBuilderQuestions, materializeSentence } from "./presentTobeAdapter";
import type { ListeningChallenge, ListeningMode } from "../core/challengeTypes";
import { shuffleWithSeed } from "../core/shuffle";

function buildSelectImageChallenges(seed: number): ListeningChallenge[] {
  const entries = getBodyEntries();
  return entries.map((entry) => {
    const distractors = shuffleWithSeed(
      entries.filter((other) => other.id !== entry.id),
      seed + entry.id.length,
    ).slice(0, 3);
    const options = shuffleWithSeed(
      [entry, ...distractors].map((item) => ({
        visualKey: item.visualKey ?? item.id,
        label: item.translation,
      })),
      seed + entry.id.length + 1,
    );
    return {
      kind: "listening",
      id: `listening:select-image:${entry.id}`,
      sourceEntryId: entry.id,
      mode: "select-image" as ListeningMode,
      audioText: entry.term,
      visualKey: entry.visualKey ?? entry.id,
      imageOptions: options,
    };
  });
}

function buildTypeWordChallenges(): ListeningChallenge[] {
  const entries = getBodyEntries();
  return entries.map((entry) => ({
    kind: "listening",
    id: `listening:type-word:${entry.id}`,
    sourceEntryId: entry.id,
    mode: "type-word" as ListeningMode,
    audioText: entry.term,
    expectedWord: entry.term,
  }));
}

function buildAssembleSentenceChallenges(): ListeningChallenge[] {
  const questions = getSentenceBuilderQuestions();
  return questions.map((question) => {
    const sentence = materializeSentence(question);
    const tokens = sentence.replace(/([.,!?;:])/g, " $1").split(/\s+/).filter(Boolean);
    return {
      kind: "listening",
      id: `listening:assemble-sentence:${question.id}`,
      sourceQuestionId: question.id,
      mode: "assemble-sentence" as ListeningMode,
      audioText: sentence,
      tokens,
      correctOrder: tokens,
    };
  });
}

/** Mixes all three confirmed listening modes into one deterministic pool. */
export function buildListeningChallenges(seed: number): ListeningChallenge[] {
  const pool = [
    ...buildSelectImageChallenges(seed),
    ...buildTypeWordChallenges(),
    ...buildAssembleSentenceChallenges(),
  ];
  return shuffleWithSeed(pool, seed);
}
