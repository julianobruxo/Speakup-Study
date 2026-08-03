# Current Handoff

Atualizado em: 2026-08-03

## Produto

**Inglês em Jogo** é uma aplicação standalone de prática de inglês da **Speak UP!**. O produto é guest-first e local-first: inicia sem login, não usa backend e preserva progresso no navegador.

O Product Vision aprovado em `reference/ingles-em-jogo-product-vision.html` é a especificação visual canônica. `reference/home-approved.html` e `reference/speakup-english-challenge.html` continuam como referências históricas e de legado, sem substituir a direção atual.

## Estado Funcional

- Home game-like com missão diária, meta semanal, caminho de aprendizagem, Liga Safira local e atalhos para jogos funcionais.
- Estudar como biblioteca com Gramática, Vocabulário e revisão de erros.
- Gramática funcional apenas em Present TO BE, com avanço automático em 2 segundos após acerto.
- Vocabulário funcional apenas em Partes do corpo.
- Progresso com atividade semanal, conquistas, revisão e métricas locais.
- Perfil local editável, preferências e reset local confirmado.
- Jogos: onze jogos publicados no catálogo com `present_tobe` + `body`; Ninja e Corrida individual estão completos em Canvas e DOM nas rotas diretas, ambos aguardando publicação conjunta no catálogo na Fase 8.
- Página de Jogos: onze cards, com nove thumbnails aprovadas e previews locais dos dois arcades; versões WebP 800x450 e masters 1600x900 permanecem preservados.

## Conteúdo

Present TO BE:

- 130 questões únicas;
- 50 easy;
- 80 medium;
- sessões de 10, 20 e 30 perguntas;
- seleção sem repetição na sessão.

Partes do corpo:

- 24 flashcards;
- ilustrações locais;
- pronúncia via Web Speech API;
- swipe, teclado e som.
- Cada coisa no seu lugar usa associação palavra-imagem em três grupos anatômicos de quatro pares, fotos locais e interação por drag, toque, clique e teclado.

Planejado: Past TO BE, Simple Present, Present Continuous, Be Going To, Simple Past, There TO BE, Prepositions e demais categorias de Vocabulário.

## Engajamento e Persistência

- IndexedDB nativo, banco `practice-progress`, versão 3.
- Stores preservadas: `questions`, `sessions` e `engagement`; nova store `gameSessions`.
- Store de engajamento com perfil local, XP, níveis, títulos, sequência, missão, meta semanal, conquistas e liga.
- Eventos de XP idempotentes (gramática, flashcards e jogos) para evitar duplicação por reload ou rerender.
- `localStorage` somente para preferências pequenas.
- Sem sincronização e sem backend.

A Liga Safira é uma experiência local. Os demais participantes são simulados e não representam usuários conectados.

## Jogos

Onze jogos do catálogo oficial estão funcionais, usando `present_tobe` (Gramática) e `body` (Vocabulário):

- Monte a frase;
- Caça ao erro;
- Contra o relógio;
- Cada coisa no seu lugar;
- Palavra secreta;
- Conectando;
- Cruzando palavras;
- Par perfeito;
- Ouvido afiado.
- Bubble Shooter.
- Corte a palavra.
- Ninja (rota direta, aguardando publicação na Fase 8).
- Corrida individual (rota direta, aguardando publicação na Fase 8).

`Conectando` é o nome aprovado para associação entre palavra em inglês e imagem. A branch local `feat/loop-jogos-v1` preserva e consolida a nova experiência, com seis palavras e seis imagens no mesmo tabuleiro responsivo e compacto, linhas por Pointer Events, fallback por clique/teclado e somente o primeiro outcome por palavra. `Par perfeito` também preserva o ajuste local de largura/densidade do board, sem mudança de mecânica.

## Rotas Principais

