# CLAUDE.md — Inglês em Jogo — Speak UP!

## 1. Mandatory reading and instruction priority

Read this file **in full at the beginning of every working session**, before planning, editing, running migrations, running tests, or changing code.

Also read, before any implementation:

- every other `CLAUDE.md` in the repository tree;
- `README.md`;
- `STATUS.md`;
- `docs/CURRENT_HANDOFF.md`;
- the latest complete handoff supplied by Juliano;
- the canonical content and functional files relevant to the requested phase.

Re-read this file whenever:

- the conversation is resumed after a long pause;
- context has been summarized or compacted;
- a new implementation phase starts;
- a request appears to conflict with an earlier product decision;
- the scope of the task is unclear.

Instruction priority for project work:

1. Juliano's latest direct instruction;
2. this `CLAUDE.md`, after incorporating confirmed decisions;
3. the latest complete project handoff;
4. the current React implementation as functional truth;
5. `reference/ingles-em-jogo-product-vision.html` as visual truth;
6. other project documentation;
7. legacy code and prototypes only as sources of content or ideas.

Do not silently reinterpret permanent boundaries. When a direct instruction from Juliano changes a rule here, follow the new instruction and update this file only after the change is confirmed.

---

## 2. Project identity

The product is **Inglês em Jogo**, a Speak UP! experience.

It is a **standalone, public, game-like and local-first English-practice application**. The historical name `Speakup Study` may remain only in repository URLs, folder names, old references, and Git history. Do not restore it in the interface.

Its purpose is to help learners practice and learn English through:

- grammar practice;
- vocabulary study;
- flashcards;
- reusable games and challenges;
- persistent local progress;
- intelligent review;
- clear, motivating feedback.

The application should be useful both to Speak UP students and to the general public, but it is **not a school-management system, LMS, teacher panel, or extension of SpeakIt**.

### Product separation — never mix these products

1. **Inglês em Jogo:** public standalone English-practice app with games, grammar, vocabulary, flashcards, and local progress.
2. **SpeakIt:** separate autonomous English-learning product with its own complete learning path.
3. **Speak UP ERP:** separate school-management product involving students, classes, enrollment, contracts, finance, teachers, and administration.

Do not add ERP concepts to this app. Do not create dependencies on SpeakIt or the Speak UP ERP.

This app must not include or assume:

- classes or class allocation;
- teachers or teacher dashboards;
- school enrollment;
- contracts;
- tuition or school billing;
- academic records from the ERP;
- course-management workflows;
- mandatory integration with another Speak UP product.

---

## 3. Current project sources and checkpoint

### Expected repository checkpoint

- repository: `julianobruxo/Speakup-Study`;
- branch: `main` tracking `origin/main`;
- expected checkpoint before the game rollout: `56d72e36ba7f50171f5efed2fb184470a93004f0`;
- commit message: `feat: launch Inglês em Jogo product experience`;
- expected divergence: `0 0`;
- expected working tree: clean;
- no staged files, deploy, PR, tag, or release.

Always verify the real Git state. Documentation does not override Git evidence.

### Functional source of truth

The current React application is the functional source of truth. Preserve existing grammar behavior, flashcards, progress, persistence, engagement, audio, navigation, and responsive behavior unless Juliano explicitly changes them.

### Visual source of truth

`reference/ingles-em-jogo-product-vision.html` is the canonical visual specification.

The approved and already published direction includes:

- navy desktop sidebar of approximately 248 px;
- tablet rail of approximately 92 px;
- topbar and mobile navigation;
- white content surfaces with navy, burgundy/red, cyan, violet, orange, and other supporting accents used in a controlled way;
- responsive desktop, tablet, and mobile layouts;
- focused flows without the global shell;
- clear hierarchy and an obvious next action.

Do not return to the old white sidebar or redesign the product arbitrarily. The current phase should reuse the approved design system rather than initiate a visual revamp.

### Legacy sources

