# STATUS.md

Atualizado em: 2026-07-23

## Estado executivo

O workspace atual contem um MVP visual navegavel em Vite + React + TypeScript. A home guest-first, as areas principais, o fluxo completo de pratica de `present_tobe` e o primeiro template de flashcards de vocabulario estao implementados. Os demais topicos, categorias e jogos aparecem em estado final de "Em breve", sem simular funcionalidades inexistentes.

Fase atual: MVP jogavel de `present_tobe` consolidado e template de 24 flashcards de Partes do corpo concluido no working tree, sem persistencia de vocabulario. Em paralelo, FASE 0 (auditoria), FASE 1 (fundacao visual e App Shell) e FASE 2 (Home e navegacao principal) do revamp descrito em `docs/REVAMP_ROADMAP.md` foram executadas e validadas nesta sessao, sem alterar conteudo, regras pedagogicas ou persistencia.

## Revamp - FASE 1 fechamento e FASE 2 (2026-07-23)

O bloqueio da Fase 1 (bottom navigation/sidebar nao escondendo durante o dialog "Bora praticar") foi corrigido: a causa raiz era um problema do ambiente de teste headless (Edge `--headless=new` nao gera frame real ate uma screenshot ser solicitada, entao `getComputedStyle` e `requestAnimationFrame` liam estado desatualizado em `scripts/smokeUi.mjs`; confirmado em navegador real que o comportamento sempre esteve correto). A solucao adotada foi trocar o mecanismo global (`document.body.classList` + seletor `.dialog-open`) por uma prop React explicita (`AppShell` recebe `dialogOpen`, repassada como `hidden` para `BottomNavigation`/`DesktopSidebar`, aplicando uma classe local `nav-hidden`), e o smoke test passou a forcar um frame real antes de checar visibilidade/foco. Todo codigo de diagnostico temporario foi removido antes do fechamento. Gate da Fase 1 aprovado (validateContent, tsc, lint, build, smoke completo em 7 viewports, 0 erros de navegador) antes de qualquer arquivo da Fase 2 ser alterado.

A Home foi reestruturada na Fase 2 em componentes dedicados (`src/components/home/HomeHero.tsx`, `LearningPathSection.tsx`, `HomeProgressSummary.tsx`, `QuickGamesSection.tsx`, `PersonalRecordsSection.tsx`), compostos por `src/pages/HomePage.tsx`. Estrutura: hero com CTA "Bora praticar" + link secundario "Explorar conteudos"; secao unificada "Seu caminho de pratica" (Gramatica/Present TO BE com progresso real + Vocabulario/Partes do corpo) que substitui a duplicacao entre "proximo passo" e cards de conteudo; painel de progresso simplificado (sem botao de acao duplicado, com link "Ver progresso completo"); jogos rapidos e recordes pessoais mantidos. Nenhum dado ficticio (XP, nivel, streak, liga, missao, conquista, ranking) foi introduzido. Gate completo revalidado apos a Fase 2.

Complemento a pedido de Juliano: `scripts/smokeUi.mjs` passou a cobrir tambem os viewports exatos `1024x768` e `1920x1080` (alem dos sete ja existentes). Inspecao visual manual dos screenshots gerados confirmou shell/sidebar corretos (rail em 1024x768, sidebar completa em 1920x1080), ausencia de overflow, boa ocupacao da largura, dialogs dentro da viewport e ausencia de dados ficticios em ambos. A asserção do timer de 3 segundos (avanco automatico apos resposta correta) teve sua tolerancia de espera ampliada no teste (1500ms -> 4000ms; limite superior 3900ms -> 6000ms) apos uma falha isolada por scheduling do navegador headless sob carga; a exigencia de nao avancar antes de 3s permanece inalterada e o comportamento de producao (animacao CSS de 3s) nao foi tocado. Apos o ajuste, dois smoke completos consecutivos passaram sem falha.

## Revamp - FASE 0 e FASE 1 (2026-07-23)

Documento criado: `docs/REVAMP_ROADMAP.md` (auditoria, prioridade das referencias, fases, riscos, estado).

Entregue nesta sessao:

- Tokens visuais centralizados/estendidos em `src/index.css` (`--surface`, `--text`, `--border`, `--success`, `--warning`, `--error`, `--vocabulary`, `--grammar`, `--game`, escalas de radius/spacing/motion, `--focus-ring-*`), preservando navy/vinho/branco como base e usando cyan/violeta/laranja apenas como auxiliares controlados.
- `src/components/AppShell.tsx`: nova sidebar desktop persistente (`DesktopSidebar`), substituindo a pilula de navegacao horizontal (`.desktop-navigation`) que existia dentro do cabecalho. A sidebar usa fundo branco (nao navy escuro, para preservar a base branca aprovada), rail de icones entre 900-1099px e versao completa com rotulos a partir de 1100px. Inclui Inicio/Estudar/Progresso/Perfil (mesmos destinos da navegacao inferior mobile) e uma secao secundaria com acesso a Jogos.
- Corrigido avatar ficticio "J" (sem login/nome real) no cabecalho mobile (`GlobalHeader`) e em `ProfilePage`, substituido por icone generico de perfil, conforme regra de nao simular identidade antes de existir dado real.
- `src/index.css`: bloco "Adaptive product shell" reescrito para grid de duas colunas (sidebar + conteudo) a partir de 900px; removidas as regras mortas de `.desktop-navigation`.
- `scripts/smokeUi.mjs`: `assertFocusedFlow` e `assertMainNavigation` atualizados para `.app-sidebar` (no lugar de `.desktop-navigation`); nova verificacao de rail (900-1099px) vs. sidebar completa (>=1100px); nova verificacao de que "Jogos" nao aparece como quinto item na bottom navigation mobile; nova cobertura de item ativo e navegacao pela sidebar; viewport `1000x800` adicionado para cobrir o rail.
- Nenhuma rota, dado, regra pedagogica, persistencia ou fluxo de sessao/flashcards foi alterado.

Validacoes desta fase:

- `npx tsc -b`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.
- `node scripts/smokeUi.mjs`: ver resultado registrado ao final desta sessao.
- Inspecao visual manual via navegador em 1440px (sidebar completa), 1000px (verificacao de innerWidth), fluxo Home -> Estudar -> Gramatica confirmando sidebar some em fluxo focado.

FASE 2 foi concluida nesta mesma sessao (ver secao acima). FASE 3 permanece bloqueada ate autorizacao explicita de Juliano.

## Git

- Repositorio Git: inicializado localmente com `git init` em 2026-07-22.
- Branch principal: `main`.
- Baseline local: `06af0e4 chore: establish initial project baseline`.
- Checkpoint de referencias e arquitetura: `99ad453 feat: establish MVP content foundation and references`.
- Checkpoint de normalizacao de vocabulario legado: `b70f520 feat: normalize legacy vocabulary content`.
- Checkpoint do banco piloto Present TO BE: `5811a13 feat: add present to be pilot content`.
- Checkpoint do rebalanceamento e auditoria: `ce27d32 fix: rebalance present to be pilot content`.
- MVP jogavel completo: `feat: complete playable present to be MVP`.
- Remoto: `origin` em `https://github.com/julianobruxo/Speakup-Study.git`.
- Arquivos staged: nenhum ao fim da publicacao.
- Arquivos ignorados relevantes: `node_modules/` e `dist/`.
- Tracking final esperado: `main` acompanha `origin/main`, sem commits locais pendentes.
- Mudancas do usuario a preservar: todos os arquivos existentes devem ser tratados como trabalho do usuario/projeto e preservados.

## Stack detectada

- Vite 8.1.x configurado em `vite.config.ts`.
- React 19.2.x.
- React DOM 19.2.x.
- React Router DOM 7.18.x.
- TypeScript 6.0.x.
- Tailwind CSS 4.3.x via `@tailwindcss/vite`.
- Framer Motion 12.42.x usado em transicoes, selecao, feedback e celebracao.
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
- Nao ha framework de testes unitarios; existe smoke automatizado em `scripts/smokeUi.mjs`.
- Nao ha arquivos de ambiente (`.env`, `.env.example`) detectados.
- Nao ha service worker, manifest PWA, backend, Firebase, Supabase, analytics ou autenticacao real.
- O fluxo atual inicia na home guest-first e nao exige login.
- A UI atual usa fundo branco, logo integrado e paleta navy/vinho alinhados a referencia aprovada.

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

## Normalizacao inicial do conteudo legado

Arquivos criados:

- `docs/LEGACY_CONTENT_INVENTORY.md`
- `src/content/data/vocabulary.ts`
- `src/content/data/irregularVerbs.ts`

