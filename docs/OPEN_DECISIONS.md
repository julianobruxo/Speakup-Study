# Decisoes Abertas

Atualizado em: 2026-07-22

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

## Necessarias antes de comecar implementacao visual/home

1. Primeiro baseline Git

   Baseline local ja existe. Proximos commits continuam exigindo autorizacao separada para `git add` e `git commit`.

2. Referencia visual aprovada

   Resolvida. A reconstrucao React da home ainda depende de design system e implementacao, mas a referencia visual nao esta mais ausente.

3. Logo e assets oficiais

   O app usa placeholder "SU" e assets derivados do Vite. Precisamos dos arquivos oficiais de logo/favicon ou aprovacao para criar assets temporarios.

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
- Antes de construir home, criar design system alinhado a referencia para evitar home provisoria que precise ser refeita.
- Corrigir o conflito guest-first antes de implementar login real.
- Centralizar taxonomia e conteudo antes de migrar jogos.
- Criar validadores de conteudo antes de aumentar o banco de questoes.
- Manter adapters noop/local para auth, sync, analytics e feature flags ate credenciais serem aprovadas.