Legacy HTML and old prototypes may provide content, mechanics, or pedagogical ideas, but they are not the current product identity or implementation specification. Never migrate legacy banks or game code wholesale without validation and adaptation.

---

## 4. Core product structure

The app must be organized around user intent, not textbook units.

### Main entry points

- **Bora praticar**;
- **Jogos**;
- **Continuar estudando**;
- **Progresso**;
- **Perfil/configurações**.

### Practice flow

```text
Bora praticar
→ Gramática ou Vocabulário
```

#### Grammar flow

```text
Gramática
→ tópico
→ Fácil ou Médio
→ 10, 20 ou 30 questões
→ sessão
→ resultado
→ revisar erros ou continuar
```

There is no `challenge` difficulty in the current approved content model. Do not expose or generate it.

#### Vocabulary flow

```text
Vocabulário
→ categoria
→ estudar com flashcards
   ou
→ praticar em um jogo compatível
```

### Games

The official catalog is:

1. Monte a frase;
2. Caça ao erro;
3. Contra o relógio;
4. Cada coisa no seu lugar;
5. Palavra secreta;
6. Conectando;
7. Cruzando palavras;
8. Par perfeito;
9. Ouvido afiado.

`Conectando` is the official name for direct association between an English word and an image.

Games are **reusable mechanics**, not fixed content modules. They must reuse canonical content, progress, audio, session, engagement, and persistence services. Do not duplicate content banks or progress logic inside each game.

Both entry flows must be supported by the architecture:

```text
Choose game
→ choose compatible content
→ configure
→ play
→ result
```

and:

```text
Choose content
→ see compatible games
→ configure
→ play
→ result
```

The Games page is the primary game-first entry. Content pages may expose contextual shortcuts without requiring a redesign.

---

## 5. Grammar organization

Do not organize grammar by textbook, book level, or unit.

The books are internal curriculum references only. The learner should see cumulative grammar topics.

### Curriculum levels versus practice difficulty

These are different concepts:

- **Iniciante / Intermediário / Avançado:** curricular filters or labels for a topic;
- **Fácil / Médio:** current practice complexity within a topic.

Do not create isolated beginner, intermediate, and advanced versions of the same grammar topic.

### Current planned grammar sequence

1. Verbo TO BE — presente;
2. Verbo TO BE — passado;
3. Simple Present;
4. Present Continuous;
5. Be Going To;
6. Simple Past;
7. There Is / There Are;
8. In / On / At.

Only `present_tobe` is currently functional. The current game rollout must use only that topic.

Question words belong inside the relevant grammar topic. Do not create a generic question-word module unless a later product decision explicitly requires it.

`Action Verbs` and `Routine Verbs` are vocabulary domains, not grammar topics.

Broader future curriculum expansion may be documented as a roadmap, but it must not be implemented or presented as currently available without explicit approval and curated content.

---

## 6. Vocabulary organization

Vocabulary should be cumulative across approved curriculum references and original app content.

Only `body` / Parts of the Body currently has a complete functional visual experience with 24 entries and local assets. The current game rollout must use only this category. Other textual categories are planned content, not proof of a complete playable experience.

Do not create separate vocabulary banks named after each book. A word should have one permanent ID and may record multiple curriculum sources.

### Main vocabulary groups

#### People and daily life

- personal information and greetings;
- countries, nationalities, and languages;
- school and classroom;
- jobs and work;
- family and relationships;
- routines and time;
- physical appearance and personality;
- body, health, and care.

#### Home and city

- personal objects and technology;
- house, rooms, furniture, and appliances;
- transportation;
- places, neighborhoods, services, and directions;
- shopping and prices.

#### Interests and experiences

- clothes, colors, and materials;
- food, meals, and restaurants;
- sports and exercise;
- entertainment and free time;
- travel, vacations, and tourism;
- events and celebrations;
- telephone and messages;
- life changes, plans, and goals.

#### The world around us

- weather and seasons;
- nature and geography;
- measurements;
- animals.

Animals are valid additional app content even when they are not a central textbook category.

