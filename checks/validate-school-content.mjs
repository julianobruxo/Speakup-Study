import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import vm from "node:vm";
import { SCHOOL_GRAMMAR_TOPICS } from "../src/content/school/grammarTopics.ts";
import { SCHOOL_VOCABULARY_SETS } from "../src/content/school/vocabularySets.ts";
import { SCHOOL_ACTION_VERBS } from "../src/content/school/actionVerbs.ts";
import { SCHOOL_IRREGULAR_VERBS } from "../src/content/school/irregularVerbs.ts";
import { SCHOOL_ALPHABET } from "../src/content/school/alphabet.ts";
import { SCHOOL_NUMBERS } from "../src/content/school/numbers.ts";
import { IRREGULAR_VERBS } from "../src/content/data/irregularVerbs.ts";

// 1. Grammar topics: completeness, validity, uniqueness, consistency, review gate
assert.equal(SCHOOL_GRAMMAR_TOPICS.length, 10, "Expected 10 school grammar topics");
const grammarIds = new Set();
for (const topic of SCHOOL_GRAMMAR_TOPICS) {
  assert(topic.id && topic.title && topic.summary, `Incomplete grammar topic: ${topic.id}`);
  assert(!grammarIds.has(topic.id), `Duplicate grammar topic id: ${topic.id}`);
  grammarIds.add(topic.id);
  assert(topic.explanation.length > 0, `Missing explanation in ${topic.id}`);
  assert(topic.examples.affirmative.length > 0, `Missing affirmative examples in ${topic.id}`);
  assert(topic.examples.negative.length > 0, `Missing negative examples in ${topic.id}`);
  assert(topic.examples.interrogative.length > 0, `Missing interrogative examples in ${topic.id}`);
  assert(
    topic.commonMistake?.wrong && topic.commonMistake?.correct,
    `Incomplete commonMistake in ${topic.id}`,
  );
  const serialized = JSON.stringify(topic);
  assert(!serialized.includes("\u2019"), `Curly apostrophe found in school grammar topic ${topic.id}`);
}

// Verify teacher-approved `there-is-there-are` refinements & un-gated student exposure
const thereTopic = SCHOOL_GRAMMAR_TOPICS.find((t) => t.id === "there-is-there-are");
assert(thereTopic, "Missing there-is-there-are school grammar topic");
const thereSerialized = JSON.stringify(thereTopic);
assert(
  thereSerialized.includes("There are a lot of people at the bus stop."),
  "there-is-there-are must use US-natural 'a lot of people' example",
);
assert(
  !thereSerialized.includes("in the garden"),
  "there-is-there-are must use US 'in the backyard' instead of 'in the garden'",
);
assert(
  typeof thereTopic.structure === "object" &&
    "affirmative" in thereTopic.structure &&
    thereTopic.structure.affirmative.includes("uncountable"),
  "there-is-there-are structure.affirmative must cover uncountables",
);

