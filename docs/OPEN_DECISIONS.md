# Decisões Abertas

Atualizado em: 2026-08-03

## Resolvidas

1. Nome público

   O produto se chama **Inglês em Jogo**, com identidade complementar **Speak UP!**. O package name é `ingles-em-jogo`. A pasta local e o repositório remoto mantêm nomes históricos.

2. Referência visual canônica

   `reference/ingles-em-jogo-product-vision.html` é a especificação visual canônica do produto.

3. Produto guest-first e local-first

   A prática funciona sem login, sem backend e sem sincronização. Progresso, perfil e engajamento são locais.

4. Persistência local

   IndexedDB nativo, banco `practice-progress`, versão 3, com stores `questions`, `sessions`, `engagement` e `gameSessions`. `localStorage` fica restrito a preferências pequenas.

5. Conteúdo funcional

   Present TO BE está funcional com 130 questões, sendo 50 easy e 80 medium. Partes do corpo está funcional com 24 flashcards.

6. Feedback

   Acertos avançam automaticamente após 2 segundos. Erros exibem explicação e mantêm avanço manual com acesso a `Estudar esse tópico`.

7. Liga e ranking

   A Liga Safira é local. Os demais participantes são simulados e não representam usuários conectados.

8. Catálogo de jogos

   Catálogo v1 aprovado:

   - Monte a frase;
   - Caça ao erro;
   - Contra o relógio;
   - Cada coisa no seu lugar;
   - Palavra secreta;
   - Conectando;
   - Cruzando palavras;
   - Par perfeito;
   - Ouvido afiado;
   - Bubble Shooter;
   - Corte a palavra;
   - Ninja;
   - Corrida individual.

   `Conectando` é o nome aprovado para associação entre palavra em inglês e imagem.
   Os nove jogos DOM e Bubble Shooter estão funcionais; Corte a palavra, Ninja e Corrida individual seguem nas Fases 5–7 do roadmap canônico.

9. Repositório

   A branch principal é `main` e rastreia `origin/main` em `https://github.com/julianobruxo/Speakup-Study.git`. O remoto não deve ser renomeado nesta fase.

10. Jogos funcionais

    Dez jogos do catálogo oficial estão implementados sobre uma fundação compartilhada (`src/games`), usando `present_tobe` e `body`. Nenhum banco de conteúdo foi duplicado; cada jogo consome os bancos canônicos via adapters.

11. Roadmap e testes puros

    `docs/IMPLEMENTATION_MAP.md` é o roadmap canônico dos 13 jogos. A fundação usa `node:test` sem dependência adicional e mantém React responsável por sessão, resultado, persistência e engajamento.

12. Fluxos de entrada dos jogos

    A auditoria das nove mecânicas DOM pertence à Fase 2. A configuração game-first e content-first para o catálogo completo pertence à Fase 8, depois que os quatro arcades existirem, evitando implementar duas vezes a mesma integração.

13. Code-splitting e bridge arcade

    As rotas de jogos são lazy, Phaser 3.90.0 fica em chunk isolado sem preload e a bridge mantém React responsável por rodada, outcome, persistência e engajamento. Todo arcade deve oferecer modo DOM simplificado pela mesma rodada preparada.

## Abertas

1. Próximo tópico gramatical

   Past TO BE, Simple Present, Present Continuous, Be Going To, Simple Past, There TO BE e Prepositions ainda precisam de migração e revisão pedagógica antes de entrar em `ROLLOUT_CONTENT`.

2. Expansão de vocabulário

   As demais categorias de vocabulário ainda precisam de conteúdo, assets e validação antes de entrar em `ROLLOUT_CONTENT`.

3. Atualização do React Router

   `npm audit` reporta a advisory alta `GHSA-qwww-vcr4-c8h2`, relativa a CSRF em RSC Actions. O produto atual é uma SPA Vite e não usa RSC, mas deve adotar uma versão corrigida e compatível quando ela estiver disponível na linha usada pelo projeto. Não aplicar o downgrade sugerido automaticamente pelo npm.

4. Testes automatizados adicionais

   A fundação, os contratos DOM, a bridge e Bubble Shooter possuem 26 testes puros com `node:test`, e o smoke cobre os fluxos reais no Edge. Testes de componente com uma biblioteca dedicada continuam opcionais; adicionar dependências além do Phaser autorizado exige decisão explícita.

5. Login e sincronização

   Login deve ser opcional e posterior. Qualquer sync futura precisa preservar e mesclar progresso local.

6. Reset/exportação

   O reset local já existe com confirmação. Exportação local ainda não foi definida.

7. Assets oficiais

   Variantes oficiais adicionais de logo, ícones e materiais de vocabulário podem ser avaliadas em fase futura.

8. Deploy

   Deploy, PR, tag e release estão fora desta publicação e exigem autorização separada.