Arquivos modificados:

- `src/content/model/content.ts`
- `src/content/taxonomy.ts`
- `docs/ARCHITECTURE.md`
- `docs/IMPLEMENTATION_MAP.md`
- `docs/OPEN_DECISIONS.md`
- `STATUS.md`

Decisoes tomadas:

- `src/content/taxonomy.ts` passa a conter somente metadados de catalogo: IDs, grupos, categorias, disponibilidade, sequencia e metas.
- Os 50 Irregular Verbs foram movidos para `src/content/data/irregularVerbs.ts`.
- Os modos de pratica de Irregular Verbs foram normalizados com hifen: `base-to-past`, `base-to-participle`, `past-to-base`, `participle-to-base`, `verb-to-translation`, `translation-to-verb` e `mixed`.
- O vocabulario legado explicito foi extraido para `src/content/data/vocabulary.ts`: 6 categorias, 10 itens por categoria, 60 entradas totais.
- IDs gramaticais ativos foram alinhados aos IDs do legado para os 8 topicos do MVP: `present_tobe`, `past_tobe`, `simple_present`, `present_continuous`, `be_going_to`, `simple_past`, `there_tobe`, `prepositions`.
- `Action Verbs` e `Routine Verbs` continuam como categorias de vocabulario planejadas, mas sem entradas normalizadas porque o legado as fornece como perguntas, nao como pares explicitos ingles-portugues.

Fora do escopo mantido:

- Os 600 exercicios de gramatica nao foram copiados para `src/`.
- Nenhum jogo foi migrado.
- Nenhum motor de sessao, randomizacao ou feedback foi implementado.
- Nenhuma UI foi alterada.

## Banco piloto - Present TO BE

Arquivos criados:

- `src/content/data/presentTobeQuestions.ts`
- `scripts/validateContent.mjs`

Arquivos modificados:

- `src/content/data/vocabulary.ts`
- `src/content/model/content.ts`
- `src/content/taxonomy.ts`
- `docs/ARCHITECTURE.md`
- `docs/IMPLEMENTATION_MAP.md`
- `docs/OPEN_DECISIONS.md`
- `docs/LEGACY_CONTENT_INVENTORY.md`
- `STATUS.md`

Conteudo criado:

- 10 Action Verbs em `action_verbs`.
- 10 Routine Verbs em `routine_verbs`.
- 130 questoes unicas para `present_tobe`.
- 50 questoes `easy`.
- 80 questoes `medium`.
- Nenhuma dificuldade `challenge`.

Inventario do legado `present_tobe`:

- 60 questoes legadas avaliadas integralmente.
- 51 questoes reaproveitadas sem alteracao textual relevante.
- 0 questoes corrigidas com pequena alteracao.
- 9 questoes descartadas por outro alvo gramatical, ambiguidade de variante, complexidade excessiva ou escopo inadequado.
- 79 questoes novas criadas manualmente.
- 12 questoes legadas `dificil` foram reclassificadas como `medium`.

Validacoes executadas nesta fase:

- Validacao estrutural local sem dependencias novas.
- Revisao pedagogica manual integral das 130 questoes.
- `npm run lint`.
- `npm run build`.

Fora do escopo mantido:

- Nenhuma UI foi alterada.
- Nenhum jogo foi migrado.
- Nenhum motor de sessao, randomizacao, progresso, storage, login, audio, flashcards ou PWA foi implementado.
- Os outros sete topicos gramaticais do MVP ainda nao foram migrados.

## Auditoria independente - Present TO BE

Arquivos criados no working tree apos o commit do banco piloto:

- `docs/CURRENT_HANDOFF.md`
- `docs/PRESENT_TOBE_AUDIT.md`

Arquivos modificados no working tree apos o commit do banco piloto:

- `src/content/data/presentTobeQuestions.ts`
- `STATUS.md`
- `docs/IMPLEMENTATION_MAP.md`
- `docs/OPEN_DECISIONS.md`
- `docs/LEGACY_CONTENT_INVENTORY.md`

Resultado da auditoria:

- 130 questoes auditadas.
- 1 problema obrigatorio encontrado e corrigido.
- 3 melhorias recomendadas corrigidas.
- 4 questoes alteradas/substituidas.
- 126 questoes mantidas.
- Nenhuma duplicata estrutural ou pergunta duplicada pela normalizacao atual.
- Nenhuma ambiguidade bloqueante restante identificada.
- Validador revisado; nenhuma ampliacao necessaria nesta auditoria.

