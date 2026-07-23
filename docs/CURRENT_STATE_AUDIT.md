# Auditoria do Estado Atual

Atualizado em: 2026-07-22

## 1. Escopo da auditoria

Esta auditoria leu o `CLAUDE.md`, manifestos, lockfile, README, configuracoes, estrutura completa de `src`, paginas, componentes, assets, estilos, TODOs e arquivos HTML/JSON/TS/TSX/CSS/MD presentes no workspace. Na Fase 0 foi executado `npm ci`, conforme aprovado, e foram rodados lint/build. Nao houve alteracao de codigo da aplicacao.

## 2. Git

A raiz atual do projeto foi inicializada como repositorio Git local em 2026-07-22 com `git init`.

Comandos executados:

- `git init`: passou; criou `.git/`.
- `git status --short --branch`: passou; `## No commits yet on master`, com 34 arquivos nao rastreados visiveis.
- `git branch --show-current`: passou; `master`.
- `git log --oneline -n 5`: falhou como esperado porque a branch atual nao tem commits.
- `git diff`: sem saida.
- `git diff --cached`: sem saida.
- `git remote -v`: sem saida; nenhum remoto configurado.
- `git status --short --ignored`: mostra `dist/` e `node_modules/` ignorados.

Conclusao:

- Branch atual: `master`.
- Commits locais: nenhum.
- Arquivos staged: nenhum.
- Arquivos nao rastreados visiveis: 34.
- Remotos: nenhum.
- Divergencia com remoto: nao aplicavel.
- Preservacao: todos os arquivos existentes devem ser tratados como fonte atual do projeto.

## 3. Stack instalada e configurada

Manifesto em `package.json`:

- `react`: `^19.2.7`
- `react-dom`: `^19.2.7`
- `react-router-dom`: `^7.18.1`
- `framer-motion`: `^12.42.2`
- `vite`: `^8.1.1`
- `typescript`: `~6.0.2`
- `tailwindcss`: `^4.3.3`
- `@tailwindcss/vite`: `^4.3.3`
- `oxlint`: `^1.71.0`

Lockfile:

- `package-lock.json` existe, lockfileVersion 3.
- O lockfile registra resolucoes de pacotes.
- Apos `npm ci`, `node_modules` passou a existir no workspace.
- Algumas versoes resolvidas sao mais novas dentro da faixa declarada, por exemplo Vite 8.1.5, TypeScript 6.0.3 e Oxlint 1.74.0.

Ambiente local:

- Node v22.22.0.
- npm 10.9.4.

Versoes efetivamente instaladas:

- React 19.2.7.
- React DOM 19.2.7.
- React Router DOM 7.18.1.
- Framer Motion 12.42.2.
- Vite 8.1.5.
- TypeScript 6.0.3.
- Tailwind CSS 4.3.3.
- `@tailwindcss/vite` 4.3.3.
- `@vitejs/plugin-react` 6.0.3.
- Oxlint 1.74.0.

## 4. Configuracoes

### Vite

`vite.config.ts` usa:

- `@vitejs/plugin-react`
- `@tailwindcss/vite`

Nao ha configuracao de servidor, proxy, aliases, variaveis de ambiente ou PWA.

### TypeScript

`tsconfig.json` referencia `tsconfig.app.json` e `tsconfig.node.json`.

`tsconfig.app.json`:

- target ES2023;
- libs ES2023 e DOM;
- moduleResolution `bundler`;
- JSX `react-jsx`;
- `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` e `noFallthroughCasesInSwitch` ativos.

`tsconfig.node.json`:

- target ES2023;
- module `nodenext`;
- types `node`;
- mesmos guardrails principais de unused/fallthrough.

### Tailwind

Tailwind v4 e importado diretamente em `src/index.css` com `@import "tailwindcss";`. Os tokens de tema estao no proprio CSS, nao em `tailwind.config.*`.

### Lint

`.oxlintrc.json` ativa plugins `react`, `typescript` e `oxc`, com regras para hooks e `react/only-export-components`.

Nao ha ESLint, Prettier, Vitest, Playwright ou configuracao de testes.

### .gitignore

Conteudo atual cobre:

- logs e `*.log`;
- `node_modules`;
- `dist`;
- `dist-ssr`;
- `*.local`;
- `.vscode/*` com excecao de `.vscode/extensions.json`;
- `.idea`;
- `.DS_Store`;
- arquivos comuns de projeto/IDE (`*.suo`, `*.ntvs*`, `*.njsproj`, `*.sln`, `*.sw?`).

Lacunas encontradas:

