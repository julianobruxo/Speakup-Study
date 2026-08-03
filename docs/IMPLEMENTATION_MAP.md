# Mapa de Implementação — Jogos v1

Atualizado em: 2026-08-03

Este é o roadmap canônico da primeira versão com 13 jogos. `docs/REVAMP_ROADMAP.md` permanece como registro histórico do revamp visual concluído e não acompanha este loop.

## Objetivo da versão

- estabilizar os nove jogos DOM existentes;
- adicionar Bubble Shooter, Corte a palavra, Ninja e Corrida individual;
- manter React responsável por produto, conteúdo, sessão, resultado, persistência e engajamento;
- limitar Phaser à renderização e ao estado transitório dos quatro arcades;
- entregar uma release candidate local, sem push ou deploy.

Conteúdo autorizado:

- Gramática: `present_tobe`;
- Vocabulário: `body`, com 24 entradas e assets locais.

## Estado das fases

| Fase | Estado | Dependência | Gate principal |
|---|---|---|---|
| 0. Consolidar baseline | concluída | nenhuma | checkpoint local `1a64659` |
| 1. Roadmap e fundação | concluída | Fase 0 | contratos, testes e revisão verdes |
| 2. Fechar nove jogos DOM | concluída | Fase 1 | nove rodadas completas, `browserErrors: 0` |
| 3. Code-splitting e bridge Phaser | concluída | Fase 2 | Phaser isolado, mount/unmount limpo e revisão aprovada |
| 4. Bubble Shooter | concluída | Fase 3 | arcade completo e modo DOM simplificado |
| 5. Corte a palavra | concluída | Fase 4 | gesto confiável, modos Canvas/DOM e gate aprovado |
| 6. Ninja | concluída — 6A a 6E | Fase 5 | modos Canvas/DOM, persistência, acessibilidade e revisões verdes |
| 7. Corrida individual | pendente | Fase 6 | experiência single-player completa |
| 8. Integração dos 13 jogos | pendente | Fase 7 | dois fluxos de entrada completos |
| 9. Release candidate | pendente | Fase 8 | auditoria final sem regressões conhecidas |

## Fundação compartilhada

| Contrato | Fonte | Estado |
|---|---|---|
| catálogo e compatibilidade | `src/games/core/catalog.ts` | onze jogos publicados; Ninja preparado para publicação na Fase 8 e Corrida pendente |
| configuração de rodada e XP | `src/games/core/roundConfig.ts` | centralizada |
| seleção e seed | `selectChallenges.ts`, `shuffle.ts` | determinística, sem repetição |
| payloads | `challengeTypes.ts`, `arcadeBridge.ts` | contratos DOM e bridge arcade validados pela camada React |
| outcomes e resultado | `sessionEngine.ts` | primeiro outcome por `challengeId`, score separado de XP |
| persistência | `localProgress.ts` | IndexedDB v3, store `gameSessions` |
| missão, streak e XP | `engagement.ts` | idempotência por `sessionId` |
| conclusão React | `completionCoordinator.ts`, `useGameCompletion.ts` | fila entre sessões, duas tentativas automáticas e retry visível |
| assets | `visualResolver.tsx` | resolução central por `visualKey` |
| testes puros | `tests/gamesFoundation.test.mjs`, `tests/domGameContracts.test.mjs`, `tests/arcadeBridge.test.mjs`, `tests/bubbleShooter.test.mjs`, `tests/wordSlice.test.mjs`, `tests/ninjaFoundation.test.mjs` | 42 testes com `node:test` |
| smoke funcional/visual | `scripts/smokeUi.mjs` | a suite cobre nove viewports e verifica `browserErrors` |
| bridge arcade | `src/games/arcade/bridge` | rodada preparada e outcome validado por React; cena técnica e três arcades completos em chunks sob demanda |
| isolamento Phaser | `scripts/verifyPhaserSplit.mjs` | manifest comprova chunk sob demanda sem preload no entry |

## Fase 1 — critérios

- documentar um único roadmap executável;
- preservar catálogo, conteúdo e serviços atuais;
- testar catálogo, compatibilidade, round sizes, timers, seed, seleção, outcome, XP e qualificação de rodada;
- impedir outcome duplicado no engine;
- serializar conclusão, repetir uma falha automaticamente e oferecer retry visível com a mesma `sessionId`;
- não instalar bibliotecas;
- não iniciar Phaser ou code-splitting.

