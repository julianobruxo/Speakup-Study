# Current Handoff

Atualizado em: 2026-07-23

## Visao do produto

Speak UP Study e um jogo simples e standalone de pratica de ingles. O app e publico, gratuito no MVP, e pode futuramente ter anuncios ou Premium, desde que isso nao interrompa pratica ativa.

Este produto e separado do Speak UP ERP e do SpeakIt. Nao deve incluir turmas, professores, matricula, contratos, financeiro escolar, integracao obrigatoria com escola ou dependencia de login para comecar.

## Estado tecnico

- Stack: Vite 8, React 19, React Router 7, TypeScript 6, Tailwind CSS 4, Oxlint.
- Branch atual: `master`.
- Commits locais:
  - `5811a13 feat: add present to be pilot content`
  - `b70f520 feat: normalize legacy vocabulary content`
  - `99ad453 feat: establish MVP content foundation and references`
  - `06af0e4 chore: establish initial project baseline`
- Remoto: nenhum configurado.
- Push/deploy: nenhum realizado.
- Validacoes disponiveis: `npm run lint`, `npm run build`, `node scripts/validateContent.mjs`.
- Estrutura principal de conteudo: `src/content/taxonomy.ts`, `src/content/model/content.ts`, `src/content/data/vocabulary.ts`, `src/content/data/irregularVerbs.ts`, `src/content/data/presentTobeQuestions.ts`.

## Referencias

- `reference/home-approved.html`: referencia visual aprovada para home e direcao de marca; standalone/offline, fundo branco, logo embutido, navy/vinho, chamada "Bora praticar" e navegacao inferior.
- `reference/speakup-english-challenge.html`: legado funcional; contem banco `TOPIC_BANK`, jogos e mecanicas antigas. Deve ser usado como referencia de conteudo e comportamento, nao como escopo automatico de migracao.

## MVP de gramatica

Topicos ativos:

- `present_tobe`
- `past_tobe`
- `simple_present`
- `present_continuous`
- `be_going_to`
- `simple_past`
- `there_tobe`
- `prepositions`

Todos os topicos ativos tem nivel de entrada `beginner`, dificuldades `easy` e `medium`, meta de 50 + 80 questoes e nenhum `challenge` no MVP atual.

Somente `present_tobe` foi migrado ate agora. Ele tem 130 questoes: 50 `easy` e 80 `medium`.

Distribuicao editorial principal final de `present_tobe`:

- Total: 65 afirmativas, 22 negativas, 30 perguntas e 13 respostas curtas.
- Easy: 30 afirmativas, 8 negativas, 9 perguntas e 3 respostas curtas.
- Medium: 35 afirmativas, 14 negativas, 21 perguntas e 10 respostas curtas.

## MVP de vocabulario

Categorias ativas:

- Body
- Clothes
- Furniture
- Animals
- Jobs
- Places
- Action Verbs
- Routine Verbs
- Irregular Verbs

Quantidades atuais:

- 80 itens de vocabulario regular.
- 50 Irregular Verbs.
- 7 modos futuros de pratica para Irregular Verbs: `base-to-past`, `base-to-participle`, `past-to-base`, `participle-to-base`, `verb-to-translation`, `translation-to-verb`, `mixed`.

## Regras pedagogicas

- Repetir a habilidade, nao decorar a frase.
- Evitar duplicatas cosmeticas e clones com apenas troca de nome.
- Usar vocabulario comum, claro e contextual.
- Evitar idioms, slang, regionalismos e expressoes opacas no MVP.
- Basear dificuldade em estrutura, contexto, contraste e ordem de palavras.
- Manter tres alternativas por questao.
- Garantir feedback curto, pedagogico e em portugues natural.
- Evitar repeticao na mesma sessao futura quando houver itens suficientes.
- Conteudo migrado ou gerado exige revisao humana.

## Fora do MVP atual

Multitec, leads, ranking, roleta, premios, CSV, gate de 75%, login, sync, analytics, PWA, monetizacao, backend, motor de sessao, randomizacao, storage e migracao dos jogos.

## Proxima tarefa

O proximo passo recomendado e decidir se o banco `present_tobe` rebalanceado esta aprovado como padrao para migrar `past_tobe`. Os outros sete topicos gramaticais continuam nao migrados.

## Ambiente do terminal

- Causa do erro anterior no PowerShell do VS Code: Node/npm estavam instalados, mas o PATH do usuario nao continha `C:\Program Files\nodejs`; a entrada existia no PATH de maquina e podia nao estar disponivel para processos ja abertos.
- Node encontrado: `C:\Program Files\nodejs\node.exe`.
- npm encontrado: `C:\Program Files\nodejs\npm.cmd` / `npm.ps1`.
- Node validado: `v22.22.0`.
- npm validado: `10.9.4`.
- PATH temporario do processo foi prefixado com `C:\Program Files\nodejs`.
- PATH do usuario foi atualizado adicionando `C:\Program Files\nodejs`, sem remover entradas existentes e sem duplicar.
- Validacao obrigatoria em novo PowerShell: `node -v` e `npm -v` passaram.
- Comando de desenvolvimento validado: `npm run dev -- --host 127.0.0.1 --port 5173`.
- URL de smoke test: `http://127.0.0.1:5173/`.
- Smoke test HTTP: `/`, `/bem-vindo`, `/tutorial`, `/hub`, `/estudar`, `/praticar` e `/vocabulario` responderam 200 com HTML.
- Servidor Vite mantido ativo em `127.0.0.1:5173`; listener observado no PID `28360` (`node.exe`).
- Rotas conhecidas para smoke test: `/`, `/bem-vindo`, `/tutorial`, `/hub`, `/estudar`, `/praticar`, `/vocabulario`.

## Regras Git

- Nunca criar commit sem autorizacao expressa para aquele commit.
- Autorizacao de commit nao implica push.
- Nunca fazer push, adicionar remoto, criar PR, tag, release ou deploy sem autorizacao expressa.
- Evitar `git add` salvo quando houver autorizacao de stage ou commit-ready state.
