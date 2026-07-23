# Decisoes Abertas

Atualizado em: 2026-07-23

## Resolvidas

1. Instalacao de dependencias

   Aprovado e executado `npm ci`. `npm install` continua nao autorizado.

2. Git nesta pasta

   Decidido e executado: inicializar Git localmente com `git init`. A branch inicial criada pelo Git e `master`. Nao houve stage, commit, remoto ou push.

3. Estrategia inicial de storage local

   Decidido: IndexedDB para progresso, sessoes, historico e revisoes; `localStorage` somente para preferencias pequenas; acesso sempre por interfaces/repositories.

4. Framework de testes recomendado

   Recomendacao futura: Vitest + React Testing Library. Ainda nao instalado e ainda depende de aprovacao para adicionar dependencias/configuracao.

5. Nome publico

   Nome publico ainda indefinido. `speakup-study` deve ser usado apenas como identificador tecnico provisorio, sem espalhar nome comercial em schemas, tipos, servicos ou IDs.

6. Baseline local

   Criado commit local `06af0e4 chore: establish initial project baseline`. Nao ha remoto configurado e nenhum push foi realizado.

7. Arquitetura minima da Fase 1

   Decidido: manter somente modelos de conteudo, contratos de sessoes e contratos de progresso. `ContentCatalog` e boundary generico de storage foram removidos por serem abstracoes prematuras. Nao criar codigo prematuro de auth, sync, analytics, audio, feature flags, billing, ads ou notificacoes.

8. Taxonomia centralizada

   Decidido: centralizar somente o catalogo ativo do MVP em `src/content/taxonomy.ts`: 8 topicos gramaticais beginner com dificuldades `easy` e `medium`, metas de 50/80 questoes, e 9 categorias de vocabulario.

9. Irregular Verbs no MVP

   Decidido: `Irregular Verbs` pertence ao vocabulario e tera exatamente 50 entradas no MVP. Cada entrada contem apenas ID, base form, Simple Past, Past Participle e traducao em portugues. Sem frases de exemplo, imagens, audio ou explicacoes longas nesta fase.

10. Modos de pratica de Irregular Verbs

   Decidido: modelar os modos `base-to-past`, `base-to-participle`, `past-to-base`, `participle-to-base`, `verb-to-translation`, `translation-to-verb` e `mixed`, sem implementar interface ou jogo nesta fase.

11. Referencia visual aprovada

   `reference/home-approved.html` existe no workspace e foi validado como HTML standalone/offline com logo embutido, fundo branco, navy `#17234b`, vinho `#8d1d30`, chamada "Bora praticar", jogos rapidos e navegacao inferior.

12. Legado funcional

   `reference/speakup-english-challenge.html` existe no workspace e foi validado como fonte funcional legada: 10 topicos, 3 dificuldades, 20 questoes por topico/dificuldade, 600 questoes totais, sessoes 10/20/30, 6 categorias de vocabulario com 10 itens cada e 7 jogos. Multitec, leads, ranking, roleta, CSV, premios e gate 75% nao pertencem ao novo MVP.

13. Normalizacao inicial de vocabulario

   Os 60 pares explicitos de `WORDS` foram normalizados em `src/content/data/vocabulary.ts`. Os 50 Irregular Verbs foram movidos de `taxonomy.ts` para `src/content/data/irregularVerbs.ts`. `taxonomy.ts` fica restrito a metadados.

14. Banco piloto Present TO BE

   Criado banco piloto `present_tobe` com 130 questoes: 50 `easy`, 80 `medium` e nenhuma dificuldade `challenge`. O formato usa apenas ID, topicId, difficulty, question, options, correctAnswer e feedback.

15. Action Verbs e Routine Verbs iniciais

   Criadas 10 entradas simples de Action Verbs e 10 entradas simples de Routine Verbs, sem frases, imagens, audio ou explicacoes. Expressoes mais avancadas do legado, como `wind down`, `catch up on`, `grab a bite` e `run errands`, continuam fora do MVP inicial.

