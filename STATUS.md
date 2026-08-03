# STATUS.md

Atualizado em: 2026-08-03 (Fase 6E do loop de jogos v1)

## Estado Atual

O produto atual é **Inglês em Jogo**, uma experiência da **Speak UP!** para prática de inglês com gramática, vocabulário, progresso local e mecânicas de jogo. A identidade anterior permanece apenas em nomes históricos do repositório remoto, da pasta local e de referências legadas.

O Product Vision aprovado em `reference/ingles-em-jogo-product-vision.html` é a especificação visual canônica do produto. A transformação visual definitiva está no working tree atual e inclui shell navy, sidebar desktop, rail tablet, topbar, Home, Estudar, Gramática, Vocabulário, Progresso, Perfil e Jogos.

## Implementado

- Present TO BE funcional com 130 questões: 50 easy e 80 medium.
- Sessões de 10, 20 e 30 perguntas, com seleção inteligente e sem repetição na sessão.
- Feedback correto com avanço automático em 2 segundos.
- Feedback incorreto com explicação, avanço manual e `Estudar esse tópico`.
- Progresso local com revisão de erros e métricas por questão/sessão.
- 24 flashcards de Partes do corpo com ilustrações, pronúncia automática, swipe, teclado e som.
- Perfil local editável.
- XP, níveis, títulos, sequência diária, missão diária, meta semanal, atividade semanal e conquistas.
- Liga Safira local com ranking determinístico e dez participantes simulados.
- IndexedDB versão 3 com migração idempotente, preservando `questions`, `sessions` e `engagement`, e adicionando `gameSessions`.
- Package name `ingles-em-jogo` e metadata atualizada.
- Fundação compartilhada de jogos: catálogo central, matriz de compatibilidade, seleção determinística de conteúdo, engine de sessão, XP/missão/streak idempotentes, adapters de Gramática (`present_tobe`) e Vocabulário (`body`).
- Roadmap canônico dos 13 jogos em `docs/IMPLEMENTATION_MAP.md`, com fronteira React–Phaser e gates por fase.
- Suite pura com `node:test`: 42 testes para fundação, contratos DOM, bridge arcade, Bubble Shooter, Corte a palavra, Ninja, resultado e conclusão persistente.
- Conclusão de jogo serializada e idempotente, com duas tentativas automáticas, retry visível e a mesma `sessionId`.
- Onze jogos oficiais funcionais com o escopo `present_tobe` + `body`, incluindo Bubble Shooter e Corte a palavra em Canvas e modo DOM simplificado.
- Ninja concluído na rota direta: 10 desafios em cinco faixas pedagógicas, modos Canvas e DOM simplificado, vidas, score, combo, recuperação, resultado, persistência e XP; a publicação no catálogo permanece reservada à integração da Fase 8.
- Cards da página de Jogos com as nove imagens aprovadas integradas no topo e previews locais dos dois arcades; os masters 1600x900 permanecem preservados.

## Jogos

Onze jogos do catálogo oficial estão funcionais nesta fase, usando exclusivamente `present_tobe` (Gramática) e `body` (Vocabulário) como conteúdo:

- Monte a frase — reordenar tokens da frase correta (110 questões elegíveis de 130, após exclusão conservadora de fragmentos e ordenações ambíguas).
- Caça ao erro — tocar na palavra corrompida por um distrator revisado (115 elegíveis); pontuação é texto não interativo.
- Contra o relógio — mistura das quatro mecânicas com timers individuais (10s/20s/10s/20s).
- Cada coisa no seu lugar — arrastar/tocar cartões de palavras para quatro slots de imagens correspondentes, em três grupos anatômicos revisados.
- Palavra secreta — Hangman tradicional, pista em português, 5 erros, teclado físico e virtual.
- Conectando — consolidado localmente na branch `feat/loop-jogos-v1`: tabuleiro responsivo e compacto com seis palavras e seis imagens, ligação por linha gestual e fallback por clique/teclado.
- Cruzando palavras — tabuleiro interativo gerado deterministicamente (até 8 palavras), sem letras reveladas e com validação de colisões, teclado físico/virtual e pistas associadas.
- Par perfeito — jogo da memória com cartas de palavra e imagem em board responsivo ampliado, bloqueio durante conferência e timers limpos.
- Ouvido afiado — três modos: ouvir e selecionar imagem, ouvir e digitar, ouvir e montar frase; indisponibilidade ou preferência de som desligada exibe fallback textual.
- Bubble Shooter — seis desafios de `body`, mira e lançamento, ricochete lateral, snap hexagonal pelo impacto físico, grupos, peças desconectadas, combo, score e modo DOM equivalente.
- Corte a palavra — oito desafios de `body`, palavras móveis, trilha interpolada, colisão contínua, mouse/toque/caneta, teclado, combo, penalidade explícita e modo DOM equivalente.

`Conectando` é o nome aprovado para associação entre palavra em inglês e imagem.

Extensão para novos tópicos gramaticais/categorias de vocabulário requer apenas um novo adapter e a atualização de `ROLLOUT_CONTENT` em `src/games/core/catalog.ts` — nenhum jogo precisa ser reescrito.

## Conteúdo

Funcional:

- Gramática: Present TO BE.
- Vocabulário: Partes do corpo.

Planejado:

- Past TO BE;
- Simple Present;
- Present Continuous;
- Be Going To;
- Simple Past;
- There TO BE;
- Prepositions;
- demais categorias de Vocabulário.

## Persistência e Limites

- IndexedDB nativo salva progresso, sessões e engajamento no navegador.
- `localStorage` guarda preferências pequenas, como som e animações.
- Não há login, backend, sincronização, analytics remoto, PWA, deploy ou competição online.
- A Liga Safira é local; os demais participantes são simulados e não representam usuários conectados.
- Dados preservados por migração devem continuar compatíveis com históricos existentes.
- A página de Jogos carrega somente os WebPs otimizados de cards, sem PNGs grandes, base64, preload global ou dependência nova.

## Git

- Branch de trabalho do loop: `feat/loop-jogos-v1`, criada sobre `2547adda3db0a05959f2fa1cf377918d5df6b6eb` com todas as mudanças locais anteriores preservadas.
- Remoto: `origin` em `https://github.com/julianobruxo/Speakup-Study.git`.
- `main` e `origin/main` estavam alinhadas em `2547add` no início do loop.
- Não renomear a pasta local nem o repositório remoto nesta fase.
- Checkpoints do loop são somente locais; push, PR, tag, release e deploy continuam proibidos.

## Stack Detectada

- React `^19.2.7`.
- React DOM `^19.2.7`.
- React Router DOM `^7.18.1`.
- TypeScript `~6.0.2`.
- Vite `^8.1.1`.
- Framer Motion `^12.42.2`.
- Phaser `^3.90.0`, isolado em chunk lazy para os arcades.
- Tailwind CSS `^4.3.3` via `@tailwindcss/vite`.
- Oxlint `^1.71.0`.
- IndexedDB nativo.
- Web Speech API.

## Validações Obrigatórias

- `npm test`
- `node scripts/validateContent.mjs`
- `npx tsc -b`
- `npm run lint`
- `npm run build`
- `node scripts/verifyPhaserSplit.mjs`
- `node scripts/smokeUi.mjs`

O smoke deve cobrir 360x800, 390x844, 412x915, 768x1024, 1000x800, 1024x768, 1366x768, 1440x900 e 1920x1080, com `browserErrors: 0`.

## Smoke test: bloqueio resolvido

