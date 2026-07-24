# Current Handoff

Atualizado em: 2026-07-24

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

`Conectando` é o nome aprovado para associação entre palavra em inglês e imagem.

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

## Git

- Branch: `main`.
- Remoto: `origin` em `https://github.com/julianobruxo/Speakup-Study.git`.
- A pasta local e o repositório remoto mantêm nomes históricos.
- Não fazer deploy, PR, tag ou release nesta fase.
- Não alterar `CLAUDE.md`.