- `/`: Home.
- `/praticar`: Estudar.
- `/gramatica`: tópicos gramaticais.
- `/gramatica/present_tobe`: configuração da sessão.
- `/praticar/present_tobe/sessao`: quiz e resultado.
- `/vocabulario`: categorias.
- `/vocabulario/:categoryId`: prévia da categoria.
- `/vocabulario/body/flashcards`: flashcards de Partes do corpo.
- `/jogos`: catálogo de onze jogos.
- `/jogos/monte-a-frase`, `/jogos/caca-ao-erro`, `/jogos/contra-o-relogio`, `/jogos/cada-coisa-no-seu-lugar`, `/jogos/palavra-secreta`, `/jogos/conectando`, `/jogos/cruzando-palavras`, `/jogos/par-perfeito`, `/jogos/ouvido-afiado`, `/jogos/bubble-shooter`, `/jogos/corte-a-palavra`: jogos individuais.
- `/jogos/ninja`: Ninja completo com 10 placas em cinco fases, Canvas e DOM simplificado, vidas, recuperação, resultado e persistência; ainda não publicado no catálogo.
- `/jogos/corrida-individual`: Corrida individual completa com 10 portais, Canvas e DOM simplificado, HUD de score/combo/velocidade, resultado e persistência; ainda não publicada no catálogo.
- `/progresso`: progresso local.
- `/perfil`: perfil local.

## Stack

- Vite, React, React DOM, React Router DOM, TypeScript, Framer Motion, Tailwind CSS, Oxlint.
- Phaser 3.90.0, carregado sob demanda somente pela bridge arcade.
- IndexedDB nativo para progresso/engajamento.
- Web Speech API para pronúncia.

## Validações

Rodar antes de commit/push:

```bash
npm test
node scripts/validateContent.mjs
npx tsc -b
npm run lint
npm run build
node scripts/verifyPhaserSplit.mjs
node scripts/smokeUi.mjs
```

O smoke cobre nove viewports: 360x800, 390x844, 412x915, 768x1024, 1000x800, 1024x768, 1366x768, 1440x900 e 1920x1080.

Baseline da Fase 0 aprovado em 2026-07-30 com `validateContent`, TypeScript, lint, build, smoke completo e `git diff --check`. As capturas de catálogo, Conectando e Par perfeito foram inspecionadas em 1440x900, 768x1024 e 390x844. O build atual mantém um aviso de chunk inicial de cerca de 545 kB, que será tratado por code-splitting antes do Phaser.

### Relatório da Fase 0

- Objetivo: preservar e concluir o trabalho local iniciado em Conectando, Par perfeito, assets, CSS, smoke e documentação.
- Decisões: manter React como dono da rodada e persistência; registrar somente o primeiro outcome por palavra; usar uma única região live; tratar seleção/cancelamento como feedback neutro; preservar integralmente a composição dos WebPs.
- Revisões: Dalton revisou o diff técnico e os assets; Bernoulli auditou os nove jogos e a fundação para orientar as Fases 1 e 2. Ambos atuaram somente em leitura.
- Defeitos corrigidos: assets com máscaras aparentes ou grafia divergente, updater impuro em StrictMode, tom incorreto após retração, anúncios duplicados, timer sem limpeza, seleção mantida após `pointercancel`, `touchEnd` sem coordenadas úteis, hitboxes sobrepostas, linhas desktop excessivamente longas e alvo mobile abaixo de 44 px.
- Testes: `validateContent`, `tsc -b`, `lint`, `build`, smoke funcional/visual e `git diff --check`; o smoke cobre mouse, touch real via CDP, drop próximo à borda, clique, teclado, resultado 5/6, reset e resize, com `browserErrors: 0`.
- Evidências visuais: diretório `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-g3MRP2`, incluindo catálogo, Conectando e Par perfeito em 1440x900, 768x1024 e 390x844.
- Arquivos: `MatchingPairsGame.tsx`, `MemoryMatchGame.tsx`, `index.css`, `smokeUi.mjs`, seis WebPs autorizados, `STATUS.md` e este handoff.
- Git: checkpoint exclusivamente local na branch `feat/loop-jogos-v1`; o SHA fica no histórico Git e será consolidado no relatório do próximo checkpoint. Nenhum push ou deploy.

### Relatório da Fase 1

