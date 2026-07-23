# Present TO BE Audit

Atualizado em: 2026-07-23

## Objetivo

Auditoria independente das 130 questoes do banco `present_tobe` para verificar se ele pode servir como padrao antes da migracao de `past_tobe`.

Fonte auditada: `src/content/data/presentTobeQuestions.ts`.

Referencia consultada: banco `TOPIC_BANK.present_tobe` em `reference/speakup-english-challenge.html`.

## Resultado estrutural

- Total: 130 questoes.
- `easy`: 50 questoes.
- `medium`: 80 questoes.
- IDs unicos: sim.
- Perguntas unicas pela normalizacao atual: sim.
- Tres alternativas por questao: sim.
- Alternativas unicas por questao: sim.
- Resposta correta presente nas alternativas: sim.
- Feedback preenchido: sim.
- `topicId`: sempre `present_tobe`.
- Dificuldades usadas: somente `easy` e `medium`.
- Referencias a Multitec/mecanicas promocionais: nenhuma.
- Campos vazios: nenhum.
- Construcoes quebradas detectadas: nenhuma.

## Achados

Obrigatorio corrigir:

- `present_tobe_medium_040`: usava `The team ___ ready...`; o substantivo coletivo podia aceitar leitura diferente entre ingles americano e britanico. Foi substituida por uma pergunta de resposta curta com sujeito plural claro.

Melhorias recomendadas encontradas:

- Respostas curtas estavam ausentes do banco. Foram adicionadas 4 questoes de resposta curta por substituicoes localizadas.
- `present_tobe_easy_039` e `present_tobe_easy_040`: par muito simples e proximo (`door/doors open`). Foram substituidas por respostas curtas sem afetar dificuldade.
- `present_tobe_medium_020`: `Neither of my parents ___...` podia gerar discussao de uso formal/informal. Foi substituida por resposta curta negativa clara.

Aceitavel:

- Repeticoes de `am/is/are`, concordancia singular/plural e perguntas diretas sao pedagogicas para o primeiro banco.
- Itens com `homework`, `information`, `scissors`, `glasses`, `people`, medidas e sujeitos com `of` permanecem adequados ao nivel `medium`.

## Correcoes aplicadas

- Questoes corrigidas: 4.
- Questoes substituidas: 4.
- Questoes mantidas: 126.
- Problemas obrigatorios corrigidos: 1.
- Melhorias corrigidas: 3.
- Nenhuma questao `challenge` foi criada.
- Nenhum outro topico foi migrado.

IDs alterados:

- `present_tobe_easy_039`
- `present_tobe_easy_040`
- `present_tobe_medium_020`
- `present_tobe_medium_040`

## Distribuicao de habilidades

Contagens aproximadas apos correcoes, com uma questao podendo pertencer a mais de uma categoria:

- Afirmativa: 92.
- Negativa: 13.
- Pergunta: 23.
- Resposta curta: 4.
- Contracao: 10.
- Ordem de palavras: 46.
- Concordancia com pronome: 18.
- Concordancia com substantivo singular: 56.
- Concordancia com substantivo plural: 58.
- Sujeito composto: 11.

A distribuicao e adequada para o piloto. `easy` continua focado em reconhecimento direto de `am/is/are`; `medium` amplia contraste de sujeito, nucleo do sujeito, incontaveis, perguntas, negativas, ordem de palavras e respostas curtas.

## Ambiguidade e duplicacao

- Ambiguidades obrigatorias encontradas: 1.
- Ambiguidades restantes bloqueantes: 0.
- Duplicatas exatas: 0.
- Duplicatas pela normalizacao atual: 0.
- Duplicatas reais bloqueantes: 0.
- Repeticoes pedagogicas aceitaveis: presentes, principalmente para singular/plural e pares contrastivos.

## Distractors e feedback

As alternativas erradas representam erros reais de concordancia, ordem, negativa ou escolha indevida de auxiliar. Nenhuma opcao duplicada ou correta ausente foi encontrada.

