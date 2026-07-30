import { getBodyEntries } from "./bodyVocabularyAdapter.ts";
import { getSentenceBuilderQuestions, materializeSentence } from "./presentTobeAdapter.ts";
import type { ListeningChallenge, ListeningMode } from "../core/challengeTypes";
import { selectChallenges } from "../core/selectChallenges.ts";
import { shuffleWithSeed } from "../core/shuffle.ts";

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

/** Builds a deterministic round containing all three confirmed modes when count permits. */
export function buildListeningChallenges(seed: number, count = 10): ListeningChallenge[] {
  const groups = [
    buildSelectImageChallenges(seed),
    buildTypeWordChallenges(),
    buildAssembleSentenceChallenges(),
  ];
  const safeCount = Math.max(0, Math.trunc(count));
  const guaranteed = groups
    .slice(0, Math.min(safeCount, groups.length))
    .map((group, index) => selectChallenges(group, 1, seed + index * 103)[0])
    .filter((challenge): challenge is ListeningChallenge => Boolean(challenge));
  const guaranteedIds = new Set(guaranteed.map((challenge) => challenge.id));
  const remaining = groups.flat().filter((challenge) => !guaranteedIds.has(challenge.id));
  const extras = selectChallenges(remaining, safeCount - guaranteed.length, seed + 919);
  return shuffleWithSeed([...guaranteed, ...extras], seed + 983);
}