## Fase 2 — auditoria dos jogos DOM

Ordem de fechamento:

1. Monte a frase — materialização, ambiguidade, progressão, teclado e múltiplas lacunas;
2. Caça ao erro — exatamente um erro revisado e feedback pedagógico;
3. Contra o relógio — mistura compatível, timers e feedback de erro/timeout;
4. Cada coisa no seu lugar — 12 itens em três grupos, drag/touch/teclado;
5. Palavra secreta — cinco palavras, cinco erros, espaços/hífens e mobile;
6. Conectando — somente regressões do baseline gestual;
7. Cruzando palavras — grid válido, interseções e foco;
8. Par perfeito — bloqueio durante animação e timers sem corrida;
9. Ouvido afiado — três modos, TTS disponível/indisponível e cleanup.

Critérios transversais desta fase:

- atribuir corretamente Gramática e Vocabulário em rodadas mistas;
- remover rótulos falsos de `Em breve` dos nove jogos e atalhos funcionais;
- ampliar smoke por estado crítico sem enfraquecer assertions.

## Fase 3 — fronteira React–Phaser

Antes de instalar Phaser:

1. carregar rotas de jogos com `React.lazy`;
2. medir e reduzir o chunk inicial;
3. definir um contrato mínimo de rodada preparada e outcomes;
4. validar uma cena técnica com resize, pausa, som, movimento reduzido e teardown;
5. comprovar que quem não abre arcade não baixa Phaser.

React mantém:

- rotas, shell, catálogo e configuração;
- conteúdo canônico e seleção;
- sessão, resultado, XP, missão, streak e IndexedDB;
- preferências e acessibilidade externa.

Phaser mantém apenas:

- canvas, física, colisões, movimento, sprites e partículas;
- controles e estado transitório da partida.

## Arcades

- **Bubble Shooter:** vocabulário `body`, colisão circular, grupos, peças desconectadas, combo e modo DOM.
- **Corte a palavra:** trilha interpolada, colisão confiável, alvos/distratores, progressão e modo DOM.
- **Ninja:** corrida automática em 6A–6E; velocidade não substitui conhecimento.
- **Corrida individual:** três faixas, portais, swipe/toque, boost e desaceleração; nenhum código multiplayer.

### Ninja — estado das subfases

- **6A concluída:** rota lazy direta, personagem, auto-run, câmera, cenário procedural, três camadas de parallax, pooling, resize, pausa, movimento reduzido e teardown. Ainda sem card público, conteúdo, outcome ou persistência.
- **6B concluída:** três questões canônicas, placas/opções, salto por clique/toque ou teclado, feedback e uma progressão funcional sem timeout.
- **6C concluída:** cinco desafios provisórios, três vidas, recuperação, game over parcial, transições, score e combo sob ownership React.
- **6D concluída:** 10 desafios em cinco faixas pedagógicas, timing centralizado e medição mobile instrumentada sem aumento de velocidade.
- **6E concluída:** modo DOM equivalente, controles alternativos, som global, movimento reduzido, foco/anúncios, resultado persistente e polimento responsivo.

## Fase 8 — integração dos 13 jogos

- consumir catálogo e compatibilidade no fluxo game-first;
- oferecer o fluxo content-first a partir das áreas de Gramática e Vocabulário;
- configurar conteúdo e rodada antes de iniciar cada jogo;
- manter links diretos válidos com defaults canônicos;
- validar navegação, persistência e resultado nos dois fluxos.

## Gates por checkpoint

Executar quando relevante:

```text
npm test
node scripts/validateContent.mjs
npx tsc -b
npm run lint
npm run build
node scripts/verifyPhaserSplit.mjs
node scripts/smokeUi.mjs
git diff --check
```

Uma fase só recebe checkpoint local após revisão técnica, teste funcional, screenshots abertas, acessibilidade verificada, documentação coerente e stage inspecionado. Push, PR, tag, release e deploy permanecem proibidos.

## Decisões registradas

- `docs/IMPLEMENTATION_MAP.md` é o único roadmap ativo deste loop.
- Phaser 3 é a única dependência nova previamente autorizada e somente a partir da Fase 3.
- Testes puros usam `node:test`.
- Score de jogo não multiplica XP global.
- Uma rodada concluída persiste pela camada React e usa `sessionId` idempotente.
- Multiplayer, backend, autenticação e sincronização remota não pertencem à v1.
