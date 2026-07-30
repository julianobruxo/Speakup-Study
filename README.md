# Inglês em Jogo

Plataforma de prática de inglês da Speak UP! com gramática, vocabulário, flashcards, progresso local e mecânicas de jogo.

Inglês em Jogo é uma aplicação educacional game-like construída com React, TypeScript e Vite. Ela combina prática de Gramática, Vocabulário e elementos de engajamento em uma experiência local-first: atualmente funciona sem login, sem backend e salva o progresso no navegador.

## Funcionalidades Atuais

- Gramática funcional: Present TO BE com 130 questões, sendo 50 easy e 80 medium.
- Sessões de 10, 20 e 30 perguntas.
- Seleção inteligente de questões, priorizando inéditas, últimos erros e itens vistos há mais tempo.
- Ausência de repetição dentro da mesma sessão.
- Feedback correto com avanço automático em 2 segundos.
- Feedback incorreto com explicação, avanço manual e ação `Estudar esse tópico`.
- Progresso local, revisão de erros, recordes e estatísticas de prática.
- Vocabulário funcional: 24 flashcards de Partes do corpo.
- Ilustrações locais, pronúncia automática pela Web Speech API, swipe, teclado e som configurável.
- XP, níveis, títulos, sequência diária, missão diária e meta semanal.
- Liga Safira local com ranking e dez participantes simulados.
- Conquistas, atividade semanal e perfil local editável.
- Layout responsivo para desktop, tablet e mobile.

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

`Conectando` é o nome aprovado para o jogo de associação entre palavra em inglês e imagem.

## Conteúdo Disponível

Atualmente funcional:

- Gramática: Present TO BE;
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

## Persistência

A persistência usa IndexedDB nativo. O banco local preserva os dados por migração e mantém stores para progresso por questão, sessões concluídas, engajamento e sessões de jogo. Perfil, XP, conquistas, sequência, missão, meta semanal e liga são locais ao navegador.

Não há sincronização, conta remota ou backend. A Liga Safira é uma experiência local. Os demais participantes são simulados e não representam usuários conectados.

## Stack

Stack declarada em `package.json`:

- React `^19.2.7`;
- React DOM `^19.2.7`;
- TypeScript `~6.0.2`;
- Vite `^8.1.1`;
- React Router DOM `^7.18.1`;
- Framer Motion `^12.42.2`;
- Tailwind CSS `^4.3.3` com `@tailwindcss/vite` `^4.3.3`;
- IndexedDB nativo;
- Web Speech API.

## Como Executar

Requer Node.js `>=22.18`.

```bash
npm install
npm run dev
```

O Vite informa a URL local ao iniciar.

## Build e Validação

```bash
npm test
npm run build
npm run lint
npx tsc -b
node scripts/validateContent.mjs
node scripts/smokeUi.mjs
```

## Estrutura Principal

- `src/components`: shell, navegação e componentes reutilizáveis;
- `src/pages`: telas e fluxos principais;
- `src/content`: taxonomia e bancos de conteúdo;
- `src/services`: progresso, engajamento, sessões e áudio;
- `src/games`: fundação compartilhada e implementação dos nove jogos;
- `scripts`: validação de conteúdo e smoke visual;
- `docs`: estado, arquitetura, roadmap e handoff;
- `reference`: referências visuais e legado.

## Referência Visual

`reference/ingles-em-jogo-product-vision.html` é a especificação visual canônica do produto.

## Estado Atual

O produto está funcional localmente, sem deploy nesta fase. Não há login, backend ou sincronização. Os nove jogos estão funcionais com o escopo `present_tobe` + `body`; os demais tópicos e categorias ainda estão em desenvolvimento.
