# Decisões Abertas

Atualizado em: 2026-07-24

## Resolvidas

1. Nome público

   O produto se chama **Inglês em Jogo**, com identidade complementar **Speak UP!**. O package name é `ingles-em-jogo`. A pasta local e o repositório remoto mantêm nomes históricos.

2. Referência visual canônica

   `reference/ingles-em-jogo-product-vision.html` é a especificação visual canônica do produto.

3. Produto guest-first e local-first

   A prática funciona sem login, sem backend e sem sincronização. Progresso, perfil e engajamento são locais.

4. Persistência local

   IndexedDB nativo, banco `practice-progress`, versão 2, com stores `questions`, `sessions` e `engagement`. `localStorage` fica restrito a preferências pequenas.

5. Conteúdo funcional

   Present TO BE está funcional com 130 questões, sendo 50 easy e 80 medium. Partes do corpo está funcional com 24 flashcards.

6. Feedback

   Acertos avançam automaticamente após 3 segundos. Erros exibem explicação e mantêm avanço manual com acesso a `Estudar esse tópico`.

7. Liga e ranking

   A Liga Safira é local. Os demais participantes são simulados e não representam usuários conectados.

8. Catálogo de jogos

   Catálogo planejado aprovado:

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

9. Repositório

   A branch principal é `main` e rastreia `origin/main` em `https://github.com/julianobruxo/Speakup-Study.git`. O remoto não deve ser renomeado nesta fase.

10. Jogos funcionais

    Os nove jogos do catálogo oficial estão implementados sobre uma fundação compartilhada (`src/games`), usando `present_tobe` e `body`. Nenhum banco de conteúdo foi duplicado; cada jogo consome os bancos canônicos via adapters.

## Abertas

1. Próximo tópico gramatical

   Past TO BE, Simple Present, Present Continuous, Be Going To, Simple Past, There TO BE e Prepositions ainda precisam de migração e revisão pedagógica antes de entrar em `ROLLOUT_CONTENT`.

2. Expansão de vocabulário

   As demais categorias de vocabulário ainda precisam de conteúdo, assets e validação antes de entrar em `ROLLOUT_CONTENT`.

3. Smoke test completo pendente

   O smoke visual (`node scripts/smokeUi.mjs`) não pôde ser executado até o fim nesta sessão por um bloqueio de rede do sandbox (Edge headless não alcança o Vite local). Juliano precisa rodá-lo localmente para validar os nove jogos nos nove viewports.

4. Testes automatizados adicionais

   Vitest e React Testing Library continuam recomendados, mas não instalados. Adicionar dependências exige aprovação.

5. Login e sincronização

   Login deve ser opcional e posterior. Qualquer sync futura precisa preservar e mesclar progresso local.

6. Reset/exportação

   O reset local já existe com confirmação. Exportação local ainda não foi definida.

7. Assets oficiais

   Variantes oficiais adicionais de logo, ícones e materiais de vocabulário podem ser avaliadas em fase futura.

8. Deploy

   Deploy, PR, tag e release estão fora desta publicação e exigem autorização separada.
