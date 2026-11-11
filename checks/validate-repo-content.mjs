import { readdirSync, readFileSync } from "node:fs";

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
const bodyParts = vocabularyCalls.filter(([, categoryId]) => categoryId === "body");
const vocabularyIds = vocabularyCalls.map(([id]) => id);

const expectedBodyParts = [
  ["body_head", "Head", "Cabeça", "head"],
  ["body_hair", "Hair", "Cabelo", "hair"],
  ["body_face", "Face", "Rosto", "face"],
  ["body_eye", "Eye", "Olho", "eye"],
  ["body_ear", "Ear", "Orelha", "ear"],
  ["body_nose", "Nose", "Nariz", "nose"],
  ["body_mouth", "Mouth", "Boca", "mouth"],
  ["body_teeth", "Teeth", "Dentes", "teeth"],
  ["body_tongue", "Tongue", "Língua", "tongue"],
  ["body_neck", "Neck", "Pescoço", "neck"],
  ["body_shoulder", "Shoulder", "Ombro", "shoulder"],
  ["body_arm", "Arm", "Braço", "arm"],
  ["body_elbow", "Elbow", "Cotovelo", "elbow"],
  ["body_hand", "Hand", "Mão", "hand"],
  ["body_finger", "Finger", "Dedo", "finger"],
  ["body_thumb", "Thumb", "Polegar", "thumb"],
  ["body_chest", "Chest", "Peito", "chest"],
  ["body_stomach", "Stomach", "Barriga", "stomach"],
  ["body_back", "Back", "Costas", "back"],
  ["body_leg", "Leg", "Perna", "leg"],
  ["body_knee", "Knee", "Joelho", "knee"],
  ["body_ankle", "Ankle", "Tornozelo", "ankle"],
  ["body_foot", "Foot", "Pé", "foot"],
  ["body_toe", "Toe", "Dedo do pé", "toe"],
];

assert(bodyParts.length === 24, `Expected 24 body parts, got ${bodyParts.length}`);
assert(
  JSON.stringify(
    bodyParts.map(([id, , term, translation, visualKey]) => [
      id,
      term,
      translation,
      visualKey,
    ]),
  ) === JSON.stringify(expectedBodyParts),
  "Body parts must preserve the required order, terms, translations, and visual keys",
);
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

validateBodyPhotoManifest(bodyParts.map(([, , , , visualKey]) => visualKey));

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
      bodyParts: bodyParts.length,
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

function validateBodyPhotoManifest(bodyVisualKeys) {
  assert(bodyVisualKeys.length === 24, `Expected 24 body visualKeys, got ${bodyVisualKeys.length}`);
  assertUnique(bodyVisualKeys, "body visualKey values");

  const manifestSource = readFileSync(
    "src/games/assets/bodyPhotoAssetManifest.ts",
    "utf8",
  );

  assert(
    !/^\s*import\s+.*review-board/m.test(manifestSource),
    "bodyPhotoAssetManifest.ts must not import review-board.webp",
  );

  const manifestObjectMatch = manifestSource.match(
    /BODY_PHOTO_ASSET_MANIFEST:\s*Record<BodyPhotoVisualKey,\s*string>\s*=\s*\{([\s\S]*?)\n\};/,
  );
  assert(manifestObjectMatch, "Could not locate BODY_PHOTO_ASSET_MANIFEST object literal");
  const manifestObjectKeys = [...manifestObjectMatch[1].matchAll(/^\s*([a-z]+),$/gm)].map(
    (match) => match[1],
  );
  assertUnique(manifestObjectKeys, "bodyPhotoAssetManifest declared keys");

  for (const visualKey of bodyVisualKeys) {
    assert(
      manifestSource.includes(`import ${visualKey} from`),
      `bodyPhotoAssetManifest.ts is missing an import for visualKey "${visualKey}"`,
    );
    assert(
      manifestObjectKeys.includes(visualKey),
      `bodyPhotoAssetManifest.ts does not expose "${visualKey}" in BODY_PHOTO_ASSET_MANIFEST`,
    );
  }
  assert(
    manifestObjectKeys.length === 24,
    `Expected exactly 24 keys in BODY_PHOTO_ASSET_MANIFEST, found ${manifestObjectKeys.length}`,
  );

  const assetDir = "src/assets/body-parts-photo-flashcards";
  const files = readdirSync(assetDir);
  const bodyPhotoFiles = files.filter((file) => file !== "review-board.webp");

  assert(
    files.includes("review-board.webp"),
    "review-board.webp must remain in the asset folder as comparison-only material",
  );
  assert(
    bodyPhotoFiles.length === 24,
    `Expected exactly 24 body photo files (excluding review-board.webp), found ${bodyPhotoFiles.length}`,
  );
  assert(
    bodyPhotoFiles.every((file) => file.endsWith(".webp")),
    "All body photo assets must use the .webp extension",
  );

  const expectedFileNames = bodyVisualKeys.map((visualKey) => `${visualKey}.webp`).sort();
  assert(
    JSON.stringify([...bodyPhotoFiles].sort()) === JSON.stringify(expectedFileNames),
    "Body photo file names must match the 24 visualKey values exactly",
  );
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

