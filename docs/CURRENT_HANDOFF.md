# Current Handoff

Atualizado em: 2026-07-23

## Visao do produto

Speak UP Study e um jogo simples e standalone de pratica de ingles. O app e publico, gratuito no MVP, e pode futuramente ter anuncios ou Premium, desde que isso nao interrompa pratica ativa.

Este produto e separado do Speak UP ERP e do SpeakIt. Nao deve incluir turmas, professores, matricula, contratos, financeiro escolar, integracao obrigatoria com escola ou dependencia de login para comecar.

## Estado tecnico

- Stack: Vite 8, React 19, React Router 7, TypeScript 6, Tailwind CSS 4, Oxlint.
- Branch atual: `main`.
- Commits locais:
  - `feat: complete playable present to be MVP`
  - `ce27d32 fix: rebalance present to be pilot content`
  - `5811a13 feat: add present to be pilot content`
  - `b70f520 feat: normalize legacy vocabulary content`
  - `99ad453 feat: establish MVP content foundation and references`
  - `06af0e4 chore: establish initial project baseline`
- Remoto: `origin` em `https://github.com/julianobruxo/Speakup-Study.git`.
- Push: branch `main` publicada; deploy nao realizado.
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

Multitec, leads, ranking, roleta, premios, CSV, gate de 75%, login, sync, analytics, PWA, monetizacao, backend, pratica funcional de vocabulario, migracao dos jogos e migracao dos outros sete topicos gramaticais.

## Proxima tarefa

O MVP visual, o fluxo funcional de `present_tobe` e a persistencia local estao consolidados no commit `feat: complete playable present to be MVP`. A Home e Progresso usam metricas reais salvas em IndexedDB; sessoes futuras priorizam ineditas, ultimo erro e itens vistos ha mais tempo. Aguardar revisao do usuario e nao iniciar outro topico, ranking, login, backend, sync ou deploy sem nova autorizacao.

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
- O servidor Vite foi validado em `127.0.0.1:5173`.
- Rotas conhecidas para smoke test: `/`, `/bem-vindo`, `/tutorial`, `/hub`, `/estudar`, `/praticar`, `/vocabulario`.

## Regras Git

- Nunca criar commit sem autorizacao expressa para aquele commit.
- Autorizacao de commit nao implica push.
- Nunca fazer push, adicionar remoto, criar PR, tag, release ou deploy sem autorizacao expressa.
- Evitar `git add` salvo quando houver autorizacao de stage ou commit-ready state.

## Handoff do MVP visual

Rotas finais:

- `/`: home guest-first.
- `/praticar`: escolha entre Gramatica, Vocabulario e Jogos.
- `/gramatica`: oito topicos; somente `present_tobe` disponivel.
- `/gramatica/present_tobe`: configuracao de dificuldade e quantidade.
- `/praticar/present_tobe/sessao`: quiz e resultado.
- `/vocabulario` e `/vocabulario/:categoryId`: catalogo e previa, sem pratica.
- `/jogos`: seis jogos em estado "Em breve".
- `/progresso`: estado vazio inicial e resumo real por dificuldade, revisao e recordes apos a pratica.
- `/perfil`: modo visitante e preferencia de som.

Componentes principais:

- `AppShell`, `GlobalHeader`, `PageHeader`, `GlobalNavigation`.
- `AppCard`, `LockedCard`, `PrimaryButton`.
- `AppDialog`, `AppIcon`, `Toast`.

Servicos simples:

- `selectPracticeQuestions`: filtro, embaralhamento deterministico e corte sem repeticao.
- `shuffleOptions`: embaralhamento visual das alternativas.
- `sound`: efeitos Web Audio e preferencia local de som.
- `localProgress`: IndexedDB nativo para respostas por questao e sessoes concluidas.
- `practicePreferences`: ultima dificuldade e tamanho em `localStorage`.
- `useProgressSummary`: leitura reativa das metricas sem acesso direto a storage nos componentes.

Metricas locais:

- praticadas = IDs unicos respondidos;
- precisao = acertos / todas as respostas confirmadas;
- revisao = ultimo resultado incorreto;
- recordes = somente sessoes concluidas;
- sessao abandonada nao entra no historico de sessoes.

Ranking global semanal continua como fase futura, sem UI ou participantes ficticios. Depende de login ou identidade opcional, apelido publico, backend compartilhado, regra de pontos, periodo semanal, privacidade e prevencao minima contra pontuacao artificial.

Validacoes:

- `node scripts/validateContent.mjs`.
- `npm run lint`.
- `npm run build`.
- `node scripts/smokeUi.mjs`.

O smoke automatizado cobre 360x800, 390x844, 768x1024, 1366x768 e 1440x900; rotas com reload; navegacao responsiva; 10/20/30 questoes; 30 itens unicos; barra e timer de acerto; bloqueio de avancamento antecipado; erro manual; guia contextual; X, Escape e Voltar ao jogo; retorno de foco; score; sequencia; replay; saida; voltar do navegador e zero erro de browser.

## Contrato atual de feedback

- Acerto: alternativas bloqueadas, `Correto!`, barra verde linear de 0% a 100% em 3 segundos e avancamento automatico unico.
- Erro: alternativa escolhida, resposta correta e feedback armazenado; nenhuma espera automatica; `Continuar` e clique no card avancam.
- Estudo: somente no erro; classificador local simples e guia completo de Present TO BE; nenhum metadado foi adicionado ao banco.
- Estado: abrir ou fechar o estudo nao altera resposta, score, sequencia, posicao ou som.
- Acessibilidade: `aria-live`, progressbar descrita, foco no feedback, dialog modal nativo, Escape e retorno ao gatilho.
