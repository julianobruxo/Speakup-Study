# STATUS.md

Atualizado em: 2026-07-24 (rollout dos 9 jogos)

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
- Os nove jogos oficiais funcionais com o escopo `present_tobe` + `body`.

## Jogos

Os nove jogos do catálogo oficial estão funcionais nesta fase, usando exclusivamente `present_tobe` (Gramática) e `body` (Vocabulário) como conteúdo:

- Monte a frase — reordenar tokens da frase correta (117 questões elegíveis de 130).
- Caça ao erro — tocar no token corrompido por um distrator revisado (114 elegíveis).
- Contra o relógio — mistura das quatro mecânicas com timers individuais (10s/20s/10s/20s).
- Cada coisa no seu lugar — arrastar/tocar item para um dos 3 grupos anatômicos revisados.
- Palavra secreta — Hangman tradicional, pista em português, 5 erros, teclado físico e virtual.
- Conectando — associação de palavra em inglês à imagem.
- Cruzando palavras — tabuleiro gerado deterministicamente (até 8 palavras, usa menos quando necessário).
- Par perfeito — jogo da memória com cartas de palavra e imagem.
- Ouvido afiado — três modos: ouvir e selecionar imagem, ouvir e digitar, ouvir e montar frase.

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

## Git

- Branch principal: `main`.
- Remoto: `origin` em `https://github.com/julianobruxo/Speakup-Study.git`.
- Base esperada antes desta publicação: `ae36376 feat: complete full product interface revamp`.
- Não renomear a pasta local nem o repositório remoto nesta fase.
- Não alterar `CLAUDE.md`.

## Stack Detectada

- React `^19.2.7`.
- React DOM `^19.2.7`.
- React Router DOM `^7.18.1`.
- TypeScript `~6.0.2`.
- Vite `^8.1.1`.
- Framer Motion `^12.42.2`.
- Tailwind CSS `^4.3.3` via `@tailwindcss/vite`.
- Oxlint `^1.71.0`.
- IndexedDB nativo.
- Web Speech API.

## Validações Obrigatórias

- `node scripts/validateContent.mjs`
- `npx tsc -b`
- `npm run lint`
- `npm run build`
- `node scripts/smokeUi.mjs`

O smoke deve cobrir 360x800, 390x844, 412x915, 768x1024, 1000x800, 1024x768, 1366x768, 1440x900 e 1920x1080, com `browserErrors: 0`.

## Smoke test: bloqueio resolvido

O bloqueio anterior (`node scripts/smokeUi.mjs` não alcançava `127.0.0.1:5173`) tinha causa raiz confirmada: o script assumia um servidor Vite externo já rodando, mas processos iniciados em invocações de terminal separadas não eram acessíveis entre si neste ambiente. `scripts/smokeUi.mjs` agora inicia e gerencia seu próprio servidor Vite (reaproveitando um já ativo em `127.0.0.1:5173` quando existir) e encerra apenas o servidor que ele mesmo criou. O Edge headless também passou a rodar com `--disable-extensions` para eliminar ruído de uma extensão do perfil do sistema que gerava exceções não relacionadas ao produto.

O smoke agora cobre fluxo funcional completo dos nove jogos, timers individuais do Contra o relógio, persistência/XP/missão/streak idempotentes e checagens estruturais de acessibilidade, além dos fluxos já existentes. Passou em execuções consecutivas com `browserErrors: 0`.