- `.env`: necessario para impedir commit de variaveis locais.
- `.env.*`: necessario para impedir commit de arquivos de ambiente por perfil.
- `!.env.example`: necessario para permitir exemplo versionado sem segredos.
- `Thumbs.db`: necessario para evitar arquivo gerado pelo Windows Explorer.
- `coverage/`: necessario para evitar artefatos futuros de cobertura.

Nao ha diretorio `.vscode/` no workspace atual, entao nao ha configuracoes compartilhaveis a avaliar nesta etapa.

Proposta futura para complementar o `.gitignore`:

```gitignore
.env
.env.*
!.env.example
Thumbs.db
coverage/
```

O `.gitignore` nao foi alterado nesta etapa.

## 5. Estrutura de arquivos

Raiz:

- `CLAUDE.md`
- `README.md`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `.oxlintrc.json`
- `.gitignore`
- `index.html`
- `public/`
- `src/`

`src`:

- `App.tsx`
- `main.tsx`
- `index.css`
- `assets/hero.png`
- `assets/vite.svg`
- `components/AppBackground.tsx`
- `components/GlassCard.tsx`
- `components/GlowButton.tsx`
- `components/GradientText.tsx`
- `pages/HubPage.tsx`
- `pages/LoginPage.tsx`
- `pages/PracticePage.tsx`
- `pages/TopicChoicePage.tsx`
- `pages/TopicsPage.tsx`
- `pages/TutorialPage.tsx`
- `pages/VocabularyPage.tsx`
- `pages/WelcomePage.tsx`
- diretorios vazios: `data`, `hooks`, `lib`, `routes`

`public`:

- `favicon.svg`
- `icons.svg`

## 6. Arquitetura encontrada

A arquitetura atual e de prototipo/esqueleto:

- As rotas estao declaradas diretamente em `src/App.tsx`.
- Nao ha camada de dominio, dados, repositorios, servicos, stores ou contexts.
- Nao ha estado global; o unico estado de tela encontrado e o `step` local do tutorial.
- Nao ha dados externos ou mockados estruturados. Os topicos estao hardcoded em `TopicsPage.tsx`.
- Nao ha carregamento assincro, persistencia, cache, autenticacao real, sync, audio, analytics, feature flags ou configuracao de ambiente.
- Componentes compartilhados sao puramente visuais.

Rotas atuais:

- `/` -> `LoginPage`
- `/bem-vindo` -> `WelcomePage`
- `/tutorial` -> `TutorialPage`
- `/hub` -> `HubPage`
- `/estudar` -> `TopicsPage`
- `/estudar/:topic` -> `TopicChoicePage`
- `/estudar/:topic/conteudo` -> `PracticePage`
- `/praticar` -> `TopicsPage`
- `/praticar/:topic` -> `PracticePage`
- `/vocabulario` -> `VocabularyPage`
- `*` -> redirect para `/`

Observacao: `TopicsPage` sempre navega para `/estudar/:topic`, mesmo quando usada na rota `/praticar`, entao o fluxo "praticar direto" nao esta semanticamente correto.

## 7. Funcionalidades reais

Funcionalidades implementadas de fato:

- Renderizacao React com React Router.
- Navegacao basica entre paginas.
- Tutorial simples por botao com tres slides hardcoded.
- Lista hardcoded de topicos.
- Componentes visuais reutilizaveis para card, botao, texto em gradiente e fundo animado.

Funcionalidades inexistentes ou placeholder:

- Login Google real.
- Uso como visitante na primeira tela.
- Conteudo didatico de topicos.
- Selecao de gramatica por topico/dificuldade/quantidade.
- Sessoes de 10/20/30 questoes.
- Resultado e revisao de erros.
- Banco de questoes versionado.
- Banco de vocabulario.
- Flashcards.
- Jogos.
- Audio/pronuncia.
- Progresso local persistente.
- Repeticao espacada.
- Recomendacoes de pratica.
- Autenticacao opcional.
- Sincronizacao.
- Analytics.
- PWA/offline.
- Monetizacao.
- Acessibilidade validada.
- Testes automatizados.

## 8. Conteudo e taxonomia

Estado atual:

- `src/data` esta vazio.
- Nao existe `topics_bank.json` no workspace atual.
- Topicos atuais hardcoded:
  - Verbo TO BE (presente)
  - Verbo TO BE (passado)
  - Simple Present
  - Present Continuous
  - Be Going To (futuro)
  - Simple Past
  - There Is / There Are
  - In / On / At
  - Action Verbs
  - Routine Verbs

