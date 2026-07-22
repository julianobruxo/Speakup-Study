# CLAUDE.md — Speak UP English Practice App

## 1. Mandatory reading and instruction priority

Read this file **in full at the beginning of every working session**, before planning, editing, running migrations, or changing code.

Re-read it whenever:

- the conversation is resumed after a long pause;
- context has been summarized or compacted;
- a new implementation phase starts;
- a request appears to conflict with an earlier product decision;
- the scope of the task is unclear.

This file contains permanent project boundaries and guardrails. Do not silently reinterpret them. When a direct instruction from Juliano changes a rule here, follow the new instruction and update this file only after confirming the change.

---

## 2. Project identity

This project is a **standalone public English-practice application**.

Its purpose is to help learners practice English through:

- grammar quizzes;
- vocabulary study;
- flashcards;
- short games and challenges;
- persistent progress;
- intelligent review;
- clear, motivating feedback.

The application should be useful both to Speak UP students and to the general public, but it is **not a school-management system**.

### Product separation — never mix these products

1. **This app:** public standalone English-practice app with games, grammar, vocabulary, flashcards, progress, and optional Premium.
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

## 3. Current project sources

The workspace currently contains two important kinds of source material:

### Technical base

The project folder extracted from the ZIP is the codebase to inspect and evolve.

Treat it as a **technical starting point**, not as the final product specification. Existing routes, placeholders, README content, login assumptions, visual decisions, and TODOs may be outdated.

### Approved visual reference

The latest approved HTML prototype is the visual reference for the home screen and overall design direction.

Current visual direction:

- white background;
- Speak UP logo integrated naturally into the background, without a visible white rectangle;
- navy and burgundy/red from the logo as the primary palette;
- other colors only as subtle glow, shadow, highlight, or secondary visual support;
- clean, modern, useful, and adult-friendly interface;
- no excessive gradients or multicolor cards competing for attention;
- mobile-first layout;
- clear hierarchy and obvious next action.

Do not redesign the product arbitrarily. Preserve approved visual decisions unless Juliano explicitly changes them.

---

## 4. Core product structure

The app must be organized around user intent, not around textbook units.

### Main entry points

- **Bora praticar**
- **Jogos rápidos**
- **Continuar estudando**
- **Progresso**
- **Perfil/configurações**

### Bora praticar

The main flow is:

```text
Bora praticar
→ Gramática ou Vocabulário
```

#### Grammar flow

```text
Gramática
→ tópico
→ Fácil / Médio / Desafio
→ 10 / 20 / 30 questões
→ sessão
→ resultado
→ revisar erros ou continuar
```

#### Vocabulary flow

```text
Vocabulário
→ categoria
→ Estudar com flashcards
   ou
→ Praticar em um jogo
```

### Games

The planned game modes are:

1. Bora praticar / quiz principal
2. Contra o tempo
3. Jogo da memória
4. Palavras embaralhadas
5. Verdadeiro ou falso
6. Descubra a palavra
7. Soletrando

Games must reuse shared content, progress, sound, session, and analytics services. Do not duplicate the same progress logic or content bank inside each game.

---

## 5. Grammar organization

Do not organize grammar by textbook, book level, or unit.

The Interchange Intro establishes the foundation. Interchange 1, especially Units 1–8, deepens many of the same topics. From Unit 9 onward, more clearly new structures begin to appear.

The books are internal curriculum references only. The user should see cumulative grammar topics.

### Curriculum levels versus practice difficulty

These are different concepts:

- **Iniciante / Intermediário / Avançado:** curricular filters or labels for the topic.
- **Fácil / Médio / Desafio:** complexity of the practice session within a topic.

Do not create isolated beginner, intermediate, and advanced versions of the same grammar topic.

Example:

```text
Simple Present
Curricular labels: Iniciante • Intermediário
Practice levels: Fácil • Médio • Desafio
```

### Grammar topics

#### Foundation and deepening

1. Verbo TO BE — presente
2. Verbo TO BE — passado
3. Pronomes e possessivos
4. Artigos, plurais e demonstrativos
5. Simple Present
6. Advérbios e expressões de frequência
7. Present Continuous
8. Simple Past
9. Futuro
10. There Is / There Are
11. Contáveis e incontáveis
12. Preposições de tempo e lugar

#### Later or more clearly new content

13. Descrição física
14. Present Perfect
15. Modais
16. Comparativos e superlativos
17. Pedidos, ofertas e convites
18. Concordância e discordância
19. Verbos seguidos de infinitivo
20. Mensagens com `tell` e `ask`

Question words such as `what`, `where`, `when`, `who`, `which`, `why`, `how`, `how much`, `how many`, and `how often` belong inside the relevant grammar topic. Do not create a generic question-word module unless a later product decision explicitly requires it.

`Action Verbs` and `Routine Verbs` are vocabulary domains, not grammar topics. They may remain temporarily during migration, but the target architecture should place them under vocabulary.

---

## 6. Vocabulary organization

Vocabulary should be cumulative across the Interchange Intro, Interchange 1, and original app content.

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

Target bank size for each complete grammar topic:

- 50 unique easy questions;
- 80 unique medium questions;
- 100 unique challenge questions;
- 230 unique questions per topic.

Question banks must be separate by difficulty. Do not disguise duplicates by changing only a name or one noun.

Every question must have a permanent ID.

A 30-question session must contain 30 distinct questions whenever enough items are available.

Selection priority:

1. unseen questions;
2. previously incorrect questions;
3. weak skills or low-mastery items;
4. due reviews;
5. oldest-seen questions;
6. mastered questions for occasional maintenance.

Core principle:

> The learner should repeat the skill, not memorize the sentence.

Do not live-generate every learner question with an AI model. Use approved, versioned content banks. AI may assist candidate creation, validation, classification, and review, but final content must pass automated checks and human pedagogical review.

---

## 9. Progress and persistence

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

## 10. Authentication and account boundaries

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

## 11. Tracking and privacy boundaries

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

## 12. Engagement guardrails

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

## 13. Engineering guardrails

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

## 14. Git, commit, push, deployment, and destructive-operation policy

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

## 15. Decision and communication policy

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

## 16. Definition of done for any implementation task

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