const schoolPageSource = readFileSync("src/pages/SchoolStudyPage.tsx", "utf8");
assert(
  !schoolPageSource.includes("TEACHER_REVIEW_PENDING_IDS"),
  "SchoolStudyPage must expose all 10 approved grammar topics after teacher review",
);
assert(
  /SCHOOL_GRAMMAR_TOPICS\.map\(/.test(schoolPageSource),
  "SchoolStudyPage must render all SCHOOL_GRAMMAR_TOPICS",
);

// 2. Vocabulary sets: completeness, uniqueness, valid image paths
assert.equal(SCHOOL_VOCABULARY_SETS.length, 10, "Expected 10 school vocabulary sets");
const vocabSetIds = new Set();
let totalVocabItems = 0;
let vocabWithImages = 0;
for (const set of SCHOOL_VOCABULARY_SETS) {
  assert(set.id && set.title && set.items.length > 0, `Invalid vocabulary set: ${set.id}`);
  assert(!vocabSetIds.has(set.id), `Duplicate vocabulary set id: ${set.id}`);
  vocabSetIds.add(set.id);
  const termsInSet = new Set();
  for (const item of set.items) {
    assert(item.term && item.translation, `Incomplete vocab item in ${set.id}`);
    const key = item.term.toLowerCase();
    assert(!termsInSet.has(key), `Duplicate term "${item.term}" in set ${set.id}`);
    termsInSet.add(key);
    if (item.imagePath) {
      assert(
        existsSync(`public${item.imagePath}`),
        `Missing image asset for ${set.id}/${item.term}: public${item.imagePath}`,
      );
      vocabWithImages += 1;
    }
    totalVocabItems += 1;
  }
}
assert.equal(totalVocabItems, 229, `Expected 229 school vocabulary items, got ${totalVocabItems}`);

// 3. Action verbs: 50 unique entries with valid image paths
assert.equal(SCHOOL_ACTION_VERBS.length, 50, "Expected 50 school action verbs");
const actionVerbTerms = new Set();
for (const verb of SCHOOL_ACTION_VERBS) {
  assert(verb.term && verb.translation, `Incomplete action verb: ${JSON.stringify(verb)}`);
  const key = verb.term.toLowerCase();
  assert(!actionVerbTerms.has(key), `Duplicate action verb: ${verb.term}`);
  actionVerbTerms.add(key);
  if (verb.imagePath) {
    assert(existsSync(`public${verb.imagePath}`), `Missing action verb image: public${verb.imagePath}`);
  }
}

// 4. Canonical irregular verbs consistency across data/, school/, and public/past/verbs.js
const pastCtx = vm.createContext({});
vm.runInContext(
  `${readFileSync("public/past/verbs.js", "utf8")};globalThis.VERBS=VERBS;`,
  pastCtx,
);
const pastVerbs = pastCtx.VERBS;
const pastBases = Array.from(pastVerbs, (v) => v.base);
assert.equal(pastBases.length, 104, "Expected 104 verbs in public/past/verbs.js");
assert.equal(IRREGULAR_VERBS.length, 104, "Expected 104 canonical verbs in src/content/data/irregularVerbs.ts");
assert.equal(SCHOOL_IRREGULAR_VERBS.length, 104, "Expected 104 canonical verbs in src/content/school/irregularVerbs.ts");
assert.deepEqual(
  IRREGULAR_VERBS.map((v) => v.baseForm),
  pastBases,
  "src/content/data/irregularVerbs.ts must match public/past/verbs.js exactly",
);
assert.deepEqual(
  SCHOOL_IRREGULAR_VERBS.map((v) => v.base),
  pastBases,
  "src/content/school/irregularVerbs.ts must match public/past/verbs.js exactly",
);

// 5. Alphabet & Numbers
assert.equal(SCHOOL_ALPHABET.length, 26, "Expected 26 alphabet entries");
assert.equal(new Set(SCHOOL_ALPHABET.map((a) => a.letter)).size, 26, "Alphabet letters must be unique");
const numberRanges = Object.keys(SCHOOL_NUMBERS);
assert.deepEqual(numberRanges, ["zeroToTwenty", "twentyToOneHundred", "hundredToTwoThousand"]);
let totalNumbers = 0;
for (const range of numberRanges) {
  const entries = SCHOOL_NUMBERS[range];
  assert(entries.length > 0, `Empty number range: ${range}`);
  for (const entry of entries) {
    assert(entry.number && entry.word, `Incomplete number entry in ${range}`);
    totalNumbers += 1;
  }
}

console.log(
  JSON.stringify(
    {
      schoolGrammarTopics: SCHOOL_GRAMMAR_TOPICS.length,
      teacherReviewGatedTopics: [],
      schoolVocabularySets: SCHOOL_VOCABULARY_SETS.length,
      schoolVocabularyItems: totalVocabItems,
      schoolVocabularyWithImages: vocabWithImages,
      schoolActionVerbs: SCHOOL_ACTION_VERBS.length,
      canonicalIrregularVerbs: IRREGULAR_VERBS.length,
      alphabetLetters: SCHOOL_ALPHABET.length,
      numberEntries: totalNumbers,
    },
    null,
    2,
  ),
);