O bloqueio anterior (`node scripts/smokeUi.mjs` não alcançava `127.0.0.1:5173`) tinha causa raiz confirmada: o script assumia um servidor Vite externo já rodando, mas processos iniciados em invocações de terminal separadas não eram acessíveis entre si neste ambiente. `scripts/smokeUi.mjs` agora reserva uma porta local livre por execução, inicia e gerencia seu próprio servidor Vite isolado e aguarda seu encerramento. O Edge headless também passou a rodar com `--disable-extensions` para eliminar ruído de uma extensão do perfil do sistema que gerava exceções não relacionadas ao produto.

O smoke agora cobre fluxo funcional completo dos onze jogos, a fundação técnica do Ninja, timers individuais do Contra o relógio, persistência/XP/missão/streak idempotentes e checagens estruturais de acessibilidade, além dos fluxos já existentes. A execução completa da Fase 6A passou com `browserErrors: 0`.

## Fase 0 — baseline consolidado

- Mudanças anteriores de Conectando, Par perfeito, assets dos cards, CSS, smoke e documentação foram preservadas.
- O primeiro outcome de cada palavra no Conectando é registrado de forma síncrona e idempotente, inclusive em React StrictMode; feedback neutro não aparece como acerto e há uma única região de anúncio.
- O fluxo gestual do Conectando cobre mouse e touch real no smoke, com cancelamento, retry, clique e teclado; timers e seleção transitória são limpos.
- Os seis assets autorizados tiveram somente os textos reposicionados, mantendo a grafia inglesa original e preservando composição, textura, bordas e iluminação.
- As hitboxes dos alvos não se sobrepõem; o smoke confirma um drop correto próximo à borda. No desktop, as colunas foram centralizadas e as linhas encurtadas.
- As screenshots de catálogo, Conectando e Par perfeito foram abertas e inspecionadas em 1440x900, 768x1024 e 390x844.
- Gate técnico aprovado em 2026-07-30: conteúdo, TypeScript, lint, build, smoke completo e `git diff --check`.
- O build reporta chunk inicial de cerca de 545 kB; code-splitting permanece obrigatório antes da introdução do Phaser.

## Fase 1 — roadmap e fundação

- `docs/IMPLEMENTATION_MAP.md` é o único roadmap ativo para a release candidate local com 13 jogos.
- A seleção determinística agora rejeita contagens negativas e remove entradas duplicadas sem alterar a fonte.
- A engine registra somente o primeiro outcome por desafio e cria snapshots imutáveis no resultado.
- `completionCoordinator.ts` deduplica conclusões concorrentes, serializa resets e novas sessões, repete uma falha automaticamente e preserva a `sessionId` no retry explícito.
- Os nove resultados DOM exibem falha de persistência em região acessível, sem impedir que o jogador repita a tentativa.
- `package.json` declara Node `>=22.18`; nenhuma dependência foi adicionada e o lockfile recebeu somente o mesmo metadata de engine.
- O smoke cobre a regressão gestual do Conectando com touch real, mouse, clique, teclado, `pointercancel` e drop próximo à borda.
- Gate técnico e revisão aprovados em 2026-07-30: 9/9 testes puros, smoke completo em nove viewports e `browserErrors: 0`; evidências em `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-ePzXdk`.
- `npm audit` reporta duas ocorrências altas da mesma advisory de CSRF em modo RSC do React Router; a aplicação é uma SPA Vite e não usa RSC Actions, mas a atualização compatível permanece uma decisão aberta.

## Fase 2 — nove jogos DOM

