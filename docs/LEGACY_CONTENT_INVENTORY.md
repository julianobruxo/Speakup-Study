# Legacy Content Inventory

Atualizado em: 2026-07-22

Fonte analisada: `reference/speakup-english-challenge.html`.

Este documento registra o conteudo legado encontrado sem migrar os 600 exercicios gramaticais para `src/`.

## Resumo

- Topicos em `TOPIC_BANK`: 10.
- Dificuldades legadas: `facil`, `medio`, `dificil`.
- Questoes por topico/dificuldade: 20.
- Total de questoes em `TOPIC_BANK`: 600.
- Tamanhos de sessao: 10, 20 ou 30 perguntas.
- Categorias de vocabulario em `WORDS`: 6.
- Itens por categoria em `WORDS`: 10.
- Total de pares explicitos em `WORDS`: 60.
- Seeds adicionais normalizados nesta fase: 10 Action Verbs e 10 Routine Verbs.
- Jogos registrados em `GAME_META`: 7.
- Banco `TF_BANK`: 20 itens.
- Banco `WORD_BANK`: 3 niveis com 30 palavras cada, 90 pares totais.

## Topicos TOPIC_BANK

| ID legado | Label visivel | facil | medio | dificil | Total | Classificacao MVP |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| `present_tobe` | Verbo TO BE (presente) | 20 | 20 | 20 | 60 | Grammar ativo |
| `past_tobe` | Verbo TO BE (passado) | 20 | 20 | 20 | 60 | Grammar ativo |
| `simple_present` | Simple Present | 20 | 20 | 20 | 60 | Grammar ativo |
| `present_continuous` | Present Continuous | 20 | 20 | 20 | 60 | Grammar ativo |
| `be_going_to` | Be Going To (futuro) | 20 | 20 | 20 | 60 | Grammar ativo |
| `simple_past` | Simple Past | 20 | 20 | 20 | 60 | Grammar ativo |
| `there_tobe` | There Is / There Are | 20 | 20 | 20 | 60 | Grammar ativo |
| `prepositions` | In / On / At (tempo e espaco) | 20 | 20 | 20 | 60 | Grammar ativo |
| `action_verbs` | Action Verbs | 20 | 20 | 20 | 60 | Reclassificar como vocabulario |
| `routine_verbs` | Routine Verbs | 20 | 20 | 20 | 60 | Reclassificar como vocabulario |

## Formato das perguntas

Cada item de `TOPIC_BANK` usa o formato:

```ts
{
  q: "Prompt com lacuna",
  opts: ["resposta correta", "distrator", "distrator"],
  fb: "feedback pedagogico"
}
```

Regras observadas:

- A resposta correta fica na posicao `opts[0]` no banco bruto.
- Ao iniciar uma rodada, o legado cria `a: 0` e preserva o texto correto.
- Na renderizacao, as opcoes sao embaralhadas com `shuffle(q.opts.map(...))`.
- O feedback esta em `fb`.
- `buildQuizRound(topicKey, diffKey, qty)` embaralha o banco do topico/dificuldade e corta a quantidade pedida.
- Se a quantidade pedida for maior que o pool, o legado completa com outra rodada embaralhada; no conteudo atual isso nao ocorre porque cada pool tem 20 itens e as sessoes maximas sao 30, entao uma sessao de 30 repete itens daquele topico/dificuldade.

## Mapeamento dos 8 topicos ativos do MVP

| MVP ID | Origem legada | Observacao |
| --- | --- | --- |
| `present_tobe` | `TOPIC_BANK.present_tobe` | Ativo como gramatica |
| `past_tobe` | `TOPIC_BANK.past_tobe` | Ativo como gramatica |
| `simple_present` | `TOPIC_BANK.simple_present` | Ativo como gramatica |
| `present_continuous` | `TOPIC_BANK.present_continuous` | Ativo como gramatica |
| `be_going_to` | `TOPIC_BANK.be_going_to` | Ativo como gramatica |
| `simple_past` | `TOPIC_BANK.simple_past` | Ativo como gramatica |
| `there_tobe` | `TOPIC_BANK.there_tobe` | Ativo como gramatica |
| `prepositions` | `TOPIC_BANK.prepositions` | Ativo como gramatica |

Os topicos `action_verbs` e `routine_verbs` aparecem no legado dentro de `TOPIC_BANK`, mas devem ser tratados como vocabulario no novo MVP.

## Action Verbs e Routine Verbs

O legado nao fornece pares explicitos ingles-portugues para `action_verbs` ou `routine_verbs`. Ele fornece perguntas de lacuna com opcoes e feedback.

Inventario estrutural:

- `action_verbs`: 60 perguntas, 60 respostas corretas, 60 respostas corretas unicas.
- `routine_verbs`: 60 perguntas, 60 respostas corretas, 50 respostas corretas unicas.

