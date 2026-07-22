# STATUS.md

Atualizado em: 2026-07-22

## Estado executivo

O workspace atual e um esqueleto Vite + React + TypeScript para o app Speak UP Study. Ele contem rotas e telas placeholder suficientes para demonstrar um fluxo inicial, mas ainda nao contem motor de pratica, banco de conteudo, flashcards, jogos, progresso persistente, autenticacao real, analytics, PWA, testes ou integracoes externas.

Fase atual: Fase 2 - taxonomia real do MVP e referencias aprovadas no working tree. A Fase 1 foi reavaliada e permanece pequena; a taxonomia ativa agora contem somente os topicos e categorias confirmados para o MVP.

## Git

- Repositorio Git: inicializado localmente com `git init` em 2026-07-22.
- Branch atual: `master`.
- Baseline local: `06af0e4 chore: establish initial project baseline`.
- Remotos configurados: nenhum; `git remote -v` nao retornou entradas.
- Arquivos staged: nenhum esperado ao fim da fase; verificar com `git diff --cached`.
- Arquivos ignorados relevantes: `node_modules/` e `dist/`.
- Divergencia com remoto: nao aplicavel porque nao ha remoto configurado.
- Mudancas do usuario a preservar: todos os arquivos existentes devem ser tratados como trabalho do usuario/projeto e preservados.

## Stack detectada

- Vite 8.1.x configurado em `vite.config.ts`.
- React 19.2.x.
- React DOM 19.2.x.
- React Router DOM 7.18.x.
- TypeScript 6.0.x.
- Tailwind CSS 4.3.x via `@tailwindcss/vite`.
- Framer Motion 12.42.x instalado no manifesto, mas nao usado no codigo atual.
- Oxlint configurado em `.oxlintrc.json`.
- Node local: v22.22.0.
- npm local: 10.9.4.

Versoes efetivamente instaladas apos `npm ci`:

- Vite 8.1.5.
- React 19.2.7.
- React DOM 19.2.7.
- React Router DOM 7.18.1.
- TypeScript 6.0.3.
- Tailwind CSS 4.3.3.
- `@tailwindcss/vite` 4.3.3.
- `@vitejs/plugin-react` 6.0.3.
- Framer Motion 12.42.2.
- Oxlint 1.74.0.

## Validacoes executadas

- `node --version`: passou, v22.22.0.
- `npm --version`: passou, 10.9.4.
- `npm ci`: passou em aproximadamente 8,94 segundos; criou `node_modules`; nao reportou warnings; `npm audit --audit-level=low` reportou 0 vulnerabilidades.
- `npm run lint`: passou com codigo 0; Oxlint executou sem warnings ou erros.
- `npm run build`: passou com codigo 0; `tsc -b` e `vite build` concluiram; Vite transformou 36 modulos e gerou `dist/`.
- `npm run typecheck`: nao executado porque nao existe script dedicado; o typecheck roda dentro de `npm run build`.
- `npm test` / `npm run test`: nao executados porque nao ha script de testes configurado.
- Busca por segredos: nenhum segredo obvio encontrado; houve falsos positivos em SVG/CSS por termos como `mask` e `token` em contexto nao sensivel.

## Observacoes principais

- `node_modules` existe apos `npm ci`. Nao foi executado `npm install`.
- `dist/` existe apos `npm run build` e e artefato ignorado por `.gitignore`.
- `package.json`, `package-lock.json`, configs e codigo da aplicacao nao foram alterados deliberadamente; hashes de manifestos/configs conferidos antes/depois permaneceram iguais.
- Nao ha testes configurados.
- Nao ha arquivos de ambiente (`.env`, `.env.example`) detectados.
- Nao ha service worker, manifest PWA, backend, Firebase, Supabase, analytics ou autenticacao real.
- O fluxo atual inicia em uma tela de login com botao "Entrar com Google", o que conflita com a diretriz guest-first/local-first do `CLAUDE.md`.
- A UI atual usa fundo navy com blobs/glassmorphism herdado do SpeakIt, diferente da direcao visual aprovada de fundo branco com logo integrado.

