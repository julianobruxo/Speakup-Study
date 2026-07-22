# Mapa de Implementacao

Atualizado em: 2026-07-22

Este mapa assume uma abordagem hibrida: evolucao incremental da base Vite/React existente, com refatoracao progressiva da arquitetura e reconstrucao parcial das telas/fluxos que conflitam com o `CLAUDE.md`. A base atual e pequena demais para justificar uma reescrita completa, mas tambem e placeholder demais para ser apenas "preenchida" sem criar fundamentos de dominio.

## Fase 0 - Baseline executavel e higiene de projeto

Objetivo: tornar o projeto verificavel localmente sem mudar comportamento.

Por que agora: nenhuma fase de produto deve comecar enquanto lint/build/testes nao puderem rodar.

Pre-requisitos:

- Aprovacao para instalar dependencias com `npm ci` sem usar `npm install`.
- Nao inicializar Git nesta pasta nesta etapa.

Areas afetadas:

- documentacao
- `node_modules/` criado por `npm ci`
- `dist/` criado por `npm run build`

Novos modulos:

- Nenhum modulo de produto.
- Possivel configuracao de testes em fase aprovada.

Funcionalidades:

- Nenhuma funcionalidade nova.
- Validacao local de lint/build.

Fora do escopo:

- UI nova.
- Conteudo.
- Autenticacao.
- Integracoes externas.

Riscos:

- Lockfile pode mudar ao instalar, dependendo do npm.
- Sem Git, nao ha diff formal para preservar alteracoes.

Testes necessarios:

- `npm run lint`
- `npm run build`
- futuro `npm test` quando existir.

Criterios de conclusao:

- Dependencias instaladas de modo reprodutivel.
- Build e lint documentados.
- Status atualizado.

Dependencias posteriores:

- Todas as fases.

Resultado em 2026-07-22:

- `npm ci` passou em aproximadamente 8,94 segundos.
- `npm run lint` passou.
- `npm run build` passou.
- `npm audit --audit-level=low` reportou 0 vulnerabilidades.
- Nao ha scripts de teste ou typecheck dedicado.
- `package.json` e lockfile nao foram alterados.

## Fase 1 - Arquitetura base e boundaries locais

Objetivo: criar a organizacao inicial de dominio sem alterar grande parte da UI.

Por que vem depois: depende de baseline verificavel; deve vir antes de conteudo, sessoes e jogos para evitar duplicacao.

Areas afetadas:

- `src/app`
- `src/routes`
- `src/shared`
- `src/features`
- `src/content`
- `src/services`
- `src/storage`

Novos modulos previstos:

- `content/catalog`
- `practice/session`
- `progress`
- `storage/local`
- `auth`
- `analytics`
- `audio`
- `settings`
- `featureFlags`

Persistencia futura aprovada:

- IndexedDB para progresso, sessoes, historico e revisoes.
- `localStorage` somente para preferencias pequenas.
- Acesso sempre por interfaces/repositories.
- Nenhum componente acessara diretamente IndexedDB ou `localStorage`.

Funcionalidades:

- Tipos e contratos internos.
- IDs estaveis.
- Adaptadores mock/local.
- Separacao entre UI, dominio, dados e infraestrutura.

Fora do escopo:

- Banco completo de questoes.
- Login real.
- Sync cloud.
- Analytics real.

Riscos:

- Criar abstracoes grandes demais antes de uso real.
- Quebrar rotas placeholders sem necessidade.

Testes:

- Type checks.
- Testes unitarios basicos para normalizacao de IDs e contratos, quando framework for aprovado.
- Recomendacao futura: Vitest + React Testing Library, ainda nao instalados.

Criterios:

- Estrutura documentada e pequena.
- App continua renderizando.
- Nenhuma dependencia externa obrigatoria para desenvolvimento local.

Decisoes:

- Nome final dos namespaces.
- Framework de testes ainda precisa de aprovacao antes de instalacao.

## Fase 2 - Design system inicial e identidade visual

Objetivo: alinhar a base visual a direcao aprovada antes de construir a home.