Decisao posterior: o usuario autorizou criar 10 entradas simples para cada categoria usando verbos/expressoes presentes no legado. Foram evitadas expressoes mais avancadas ou idiomaticas como `wind down`, `catch up on`, `grab a bite` e `run errands`.

Action Verbs normalizados:

- `action_walk`: walk / andar
- `action_jump`: jump / pular
- `action_swim`: swim / nadar
- `action_catch`: catch / pegar
- `action_throw`: throw / arremessar
- `action_kick`: kick / chutar
- `action_push`: push / empurrar
- `action_pull`: pull / puxar
- `action_open`: open / abrir
- `action_close`: close / fechar

Routine Verbs normalizados:

- `routine_wake_up`: wake up / acordar
- `routine_get_up`: get up / levantar
- `routine_take_a_shower`: take a shower / tomar banho
- `routine_brush_your_teeth`: brush your teeth / escovar os dentes
- `routine_have_breakfast`: have breakfast / tomar cafe da manha
- `routine_go_to_school`: go to school / ir para a escola
- `routine_have_lunch`: have lunch / almocar
- `routine_do_homework`: do homework / fazer o dever
- `routine_watch_tv`: watch TV / assistir TV
- `routine_go_to_bed`: go to bed / ir para a cama

## Inventario de trabalho - present_tobe

As 60 questoes legadas de `TOPIC_BANK.present_tobe` foram avaliadas antes da criacao do banco piloto.

Resumo:

- 20 `facil` avaliadas.
- 20 `medio` avaliadas.
- 20 `dificil` avaliadas.
- 51 questoes reaproveitadas sem alteracao textual relevante na criacao inicial do banco piloto.
- 0 questoes corrigidas com pequena alteracao.
- 9 questoes descartadas.
- 12 questoes de `dificil` reclassificadas como `medium`.
- 79 questoes novas criadas manualmente na criacao inicial do banco piloto.

Classificacao:

- `facil` 1-20: aproveitadas como `easy`.
- `medio` 1-12 e 14-20: aproveitadas como `medium`.
- `medio` 13: descartada porque testa diretamente `There is / There are`.
- `dificil` 1, 2, 3, 5, 7, 9, 10, 14, 15, 16, 18 e 20: reclassificadas como `medium`.
- `dificil` 4: descartada por usar estrutura de Present Continuous como contexto central.
- `dificil` 6: descartada por envolver `be going to`.
- `dificil` 8: descartada por usar Present Continuous como alvo forte.
- `dificil` 11 e 13: descartadas por dependerem de escolha de variante ou leitura de coletivo que pode gerar ambiguidade.
- `dificil` 12: descartada por complexidade alta para o piloto.
- `dificil` 17: descartada por regra excepcional pouco proporcional ao MVP inicial.
- `dificil` 19: descartada por item abstrato/avancado demais para o piloto.

Banco final:

- `src/content/data/presentTobeQuestions.ts`.
- 50 questoes `easy`.
- 80 questoes `medium`.
- 130 questoes unicas.
- Nenhuma questao `challenge`.
- Nenhum outro topico gramatical migrado.

Auditoria posterior em 2026-07-23:

- 4 questoes foram substituidas apos o commit do banco piloto.
- 1 problema obrigatorio foi corrigido por ambiguidade de coletivo em `present_tobe_medium_040`.
- 3 melhorias foram corrigidas para reduzir repeticao simples e incluir respostas curtas.
- A contagem final continua 130 questoes: 50 `easy` e 80 `medium`.
- Considerando a substituicao posterior, o banco final fica com 50 questoes legadas reaproveitadas e 80 questoes novas/substituidas.

## Vocabulario WORDS

Os 60 pares explicitos abaixo foram normalizados em `src/content/data/vocabulary.ts`.