## Fase 1 - arquitetura base reavaliada

Arquivos criados:

- `docs/ARCHITECTURE.md`
- `src/shared/types/domain.ts`
- `src/content/model/content.ts`
- `src/services/sessions/practiceSession.ts`
- `src/services/progress/progress.ts`

Decisoes tomadas:

- IDs de dominio sao aliases explicitos sobre strings para manter serializacao simples.
- Timestamps usam strings ISO nos contratos.
- `ProfileId` representa o perfil local/visitante sem exigir usuario remoto.
- Foram mantidos apenas modelos de conteudo, contratos de sessao e contratos de progresso.
- `ContentCatalog` e `storageBoundary` foram removidos por serem abstracoes prematuras para o estado atual.
- Auth, sync, analytics, audio, feature flags, billing, ads e notificacoes continuam documentados como fases futuras, sem codigo nesta fase.

Comportamento:

- Nenhuma rota, pagina, componente visual ou estilo existente foi alterado nesta fase.
- Componentes React continuam sem acesso direto a IndexedDB, `localStorage`, backend, auth ou analytics.

## Fase 2 - taxonomia real do MVP

Arquivos criados:

- `src/content/taxonomy.ts`

Arquivos modificados:

- `src/shared/types/domain.ts`
- `src/content/model/content.ts`
- `docs/ARCHITECTURE.md`
- `STATUS.md`
- `docs/IMPLEMENTATION_MAP.md`
- `docs/OPEN_DECISIONS.md`

Decisoes tomadas:

- O catalogo gramatical ativo do MVP contem exatamente 8 topicos.
- Todos os 8 topicos possuem `entryLevel: "beginner"`.
- As dificuldades ativas por topico sao somente `easy` e `medium`.
- `challenge` nao faz parte do catalogo ativo do MVP.
- As metas registradas por topico sao `easy: 50` e `medium: 80`, totalizando 130 questoes unicas futuras por topico.
- O catalogo de vocabulario ativo contem exatamente 9 categorias: Corpo, Roupas, Moveis, Animais, Profissoes, Lugares, Action Verbs, Routine Verbs e Irregular Verbs.
- `Action Verbs` e `Routine Verbs` foram tratados como vocabulario, nao como gramatica.
- `Irregular Verbs` foi modelado com 50 entradas simples contendo apenas ID, base form, Simple Past, Past Participle e traducao em portugues.
- Foram modelados os modos futuros de pratica de Irregular Verbs: base -> passado, base -> participio, passado -> base, participio -> base, verbo -> traducao, traducao -> verbo e misto.
- A taxonomia nao contem banco real de perguntas, frases de exemplo, traducoes de frases, imagens, audio ou explicacoes longas.

## Referencias e legado

- `reference/home-approved.html`: disponivel e validado como referencia visual aprovada. Arquivo standalone/offline, com logo embutido, fundo branco, navy `#17234b`, vinho `#8d1d30`, chamada "Bora praticar", jogos rapidos e navegacao inferior.
- `reference/speakup-english-challenge.html`: disponivel e validado como legado funcional. Contem 10 topicos, 3 dificuldades legadas, 20 questoes por topico/dificuldade, 600 questoes no total, sessoes de 10/20/30, 6 categorias de vocabulario com 10 itens cada e 7 jogos.
- Mecanicas legadas fora do novo MVP: Multitec, leads, ranking, roleta, CSV, premios e gate de 75%.
- HTML adicional: `index.html` e o shell Vite.
- Logo oficial / imagens claras da marca: nao encontrados. Existem `public/favicon.svg`, `public/icons.svg`, `src/assets/vite.svg` e `src/assets/hero.png`, mas nao ha evidencia de logo oficial Speak UP integrado.
- ZIPs: nao encontrados.
- Bancos de questoes / JSONs de conteudo: nenhum encontrado alem de `package.json`, `package-lock.json` e `.oxlintrc.json`; o banco legado esta embutido no HTML funcional.
- Codigo legado real de jogos: encontrado em HTML standalone, ainda nao migrado para React.
- Conteudo legado encontrado nesta fase: disponivel no HTML funcional. A migracao deve ser gradual e documentada; os 600 exercicios de gramatica e os jogos nao foram copiados para `src/` nesta fase.