Por que vem antes da home: evita construir a home com componentes provisiorios para depois refaze-la durante o design system.

Areas afetadas:

- `src/index.css`
- componentes compartilhados
- assets/logo/favicon
- layout base

Novos modulos:

- `shared/ui`
- `shared/styles`
- possivel `shared/assets`

Funcionalidades:

- Tokens de marca.
- Botao, card, tabs, segmented controls, badges, toolbar simples.
- Layout mobile-first.
- Estados de foco e reduced motion.

Fora do escopo:

- Redesign arbitrario fora da referencia.
- Animacoes complexas.
- Implementacao sem o HTML aprovado quando a fidelidade visual depender dele.

Riscos:

- `reference/home-approved.html` nao existe no workspace atual.
- Falta de logo oficial ou assets finais.
- Excesso de efeitos herdados.

Testes:

- Build/lint.
- Verificacao visual desktop/mobile.
- Checagens de contraste/foco.

Criterios:

- Fundo branco como base.
- Navy/vinho dominantes.
- Logo integrado sem retangulo artificial.
- Componentes acessiveis.

Dependencias:

- HTML aprovado esperado em `reference/home-approved.html`.
- Logo oficial/asset aprovado.

Decisoes:

- Fonte final/licenciamento.
- Logo oficial e variantes.

## Fase 3 - Home guest-first e navegacao principal

Objetivo: substituir o fluxo login-first por home publica com entrada direta em "Bora praticar", jogos, continuar, progresso e configuracoes.

Por que vem depois do design system: corrige o maior conflito de produto usando componentes visuais ja alinhados a referencia aprovada.

Areas afetadas:

- `src/App.tsx`
- `src/routes`
- `src/pages`
- componentes de navegacao/layout
- `src/index.css`

Novos modulos:

- `app/routes`
- `app/layout`
- `features/home`
- `features/navigation`

Funcionalidades:

- Home guest-first.
- Navegacao principal.
- Rotas sem login obrigatorio.
- Login opcional reservado para fase futura.

Fora do escopo:

- Login real.
- Conteudo completo.
- Persistencia robusta.

Riscos:

- Perder placeholders uteis se refatorar agressivamente.
- Desalinhamento com HTML visual aprovado se `reference/home-approved.html` continuar ausente.

Testes:

- Rotas carregam.
- Navegacao basica.
- Acessibilidade de botoes/links.

Criterios:

- Usuario consegue iniciar pratica como visitante.
- Nenhuma tela inicial exige conta.
- Rotas principais existem.

Decisoes:

- Nome publico do app ainda nao decidido; continuar usando `speakup-study` apenas como identificador tecnico provisorio.

## Fase 4 - Taxonomia centralizada

Objetivo: modelar topicos de gramatica, filtros curriculares, dificuldades, categorias de vocabulario e fontes curriculares.

Por que vem antes do conteudo: evita duplicar bancos por livro/unidade.

Areas afetadas:

- `src/content/taxonomy`
- paginas de selecao
- tipos compartilhados

Novos modulos:

- `grammarTopics`
- `vocabularyGroups`
- `curriculumSources`
- `difficulty`

Funcionalidades:

- 20 topicos planejados com IDs.
- Labels curriculares separados de dificuldade.
- Categorias de vocabulario cumulativas.
- Mapeamento temporario para topicos legados.

Fora do escopo:

- 230 questoes por topico.
- Flashcards completos.

Riscos:

- Misturar livro/unidade com UI publica.
- Migrar `Action Verbs` e `Routine Verbs` incorretamente.

Testes:

- Validacao de IDs unicos.
- Validacao de classificacoes.

Criterios:

- UI nao exibe catalogo por livro.
- Cada topico/categoria tem ID estavel.
- Dificuldade e nivel curricular estao separados.

Decisoes:

- Labels finais em portugues/ingles para topicos.
- Ordem e filtros de exibicao.

## Fase 5 - Conteudo versionado e validacao

Objetivo: criar formato de bancos de questoes e vocabulario, com validadores antes de volume.

Por que agora: motores precisam de dados confiaveis, nao arrays em componente.