- Objetivo: tornar `docs/IMPLEMENTATION_MAP.md` o roadmap executável dos 13 jogos e fechar os contratos puros antes da auditoria dos jogos DOM.
- Decisões: usar `node:test` sem dependência nova; manter React dono de sessão, resultado e persistência; adiar Phaser e code-splitting para a Fase 3.
- Fundação: seleção determinística e sem duplicatas, primeiro outcome por desafio, snapshot imutável de resultado e conclusão coordenada entre retries/resets.
- Falhas de persistência: duas tentativas automáticas, mesma `sessionId`, erro acessível na tela de resultado e retry explícito.
- Testes: 9 testes puros cobrindo catálogo, compatibilidade, round sizes/timers/XP, seed/seleção, outcome/resultado e concorrência/falha/reset da conclusão.
- Regressão corrigida: cliques sintetizados após toque ou mouse no Conectando não desfazem mais a seleção; o smoke também confirma desseleção no segundo clique físico, drag e teclado.
- Revisão: Bernoulli aprovou o checkpoint após reproduzir o clique físico de mouse e revalidar a correção; a lacuna residual é um teste de UI com falha de persistência injetada.
- Evidências: smoke verde em nove viewports, todas as rotas, `browserErrors: 0`, com capturas em `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-ePzXdk`.
- Dependências: nenhuma adicionada; o lockfile recebeu somente o metadata de engine; Node mínimo documentado como `>=22.18`.
- Risco conhecido: `npm audit` aponta a advisory `GHSA-qwww-vcr4-c8h2` no React Router em modo RSC. Este SPA Vite não usa RSC Actions; não foi aplicado downgrade ou `audit fix`.

### Relatório da Fase 2

- Objetivo: auditar e fechar as nove mecânicas DOM antes da introdução do Phaser.
- Conteúdo: 130 questões materializadas; 110 elegíveis para Monte a frase após exclusões conservadoras e 115 para Caça ao erro após remover uma ambiguidade contextual.
- Mecânicas: quatro tipos garantidos em Contra o relógio, três modos em Ouvido afiado, três grupos de quatro na Classificação, crossword interativo sem respostas expostas e memória protegida contra timers antigos.
- Invariantes: somente o primeiro outcome por desafio/par, deadlines monotônicos, conclusão mista em Gramática e Vocabulário e nenhum ganho duplicado por retry.
- Interação e acessibilidade: mouse, touch, clique e teclado; cancelamentos neutros; pontuação não clicável; fallback textual quando TTS não pode tocar; Palavra secreta sem overflow em 360 px e com padrão anunciado.
- Testes: 15 testes puros e duas execuções consecutivas do smoke completo dos nove jogos em nove viewports, incluindo deadline exato, rodadas completas, timeout automático, restart, resize, persistência e touch físico sem fallback sintético, com `browserErrors: 0`.
- Infraestrutura do smoke: cada execução reserva uma porta local livre, inicia um Vite isolado e aguarda seu encerramento, sem reutilizar processos externos.
- Evidências visuais: `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-Ei5wvR`, com capturas adicionais de Palavra secreta, Classificação e Palavras Cruzadas.
- Revisão: Dalton revalidou o lifecycle do drag, o touch físico sem fallback, o servidor isolado e a pontuação acessível; checkpoint da Fase 2 aprovado sem bloqueios remanescentes.
- Dependências: nenhuma adicionada ou alterada nesta fase; Phaser e code-splitting continuam reservados à Fase 3.

### Relatório da Fase 3

- Objetivo: reduzir o chunk inicial e validar a fronteira React–Phaser antes do primeiro arcade.
- Code-splitting: catálogo e nove rotas DOM usam `React.lazy`; entry principal reduzido de cerca de 542 kB para 481,12 kB.
- Runtime: Phaser 3.90.0 gera chunk próprio de 1.198,01 kB; a rota técnica mede 7,46 kB e `dist/index.html` não faz preload do Phaser.
- Contrato: React prepara a rodada canônica, valida a escolha antes de preservar o primeiro outcome e mantém outcomes/persistência/XP fora do Phaser; IDs desconhecidos são rejeitados.
- Lifecycle: token de descarte para StrictMode, `ResizeObserver`, pausa por usuário/visibilidade com ownership por cena, mute global efetivo, movimento reduzido, backing store limitado a DPR 2 e destruição síncrona de jogo/canvas/listeners, inclusive o listener nativo não removido pelo Phaser.
- Acessibilidade: modo simplificado DOM disponível sem importar o runtime, controles externos e status anunciado.
- Regressão corrigida: listeners de Pointer Events da Classificação agora permanecem estáveis na troca de grupo, eliminando a janela que perdia touch físico.
- Testes: 20 testes puros, `validateContent`, TypeScript, lint, build, `verifyPhaserSplit`, smoke completo e `git diff --check`; o smoke lê estado real de pausa, mute e tweens, alterna targets reais para validar background, testa DPR 2 e destrói o runtime com documento oculto.
- Evidências: `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-M7f7UN`; Canvas em 1440x900, 768x1024, 390x844 e DPR 2, modo DOM em 390x844, `browserErrors: 0`.
- Revisão: os pareceres independentes de lifecycle e do delta completo resultaram em `APPROVE`, sem bloqueios remanescentes.

