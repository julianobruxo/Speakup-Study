# MVP UI Flow

Atualizado em: 2026-07-24

## Fonte de Verdade

- `reference/ingles-em-jogo-product-vision.html`: especificação visual canônica.
- `src/content`: conteúdo funcional.
- `src/services/progress`: progresso e engajamento local.
- `reference/speakup-english-challenge.html`: legado técnico, sem definir a direção atual.

## Fluxo Principal

```text
Home
-> Bora praticar
-> Gramática
-> Present TO BE
-> easy ou medium
-> 10, 20 ou 30 questões
-> Sessão
-> Acerto automático em 2s ou erro com avanço manual
-> Resultado
-> Jogar novamente, trocar configuração ou voltar à Home
```

## Áreas Principais

- Home: missão diária, meta semanal, caminho de aprendizagem, Liga Safira local e jogos bloqueados.
- Estudar: biblioteca com Gramática, Vocabulário e revisão de erros.
- Gramática: Present TO BE funcional e demais tópicos planejados.
- Vocabulário: Partes do corpo funcional e demais categorias planejadas.
- Progresso: atividade semanal, conquistas, revisão e métricas locais.
- Perfil: dados locais editáveis, preferências e reset.
- Jogos: catálogo bloqueado como `Em breve`.

## Conteúdo Disponível

- Gramática funcional: Present TO BE, 130 questões, 50 easy, 80 medium.
- Sessões: 10, 20 e 30 perguntas, sem repetição dentro da sessão.
- Vocabulário funcional: 24 flashcards de Partes do corpo.
- Planejado: Past TO BE, Simple Present, Present Continuous, Be Going To, Simple Past, There TO BE, Prepositions e demais categorias de Vocabulário.

## Jogos

Jogos ainda estão em desenvolvimento. Catálogo planejado:

- Monte a frase;
- Caça ao erro;
- Contra o relógio;
- Cada coisa no seu lugar;
- Palavra secreta;
- Conectando;
- Cruzando palavras;
- Par perfeito;
- Ouvido afiado — fase posterior.

## Navegação

- Mobile usa navegação inferior.
- Desktop usa sidebar completa.
- Tablet usa rail.
- Fluxos focados, como sessão, flashcards e dialogs, removem navegação global quando necessário.
- Sair de sessão iniciada exige confirmação.

## Feedback

Acerto:

- bloqueia alternativas;
- mostra `Correto!`;
- mantém barra linear de 2 segundos;
- avança automaticamente uma única vez.

Erro:

- destaca alternativa escolhida e resposta correta;
- mostra feedback pedagógico;
- não possui timer;
- avança por `Continuar` ou clique/toque no card de explicação;
- oferece `Estudar esse tópico`.

## Flashcards

- `/vocabulario/body/flashcards` mostra os 24 cards de Partes do corpo.
- Frente: português, ilustração e destaque visual.
- Verso: inglês e ação de ouvir novamente.
- Pronúncia usa Web Speech API.
- Navegação por botões, setas e swipe.
- Conclusão não cria score competitivo.

## Persistência e Métricas

- Progresso, perfil e engajamento são locais.
- IndexedDB preserva questões, sessões e engajamento.
- Revisão é baseada no último resultado incorreto.
- Precisão considera todas as respostas confirmadas.
- Liga Safira e ranking são locais e simulados.
- Não há sincronização.

## Smoke Test

`node scripts/smokeUi.mjs` deve cobrir:

- 360x800;
- 390x844;
- 412x915;
- 768x1024;
- 1000x800;
- 1024x768;
- 1366x768;
- 1440x900;
- 1920x1080.

Também cobre navegação, ausência de overflow, feedback, timer de 2 segundos, flashcards, áudio, swipe, teclado, progresso, engajamento, ranking simulado, perfil local e `browserErrors: 0`.
