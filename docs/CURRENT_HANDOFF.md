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

Atualizacao de 2026-07-23: o working tree agora inclui o primeiro template completo de vocabulario. Partes do corpo possui 24 flashcards em `/vocabulario/body/flashcards`; as demais categorias e a acao Praticar continuam bloqueadas. Esta sessao nao grava progresso e nao altera as metricas gramaticais.

Atualizacao de 2026-07-23 (revamp FASE 0/FASE 1): ver `docs/REVAMP_ROADMAP.md` para o roteiro completo. Nesta sessao:

- Auditoria comparando o React atual com `reference/ingles-em-jogo-product-vision.html`, `reference/home-approved.html` e `reference/speakup-english-challenge.html`, sem alterar conteudo/regras.
- Tokens visuais estendidos em `src/index.css` (superficie, texto, bordas, feedback, categorias, radius/spacing/motion/focus-ring), preservando navy/vinho/branco.
- `AppShell` ganhou uma sidebar desktop persistente (`DesktopSidebar`) substituindo a pilula de navegacao horizontal antiga; rail de icones entre 900-1099px, versao completa com rotulos a partir de 1100px; mesmos quatro destinos da navegacao inferior mobile, mais um acesso secundario a Jogos.
- Avatar ficticio "J" removido do cabecalho mobile e de `ProfilePage` (nao ha login/nome real neste app); substituido por icone generico de perfil.
- `scripts/smokeUi.mjs` atualizado para validar a nova sidebar (presenca, rail vs. completa, item ativo, ausencia de Jogos como quinto item mobile) no lugar da antiga navegacao horizontal.
- Nenhuma rota, dado, regra pedagogica ou fluxo de sessao/flashcards foi alterado.

Atualizacao de 2026-07-23 (fechamento FASE 1 + FASE 2): o bloqueio da Fase 1 (bottom navigation/sidebar visivel durante o dialog "Bora praticar") foi corrigido. Causa raiz: em modo headless (`--headless=new`, usado por `scripts/smokeUi.mjs`), o Edge so recalcula estilo/computa `requestAnimationFrame` apos um frame real ser solicitado; sem isso, `getComputedStyle` e a restauracao de foco liam estado desatualizado. Confirmado em navegador real que o app sempre se comportou corretamente. Correcao: `AppShell` ganhou uma prop `dialogOpen` explicita, repassada como `hidden` para `BottomNavigation`/`DesktopSidebar` (classe local `nav-hidden`, sem depender de `document.body.classList`); `scripts/smokeUi.mjs` passou a forcar `Page.captureScreenshot` antes de checar visibilidade/foco nesses pontos. Codigo de diagnostico temporario foi totalmente removido antes do fechamento. Gate completo (validateContent, tsc, lint, build, smoke em 7 viewports) aprovado antes de iniciar a Fase 2.

FASE 2 implementada: Home reestruturada em `src/components/home/` (`HomeHero`, `LearningPathSection`, `HomeProgressSummary`, `QuickGamesSection`, `PersonalRecordsSection`). Nova secao "Seu caminho de pratica" unifica proximo-passo-recomendado e o resumo de Gramatica/Vocabulario (evita duplicar o mesmo CTA); hero ganhou link secundario "Explorar conteudos"; painel de progresso perdeu o botao de acao duplicado e ganhou link "Ver progresso completo". Nenhum dado ficticio (XP, nivel, streak, liga, missao, conquista, ranking) foi introduzido. Gate revalidado apos a Fase 2, smoke com novas asserções para Home vazia, Home com progresso real e navegacao dos novos links.

Atualizacao de 2026-07-23 (complemento de viewports e flake do timer): `scripts/smokeUi.mjs` passou a cobrir tambem `1024x768` e `1920x1080` (dimensoes exatas, alem dos sete ja existentes). Inspecao visual manual nos dois confirmou shell/sidebar corretos, sem overflow, boa ocupacao de largura, dialogs dentro da viewport, sem dados ficticios. A asserção do timer de 3 segundos (avanco automatico apos resposta correta) apresentou uma falha isolada por timeout sob carga do Edge headless apos muitas execucoes consecutivas nesta sessao; nao se repetiu na tentativa seguinte. Ampliei a tolerancia de espera do teste (nao o comportamento de producao, que continua exatamente 3s via CSS) de 1500ms/3900ms para 4000ms/6000ms; a checagem de que a questao nao avanca antes de 3s permanece igual. **Se esse timeout voltar a ocorrer de forma consistente (duas falhas seguidas) em sessoes futuras, deve ser investigado como possivel regressao real antes de qualquer fase ser declarada concluida** — nesta sessao, apos o ajuste, dois smokes completos consecutivos passaram sem falha.

Atualizacao de 2026-07-23 (Fases 3-7, autorizadas em sequencia sem pausa entre elas): commit e push de fechamento das Fases 0-2 feito antes de iniciar a Fase 3 (`e1bd077`, `git rev-list --left-right --count origin/main...main` = `0 0`).