### Relatório da Fase 4

- Objetivo: entregar Bubble Shooter como primeiro arcade de produto, sem ampliar o conteúdo além das 24 entradas de `body`.
- Rodada: seis desafios determinísticos, três escolhas únicas, score e combo próprios; XP global permanece em +5 por acerto e +10 por conclusão.
- Fronteira: React prepara e valida a rodada, devolve o `ChallengeOutcome` aceito e persiste resultado/XP/missão/streak; Phaser cuida apenas de renderização, física, colisão, controles e estado transitório.
- Mecânica: mira por ponteiro, toque e setas; lançamento por clique, toque, Space e Enter; ricochete lateral, snap hexagonal pelo ponto físico, grupos de três e queda de peças desconectadas.
- Lifecycle: resize em voo preserva o projétil, pausa e movimento reduzido permanecem sincronizados, e sair da rota destrói Canvas/listeners.
- Acessibilidade: modo DOM usa a mesma rodada sem carregar Phaser, completa os seis desafios pelo teclado, restaura foco no enunciado, usa uma única live region e mantém controles com pelo menos 44 px.
- Testes: 26 testes puros e gate completo com `validateContent`, TypeScript, lint, build, `verifyPhaserSplit`, smoke em nove viewports e `git diff --check`.
- Resultados observados: DOM `6/6`, `40 XP`; Canvas `5/6`, score `750`, `35 XP`; persistência idempotente e `browserErrors: 0`.
- Evidências: `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-W1Ktud`, com Canvas em 1440x900, 768x1024, 390x844 e 360x800, estados de erro/acerto/resultado, foco DOM, ricochete e resize.
- Revisão: os pareceres independentes técnico e visual/acessível resultaram em `APPROVE`, sem bloqueios remanescentes.
- Risco residual aceito: uma oscilação pontual do Edge headless na simulação de troca de aba ficou para acompanhamento posterior; a repetição e o gate final passaram.

### Relatório da Fase 5

- Objetivo: entregar Corte a palavra como segundo arcade de produto, usando somente as 24 entradas canônicas de `body`.
- Rodada: oito desafios determinísticos e únicos, três palavras por onda e faixas sem timeout. A progressão usa zero, um e dois distratores do mesmo grupo anatômico; a velocidade varia apenas de 0,95 a 1,03.
- Gesto: mouse, toque e caneta; limiar deliberado de 12 px, trilha interpolada a no máximo 8 px, colisão contínua e somente o primeiro objeto cruzado por gesto. Tap, espaço vazio e cancelamento não geram outcome.
- Fronteira: React prepara e valida a rodada, calcula score, persiste resultado/XP/missão/streak e devolve o receipt; Phaser mantém somente renderização, movimento, colisão, trilha, partículas e controles transitórios.
- Penalidade: erro zera combo, subtrai 25 pontos sem tornar o score negativo e revela a resposta; XP global continua independente do score.
- Acessibilidade: quatro setas e Space/Enter no Canvas; modo DOM com a mesma rodada, botões nativos, foco restaurado, uma live region e zero carregamento de Phaser.
- Movimento reduzido: palavras estáticas, sem partículas ou tweens; resize e cancelamento limpam gesto sem outcome.
- Testes: 31 testes puros e gates de conteúdo, TypeScript, lint, build, split e `git diff --check` verdes. Smoke completo: nove viewports, 19 rotas, `browserErrors: 0`, DOM `8/8` e `50 XP`, Canvas `7/8`, score `1235` e `45 XP`.
- Evidências finais abertas e inspecionadas: `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-Pzdvzd`, cobrindo Canvas, DOM, erro, resultado, movimento reduzido e catálogo.
- Risco residual aceito: uma repetição intermediária parou na flutuação conhecida do touch físico de `Cada coisa no seu lugar` no Edge headless. Juliano autorizou deixar pequenos problemas do Edge para depois; a execução final passou inteira.
- Revisão: os pareceres independentes técnico e visual/pedagógico reavaliaram as correções e resultaram em `APPROVE`, sem bloqueios remanescentes.

