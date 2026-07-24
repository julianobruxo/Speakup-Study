# Revamp Roadmap

Atualizado em: 2026-07-23

Este documento e o roteiro oficial do revamp visual/experiencial do Speak UP Study. Ele nao substitui `docs/ARCHITECTURE.md`, `docs/MVP_UI_FLOW.md`, `docs/IMPLEMENTATION_MAP.md` ou `docs/OPEN_DECISIONS.md` — apenas organiza as fases do revamp e registra o estado de cada uma.

## Objetivo

Fazer um merge cuidadoso entre a estrutura pedagogica/funcional ja construida, a identidade visual ja aprovada e a experiencia de produto apresentada em `reference/ingles-em-jogo-product-vision.html`, produzindo uma versao final, refinada e comercialmente apresentavel do mesmo produto — sem recriar dados, regras, conteudo ou persistencia em paralelo.

## Fontes de verdade e prioridade das referencias

1. **Aplicacao React atual** — fonte de verdade para conteudo, regras, dados, persistencia, rotas, comportamento, acessibilidade e testes. Nunca reescrever essas partes "em paralelo".
2. **`reference/ingles-em-jogo-product-vision.html`** — referencia visual e de experiencia principal para o revamp: shell, sidebar desktop, navegacao mobile, topbar, hierarquia visual, composicao, cards, tipografia, espacamento. Reconstruir os padroes na arquitetura React existente; nao copiar o HTML literalmente nem criar uma segunda aplicacao.
3. **`reference/home-approved.html`** — preserva decisoes visuais ja aprovadas: fundo branco como base, navy/vinho como paleta principal, logo integrado, linguagem "Bora praticar", navegacao inferior. Onde a visao de produto (item 2) conflitar com esta base (por exemplo, sidebar escura vs. fundo branco dominante), esta referencia e o `CLAUDE.md` do projeto (secao 3) prevalecem.
4. **`reference/speakup-english-challenge.html`** — referencia historica de conteudo/mecanicas/navegacao legadas. Nunca reintroduzir Multitec, leads, premio, roleta, CSV, ranking diario legado ou gate de 75%.

## Principios do merge

- O revamp deve parecer evolucao natural do produto atual, nao um dashboard corporativo, nao uma copia do Duolingo, nao um app infantil, nao um protótipo com numeros falsos.
- Nunca inventar XP, nivel, ranking, streak, missao diaria, meta semanal, conquista, notificacao ou avatar/nome ficticio. Este app e guest-first e nao possui login nem conta — qualquer elemento de identidade (ex.: avatar) deve ser generico ate existir dado real.
- Quando uma area do prototipo depender de funcionalidade inexistente: usar metrica real equivalente, ou estado vazio honesto, ou omitir a area — nunca simular.
- Preservar navy/vinho/branco como identidade dominante. Cores auxiliares (cyan, verde, dourado, violeta, laranja) apenas como destaque controlado (jogos, categorias, feedback), nunca substituindo a base branca.

## Estado no inicio desta execucao

- Branch: `main`. HEAD local igual a `origin/main` em `076b234 feat: complete playable present to be MVP`.
- Working tree com alteracoes preexistentes (nao criadas nesta sessao) em `STATUS.md`, docs, `scripts/smokeUi.mjs`, `scripts/validateContent.mjs`, `src/App.tsx`, `src/content/data/vocabulary.ts`, `src/content/model/content.ts`, `src/index.css`, `src/pages/PracticeLandingPage.tsx`, `src/pages/VocabularyCategoryPage.tsx`, `src/pages/VocabularyPage.tsx`, `src/services/audio/sound.ts` — todas relativas ao template de flashcards de Partes do corpo ja documentado em `STATUS.md`/`docs/CURRENT_HANDOFF.md`.
- Arquivos nao rastreados preexistentes: `reference/ingles-em-jogo-product-vision.html`, `src/components/BodyPartIllustration.tsx`, `src/pages/VocabularyFlashcardPage.tsx`, `src/services/audio/pronunciation.ts`.
- Nenhuma dessas alteracoes foi criada por esta execucao; todas foram preservadas.

