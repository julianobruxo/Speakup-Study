import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  LIVRO_INTRO,
  INTRO_GRAMMAR_TOPICS,
  INTRO_VOCABULARY_SETS,
} from "../src/content/books/intro/index.ts";

const VALID_SVG_VARIANTS = new Set([
  "greeting",
  "school",
  "globe",
  "clothing",
  "transport",
  "home",
  "briefcase",
  "food",
  "sport",
  "calendar",
  "health",
  "place",
  "weekend",
  "subject",
]);

const EXPECTED_GRAMMAR_ORDER = [
  "possessives-simple",
  "to-be-intro",
  "articles",
  "demonstratives",
  "plurals",
  "prepositions-of-place",
  "to-be-wh-questions",
  "possessives-whose",
  "present-continuous",
  "present-time-expressions",
  "simple-present",
  "there-is-there-are",
  "some-and-any",
  "adverbs-of-frequency",
  "can-ability-requests",
  "be-going-to",
  "simple-past",
  "object-pronouns",
];

// 1. Validate Livro Intro metadata & 18 grammar topics in exact order 1..18
assert.equal(LIVRO_INTRO.id, "intro", "Expected book id 'intro'");
assert.equal(
  INTRO_GRAMMAR_TOPICS.length,
  18,
  `Expected 18 Livro Intro grammar topics, got ${INTRO_GRAMMAR_TOPICS.length}`,
);
assert.deepEqual(
  INTRO_GRAMMAR_TOPICS.map((t) => t.id),
  EXPECTED_GRAMMAR_ORDER,
  "Livro Intro grammar topics must preserve exact 1..18 curriculum order",
);

const exerciseIds = new Set();
let totalFillGaps = 0;
let totalMultipleChoice = 0;
let totalWordScramble = 0;

for (let idx = 0; idx < INTRO_GRAMMAR_TOPICS.length; idx += 1) {
  const topic = INTRO_GRAMMAR_TOPICS[idx];
  assert.equal(topic.order, idx + 1, `Expected order ${idx + 1} for ${topic.id}`);
  assert(topic.title && topic.summary, `Incomplete header in ${topic.id}`);
  assert(topic.explanation.length >= 2, `Expected classroom explanation paragraphs in ${topic.id}`);
  assert(topic.examples.length >= 3, `Expected at least 3 examples in ${topic.id}`);
  for (const example of topic.examples) {
    assert(example.en && example.pt, `Incomplete example in ${topic.id}`);
  }

  assert(topic.fill_in_gaps.length >= 3, `Expected >= 3 fill_in_gaps in ${topic.id}`);
  for (const item of topic.fill_in_gaps) {
    assert(item.id && item.sentence.includes("___") && item.explanation, `Invalid gap item ${item.id}`);
    assert(!exerciseIds.has(item.id), `Duplicate exercise id: ${item.id}`);
    exerciseIds.add(item.id);
    assert(item.options.length >= 2 && item.options.includes(item.answer), `Gap answer missing from options in ${item.id}`);
    assert.equal(new Set(item.options).size, item.options.length, `Duplicate gap options in ${item.id}`);
    totalFillGaps += 1;
  }

  assert(topic.multiple_choice.length >= 3, `Expected >= 3 multiple_choice in ${topic.id}`);
  for (const item of topic.multiple_choice) {
    assert(item.id && item.prompt && item.explanation, `Invalid MC item ${item.id}`);
    assert(!exerciseIds.has(item.id), `Duplicate exercise id: ${item.id}`);
    exerciseIds.add(item.id);
    assert(
      item.options.length >= 2 &&
        item.correctIndex >= 0 &&
        item.correctIndex < item.options.length,
      `Invalid correctIndex in ${item.id}`,
    );
    assert.equal(new Set(item.options).size, item.options.length, `Duplicate MC options in ${item.id}`);
    totalMultipleChoice += 1;
  }

  assert(topic.word_scramble.length >= 3, `Expected >= 3 word_scramble in ${topic.id}`);
  for (const item of topic.word_scramble) {
    assert(item.id && item.target && item.ptCue && item.explanation, `Invalid scramble item ${item.id}`);
    assert(!exerciseIds.has(item.id), `Duplicate exercise id: ${item.id}`);
    exerciseIds.add(item.id);
    assert(item.tokens.length >= 3, `Expected >= 3 tokens in ${item.id}`);
    assert.equal(item.tokens.join(" "), item.target, `Scramble tokens must reconstruct target in ${item.id}`);
    totalWordScramble += 1;
  }

  const serializedTopic = JSON.stringify(topic);
  assert(!serializedTopic.includes("\u2019"), `Curly apostrophe found in grammar topic ${topic.id}`);
  assert(
    !serializedTopic.includes("\u201c") && !serializedTopic.includes("\u201d"),
    `Curly quotes found in grammar topic ${topic.id}`,
  );
}