### Relatório da Fase 6A

- Objetivo: estabelecer a fundação visual e de lifecycle do Ninja antes de introduzir conteúdo ou regras de resposta.
- Cena: personagem procedural, corrida automática a 190 px/s, câmera, nuvens, montanhas e cidade em parallax, pista e lanternas recicladas por pool fixo.
- Fronteira: React mantém rota, preferências e controles externos; Phaser mantém somente renderização e estado transitório. Nenhum outcome, score, XP ou dado persistente existe nesta subfase.
- Lifecycle: pausa congela distância, retomada continua o percurso, resize preserva o pool e sair da rota destrói o Canvas.
- Acessibilidade: controle externo de pausa com 44 px, status textual e movimento reduzido realmente estático, sem câmera, parallax ou tweens ativos.
- Testes: 34 testes puros e gate completo com conteúdo, TypeScript, lint, build, split, smoke e `git diff --check`.
- Evidências: `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-rF04XY`; capturas em 1440x900, 768x1024, 390x844 e 360x800, além de pausa, resize e movimento reduzido; `browserErrors: 0`.
- Revisão: o parecer visual/acessível aprovou a correção de movimento reduzido e contraste; nenhum card foi exposto antes da primeira progressão funcional da 6B.

### Relatório da Fase 6B

- Objetivo: integrar conteúdo canônico e fechar uma primeira progressão funcional sem antecipar vidas, score ou persistência.
- Rodada: três questões fáceis, únicas e determinísticas de `present_tobe`, com alternativas embaralhadas e feedback vindo do banco original.
- Mecânica: corrida automática até uma zona de decisão sem timeout, três placas, salto por clique/toque ou setas + Enter/Espaço e avanço após feedback.
- Fronteira: React valida e guarda outcomes; Phaser só muda de fase depois do receipt. Nenhum score, XP, missão, streak ou IndexedDB é tocado nesta subfase.
- Acessibilidade: prompt e feedback externos ao Canvas, foco visível no host, controles alternativos e zona de decisão estática com movimento reduzido.
- Gate técnico: 35 testes, conteúdo, TypeScript, lint, build, split e `git diff --check` verdes.
- Edge headless: o smoke novo foi implementado para clique incorreto, teclado correto e conclusão, mas as execuções completas pararam em oscilações conhecidas fora desse fluxo. A assertion não foi relaxada e, por orientação explícita de Juliano, novos ciclos no Edge foram deixados para depois.
- Revisões: pareceres técnico e pedagógico/acessível aprovaram o delta após correções de foco, salto em resize/reduced motion, feedback legível, conclusão confirmada por outcomes React e resposta confrontada com o banco canônico.

### Relatório da Fase 6C

