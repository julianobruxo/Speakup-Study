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
- Jogos: dez jogos do catálogo oficial funcionais com `present_tobe` + `body`, incluindo Bubble Shooter em Canvas e DOM.
- Página de Jogos: dez cards, com nove thumbnails aprovadas e preview local do Bubble Shooter; versões WebP 800x450 e masters 1600x900 permanecem preservados.

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

Dez jogos do catálogo oficial estão funcionais, usando `present_tobe` (Gramática) e `body` (Vocabulário):

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
- `/jogos`: catálogo de dez jogos.
- `/jogos/monte-a-frase`, `/jogos/caca-ao-erro`, `/jogos/contra-o-relogio`, `/jogos/cada-coisa-no-seu-lugar`, `/jogos/palavra-secreta`, `/jogos/conectando`, `/jogos/cruzando-palavras`, `/jogos/par-perfeito`, `/jogos/ouvido-afiado`, `/jogos/bubble-shooter`: jogos individuais.
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

## Git

- Branch: `feat/loop-jogos-v1`.
- Base do loop: `2547adda3db0a05959f2fa1cf377918d5df6b6eb`; todas as mudanças não commitadas anteriores foram preservadas ao criar a branch.
- Remoto: `origin` em `https://github.com/julianobruxo/Speakup-Study.git`.
- A pasta local e o repositório remoto mantêm nomes históricos.
- Checkpoints locais são autorizados somente após gate verde.
- Não fazer push, deploy, PR, tag ou release durante o loop.