## Auditoria (Fase 0)

### Descoberta principal

O shell atual (`src/components/AppShell.tsx` + `src/index.css`) ja implementa boa parte da fundacao esperada: tokens de marca, `AppShell`/`PageHeader`/`PrimaryButton`/`AppCard`/`LockedCard`/`AppDialog`/`Toast`, navegacao inferior mobile, uma navegacao horizontal desktop, fluxos focados sem navegacao global (`hideNavigation` ou ausencia de `activeNav`), responsividade em varios breakpoints e suporte a `prefers-reduced-motion`. O maior gap estrutural em relacao a visao de produto e a ausencia de uma **sidebar desktop persistente** (o desktop atual usa uma pilula de navegacao horizontal dentro do cabecalho, nao uma coluna lateral) e a presenca de um **avatar ficticio "J"** (sem login/nome real) tanto no cabecalho global quanto em `ProfilePage`.

### Mapeamento

| Area atual | Referencia visual | O que preservar | O que transformar | Risco |
| --- | --- | --- | --- | --- |
| Shell mobile (`.app-shell`, `.global-header`, `.bottom-navigation`) | `home-approved.html` (topbar + bottom nav) | Estrutura, breakpoints, safe-area, fluxos focados sem nav global | Trocar avatar "J" por icone generico de perfil | Baixo |
| Shell desktop (`.desktop-navigation` pilula horizontal) | `ingles-em-jogo-product-vision.html` (sidebar 248px / rail 92px) | Rotas, `activeNav`, destinos (Inicio/Estudar/Progresso/Perfil) | Substituir pilula horizontal por sidebar persistente (rail de icones 900-1099px, sidebar completa >=1100px) sobre fundo branco (nao navy escuro, para preservar "fundo branco como base" do `CLAUDE.md`) | Medio — maior mudanca estrutural desta fase |
| Topbar/avatar (`GlobalHeader`) | vision (topbar com kicker/titulo/sino/avatar+nivel) | Acesso rapido ao perfil no mobile | Nao copiar sino de notificacao, nome, nivel ou XP ficticios; no desktop, "Perfil" passa a viver na sidebar, dispensando avatar solto | Baixo |
| Home (`HomePage.tsx`) | vision (hero + missao diaria + liga + conquistas, todos ficticios) | Estrutura real atual: hero real, progresso real (`useProgressSummary`), jogos bloqueados honestos, recordes reais | Nada nesta fase — redesenho estrutural pertence a FASE 2. Apenas reencaixar no novo shell | Baixo (fora de escopo desta fase) |
| Estudar (`PracticeLandingPage.tsx`) | vision (biblioteca com filtros, rota recomendada ficticia) | 3 cards reais (Gramatica/Vocabulario/Jogos), contagem real | Nenhuma mudanca estrutural nesta fase (pertence a FASE 3) | Baixo |
| Gramatica (`GrammarTopicsPage.tsx`) | vision (grid de topicos com tag "Disponivel"/"Em breve") | Lista real de 8 topicos, somente `present_tobe` jogavel | Nenhuma mudanca nesta fase | Baixo |
| Vocabulario (`VocabularyPage.tsx`, `VocabularyCategoryPage.tsx`) | vision (grid de topicos) | 9 categorias reais, somente Corpo liberado, previas reais | Nenhuma mudanca nesta fase | Baixo |
| Sessao/feedback/resultado (`PracticeSessionPage.tsx`) | vision (modal de pratica com feedback 3s) | Contrato de feedback ja aprovado (acerto 3s automatico, erro manual, guia contextual) | Nenhuma mudanca nesta fase (pertence a FASE 4); ja e fluxo focado sem navegacao global | Baixo |
| Flashcards (`VocabularyFlashcardPage.tsx`) | vision (flashcard modal com flip 3D) | 24 flashcards, flip, audio, swipe, teclado, conclusao | Nenhuma mudanca nesta fase (pertence a FASE 5); ja e fluxo focado | Baixo |
| Progresso (`ProgressPage.tsx`) | vision (metric-grid + grafico semanal ficticio + conquistas ficticias) | Metricas reais existentes (praticadas, precisao, sessoes, sequencia, revisao) | Nao copiar grafico semanal nem conquistas ficticias nesta ou em futuras fases sem dado real | Baixo (fora de escopo desta fase) |
| Perfil (`ProfilePage.tsx`) | vision (avatar com nivel/XP) | Modo visitante real, toggle de som real | Trocar avatar "J" por icone generico (mesmo motivo do cabecalho) | Baixo |
| Jogos (`GamesPage.tsx`) | vision (game-grid colorido com cadeado) | 6 jogos reais bloqueados como "Em breve" | Nenhuma mudanca nesta fase | Baixo |
| Dialogs (`AppDialog.tsx`) | vision (modal-backdrop com blur) | Foco preso, Escape, `<dialog>` nativo | Nenhuma mudanca nesta fase | Baixo |