16. Commit do banco piloto Present TO BE

   Criado commit local autorizado `5811a13 feat: add present to be pilot content`. Nao ha remoto configurado, push ou deploy.

17. Auditoria independente do Present TO BE

   Auditoria registrada em `docs/PRESENT_TOBE_AUDIT.md`. Foram corrigidos 1 problema obrigatorio e 3 melhorias recomendadas no working tree, sem segundo commit.

18. Rebalanceamento editorial do Present TO BE

   Distribuicao principal aprovada aplicada no working tree: 65 afirmativas, 22 negativas, 30 perguntas e 13 respostas curtas. Nenhum outro topico foi migrado.

19. Ambiente PowerShell para Node/npm

   Node existente encontrado em `C:\Program Files\nodejs`; PATH do usuario atualizado para incluir esse diretorio sem remover entradas existentes.

20. MVP visual e fluxo `present_tobe`

   Decidido e implementado no working tree: experiencia guest-first baseada nos dois HTMLs de referencia, com somente `present_tobe` funcional. Outros topicos, jogos e pratica de vocabulario ficam visiveis e bloqueados como "Em breve".

21. Logo da primeira versao

   Resolvido para o MVP: o PNG base64 exato de `reference/home-approved.html` foi extraido para `src/assets/speakup-logo.png`. Nenhum logo foi recriado.

22. Sons do MVP

   Decidido: Web Audio nativo para efeitos leves; a preferencia ligado/desligado usa `localStorage`.

23. Navegacao e responsividade do MVP

   Decidido: desktop e uma versao importante com largura util real e navegacao horizontal. Android/mobile usa navegacao inferior somente nas quatro areas principais, em regiao separada do conteudo e com safe area. Topicos, configuracao, sessao, feedback, resultado e dialogs sao fluxos focados sem navegacao global.

24. Direcao game-like all ages

   Decidido: navy e vinho continuam dominantes; cores auxiliares, formas geometricas, icones, estados, sons e microinteracoes fornecem energia. Nao usar mascote, linguagem infantil ou aparencia de dashboard corporativo.

25. Aprovacao visual

   Pendente: a implementacao refinada passou lint, build e smoke automatizado, mas a aprovacao visual final continua com o usuario.

26. Feedback e estudo contextual de Present TO BE

   Decidido e implementado no working tree: acertos avancam automaticamente apos 3 segundos; erros exigem acao manual e oferecem um guia contextual. O guia e exclusivo de `present_tobe`, usa classificacao local simples e nao adiciona metadados as 130 questoes. A aprovacao final continua pendente do usuario.

27. Persistencia local e metricas

   Decidido e implementado: IndexedDB nativo para progresso por questao e sessoes concluidas; `localStorage` somente para preferencias pequenas. Questoes praticadas contam IDs unicos; precisao considera todas as respostas; revisao significa ultimo resultado incorreto; recordes consideram apenas sessoes concluidas.

28. Limpeza de progresso

   Pendente: nao existe acao visivel para apagar progresso. Uma futura acao destrutiva exige decisao de produto, confirmacao explicita e tratamento claro da perda local.

29. Ranking e conta

   Ranking global semanal entre participantes e fase futura e esta fora do escopo atual. Exigira login ou identidade opcional, apelido publico, backend compartilhado, regra de pontos, periodo semanal, privacidade e prevencao minima contra pontuacao artificial. Login/sync tambem exigem estrategia de merge do progresso local e credenciais aprovadas.

30. Repositorio publico

   Decidido: consolidar o MVP jogavel em `main` e publicar o historico local no repositorio publico `https://github.com/julianobruxo/Speakup-Study.git`, sem deploy, release, tag ou pull request.

## Necessarias antes de comecar implementacao visual/home

1. Primeiro baseline Git

   Baseline local ja existe. Proximos commits continuam exigindo autorizacao separada para `git add` e `git commit`.

2. Referencia visual aprovada

   Resolvida. A reconstrucao React da home ainda depende de design system e implementacao, mas a referencia visual nao esta mais ausente.