// 2. Validate all 14 Livro Intro vocabulary sets
assert.equal(
  INTRO_VOCABULARY_SETS.length,
  14,
  `Expected 14 Livro Intro vocabulary sets, got ${INTRO_VOCABULARY_SETS.length}`,
);

const setIds = new Set();
const itemIds = new Set();
let totalItems = 0;
let itemsWithClipart = 0;
let itemsWithImage = 0;

for (const set of INTRO_VOCABULARY_SETS) {
  assert(set.id && set.title && set.subtitle, `Incomplete vocabulary set: ${set.id}`);
  assert(!setIds.has(set.id), `Duplicate vocabulary set id: ${set.id}`);
  setIds.add(set.id);
  assert(
    set.items.length >= 20,
    `Vocabulary set ${set.id} must have at least 20 items (found ${set.items.length})`,
  );

  for (const item of set.items) {
    assert(item.id && item.en && item.pt, `Incomplete vocabulary item in ${set.id}: ${JSON.stringify(item)}`);
    assert(!itemIds.has(item.id), `Duplicate vocabulary item id: ${item.id}`);
    itemIds.add(item.id);
    assert(
      VALID_SVG_VARIANTS.has(item.svgVariant),
      `Invalid svgVariant "${item.svgVariant}" on ${item.id}`,
    );
    assert(item.emoji && item.emoji.trim().length > 0, `Missing emoji fallback on ${item.id}`);

    if (item.clipartUrl) {
      assert(
        item.clipartUrl.startsWith("https://"),
        `clipartUrl must use https:// on ${item.id}: ${item.clipartUrl}`,
      );
      itemsWithClipart += 1;
    }

    if (item.imageUrl) {
      if (item.imageUrl.startsWith("/")) {
        assert(
          existsSync(`public${item.imageUrl}`),
          `Missing local imageUrl asset for ${item.id}: public${item.imageUrl}`,
        );
      } else {
        assert(
          item.imageUrl.startsWith("https://"),
          `imageUrl must use https:// or local / path on ${item.id}`,
        );
      }
      itemsWithImage += 1;
    }

    const serialized = JSON.stringify(item);
    assert(!serialized.includes("\u2019"), `Curly apostrophe found in ${item.id}`);
    assert(!serialized.includes("\u201c") && !serialized.includes("\u201d"), `Curly quotes found in ${item.id}`);

    totalItems += 1;
  }
}

// 3. Validate BookVisual fallback chain (clipart -> image -> svg -> emoji) & F1-F5 guards
const bookVisualSource = readFileSync("src/components/BookVisual.tsx", "utf8");
assert(
  /type FallbackStage = "clipart" \| "image" \| "svg" \| "emoji"/.test(bookVisualSource),
  "BookVisual must define strict fallback order clipart -> image -> svg -> emoji",
);
assert(
  bookVisualSource.includes("onError={() => setStage("),
  "BookVisual must degrade gracefully on image onError",
);

// F1: Verify proper PT-BR diacritics in Livro Intro grammar & metadata (no unaccented regressions)
const grammarRaw = readFileSync("src/content/books/intro/grammar.ts", "utf8");
for (const unaccented of [" voce ", " nao ", " ingles", " entao ", " tambem ", " sabados", " manha"]) {
  assert(
    !grammarRaw.toLowerCase().includes(unaccented),
    `Found unaccented PT-BR word "${unaccented.trim()}" in src/content/books/intro/grammar.ts`,
  );
}
assert(
  LIVRO_INTRO.subtitle.includes("gramática") && LIVRO_INTRO.subtitle.includes("vocabulário"),
  "LIVRO_INTRO.subtitle must use proper PT-BR diacritics",
);

