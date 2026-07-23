import { readFileSync } from "node:fs";

const vocabularyCalls = parseDataCalls(
  "src/content/data/vocabulary.ts",
  "vocabularyEntry",
).map(splitArgs);

const questionCalls = parseDataCalls(
  "src/content/data/presentTobeQuestions.ts",
  "q",
).map(splitArgs);

const actionVerbs = vocabularyCalls.filter(
  ([, categoryId]) => categoryId === "action_verbs",
);
const routineVerbs = vocabularyCalls.filter(
  ([, categoryId]) => categoryId === "routine_verbs",
);
const vocabularyIds = vocabularyCalls.map(([id]) => id);

assert(actionVerbs.length === 10, `Expected 10 Action Verbs, got ${actionVerbs.length}`);
assert(routineVerbs.length === 10, `Expected 10 Routine Verbs, got ${routineVerbs.length}`);
assertUnique(vocabularyIds, "vocabulary IDs");
assert(
  [...actionVerbs, ...routineVerbs].every((entry) => entry.every(Boolean)),
  "Action/Routine entries must not contain empty fields",
);
assertUnique(
  actionVerbs.map(([, , term]) => term.toLowerCase()),
  "Action Verb terms",
);
assertUnique(
  routineVerbs.map(([, , term]) => term.toLowerCase()),
  "Routine Verb terms",
);

const questions = questionCalls.map(
  ([id, difficulty, question, options, correctAnswer, feedback]) => ({
    id,
    topicId: "present_tobe",
    difficulty,
    question,
    options,
    correctAnswer,
    feedback,
  }),
);

assert(questions.length === 130, `Expected 130 Present TO BE questions, got ${questions.length}`);
assert(
  questions.filter((question) => question.difficulty === "easy").length === 50,
  "Expected exactly 50 easy questions",
);
assert(
  questions.filter((question) => question.difficulty === "medium").length === 80,
  "Expected exactly 80 medium questions",
);
assert(
  questions.every((question) => question.topicId === "present_tobe"),
  "All questions must use topicId present_tobe",
);
assert(
  questions.every((question) => ["easy", "medium"].includes(question.difficulty)),
  "Questions must only use easy or medium",
);
assert(
  questions.every((question) => /^present_tobe_(easy|medium)_\d{3}$/.test(question.id)),
  "Question IDs must follow present_tobe_{difficulty}_000",
);
assertUnique(
  questions.map((question) => question.id),
  "question IDs",
);
assert(
  questions.every(
    (question) => question.question && question.correctAnswer && question.feedback,
  ),
  "Question, correctAnswer, and feedback must not be empty",
);
assert(
  questions.every((question) => question.question.includes("___")),
  "Every question must contain the ___ placeholder",
);
assert(
  questions.every(
    (question) => Array.isArray(question.options) && question.options.length === 3,
  ),
  "Every question must have exactly 3 options",
);
questions.forEach((question) => {
  assertUnique(question.options, `options for ${question.id}`);
  assert(
    question.options.includes(question.correctAnswer),
    `correctAnswer missing from options for ${question.id}`,
  );
});
assertUnique(
  questions.map((question) => normalizeQuestion(question.question)),
  "normalized question text",
);
assert(
  questions.every(
    (question) =>
      !/Multitec|roleta|ranking|lead|75%|___ n't|gonna|wanna|gotta/i.test(
        `${question.question} ${question.feedback}`,
      ),
  ),
  "Questions must not contain forbidden mechanics or broken contractions",
);

console.log(
  JSON.stringify(
    {
      actionVerbs: actionVerbs.length,
      routineVerbs: routineVerbs.length,
      totalVocabulary: vocabularyCalls.length,
      presentTobeQuestions: questions.length,
      easy: 50,
      medium: 80,
    },
    null,
    2,
  ),
);

function parseDataCalls(filePath, functionName) {
  const text = readFileSync(filePath, "utf8");
  const marker = `${functionName}(`;
  const starts = [];
  let index = 0;

  while ((index = text.indexOf(marker, index)) !== -1) {
    let cursor = index + marker.length;
    while (/\s/.test(text[cursor])) {
      cursor += 1;
    }
    if (text[cursor] === "\"") {
      starts.push(index);
    }
    index += marker.length;
  }

  return starts.map((start) => {
    let depth = 1;
    let inString = false;
    let escape = false;

    for (let index = start + marker.length; index < text.length; index += 1) {
      const character = text[index];

      if (inString) {
        if (escape) {
          escape = false;
        } else if (character === "\\") {
          escape = true;
        } else if (character === "\"") {
          inString = false;
        }
        continue;
      }

      if (character === "\"") {
        inString = true;
      } else if (character === "(") {
        depth += 1;
      } else if (character === ")") {
        depth -= 1;
        if (depth === 0) {
          return text.slice(start, index + 1);
        }
      }
    }

    throw new Error(`Unterminated ${functionName} call in ${filePath}`);
  });
}

function splitArgs(call) {
  const inside = call.slice(call.indexOf("(") + 1, -1);
  const args = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let index = 0; index < inside.length; index += 1) {
    const character = inside[index];

    if (inString) {
      current += character;
      if (escape) {
        escape = false;
      } else if (character === "\\") {
        escape = true;
      } else if (character === "\"") {
        inString = false;
      }
      continue;
    }

    if (character === "\"") {
      inString = true;
      current += character;
    } else if (character === "[") {
      depth += 1;
      current += character;
    } else if (character === "]") {
      depth -= 1;
      current += character;
    } else if (character === "," && depth === 0) {
      args.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  if (current.trim()) {
    args.push(current.trim());
  }

  return args.map((arg) => Function(`return (${arg})`)());
}

function normalizeQuestion(question) {
  return question
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”"'.,!?;:—–-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertUnique(values, label) {
  assert(new Set(values).size === values.length, `Duplicate ${label}`);
}