| Categoria | ID futuro | Termo | Traducao |
| --- | --- | --- | --- |
| Corpo | `body_head` | Head | Cabeça |
| Corpo | `body_hand` | Hand | Mão |
| Corpo | `body_foot` | Foot | Pé |
| Corpo | `body_eye` | Eye | Olho |
| Corpo | `body_ear` | Ear | Orelha |
| Corpo | `body_arm` | Arm | Braço |
| Corpo | `body_leg` | Leg | Perna |
| Corpo | `body_nose` | Nose | Nariz |
| Corpo | `body_mouth` | Mouth | Boca |
| Corpo | `body_finger` | Finger | Dedo |
| Roupas | `clothes_shirt` | Shirt | Camisa |
| Roupas | `clothes_pants` | Pants | Calça |
| Roupas | `clothes_shoes` | Shoes | Sapatos |
| Roupas | `clothes_hat` | Hat | Chapéu |
| Roupas | `clothes_jacket` | Jacket | Jaqueta |
| Roupas | `clothes_dress` | Dress | Vestido |
| Roupas | `clothes_socks` | Socks | Meias |
| Roupas | `clothes_belt` | Belt | Cinto |
| Roupas | `clothes_skirt` | Skirt | Saia |
| Roupas | `clothes_scarf` | Scarf | Cachecol |
| Moveis | `furniture_chair` | Chair | Cadeira |
| Moveis | `furniture_table` | Table | Mesa |
| Moveis | `furniture_bed` | Bed | Cama |
| Moveis | `furniture_sofa` | Sofa | Sofá |
| Moveis | `furniture_shelf` | Shelf | Prateleira |
| Moveis | `furniture_lamp` | Lamp | Luminária |
| Moveis | `furniture_mirror` | Mirror | Espelho |
| Moveis | `furniture_closet` | Closet | Armário |
| Moveis | `furniture_desk` | Desk | Escrivaninha |
| Moveis | `furniture_drawer` | Drawer | Gaveta |
| Animais | `animals_dog` | Dog | Cachorro |
| Animais | `animals_cat` | Cat | Gato |
| Animais | `animals_bird` | Bird | Pássaro |
| Animais | `animals_fish` | Fish | Peixe |
| Animais | `animals_horse` | Horse | Cavalo |
| Animais | `animals_cow` | Cow | Vaca |
| Animais | `animals_pig` | Pig | Porco |
| Animais | `animals_sheep` | Sheep | Ovelha |
| Animais | `animals_lion` | Lion | Leão |
| Animais | `animals_elephant` | Elephant | Elefante |
| Profissoes | `jobs_teacher` | Teacher | Professor |
| Profissoes | `jobs_doctor` | Doctor | Médico |
| Profissoes | `jobs_engineer` | Engineer | Engenheiro |
| Profissoes | `jobs_nurse` | Nurse | Enfermeiro |
| Profissoes | `jobs_lawyer` | Lawyer | Advogado |
| Profissoes | `jobs_chef` | Chef | Cozinheiro |
| Profissoes | `jobs_police_officer` | Police Officer | Policial |
| Profissoes | `jobs_firefighter` | Firefighter | Bombeiro |
| Profissoes | `jobs_farmer` | Farmer | Fazendeiro |
| Profissoes | `jobs_dentist` | Dentist | Dentista |
| Lugares | `places_school` | School | Escola |
| Lugares | `places_hospital` | Hospital | Hospital |
| Lugares | `places_bank` | Bank | Banco |
| Lugares | `places_park` | Park | Parque |
| Lugares | `places_store` | Store | Loja |
| Lugares | `places_restaurant` | Restaurant | Restaurante |
| Lugares | `places_library` | Library | Biblioteca |
| Lugares | `places_church` | Church | Igreja |
| Lugares | `places_airport` | Airport | Aeroporto |
| Lugares | `places_pharmacy` | Pharmacy | Farmácia |

Validacao estrutural desejada:

- 6 categorias.
- 10 entradas por categoria.
- 60 entradas totais.
- IDs unicos.
- Nenhum termo/traducao vazio.
- Nenhum termo duplicado dentro da mesma categoria.
- Nenhuma traducao inventada fora dos pares explicitos do legado.

## Outros bancos

`WORD_BANK`:

- Nivel `1`: 30 pares.
- Nivel `2`: 30 pares.
- Nivel `3`: 30 pares.
- Usado por Revelacao e Soletrando.
- Nao migrado nesta fase.

`TF_BANK`:

- 20 afirmacoes verdadeiro/falso.
- Usado por Verdadeiro ou Falso.
- Nao migrado nesta fase.

Jogos em `GAME_META`:

- `quiz`: English Challenge.
- `speed`: Beat the Clock.
- `memory`: Jogo da Memoria.
- `scramble`: Palavras Embaralhadas.
- `truefalse`: Verdadeiro ou Falso.
- `reveal`: Revelacao.
- `spell`: Soletrando.

## Mecanicas descartadas do novo MVP

Estas partes existem no legado, mas nao devem ser migradas para o novo MVP:

- Multitec.
- Captura de leads.
- Ranking promocional.
- Roleta.
- Premios.
- Exportacao CSV.
- Gate de 75%.

## Estado da normalizacao

Migrado para `src/content/data/vocabulary.ts`:

- Corpo, Roupas, Moveis, Animais, Profissoes e Lugares.
- 10 Action Verbs.
- 10 Routine Verbs.

Migrado para `src/content/data/irregularVerbs.ts`:

- 50 Irregular Verbs.
- 7 modos de pratica hyphenated.

Bloqueado por decisao/curadoria:

- Expansao completa de Action Verbs.
- Expansao completa de Routine Verbs.
- Outros topicos gramaticais alem de `present_tobe`.
- WORD_BANK.
- TF_BANK.
- Jogos.