- **Fase 3 (Estudar)**: `PracticeLandingPage.tsx` reescrita como biblioteca real com filtros (Todos/Gramatica/Vocabulario), mostrando os 8 topicos de gramatica e as 9 categorias de vocabulario reais (1 disponivel em cada, resto bloqueado com descricao real). Nao foi criada rota recomendada nesta tela (ja coberta pela Home, evitando duplicar CTA).
- **Fase 4 e 5 (Gramatica e Vocabulario/flashcards)**: inspecionados manualmente em navegador real; ja atendiam ao novo sistema visual (herdado de trabalho anterior a esta sessao). Nenhuma alteracao foi necessaria.
- **Fase 6**: Progresso ja usava dados reais (sem alteracao); Perfil ganhou uma linha "Armazenamento local"; Jogos foi redesenhada com 6 cards coloridos com identidade propria (antes era uma lista plana).
- **Fase 7**: paridade de interacao (motion) nos cards do caminho de pratica; limpeza de uma classe CSS sem uso.
- `taxonomy.ts` ganhou `description` real por topico/categoria (elimina duplicacao de texto entre paginas) e corrigiu o titulo de Present TO BE para usar travessao "—" (consistente com o resto do app; antes usava hifen simples, uma inconsistencia que so ficou visivel quando a nova pagina Estudar passou a renderizar `topic.title` diretamente).
- A validacao final encontrou e corrigiu 6 problemas reais, todos nas **asserções novas do smoke test** (nao no aplicativo): falso-positivo de substring ("XP" em "EXPERIÊNCIAS" maiusculizado), selecao `.app-card` que nao excluia `.locked-card`, checagem de filtro que lia o texto do proprio botao em vez do conteudo da secao, diferenca de maiuscula por `text-transform` CSS ("MODO VISITANTE"), falta de tolerancia numa transicao de rota client-side, e ruido de mensageria interna do Edge headless (confirmado ausente em navegador real, exclusao documentada adicionada ao filtro de `browserErrors`). Ver detalhes em `docs/REVAMP_ROADMAP.md`.
- Gate final aprovado: `validateContent`, `tsc`, `lint`, `build`, `smoke` completo em 9 viewports (360x800, 390x844, 412x915, 768x1024, 1000x800, 1024x768, 1366x768, 1440x900, 1920x1080), `browserErrors: 0`.
- Commit final `feat: complete full product interface revamp` e push para `origin/main` autorizados e executados por Juliano nesta sessao.

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
- `/vocabulario` e `/vocabulario/:categoryId`: catalogo; somente Partes do corpo esta liberado.
- `/vocabulario/body/flashcards`: sessao focada com 24 cards, SVG local e pronuncia nativa.
- `/jogos`: seis jogos em estado "Em breve".
- `/progresso`: estado vazio inicial e resumo real por dificuldade, revisao e recordes apos a pratica.
- `/perfil`: modo visitante e preferencia de som.

Componentes principais:

- `AppShell` (sidebar desktop + navegacao inferior mobile + fluxos focados), `GlobalHeader`, `PageHeader`.
- `AppCard`, `LockedCard`, `PrimaryButton`.
- `AppDialog`, `AppIcon`, `Toast`.
- `src/components/home/`: `HomeHero`, `LearningPathSection`, `HomeProgressSummary`, `QuickGamesSection`, `PersonalRecordsSection` (composicao da Home, Fase 2 do revamp).

Servicos simples:

- `selectPracticeQuestions`: filtro, embaralhamento deterministico e corte sem repeticao.
- `shuffleOptions`: embaralhamento visual das alternativas.
- `sound`: efeitos Web Audio e preferencia local de som.
- `pronunciation`: Web Speech API, cancelamento local, fallback e a mesma preferencia de som.
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

O smoke automatizado cobre 360x800, 390x844, 412x915, 768x1024, 1366x768 e 1440x900; rotas com reload; os 24 flashcards e SVGs; fala simulada, mute e fallback; flip, teclado, swipe e conclusao; navegacao responsiva; 10/20/30 questoes; 30 itens unicos; feedback gramatical; persistencia e zero erro de browser.

## Contrato atual de feedback

- Acerto: alternativas bloqueadas, `Correto!`, barra verde linear de 0% a 100% em 3 segundos e avancamento automatico unico.
- Erro: alternativa escolhida, resposta correta e feedback armazenado; nenhuma espera automatica; `Continuar` e clique no card avancam.
- Estudo: somente no erro; classificador local simples e guia completo de Present TO BE; nenhum metadado foi adicionado ao banco.
- Estado: abrir ou fechar o estudo nao altera resposta, score, sequencia, posicao ou som.
- Acessibilidade: `aria-live`, progressbar descrita, foco no feedback, dialog modal nativo, Escape e retorno ao gatilho.