## Baseline Git proposto

Devem entrar no primeiro baseline:

- `.gitignore`
- `.oxlintrc.json`
- `CLAUDE.md`
- `README.md`
- `STATUS.md`
- `docs/CURRENT_STATE_AUDIT.md`
- `docs/ARCHITECTURE.md`
- `docs/IMPLEMENTATION_MAP.md`
- `docs/OPEN_DECISIONS.md`
- `reference/home-approved.html`
- `reference/speakup-english-challenge.html`
- `src/content/model/content.ts`
- `src/content/taxonomy.ts`
- `src/services/progress/progress.ts`
- `src/services/sessions/practiceSession.ts`
- `src/shared/types/domain.ts`
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

Nao devem entrar no baseline:

- `.git/`
- `node_modules/`
- `dist/`
- `dist-ssr/`
- logs, caches, arquivos temporarios, segredos e arquivos pessoais de IDE.

Precisam de decisao do usuario:

- `src/assets/hero.png`: manter no baseline se for asset intencional do prototipo atual.
- `src/assets/vite.svg` e `public/favicon.svg`: parecem derivados do Vite; podem entrar no baseline tecnico inicial, mas provavelmente serao substituidos quando assets oficiais chegarem.
- `public/icons.svg`: funcao/uso final ainda pouco claro; pode entrar no baseline por estar no build publico atual.

Ausentes, mas recomendados antes ou logo apos o primeiro commit:

- `.env.example`
- assets oficiais Speak UP separados, caso o logo embutido no HTML aprovado precise virar arquivo versionado proprio
- licenca, se aplicavel
- documentacao de setup mais completa
- plano de migracao gradual do conteudo legado
- revisao pedagogica dos conteudos antes de disponibilizar para alunos

## Arquivos de planejamento criados

- `STATUS.md`
- `docs/CURRENT_STATE_AUDIT.md`
- `docs/IMPLEMENTATION_MAP.md`
- `docs/OPEN_DECISIONS.md`

## Proxima fase recomendada

Recomendo consolidar o checkpoint atual em um commit local e seguir com a normalizacao inicial do conteudo legado: inventariar o HTML funcional, extrair somente vocabulario claro, mover Irregular Verbs para arquivo de dados simples e manter os 600 exercicios de gramatica fora de `src/` ate haver estrategia de migracao e revisao pedagogica.

## .gitignore

Estado atual: cobre logs, `node_modules`, `dist`, `dist-ssr`, `*.local`, `.vscode/*` com excecao para `.vscode/extensions.json`, `.idea`, `.DS_Store` e arquivos comuns de IDE.

Lacunas recomendadas antes do primeiro commit:

- `.env`: evita versionar variaveis locais.
- `.env.*`: evita versionar arquivos de ambiente por perfil.
- `!.env.example`: permite versionar um exemplo sem segredos.
- `Thumbs.db`: evita arquivo gerado pelo Windows Explorer.
- `coverage/`: evita artefatos de cobertura quando testes forem adicionados.

O `.gitignore` foi corrigido antes do baseline local para cobrir essas entradas.

## Confirmacao de seguranca

- Codigo da aplicacao alterado: sim, apenas contratos e tipos arquiteturais da Fase 1.
- Configuracoes alteradas: nao.
- Dependencias instaladas/modificadas: `npm ci` criou `node_modules` de forma reprodutivel; `package.json` e lockfile nao foram alterados.
- Lockfile alterado: nao.
- Git inicializado: sim, apenas localmente.
- Arquivos staged: nao.
- Commit criado nesta fase: nao.
- Push realizado: nao.
- Remoto adicionado: nao.
- Deploy realizado: nao.