Areas afetadas:

- `src/content/questions`
- `src/content/vocabulary`
- scripts de validacao
- docs de autoria

Novos modulos:

- schemas de `Question`, `VocabularyEntry`, `Feedback`, `Distractor`
- validadores de duplicidade, opcoes repetidas, IDs e dificuldade
- fixtures pequenas para desenvolvimento

Funcionalidades:

- Banco piloto pequeno e original.
- Feedback pedagogico.
- Metadados de fonte curricular sem expor livro/unidade como organizacao publica.

Fora do escopo:

- Gerar banco completo em massa.
- Copiar exercicios de livro.
- Live generation por IA para usuarios.

Riscos:

- Conteudo artificial/semantico ruim.
- Copyright se migrar frases de material protegido.

Testes:

- Validadores de schema.
- Deteccao de IDs duplicados.
- Deteccao de opcoes duplicadas.
- Amostras por dificuldade.

Criterios:

- Conteudo piloto passa validacao automatica.
- Formato permite revisao humana.

Decisoes:

- Formato final: TS, JSON ou hibrido.
- Processo de revisao pedagogica.

## Fase 6 - Motor de sessoes de pratica

Objetivo: implementar selecao de questoes sem duplicatas e fluxo de sessao.

Por que depois do conteudo: precisa de IDs, dificuldades e banco validado.

Areas afetadas:

- `src/features/practice`
- `src/services/progress`
- `src/pages`

Novos modulos:

- `sessionPlanner`
- `answerEvaluator`
- `reviewQueue`
- `resultSummary`

Funcionalidades:

- Selecionar topico.
- Selecionar dificuldade.
- Selecionar 10/20/30 questoes.
- Responder sessao.
- Resultado.
- Revisar erros.

Fora do escopo:

- Sync cloud.
- Jogos alternativos.
- Banco completo.

Riscos:

- Repeticao indevida em sessoes de 30.
- Misturar progresso de convidado com conta futura.

Testes:

- Sem duplicatas enquanto houver questoes.
- Prioridade: nao vistas, erradas, pontos fracos, vencidas, antigas, dominadas.
- Calculo de resultado.

Criterios:

- Sessao completa funciona localmente.
- Resultado e revisao usam os mesmos IDs.

Decisoes:

- Algoritmo inicial de mastery.
- Politica quando ha menos questoes que a quantidade pedida.

## Fase 7 - Persistencia local e progresso

Objetivo: salvar progresso guest-first sem backend.

Por que vem antes de recomendacoes e jogos completos: todos os modos devem reutilizar progresso.

Areas afetadas:

- `src/storage`
- `src/services/progress`
- telas de progresso/continuar

Novos modulos:

- `ProgressRepository`
- `IndexedDbProgressStore`
- `LocalStoragePreferencesStore`
- `ProgressMigration`

Funcionalidades:

- Sessoes iniciadas/concluidas.
- Historico por questao.
- Mastery inicial.
- Revisoes vencidas.
- Configuracoes basicas.

Fora do escopo:

- Login.
- Merge cloud.
- Dados pessoais sensiveis.

Riscos:

- Schema local dificil de migrar.
- Estado global monolitico.

Testes:

- Persistencia/reload.
- Migracao de schema.
- Falhas de storage.

Criterios:

- Progresso sobrevive refresh.
- App funciona sem conta e sem rede.

Decisoes:

- Retencao/limpeza de dados locais.
- Estrategia de versao/migracao dos schemas IndexedDB.

## Fase 8 - Flashcards e vocabulario

Objetivo: entregar estudo de vocabulario com flashcards e pratica basica.

Por que depois da persistencia: ratings e revisao espacada precisam ser salvos.

Areas afetadas:

- `src/features/vocabulary`
- `src/features/flashcards`
- `src/content/vocabulary`
- audio

Novos modulos:

- `flashcardSession`
- `vocabularyReviewScheduler`
- `pronunciationService`

Funcionalidades:

- Selecionar categoria.
- Estudar flashcards.
- Avaliar "Ainda nao sei", "Dificil", "Ja sei".
- Reutilizar vocabulario em jogos.