- Os adapters materializam as 130 questões canônicas; Monte a frase exclui cinco ordenações semanticamente ambíguas e Caça ao erro exclui um caso de concordância contextual.
- Contra o relógio garante os quatro tipos por rodada, usa deadline monotônico, liquida cada desafio uma vez e avança automaticamente após timeout; Contra o relógio e Ouvido afiado persistem ambos os domínios canônicos.
- Cada coisa no seu lugar usa três grupos de quatro, suporta mouse, touch, clique e teclado, não atribui em `pointercancel`/`touchcancel` e não aninha controles interativos.
- Palavra secreta evita contagem repetida, anuncia o padrão e as letras tentadas e reorganiza as 26 teclas sem overflow em 360 px.
- Cruzando palavras não revela respostas, rejeita colisões inválidas em 200 seeds e oferece inputs, pistas e teclado virtual acessíveis.
- Par perfeito limpa timers em restart/unmount, bloqueia interação durante a conferência e registra exatamente um primeiro outcome por par.
- O smoke percorre rodadas completas dos nove jogos, estados de erro/timeout, som desligado, persistência mista e cancelamentos físicos, com `browserErrors: 0`.
- Duas execuções consecutivas do smoke passaram em servidores isolados, incluindo touch físico da Classificação sem fallback sintético.
- Capturas inspecionadas em 1440x900, 768x1024 e 390x844 para catálogo, Conectando, Par perfeito, Classificação e Palavras Cruzadas; Palavra secreta também foi inspecionada em 360x800. Evidência final: `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-Ei5wvR`.
- Gate técnico e revisão independente aprovados em 2026-07-30; nenhum bloqueio remanescente para o checkpoint local da Fase 2.

## Fase 3 — code-splitting e bridge React–Phaser

- O catálogo e as nove mecânicas DOM usam `React.lazy`; o chunk inicial caiu de cerca de 542 kB para 481,12 kB.
- Phaser 3.90.0 foi adicionado como a única dependência nova autorizada e permanece em chunk próprio de 1.198,01 kB, sem preload no `dist/index.html`.
- `scripts/verifyPhaserSplit.mjs` lê o manifest do Vite e falha se a entrada principal alcançar Phaser estaticamente ou se a rota arcade deixar de alcançá-lo sob demanda.
- A bridge recebe uma rodada preparada por React, valida antes de preservar o primeiro outcome e rejeita IDs que não pertencem à rodada; não persiste, concede XP ou navega.
- A cena técnica cobre mount/unmount em React StrictMode, resize, pausa por usuário/visibilidade com ownership por cena, mute efetivo, movimento reduzido, texto em DPR alto e teardown síncrono de canvas, observer e listeners nativos.
- O modo simplificado em DOM resolve a mesma rodada sem baixar o runtime Phaser.
- O smoke comprova ausência de Phaser na Home e no modo DOM, um único canvas no modo arcade, estado real de pausa/mute/tweens, troca real de aba, DPR 2, remount limpo e destruição concluída em foreground e com documento oculto.
- Uma corrida latente no touch da Classificação foi corrigida: listeners documentais permanecem estáveis entre grupos e leem painel/estado por refs.
- Gate técnico verde: 20 testes puros, conteúdo, TypeScript, lint, build, verificação de split, smoke em nove viewports com `browserErrors: 0` e `git diff --check`.
- Evidências visuais: `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-M7f7UN`, incluindo Canvas em 1440x900, 768x1024, 390x844 e DPR 2, além do modo DOM em 390x844.
- Revisões independentes de lifecycle e do delta completo aprovaram a fase sem bloqueios remanescentes.

## Fase 4 — Bubble Shooter

