# Mapa de Implementação

Atualizado em: 2026-07-24

## Estado Atual

O mapa atual acompanha **Inglês em Jogo**, produto de prática de inglês da **Speak UP!**. A implementação aprovada visualmente substitui a direção anterior e usa `reference/ingles-em-jogo-product-vision.html` como especificação visual canônica.

## Módulos Implementados

- `src/components`: shell, navegação, dialogs, cards, ícones e componentes reutilizáveis.
- `src/pages`: Home, Estudar, Gramática, sessão, Vocabulário, flashcards, Jogos, Progresso e Perfil.
- `src/content`: taxonomia, Present TO BE, vocabulário regular e irregular verbs.
- `src/services/sessions`: seleção de perguntas e contratos de sessão.
- `src/services/progress`: progresso local, preferências, engajamento e hooks.
- `src/services/audio`: som e pronúncia.
- `src/games/core`: catálogo, matriz de compatibilidade, configuração de rodada, contratos de desafio, engine de sessão, seleção determinística e integração de XP/missão/streak.
- `src/games/adapters`: adapters de `present_tobe` (Gramática) e `body` (Vocabulário) sobre os bancos canônicos.
- `src/games/components`: shell de jogo, barra de progresso e tela de resultado compartilhados.
- `src/games/assets`: resolvedor central de assets por `visualKey`.
- `src/games/mechanics`: implementação dos nove jogos.
- `scripts`: validação de conteúdo e smoke visual.

## Funcionalidades Concluídas

- Present TO BE com 130 questões, sendo 50 easy e 80 medium.
- Sessões de 10, 20 e 30 perguntas, sem repetição.
- Feedback correto com avanço automático em 2 segundos.
- Feedback incorreto com explicação, revisão e estudo contextual.
- 24 flashcards de Partes do corpo com ilustração, áudio, swipe e teclado.
- Progresso local via IndexedDB.
- XP, níveis, títulos, sequência diária, missão diária, meta semanal, Liga Safira local, ranking simulado, conquistas e atividade semanal.
- Perfil local editável.
- Responsividade desktop, tablet e mobile.

## Jogos

Os nove jogos do catálogo oficial estão funcionais com `present_tobe` + `body`:

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

## Persistência

- IndexedDB `practice-progress`, versão 3.
- Stores: `questions`, `sessions`, `engagement`, `gameSessions`.
- Migração preserva dados existentes.
- Perfil e engajamento são locais.
- Liga e ranking usam participantes simulados.
- XP de jogos idempotente por `sessionId`; sem sincronização e sem backend.

## Próximas Frentes

- Migrar os demais tópicos gramaticais e ligar aos jogos via `ROLLOUT_CONTENT`.
- Expandir categorias de vocabulário e ligar aos jogos via `ROLLOUT_CONTENT`.
- Avaliar framework de testes somente com aprovação para nova dependência.
- Planejar login/sync como melhoria opcional, preservando progresso local.
- Avaliar code splitting para o bundle de jogos (aviso de chunk >500 kB).

## Fora do Escopo Atual

- Deploy.
- PR.
- Tag.
- Release.
- Backend.
- Sync.
- Ranking real entre usuários conectados.
- Monetização.
- PWA.