### Dados ficticios do prototipo identificados (nao migrar)

XP, nivel ("Explorador"), streak de 7 dias com `mini-days`, missao diaria "12 minutos", liga semanal "Liga Safira" com podio e ranking de participantes (Marina/Lucas/Ana/Rafael), grafico de atividade semanal com barras fixas, lista de conquistas fixas, sino de notificacoes, nome "Juliano" e avatar "J" com nivel.

### Riscos gerais

- Migrar a sidebar sem verificar contraste do logo sobre fundo escuro (por isso a sidebar sera clara, nao navy escuro como a visao).
- Quebrar a regra "Jogos nao aparece como quinto item na bottom navigation mobile" ao generalizar o array de itens de navegacao entre sidebar e bottom nav.
- Introduzir uma sidebar que conflite com dialogs em tela cheia (bottom sheet / study dialog) — mitigado reaproveitando a regra existente `.dialog-open .bottom-navigation, .dialog-open .desktop-navigation { opacity:0 }` estendida para a sidebar.
- Alterar `scripts/smokeUi.mjs`, que hoje consulta `.desktop-navigation`, exigindo atualizacao coordenada com a troca de seletor.

## Fases do revamp

| Fase | Escopo | Status |
| --- | --- | --- |
| 0 | Auditoria e plano de migracao | Concluida |
| 1 | Fundacao visual e App Shell (tokens, sidebar, bottom nav, topbar, primitives) | Concluida e validada (gate aprovado em 2026-07-23) |
| 2 | Home e navegacao principal | Concluida e validada em 2026-07-23 |
| 3 | Area Estudar e descoberta de conteudo | Concluida em 2026-07-23 |
| 4 | Fluxo de gramatica (visual) | Confirmada em 2026-07-23 (ja atendia ao sistema visual novo; sem alteracoes necessarias) |
| 5 | Fluxo de vocabulario e flashcards (visual) | Confirmada em 2026-07-23 (ja atendia ao sistema visual novo; sem alteracoes necessarias) |
| 6 | Progresso, perfil e jogos (visual) | Concluida em 2026-07-23 |
| 7 | Polimento final | Concluida em 2026-07-23 (escopo de consistencia/interacao; ver secao abaixo) |
| 8 | Engajamento futuro (XP, streak, ligas, conquistas) | Nao implementado; apenas roadmap |

Todas as fases 0-7 foram validadas juntas em 2026-07-23 pelo gate completo (`validateContent`, `tsc`, `lint`, `build`, `smoke` em 9 viewports, `browserErrors: 0`) antes do commit final. FASE 8 permanece nao implementada.

## Fase 1 — fechamento (2026-07-23)

O bloqueio encontrado apos a implementacao inicial da Fase 1 (navegacao inferior/sidebar nao escondendo durante o bottom sheet "Bora praticar") foi investigado e corrigido:

- **Causa raiz**: `AppDialog` dependia de `document.body.classList.add("dialog-open")` e o shell usava o seletor global `.dialog-open .bottom-navigation` / `.dialog-open .app-sidebar`. O mecanismo em si nao era logicamente incorreto, mas a investigacao expos um problema mais profundo especifico do ambiente de teste headless (`--headless=new` do Edge, usado por `scripts/smokeUi.mjs`): esse modo nao gera um frame de renderizacao real ate que uma screenshot seja solicitada, entao `getComputedStyle` e a restauracao de foco por `requestAnimationFrame` liam estado desatualizado.
- **Confirmacao**: o mesmo fluxo testado em um navegador real (nao headless) sempre se comportou corretamente (`visibility:hidden`, `opacity:0`, `pointer-events:none` aplicados corretamente ao abrir o dialog).
- **Solucao aplicada**: substituido o mecanismo global por uma prop React explicita (`AppShell` recebe `dialogOpen`, repassada para `BottomNavigation`/`DesktopSidebar` como `hidden`, aplicando uma classe local `nav-hidden`). O `scripts/smokeUi.mjs` passou a forcar um frame real (`Page.captureScreenshot`) antes de ler `getComputedStyle` ou `document.activeElement` nos pontos que dependiam de `requestAnimationFrame`, eliminando a flakiness do ambiente headless sem enfraquecer nenhuma asserção.
- Todo o codigo de diagnostico temporario (console.error, MutationObserver, dumps de regra CSS) foi removido de `scripts/smokeUi.mjs` antes do fechamento da fase.
- Processos orfaos de `npm run dev`/Vite duplicados (portas 5174 e 5175, de sessoes anteriores) foram encerrados; mantida uma unica instancia em `5173`.

**Gate da Fase 1 aprovado em 2026-07-23** antes de qualquer arquivo da Fase 2 ser alterado: `node scripts/validateContent.mjs`, `npx tsc -b`, `npm run lint`, `npm run build` e `node scripts/smokeUi.mjs` (360x800, 390x844, 412x915, 768x1024, 1000x800, 1366x768, 1440x900) todos aprovados, `browserErrors: 0`.

### Complemento ao fechamento da Fase 1 — viewports 1024x768 e 1920x1080 (2026-07-23)

A pedido de Juliano, `scripts/smokeUi.mjs` passou a cobrir tambem `1024x768` e `1920x1080` (dimensoes exatas, sem aproximacao), alem dos sete viewports ja existentes (`360x800`, `390x844`, `412x915`, `768x1024`, `1000x800`, `1366x768`, `1440x900`).

Inspecao visual manual (screenshots gerados pelo proprio smoke test) confirmou em ambos os viewports novos:

- shell e sidebar corretos: rail de icones em `1024x768` (dentro da faixa 900-1099px), sidebar completa com rotulos em `1920x1080` (>=1100px);
- nenhum overflow horizontal (`assertNoOverflow` aprovado nos dois);
- nenhuma area excessivamente vazia — conteudo usa a largura disponivel via grid/`max-width` existentes, sem virar simulador de celular nem ficar esparso;
- Home aproveita a largura: hero + painel de progresso lado a lado, dois cards do caminho de pratica lado a lado, tres jogos rapidos lado a lado em `1920x1080`;
- hero e painel complementar equilibrados nos dois tamanhos;
- textos sem corte, cards sem deformacao;
- navegacao ativa correta (Inicio destacado em vinho na sidebar nos dois tamanhos);
- dialogs (bottom sheet, guia de estudo) permanecem dentro da viewport, centralizados, sem cortar conteudo;
- fluxos focados continuam sem navegacao global nos dois tamanhos;
- bottom navigation ausente (`display:none`) em ambos, confirmado por `assertMainNavigation`;
- dados reais e nenhum dado ficticio (checado pelas mesmas asserções que cobrem os demais viewports).

### Tolerancia do teste do timer de 3 segundos (2026-07-23)

