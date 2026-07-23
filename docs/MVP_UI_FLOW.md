# MVP UI Flow

Atualizado em: 2026-07-23

## Fonte de verdade

- `reference/home-approved.html`: identidade visual, home, cards, navegacao inferior e bottom sheet.
- `reference/speakup-english-challenge.html`: ordem das escolhas, ritmo do quiz, feedback, progresso e resultado.

## Fluxo principal

```text
Home
-> Bora praticar
-> Gramática
-> Verbo TO BE - presente
-> Fácil ou Médio
-> 10, 20 ou 30 questões
-> Sessão
-> Acerto automático em 3s ou erro com avanço manual
-> Resultado
-> Jogar novamente, trocar configuração ou voltar à home
```

## Áreas principais e navegação

```text
Home
|-- Bora praticar -> bottom sheet/dialog -> Gramática ou Vocabulário
|-- Progresso local -> configuração de Present TO BE
|-- 3 Jogos rápidos -> Jogos com os 6 itens (Em breve)
|-- Início
|-- Estudar -> seleção de Gramática ou Vocabulário
|-- Progresso -> estado vazio inicial ou métricas locais reais
`-- Perfil -> preferências locais
```

## Conteúdo disponível

- Jogável: `present_tobe`, dificuldades `easy` e `medium`, sessões de 10, 20 ou 30 questões.
- Bloqueado com feedback `Em breve`: outros sete tópicos gramaticais, todos os jogos e prática de vocabulário.
- Vocabulário: categorias e amostras podem ser consultadas, sem flashcards ou prática funcional.

## Navegação e saída

- Toda tela interna possui ação de voltar no topo.
- Início, Estudar, Progresso e Perfil usam navegação inferior em mobile/tablet e horizontal no desktop.
- Tópicos, vocabulário interno, jogos, configuração, sessão, feedback e resultado removem a navegação global para preservar foco.
- O conteúdo mobile rola em uma região separada da navegação, sem cards ou textos cobertos.
- Sair de uma sessão iniciada exige confirmação; respostas confirmadas ficam salvas, mas a rodada abandonada não entra no histórico de sessões.
- Rotas legadas são redirecionadas para uma tela final equivalente, sem placeholders.

## Rotas implementadas

| Rota | Função |
| --- | --- |
| `/` | Home guest-first |
| `/praticar` | Escolha de área |
| `/gramatica` | Tópicos do MVP |
| `/gramatica/present_tobe` | Dificuldade e quantidade |
| `/praticar/present_tobe/sessao` | Questões, feedback e resultado |
| `/vocabulario` | Categorias |
| `/vocabulario/:categoryId` | Prévia da categoria |
| `/jogos` | Jogos bloqueados |
| `/progresso` | Estado vazio inicial ou progresso real |
| `/perfil` | Visitante e som |

## Componentes e comportamento

- `AppShell`: shell adaptativo; mobile com regiões reais de header/conteúdo/navegação e desktop com largura útil de até 1200 px.
- `PageHeader`: voltar consistente em toda tela interna.
- `GlobalNavigation`: Início, Estudar, Progresso e Perfil com `aria-current`, em barra inferior ou cabeçalho horizontal.
- `AppDialog`: bottom sheet no mobile, dialog central no desktop, overlay leve, foco nativo e Escape.
- `LockedCard`: aparência final, cadeado, `aria-disabled` e feedback "Em breve".
- `selectPracticeQuestions`: filtra por dificuldade, seleciona sem repetição e prioriza inéditas, último erro e as vistas há mais tempo.
- `shuffleOptions`: muda a posição visual das alternativas sem alterar `correctAnswer`.
- `localProgress`: salva respostas e sessões concluídas em IndexedDB nativo.
- `practicePreferences`: salva somente a última configuração em `localStorage`.

## Métricas e persistência

- `Questões praticadas`: IDs únicos com ao menos uma resposta confirmada.
- `Precisão`: acertos acumulados divididos por todas as respostas confirmadas, inclusive repetições.
- `Para revisar`: questões cujo resultado mais recente foi incorreto.
- `Melhor resultado` e `melhor sequência`: recordes de sessões concluídas.
- O resultado mostra quantas das 130 questões únicas já foram praticadas.
- O progresso sobrevive a reload no mesmo navegador/dispositivo e não possui sync.
- Falha de IndexedDB gera aviso discreto e não bloqueia a rodada.

## Resposta e feedback

### Acerto

- Confirmar bloqueia todas as alternativas e identifica a correta.
- O feedback mostra somente `Correto!` e uma barra verde integrada.
- A barra preenche linearmente em 3 segundos, inclusive com reduced motion.
- Clique, toque, Enter e Espaço não antecipam a espera.
- A próxima questão ou o resultado abre automaticamente uma única vez.

### Erro

- A alternativa escolhida e a correta permanecem destacadas.
- O feedback pedagógico armazenado aparece somente no erro.
- Não existe timer ou avanço automático.
- O aluno avança por `Continuar` ou por clique/toque no card da explicação.
- `Estudar esse tópico` abre o guia sem propagar o clique para o card.

### Guia Present TO BE

- Abre pelo erro atual com sujeito aparente, resposta correta, escolha incorreta, regra relacionada e exemplos diferentes.
- Inclui am/is/are, afirmativas, negativas, perguntas, respostas curtas, contrações, concordância e erros comuns.
- Mobile usa painel alto com cabeçalho e rodapé fixos; desktop usa dialog central amplo em duas colunas.
- X, Escape, overlay e `Voltar ao jogo` fecham o dialog e restauram foco ao gatilho.
- Questão, resposta, score, sequência e posição são preservados.

## Smoke test

Executado com `node scripts/smokeUi.mjs`, sem dependências adicionais:

- viewports 360x800, 390x844, 768x1024, 1366x768 e 1440x900;
- ausência de overflow horizontal;
- navegação adaptativa, largura desktop, safe area e ausência de sobreposição;
- ausência de navegação global em configuração, sessão, resultado e dialogs;
- rotas principais e reload;
- bottom sheet, bottom navigation e voltar;
- tópico bloqueado;
- `easy`, `medium`, 10, 20 e 30 questões;
- rodada completa com 30 enunciados únicos;
- acerto com barra, espera de 3 segundos, bloqueio de atalhos e avanço automático único;
- erro sem timer, avanço por botão/card e última questão manual;
- guia contextual/completo, fechamento por X/Escape/botão e retorno de foco;
- feedback, saída e confirmação;
- resultado, replay e retorno;
- persistência após reload, contagem única, revisão e prioridade da próxima sessão;
- modal de estudo sem gravação duplicada e falha simulada de IndexedDB sem bloqueio;
- três jogos na Home e seis em `/jogos`;
- toggle de som;
- zero erro de browser.