// F2: Verify Portuguese-option MC items do not set audioText and BookGrammarTopicPage only speaks explicit audioText
const ptOnlyMcIds = new Set(["g3-mc-2", "g6-mc-1", "g13-mc-2", "g14-mc-3"]);
for (const topic of INTRO_GRAMMAR_TOPICS) {
  for (const item of topic.multiple_choice) {
    if (ptOnlyMcIds.has(item.id)) {
      assert.equal(
        item.audioText,
        undefined,
        `Portuguese-option MC item ${item.id} must not define en-US audioText`,
      );
    } else {
      assert(
        typeof item.audioText === "string" && item.audioText.trim().length > 0,
        `English-option MC item ${item.id} must define explicit audioText`,
      );
    }
  }
}
const bookGrammarPageSource = readFileSync("src/pages/BookGrammarTopicPage.tsx", "utf8");
const runnerStart = bookGrammarPageSource.indexOf("function GrammarActivityRunner");
assert(runnerStart > -1, "BookGrammarTopicPage must define GrammarActivityRunner");
const explanationPart = bookGrammarPageSource.slice(0, runnerStart);
const runnerPart = bookGrammarPageSource.slice(runnerStart);
assert(
  explanationPart.includes("speakEnglish(") &&
    (explanationPart.includes("speakEnglish(example.en)") ||
      explanationPart.includes("handlePlayExample(example.en)")),
  "BookGrammarTopicPage must keep en-US speech on explanation examples",
);
assert(
  !runnerPart.includes("speakEnglish("),
  "GrammarActivityRunner must not call speakEnglish( during exercises",
);
assert(
  bookGrammarPageSource.includes("orderQuestionOptions("),
  "BookGrammarTopicPage must deterministically order exercise options",
);

// F3: Verify flashcard onKeyDown guards nested buttons
const flashcardPageSource = readFileSync("src/pages/BookVocabularyFlashcardsPage.tsx", "utf8");
assert(
  /onKeyDown=\{\(event\)\s*=>\s*\{\s*if\s*\(\(event\.target as HTMLElement\)\.closest\("button"\)\)\s*return;/s.test(
    flashcardPageSource,
  ),
  "BookVocabularyFlashcardsPage onKeyDown must ignore Enter/Space from nested buttons",
);

// F4: Verify mobile reachability to Livro Intro via /estudar (BookIntroPage) and HomePage
const bookIntroSource = readFileSync("src/pages/BookIntroPage.tsx", "utf8");
const homePageSource = readFileSync("src/pages/HomePage.tsx", "utf8");
assert(
  bookIntroSource.includes("/livro/intro/gramatica") &&
    bookIntroSource.includes("/livro/intro/vocabulario"),
  "BookIntroPage (/estudar) must link to Livro Intro grammar and vocabulary for mobile reachability",
);
assert(
  homePageSource.includes("/livro/intro/gramatica") &&
    homePageSource.includes("/livro/intro/vocabulario"),
  "HomePage must link to Livro Intro grammar and vocabulary for mobile reachability",
);

// F5: Verify intro-house-table and intro-house-chair use distinct visuals
const houseSet = INTRO_VOCABULARY_SETS.find((s) => s.id === "house-furniture");
assert(houseSet, "Missing house-furniture set");
const tableItem = houseSet.items.find((i) => i.id === "intro-house-table");
const chairItem = houseSet.items.find((i) => i.id === "intro-house-chair");
assert(tableItem && chairItem, "Missing intro-house-table or intro-house-chair");
assert.notEqual(tableItem.clipartUrl, chairItem.clipartUrl, "table and chair must have distinct clipartUrl");
assert.notEqual(tableItem.emoji, chairItem.emoji, "table and chair must have distinct emoji");

console.log(
  JSON.stringify(
    {
      bookId: LIVRO_INTRO.id,
      grammarTopics: INTRO_GRAMMAR_TOPICS.length,
      grammarExercises: {
        fillInGaps: totalFillGaps,
        multipleChoice: totalMultipleChoice,
        wordScramble: totalWordScramble,
        total: totalFillGaps + totalMultipleChoice + totalWordScramble,
      },
      vocabularySets: INTRO_VOCABULARY_SETS.length,
      totalVocabularyItems: totalItems,
      itemsWithClipartUrl: itemsWithClipart,
      itemsWithImageUrl: itemsWithImage,
      visualFallbackOrder: "clipart -> image -> svg -> emoji",
    },
    null,
    2,
  ),
);
