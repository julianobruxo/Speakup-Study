# Decisoes Abertas

Atualizado em: 2026-07-22

## Resolvidas nesta Fase 0

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

## Necessarias antes de comecar implementacao visual/home

1. Primeiro baseline Git

   O repositorio local existe, mas ainda nao ha commits. Precisam de autorizacao separada: corrigir `.gitignore`, executar `git add` e criar o primeiro commit local.

2. Referencia visual aprovada

   Esperada em `reference/home-approved.html`, mas o arquivo nao existe no workspace atual. Definir onde esta esse HTML ou anexar a versao aprovada.

3. Logo e assets oficiais

   O app usa placeholder "SU" e assets derivados do Vite. Precisamos dos arquivos oficiais de logo/favicon ou aprovacao para criar assets temporarios.

## Necessarias antes de migrar jogos/conteudo

1. Legado dos jogos e banco antigo

   O workspace atual nao contem HTML legado completo, `topics_bank.json`, banco de questoes ou implementacao real dos jogos. A migracao fiel esta bloqueada ate essa fonte ser fornecida.

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
- Antes do primeiro commit, complementar `.gitignore` com `.env`, `.env.*`, `!.env.example`, `Thumbs.db` e `coverage/`.
- Autorizar explicitamente quais assets derivados do Vite/prototipo entram no baseline inicial.
- Proxima fase recomendada: arquitetura base e boundaries locais, sem UI nova, porque o HTML visual aprovado e o legado ainda nao estao disponiveis.
- Antes de construir home, criar design system alinhado a referencia para evitar home provisoria que precise ser refeita.
- Corrigir o conflito guest-first antes de implementar login real.
- Centralizar taxonomia e conteudo antes de migrar jogos.
- Criar validadores de conteudo antes de aumentar o banco de questoes.
- Manter adapters noop/local para auth, sync, analytics e feature flags ate credenciais serem aprovadas.