### Flashcards

Vocabulary must be studyable through flashcards and reusable in games.

A flashcard may include:

- English word;
- Portuguese meaning;
- pronunciation/audio;
- natural example sentence;
- example translation;
- image when pedagogically useful;
- singular/plural or irregular form when relevant;
- learner rating such as `Ainda não sei`, `Difícil`, or `Já sei`.

The learner does not need to have studied a word in flashcards before seeing it in a grammar question, provided the word is common, level-appropriate, contextually understandable, and does not turn a grammar task into an obscure vocabulary test.

---

## 7. Content quality guardrails

Content quality is a critical product requirement.

### Never generate questions by blindly combining templates and word lists

Previous template-based generation produced grammatically possible but semantically absurd sentences. Do not repeat this failure.

Every question must:

- make natural semantic sense;
- test a specific language skill;
- use level-appropriate vocabulary;
- have plausible distractors based on real learner errors;
- include pedagogically useful feedback;
- avoid accidental ambiguity;
- avoid duplicate or near-duplicate questions;
- avoid repeated answer options;
- be manually reviewable.

### Feedback

Feedback must explain the relevant rule or reasoning. It must not merely repeat the correct answer.

### Difficulty

Difficulty must come from grammar, context, contrast, word order, exceptions, or analysis—not from rare or obscure vocabulary.

### Idioms and slang

Exclude idioms, slang, regionalisms, opaque figurative expressions, internet abbreviations, and culture-dependent expressions from all difficulty levels for now.

Examples currently excluded as tested content:

- `spill the beans`;
- `hit the sack`;
- `piece of cake`;
- `no cap`;
- `ghost someone`;
- `low-key`;
- `ain't`;
- `gonna`, `wanna`, and `gotta`.

Standard contractions are allowed:

- `isn't`;
- `aren't`;
- `doesn't`;
- `didn't`;
- `I'm`;
- `they're`.

Transparent beginner combinations explicitly taught as ordinary vocabulary are allowed, such as:

- `get up`;
- `go shopping`;
- `call back`;
- `take a message`.

Phrasal verbs with nontransparent meanings should only be added later as a dedicated, explicitly approved content area.

### Copyright boundary

Textbooks are curriculum references, not content to reproduce at scale.

Do not copy large portions, full exercises, or extensive sentence sets from copyrighted books. Create original questions and examples that follow the same grammar scope, vocabulary range, and pedagogical level.

---

## 8. Question bank and session rules

Current approved target for each complete grammar topic:

- 50 unique easy questions;
- 80 unique medium questions;
- 130 unique questions total;
- no `challenge` bank.

The canonical `present_tobe` bank already contains 130 entries. Load and inventory the complete canonical file before building grammar-game adapters. Do not copy a shortened version into another file.

Question banks must remain separate by difficulty. Do not disguise duplicates by changing only a name or one noun.

Every question must have a permanent ID.

A 30-question session must contain 30 distinct questions whenever enough items are available.

Selection priority:

1. unseen questions;
2. previously incorrect questions;
3. oldest-seen questions;
4. remaining eligible questions.

Core principle:

> The learner should repeat the skill, not memorize the sentence.

Do not live-generate learner questions with an AI model. Use approved, versioned content banks. AI may assist candidate creation, validation, classification, and review, but final content must pass automated checks and human pedagogical review.

### Traditional grammar-session feedback

After a correct answer:

- lock the alternatives;
- show only `Correto!`;
- do not show an explanation;
- display a linear green progress bar lasting exactly **2 seconds**;
- advance automatically after those 2 seconds;
- do not offer a skip button;
- the final answer opens the result screen.

After an incorrect answer, preserve the current pedagogical feedback and manual continuation flow.

---

## 9. Current approved game rollout

### Delivery strategy

Implement the complete official game catalog in **controlled phases over one shared foundation**. Do not build nine disconnected mini-applications, and do not attempt one uncontrolled mega-change.

Each phase must finish with working code and full validation before the next phase begins. The final scope of this rollout includes all nine games.

