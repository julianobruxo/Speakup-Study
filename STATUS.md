# STATUS.md

Atualizado em: 2026-07-22

## Estado executivo

O workspace atual e um esqueleto Vite + React + TypeScript para o app Speak UP Study. Ele contem rotas e telas placeholder suficientes para demonstrar um fluxo inicial, mas ainda nao contem motor de pratica, banco de conteudo, flashcards, jogos, progresso persistente, autenticacao real, analytics, PWA, testes ou integracoes externas.

Fase atual: Fase 0 - baseline executavel. Nao foram implementadas funcionalidades. Foram alterados apenas documentos de planejamento/status.

## Git

- Repositorio Git: inicializado localmente com `git init` em 2026-07-22.
- Branch atual: `master`.
- Commits existentes: nenhum; `git log --oneline -n 5` retorna que a branch atual ainda nao tem commits.
- Remotos configurados: nenhum; `git remote -v` nao retornou entradas.
- Arquivos staged: nenhum; `git diff --cached` sem saida.
- Arquivos nao rastreados visiveis pelo Git: 34.
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

## Referencias e legado

- `reference/home-approved.html`: nao encontrado; bloqueio visual para implementar UI fiel a referencia aprovada.
- HTML adicional: apenas `index.html`.
- Logo oficial / imagens claras da marca: nao encontrados. Existem `public/favicon.svg`, `public/icons.svg`, `src/assets/vite.svg` e `src/assets/hero.png`, mas nao ha evidencia de logo oficial Speak UP integrado.
- ZIPs: nao encontrados.
- Bancos de questoes / JSONs de conteudo: nenhum encontrado alem de `package.json`, `package-lock.json` e `.oxlintrc.json`.
- Codigo legado real de jogos: nao encontrado; ha apenas TODOs mencionando migracao futura.

## Baseline Git proposto

Devem entrar no primeiro baseline:

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
- `reference/home-approved.html`
- logo/assets oficiais Speak UP
- licenca, se aplicavel
- documentacao de setup mais completa
- fonte legado/banco antigo, quando disponivel

## Arquivos de planejamento criados

- `STATUS.md`
- `docs/CURRENT_STATE_AUDIT.md`
- `docs/IMPLEMENTATION_MAP.md`
- `docs/OPEN_DECISIONS.md`

## Proxima fase recomendada

Recomendo iniciar pela Fase 1 - arquitetura base e boundaries locais, sem UI nova. O HTML visual aprovado e o legado dos jogos/conteudo nao estao disponiveis, entao a criacao da home/design system deve aguardar as referencias ou ser feita apenas quando a referencia visual estiver presente.

## .gitignore

Estado atual: cobre logs, `node_modules`, `dist`, `dist-ssr`, `*.local`, `.vscode/*` com excecao para `.vscode/extensions.json`, `.idea`, `.DS_Store` e arquivos comuns de IDE.

Lacunas recomendadas antes do primeiro commit:

- `.env`: evita versionar variaveis locais.
- `.env.*`: evita versionar arquivos de ambiente por perfil.
- `!.env.example`: permite versionar um exemplo sem segredos.
- `Thumbs.db`: evita arquivo gerado pelo Windows Explorer.
- `coverage/`: evita artefatos de cobertura quando testes forem adicionados.

O `.gitignore` nao foi alterado nesta etapa.

## Confirmacao de seguranca

- Codigo da aplicacao alterado: nao.
- Configuracoes alteradas: nao.
- Dependencias instaladas/modificadas: `npm ci` criou `node_modules` de forma reprodutivel; `package.json` e lockfile nao foram alterados.
- Lockfile alterado: nao.
- Git inicializado: sim, apenas localmente.
- Arquivos staged: nao.
- Commit criado: nao.
- Push realizado: nao.
- Remoto adicionado: nao.
- Deploy realizado: nao.