Fora do escopo:

- Imagens completas para todo vocabulario.
- Audio gravado profissional.

Riscos:

- Audio via `speechSynthesis` inconsistente entre navegadores.
- Excesso de emojis/imagens sem valor pedagogico.

Testes:

- Agendamento de revisao.
- Persistencia de rating.
- Acessibilidade de flip/card.

Criterios:

- Categoria piloto estudavel.
- Historico salvo.

Decisoes:

- Politica de audio inicial.
- Uso de imagens, emojis ou nenhum asset por categoria.

## Fase 9 - Jogos reutilizando motores compartilhados

Objetivo: migrar/criar jogos sem duplicar conteudo e progresso.

Por que depois de sessao/progresso/conteudo: jogos devem consumir servicos existentes.

Areas afetadas:

- `src/features/games`
- `src/services/audio`
- `src/services/progress`

Novos modulos:

- `gameRegistry`
- `timedChallenge`
- `memoryGame`
- `scrambleGame`
- `trueFalseGame`
- `wordReveal`
- `spellingGame`

Funcionalidades:

- Jogos rapidos acessiveis diretamente.
- Registro de resultado por item/habilidade.
- Feedback e som controlados por configuracao.

Fora do escopo:

- Roleta, ranking promocional, captura de leads, gate de premio.
- Multiplayer.

Riscos:

- Migracao fiel dos jogos e do conteudo antigo esta bloqueada enquanto o legado nao estiver disponivel no workspace.
- Migrar regras antigas acopladas a promocao.
- Duplicar progresso por jogo.

Testes:

- Regras por jogo.
- Nao repetir itens indevidamente.
- Pausa/reinicio/tempo.
- Teclado e reduced motion.

Criterios:

- Cada jogo usa conteudo compartilhado.
- Progresso central recebe eventos padronizados.

Decisoes:

- Ordem de migracao dos jogos.
- Nome final de cada modo.
- Fonte de legado/banco antigo a ser fornecida antes de migracao fiel.

## Fase 10 - Recomendacoes, progressao e engajamento

Objetivo: transformar historico local em proxima acao util.

Por que depois de progresso e sessoes: precisa de dados reais.

Areas afetadas:

- `src/features/progress`
- `src/features/recommendations`
- home/hub

Novos modulos:

- `recommendationEngine`
- `streakService`
- `dailyGoalService`
- `achievementService`

Funcionalidades:

- Continuar estudando.
- Revisoes vencidas.
- Pontos fracos.
- Meta diaria configuravel.
- Streak respeitoso.

Fora do escopo:

- Notificacoes push.
- Percentuais de fluencia enganosos.
- Urgencia falsa.

Riscos:

- Gamificacao manipulative.
- Recomendacoes opacas.

Testes:

- Priorizacao de recomendacoes.
- Streak baseado em atividade de aprendizagem.
- Estado vazio.

Criterios:

- Home sugere proxima acao com base em dados locais.
- Usuario pode continuar sessao/tema.

Decisoes:

- Copy final de engajamento.
- Tipos de conquistas permitidas.

## Fase 11 - Configuracoes, acessibilidade e privacidade local

Objetivo: dar controle ao usuario e elevar qualidade de uso.

Por que antes de cloud: preferencias devem existir localmente e migrar depois.

Areas afetadas:

- `src/features/settings`
- `src/services/audio`
- `src/services/analytics`
- componentes UI

Novos modulos:

- `SettingsRepository`
- `PrivacyPreferences`
- `AccessibilityPreferences`

Funcionalidades:

- Som ligado/desligado.
- Movimento reduzido respeitado.
- Meta diaria.
- Reset/export local, se aprovado.
- Preferencias de analytics futuras desabilitadas por padrao local.

Fora do escopo:

- Politica juridica final.
- Cloud export.

Riscos:

- Reset de progresso e uma acao destrutiva e precisa de confirmacao de produto/UX.

Testes:

- Focus states.
- Navegacao por teclado.
- Preferencias persistidas.

Criterios:

- Fluxos principais usaveis sem mouse.
- Configuracoes persistem localmente.

Decisoes:

- Texto de privacidade.
- Permitir export/reset nesta fase.

## Fase 12 - Autenticacao opcional

Objetivo: adicionar login como melhoria opcional para salvar/sincronizar progresso, nao como barreira.

Por que tarde: o app deve ser util como convidado antes de pedir conta.

Areas afetadas:

- `src/services/auth`
- `src/services/sync`
- `src/features/account`
- telas de prompt pos-atividade

Novos modulos:

- `AuthProvider`
- `GuestIdentity`
- `AccountIdentity`
- `LoginPrompt`

Funcionalidades:

- Prompt opcional para salvar progresso.
- Sign-in provider escolhido.
- Conta representa usuario do app, nao aluno ERP.

Fora do escopo:

- Verificacao contra ERP.
- Turmas/professores/matricula.

Riscos:

- Introduzir dependencia externa prematura.
- Perder progresso guest no login.

Testes:

- Uso sem login.
- Login nao bloqueia.
- Merge local -> conta.

Criterios:

- Usuario consegue ignorar login.
- Nenhum fluxo principal depende de conta.

Decisoes:

- Provedor de auth.
- Credenciais e configuracao de ambiente.

## Fase 13 - Sincronizacao backend

Objetivo: sincronizar progresso entre dispositivos.

Por que depois de auth: precisa de identidade opcional e modelo local maduro.

Areas afetadas:

- `src/services/sync`
- backend/adapters
- schemas de progresso

Novos modulos:

- `SyncRepository`
- `ConflictResolver`
- `RemoteProgressAdapter`

Funcionalidades:

- Upload/download de progresso.
- Resolucao de conflitos.
- Migracao de dados locais.

Fora do escopo:

- ERP.
- Dados escolares.

Riscos:

- Conflitos de progresso.
- Custos e privacidade.

Testes:

- Merge deterministico.
- Offline/online.
- Falhas parciais.

Criterios:

- Progresso sincroniza sem bloquear uso local.

Decisoes:

- Backend escolhido.
- Politica de retencao e privacidade.

## Fase 14 - Analytics desacoplado

Objetivo: medir uso do produto sem misturar com tracking pedagogico.

Por que depois da navegacao e core: eventos devem refletir fluxos estaveis.

Areas afetadas:

- `src/services/analytics`
- configuracao/env
- docs de privacidade

Novos modulos:

- `AnalyticsPort`
- `NoopAnalyticsAdapter`
- `ConfiguredAnalyticsAdapter`

Funcionalidades:

- Eventos agregados de app/pratica/jogos.
- Adapter noop local.
- Sem PII.

Fora do escopo:

- Raw learner content.
- Dados sensiveis.

Riscos:

- Acoplamento em telas.
- Coleta excessiva.

Testes:

- Eventos emitidos via porta.
- Noop em dev/local.
- Consent/config.

Criterios:

- Analytics pode ser desligado por configuracao.
- Eventos documentados.

Decisoes:

- Ferramenta de analytics.
- Consentimento/legal.

## Fase 15 - PWA e offline

Objetivo: preparar uso offline/local-first.

Por que depois de storage e core: cache precisa saber o que preservar.

Areas afetadas:

- `public`
- Vite config
- service worker
- storage

Novos modulos:

- `offlineCache`
- `updatePrompt`

Funcionalidades:

- Manifest.
- Service worker.
- Cache de shell e conteudo essencial.
- Estrategia de atualizacao.

Fora do escopo:

- Publicacao em loja.

Riscos:

- Cache servir conteudo antigo.
- Bugs offline dificeis de reproduzir.

Testes:

- Instalação PWA.
- Offline reload.
- Atualizacao de SW.

Criterios:

- App abre offline apos primeiro acesso.
- Conteudo piloto disponivel offline.

Decisoes:

- Escopo de cache.
- Nome e icones finais.

## Fase 16 - Monetizacao

Objetivo: desenhar Premium/ads sem prejudicar aprendizagem.

Por que tarde: depende de produto validado e decisoes de negocio.