### Content scope for the first complete templates

Use only:

- Grammar: `present_tobe`;
- Vocabulary: `body`, with the existing 24 Parts of the Body entries and assets.

The result must serve as a reusable template for later grammar topics and vocabulary categories. Do not redesign the approved interface in this phase.

### Initial compatibility

| Game | Present TO BE | Parts of the Body |
|---|---:|---:|
| Monte a frase | yes | no |
| Caça ao erro | yes | no |
| Contra o relógio | yes | yes |
| Cada coisa no seu lugar | no | yes |
| Palavra secreta | no | yes |
| Conectando | no | yes |
| Cruzando palavras | no | yes |
| Par perfeito | no | yes |
| Ouvido afiado | yes | yes |

Compatibility must be declared centrally and enforced by adapters and validators.

### Default round sizes

- Monte a frase: 10 sentences;
- Caça ao erro: 10 sentences;
- Contra o relógio: 10 mixed challenges;
- Cada coisa no seu lugar: 12 items split across 3 explicit groups;
- Palavra secreta: 5 words per round;
- Conectando: 6 pairs per round;
- Cruzando palavras: up to 8 words, using fewer when required for a valid board;
- Par perfeito: 6 pairs / 12 cards;
- Ouvido afiado: 10 challenges.

Store these defaults in central catalog/configuration, not inside individual UI components.

### Contra o relógio

Contra o relógio is a mixed-mechanics race. It is not a plain quiz with one global 60-second timer.

It may mix compatible prompts from the other games, including grammar, vocabulary, image, listening, typing, sentence building, and error hunting.

The timer resets for every challenge:

- word challenge: **10 seconds**;
- type a full sentence: **20 seconds**;
- drag-and-drop sentence unscrambling: **10 seconds**;
- Caça ao erro challenge: **20 seconds**.

When time expires:

- mark that challenge as incorrect;
- reveal the correct answer briefly and accessibly;
- continue to the next challenge;
- do not end the complete round.

### Palavra secreta

Use traditional Hangman behavior:

- clue in Portuguese;
- answer in English;
- five incorrect guesses allowed per word;
- physical and virtual keyboard support;
- spaces and hyphens revealed automatically;
- do not replace the mechanic with a generic word-guessing card.

### Ouvido afiado — current modes only

Implement only:

1. listen and select the matching image;
2. listen and type the word;
3. listen and assemble the sentence.

Do not implement speech recognition, pronunciation scoring, repetition capture, or additional listening modes in this rollout.

### Monte a frase and Caça ao erro eligibility

Do not assume that all 130 grammar questions are eligible.

Before generating rounds:

- materialize canonical correct sentences safely;
- support ordered replacement for multiple blanks and answers separated by `/`;
- preserve capitalization, punctuation, and contractions;
- reject ambiguous sentence orderings;
- use reviewed distractors;
- guarantee exactly one target error in Caça ao erro;
- allow per-question overrides by permanent ID;
- never generate random unreviewed errors at runtime.

### Vocabulary assets and groups

Resolve images centrally through `visualKey`. No game may hardcode or duplicate physical asset paths.

For Cada coisa no seu lugar, use explicit reviewed metadata rather than silent inference. The initial Parts of the Body grouping is:

- head and face;
- torso and upper limbs;
- lower limbs.

Each drag-and-drop interaction must also provide touch and keyboard alternatives.

### Game XP and score

Keep game score separate from global XP.

Default global game XP:

- +5 XP per correct challenge;
- 0 XP per incorrect challenge;
- +10 XP for completing a round;
- maximum 60 XP per completed round;
- grant XP only when the round is finalized;
- use idempotent event IDs so replay, refresh, or repeated persistence cannot duplicate XP.

Speed, combos, remaining lives, and game-specific performance may affect score and records, but not silently multiply global XP.

### Daily mission

The daily mission should represent learning regardless of surface:

1. resolve 10 valid challenges;
2. complete one Grammar activity, either traditional practice or a game using `present_tobe`;
3. complete one Vocabulary activity, either five distinct flashcards or a game using `body`.

Preserve the current +80 XP daily mission bonus, granted once per date.

### Streak and active day

A date counts as active when the learner completes at least one qualified activity:

- a traditional grammar session;
- five distinct flashcards;
- a completed game round containing at least five valid interactions.

Opening or abandoning a round does not count. Repeated activities on the same date must not create multiple streak days.

### Foundation requirements

Create shared contracts for:

- game catalog and compatibility;
- content selection;
- round configuration;
- challenge payloads;
- session state;
- timers;
- answer evaluation;
- score and XP;
- completion and result;
- persistence and idempotent engagement events;
- keyboard, touch, drag-and-drop, reduced-motion, and screen-reader behavior.

Do not create files such as `sentenceBuilderQuestions.ts` or `errorHuntQuestions.ts` that copy canonical banks. Use adapters over canonical content.

---

## 10. Progress and persistence

The app must be guest-first and local-first.

A learner should be able to start immediately without creating an account.

Persistent progress should eventually include:

- sessions started and completed;
- topic and difficulty;
- question history;
- correct and incorrect answers;
- response time;
- mastery;
- review schedule;
- flashcard history;
- words learned and pending review;
- daily goal;
- streak;
- settings;
- last activity and resumable session.

Use stable IDs for questions, words, topics, sessions, and users.

Prefer a repository/service abstraction so local persistence can later synchronize with a backend without rewriting games and UI.

Do not concentrate all progress in one giant mutable document or one global state object.

---

## 11. Authentication and account boundaries

Login must not block first use.

Target flow:

```text
Open app
→ use as guest
→ complete a useful activity
→ optional prompt to save progress
→ sign in with Google
```

The account represents an app user, not a school enrollment.

Do not assume or implement:

- student verification against the Speak UP ERP;
- school enrollment status;
- special ad-free status for current Speak UP students;
- class or teacher association.

Those earlier assumptions are obsolete unless Juliano explicitly revives them.

External authentication, backend, synchronization, analytics, ads, subscriptions, notifications, or cloud services must be implemented only in the appropriate approved phase. Until credentials are provided, use interfaces, adapters, mocks, `.env.example`, and documented setup steps.

Never place secret keys, service-account credentials, private tokens, or privileged API keys in client code or committed files.

---

## 12. Tracking and privacy boundaries

Keep pedagogical progress tracking separate from product analytics.

### Learning tracking

May record data needed to personalize learning, such as:

- question ID;
- correctness;
- response time;
- attempts;
- last result;
- mastery;
- review date;
- vocabulary recall.

### Product analytics

Should measure aggregated product behavior, such as:

- app opened;
- practice started/completed/abandoned;
- topic selected;
- difficulty selected;
- flashcard session completed;
- game completed;
- login funnel;
- retention and engagement.

Do not send personally identifying information, free-text learner content, private messages, phone numbers, or raw spoken responses to analytics.

Collect only what is needed. Make analytics and privacy choices explicit in configuration and documentation.

---

## 13. Engagement guardrails

Engagement should support learning rather than manipulate the user.

Preferred mechanisms:

- one clear next action;
- resume last activity;
- due review queue;
- configurable daily goal;
- weekly progress;
- streak based on completed learning activity;
- error recovery;
- topic-specific recommendations;
- meaningful achievements;
- optional and respectful notifications.

Avoid:

- guilt-based copy;
- excessive notifications;
- fake urgency;
- punishing loss of progress;
- misleading fluency percentages;
- engagement features that reward opening the app without learning.

Ads must never interrupt a question, answer explanation, active flashcard review, or ongoing game session. Premium may remove ads, but monetization belongs to a later approved implementation phase.

---

## 14. Engineering guardrails

### Inspect before editing

Before changing code:

1. inspect the relevant files;
2. understand the existing architecture and behavior;
3. identify tests and dependencies;
4. state the intended scope;
5. make the smallest coherent change.