- O primeiro arcade de produto usa seis entradas determinísticas de `body`, três escolhas revisadas por desafio e a mesma rodada preparada nos modos Canvas e DOM.
- React continua dono de correção, outcomes, score, resultado, IndexedDB, XP, missão e streak; a bridge devolve o `ChallengeOutcome` aceito para a cena, que não reinterpreta a resposta.
- Phaser implementa mira por ponteiro/toque/setas, lançamento por clique/toque/Space/Enter, colisão circular, ricochete, snap hexagonal pelo ponto de impacto, remoção de grupos e queda de peças desconectadas.
- Resize durante o voo preserva o projétil; pausa, som, movimento reduzido, teardown e route-level split permanecem sob o host compartilhado.
- O modo simplificado completa os mesmos seis desafios sem carregar Phaser, mantém uma única live region e move o foco ao novo enunciado em toda a rodada.
- Gate verde: 26 testes puros, conteúdo, TypeScript, lint, build, split do Phaser, smoke em nove viewports com `browserErrors: 0` e `git diff --check`.
- O smoke comprova rodada DOM `6/6` com `40 XP`, rodada Canvas `5/6`, score `750` e `35 XP`, touch sem scroll, teclado, ricochete, resize em voo, alvos de 44 px, zero tweens com movimento reduzido e teardown limpo.
- Evidências abertas e inspecionadas: `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-W1Ktud`, incluindo 1440x900, 768x1024, 390x844 e 360x800.
- Revisões independentes de física/ownership/lifecycle e de visual/acessibilidade resultaram em `APPROVE`, sem bloqueios remanescentes.
- Uma oscilação pontual do Edge headless na simulação de troca de aba foi observada em uma execução e autorizada para acompanhamento posterior; a repetição e o gate final passaram sem erros de navegador.

## Fase 5 — Corte a palavra

- O segundo arcade de produto usa oito desafios determinísticos e únicos de `body`, com três escolhas por onda e a mesma rodada preparada nos modos Canvas e DOM.
- A geometria pura interpola a trilha em intervalos de até 8 px, arma o gesto após 12 px e resolve somente a primeira colisão contínua segmento–círculo; toque isolado, espaço vazio e cancelamento permanecem neutros.
- Mouse continua pela entrada Phaser; toque e caneta usam Pointer Events nativos em captura, convertidos ao espaço lógico do Canvas, sem scroll ou dependência de DPR.
- As palavras circulam em três faixas sem timeout. A progressão principal aumenta de zero para um e depois dois distratores do mesmo grupo anatômico; a velocidade varia apenas de 0,95 a 1,03. Com movimento reduzido os objetos ficam estáticos e partículas/tweens não são usados.
- React continua dono de correção, outcome, score, resultado, persistência e XP. Erro zera combo, subtrai 25 pontos sem score negativo e revela a resposta; XP mantém +5 por acerto e +10 por conclusão.
- O modo DOM completa a mesma rodada pelo teclado sem carregar Phaser, restaura foco no enunciado, usa uma live region e mantém alvos nativos acima de 44 px.
- Gate: 31 testes puros, conteúdo, TypeScript, lint, build, split Phaser e `git diff --check` verdes. O smoke completo passou em nove viewports e 19 rotas com `browserErrors: 0`; DOM `8/8`, `50 XP`, e Canvas `7/8`, score `1235`, `45 XP`.
- Evidências finais abertas e inspecionadas: `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-Pzdvzd`, incluindo Canvas em 1440x900, 768x1024, 390x844 e 360x800, DOM, erro, resultado, movimento reduzido e catálogo.
- Uma repetição intermediária parou na oscilação conhecida do touch físico de `Cada coisa no seu lugar` no Edge headless; Juliano autorizou deixar pequenos problemas do Edge para depois. A execução final passou inteira sem relaxar assertions.
- As revisões independentes técnica e visual/pedagógica reavaliaram as correções e resultaram em `APPROVE`, sem bloqueios remanescentes.

## Fase 6A — fundação visual do Ninja

- A rota lazy direta `/jogos/ninja` monta uma cena procedural de auto-run sem publicar um card incompleto no catálogo.
- Phaser mantém personagem, deslocamento, câmera, parallax e pool transitório; não há conteúdo, outcome, score, XP ou persistência nesta subfase.
- A pista pré-aloca segmentos e lanternas, recicla as mesmas identidades fora da câmera e preserva a quantidade do pool durante resize.
- Pausa e visibilidade usam o host compartilhado; resize recalcula proporções sem remontar a cena; sair da rota remove Canvas e listeners.
- Movimento reduzido congela personagem, câmera e parallax, mantém zero tweens e apresenta status textual coerente.
- Gate verde: 34 testes puros, conteúdo, TypeScript, lint, build, split Phaser, smoke em nove viewports e `git diff --check`.
- O smoke comprova corrida, câmera, reciclagem, pausa sem avanço, retomada, resize, movimento reduzido e teardown com `browserErrors: 0`.
- Evidências finais abertas e inspecionadas: `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-rF04XY`, incluindo 1440x900, 768x1024, 390x844, 360x800, pausa, resize e movimento reduzido.
- A revisão visual/acessível resultou em `APPROVE` após corrigir movimento reduzido e contraste do personagem.

