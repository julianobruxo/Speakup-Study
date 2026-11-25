// Conteúdo importado do app da escola (speakup-school-manager) e corrigido.
// Ainda NÃO está ligado à interface. Lista das correções: ./CORRECTIONS.md

import type { SchoolGrammarTopic } from "./types";

export const SCHOOL_GRAMMAR_TOPICS: SchoolGrammarTopic[] = [
  {
    "id": "to-be-present",
    "title": "To be — Present",
    "summary": "Use am, is e are para falar quem alguém é, como está ou onde está.",
    "explanation": [
      "O verbo to be significa ser ou estar.",
      "Use to be para falar sobre nome, idade, profissão, estado, lugar e características."
    ],
    "uses": [
      "nome",
      "idade",
      "profissão",
      "estado",
      "lugar",
      "características"
    ],
    "pronouns": [
      {
        "pronoun": "I",
        "form": "am"
      },
      {
        "pronoun": "You",
        "form": "are"
      },
      {
        "pronoun": "He",
        "form": "is"
      },
      {
        "pronoun": "She",
        "form": "is"
      },
      {
        "pronoun": "It",
        "form": "is"
      },
      {
        "pronoun": "We",
        "form": "are"
      },
      {
        "pronoun": "They",
        "form": "are"
      }
    ],
    "structure": {
      "affirmative": "Pessoa + am/is/are + complemento",
      "negative": "Pessoa + am/is/are + not + complemento",
      "interrogative": "Am/Is/Are + pessoa + complemento?"
    },
    "examples": {
      "affirmative": [
        {
          "english": "I am 25 years old.",
          "portuguese": "Eu tenho 25 anos."
        },
        {
          "english": "You are my friend.",
          "portuguese": "Você é meu amigo."
        },
        {
          "english": "He is a student.",
          "portuguese": "Ele é estudante."
        },
        {
          "english": "She is happy.",
          "portuguese": "Ela está feliz."
        },
        {
          "english": "It is a pencil.",
          "portuguese": "É um lápis."
        },
        {
          "english": "We are in class.",
          "portuguese": "Nós estamos na aula."
        },
        {
          "english": "They are at school.",
          "portuguese": "Eles estão na escola."
        }
      ],
      "negative": [
        {
          "english": "I am not tired.",
          "portuguese": "Eu não estou cansado."
        },
        {
          "english": "You are not late.",
          "portuguese": "Você não está atrasado."
        },
        {
          "english": "He isn't a teacher.",
          "portuguese": "Ele não é professor."
        },
        {
          "english": "She isn't sad.",
          "portuguese": "Ela não está triste."
        },
        {
          "english": "It isn't my book.",
          "portuguese": "Não é meu livro."
        },
        {
          "english": "We aren't at home.",
          "portuguese": "Nós não estamos em casa."
        },
        {
          "english": "They aren't friends.",
          "portuguese": "Eles não são amigos."
        }
      ],
      "interrogative": [
        {
          "english": "Are you happy?",
          "portuguese": "Você está feliz?"
        },
        {
          "english": "Is he your brother?",
          "portuguese": "Ele é seu irmão?"
        },
        {
          "english": "Is she a student?",
          "portuguese": "Ela é estudante?"
        },
        {
          "english": "Is it your pencil?",
          "portuguese": "É seu lápis?"
        },
        {
          "english": "Are they at school?",
          "portuguese": "Eles estão na escola?"
        }
      ]
    },
    "shortAnswers": [
      {
        "question": "Are you happy?",
        "yes": "Yes, I am.",
        "no": "No, I'm not."
      },
      {
        "question": "Is he a teacher?",
        "yes": "Yes, he is.",
        "no": "No, he isn't."
      },
      {
        "question": "Are they friends?",
        "yes": "Yes, they are.",
        "no": "No, they aren't."
      }
    ],
    "commonMistake": {
      "wrong": "I happy.",
      "correct": "I am happy.",
      "note": "Em inglês, a frase precisa de am, is ou are. Sem o verbo to be, ela fica incompleta."
    }
  },
  {
    "id": "to-be-past",
    "title": "To be — Past",
    "summary": "Use was e were para falar do passado.",
    "explanation": [
      "O To be no passado usa was e were.",
      "Use was e were para falar de coisas que eram ou estavam no passado.",
      "Pense assim: am e is viram was; are vira were."
    ],
    "uses": [
      "lugar no passado",
      "estado no passado",
      "sentimento no passado",
      "idade no passado",
      "nascimento"
    ],
    "pronouns": [
      {
        "pronoun": "I",
        "form": "was"
      },
      {
        "pronoun": "You",
        "form": "were"
      },
      {
        "pronoun": "He",
        "form": "was"
      },
      {
        "pronoun": "She",
        "form": "was"
      },
      {
        "pronoun": "It",
        "form": "was"
      },
      {
        "pronoun": "We",
        "form": "were"
      },
      {
        "pronoun": "They",
        "form": "were"
      }
    ],
    "structure": {
      "affirmative": "Pessoa + was/were + complemento",
      "negative": "Pessoa + was/were + not + complemento",
      "interrogative": "Was/Were + pessoa + complemento?"
    },
    "examples": {
      "affirmative": [
        {
          "english": "I was at home yesterday.",
          "portuguese": "Eu estava em casa ontem."
        },
        {
          "english": "You were tired last night.",
          "portuguese": "Você estava cansado ontem à noite."
        },
        {
          "english": "He was sick last week.",
          "portuguese": "Ele estava doente na semana passada."
        },
        {
          "english": "She was born in 2016.",
          "portuguese": "Ela nasceu em 2016."
        },
        {
          "english": "It was cold yesterday.",
          "portuguese": "Estava frio ontem."
        },
        {
          "english": "We were in class yesterday.",
          "portuguese": "Nós estávamos na aula ontem."
        },
        {
          "english": "They were happy after the game.",
          "portuguese": "Eles estavam felizes depois do jogo."
        }
      ],
      "negative": [
        {
          "english": "I wasn't at school yesterday.",
          "portuguese": "Eu não estava na escola ontem."
        },
        {
          "english": "You weren't late.",
          "portuguese": "Você não estava atrasado."
        },
        {
          "english": "He wasn't sick last week.",
          "portuguese": "Ele não estava doente na semana passada."
        },
        {
          "english": "She wasn't sad.",
          "portuguese": "Ela não estava triste."
        },
        {
          "english": "It wasn't hot yesterday.",
          "portuguese": "Não estava quente ontem."
        },
        {
          "english": "We weren't at home.",
          "portuguese": "Nós não estávamos em casa."
        },
        {
          "english": "They weren't tired.",
          "portuguese": "Eles não estavam cansados."
        }
      ],
      "interrogative": [
        {
          "english": "Were you at home yesterday?",
          "portuguese": "Você estava em casa ontem?"
        },
        {
          "english": "Was he sick last week?",
          "portuguese": "Ele estava doente na semana passada?"
        },
        {
          "english": "Was she born in Brazil?",
          "portuguese": "Ela nasceu no Brasil?"
        },
        {
          "english": "Was it cold yesterday?",
          "portuguese": "Estava frio ontem?"
        },
        {
          "english": "Were they happy after the game?",
          "portuguese": "Eles estavam felizes depois do jogo?"
        }
      ]
    },
    "shortAnswers": [
      {
        "question": "Were you at home yesterday?",
        "yes": "Yes, I was.",
        "no": "No, I wasn't."
      },
      {
        "question": "Was he sick?",
        "yes": "Yes, he was.",
        "no": "No, he wasn't."
      },
      {
        "question": "Were they happy?",
        "yes": "Yes, they were.",
        "no": "No, they weren't."
      }
    ],
    "commonMistake": {
      "wrong": "I were happy.",
      "correct": "I was happy.",
      "note": "Use was com I, he, she e it. Use were com you, we e they. Também vale: They was tired → They were tired."
    }
  },
  {
    "id": "present-continuous",
    "title": "Present Continuous",
    "summary": "Ações acontecendo agora.",
    "explanation": [
      "Use o Present Continuous para falar de ações que estão acontecendo agora.",
      "Ele é como uma foto do momento: mostra o que alguém está fazendo neste instante.",
      "Para montar, usamos: am / is / are + verbo com ING.",
      "Também ajuda a falar de ações temporárias e do que uma pessoa está fazendo agora.",
      "Comparação rápida: Present Continuous fala do agora. Simple Present fala de rotina."
    ],
    "uses": [
      "ações acontecendo agora",
      "coisas acontecendo neste momento",
      "ações temporárias",
      "o que uma pessoa está fazendo"
    ],
    "pronouns": [
      {
        "pronoun": "I",
        "form": "am"
      },
      {
        "pronoun": "You",
        "form": "are"
      },
      {
        "pronoun": "He",
        "form": "is"
      },
      {
        "pronoun": "She",
        "form": "is"
      },
      {
        "pronoun": "It",
        "form": "is"
      },
      {
        "pronoun": "We",
        "form": "are"
      },
      {
        "pronoun": "They",
        "form": "are"
      }
    ],
    "structure": {
      "affirmative": "Pessoa + am/is/are + verbo-ing",
      "negative": "Pessoa + am/is/are + not + verbo-ing",
      "interrogative": "Am/Is/Are + pessoa + verbo-ing?"
    },
    "examples": {
      "affirmative": [
        {
          "english": "I am studying English.",
          "portuguese": "Eu estou estudando inglês."
        },
        {
          "english": "You are listening to music.",
          "portuguese": "Você está ouvindo música."
        },
        {
          "english": "He is watching TV.",
          "portuguese": "Ele está assistindo TV."
        },
        {
          "english": "She is cooking lunch.",
          "portuguese": "Ela está cozinhando o almoço."
        },
        {
          "english": "It is raining now.",
          "portuguese": "Está chovendo agora."
        },
        {
          "english": "We are playing a game.",
          "portuguese": "Nós estamos jogando um jogo."
        },
        {
          "english": "They are running in the park.",
          "portuguese": "Eles estão correndo no parque."
        }
      ],
      "negative": [
        {
          "english": "I am not sleeping.",
          "portuguese": "Eu não estou dormindo."
        },
        {
          "english": "You aren't working now.",
          "portuguese": "Você não está trabalhando agora."
        },
        {
          "english": "He isn't watching TV.",
          "portuguese": "Ele não está assistindo TV."
        },
        {
          "english": "She isn't cooking lunch.",
          "portuguese": "Ela não está cozinhando o almoço."
        },
        {
          "english": "It isn't raining now.",
          "portuguese": "Não está chovendo agora."
        },
        {
          "english": "We aren't playing soccer.",
          "portuguese": "Nós não estamos jogando futebol."
        },
        {
          "english": "They aren't running.",
          "portuguese": "Eles não estão correndo."
        }
      ],
      "interrogative": [
        {
          "english": "Are you studying English?",
          "portuguese": "Você está estudando inglês?"
        },
        {
          "english": "Is he watching TV?",
          "portuguese": "Ele está assistindo TV?"
        },
        {
          "english": "Is she cooking lunch?",
          "portuguese": "Ela está cozinhando o almoço?"
        },
        {
          "english": "Is it raining now?",
          "portuguese": "Está chovendo agora?"
        },
        {
          "english": "Are they running in the park?",
          "portuguese": "Eles estão correndo no parque?"
        }
      ]
    },
    "shortAnswers": [
      {
        "question": "Are you studying English?",
        "yes": "Yes, I am.",
        "no": "No, I'm not."
      },
      {
        "question": "Is he watching TV?",
        "yes": "Yes, he is.",
        "no": "No, he isn't."
      },
      {
        "question": "Are they running?",
        "yes": "Yes, they are.",
        "no": "No, they aren't."
      }
    ],
    "commonMistake": {
      "wrong": "I studying English.",
      "correct": "I am studying English.",
      "note": "No Present Continuous, o verbo precisa de duas partes: am/is/are + verbo com ING."
    }
  },
  {
    "id": "simple-present",
    "title": "Simple Present",
    "summary": "Rotinas, hábitos, gostos e fatos.",
    "explanation": [
      "Use o Simple Present para falar de coisas que acontecem no presente de forma normal, repetida ou verdadeira.",
      "Ele é muito usado para falar de rotina, hábitos, gostos e fatos.",
      "Em português, o verbo muda bastante: eu gosto, tu gostas, ele gosta, nós gostamos, eles gostam.",
      "Em inglês, ele é mais simples. Na maioria das pessoas, o verbo fica normal.",
      "A atenção maior é com he, she e it. Na frase afirmativa, o verbo ganha S, ES ou IES.",
      "Na negativa e na pergunta, usamos don't / doesn't e do / does. Depois deles, o verbo volta à forma base.",
      "Comparação rápida: Simple Present fala da rotina. Present Continuous fala do agora."
    ],
    "uses": [
      "rotinas",
      "hábitos",
      "gostos",
      "preferências",
      "fatos",
      "coisas que são verdade por bastante tempo"
    ],
    "structure": {
      "affirmative": "Pessoa + verbo + complemento",
      "negative": "Pessoa + don't/doesn't + verbo base + complemento",
      "interrogative": "Do/Does + pessoa + verbo base + complemento?"
    },
    "examples": {
      "affirmative": [
        {
          "english": "I study English every week.",
          "portuguese": "Eu estudo inglês toda semana."
        },
        {
          "english": "You play soccer on Saturdays.",
          "portuguese": "Você joga futebol aos sábados."
        },
        {
          "english": "We live in Dois Irmãos.",
          "portuguese": "Nós moramos em Dois Irmãos."
        },
        {
          "english": "They like pizza.",
          "portuguese": "Eles gostam de pizza."
        },
        {
          "english": "He works at a school.",
          "portuguese": "Ele trabalha em uma escola."
        },
        {
          "english": "She gets up at 7 o'clock.",
          "portuguese": "Ela acorda às 7 horas."
        },
        {
          "english": "It rains a lot in winter.",
          "portuguese": "Chove bastante no inverno."
        }
      ],
      "negative": [
        {
          "english": "I don't study Spanish.",
          "portuguese": "Eu não estudo espanhol."
        },
        {
          "english": "You don't work at night.",
          "portuguese": "Você não trabalha à noite."
        },
        {
          "english": "We don't live in Porto Alegre.",
          "portuguese": "Nós não moramos em Porto Alegre."
        },
        {
          "english": "They don't like broccoli.",
          "portuguese": "Eles não gostam de brócolis."
        },
        {
          "english": "He doesn't work on Sundays.",
          "portuguese": "Ele não trabalha aos domingos."
        },
        {
          "english": "She doesn't get up late.",
          "portuguese": "Ela não acorda tarde."
        },
        {
          "english": "It doesn't rain every day.",
          "portuguese": "Não chove todos os dias."
        }
      ],
      "interrogative": [
        {
          "english": "Do you study English?",
          "portuguese": "Você estuda inglês?"
        },
        {
          "english": "Do they like pizza?",
          "portuguese": "Eles gostam de pizza?"
        },
        {
          "english": "Do we need more time?",
          "portuguese": "Nós precisamos de mais tempo?"
        },
        {
          "english": "Does he work here?",
          "portuguese": "Ele trabalha aqui?"
        },
        {
          "english": "Does she get up early?",
          "portuguese": "Ela acorda cedo?"
        },
        {
          "english": "Does it rain in summer?",
          "portuguese": "Chove no verão?"
        }
      ]
    },
    "shortAnswers": [
      {
        "question": "Do you study English?",
        "yes": "Yes, I do.",
        "no": "No, I don't."
      },
      {
        "question": "Do they like pizza?",
        "yes": "Yes, they do.",
        "no": "No, they don't."
      },
      {
        "question": "Does he work here?",
        "yes": "Yes, he does.",
        "no": "No, he doesn't."
      },
      {
        "question": "Does she get up early?",
        "yes": "Yes, she does.",
        "no": "No, she doesn't."
      }
    ],
    "spellingRules": {
      "title": "Como o verbo muda na 3ª pessoa?",
      "intro": [
        "Em português, o verbo muda muito: eu gosto, tu gostas, ele gosta, nós gostamos, eles gostam.",
        "Em inglês, quase todo mundo usa o verbo normal.",
        "A atenção maior é com he, she e it. Na frase afirmativa, o verbo ganha S, ES ou IES.",
        "Na negativa e na pergunta, usamos don't / doesn't e do / does. Depois deles, o verbo volta à forma base."
      ],
      "reminder": "Lembre: I / you / we / they → verbo normal. He / she / it → verbo com S, ES ou IES na afirmativa.",
      "rules": [
        {
          "title": "Na maioria dos verbos: coloque S",
          "note": "Na maioria dos verbos, é só colocar S no final.",
          "examples": [
            "work → works",
            "play → plays",
            "like → likes",
            "live → lives",
            "read → reads"
          ],
          "sentences": [
            {
              "english": "I work every day.",
              "portuguese": "Eu trabalho todos os dias."
            },
            {
              "english": "He works every day.",
              "portuguese": "Ele trabalha todos os dias."
            },
            {
              "english": "They play soccer.",
              "portuguese": "Eles jogam futebol."
            },
            {
              "english": "She plays soccer.",
              "portuguese": "Ela joga futebol."
            }
          ]
        },
        {
          "title": "Verbos terminados em S, SH, CH, X, Z ou O: coloque ES",
          "note": "Quando o verbo termina em S, SH, CH, X, Z ou O, normalmente colocamos ES.",
          "examples": [
            "watch → watches",
            "go → goes",
            "do → does",
            "fix → fixes",
            "wash → washes",
            "kiss → kisses",
            "buzz → buzzes"
          ],
          "sentences": [
            {
              "english": "I watch TV.",
              "portuguese": "Eu assisto TV."
            },
            {
              "english": "He watches TV.",
              "portuguese": "Ele assiste TV."
            },
            {
              "english": "They go to school.",
              "portuguese": "Eles vão para a escola."
            },
            {
              "english": "She goes to school.",
              "portuguese": "Ela vai para a escola."
            }
          ]
        },
        {
          "title": "Verbos terminados em consoante + Y: troque Y por IES",
          "note": "Quando o verbo termina com consoante + Y, tiramos o Y e colocamos IES.",
          "examples": [
            "study → studies",
            "cry → cries",
            "try → tries",
            "fly → flies",
            "carry → carries"
          ],
          "sentences": [
            {
              "english": "I study English.",
              "portuguese": "Eu estudo inglês."
            },
            {
              "english": "She studies English.",
              "portuguese": "Ela estuda inglês."
            },
            {
              "english": "The baby cries.",
              "portuguese": "O bebê chora."
            },
            {
              "english": "The bird flies.",
              "portuguese": "O pássaro voa."
            }
          ]
        },
        {
          "title": "Verbos terminados em vogal + Y: só coloque S",
          "note": "Quando antes do Y tem uma vogal, não tiramos o Y. Só colocamos S.",
          "examples": [
            "play → plays",
            "enjoy → enjoys",
            "buy → buys",
            "say → says",
            "stay → stays"
          ],
          "sentences": [
            {
              "english": "I play games.",
              "portuguese": "Eu jogo jogos."
            },
            {
              "english": "He plays games.",
              "portuguese": "Ele joga jogos."
            },
            {
              "english": "I enjoy music.",
              "portuguese": "Eu gosto de música."
            },
            {
              "english": "She enjoys music.",
              "portuguese": "Ela gosta de música."
            }
          ]
        },
        {
          "title": "Have é especial: vira has",
          "note": "O verbo have é especial. Com he, she e it, have vira has.",
          "examples": [
            "have → has"
          ],
          "sentences": [
            {
              "english": "I have a dog.",
              "portuguese": "Eu tenho um cachorro."
            },
            {
              "english": "She has a dog.",
              "portuguese": "Ela tem um cachorro."
            },
            {
              "english": "They have English class.",
              "portuguese": "Eles têm aula de inglês."
            },
            {
              "english": "He has English class.",
              "portuguese": "Ele tem aula de inglês."
            }
          ]
        }
      ],
      "special": "Comparação rápida: Simple Present fala da rotina. Present Continuous fala do agora."
    },
    "commonMistake": {
      "wrong": "He work every day.",
      "correct": "He works every day.",
      "note": "No Simple Present, cuidado com he, she e it. Na afirmativa, o verbo ganha S, ES ou IES. Na negativa e na pergunta, usamos doesn't ou does, e o verbo fica normal. Outro erro comum: She don't like pizza. O certo é She doesn't like pizza. E em perguntas: Does he work here?, sem S no verbo."
    }
  },
  {
    "id": "there-is-there-are",
    "title": "There is / There are",
    "summary": "Use para dizer que algo existe ou que há algo em um lugar.",
    "explanation": [
      "Use there is e there are para dizer que algo existe em algum lugar. Em português, costumamos dizer \"tem\" ou \"há\".",
      "There is é para uma coisa só (singular). There are é para duas ou mais coisas (plural).",
      "Aqui, o there não significa \"ali\": ele só abre a frase.",
      "Com coisas que não contamos, como water, milk e money, use there is."
    ],
    "uses": [
      "dizer que algo existe",
      "descrever um lugar",
      "descrever um quarto",
      "dizer quantas coisas existem",
      "perguntar se algo existe"
    ],
    "structure": {
      "affirmative": "There is + a/an + singular / There is + some + uncountable. / There are + plural.",
      "negative": "There isn't + a/an + singular. / There aren't any + plural.",
      "interrogative": "Is there + a/an + singular? / Are there any + plural?"
    },
    "examples": {
      "affirmative": [
        {
          "english": "There is a book on the desk.",
          "portuguese": "Tem um livro na mesa."
        },
        {
          "english": "There is an apple in the bag.",
          "portuguese": "Tem uma maçã na bolsa."
        },
        {
          "english": "There is a park near my house.",
          "portuguese": "Tem um parque perto da minha casa."
        },
        {
          "english": "There are three chairs in the kitchen.",
          "portuguese": "Tem três cadeiras na cozinha."
        },
        {
          "english": "There are two students in the classroom.",
          "portuguese": "Tem dois alunos na sala de aula."
        },
        {
          "english": "There are a lot of people at the bus stop.",
          "portuguese": "Tem muita gente no ponto de ônibus."
        },
        {
          "english": "There is some water in the bottle.",
          "portuguese": "Tem um pouco de água na garrafa."
        }
      ],
      "negative": [
        {
          "english": "There isn't a clock on the wall.",
          "portuguese": "Não tem relógio na parede."
        },
        {
          "english": "There isn't a bank near here.",
          "portuguese": "Não tem banco perto daqui."
        },
        {
          "english": "There isn't any milk in the fridge.",
          "portuguese": "Não tem leite na geladeira."
        },
        {
          "english": "There aren't any chairs in the backyard.",
          "portuguese": "Não tem cadeiras no quintal."
        },
        {
          "english": "There aren't any students in the library.",
          "portuguese": "Não tem alunos na biblioteca."
        },
        {
          "english": "There aren't any pictures on the wall.",
          "portuguese": "Não tem quadros na parede."
        }
      ],
      "interrogative": [
        {
          "english": "Is there a bank near here?",
          "portuguese": "Tem um banco perto daqui?"
        },
        {
          "english": "Is there a TV in your bedroom?",
          "portuguese": "Tem uma TV no seu quarto?"
        },
        {
          "english": "Is there any milk in the fridge?",
          "portuguese": "Tem leite na geladeira?"
        },
        {
          "english": "Are there any students in the classroom?",
          "portuguese": "Tem alunos na sala de aula?"
        },
        {
          "english": "Are there two bathrooms in your house?",
          "portuguese": "Tem dois banheiros na sua casa?"
        }
      ]
    },
    "shortAnswers": [
      {
        "question": "Is there a bank near here?",
        "yes": "Yes, there is.",
        "no": "No, there isn't."
      },
      {
        "question": "Is there a TV in your bedroom?",
        "yes": "Yes, there is.",
        "no": "No, there isn't."
      },
      {
        "question": "Are there any students in the classroom?",
        "yes": "Yes, there are.",
        "no": "No, there aren't."
      },
      {
        "question": "Are there two bathrooms in your house?",
        "yes": "Yes, there are.",
        "no": "No, there aren't."
      }
    ],
    "extraSections": [
      {
        "title": "Singular ou plural?",
        "paragraphs": [
          "Use there is com uma coisa só.",
          "Use there are com duas ou mais coisas.",
          "Na fala, é comum usar there's no lugar de there is."
        ],
        "examples": [
          {
            "english": "There is a lamp in the room.",
            "portuguese": "Tem uma luminária no quarto."
          },
          {
            "english": "There are two lamps in the room.",
            "portuguese": "Tem duas luminárias no quarto."
          },
          {
            "english": "There's a lamp in the room.",
            "portuguese": "Tem uma luminária no quarto."
          }
        ]
      },
      {
        "title": "A, an, some e any",
        "paragraphs": [
          "Use a / an com uma coisa só.",
          "Use some nas frases afirmativas, com plural ou com coisas que não contamos.",
          "Use any nas frases negativas e nas perguntas."
        ],
        "examples": [
          {
            "english": "There are some books on the shelf.",
            "portuguese": "Tem alguns livros na prateleira."
          },
          {
            "english": "There aren't any books on the shelf.",
            "portuguese": "Não tem nenhum livro na prateleira."
          },
          {
            "english": "Are there any books on the shelf?",
            "portuguese": "Tem algum livro na prateleira?"
          }
        ]
      },
      {
        "title": "Perguntas com How many",
        "paragraphs": [
          "Para perguntar a quantidade de coisas, use How many + plural + are there?",
          "Responda com There is one… ou There are + número."
        ],
        "examples": [
          {
            "english": "How many chairs are there in the kitchen?",
            "portuguese": "Quantas cadeiras tem na cozinha?"
          },
          {
            "english": "There are four chairs.",
            "portuguese": "Tem quatro cadeiras."
          }
        ]
      },
      {
        "title": "There is ou It is?",
        "paragraphs": [
          "There is / there are apresenta algo novo: diz que existe.",
          "It is / they are fala de algo que já foi apresentado."
        ],
        "examples": [
          {
            "english": "There is a cat in the backyard. It is black.",
            "portuguese": "Tem um gato no quintal. Ele é preto."
          },
          {
            "english": "There are two dogs in the backyard. They are small.",
            "portuguese": "Tem dois cachorros no quintal. Eles são pequenos."
          }
        ]
      }
    ],
    "commonMistake": {
      "wrong": "There is two chairs in the kitchen.",
      "correct": "There are two chairs in the kitchen.",
      "note": "Com duas ou mais coisas, use there are. Outro erro comum é usar have no lugar de there is: Have a book on the desk. O certo é There is a book on the desk."
    }
  },
  {
    "id": "be-going-to",
    "title": "Be going to",
    "summary": "Use para falar de planos e intenções futuras.",
    "explanation": [
      "Use be going to para falar de planos ou intenções para o futuro.",
      "É como dizer \"vou fazer alguma coisa\".",
      "Em português, falamos: eu vou estudar, ela vai viajar, eles vão jogar.",
      "Em inglês, usamos am / is / are + going to + verbo normal."
    ],
    "uses": [
      "planos futuros",
      "intenções",
      "coisas que alguém vai fazer",
      "ações com tomorrow, next week, next month e next year",
      "perguntar sobre planos"
    ],
    "pronouns": [
      {
        "pronoun": "I",
        "form": "am going to"
      },
      {
        "pronoun": "You",
        "form": "are going to"
      },
      {
        "pronoun": "He",
        "form": "is going to"
      },
      {
        "pronoun": "She",
        "form": "is going to"
      },
      {
        "pronoun": "It",
        "form": "is going to"
      },
      {
        "pronoun": "We",
        "form": "are going to"
      },
      {
        "pronoun": "They",
        "form": "are going to"
      }
    ],
    "structure": {
      "affirmative": "Pessoa + am/is/are + going to + verbo normal + complemento",
      "negative": "Pessoa + am not/isn't/aren't + going to + verbo normal + complemento",
      "interrogative": "Am/Is/Are + pessoa + going to + verbo normal + complemento?"
    },
    "examples": {
      "affirmative": [
        {
          "english": "I am going to study English tomorrow.",
          "portuguese": "Eu vou estudar inglês amanhã."
        },
        {
          "english": "You are going to play soccer next weekend.",
          "portuguese": "Você vai jogar futebol no próximo fim de semana."
        },
        {
          "english": "He is going to buy a bike next month.",
          "portuguese": "Ele vai comprar uma bicicleta no mês que vem."
        },
        {
          "english": "She is going to travel next year.",
          "portuguese": "Ela vai viajar no ano que vem."
        },
        {
          "english": "We are going to watch a movie later.",
          "portuguese": "Nós vamos assistir a um filme mais tarde."
        },
        {
          "english": "They are going to have a test next class.",
          "portuguese": "Eles vão ter uma prova na próxima aula."
        }
      ],
      "negative": [
        {
          "english": "I am not going to study tonight.",
          "portuguese": "Eu não vou estudar hoje à noite."
        },
        {
          "english": "You aren't going to work tomorrow.",
          "portuguese": "Você não vai trabalhar amanhã."
        },
        {
          "english": "He isn't going to play video games today.",
          "portuguese": "Ele não vai jogar videogame hoje."
        },
        {
          "english": "She isn't going to travel next week.",
          "portuguese": "Ela não vai viajar na semana que vem."
        },
        {
          "english": "We aren't going to eat pizza after class.",
          "portuguese": "Nós não vamos comer pizza depois da aula."
        },
        {
          "english": "They aren't going to have a test tomorrow.",
          "portuguese": "Eles não vão ter prova amanhã."
        }
      ],
      "interrogative": [
        {
          "english": "Are you going to study tomorrow?",
          "portuguese": "Você vai estudar amanhã?"
        },
        {
          "english": "Is he going to buy a bike next month?",
          "portuguese": "Ele vai comprar uma bicicleta no mês que vem?"
        },
        {
          "english": "Is she going to travel next year?",
          "portuguese": "Ela vai viajar no ano que vem?"
        },
        {
          "english": "Are we going to watch a movie later?",
          "portuguese": "Nós vamos assistir a um filme mais tarde?"
        },
        {
          "english": "Are they going to have a test next class?",
          "portuguese": "Eles vão ter uma prova na próxima aula?"
        }
      ]
    },
    "shortAnswers": [
      {
        "question": "Are you going to study tomorrow?",
        "yes": "Yes, I am.",
        "no": "No, I'm not."
      },
      {
        "question": "Is he going to play soccer?",
        "yes": "Yes, he is.",
        "no": "No, he isn't."
      },
      {
        "question": "Is she going to travel next week?",
        "yes": "Yes, she is.",
        "no": "No, she isn't."
      },
      {
        "question": "Are they going to have a test?",
        "yes": "Yes, they are.",
        "no": "No, they aren't."
      }
    ],
    "extraSections": [
      {
        "title": "O verbo depois de going to fica normal",
        "paragraphs": [
          "Depois de going to, usamos o verbo normal.",
          "Não colocamos S.",
          "Não colocamos ING.",
          "Não colocamos passado.",
          "A ideia de futuro já está em going to."
        ],
        "examples": [
          {
            "english": "I am going to study.",
            "portuguese": "Eu vou estudar."
          },
          {
            "english": "She is going to travel.",
            "portuguese": "Ela vai viajar."
          },
          {
            "english": "They are going to play.",
            "portuguese": "Eles vão jogar."
          },
          {
            "english": "She is going to travel next year.",
            "portuguese": "Ela vai viajar no ano que vem."
          }
        ]
      },
      {
        "title": "Palavras de futuro",
        "paragraphs": [
          "Essas palavras ajudam a mostrar quando algo vai acontecer."
        ],
        "examples": [
          {
            "english": "tomorrow",
            "portuguese": "amanhã"
          },
          {
            "english": "next week",
            "portuguese": "semana que vem"
          },
          {
            "english": "next month",
            "portuguese": "mês que vem"
          },
          {
            "english": "next year",
            "portuguese": "ano que vem"
          },
          {
            "english": "next weekend",
            "portuguese": "próximo fim de semana"
          },
          {
            "english": "in a few days",
            "portuguese": "em alguns dias"
          },
          {
            "english": "in a week",
            "portuguese": "em uma semana"
          },
          {
            "english": "soon",
            "portuguese": "em breve / logo"
          },
          {
            "english": "later",
            "portuguese": "mais tarde"
          },
          {
            "english": "next Monday",
            "portuguese": "próxima segunda-feira"
          },
          {
            "english": "in a couple of weeks",
            "portuguese": "em duas semanas"
          }
        ]
      },
      {
        "title": "Be going to não é Present Continuous",
        "paragraphs": [
          "Os dois usam am, is e are, mas não são a mesma coisa.",
          "Present Continuous fala do que está acontecendo agora.",
          "Be going to fala de plano futuro."
        ],
        "examples": [
          {
            "english": "I am studying now.",
            "portuguese": "Eu estou estudando agora."
          },
          {
            "english": "I am going to study tomorrow.",
            "portuguese": "Eu vou estudar amanhã."
          }
        ]
      }
    ],
    "commonMistake": {
      "wrong": "I going to study.",
      "correct": "I am going to study.",
      "note": "Depois de going to, o verbo fica normal. Lembre: I → am going to, He / She / It → is going to, You / We / They → are going to. Outro erro comum: She is going to travels. O certo é She is going to travel."
    }
  },
  {
    "id": "simple-past",
    "title": "Simple Past",
    "summary": "Use para falar de ações que aconteceram no passado.",
    "explanation": [
      "Use o Simple Past para falar de ações que aconteceram no passado.",
      "Ele é usado quando a ação já terminou.",
      "Normalmente usamos palavras como yesterday, last night, last week, last weekend, last month e last year.",
      "Pense assim: Simple Past = ação terminada no passado."
    ],
    "uses": [
      "ações terminadas no passado",
      "coisas que aconteceram ontem",
      "coisas que aconteceram na semana passada",
      "coisas que aconteceram em um momento específico do passado",
      "histórias simples sobre o passado"
    ],
    "structure": {
      "affirmative": "Pessoa + verbo no passado + complemento",
      "negative": "Pessoa + didn't + verbo normal + complemento",
      "interrogative": "Did + pessoa + verbo normal + complemento?"
    },
    "examples": {
      "affirmative": [
        {
          "english": "I worked yesterday.",
          "portuguese": "Eu trabalhei ontem."
        },
        {
          "english": "You visited your grandmother last weekend.",
          "portuguese": "Você visitou sua avó no fim de semana passado."
        },
        {
          "english": "He played soccer last night.",
          "portuguese": "Ele jogou futebol ontem à noite."
        },
        {
          "english": "She studied English yesterday.",
          "portuguese": "Ela estudou inglês ontem."
        },
        {
          "english": "We watched a movie last Friday.",
          "portuguese": "Nós assistimos a um filme na sexta-feira passada."
        },
        {
          "english": "They went to school by bus.",
          "portuguese": "Eles foram para a escola de ônibus."
        },
        {
          "english": "Ana ate pizza last night.",
          "portuguese": "Ana comeu pizza ontem à noite."
        },
        {
          "english": "Jack bought new shoes last weekend.",
          "portuguese": "Jack comprou sapatos novos no fim de semana passado."
        }
      ],
      "negative": [
        {
          "english": "I didn't work yesterday.",
          "portuguese": "Eu não trabalhei ontem."
        },
        {
          "english": "You didn't visit your grandmother.",
          "portuguese": "Você não visitou sua avó."
        },
        {
          "english": "He didn't play soccer last night.",
          "portuguese": "Ele não jogou futebol ontem à noite."
        },
        {
          "english": "She didn't study English yesterday.",
          "portuguese": "Ela não estudou inglês ontem."
        },
        {
          "english": "We didn't watch a movie last Friday.",
          "portuguese": "Nós não assistimos a um filme na sexta-feira passada."
        },
        {
          "english": "They didn't go to school by bus.",
          "portuguese": "Eles não foram para a escola de ônibus."
        },
        {
          "english": "Ana didn't eat pizza last night.",
          "portuguese": "Ana não comeu pizza ontem à noite."
        },
        {
          "english": "Jack didn't buy new shoes last weekend.",
          "portuguese": "Jack não comprou sapatos novos no fim de semana passado."
        }
      ],
      "interrogative": [
        {
          "english": "Did you work yesterday?",
          "portuguese": "Você trabalhou ontem?"
        },
        {
          "english": "Did he play soccer last night?",
          "portuguese": "Ele jogou futebol ontem à noite?"
        },
        {
          "english": "Did she study English yesterday?",
          "portuguese": "Ela estudou inglês ontem?"
        },
        {
          "english": "Did they go to school by bus?",
          "portuguese": "Eles foram para a escola de ônibus?"
        },
        {
          "english": "Did Ana eat pizza last night?",
          "portuguese": "Ana comeu pizza ontem à noite?"
        },
        {
          "english": "Did Jack buy new shoes last weekend?",
          "portuguese": "Jack comprou sapatos novos no fim de semana passado?"
        }
      ]
    },
    "shortAnswers": [
      {
        "question": "Did you work yesterday?",
        "yes": "Yes, I did.",
        "no": "No, I didn't."
      },
      {
        "question": "Did he play soccer last night?",
        "yes": "Yes, he did.",
        "no": "No, he didn't."
      },
      {
        "question": "Did she study English yesterday?",
        "yes": "Yes, she did.",
        "no": "No, she didn't."
      },
      {
        "question": "Did they go to school by bus?",
        "yes": "Yes, they did.",
        "no": "No, they didn't."
      }
    ],
    "extraSections": [
      {
        "title": "A regra mais importante do Simple Past",
        "paragraphs": [
          "Na frase afirmativa, o verbo vai para o passado.",
          "Na frase negativa e na pergunta, usamos did ou didn't.",
          "Quando did ou didn't aparece, o verbo volta ao normal.",
          "A ideia de passado já está em did ou didn't."
        ],
        "examples": [
          {
            "english": "I worked yesterday.",
            "portuguese": "Eu trabalhei ontem."
          },
          {
            "english": "I didn't work yesterday.",
            "portuguese": "Eu não trabalhei ontem."
          },
          {
            "english": "Did you work yesterday?",
            "portuguese": "Você trabalhou ontem?"
          },
          {
            "english": "I didn't work yesterday.",
            "portuguese": "Eu não trabalhei ontem."
          },
          {
            "english": "Did you work yesterday?",
            "portuguese": "Você trabalhou ontem?"
          }
        ]
      },
      {
        "title": "Verbos regulares e irregulares",
        "paragraphs": [
          "No Simple Past, existem dois grupos de verbos.",
          "Verbos regulares normalmente recebem ED.",
          "Verbos irregulares mudam de forma e precisam ser aprendidos aos poucos."
        ],
        "examples": [
          {
            "english": "work → worked",
            "portuguese": "verbo regular"
          },
          {
            "english": "visit → visited",
            "portuguese": "verbo regular"
          },
          {
            "english": "play → played",
            "portuguese": "verbo regular"
          },
          {
            "english": "stop → stopped",
            "portuguese": "verbo regular"
          },
          {
            "english": "go → went",
            "portuguese": "verbo irregular"
          },
          {
            "english": "drink → drank",
            "portuguese": "verbo irregular"
          },
          {
            "english": "drive → drove",
            "portuguese": "verbo irregular"
          },
          {
            "english": "eat → ate",
            "portuguese": "verbo irregular"
          },
          {
            "english": "have → had",
            "portuguese": "verbo irregular"
          },
          {
            "english": "buy → bought",
            "portuguese": "verbo irregular"
          },
          {
            "english": "ride → rode",
            "portuguese": "verbo irregular"
          }
        ]
      },
      {
        "title": "Como colocar ED nos verbos regulares?",
        "paragraphs": [
          "Na maioria dos verbos regulares, é só colocar ED no final.",
          "Quando o verbo já termina em E, colocamos só D.",
          "Quando o verbo termina em consoante + Y, tiramos o Y e colocamos IED.",
          "Em alguns verbos curtinhos, dobramos a última letra antes de colocar ED.",
          "Não tente decorar tudo de uma vez. Primeiro lembre: afirmativa no passado = verbo no passado."
        ],
        "examples": [
          {
            "english": "work → worked",
            "portuguese": "na maioria dos verbos"
          },
          {
            "english": "play → played",
            "portuguese": "na maioria dos verbos"
          },
          {
            "english": "watch → watched",
            "portuguese": "na maioria dos verbos"
          },
          {
            "english": "clean → cleaned",
            "portuguese": "na maioria dos verbos"
          },
          {
            "english": "visit → visited",
            "portuguese": "na maioria dos verbos"
          },
          {
            "english": "like → liked",
            "portuguese": "verbo que termina em E"
          },
          {
            "english": "live → lived",
            "portuguese": "verbo que termina em E"
          },
          {
            "english": "study → studied",
            "portuguese": "consoante + Y"
          },
          {
            "english": "cry → cried",
            "portuguese": "consoante + Y"
          },
          {
            "english": "try → tried",
            "portuguese": "consoante + Y"
          },
          {
            "english": "carry → carried",
            "portuguese": "consoante + Y"
          },
          {
            "english": "stop → stopped",
            "portuguese": "verbo curtinho com letra dobrada"
          },
          {
            "english": "plan → planned",
            "portuguese": "verbo curtinho com letra dobrada"
          },
          {
            "english": "drop → dropped",
            "portuguese": "verbo curtinho com letra dobrada"
          }
        ]
      },
      {
        "title": "Palavras de passado",
        "paragraphs": [
          "Essas palavras ajudam a mostrar quando a ação aconteceu."
        ],
        "examples": [
          {
            "english": "yesterday",
            "portuguese": "ontem"
          },
          {
            "english": "last night",
            "portuguese": "ontem à noite"
          },
          {
            "english": "last week",
            "portuguese": "semana passada"
          },
          {
            "english": "last weekend",
            "portuguese": "fim de semana passado"
          },
          {
            "english": "last month",
            "portuguese": "mês passado"
          },
          {
            "english": "last year",
            "portuguese": "ano passado"
          },
          {
            "english": "two days ago",
            "portuguese": "dois dias atrás"
          },
          {
            "english": "a week ago",
            "portuguese": "uma semana atrás"
          },
          {
            "english": "I studied English yesterday.",
            "portuguese": "Eu estudei inglês ontem."
          },
          {
            "english": "She watched a movie last night.",
            "portuguese": "Ela assistiu a um filme ontem à noite."
          },
          {
            "english": "They played soccer last weekend.",
            "portuguese": "Eles jogaram futebol no fim de semana passado."
          },
          {
            "english": "We visited our grandparents two days ago.",
            "portuguese": "Nós visitamos nossos avós dois dias atrás."
          }
        ]
      },
      {
        "title": "Simple Past x Simple Present",
        "paragraphs": [
          "Simple Present fala de rotina.",
          "Simple Past fala de uma ação terminada no passado."
        ],
        "examples": [
          {
            "english": "I study English every week.",
            "portuguese": "Eu estudo inglês toda semana."
          },
          {
            "english": "I studied English yesterday.",
            "portuguese": "Eu estudei inglês ontem."
          }
        ]
      }
    ],
    "commonMistake": {
      "wrong": "I didn't worked yesterday.",
      "correct": "I didn't work yesterday.",
      "note": "Na afirmativa, o verbo vai para o passado. Na negativa com didn't, o verbo volta ao normal. Na pergunta com did, o verbo também volta ao normal. Outro exemplo: Did she studied English? O certo é Did she study English?"
    }
  },
  {
    "id": "prepositions-of-place",
    "title": "Prepositions of Place",
    "summary": "Palavras para dizer onde as coisas estão.",
    "explanation": [
      "Prepositions of Place são palavras que mostram onde uma coisa está.",
      "Use essas palavras para explicar a posição de objetos, pessoas ou lugares.",
      "Pense assim: Where is...? pergunta onde uma coisa está. Where are...? pergunta onde duas ou mais coisas estão."
    ],
    "uses": [
      "dizer onde uma coisa está",
      "perguntar onde algo está",
      "descrever um quarto",
      "descrever uma sala",
      "falar sobre móveis e objetos"
    ],
    "structure": {
      "singular": "Where is the + objeto? / It's + preposição + lugar.",
      "plural": "Where are the + objetos? / They're + preposição + lugar.",
      "affirmative": "The object is + preposição + lugar.",
      "negative": "The object isn't + preposição + lugar.",
      "interrogative": "Is the object + preposição + lugar?"
    },
    "visualRules": [
      {
        "preposition": "in",
        "translation": "dentro",
        "description": "A bolinha está dentro da caixa.",
        "visualType": "in",
        "example": {
          "english": "The ball is in the box.",
          "portuguese": "A bola está dentro da caixa."
        }
      },
      {
        "preposition": "on",
        "translation": "em cima / sobre",
        "description": "A bolinha está em cima da caixa.",
        "visualType": "on",
        "example": {
          "english": "The book is on the desk.",
          "portuguese": "O livro está em cima da escrivaninha."
        }
      },
      {
        "preposition": "under",
        "translation": "embaixo",
        "description": "A bolinha está embaixo da caixa.",
        "visualType": "under",
        "example": {
          "english": "The cat is under the table.",
          "portuguese": "O gato está embaixo da mesa."
        }
      },
      {
        "preposition": "behind",
        "translation": "atrás",
        "description": "A bolinha está atrás da caixa.",
        "visualType": "behind",
        "example": {
          "english": "The bag is behind the chair.",
          "portuguese": "A mochila está atrás da cadeira."
        }
      },
      {
        "preposition": "in front of",
        "translation": "na frente de",
        "description": "A bolinha está na frente da caixa.",
        "visualType": "in-front-of",
        "example": {
          "english": "The sofa is in front of the TV.",
          "portuguese": "O sofá está na frente da TV."
        }
      },
      {
        "preposition": "next to",
        "translation": "ao lado de",
        "description": "A bolinha está ao lado da caixa.",
        "visualType": "next-to",
        "example": {
          "english": "The lamp is next to the bed.",
          "portuguese": "O abajur está ao lado da cama."
        }
      },
      {
        "preposition": "near",
        "translation": "perto",
        "description": "A bolinha está perto da caixa.",
        "visualType": "near",
        "example": {
          "english": "The school is near the park.",
          "portuguese": "A escola fica perto do parque."
        }
      },
      {
        "preposition": "far from",
        "translation": "longe de",
        "description": "A bolinha está longe da caixa.",
        "visualType": "far-from",
        "example": {
          "english": "The hospital is far from my house.",
          "portuguese": "O hospital fica longe da minha casa."
        }
      },
      {
        "preposition": "between",
        "translation": "entre duas coisas",
        "description": "A bolinha está entre duas caixas.",
        "visualType": "between",
        "example": {
          "english": "The table is between the chairs.",
          "portuguese": "A mesa está entre as cadeiras."
        }
      },
      {
        "preposition": "above",
        "translation": "acima",
        "description": "A bolinha está acima da caixa.",
        "visualType": "above",
        "example": {
          "english": "The clock is above the door.",
          "portuguese": "O relógio está acima da porta."
        }
      },
      {
        "preposition": "below",
        "translation": "abaixo",
        "description": "A bolinha está abaixo da caixa.",
        "visualType": "below",
        "example": {
          "english": "The shelf is below the window.",
          "portuguese": "A prateleira está abaixo da janela."
        }
      }
    ],
    "examples": {
      "affirmative": [
        {
          "english": "The book is on the desk.",
          "portuguese": "O livro está em cima da escrivaninha."
        },
        {
          "english": "The cat is under the table.",
          "portuguese": "O gato está embaixo da mesa."
        },
        {
          "english": "The backpack is behind the chair.",
          "portuguese": "A mochila está atrás da cadeira."
        },
        {
          "english": "The sofa is in front of the TV.",
          "portuguese": "O sofá está na frente da TV."
        },
        {
          "english": "The lamp is next to the bed.",
          "portuguese": "O abajur está ao lado da cama."
        },
        {
          "english": "The keys are on the floor.",
          "portuguese": "As chaves estão no chão."
        },
        {
          "english": "The pictures are on the wall.",
          "portuguese": "Os quadros estão na parede."
        }
      ],
      "negative": [
        {
          "english": "The book isn't on the bed.",
          "portuguese": "O livro não está em cima da cama."
        },
        {
          "english": "The cat isn't under the sofa.",
          "portuguese": "O gato não está embaixo do sofá."
        },
        {
          "english": "The backpack isn't behind the door.",
          "portuguese": "A mochila não está atrás da porta."
        },
        {
          "english": "The keys aren't on the table.",
          "portuguese": "As chaves não estão em cima da mesa."
        },
        {
          "english": "The shoes aren't under the bed.",
          "portuguese": "Os sapatos não estão embaixo da cama."
        }
      ],
      "interrogative": [
        {
          "english": "Where is the book?",
          "portuguese": "Onde está o livro?"
        },
        {
          "english": "Where are the keys?",
          "portuguese": "Onde estão as chaves?"
        },
        {
          "english": "Is the book on the desk?",
          "portuguese": "O livro está em cima da escrivaninha?"
        },
        {
          "english": "Is the cat under the table?",
          "portuguese": "O gato está embaixo da mesa?"
        },
        {
          "english": "Are the keys on the floor?",
          "portuguese": "As chaves estão no chão?"
        },
        {
          "english": "Are the pictures on the wall?",
          "portuguese": "Os quadros estão na parede?"
        }
      ]
    },
    "shortAnswers": [
      {
        "question": "Is the book on the desk?",
        "yes": "Yes, it is.",
        "no": "No, it isn't."
      },
      {
        "question": "Is the cat under the table?",
        "yes": "Yes, it is.",
        "no": "No, it isn't."
      },
      {
        "question": "Are the keys on the floor?",
        "yes": "Yes, they are.",
        "no": "No, they aren't."
      },
      {
        "question": "Are the pictures on the wall?",
        "yes": "Yes, they are.",
        "no": "No, they aren't."
      }
    ],
    "extraSections": [
      {
        "title": "Expressões muito usadas",
        "paragraphs": [
          "Algumas expressões aparecem sempre do mesmo jeito."
        ],
        "examples": [
          {
            "english": "on the floor",
            "portuguese": "no chão"
          },
          {
            "english": "on the wall",
            "portuguese": "na parede"
          },
          {
            "english": "on the ceiling",
            "portuguese": "no teto"
          },
          {
            "english": "in bed",
            "portuguese": "na cama / deitado"
          },
          {
            "english": "at the door",
            "portuguese": "na porta"
          },
          {
            "english": "near the window",
            "portuguese": "perto da janela"
          }
        ]
      }
    ],
    "commonMistake": {
      "wrong": "The book is in the table.",
      "correct": "The book is on the table.",
      "note": "Cuidado: in, on e under mudam totalmente o lugar da coisa. Também lembre: uma coisa usa is / it is; duas ou mais coisas usam are / they are. Outro erro comum: The keys is on the floor. O certo é The keys are on the floor."
    }
  },
  {
    "id": "in-on-at-time",
    "title": "IN / ON / AT — Time",
    "summary": "Tempo: manhã, dias, meses e horários.",
    "explanation": [
      "IN, ON e AT podem ser usados para falar de tempo.",
      "A ideia simples é: IN = períodos maiores ou mais longos.",
      "ON = dias e datas.",
      "AT = horários e momentos bem específicos.",
      "Não tente decorar tudo de uma vez. Primeiro aprenda os exemplos mais comuns."
    ],
    "uses": [
      "falar sobre horários",
      "falar sobre dias",
      "falar sobre meses",
      "falar sobre anos",
      "falar sobre partes do dia",
      "falar sobre datas especiais"
    ],
    "structure": {
      "lines": [
        {
          "label": "Com IN",
          "text": "in + período maior"
        },
        {
          "label": "Com ON",
          "text": "on + dia ou data"
        },
        {
          "label": "Com AT",
          "text": "at + horário ou momento específico"
        }
      ]
    },
    "examples": {
      "affirmative": [
        {
          "english": "I wake up at 7 o'clock.",
          "portuguese": "Eu acordo às 7 horas."
        },
        {
          "english": "I study English in the evening.",
          "portuguese": "Eu estudo inglês à noite."
        },
        {
          "english": "My birthday is in July.",
          "portuguese": "Meu aniversário é em julho."
        },
        {
          "english": "We have class on Monday.",
          "portuguese": "Nós temos aula na segunda-feira."
        },
        {
          "english": "The party is on Saturday night.",
          "portuguese": "A festa é no sábado à noite."
        },
        {
          "english": "They travel in summer.",
          "portuguese": "Eles viajam no verão."
        }
      ],
      "negative": [
        {
          "english": "I don't wake up at 6 o'clock.",
          "portuguese": "Eu não acordo às 6 horas."
        },
        {
          "english": "She doesn't work on weekends.",
          "portuguese": "Ela não trabalha nos fins de semana."
        },
        {
          "english": "We don't travel in winter.",
          "portuguese": "Nós não viajamos no inverno."
        },
        {
          "english": "The class isn't at night.",
          "portuguese": "A aula não é à noite."
        }
      ],
      "interrogative": [
        {
          "english": "Do you study in the morning?",
          "portuguese": "Você estuda de manhã?"
        },
        {
          "english": "Do you work on weekends?",
          "portuguese": "Você trabalha nos fins de semana?"
        },
        {
          "english": "Is your class at night?",
          "portuguese": "Sua aula é à noite?"
        },
        {
          "english": "When is your birthday?",
          "portuguese": "Quando é seu aniversário?"
        },
        {
          "english": "What time is your class?",
          "portuguese": "A que horas é a sua aula?"
        }
      ]
    },
    "shortAnswers": [
      {
        "question": "Do you study in the morning?",
        "yes": "Yes, I do.",
        "no": "No, I don't."
      },
      {
        "question": "Do you work on weekends?",
        "yes": "Yes, I do.",
        "no": "No, I don't."
      },
      {
        "question": "Is your class at night?",
        "yes": "Yes, it is.",
        "no": "No, it isn't."
      }
    ],
    "extraSections": [
      {
        "title": "A regra simples",
        "paragraphs": [
          "Use IN para períodos maiores.",
          "Use ON para dias e datas.",
          "Use AT para horários e momentos específicos."
        ],
        "examples": [
          {
            "english": "in the morning",
            "portuguese": "de manhã"
          },
          {
            "english": "in January",
            "portuguese": "em janeiro"
          },
          {
            "english": "in 2024",
            "portuguese": "em 2024"
          },
          {
            "english": "on Monday",
            "portuguese": "na segunda-feira"
          },
          {
            "english": "on weekends",
            "portuguese": "nos fins de semana"
          },
          {
            "english": "on Saturday morning",
            "portuguese": "no sábado de manhã"
          },
          {
            "english": "at 7 o'clock",
            "portuguese": "às 7 horas"
          },
          {
            "english": "at night",
            "portuguese": "à noite"
          },
          {
            "english": "at noon",
            "portuguese": "ao meio-dia"
          }
        ]
      },
      {
        "title": "IN: períodos maiores",
        "paragraphs": [
          "Use IN com partes do dia, meses, anos, décadas, séculos e estações do ano."
        ],
        "examples": [
          {
            "english": "in the morning",
            "portuguese": "de manhã"
          },
          {
            "english": "in the afternoon",
            "portuguese": "à tarde"
          },
          {
            "english": "in the evening",
            "portuguese": "à noite / no início da noite"
          },
          {
            "english": "in January",
            "portuguese": "em janeiro"
          },
          {
            "english": "in 2024",
            "portuguese": "em 2024"
          },
          {
            "english": "in the 90s",
            "portuguese": "nos anos 90"
          },
          {
            "english": "in summer",
            "portuguese": "no verão"
          },
          {
            "english": "I study English in the evening.",
            "portuguese": "Eu estudo inglês à noite."
          },
          {
            "english": "My birthday is in July.",
            "portuguese": "Meu aniversário é em julho."
          },
          {
            "english": "We travel in summer.",
            "portuguese": "Nós viajamos no verão."
          }
        ]
      },
      {
        "title": "ON: dias e datas",
        "paragraphs": [
          "Use ON com dias da semana, datas, feriados com dia específico e partes específicas de um dia."
        ],
        "examples": [
          {
            "english": "on Monday",
            "portuguese": "na segunda-feira"
          },
          {
            "english": "on weekends",
            "portuguese": "nos fins de semana"
          },
          {
            "english": "on Saturday morning",
            "portuguese": "no sábado de manhã"
          },
          {
            "english": "on July 18th",
            "portuguese": "em 18 de julho"
          },
          {
            "english": "on Christmas Day",
            "portuguese": "no dia de Natal"
          },
          {
            "english": "on a day off",
            "portuguese": "em um dia de folga"
          },
          {
            "english": "I have English class on Monday.",
            "portuguese": "Eu tenho aula de inglês na segunda-feira."
          },
          {
            "english": "She works on weekends.",
            "portuguese": "Ela trabalha nos fins de semana."
          },
          {
            "english": "The party is on Saturday night.",
            "portuguese": "A festa é no sábado à noite."
          }
        ]
      },
      {
        "title": "AT: horários e momentos específicos",
        "paragraphs": [
          "Use AT com horários e alguns momentos específicos do dia."
        ],
        "examples": [
          {
            "english": "at 7 o'clock",
            "portuguese": "às 7 horas"
          },
          {
            "english": "at 6:30 pm",
            "portuguese": "às 18h30"
          },
          {
            "english": "at noon",
            "portuguese": "ao meio-dia"
          },
          {
            "english": "at midnight",
            "portuguese": "à meia-noite"
          },
          {
            "english": "at night",
            "portuguese": "à noite"
          },
          {
            "english": "at Christmas",
            "portuguese": "no Natal"
          },
          {
            "english": "I wake up at 7 o'clock.",
            "portuguese": "Eu acordo às 7 horas."
          },
          {
            "english": "My class starts at 6:30 pm.",
            "portuguese": "Minha aula começa às 18h30."
          },
          {
            "english": "We eat lunch at noon.",
            "portuguese": "Nós almoçamos ao meio-dia."
          }
        ]
      }
    ],
    "commonMistake": {
      "wrong": "I study on the morning.",
      "correct": "I study in the morning.",
      "note": "Lembre: IN para períodos maiores, ON para dias e datas, AT para horários específicos. Outros exemplos: My class is in Monday → My class is on Monday. I wake up in 7 o'clock → I wake up at 7 o'clock."
    }
  },
  {
    "id": "in-on-at-space",
    "title": "IN / ON / AT — Space",
    "summary": "Lugar: países, cômodos, superfícies e pontos específicos.",
    "explanation": [
      "IN, ON e AT também podem ser usados para falar de lugares.",
      "A ideia simples é: IN = dentro de um lugar ou área.",
      "ON = em cima de uma superfície.",
      "AT = em um ponto específico ou local específico.",
      "Essas regras ajudam muito, mas algumas expressões precisam ser aprendidas como frases prontas."
    ],
    "uses": [
      "dizer onde alguém está",
      "dizer onde algo está",
      "falar sobre países e cidades",
      "falar sobre cômodos da casa",
      "falar sobre superfícies",
      "falar sobre pontos específicos",
      "falar sobre local de trabalho ou estudo"
    ],
    "structure": {
      "lines": [
        {
          "label": "Com IN",
          "text": "in + área / país / cidade / cômodo / lugar fechado"
        },
        {
          "label": "Com ON",
          "text": "on + superfície / parede / chão / rua"
        },
        {
          "label": "Com AT",
          "text": "at + ponto específico / local específico"
        }
      ]
    },
    "examples": {
      "affirmative": [
        {
          "english": "I live in Brazil.",
          "portuguese": "Eu moro no Brasil."
        },
        {
          "english": "She is in the kitchen.",
          "portuguese": "Ela está na cozinha."
        },
        {
          "english": "The book is on the table.",
          "portuguese": "O livro está em cima da mesa."
        },
        {
          "english": "The picture is on the wall.",
          "portuguese": "O quadro está na parede."
        },
        {
          "english": "I am at home.",
          "portuguese": "Eu estou em casa."
        },
        {
          "english": "They are at the bus stop.",
          "portuguese": "Eles estão no ponto de ônibus."
        }
      ],
      "negative": [
        {
          "english": "I don't live in São Paulo.",
          "portuguese": "Eu não moro em São Paulo."
        },
        {
          "english": "She isn't in the kitchen.",
          "portuguese": "Ela não está na cozinha."
        },
        {
          "english": "The book isn't on the table.",
          "portuguese": "O livro não está em cima da mesa."
        },
        {
          "english": "The keys aren't on the floor.",
          "portuguese": "As chaves não estão no chão."
        },
        {
          "english": "I'm not at home.",
          "portuguese": "Eu não estou em casa."
        },
        {
          "english": "They aren't at the bus stop.",
          "portuguese": "Eles não estão no ponto de ônibus."
        }
      ],
      "interrogative": [
        {
          "english": "Do you live in Brazil?",
          "portuguese": "Você mora no Brasil?"
        },
        {
          "english": "Is she in the kitchen?",
          "portuguese": "Ela está na cozinha?"
        },
        {
          "english": "Is the book on the table?",
          "portuguese": "O livro está em cima da mesa?"
        },
        {
          "english": "Are the keys on the floor?",
          "portuguese": "As chaves estão no chão?"
        },
        {
          "english": "Are you at home?",
          "portuguese": "Você está em casa?"
        },
        {
          "english": "Are they at the bus stop?",
          "portuguese": "Eles estão no ponto de ônibus?"
        }
      ]
    },
    "shortAnswers": [
      {
        "question": "Do you live in Brazil?",
        "yes": "Yes, I do.",
        "no": "No, I don't."
      },
      {
        "question": "Is she in the kitchen?",
        "yes": "Yes, she is.",
        "no": "No, she isn't."
      },
      {
        "question": "Is the book on the table?",
        "yes": "Yes, it is.",
        "no": "No, it isn't."
      },
      {
        "question": "Are they at the bus stop?",
        "yes": "Yes, they are.",
        "no": "No, they aren't."
      }
    ],
    "extraSections": [
      {
        "title": "A regra simples",
        "paragraphs": [
          "Use IN quando a ideia é dentro de um lugar ou dentro de uma área.",
          "Use ON quando a ideia é em cima de uma superfície.",
          "Use AT quando a ideia é um ponto específico."
        ],
        "examples": [
          {
            "english": "in Brazil",
            "portuguese": "no Brasil"
          },
          {
            "english": "in the kitchen",
            "portuguese": "na cozinha"
          },
          {
            "english": "on the table",
            "portuguese": "em cima da mesa"
          },
          {
            "english": "on the wall",
            "portuguese": "na parede"
          },
          {
            "english": "at school",
            "portuguese": "na escola"
          },
          {
            "english": "at the bus stop",
            "portuguese": "no ponto de ônibus"
          }
        ]
      },
      {
        "title": "IN: dentro de um lugar ou área",
        "paragraphs": [
          "Use IN com países, cidades, bairros, cômodos e lugares onde a ideia é estar dentro."
        ],
        "examples": [
          {
            "english": "in Brazil",
            "portuguese": "no Brasil"
          },
          {
            "english": "in Dois Irmãos",
            "portuguese": "em Dois Irmãos"
          },
          {
            "english": "in the kitchen",
            "portuguese": "na cozinha"
          },
          {
            "english": "in the bedroom",
            "portuguese": "no quarto"
          },
          {
            "english": "in a school",
            "portuguese": "em uma escola"
          },
          {
            "english": "in a restaurant",
            "portuguese": "em um restaurante"
          },
          {
            "english": "I live in Brazil.",
            "portuguese": "Eu moro no Brasil."
          },
          {
            "english": "She is in the kitchen.",
            "portuguese": "Ela está na cozinha."
          },
          {
            "english": "They work in a restaurant.",
            "portuguese": "Eles trabalham em um restaurante."
          }
        ]
      },
      {
        "title": "ON: em uma superfície",
        "paragraphs": [
          "Use ON quando algo está em cima de uma superfície ou preso em uma superfície."
        ],
        "examples": [
          {
            "english": "on the table",
            "portuguese": "na mesa / em cima da mesa"
          },
          {
            "english": "on the floor",
            "portuguese": "no chão"
          },
          {
            "english": "on the wall",
            "portuguese": "na parede"
          },
          {
            "english": "on the ceiling",
            "portuguese": "no teto"
          },
          {
            "english": "on the TV stand",
            "portuguese": "no rack da TV"
          },
          {
            "english": "on the street",
            "portuguese": "na rua"
          },
          {
            "english": "The book is on the table.",
            "portuguese": "O livro está em cima da mesa."
          },
          {
            "english": "The picture is on the wall.",
            "portuguese": "O quadro está na parede."
          },
          {
            "english": "The keys are on the floor.",
            "portuguese": "As chaves estão no chão."
          }
        ]
      },
      {
        "title": "AT: ponto específico",
        "paragraphs": [
          "Use AT quando pensamos em um ponto específico, local específico ou nome de lugar."
        ],
        "examples": [
          {
            "english": "at school",
            "portuguese": "na escola"
          },
          {
            "english": "at home",
            "portuguese": "em casa"
          },
          {
            "english": "at work",
            "portuguese": "no trabalho"
          },
          {
            "english": "at the bus stop",
            "portuguese": "no ponto de ônibus"
          },
          {
            "english": "at the hospital",
            "portuguese": "no hospital"
          },
          {
            "english": "at Speak Up",
            "portuguese": "na Speak Up"
          },
          {
            "english": "I am at home.",
            "portuguese": "Eu estou em casa."
          },
          {
            "english": "She works at Speak Up.",
            "portuguese": "Ela trabalha na Speak Up."
          },
          {
            "english": "They are at the bus stop.",
            "portuguese": "Eles estão no ponto de ônibus."
          }
        ]
      },
      {
        "title": "IN ou AT?",
        "paragraphs": [
          "Às vezes, IN e AT podem parecer parecidos.",
          "Use IN quando você pensa dentro do lugar.",
          "Use AT quando você pensa no local como um ponto específico."
        ],
        "examples": [
          {
            "english": "I am in the school.",
            "portuguese": "Eu estou dentro da escola."
          },
          {
            "english": "I am at school.",
            "portuguese": "Eu estou na escola."
          },
          {
            "english": "She works in a hospital.",
            "portuguese": "Ela trabalha em um hospital."
          },
          {
            "english": "She is at the hospital.",
            "portuguese": "Ela está no hospital."
          }
        ]
      }
    ],
    "commonMistake": {
      "wrong": "I live at Brazil.",
      "correct": "I live in Brazil.",
      "note": "Lembre: IN = dentro de uma área ou lugar. ON = em cima de uma superfície. AT = ponto específico. Outros exemplos: The book is in the table → The book is on the table. I am in home → I am at home."
    }
  }
];
