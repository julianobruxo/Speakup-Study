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
- `scripts`: validação de conteúdo e smoke visual.

## Funcionalidades Concluídas

- Present TO BE com 130 questões, sendo 50 easy e 80 medium.
- Sessões de 10, 20 e 30 perguntas, sem repetição.
- Feedback correto com avanço automático em 3 segundos.
- Feedback incorreto com explicação, revisão e estudo contextual.
- 24 flashcards de Partes do corpo com ilustração, áudio, swipe e teclado.
- Progresso local via IndexedDB.
- XP, níveis, títulos, sequência diária, missão diária, meta semanal, Liga Safira local, ranking simulado, conquistas e atividade semanal.
- Perfil local editável.
- Responsividade desktop, tablet e mobile.

## Jogos

Nenhum jogo está funcional. O catálogo futuro aprovado é:

- Monte a frase;
- Caça ao erro;
- Contra o relógio;
- Cada coisa no seu lugar;
- Palavra secreta;
- Conectando;
- Cruzando palavras;
- Par perfeito;
- Ouvido afiado — fase posterior.

`Conectando` é o nome aprovado para associação entre palavra em inglês e imagem.

## Persistência

- IndexedDB `practice-progress`, versão 2.
- Stores: `questions`, `sessions`, `engagement`.
- Migração preserva dados existentes.
- Perfil e engajamento são locais.
- Liga e ranking usam participantes simulados.
- Sem sincronização e sem backend.

## Próximas Frentes

- Migrar os demais tópicos gramaticais.
- Expandir categorias de vocabulário.
- Implementar jogos usando conteúdo compartilhado.
- Avaliar framework de testes somente com aprovação para nova dependência.
- Planejar login/sync como melhoria opcional, preservando progresso local.

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