Areas afetadas:

- `features/billing`
- `features/ads`
- configuracao
- UI de conta

Novos modulos:

- `EntitlementService`
- `AdsAdapter`
- `BillingAdapter`

Funcionalidades:

- A definir apos aprovacao.

Fora do escopo:

- Ads durante questao, explicacao, flashcard ativo ou jogo em andamento.
- Billing sem aprovacao.

Riscos:

- Experiencia de aprendizagem piorar.
- Custos/privacidade/legal.

Testes:

- Entitlements.
- Bloqueios de exibicao de ads em momentos proibidos.

Criterios:

- Politica clara e aprovada.

Decisoes:

- Modelo Premium.
- Precos.
- Rede de ads.
- Provedor de pagamentos.

## Fase 17 - Preparacao para publicacao

Objetivo: preparar release, hosting e checklist final.

Por que por ultimo: deploy/publicacao sao proibidos sem aprovacao expressa.

Areas afetadas:

- Docs
- CI/CD
- hosting config, se aprovado
- privacy/legal

Novos modulos:

- Nenhum obrigatorio.

Funcionalidades:

- Build de producao.
- Checklist de acessibilidade/performance.
- Documentacao de deploy, sem executar deploy.

Fora do escopo:

- Deploy, push, PR, tags ou releases sem aprovacao explicita.

Riscos:

- Configuracao externa/billing.
- Publicar versao incompleta.

Testes:

- Lint.
- Typecheck.
- Build.
- Testes unitarios/E2E.
- Auditoria PWA/performance.

Criterios:

- Checklist aprovado.
- Ambiente configurado com credenciais seguras.

Decisoes:

- Plataforma de hosting.
- Dominio.
- Politicas legais.
- Autorizacao explicita para deploy.

## Arquitetura proposta de diretorios

Proposta inicial, ainda nao implementada:

```text
src/
  app/
    App.tsx
    router.tsx
    layout/
  shared/
    ui/
    styles/
    assets/
    utils/
  content/
    taxonomy/
    questions/
    vocabulary/
    validation/
  features/
    home/
    practice/
    grammar/
    vocabulary/
    flashcards/
    games/
    progress/
    settings/
    account/
  services/
    content/
    sessions/
    progress/
    storage/
    auth/
    sync/
    analytics/
    audio/
    featureFlags/
  test/
    fixtures/
    helpers/
```

## Interfaces previstas

Conteudo:

- `ContentCatalog`: lista topicos, categorias, questoes e vocabulario por IDs estaveis.
- `ContentValidator`: valida schema, duplicidades e qualidade estrutural.

Sessoes:

- `SessionPlanner`: escolhe itens conforme prioridade pedagogica.
- `SessionRepository`: salva sessoes iniciadas/concluidas.
- `AnswerEvaluator`: avalia resposta e gera feedback.

Progresso:

- `ProgressRepository`: le/escreve historico por item.
- `MasteryService`: calcula dominio e pontos fracos.
- `ReviewScheduler`: calcula revisoes vencidas.

Armazenamento:

- `StorageAdapter`: porta generica local/remota.
- `IndexedDbProgressStore`: adapter local-first para progresso, sessoes, historico e revisoes.
- `LocalStoragePreferencesStore`: adapter restrito a preferencias pequenas.

Autenticacao:

- `AuthService`: status guest/account.
- `IdentityProvider`: provider futuro sem acoplar UI.

Sincronizacao:

- `SyncService`: orquestra merge local/remoto.
- `ConflictResolver`: resolve progresso divergente.

Analytics:

- `AnalyticsPort`: eventos agregados.
- `NoopAnalytics`: default local.

Audio:

- `AudioService`: efeitos, fala, mute e preferencias.
- `PronunciationService`: interface para `speechSynthesis` ou assets futuros.

Configuracoes:

- `SettingsRepository`: preferencias persistidas.
- `AccessibilitySettings`: reduced motion, audio, fonte se aprovado.

Feature flags:

- `FeatureFlagService`: flags locais/configuraveis sem servico externo obrigatorio.