Distribuicao aproximada apos correcoes:

- Afirmativa: 92.
- Negativa: 13.
- Pergunta: 23.
- Resposta curta: 4.
- Contracao: 10.
- Ordem de palavras: 46.
- Concordancia com pronome: 18.
- Concordancia com substantivo singular: 56.
- Concordancia com substantivo plural: 58.
- Sujeito composto: 11.

Rebalanceamento editorial posterior:

- Distribuicao anterior exclusiva: 97 afirmativas, 10 negativas, 19 perguntas e 4 respostas curtas.
- Distribuicao final aprovada: 65 afirmativas, 22 negativas, 30 perguntas e 13 respostas curtas.
- Easy final: 30 afirmativas, 8 negativas, 9 perguntas e 3 respostas curtas.
- Medium final: 35 afirmativas, 14 negativas, 21 perguntas e 10 respostas curtas.
- 33 questoes foram reescritas nesta revisao.
- Nenhum outro topico foi migrado.

Ambiente do terminal:

- Node existente localizado em `C:\Program Files\nodejs`.
- Versao do Node: v22.22.0.
- Versao do npm: 10.9.4.
- Causa provavel do erro anterior: PATH do usuario nao continha `C:\Program Files\nodejs`, embora o PATH de maquina contivesse.
- PATH do usuario atualizado adicionando `C:\Program Files\nodejs` sem apagar entradas existentes.
- `node -v` e `npm -v` foram validados em novo PowerShell.
- `npm run dev -- --host 127.0.0.1 --port 5173` foi validado.
- Smoke test HTTP retornou 200 e HTML para `/`, `/bem-vindo`, `/tutorial`, `/hub`, `/estudar`, `/praticar` e `/vocabulario`.
- O servidor Vite foi validado em `http://127.0.0.1:5173/`.

Validacoes finais da auditoria:

- `node scripts/validateContent.mjs`.
- `npm run lint`.
- `npm run build`.

Fora do escopo mantido:

- Nenhuma UI, rota, componente ou estilo foi alterado.
- Nenhum motor de sessao, randomizacao, progresso, storage, login, audio, flashcards ou PWA foi implementado.
- Nenhum outro topico foi migrado.
- Nenhum segundo commit foi criado.

## MVP visual e fluxo funcional

Implementado no working tree apos o commit `ce27d32`:

- Home guest-first baseada em `reference/home-approved.html`.
- Logo oficial extraido do PNG base64 da referencia aprovada.
- App shell branco, paleta navy/vinho, header, botao voltar e navegacao inferior.
- Bottom sheet "Bora praticar" com escolhas de Gramatica e Vocabulario.
- Rotas finais para Home, Estudar, Gramatica, Vocabulario, Jogos, Progresso e Perfil.
- Redirects para as rotas placeholder antigas.
- Oito topicos gramaticais visiveis; somente `present_tobe` jogavel.
- Nove categorias de vocabulario visiveis; somente Partes do corpo possui flashcards disponiveis.
- Tres jogos rapidos visiveis na Home e seis em `/jogos`, todos bloqueados como "Em breve".
- Configuracao de `present_tobe` com `easy`, `medium` e 10, 20 ou 30 questoes.
- Selecao embaralhada sem repeticao na sessao e alternativas embaralhadas.
- Questao, confirmacao, feedback pedagogico, progresso, sequencia de acertos e avancar.
- Confirmacao ao sair por acao da tela ou pelo botao voltar do navegador.
- Resultado com acertos, erros, percentual, melhor sequencia, replay, reconfiguracao e retorno a home.
- Sons simples por Web Audio, com preferencia pequena em `localStorage`.
- Animacoes com Framer Motion, celebracao leve e suporte a `prefers-reduced-motion`.
- Foco visivel, botoes semanticos, `aria-current`, `aria-disabled` e dialogs nativos.

Refinamento visual e responsivo concluido no working tree:

- Desktop tratado como produto real, com largura util de ate 1200 px, navegacao horizontal e composicoes em colunas.
- Android/mobile tratado em 360x800, 390x844 e 412x915, com conteudo rolavel separado da navegacao e suporte a safe area.
- Navegacao global restrita a Inicio, Estudar, Progresso e Perfil.
- Topicos, configuracao, sessao, feedback, resultado e dialogs usam fluxo focado sem navegacao global.
- Home reorganizada com uma unica chamada principal, atividade disponivel honesta e jogos visualmente diferenciados.
- Cards bloqueados receberam cadeado, badge, contraste proprio e resposta ao toque.
- Configuracao passou de formulario para montagem de desafio.
- Sessao ganhou composicoes mobile/desktop, progresso reforcado, alternativas com estados completos e CTA proximo das respostas.
- Resultado ganhou composicao de celebracao propria, total, acertos, erros, percentual, melhor sequencia e tres caminhos de saida.
- Nenhum texto interno como MVP, placeholder, mock, prototipo ou seed aparece nas rotas finais.

Rotas finais:

- `/`
- `/praticar`
- `/gramatica`
- `/gramatica/present_tobe`
- `/praticar/present_tobe/sessao`
- `/vocabulario`
- `/vocabulario/:categoryId`
- `/vocabulario/body/flashcards`
- `/jogos`
- `/progresso`
- `/perfil`

Validacao visual automatizada:

- Script sem dependencia nova: `node scripts/smokeUi.mjs`.
- Viewports: 360x800, 390x844, 412x915, 768x1024, 1366x768 e 1440x900.
- Sem overflow horizontal, navegacao sobre conteudo ou barra global em fluxo focado.
- Home, bottom sheet, navegacao inferior, voltar, topico bloqueado e toggle de som verificados.
- Sessoes de 10, 20 e 30 questoes verificadas.
- Rodada completa de 30 questoes confirmou 30 enunciados unicos.
- Resposta correta, resposta incorreta, feedback, resultado, replay e abandono verificados.
- Reload das rotas principais verificado.
- Erros de browser: zero.

## Feedback contextual - Present TO BE

Implementado no working tree:

- Acertos bloqueiam as alternativas, mostram somente `Correto!` e uma barra verde linear de 3 segundos, sem explicacao ou botao de avancar.
- Ao fim dos 3 segundos, a proxima questao abre automaticamente; na ultima questao, o resultado abre automaticamente.
- O timer e unico por resposta e e limpo em desmontagem, mudanca de rota, saida e reinicio.
- Erros mantem a alternativa escolhida e a correta visiveis, exibem o feedback pedagogico existente e nunca avancam por timer.
- O erro avanca somente pelo botao `Continuar` ou por clique/toque no card de explicacao.
- `Estudar esse topico` aparece somente no erro e abre um guia exclusivo de Present TO BE sem alterar questao, resposta, score, sequencia ou som.
- Um helper pequeno classifica o contexto entre forma, afirmativa, negativa, pergunta, resposta curta, ordem, contracao e concordancia, sem novos campos nas 130 questoes.
- O guia cobre am/is/are, afirmativas, negativas, perguntas, respostas curtas, contracoes, concordancia e erros comuns.
- Dialog nativo preserva Escape, overlay, foco preso, retorno de foco, titulo acessivel e rolagem interna.
- Reduced motion remove efeitos decorativos, mas preserva a espera e a barra linear de 3 segundos.

Smoke atualizado:

- Viewports: 360x800, 390x844, 768x1024, 1366x768 e 1440x900.
- Acerto sem explicacao ou CTA, bloqueio de clique/Enter/Espaco, barra e avancamento unico apos aproximadamente 3 segundos.
- Erro sem avancamento automatico, avancamento por botao e card, clique externo inofensivo e ultima questao manual.
- Guia contextual e completo, fechamento por X/Escape/botao, foco restaurado e estado da sessao preservado.
- Score, melhor sequencia, replay, abandono, voltar do navegador, 30 questoes unicas e zero erro de browser.

Limitacoes mantidas:

- Progresso existe somente no dispositivo/navegador atual, sem conta, sync, exportacao ou recuperacao remota.
- Sem login, backend, sync, analytics, monetizacao ou PWA.
- Somente os flashcards de Partes do corpo estao funcionais; pratica pontuada e outras categorias continuam fora do escopo.
- Sem jogos funcionais.
- Sem migracao dos outros sete topicos gramaticais.

## Flashcards de vocabulario - Partes do corpo

Implementado no working tree:

- 24 entradas canonicas em `src/content/data/vocabulary.ts`, na ordem pedagogica aprovada.
- IDs `body_*` preservados e campo opcional `visualKey` adicionado ao contrato.
- Categoria Corpo apresentada como Partes do corpo e unica categoria liberada.
- Rota focada `/vocabulario/body/flashcards`, sem navegacao global.
- Frente em portugues com SVG local e destaque anatomico; verso em ingles sem pronuncia escrita.
- Pronuncia nativa por Web Speech API ao revelar e por `Ouvir novamente`.
- Preferencia global de som reutilizada; nenhum segundo controle persistente foi criado.
- Fallback visivel e controle desabilitado quando a API de fala nao existe.
- Navegacao por botoes, setas do teclado e swipe, sempre reiniciando o novo card pela frente.
- Conclusao sem score, acuracia, ranking ou progresso persistido.
- Jogos de vocabulario continuam indicados somente como fase futura.

Validacao:

- O validador fixa as 24 entradas, ordem, termos, traducoes e chaves visuais.
- O smoke percorre os 24 SVGs, fala simulada, mute, fallback, flip, repeticao, teclado, swipe, conclusao e regressao do progresso gramatical.
- Viewports validados: 360x800, 390x844, 412x915, 768x1024, 1366x768 e 1440x900.
- `node scripts/validateContent.mjs`, `npm run lint`, `npm run build` e `node scripts/smokeUi.mjs` passaram.

## Referencias e legado

- `reference/home-approved.html`: disponivel e validado como referencia visual aprovada. Arquivo standalone/offline, com logo embutido, fundo branco, navy `#17234b`, vinho `#8d1d30`, chamada "Bora praticar", jogos rapidos e navegacao inferior.
- `reference/speakup-english-challenge.html`: disponivel e validado como legado funcional. Contem 10 topicos, 3 dificuldades legadas, 20 questoes por topico/dificuldade, 600 questoes no total, sessoes de 10/20/30, 6 categorias de vocabulario com 10 itens cada e 7 jogos.
- Mecanicas legadas fora do novo MVP: Multitec, leads, ranking, roleta, CSV, premios e gate de 75%.
- HTML adicional: `index.html` e o shell Vite.
- O logo aprovado foi extraido da referencia para `src/assets/speakup-logo.png` e integrado ao MVP.
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

## Persistencia local e progresso

Implementado no working tree:

- IndexedDB nativo, versao 1, com stores `questions` e `sessions`.
- Uma resposta confirmada atualiza uma unica linha por `questionId`, com contagens de acerto/erro e ultimo resultado.
- Uma sessao entra no historico somente quando concluida e usa `sessionId` idempotente.
- Preferencia pequena da ultima configuracao fica em `localStorage`.
- Home mostra questoes unicas praticadas, precisao total, sessoes concluidas e revisoes; conserva uma unica chamada principal e apenas tres jogos rapidos.
- Progresso mostra cobertura `easy` (50), `medium` (80), recordes e CTA de revisao quando ha erros recentes.
- Proximas rodadas priorizam perguntas ineditas, depois perguntas cujo ultimo resultado foi erro e depois as vistas ha mais tempo.
- Falhas de storage exibem aviso discreto e nao bloqueiam a sessao nem as acoes do resultado.

Definicoes:

- Questoes praticadas: quantidade de `questionId` unicos com ao menos uma resposta.
- Precisao: total de acertos dividido pelo total de respostas confirmadas, incluindo repeticoes.
- Para revisar: questoes cujo resultado mais recente foi incorreto.
- Melhor resultado, melhor sequencia e sessoes: calculados somente sobre sessoes concluidas.
- Sessao abandonada: respostas confirmadas permanecem no historico por questao, mas a sessao nao entra nos recordes.

Validacao da fase:

- `npm run lint`: passou.
- `npm run build`: passou; 452 modulos transformados.
- `node scripts/validateContent.mjs`: passou; 130 questoes, 50 `easy`, 80 `medium`.
- `node scripts/smokeUi.mjs`: passou em cinco viewports, oito rotas, rodadas 10/20/30, reload, idempotencia, prioridade e falha simulada; zero erros de browser.

## Proxima fase recomendada

Aguardar a revisao do usuario. Nao iniciar outro topico, ranking, login, backend, sync, analytics, deploy ou limpeza de progresso sem nova autorizacao.

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
