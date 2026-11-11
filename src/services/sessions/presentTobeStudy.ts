import type { GrammarPracticeQuestion } from "../../content/model/content";

export type PresentTobeStudyCategory =
  | "form-selection"
  | "affirmative"
  | "negative"
  | "question"
  | "short-answer"
  | "word-order"
  | "contraction"
  | "subject-agreement";

export interface PresentTobeStudyContext {
  category: PresentTobeStudyCategory;
  categoryLabel: string;
  examples: [string, string];
  rule: string;
  subject?: string;
}

const CATEGORY_CONTENT: Record<
  PresentTobeStudyCategory,
  Omit<PresentTobeStudyContext, "category" | "subject">
> = {
  "form-selection": {
    categoryLabel: "Escolha entre am, is e are",
    rule:
      "A forma do verbo muda de acordo com o sujeito: I usa am; he, she e it usam is; you, we e they usam are.",
    examples: ["I am calm.", "They are at school."],
  },
  affirmative: {
    categoryLabel: "Frase afirmativa",
    rule:
      "Em afirmativas, o sujeito vem antes de am, is ou are. A concordância depende de quem ou do que a frase descreve.",
    examples: ["Laura is a teacher.", "The notebooks are new."],
  },
  negative: {
    categoryLabel: "Frase negativa",
    rule:
      "Para negar com o verbo TO BE, usamos not depois de am, is ou are. Também podemos usar isn't e aren't.",
    examples: ["I am not sleepy.", "The rooms aren't empty."],
  },
  question: {
    categoryLabel: "Pergunta",
    rule:
      "Em perguntas, am, is ou are vem antes do sujeito. Palavras como why, where e how aparecem antes do verbo.",
    examples: ["Is your cousin here?", "Where are the tickets?"],
  },
  "short-answer": {
    categoryLabel: "Resposta curta",
    rule:
      "A resposta curta repete a forma de TO BE que concorda com o pronome: Yes, she is; No, they aren't.",
    examples: ["Is Leo ready? Yes, he is.", "Are the lights on? No, they aren't."],
  },
  "word-order": {
    categoryLabel: "Ordem das palavras",
    rule:
      "Observe cada sujeito e cada espaço separadamente. Em perguntas, o verbo vem antes do sujeito; em afirmativas, vem depois.",
    examples: ["Is this chair free?", "The keys are here, but the bag is outside."],
  },
  contraction: {
    categoryLabel: "Contração",
    rule:
      "Contrações unem o sujeito ou a negativa ao verbo: she's significa she is, isn't significa is not e aren't significa are not.",
    examples: ["We're ready.", "The store isn't open."],
  },
  "subject-agreement": {
    categoryLabel: "Concordância com o sujeito",
    rule:
      "Identifique o núcleo do sujeito. Um substantivo singular normalmente usa is; um plural normalmente usa are.",
    examples: ["The classroom is quiet.", "My cousins are busy."],
  },
};

export function getPresentTobeStudyContext(
  question: GrammarPracticeQuestion,
  selectedAnswer: string,
): PresentTobeStudyContext {
  const category = classifyQuestion(question, selectedAnswer);
  return {
    category,
    ...CATEGORY_CONTENT[category],
    subject: findApparentSubject(question.question),
  };
}

function classifyQuestion(
  question: GrammarPracticeQuestion,
  selectedAnswer: string,
): PresentTobeStudyCategory {
  const prompt = question.question;
  const answers = [...question.options, question.correctAnswer, selectedAnswer];

  if (/\?\s*(yes|no),/i.test(prompt)) return "short-answer";
  if (answers.some((answer) => /['’]/.test(answer))) return "contraction";
  if (
    /\bnot\b/i.test(prompt) ||
    answers.some((answer) => /\b(?:am not|isn't|aren't)\b/i.test(answer))
  ) {
    return "negative";
  }
  if ((prompt.match(/___/g) ?? []).length > 1 || question.correctAnswer.includes("/")) {
    return "word-order";
  }
  if (prompt.includes("?")) return "question";
  if (
    /^(I|he|she|it|you|we|they)\s+___/i.test(prompt) &&
    question.options.every((answer) => /^(?:am|is|are)$/i.test(answer))
  ) {
    return "form-selection";
  }
  if (prompt.includes("___")) return "affirmative";
  return "subject-agreement";
}

function findApparentSubject(prompt: string): string | undefined {
  const shortAnswerSubject = prompt.match(/,\s*([A-Za-z]+)\s+___/);
  if (shortAnswerSubject) return shortAnswerSubject[1];

  const [beforeBlank = "", afterBlank = ""] = prompt.split("___");
  const before = beforeBlank
    .replace(/^(why|where|how old|how much)\s*$/i, "")
    .trim();
  if (before) {
    const clause = before.split(/[;,.?]/).at(-1)?.trim();
    if (clause && clause.split(/\s+/).length <= 7) return clause;
  }

  const after = afterBlank
    .replace(/^[\s"'“”]+/, "")
    .split(/[?;,.]/)[0]
    .trim();
  if (!after) return undefined;

  const words = after.split(/\s+/);
  if (/^(I|he|she|it|you|we|they)$/i.test(words[0])) return words[0];

  if (
    /^(a|an|the|this|that|these|those|my|your|our|his|her|its|their)$/i.test(
      words[0],
    )
  ) {
    if (words[2]?.toLowerCase() === "and" && words[3]) {
      return words.slice(0, 4).join(" ");
    }
    if (words[1]) return words.slice(0, 2).join(" ");
  }

  return /^[A-Z][A-Za-z'’]*$/.test(words[0]) ? words[0] : undefined;
}