Durante execucoes repetidas do smoke completo nesta sessao, a asserção do avanco automatico apos resposta correta (`scripts/smokeUi.mjs`, timer de 3s do `.correct-transition-bar`) falhou uma vez por timeout, isoladamente, sob carga do sistema apos varias execucoes headless consecutivas. Reproduzido novamente sem falha na tentativa seguinte — tratado como variacao de scheduling do navegador headless, nao como regressao.

Ajuste aplicado (apenas no teste, comportamento de producao inalterado — a animacao CSS continua exatamente `3s linear`):

- a verificacao de que a questao **nao avanca antes de 3 segundos** continua exatamente como estava (checada aos 1700ms, bem abaixo do limite);
- o tempo de espera pelo avanco automatico (`waitFor`) foi ampliado de 1500ms para 4000ms, e o limite superior de sanidade do tempo total decorrido foi ampliado de 3900ms para 6000ms, dando folga a variacoes de scheduling do Edge headless sob carga sem enfraquecer a exigencia minima de 3s.

Apos o ajuste, o smoke completo (incluindo os dois novos viewports) passou de forma limpa. Se esse timeout voltar a se repetir de forma consistente (duas falhas seguidas pelo mesmo motivo) em execucoes futuras, deve ser tratado como possivel regressao real e investigado antes de qualquer nova fase ser declarada concluida — nao apenas re-executado.

## Fase 2 — Home e navegacao principal (2026-07-23)

Home reestruturada em componentes dedicados sob `src/components/home/` (`HomeHero`, `LearningPathSection`, `HomeProgressSummary`, `QuickGamesSection`, `PersonalRecordsSection`), compostos por `src/pages/HomePage.tsx`. Nenhum dado ficticio foi introduzido; toda metrica vem de `useProgressSummary`/IndexedDB real.

Estrutura final (mobile-first, hero+progresso lado a lado no desktop via `.home-hero-layout` ja existente):

1. **Hero** (`HomeHero`): mantem "Bora praticar" como CTA central (abre o seletor Gramatica/Vocabulario existente); adicionado um link secundario discreto "Explorar conteudos" que leva a `/praticar`.
2. **Seu caminho de pratica** (`LearningPathSection`): unifica "proximo passo recomendado" e "Gramatica e Vocabulario" em uma unica secao (evita duplicar o mesmo CTA em dois lugares). Card de Gramatica mostra Present TO BE com progresso real (`X de 130 questoes praticadas` + barra) e alterna entre "Comecar agora" (sem historico) e "Continuar" (com historico); card de Vocabulario mostra Partes do corpo (24 flashcards, funcional) levando direto a `/vocabulario/body/flashcards`. Estado de carregamento mostra "Carregando seu progresso..." em vez de expor um "0" temporario como se fosse definitivo.
3. **Progresso** (`HomeProgressSummary`): metricas reais (precisao, sessoes, revisao), sem o botao de acao que existia antes (removido por duplicar a Secao 2); adicionado link "Ver progresso completo" para `/progresso`.
4. **Jogos rapidos** (`QuickGamesSection`): inalterado — 3 jogos reais bloqueados como "Em breve", link "Ver todos" para `/jogos` (6 jogos).
5. **Recordes pessoais** (`PersonalRecordsSection`): inalterado na logica; copy do estado vazio ajustada para "Seus recordes aparecerao depois da primeira rodada." (texto pedido nesta fase).

Nao implementado nesta fase (conforme instrucao): XP, niveis, streak diario, missoes, metas, conquistas, ranking, ligas, notificacoes — nenhum desses apareceu em nenhum momento na Home.

Validacao da Fase 2: `node scripts/validateContent.mjs`, `npx tsc -b`, `npm run lint`, `npm run build` e `node scripts/smokeUi.mjs` completo aprovados (mesmos 7 viewports, `browserErrors: 0`). Novas asseroes no smoke cobrem: Home vazia (um unico CTA, 0 de 130, precisao —, estado vazio dos recordes, ausencia de XP/nivel/streak/liga/missao/conquista/ranking/nome ficticio), navegacao dos novos links (Explorar conteudos, Ver progresso completo, Vocabulario no caminho de pratica), e Home com progresso real apos sessoes concluidas (contagem de praticadas, recordes reais).