- Objetivo: adicionar três vidas, score, combo, avanço após erro e recuperação parcial sem antecipar conteúdo final, XP ou persistência.
- Rodada provisória: cinco questões fáceis canônicas e determinísticas; a quantidade final e as cinco faixas pedagógicas permanecem para medição na 6D.
- Ownership: React calcula e guarda vidas, score, combo, outcomes e tentativas. Phaser recebe `remainingLives` e `runEnded` opcionais apenas para apresentar feedback, avançar ou interromper a cena.
- Recuperação: o terceiro erro mantém resposta correta e explicação por 4,5 segundos; depois, o jogador restaura três vidas e continua somente com os desafios restantes, preservando score e outcomes.
- Acessibilidade: perdas de vida entram no anúncio textual, o estado de recuperação não depende de cor, o botão tem alvo nativo e o foco retorna ao Canvas remantado. O smoke também cobre touch, teclado, overflow e feedback fatal.
- Testes e gates: 39 testes puros, conteúdo, TypeScript, lint, build, split Phaser e `git diff --check` verdes.
- Navegador: `scripts/smokeUi.mjs` aceita `SMOKE_BROWSER` e mantém Edge como padrão. A execução única no Chrome percorreu as rotas anteriores e parou no primeiro clique Canvas do Ninja por coordenadas; nenhuma exceção da aplicação foi emitida e, conforme orientação explícita, não houve repetição de ciclos de compatibilidade.
- Visual: estados iniciais em 1440x900 e 768x1024 foram abertos e aprovados; o CLI do Chrome no Windows não produziu uma largura interna móvel confiável, por isso a evidência CDP de 390x844 da 6A continua sendo a referência móvel desta subfase.

### Relatório da Fase 6D

- Objetivo: fechar conteúdo e progressão do Ninja sem usar velocidade como substituto de conhecimento.
- Rodada final: 10 desafios, com dois slots por fase. As fases são base afirmativa, frases simples, negativas/contrações, perguntas e mistura final.
- Curadoria: pools explícitos guardam somente IDs canônicos revisados; os quatro primeiros níveis usam `easy` e a mistura final usa `medium`. Seleção e alternativas continuam determinísticas pela seed.
- Transições: o painel React anuncia fase atual/total e o Canvas reserva 1,1 s ao início de cada fase. Corrida e física mantêm a mesma velocidade em toda a rodada.
- Duração: constantes centralizadas resultam em 27,5 s automáticos para uma rodada sem erro e 34,1 s com dois erros. Com 4 s conservadores por leitura/escolha, 5/10/15 desafios projetam 38,0/74,1/110,2 s. Cinco não repete habilidade e 15 excede 90 s; 10 é o menor tamanho pedagogicamente claro. O smoke registra o percurso móvel completo com três erros/recuperação e impõe o mesmo teto.
- Testes: 42 testes puros, incluindo 100 seeds sem duplicatas, recovery dentro da fase, metadados/anúncios de estágio e orçamento de duração; conteúdo, TypeScript, lint, build, split e `git diff --check` verdes.
- Navegador: a medição de parede está instrumentada, mas não foi recolhida após a parada do driver Chrome no clique Canvas; por orientação explícita, não houve novo ciclo no Edge/Chrome. Desktop/tablet permanecem visualmente aprovados e a evidência móvel CDP da 6A continua válida.

### Relatório da Fase 6E

- Objetivo: concluir acessibilidade, modo simplificado, preferências, feedback, som, performance e integração persistente do Ninja.
- Equivalência: Canvas e DOM consomem a mesma rodada React de 10 desafios e compartilham outcomes, vidas, score, combo, recovery, resultado e XP. O modo DOM não monta Phaser.
- Ownership: `finalizeRound` e `useGameCompletion` são acionados assim que a rodada termina; somente a troca visual para `GameResultScreen` é atrasada. Sair ou reiniciar durante essa transição não descarta a persistência iniciada.
- Acessibilidade: uma live region externa anuncia os dois modos; o recovery DOM anuncia disponibilidade e recebe foco, o Canvas recuperado retoma foco e o resultado foca o título. Controles alternativos são setas + Enter/Espaço no Canvas e botões nativos no DOM.
- Preferências e performance: som usa o serviço global, movimento reduzido congela a corrida sem bloquear escolhas, Phaser permanece no chunk lazy separado e o chunk do Ninja ficou em cerca de 26,58 kB.
- Testes: 42 testes puros e gates de conteúdo, TypeScript, lint, build, split e `git diff --check` verdes. O smoke contém cobertura de Canvas e DOM, incluindo recovery, teclado, foco, overflow, resultado, XP e IndexedDB, mas não foi repetido por orientação explícita de não gastar novos ciclos com o driver do navegador.
- Visual: Canvas e DOM foram abertos e inspecionados em 1440x900 e 768x1024 em `C:\Users\User\AppData\Local\Temp\ninja-6e-3920d6352981458bbadf02c91968ae41`; a captura CDP 390x844 aprovada na 6A continua como referência móvel válida.
- Revisão: ownership/persistência recebeu `APPROVE` após a correção da janela de finalização. A revisão acessível solicitou foco/anúncios e cobertura DOM adicionais; as correções foram aplicadas e reenviadas para parecer final.
- Publicação: a rota direta está completa, mas o card e o fluxo content-first permanecem deliberadamente para a Fase 8, quando os 13 jogos serão integrados em conjunto.