Do not rewrite broad parts of the app merely because a different architecture is personally preferred.

### Work in phases

Do not attempt the entire roadmap in one uncontrolled change.

Each phase must end with:

- working code;
- tests run;
- lint run;
- build run;
- known issues documented;
- `STATUS.md` updated when that file exists;
- changed files summarized.

Do not begin the next phase while the project is knowingly broken.

### Tests

Preserve useful behavior through tests. Add tests for:

- session selection without duplicates;
- progress persistence;
- review priority;
- content validation;
- navigation flows;
- games;
- flashcards;
- offline behavior;
- login and merge behavior when implemented;
- accessibility-critical states.

### Accessibility

Do not communicate status only by color. Support keyboard navigation, readable contrast, semantic elements, labels, focus states, and reduced-motion preferences.

### Dependencies

Do not add large dependencies without a clear need. Before installing a package, verify whether the existing stack or a small utility can solve the problem.

### External services

Do not configure production services, billing, domains, ads, subscriptions, app-store publishing, or deployment without explicit approval.

---

## 15. Git, commit, push, deployment, and destructive-operation policy

This section is non-negotiable.

### Never commit without explicit authorization

Do **not** run any command that creates a Git commit unless Juliano explicitly authorizes that specific commit.

Forbidden without express authorization:

- `git commit`;
- amend commits;
- merge commits;
- automated commits from tools or scripts;
- committing generated files;
- committing lockfile or configuration changes merely because they exist.

Preparing changes in the working tree is allowed. Staging files with `git add` should also be avoided unless Juliano explicitly asks for staging or a commit-ready state.

### Never push without explicit authorization

Do **not** push anything to any remote repository unless Juliano explicitly authorizes that push.

Forbidden without express authorization:

- `git push`;
- force push;
- pushing tags;
- publishing branches;
- opening or merging pull requests;
- syncing through an IDE action that pushes changes;
- triggering a deployment through a Git push.

Authorization to commit does not imply authorization to push. Authorization to push one branch does not imply authorization to push another branch, tags, or future commits.

### Never deploy or publish without explicit authorization

Do not deploy or publish to:

- Vercel;
- Firebase Hosting;
- Google Play;
- any production domain;
- any staging environment visible to others;
- package registries;
- app stores;
- public repositories.

### Avoid destructive operations

Do not run destructive commands without explicit approval, including:

- `git reset --hard`;
- `git clean -fd` or similar;
- deleting untracked files;
- force checkout that discards changes;
- rewriting Git history;
- deleting branches or tags;
- removing databases or cloud resources;
- bulk deletion of project files;
- replacing user work with generated content.

Before any potentially destructive operation, explain exactly what will be changed or lost and wait for authorization.

### Repository status reporting

At meaningful checkpoints, report:

- current branch;
- whether the working tree is clean or dirty;
- files changed;
- tests/lint/build results;
- whether anything was staged;
- explicitly confirm that no commit, push, or deployment was performed.

---

## 16. Decision and communication policy

Use reasonable implementation defaults for minor reversible decisions, and document them.

Stop and ask Juliano before decisions involving:

- changing the product scope;
- changing approved visual direction;
- deleting or replacing major features;
- choosing the final app name;
- Premium pricing;
- ad strategy;
- external-service credentials;
- privacy/legal text;
- production configuration;
- deployment;
- Git commits;
- Git pushes;
- destructive operations.

When uncertain, do not invent hidden product assumptions. Clearly distinguish:

- confirmed requirements;
- temporary implementation assumptions;
- recommendations;
- blocked decisions.

---

## 17. Definition of done for any implementation task

A task is not complete merely because the UI looks correct.

Before reporting completion:

1. verify the intended behavior;
2. run relevant automated tests;
3. run lint;
4. run the production build;
5. inspect important mobile layouts;
6. document remaining issues;
7. summarize changed files and decisions;
8. confirm that no commit, push, deployment, or publication occurred unless Juliano explicitly authorized it.
