# Current Handoff

Atualizado em: 2026-07-30

## Produto

**Inglês em Jogo** é uma aplicação standalone de prática de inglês da **Speak UP!**. O produto é guest-first e local-first: inicia sem login, não usa backend e preserva progresso no navegador.

O Product Vision aprovado em `reference/ingles-em-jogo-product-vision.html` é a especificação visual canônica. `reference/home-approved.html` e `reference/speakup-english-challenge.html` continuam como referências históricas e de legado, sem substituir a direção atual.

## Estado Funcional

- Home game-like com missão diária, meta semanal, caminho de aprendizagem, Liga Safira local e jogos bloqueados.
- Estudar como biblioteca com Gramática, Vocabulário e revisão de erros.
- Gramática funcional apenas em Present TO BE, com avanço automático em 2 segundos após acerto.
- Vocabulário funcional apenas em Partes do corpo.
- Progresso com atividade semanal, conquistas, revisão e métricas locais.
- Perfil local editável, preferências e reset local confirmado.
- Jogos: os nove jogos do catálogo oficial funcionais com `present_tobe` + `body`.
- Página de Jogos: nove cards com thumbnails aprovadas integradas no topo, versões WebP 800x450 em `src/assets/game-card-images/cards/`, masters 1600x900 preservados e carregamento otimizado sem PNGs de produção.

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
- Cada coisa no seu lugar usa associação palavra-imagem com dois painéis de seis pares, fotos locais e fallback por toque/teclado.

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

Os nove jogos do catálogo oficial estão funcionais, usando `present_tobe` (Gramática) e `body` (Vocabulário):

- Monte a frase;
- Caça ao erro;
- Contra o relógio;
- Cada coisa no seu lugar;
- Palavra secreta;
- Conectando;
- Cruzando palavras;
- Par perfeito;
- Ouvido afiado.

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
- `/jogos`: catálogo de nove jogos.
- `/jogos/monte-a-frase`, `/jogos/caca-ao-erro`, `/jogos/contra-o-relogio`, `/jogos/cada-coisa-no-seu-lugar`, `/jogos/palavra-secreta`, `/jogos/conectando`, `/jogos/cruzando-palavras`, `/jogos/par-perfeito`, `/jogos/ouvido-afiado`: jogos individuais.
- `/progresso`: progresso local.
- `/perfil`: perfil local.

## Stack

- Vite, React, React DOM, React Router DOM, TypeScript, Framer Motion, Tailwind CSS, Oxlint.
- IndexedDB nativo para progresso/engajamento.
- Web Speech API para pronúncia.

## Validações

Rodar antes de commit/push:

```bash
node scripts/validateContent.mjs
npx tsc -b
npm run lint
npm run build
node scripts/smokeUi.mjs
```

O smoke cobre nove viewports: 360x800, 390x844, 412x915, 768x1024, 1000x800, 1024x768, 1366x768, 1440x900 e 1920x1080.

Baseline da Fase 0 aprovado em 2026-07-30 com `validateContent`, TypeScript, lint, build, smoke completo e `git diff --check`. As capturas de catálogo, Conectando e Par perfeito foram inspecionadas em 1440x900, 768x1024 e 390x844. O build atual mantém um aviso de chunk inicial de cerca de 535 kB, que será tratado por code-splitting antes do Phaser.

### Relatório da Fase 0

- Objetivo: preservar e concluir o trabalho local iniciado em Conectando, Par perfeito, assets, CSS, smoke e documentação.
- Decisões: manter React como dono da rodada e persistência; registrar somente o primeiro outcome por palavra; usar uma única região live; tratar seleção/cancelamento como feedback neutro; preservar integralmente a composição dos WebPs.
- Revisões: Dalton revisou o diff técnico e os assets; Bernoulli auditou os nove jogos e a fundação para orientar as Fases 1 e 2. Ambos atuaram somente em leitura.
- Defeitos corrigidos: assets com máscaras aparentes ou grafia divergente, updater impuro em StrictMode, tom incorreto após retração, anúncios duplicados, timer sem limpeza, seleção mantida após `pointercancel`, `touchEnd` sem coordenadas úteis, hitboxes sobrepostas, linhas desktop excessivamente longas e alvo mobile abaixo de 44 px.
- Testes: `validateContent`, `tsc -b`, `lint`, `build`, smoke funcional/visual e `git diff --check`; o smoke cobre mouse, touch real via CDP, drop próximo à borda, clique, teclado, resultado 5/6, reset e resize, com `browserErrors: 0`.
- Evidências visuais: diretório `C:\Users\User\AppData\Local\Temp\ingles-em-jogo-ui-smoke-g3MRP2`, incluindo catálogo, Conectando e Par perfeito em 1440x900, 768x1024 e 390x844.
- Arquivos: `MatchingPairsGame.tsx`, `MemoryMatchGame.tsx`, `index.css`, `smokeUi.mjs`, seis WebPs autorizados, `STATUS.md` e este handoff.
- Git: checkpoint exclusivamente local na branch `feat/loop-jogos-v1`; o SHA fica no histórico Git e será consolidado no relatório do próximo checkpoint. Nenhum push ou deploy.

## Git

- Branch: `feat/loop-jogos-v1`.
- Base do loop: `2547adda3db0a05959f2fa1cf377918d5df6b6eb`; todas as mudanças não commitadas anteriores foram preservadas ao criar a branch.
- Remoto: `origin` em `https://github.com/julianobruxo/Speakup-Study.git`.
- A pasta local e o repositório remoto mantêm nomes históricos.
- Checkpoints locais são autorizados somente após gate verde.
- Não fazer push, deploy, PR, tag ou release durante o loop.