3. Logo e assets oficiais

   Resolvido para o MVP com a extracao do logo aprovado. Variantes oficiais separadas e favicon dedicado podem ser avaliados em uma fase posterior de publicacao.

## Necessarias antes de migrar jogos/conteudo

1. Legado dos jogos e banco antigo

   Resolvido como fonte inicial: o HTML legado funcional esta disponivel em `reference/speakup-english-challenge.html`. Ainda falta decidir a estrategia de migracao gradual e revisao.

2. HTML legado ou banco antigo

   Resolvido para inventario inicial. Ainda falta separar conteudo pedagogico de mecanicas descartadas e definir se Action Verbs/Routine Verbs possuem listas vocabulares explicitas ou exigem curadoria nova.

3. Revisao pedagogica dos 50 Irregular Verbs

   A lista foi criada em formato simples e revisavel, mas ainda deve ser revisada antes de virar conteudo final para alunos.

4. Revisao pedagogica do legado

   As 600 questoes gramaticais, os 60 itens de vocabulario e os bancos de jogos devem ser inventariados antes de qualquer migracao para `src/`.

5. Revisao dos seeds de Action Verbs e Routine Verbs

   Os 10 itens iniciais de cada categoria existem, mas ainda podem ser revisados pelo usuario antes de virarem experiencia final para alunos.

6. Proximo topico gramatical

   Os outros sete topicos do MVP ainda nao foram migrados. A ordem da proxima migracao deve ser aprovada separadamente.

## Podem esperar

1. Provedor de autenticacao

   Google sign-in e citado no codigo/README, mas o `CLAUDE.md` exige login opcional e posterior. A escolha do provider pode esperar ate a fase de autenticacao.

2. Backend de sincronizacao

   Firebase, Supabase ou outro servico nao deve ser decidido antes de progresso local e contratos de sync estarem maduros.

3. Analytics

   Ferramenta, consentimento e politica de eventos podem esperar ate os fluxos principais estabilizarem.

4. Audio final

   Decidir depois se `speechSynthesis` basta no MVP ou se havera assets gravados/provedor externo.

5. Imagens de vocabulario

   Definir por categoria se imagens, emojis ou nenhum asset sao pedagogicamente uteis.

6. Monetizacao

   Premium, ads, precos e pagamentos pertencem a fase posterior aprovada.

7. PWA/offline final

   Estrategia de cache e instalacao deve esperar a estrutura de conteudo/storage estar definida.

8. Legal/privacidade final

   Textos juridicos e politicas publicas devem esperar decisoes de auth, sync, analytics e monetizacao.

## Credenciais ou servicos externos necessarios futuramente

- Provedor de autenticacao, caso aprovado.
- Backend/banco remoto para sync, caso aprovado.
- Analytics, caso aprovado.
- Hosting e dominio, somente com autorizacao explicita de deploy/publicacao.
- Provedor de pagamentos/subscricao, caso monetizacao seja aprovada.
- Rede de ads, caso ads sejam aprovados.
- Servico de audio/imagens, se o app ultrapassar recursos locais/nativos.

## Recomendacoes pendentes de aprovacao

- Usar abordagem hibrida: preservar base Vite/React, refatorar arquitetura progressivamente e reconstruir parcialmente fluxos/visual que conflitam com `CLAUDE.md`.
- Proxima fase recomendada: revisar o banco piloto `present_tobe` e aprovar uma validacao simples reutilizavel antes de migrar outro topico.
- Handoff atual criado em `docs/CURRENT_HANDOFF.md`; usar esse arquivo para iniciar a proxima sessao com menos dependencia do historico da conversa.
- Antes de construir home, criar design system alinhado a referencia para evitar home provisoria que precise ser refeita.
- Corrigir o conflito guest-first antes de implementar login real.
- Centralizar taxonomia e conteudo antes de migrar jogos.
- Criar validadores de conteudo antes de aumentar o banco de questoes.
- Manter adapters noop/local para auth, sync, analytics e feature flags ate credenciais serem aprovadas.