### Relatório da Fase 7

- Objetivo: entregar Corrida individual como quarto e último arcade do catálogo v1, encerrando a lista de mecânicas antes da integração da Fase 8.
- Contexto: a implementação já existia no worktree, não commitada, ao início desta sessão. A investigação confirmou que era trabalho coerente e completo (não um rascunho), então o foco desta sessão foi validar, corrigir um defeito de harness encontrado durante a validação e preparar o checkpoint — não reimplementar.
- Rodada: 10 desafios determinísticos, compatíveis com `present_tobe` (Gramática) e `body` (Vocabulário) via adapters existentes, sem bancos duplicados.
- Mecânica: três faixas com portais de resposta em perspectiva, veículo renderizado, ponteiro/swipe (limiar 42 px) e teclado (setas + Enter/Espaço); acerto acelera e soma combo, erro desacelera dois níveis e zera o combo.
- Fronteira: React prepara e valida a rodada, computa progressão de score/velocidade e persiste resultado/XP/missão/streak; Phaser cuida somente de renderização, posicionamento de portais/veículo e captura de gesto.
- Acessibilidade: modo DOM equivalente sem carregar Phaser, uma live region, foco restaurado a cada desafio; movimento reduzido zera tweens e mantém os portais na zona de decisão.
- Testes: 5 novos testes puros (`tests/soloRace.test.mjs`), total do projeto em 47; conteúdo, TypeScript, lint, build, `verifyPhaserSplit` (5 rotas arcade) e `git diff --check` verdes.
- Validação funcional: como o smoke completo (`scripts/smokeUi.mjs`) trava dentro do fluxo pré-existente do Ninja antes de alcançar a seção nova, a Corrida individual foi validada de forma independente por inspeção direta do DOM via protocolo de depuração remota do Chrome — Canvas, DOM, movimento reduzido e domínio de vocabulário todos completaram rodadas perfeitas de 10/10 com 1.750 pontos e +60 XP, sem overflow horizontal em 390×844.
- Defeito de harness corrigido: quatro asserções em `scripts/smokeUi.mjs`, já existentes no checkpoint `756593c` (Fase 6, Ninja), comparavam o rótulo de fase do Ninja contra `document.body.innerText` de forma sensível a maiúsculas/minúsculas, mas o CSS transforma esse texto em maiúsculas — um falso negativo do harness, não uma regressão de produto. Corrigido com um helper `hasTextCI` dedicado, aplicado apenas às quatro asserções afetadas.
- Risco residual aceito, não resolvido: a suíte completa do smoke trava mais adiante em `pressKey` sobre o Canvas do Ninja (`Timeout: Ninja keyboard jump resolves an incorrect sign`), a mesma classe de instabilidade de injeção de teclado/clique já documentada e adiada nas Fases 6B–6D. Não afeta a Corrida individual. Confirmado por orientação explícita que não deveria consumir mais ciclos nesta sessão.
- Navegador: Edge permanece fora do escopo; a validação usou Chrome via `SMOKE_BROWSER`, sem alterar o padrão do script.
- Revisão: nenhuma revisão de subagente foi acionada nesta sessão; a validação foi feita diretamente pelo agente principal via CDP e pelos gates automatizados.

## Git

- Branch: `feat/loop-jogos-v1`.
- Base do loop: `2547adda3db0a05959f2fa1cf377918d5df6b6eb`; todas as mudanças não commitadas anteriores foram preservadas ao criar a branch.
- Remoto: `origin` em `https://github.com/julianobruxo/Speakup-Study.git`.
- A pasta local e o repositório remoto mantêm nomes históricos.
- Checkpoints locais são autorizados somente após gate verde.
- Não fazer push, deploy, PR, tag ou release durante o loop.