Os feedbacks estao preenchidos, em portugues natural e explicam a regra relevante. Alguns compartilham a mesma regra, mas isso acompanha repeticao pedagogica legitima.

## Validador

`scripts/validateContent.mjs` foi revisado. Nenhuma ampliacao foi necessaria nesta auditoria, porque as regras objetivas ja cobrem contagem, IDs, dificuldade, campos obrigatorios, tres opcoes, opcoes duplicadas, resposta correta presente e pergunta duplicada normalizada.

## Validacoes

Executadas apos as correcoes:

- `node scripts/validateContent.mjs`
- `npm run lint`
- `npm run build`

Resultado: aprovadas.

## Riscos restantes

- O banco ainda nao e consumido por UI, motor de sessao ou progresso.
- Respostas curtas existem em pequena quantidade; podem ser expandidas em bancos futuros se forem aprovadas como padrao.
- A revisao humana final do produto ainda deve validar tom e adequacao para alunos reais.

## Rebalanceamento editorial

Execucao: 2026-07-23.

Objetivo: reduzir o excesso de afirmativas e aplicar a distribuicao editorial principal exclusiva aprovada.

Distribuicao anterior pela classificacao exclusiva desta revisao:

| Dificuldade | Afirmativa | Negativa | Pergunta | Resposta curta | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Easy | 42 | 3 | 3 | 2 | 50 |
| Medium | 55 | 7 | 16 | 2 | 80 |
| Total | 97 | 10 | 19 | 4 | 130 |

Distribuicao final:

| Dificuldade | Afirmativa | Negativa | Pergunta | Resposta curta | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Easy | 30 | 8 | 9 | 3 | 50 |
| Medium | 35 | 14 | 21 | 10 | 80 |
| Total | 65 | 22 | 30 | 13 | 130 |

IDs reescritos:

- Easy: `present_tobe_easy_021`, `present_tobe_easy_022`, `present_tobe_easy_023`, `present_tobe_easy_024`, `present_tobe_easy_025`, `present_tobe_easy_026`, `present_tobe_easy_027`, `present_tobe_easy_031`, `present_tobe_easy_033`, `present_tobe_easy_035`, `present_tobe_easy_036`, `present_tobe_easy_037`.
- Medium: `present_tobe_medium_026`, `present_tobe_medium_027`, `present_tobe_medium_028`, `present_tobe_medium_029`, `present_tobe_medium_030`, `present_tobe_medium_031`, `present_tobe_medium_032`, `present_tobe_medium_033`, `present_tobe_medium_036`, `present_tobe_medium_037`, `present_tobe_medium_041`, `present_tobe_medium_047`, `present_tobe_medium_048`, `present_tobe_medium_049`, `present_tobe_medium_050`, `present_tobe_medium_051`, `present_tobe_medium_054`, `present_tobe_medium_055`, `present_tobe_medium_062`, `present_tobe_medium_063`, `present_tobe_medium_073`.

Resumo quantitativo:

- Afirmativas substituidas: 33.
- Negativas adicionadas: 12.
- Perguntas adicionadas: 11.
- Respostas curtas adicionadas: 9.
- Questoes alteradas nesta revisao: 33.

Revisao pedagogica final:

- Leitura integral das 130 questoes confirmada apos as substituicoes.
- Nenhuma pergunta com duas ordens possiveis foi identificada.
- Nenhuma resposta curta sem contexto foi identificada.
- Nenhuma contracao invalida foi identificada.
- Nenhuma ambiguidade bloqueante foi identificada.
- Nenhuma duplicata semantica evidente foi identificada como bloqueante.
- Nenhum item migrou para Past TO BE, Present Continuous, There Is / There Are ou Simple Present de outro verbo.

Validador:

- `scripts/validateContent.mjs` foi executado antes e depois do rebalanceamento.
- Nenhuma ampliacao foi feita; a distribuicao editorial ficou registrada neste relatorio, sem classificador semantico no codigo de producao.
