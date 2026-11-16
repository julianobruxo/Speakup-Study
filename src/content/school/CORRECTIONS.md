# Correções feitas ao importar o conteúdo da escola

Origem: repositório speakup-school-manager (pasta src/data/studyArea e public/study-area), commit 4c897ce.
Nada foi alterado no repositório da escola. Este conteúdo ainda não está ligado à interface do Speak Up Study.

## Correções aplicadas

| Área | Item | Antes | Depois | Motivo |
|---|---|---|---|---|
| gramática | todos | campos sourceNotes/sourceStatus/level/status | (removidos) | Metadados internos do app da escola: sourceNotes dizia "reescrito para crianças" e citava o professor; level marcava tudo como A1 (inclusive Simple Past e Be going to). |
| gramática | todos | apóstrofo curvo (’) | apóstrofo reto (') | Padronizado com o resto do Speak Up Study; evita problema na comparação de respostas digitadas (104 textos). |
| gramática | simple-present | habitos / preferencias | hábitos / preferências | Acentos faltando. |
| gramática | to-be-present | I am 8 years old. | I am 25 years old. | Exemplo infantil trocado por idade adulta (o app atende A1–B1 de qualquer idade). |
| gramática | to-be-present | Eu tenho 8 anos. | Eu tenho 25 anos. | Tradução do exemplo acima. |
| gramática | to-be-present | Em inglês, você precisa do am, is ou are. Ele é o motorzinho da frase. | Em inglês, a frase precisa de am, is ou are. Sem o verbo to be, ela fica incompleta. | Tom infantil ("motorzinho da frase") trocado por explicação direta. |
| gramática | to-be-past | Pense assim: am / is viram was e are vira were. | Pense assim: am e is viram was; are vira were. | Concordância ("am / is viram … are vira"). |
| gramática | to-be-past | semana passada / sexta-feira passada / semana que vem (em frases) | na semana passada / na sexta-feira passada / na semana que vem | Português natural: faltava "na" (3 frases). |
| gramática | simple-past | semana passada / sexta-feira passada / semana que vem (em frases) | na semana passada / na sexta-feira passada / na semana que vem | Português natural: faltava "na" (3 frases). |
| gramática | be-going-to | semana passada / sexta-feira passada / semana que vem (em frases) | na semana passada / na sexta-feira passada / na semana que vem | Português natural: faltava "na" (1 frases). |
| gramática | in-on-at-time | Que horas é sua aula? | A que horas é a sua aula? | Português correto da pergunta "What time is your class?". |
| gramática | in-on-at-space | Eu estou na escola / estou no local da escola. | Eu estou na escola. | Tradução confusa ("estou no local da escola"). |
| gramática | prepositions-of-place | The shoes are below the bed. | The shelf is below the window. | Frase pouco natural ("sapatos abaixo da cama"; o normal é under). Trocada por exemplo em que below é natural. |
| gramática | prepositions-of-place | Os sapatos estão abaixo da cama. | A prateleira está abaixo da janela. | Tradução do exemplo acima. |
| gramática | there-is-there-are | conteúdo inteiro (era cópia de "Prepositions of Place": explicação, regras visuais e exemplos eram sobre preposições) | texto novo de There is / There are (explicação, 18 exemplos, respostas curtas, 4 seções extras, erro comum) | O tópico não ensinava o que o título dizia. Conteúdo novo escrito por mim: PRECISA de revisão do professor antes de ir para os alunos. |
| vocabulário | appearance:handsome | bonito / elegante | bonito (usado para homens) | Diferenciar de beautiful/pretty/good-looking (todos eram só "bonito"). |
| vocabulário | appearance:pretty | bonito(a) | bonito(a) (mais usado para mulheres) | Diferenciar de beautiful/handsome/good-looking. |
| vocabulário | appearance:heavy | pesado(a) / forte | pesado(a) | "forte" é a tradução de strong, que já existe no mesmo conjunto. |
| vocabulário | weather:warm | morno / agradável | agradavelmente quente | "morno" é para líquidos; para clima o sentido é "quente de forma agradável". |
| vocabulário | clothes:bag | bolsa / mochila | bolsa / sacola | Mochila é backpack. |
| vocabulário | furniture:bench | banco | banco (de sentar) | Evita confusão com bank (banco de dinheiro), que está no conjunto Places. |
| vocabulário | vários | visual vazio ("") | (campo removido) | Campo vazio em 81 itens; esses itens ficam sem figura (você aceitou). |
| verbos irregulares | begin | comecar | começar | Acento faltando. |
| verbos irregulares | stand | ficar em pe | ficar em pé | Acento faltando. |
| verbos irregulares | ordem | beat, bend, bleed, spread, sweep estavam no fim da lista | lista toda em ordem alfabética | Lista fora de ordem. |

## Precisa de revisão do professor

- Tópico There is / There are: o texto é novo, escrito por mim para substituir uma cópia errada. Revisar antes de usar com alunos.

## Observações (não alteradas)

- 7 tópicos de gramática marcados como "em breve" no app da escola (possessives, imperatives, comparatives, superlatives, quantifiers, some/any, countables/uncountables) não foram importados: só tinham título e resumo.
- Números: os exemplos usam "one hundred and one" (com and). Em inglês americano o mais comum é sem and (one hundred one). Não alterei.
- Vocabulário: alguns termos são mais difíceis que o nível básico (bellhop, dry eyes, front desk clerk, stomach flu). Mantidos.
- Vocabulário: pharmacy e drugstore têm a mesma tradução (farmácia); cold aparece em Weather (frio) e Health Problems (resfriado). Mantidos.
- Muitos itens não têm figura (sem emoji e sem foto). Combinado: ok por enquanto; SVG pode ser feito depois.
- public/study-area/flashcards: 151 fotos/ilustrações JPG da Pixabay + 15 SVG originais da escola. 14 SVG de verbos de ação não são usados pelos dados (os dados apontam para os JPG). ATTRIBUTIONS.md traz a origem de cada imagem.
