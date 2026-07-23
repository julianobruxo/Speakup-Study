# Architecture

Updated: 2026-07-22

## Goal

The current architecture is intentionally small. This app is a simple English practice game, not an LMS, ERP, generic framework, or integration platform.

The current phase consolidates the real MVP taxonomy and the minimum content shapes needed to represent grammar topics, vocabulary categories, and Irregular Verbs. It does not change UI, routes, games, persistence, login, analytics, PWA, monetization, dependencies, or build configuration.

## Directories Created

```text
src/
  shared/
    types/
      domain.ts
  content/
    data/
      irregularVerbs.ts
      presentTobeQuestions.ts
      vocabulary.ts
    model/
      content.ts
    taxonomy.ts
  services/
    sessions/
      practiceSession.ts
    progress/
      progress.ts
```

## Responsibilities

`src/shared/types`

Defines small shared primitives: stable IDs, ISO timestamp strings, curriculum level, practice difficulty, learning status, session state, and practice mode.

`src/content/model`

Defines simple content shapes for:

- active grammar topics;
- future grammar questions;
- vocabulary groups and categories;
- regular vocabulary entries;
- Irregular Verb entries;
- approved Irregular Verb practice modes.

`src/content/taxonomy.ts`

Defines static arrays for the MVP active catalog:

- `ACTIVE_GRAMMAR_TOPICS`;
- `ACTIVE_VOCABULARY_GROUPS`;
- `ACTIVE_VOCABULARY_CATEGORIES`.

It also exposes small lookup helpers by ID. There are no repositories, adapters, providers, factories, generated banks, or real item lists in this taxonomy.

`src/content/data`

Defines simple data files for content that has already been normalized:

- `vocabulary.ts`: 80 vocabulary pairs across 8 populated categories;
- `irregularVerbs.ts`: 50 Irregular Verb entries and approved practice mode strings;
- `presentTobeQuestions.ts`: 130 pilot grammar questions for `present_tobe`.

`src/services/sessions`

Defines the shape of future practice sessions: selected questions, answers, result summaries, and the `SessionPlanner` contract.

`src/services/progress`

Defines the shape of future local progress records and the `ProgressRepository` contract.

## MVP Grammar Catalog

The active MVP grammar catalog has exactly eight topics:

1. Verbo TO BE - presente
2. Verbo TO BE - passado
3. Simple Present
4. Present Continuous
5. Be Going To
6. Simple Past
7. There Is / There Are
8. In / On / At

Rules:

- each topic has `entryLevel: "beginner"`;
- each topic has only `easy` and `medium` in `availableDifficulties`;
- `challenge` is not active in the MVP catalog;
- each topic records question targets of `easy: 50` and `medium: 80`;
- the target total per topic is 130 unique questions;
- no grammar questions are generated in this phase.

Future grammar topics remain roadmap documentation only until real content is approved.

## MVP Vocabulary Catalog

The active MVP vocabulary catalog has exactly nine categories:

1. Corpo
2. Roupas
3. Moveis
4. Animais
5. Profissoes
6. Lugares
7. Action Verbs
8. Routine Verbs
9. Irregular Verbs

`Action Verbs` and `Routine Verbs` are vocabulary categories, not grammar topics.

The grouping is intentionally shallow:

- `mvp_vocabulary`;
- `mvp_verbs`.

## Irregular Verbs

Irregular Verbs use a dedicated simple entry shape:

```ts
{
  id: "irregular_go",
  baseForm: "go",
  simplePast: "went",
  pastParticiple: "gone",
  translation: "ir",
}
```

Each entry contains only:

- ID;
- base form;
- Simple Past;
- Past Participle;
- Portuguese translation.

No example sentence, example translation, explanation, image, or grammar rule is included.

The current Irregular Verbs list has exactly 50 entries.

## Present TO BE Pilot Bank

The first grammar bank is `present_tobe`.

Current counts:

- 50 `easy` questions;
- 80 `medium` questions;
- 130 total unique questions;
- no `challenge` questions.

The question shape is intentionally minimal:

```ts
{
  id: "present_tobe_easy_001",
  topicId: "present_tobe",
  difficulty: "easy",
  question: "My sister ___ at school.",
  options: ["is", "are", "am"],
  correctAnswer: "is",
  feedback: "My sister equivale a she, por isso usamos is.",
}
```

No UI, session engine, randomization, progress, storage, analytics, audio, images, or games consume this bank yet.

Approved future practice modes:

- `base-to-past`;
- `base-to-participle`;
- `past-to-base`;
- `participle-to-base`;
- `verb-to-translation`;
- `translation-to-verb`;
- `mixed`.

These modes are modeled only as data/types. No interface or game logic is implemented in this phase.

## Stable IDs

Defined IDs:

- `GrammarTopicId`
- `VocabularyGroupId`
- `VocabularyCategoryId`
- `QuestionId`
- `VocabularyEntryId`
- `PracticeSessionId`
- `ProfileId`

Expected formats:

- grammar topic: `simple_present`
- vocabulary group: `mvp_verbs`
- vocabulary category: `irregular_verbs`
- irregular verb: `irregular_go`
- question: `present_tobe_easy_0037`
- practice session: generated stable session ID
- profile: local guest profile ID first, optionally linked to account later

Do not include the public product name in IDs, schemas, storage keys, or contracts.

## Local-First and Guest-First

The architecture uses `ProfileId`, not a remote-only `UserId`, so the future flow can stay:

```text
local visitor
-> local progress
-> optional login
-> later synchronization
```

Login must not be required for practice.

## Legacy Content Status

Two reference files are now available in `reference/`:

- `home-approved.html`: approved visual reference, standalone/offline, embedded logo, white background, navy `#17234b`, burgundy `#8d1d30`, "Bora praticar", quick games, and bottom navigation.
- `speakup-english-challenge.html`: legacy functional HTML with 10 topics, 3 legacy difficulties, 20 questions per topic/difficulty, 600 total grammar questions, session sizes 10/20/30, 6 vocabulary categories with 10 items each, and 7 games.

Legacy promotional/business mechanics are not part of the new MVP: Multitec, leads, ranking, wheel/roleta, CSV export, prizes, and the 75% gate.

Current state:

- visual and functional references are no longer missing blockers;
- official separated logo/assets are still pending if the embedded reference logo must become reusable project assets;
- grammar questions were inventoried; only `present_tobe` has a pilot bank;
- games were not migrated;
- Action Verbs and Routine Verbs now have 10 simple seed entries each;
- 80 vocabulary pairs, 50 Irregular Verbs, and 130 Present TO BE questions are normalized in data files.

## Not Implemented

This phase does not implement:

- new UI;
- home screen;
- grammar question banks for the other seven MVP topics;
- complete Action Verbs/Routine Verbs banks beyond the 10-item seeds;
- flashcards;
- games;
- session engine;
- IndexedDB;
- `localStorage`;
- login;
- sync;
- analytics;
- audio;
- PWA;
- monetization;
- external services.

## Known Risks

- Existing UI still uses placeholder routes and hardcoded topic labels.
- Existing first screen remains login-first until a later guest-first navigation phase.
- No test framework is configured yet.
- Approved visual and legacy functional references are present, but React UI reconstruction is still pending.
- Official separated logo/assets are still pending.
- Faithful content migration still requires gradual extraction and pedagogical review.
- Irregular Verbs should receive human/pedagogical review before being treated as final teaching content.
