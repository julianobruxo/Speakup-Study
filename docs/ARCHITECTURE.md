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

The app uses native IndexedDB database `practice-progress`, currently schema version 2.

Stores:

- `questions`: aggregate progress by `questionId`;
- `sessions`: completed sessions by `sessionId`;
- `engagement`: local profile, XP, levels, titles, streak, daily mission, weekly goal, achievements and league state.

The version 2 migration preserves existing question/session data and derives compatible engagement state from local history. Event IDs make XP updates idempotent.

`localStorage` is restricted to small preferences such as sound, animations and the last practice configuration.

## Engagement

XP, levels, titles, streak, mission, weekly goal, achievements and activity are local-only. The Liga Safira ranking is deterministic and simulated; it does not represent connected users.

## Games

Functional games are not implemented. The planned catalog is:

- Monte a frase;
- Caça ao erro;
- Contra o relógio;
- Cada coisa no seu lugar;
- Palavra secreta;
- Conectando;
- Cruzando palavras;
- Par perfeito;
- Ouvido afiado — fase posterior.

`Conectando` is the approved name for matching an English word to an image.

## External Services

There is no backend, login, sync, analytics, payment provider, PWA service worker or remote ranking in the current product.

## Risks

- No unit/integration test framework is configured.
- The browser smoke suite is custom automation.
- Future content migration still needs pedagogical review.
- Future sync/login must preserve existing local progress.