## Fase 6B — primeira progressão do Ninja

- A rodada curta usa três questões fáceis selecionadas deterministicamente do banco canônico de 130 itens; nenhum texto de pergunta foi copiado para o jogo.
- React prepara a rodada, embaralha alternativas, valida a ordem dos outcomes e mantém feedback pedagógico em região acessível.
- Phaser interrompe a corrida numa zona de decisão sem timeout, apresenta três placas e executa o salto pela placa escolhida.
- Clique/toque direto e teclado com setas + Enter/Espaço resolvem a mesma escolha; somente o receipt aceito por React libera feedback e avanço.
- A progressão conclui após três placas sem score, vidas, XP ou persistência, que permanecem reservados à 6C.
- Gate técnico verde: 35 testes, conteúdo, TypeScript, lint, build, split Phaser e `git diff --check`.
- O smoke ampliado cobre a progressão, mas a execução completa foi interrompida duas vezes por oscilações conhecidas do Edge headless fora do fluxo novo: primeiro numa expectativa antiga de retomada já corrigida e depois no lifecycle compartilhado de visibility. Por orientação de Juliano, não houve repetição adicional nem enfraquecimento da assertion.
- Revisões independentes técnica e pedagógica/acessível resultaram em `APPROVE` após fechar foco do teclado, salto em resize/reduced motion, duração do feedback, ownership da conclusão e oráculo canônico do teste.

## Fase 6C — vidas e recuperação do Ninja

- A progressão provisória cresceu para cinco questões fáceis, únicas e determinísticas, preparando um game over parcial real sem definir ainda a duração final da 6D.
- React controla três vidas, score, combo, outcomes e tentativas. Cada erro perde uma vida e zera o combo; acertos valem 100 pontos mais bônus limitado, sem alterar XP global.
- Erros comuns avançam automaticamente depois dos 4,5 segundos de feedback. Ao perder a terceira vida, a cena preserva o mesmo feedback antes de interromper a tentativa.
- `Recuperar e continuar` restaura três vidas, preserva score e outcomes e remonta o Canvas somente com os desafios restantes; o foco volta ao host interativo.
- A bridge ganhou somente campos opcionais no receipt para vidas e encerramento da tentativa. Phaser não calcula score, vidas, conteúdo ou conclusão.
- Testes puros verdes: 39/39, incluindo game over parcial, recuperação, conclusão com última vida e teto do bônus de combo. Conteúdo, TypeScript, lint, build, split Phaser e `git diff --check` também estão verdes.
- O smoke contém assertions para mouse, touch, teclado, feedback fatal, zero vidas, score preservado, overflow, foco após recuperação e conclusão. Uma execução única com Chrome, selecionado por `SMOKE_BROWSER`, chegou ao Ninja e parou na injeção do primeiro clique por coordenadas; por orientação de Juliano, não houve novo ciclo de compatibilidade no Edge ou Chrome.
- Capturas iniciais de Chrome em 1440x900 e 768x1024 foram abertas e inspecionadas em `C:\Users\User\AppData\Local\Temp\ninja-6c-f896e69f092548f2ab4ee57330a692b8`; a captura estreita por `--window-size` não representa viewport móvel real no Windows, então a evidência móvel válida permanece a captura CDP da 6A.

## Fase 6D — progressão pedagógica do Ninja