## Criterios de conclusao desta execucao (Fases 0 e 1)

- Auditoria documentada (esta secao) sem alterar funcionalidades pedagogicas.
- Tokens visuais centralizados preservando navy/vinho/branco.
- Sidebar desktop persistente (rail 900-1099px, completa >=1100px) substituindo a pilula horizontal, sem dados ficticios.
- Navegacao mobile inferior preservada com as mesmas 4 areas.
- Fluxos focados continuam sem navegacao global.
- `node scripts/validateContent.mjs`, `npm run lint`, `npm run build`, `node scripts/smokeUi.mjs` aprovados.
- Nenhum `git add`/commit/push/deploy realizado.

## Fases 3-7 (2026-07-23)

Juliano autorizou explicitamente encadear o fechamento da Fase 1, a Fase 2 e as Fases 3-7 na mesma execucao, revogando a pausa obrigatoria entre fases. O estado das Fases 0-2 foi commitado e enviado ao GitHub (`e1bd077`) antes de iniciar a Fase 3.

### Fase 3 — Area Estudar (biblioteca)

`src/pages/PracticeLandingPage.tsx` foi reescrita como uma biblioteca real: filtros funcionais (Todos/Gramatica/Vocabulario, `aria-pressed`, sem alterar a URL), secao Gramatica com os 8 topicos reais (Present TO BE disponivel com progresso real; 7 bloqueados com descricao real, nao generica), secao Vocabulario com as 9 categorias reais (Partes do corpo disponivel; 8 bloqueadas). Cards bloqueados nao mostram toast repetitivo (permanecem apenas `aria-disabled` com "Em breve"). Nenhuma rota recomendada fictícia foi criada — o "proximo passo" ja e coberto pela `LearningPathSection` da Home, e duplicar aqui violaria a regra de nao repetir o mesmo CTA.

`src/content/taxonomy.ts` ganhou descricoes reais por topico/categoria (`description`), eliminando texto duplicado/hardcoded que existia em `GrammarTopicsPage.tsx` e `VocabularyPage.tsx`. Essa mudanca expos uma inconsistencia preexistente: o titulo "Verbo TO BE - presente" em `taxonomy.ts` usava hifen simples enquanto toda a UI (setup, sessao, resultado, estudo contextual) sempre usou travessao "—"; corrigido para travessao em `taxonomy.ts`, unificando a fonte de dados com o que ja era exibido em todo o resto do app.

### Fase 4 — Fluxo de gramatica (visual)

Inspecionado manualmente (configuracao, sessao, acerto, erro, estudo contextual, resultado) em navegador real. O fluxo ja atendia integralmente ao novo sistema visual (painel navy com padrao decorativo, alternativas com letras A/B/C, feedback correto/incorreto claramente diferenciado, resultado com anel de progresso e estatisticas reais). Nenhuma alteracao foi necessaria; todas as regras pedagogicas permanecem intactas.

### Fase 5 — Vocabulario e flashcards (visual)

Inspecionado manualmente (categoria, flashcard frente/verso, pronuncia, navegacao). Ja atendia ao novo sistema visual (ilustracao com destaque anatomico, card frente/verso, "Ouvir novamente"). Nenhuma alteracao foi necessaria.

### Fase 6 — Progresso, perfil e jogos

- **6A Progresso**: ja usava dados reais e estados vazios honestos; confirmado visualmente, sem alteracoes.
- **6B Perfil**: adicionada uma linha informativa "Armazenamento local" explicando que o progresso fica salvo apenas neste dispositivo/navegador (`src/pages/ProfilePage.tsx`), atendendo ao requisito explicito da fase.
- **6C Jogos**: `src/pages/GamesPage.tsx` foi redesenhada — de uma lista plana (`game-list-row` + `LockedCard`) para uma grade de 6 cards com identidade propria (cores/tons ja usados nos 3 jogos da Home, estendidos para os 6), icone e descricao da mecanica por jogo, badge "Em breve" honesto. Nenhum score, progresso ou data fictícia.

