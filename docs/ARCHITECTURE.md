# Architecture

Updated: 2026-07-24

## Goal

Inglês em Jogo is a small local-first English practice app for Speak UP!. It is not an LMS, ERP, integration platform or backend-driven course system.

The current architecture supports a game-like product shell, Present TO BE practice, body-part flashcards, local progress and local engagement mechanics without requiring login or a server.

## Source of Truth

- Visual specification: `reference/ingles-em-jogo-product-vision.html`.
- Current content: `src/content`.
- Current local persistence: `src/services/progress`.
- Legacy reference only: `reference/speakup-english-challenge.html`.

## Main Directories

```text
src/
  components/
  content/
    data/
    model/
    taxonomy.ts
  pages/
  services/
    audio/
    progress/
    sessions/
  games/
    core/
    adapters/
    mechanics/
    components/
    assets/
  shared/
    types/
scripts/
docs/
reference/
```

## Content Model

`src/content/taxonomy.ts` defines the visible catalog and availability. The active grammar catalog has eight topics:

1. Present TO BE;
2. Past TO BE;
3. Simple Present;
4. Present Continuous;
5. Be Going To;
6. Simple Past;
7. There TO BE;
8. Prepositions.

Only Present TO BE has a functional question bank. It contains 130 questions: 50 easy and 80 medium.

Vocabulary currently has Partes do corpo as the only functional category, with 24 flashcards. Other vocabulary categories remain planned or blocked.

## Practice Flow

The grammar session planner selects questions by difficulty and requested size. It avoids repetition within the session and prioritizes unseen questions, latest mistakes and older seen items.

Correct answers show a short success state and advance automatically after 3 seconds. Incorrect answers show the stored pedagogical feedback, keep manual advance, and expose `Estudar esse tópico`.

## Local Persistence

The app uses native IndexedDB database `practice-progress`, currently schema version 3.

Stores:

- `questions`: aggregate progress by `questionId`;
- `sessions`: completed grammar sessions by `sessionId`;
- `engagement`: local profile, XP, levels, titles, streak, daily mission, weekly goal, achievements and league state;
- `gameSessions`: completed game rounds by `sessionId` (game id, content domain, challenge count, XP, score).

The version 2 migration preserves existing question/session data and derives compatible engagement state from local history. The version 3 migration only adds the `gameSessions` store. Event IDs make XP updates idempotent across grammar answers, sessions, flashcards, and game rounds.

`localStorage` is restricted to small preferences such as sound, animations and the last practice configuration.

## Engagement

XP, levels, titles, streak, mission, weekly goal, achievements and activity are local-only. The Liga Safira ranking is deterministic and simulated; it does not represent connected users.

## Games

All nine games in the official catalog are functional, built on a shared foundation in `src/games`:

- `core/catalog.ts`: the nine-game catalog, compatibility matrix, and rollout content scope (`present_tobe` + `body`);
- `core/roundConfig.ts`: central round sizes, Beat the Clock timers, and game XP rules;
- `core/challengeTypes.ts`: discriminated challenge payload contracts per mechanic;
- `core/sessionEngine.ts`: deterministic round state, outcome recording, and XP calculation;
- `core/shuffle.ts` / `core/selectChallenges.ts`: deterministic, no-repeat challenge selection;
- `core/useGameCompletion.ts`: idempotent persistence + XP/mission/streak integration on round completion;
- `adapters/presentTobeAdapter.ts`: materializes canonical sentences, builds Sentence Builder and Error Hunt challenges, and safely excludes short-answer fragments and token-count mismatches;
- `adapters/bodyVocabularyAdapter.ts`: reviewed anatomical grouping and challenge builders for the vocabulary games;
- `adapters/listeningAdapter.ts` / `adapters/beatTheClockAdapter.ts`: compose the shared adapters into Ouvido afiado's three modes and Beat the Clock's four challenge types;
- `assets/visualResolver.tsx`: central `visualKey` resolution — no game hardcodes an asset path;
- `mechanics/*`: one component per game (Monte a frase, Caça ao erro, Contra o relógio, Cada coisa no seu lugar, Palavra secreta, Conectando, Cruzando palavras, Par perfeito, Ouvido afiado).

`Conectando` is the approved name for matching an English word to an image.

Extending to a new grammar topic or vocabulary category only requires a new adapter and an entry in `ROLLOUT_CONTENT` — no game component needs to change.

## External Services

There is no backend, login, sync, analytics, payment provider, PWA service worker or remote ranking in the current product.

## Risks

- No unit/integration test framework is configured.
- The browser smoke suite is custom automation.
- Future content migration still needs pedagogical review.
- Future sync/login must preserve existing local progress.