- A rodada final usa 10 desafios, o menor tamanho que oferece dois exemplos em cada uma das cinco faixas: base afirmativa, frases simples, negativas/contrações, perguntas e mistura final.
- Cada faixa seleciona deterministicamente um item por slot a partir de listas explícitas de IDs revisados do banco canônico; nenhum enunciado, alternativa ou feedback foi copiado para o jogo.
- As quatro primeiras fases usam questões `easy`; a mistura final usa questões `medium` de concordância e contraste. Testes em 100 seeds confirmam 10 IDs únicos e ordem estável das faixas.
- A interface identifica fase atual e total. A cena dá 1,1 s às transições de fase e 720 ms às demais corridas; `NINJA_RUN_SPEED` permanece fixo, portanto velocidade não substitui conhecimento.
- O orçamento automático derivado das constantes da cena é 27,5 s com todos os acertos e 34,1 s com dois erros, antes do tempo de escolha. Com margem conservadora de 4 s por leitura/escolha em 390x844, os candidatos medem 38,0 s para 5 desafios, 74,1 s para 10 e 110,2 s para 15.
- Cinco foi rejeitado por oferecer só um exemplo por faixa; 15 excede a meta de 90 s. Dez é, portanto, o menor tamanho com repetição pedagógica clara dentro do orçamento mobile. O smoke também mede o fluxo completo com três erros/recuperação e exige menos de 90 s.
- Gate técnico: 42 testes puros, conteúdo, TypeScript, lint, build, split Phaser e `git diff --check` verdes. A coleta final da duração instrumentada não foi repetida porque o driver Chrome parou anteriormente na injeção de clique Canvas e Juliano orientou deixar problemas pequenos de navegador para depois.
- Visual: a composição inicial aprovada em 1440x900 e 768x1024 permanece estável; a indicação externa de fase usa o mesmo painel responsivo. A referência móvel CDP válida continua sendo a captura 390x844 da 6A.

## Fase 6E — acessibilidade e polish do Ninja

- O modo simplificado resolve exatamente a mesma rodada preparada por React com botões nativos, sem montar ou baixar Phaser na rota `?mode=dom`.
- React finaliza a rodada e inicia a persistência imediatamente após o décimo outcome; apenas a transição visual para o resultado aguarda 300/850 ms, evitando perda de sessão ou XP numa saída rápida.
- Canvas e DOM compartilham som, movimento reduzido, três vidas, score, combo, recuperação parcial e resultado. Score permanece separado do XP global, com teto de 60 XP e conclusão idempotente.
- Acessibilidade: uma única região viva externa ao Canvas anuncia respostas, fases, game over e conclusão; recuperação recebe foco no DOM, o Canvas recuperado volta a receber foco e o resultado foca seu título. O painel duplicado de pergunta foi removido do modo simplificado.
- O smoke foi ampliado para cobrir teclado, três erros, anúncio/foco da recuperação, rodada restante fatiada, overflow ativo/recuperado, foco do resultado e persistência de `7/10`, score `1150` e `45 XP` no DOM. As assertions de Canvas continuam cobrindo clique, toque, teclado, reduced motion, lifecycle e conclusão.
- Gate técnico: 42 testes puros, conteúdo, TypeScript, lint, build, split Phaser e `git diff --check` verdes. A suíte de navegador não foi repetida nesta subfase por orientação explícita de deixar os problemas pequenos do driver para depois; nenhuma assertion foi removida ou relaxada.
- Evidências abertas e inspecionadas: `C:\Users\User\AppData\Local\Temp\ninja-6e-3920d6352981458bbadf02c91968ae41`, com Canvas e DOM em 1440x900 e 768x1024. A referência móvel CDP válida permanece a captura 390x844 da 6A, complementada pelas checagens de overflow da suíte.
- Revisão de ownership/persistência aprovada após antecipar a finalização; a revisão acessível foi reaberta após as correções de anúncio, foco e cobertura DOM.