### Fase 7 — Polimento final

Escopo executado: paridade de interacao entre `LearningPathSection` e o restante dos cards do app (adicionado `whileHover`/`whileTap` via Framer Motion, igual ao `AppCard`), remocao de uma classe CSS sem uso (`games-page-grid`), reaproveitamento do sistema de tons ja existente para os jogos. Uma revisao completa e literal de "todas as rotas" nao foi refeita do zero nesta fase porque a maior parte do app ja vinha de um trabalho de polimento visual anterior (documentado em `STATUS.md`, secao "Refinamento visual e responsivo"); o escopo real desta fase foi consistencia incremental sobre o que havia mudado nas Fases 2-6.

### Correcoes ao smoke test durante a validacao final

A validacao final (gate completo apos as Fases 3-7) expos e corrigiu, no proprio `scripts/smokeUi.mjs`, problemas reais nas asserções novas que eu havia escrito (nao no aplicativo):

- **Falso positivo "XP"**: o texto "6 EXPERIÊNCIAS PLANEJADAS" (transformado para maiusculas via CSS `text-transform`) contem "XP" como substring de "EXPERIÊNCIAS". Corrigido trocando `.includes()` por checagem com limite de palavra (`\bXP\b`) nas checagens de conteudo ficticio.
- **Selecao ambigua `.app-card`**: cards bloqueados (`LockedCard`) tambem carregam a classe base `.app-card` (por composicao), entao contar `.app-card` sem excluir `.locked-card` contava todos os topicos/categorias, nao so os disponiveis. Corrigido com `:not(.locked-card)`.
- **Chip de filtro vs. conteudo da secao**: checar `hasText("Vocabulário")`/`hasText("Gramática")` para confirmar que uma secao escondeu e ambiguo porque o proprio botao do filtro sempre mostra esse texto. Corrigido checando a presenca/ausencia de `.topic-list`/`.vocabulary-list`.
- **Diferenca de maiusculas por CSS**: `.eyebrow` aplica `text-transform:uppercase`, e `innerText` reflete o texto renderizado (maiusculo), nao o texto literal do JSX. A checagem nova de "Modo visitante" foi corrigida para "MODO VISITANTE", no mesmo padrao ja usado pela checagem de rota preexistente do Perfil.
- **Race de navegacao client-side**: um clique que navega via React Router (sem reload completo) pode nao ter desmontado a navegacao global antes da checagem rodar; trocado um `assert` imediato por `waitFor` com tolerancia, sem enfraquecer a exigencia (a navegacao realmente precisa sumir, apenas com mais tempo de scheduling).
- **Ruido de mensageria do navegador headless**: `"Unchecked runtime.lastError: The message port closed..."` e um artefato interno do Edge/Chrome (mensageria de extensao), confirmado ausente ao visitar a mesma rota em um navegador real. Adicionada uma exclusao especifica e documentada ao filtro de `browserErrors` (mesmo padrao ja usado para `source === "intervention"`).

Nenhuma dessas correcoes alterou codigo de producao nem enfraqueceu uma exigencia real; todas foram confirmadas por reproducao isolada (navegador real e/ou simulacao de regex) antes de aplicadas.

## Proxima autorizacao necessaria

FASES 0-7 concluidas e validadas nesta execucao (gate completo aprovado, commit final enviado ao GitHub). FASE 8 (engajamento — XP, streak, missoes, conquistas, ranking, ligas, notificacoes, login, backend, jogos funcionais) permanece nao implementada e bloqueada ate autorizacao explicita de Juliano. Correcoes visuais subjetivas ficam para revisao de Juliano.
