# Revamp Roadmap

Atualizado em: 2026-07-24

## Estado Definitivo

A transformação para **Inglês em Jogo** foi aprovada visualmente. O Product Vision em `reference/ingles-em-jogo-product-vision.html` deixou de ser apenas inspiração e passou a ser a especificação visual canônica do produto.

O revamp anterior não é mais o estado final. A direção atual usa shell navy, sidebar desktop, rail tablet, topbar, Home com missão/meta/liga, biblioteca, progresso com engajamento, perfil local e jogos bloqueados com catálogo renovado.

## Entregue

- Nova identidade pública: Inglês em Jogo, com Speak UP! como marca complementar.
- Package name `ingles-em-jogo`.
- Shell responsivo com sidebar desktop, rail tablet e navegação inferior mobile.
- Home game-like com caminho de aprendizagem, missão diária, meta semanal e Liga Safira local.
- Estudar como biblioteca de Gramática, Vocabulário e revisão de erros.
- Progresso com atividade semanal e conquistas.
- Perfil local editável.
- IndexedDB versão 2 com progresso e engajamento local.
- Smoke atualizado para nove viewports.

## Jogos

Os nove jogos do catálogo oficial estão funcionais, usando uma fundação compartilhada (catálogo, matriz de compatibilidade, adapters, engine de sessão, XP/missão/streak idempotentes) sobre `present_tobe` + `body`:

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

## Limites Mantidos

- Sem login obrigatório.
- Sem backend.
- Sem sincronização.
- Sem deploy nesta fase.
- Sem PR, tag ou release.
- Outros tópicos gramaticais e categorias de vocabulário ainda em desenvolvimento (jogos já preparados para recebê-los via `ROLLOUT_CONTENT`).

## Validação Esperada

- `node scripts/validateContent.mjs`
- `npx tsc -b`
- `npm run lint`
- `npm run build`
- `node scripts/smokeUi.mjs`

O smoke deve cobrir 360x800, 390x844, 412x915, 768x1024, 1000x800, 1024x768, 1366x768, 1440x900 e 1920x1080, com `browserErrors: 0`.
