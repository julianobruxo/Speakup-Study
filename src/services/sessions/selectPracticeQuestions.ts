import type { GrammarPracticeQuestion } from "../../content/model/content";
import type {
  MvpGrammarDifficulty,
} from "../../content/model/content";
import type { QuestionProgress } from "../progress/progress";

export function selectPracticeQuestions(
  questions: GrammarPracticeQuestion[],
  difficulty: MvpGrammarDifficulty,
  count: number,
  seed: number,
  progress: QuestionProgress[] = [],
): GrammarPracticeQuestion[] {
  const pool = questions.filter(
    (question) =>
      question.topicId === "present_tobe" &&
      question.difficulty === difficulty,
  );

  if (pool.length < count) {
    throw new Error("Não há perguntas suficientes para esta sessão.");
  }

  const progressByQuestion = new Map(
    progress.map((item) => [item.questionId, item]),
  );
  const unseen = pool.filter((question) => !progressByQuestion.has(question.id));
  const wrong = pool.filter(
    (question) => progressByQuestion.get(question.id)?.lastResult === false,
  );
  const seen = pool.filter((question) => {
    const item = progressByQuestion.get(question.id);
    return item && item.lastResult;
  });

  const oldestSeen = shuffleWithSeed(seen, seed + 2).sort((left, right) => {
    const leftDate = progressByQuestion.get(left.id)?.lastSeenAt ?? "";
    const rightDate = progressByQuestion.get(right.id)?.lastSeenAt ?? "";
    return leftDate.localeCompare(rightDate);
  });

  return [
    ...shuffleWithSeed(unseen, seed),
    ...shuffleWithSeed(wrong, seed + 1),
    ...oldestSeen,
  ].slice(0, count);
}

export function shuffleOptions(
  options: readonly string[],
  seed: number,
): string[] {
  return shuffleWithSeed([...options], seed);
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const result = [...items];
  const random = mulberry32(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const next = Math.floor(random() * (index + 1));
    [result[index], result[next]] = [result[next], result[index]];
  }
  return result;
}

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