Gaps contra `CLAUDE.md`:

- A lista nao cobre os 20 topicos planejados.
- `Action Verbs` e `Routine Verbs` aparecem como topicos de gramatica, mas devem migrar para vocabulario.
- `In / On / At` deveria se encaixar em "Preposicoes de tempo e lugar".
- Nao ha separacao entre nivel curricular e dificuldade de pratica.
- Nao ha IDs permanentes para topicos, questoes ou vocabulario.
- Nao ha fonte/versionamento de conteudo.

## 9. Direcao visual

Estado atual:

- `body` e `.app-background` usam fundo navy.
- Ha blobs animados, glass cards, gradientes e shimmer herdados do SpeakIt.
- O favicon e `src/assets/vite.svg` parecem derivados do Vite, nao da marca Speak UP.
- O logo real da escola nao esta integrado; `LoginPage` usa placeholder "SU".

Conflitos ou riscos:

- `CLAUDE.md` pede fundo branco, logo integrado naturalmente, navy/vinho do logo e cores extras discretas.
- A UI atual e mais escura e mais "efeito visual" do que a referencia aprovada.
- Componentes como `GlassCard`, `GlowButton` e `GradientText` podem ser reaproveitados apenas se forem adaptados; nao devem ditar a identidade final.

HTMLs de referencia:

- `reference/home-approved.html` foi procurado e nao foi encontrado.
- Apenas `index.html` foi encontrado no workspace atual.
- O HTML recente citado como referencia visual nao esta presente nesta pasta; isso bloqueia implementacao visual fiel nesta etapa.

## 9.1 Referencias, assets e legado encontrados

Arquivos HTML:

- `index.html`.

Assets/imagens encontrados:

- `public/favicon.svg`.
- `public/icons.svg`.
- `src/assets/hero.png`.
- `src/assets/vite.svg`.

Nao foi encontrada evidencia suficiente de logo oficial Speak UP integrado. `src/assets/vite.svg` e `public/favicon.svg` parecem derivados do Vite; `public/icons.svg` contem simbolos genericos/social/documentation; `src/assets/hero.png` existe, mas nao foi tratado como logo oficial aprovado.

Arquivos ZIP:

- Nenhum encontrado.

Bancos de conteudo/questoes:

- Nenhum `topics_bank.json` encontrado.
- Nenhum banco de questoes ou vocabulario encontrado.
- JSONs encontrados apenas de projeto/configuracao: `package.json`, `package-lock.json`, `.oxlintrc.json`.

Codigo legado/jogos:

- Nenhuma implementacao real dos jogos foi encontrada no workspace.
- Existem apenas TODOs em `src/pages/PracticePage.tsx`, `src/pages/TopicsPage.tsx`, `src/pages/VocabularyPage.tsx` e README mencionando migracao futura.

## 10. Qualidade, riscos e conflitos

Riscos tecnicos:

- `node_modules` foi criado por `npm ci`, e agora foi possivel verificar lint/build.
- Sem testes, qualquer migracao precisara criar baseline de teste antes de motores compartilhados.
- Rotas e fluxo estao hardcoded em componentes de pagina.
- Topico e passado na URL como texto humano, nao como ID estavel.
- Componentes clicaveis usam `div` com `onClick`, criando risco de acessibilidade.
- Nao ha tratamento de loading, erro, estado vazio, foco ou navegacao por teclado validada.
- `index.html` esta em `lang="en"` apesar de UI em portugues.

Conflitos com `CLAUDE.md`:

- Tela inicial e login-first, nao guest-first.
- Copy "feito para os alunos da Speak UP" reduz o carater publico/independente.
- README menciona "Login Google de verdade" como decisao tomada, mas `CLAUDE.md` pede login opcional em fase posterior.
- Visual herdado do SpeakIt conflita com a separacao de produto e direcao visual aprovada.
- Topicos de vocabulario aparecem na lista de gramatica.

O que pode ser preservado:

- Base Vite/React/TypeScript.
- Dependencias atuais, apos instalacao controlada em fase propria.
- Roteamento simples como ponto de partida.
- Alguns componentes visuais como embrioes, desde que renomeados/adaptados para o design aprovado.
- O esqueleto de paginas como pontos de navegacao temporarios.

O que deve ser refatorado:

- Rota inicial e fluxo de entrada.
- Taxonomia hardcoded.
- Organizacao de rotas.
- Componentes clicaveis sem semantica.
- CSS global centrado em efeitos herdados.

O que deve ser removido ou substituido:

- Dependencia conceitual de login inicial.
- Placeholders Vite e favicon nao-branded.
- Referencias visuais herdadas do SpeakIt quando competirem com a direcao aprovada.
- Qualquer mecanica de roleta/gate promocional caso venha a ser migrada de codigo legado.

## 11. Validacoes

Comandos nao destrutivos executados:

- `Get-Content` para arquivos relevantes.
- `rg --files -uu`.
- `rg -n` para TODOs, produto legado, integracoes e segredos.
- `Get-ChildItem -Force` e `Get-ChildItem -Recurse`.
- comandos Git de inspeccao.
- `node --version`.
- `npm --version`.
- `npm ci`.
- `npm ls react react-dom react-router-dom framer-motion vite typescript tailwindcss @tailwindcss/vite @vitejs/plugin-react oxlint --depth=0`.
- `npm audit --audit-level=low`.
- `npm run lint`.
- `npm run build`.

Resultados:

- Auditoria de arquivos concluida.
- Git inicializado localmente em 2026-07-22; nenhum commit/stage/remoto foi criado.
- `npm ci` passou em aproximadamente 8,94 segundos; nao reportou warnings relevantes.
- `npm audit --audit-level=low` reportou 0 vulnerabilidades.
- `npm run lint` passou com codigo 0; Oxlint configurado de forma valida.
- `npm run build` passou com codigo 0; `tsc -b` e `vite build` concluiram, com 36 modulos transformados.
- Scripts ausentes: nao ha `typecheck`, `test` ou `npm test` configurados.
- Nenhum segredo obvio encontrado.

Arquivos gerados pela validacao:

- `node_modules/` criado por `npm ci`.
- `dist/` criado por `npm run build` e ignorado por `.gitignore`.

Manifestos e configuracoes:

- Hashes de `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `.oxlintrc.json`, `CLAUDE.md` e `README.md` foram conferidos antes/depois; nao houve alteracao nesses arquivos.

## 12. Baseline Git proposto

### A. Devem entrar no primeiro baseline

- `.gitignore`
- `.oxlintrc.json`
- `CLAUDE.md`
- `README.md`
- `STATUS.md`
- `docs/CURRENT_STATE_AUDIT.md`
- `docs/IMPLEMENTATION_MAP.md`
- `docs/OPEN_DECISIONS.md`
- `index.html`
- `package.json`
- `package-lock.json`
- `public/favicon.svg`
- `public/icons.svg`
- `src/App.tsx`
- `src/index.css`
- `src/main.tsx`
- `src/assets/hero.png`
- `src/assets/vite.svg`
- `src/components/AppBackground.tsx`
- `src/components/GlassCard.tsx`
- `src/components/GlowButton.tsx`
- `src/components/GradientText.tsx`
- `src/pages/HubPage.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/PracticePage.tsx`
- `src/pages/TopicChoicePage.tsx`
- `src/pages/TopicsPage.tsx`
- `src/pages/TutorialPage.tsx`
- `src/pages/VocabularyPage.tsx`
- `src/pages/WelcomePage.tsx`
- `tsconfig.app.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`

### B. Nao devem entrar no baseline

- `.git/`
- `node_modules/`
- `dist/`
- `dist-ssr/`
- logs, caches, arquivos temporarios, segredos e arquivos pessoais de IDE.

### C. Precisam de decisao do usuario

- `src/assets/hero.png`: confirmar se e asset intencional do prototipo atual.
- `src/assets/vite.svg` e `public/favicon.svg`: parecem derivados do Vite; confirmar se entram no baseline tecnico inicial ou se serao substituidos antes do primeiro commit.
- `public/icons.svg`: confirmar funcao/uso final se houver duvida sobre manter no baseline.

### D. Ausentes, mas recomendados antes ou logo apos o primeiro commit

- `.env.example`
- `reference/home-approved.html`
- logo/assets oficiais Speak UP
- licenca, se aplicavel
- documentacao de setup mais completa
- fonte legado/banco antigo, quando disponivel

## 13. Inspecao de sensiveis

Arquivos sensiveis encontrados:

- Nenhum `.env`, certificado, chave privada, banco local ou credencial OAuth encontrado.

Busca textual:

- Nao foram encontrados segredos obvios. Os hits ocorreram em instrucoes/documentacao sobre nao versionar segredos e em SVG/CSS por termos como `mask`, `token` em contexto nao sensivel.

Risco antes do primeiro commit:

- O `.gitignore` ainda nao cobre `.env`, `.env.*`, `!.env.example`, `Thumbs.db` e `coverage/`; recomenda-se corrigir antes de stage/commit.
