import type {
  BookFillInGapItem,
  BookGrammarExample,
  BookGrammarTopic,
  BookMultipleChoiceItem,
  BookWordScrambleItem,
} from "./types.ts";

function ex(en: string, pt: string): BookGrammarExample {
  return { en, pt };
}

function gap(
  id: string,
  sentence: string,
  options: string[],
  answer: string,
  explanation: string,
): BookFillInGapItem {
  return { id, sentence, options, answer, explanation };
}

function mc(
  id: string,
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  audioText?: string,
): BookMultipleChoiceItem {
  return {
    id,
    prompt,
    options,
    correctIndex,
    explanation,
    ...(audioText ? { audioText } : {}),
  };
}

function scramble(
  id: string,
  target: string,
  ptCue: string,
  explanation: string,
): BookWordScrambleItem {
  return {
    id,
    target,
    tokens: target.split(" "),
    ptCue,
    explanation,
  };
}

export const INTRO_GRAMMAR_TOPICS: BookGrammarTopic[] = [
  {
    id: "possessives-simple",
    order: 1,
    title: "Possessivos simples",
    summary: "Use my, your, his, her, our e their para dizer de quem algo é.",
    explanation: [
      "Quando você se apresenta ou fala sobre alguém, usa essas palavrinhas antes do substantivo: my name, your phone, his teacher, her friend.",
      "Em inglês, o possessivo combina com quem possui, e não com o objeto. Por isso, para um homem usamos his (his sister, his car) e para uma mulher usamos her (her brother, her bag).",
      "Para nós, use our; para eles ou elas, use their.",
    ],
    examples: [
      ex("My name is Carlos.", "Meu nome é Carlos."),
      ex("What is your last name?", "Qual é o seu sobrenome?"),
      ex("His teacher is from Canada.", "O professor dele é do Canadá."),
      ex("Her favorite color is blue.", "A cor favorita dela é azul."),
    ],
    fill_in_gaps: [
      gap("g1-gap-1", "Hi! ___ name is Julia.", ["My", "His", "Their"], "My", "Quando falamos de nós mesmos, usamos My."),
      gap("g1-gap-2", "This is Lucas. ___ email is lucas@mail.com.", ["His", "Her", "Our"], "His", "Lucas é masculino, então usamos His."),
      gap("g1-gap-3", "We are in Room 4. ___ teacher is Ms. Davis.", ["Our", "Your", "Her"], "Our", "Para 'nós' (we), o possessivo é Our."),
    ],
    multiple_choice: [
      mc("g1-mc-1", "Qual frase está correta para falar da bolsa da Ana?", ["His bag is on the desk.", "Her bag is on the desk.", "Their bag is on the desk."], 1, "Ana é feminino singular, então usamos Her.", "Her bag is on the desk."),
      mc("g1-mc-2", "Complete: 'They are students. ___ class is at 7:00.'", ["Our", "Their", "Your"], 1, "Para 'they', o possessivo correspondente é Their.", "Their class is at 7:00."),
      mc("g1-mc-3", "Qual pergunta pede o nome de uma colega?", ["What's his name?", "What's her name?", "What's our name?"], 1, "Para uma mulher, usamos her.", "What's her name?"),
    ],
    word_scramble: [
      scramble("g1-scr-1", "My name is Rafael.", "Meu nome é Rafael.", "O possessivo My vem logo antes de name."),
      scramble("g1-scr-2", "Her brother is a student.", "O irmão dela é estudante.", "Her combina com ela, mesmo antes de brother."),
      scramble("g1-scr-3", "Our English class is great.", "Nossa aula de inglês é ótima.", "Our abre o grupo nominal Our English class."),
    ],
  },
  {
    id: "to-be-intro",
    order: 2,
    title: "Verbo to be (apresentação inicial)",
    summary: "Use am, is e are para apresentar pessoas, lugares e estados.",
    explanation: [
      "O verbo to be significa ser ou estar e aparece o tempo todo em inglês. Sem ele, a frase fica incompleta.",
      "Guarde três combinações simples: I am (I'm), he/she/it is (he's, she's, it's) e you/we/they are (you're, we're, they're).",
      "Na conversa do dia a dia nos EUA, as contrações (I'm, she's, we're) soam muito naturais.",
    ],
    examples: [
      ex("I'm from Brazil.", "Eu sou do Brasil."),
      ex("She's a new student here.", "Ela é uma aluna nova aqui."),
      ex("We're in the same class.", "Nós estamos na mesma turma."),
      ex("They're very friendly.", "Eles são muito simpáticos."),
    ],
    fill_in_gaps: [
      gap("g2-gap-1", "I ___ happy to meet you.", ["am", "is", "are"], "am", "Com I, usamos sempre am."),
      gap("g2-gap-2", "Pedro ___ in my English class.", ["am", "is", "are"], "is", "Pedro equivale a he, então usamos is."),
      gap("g2-gap-3", "You and Maria ___ early today.", ["am", "is", "are"], "are", "Dois sujeitos no plural usam are."),
    ],
    multiple_choice: [
      mc("g2-mc-1", "Qual apresentação está natural e correta?", ["I is from Rio.", "I'm from Rio.", "I are from Rio."], 1, "I combina com am (I'm).", "I'm from Rio."),
      mc("g2-mc-2", "Escolha a forma correta para 'They':", ["They is teachers.", "They am teachers.", "They are teachers."], 2, "They usa are.", "They are teachers."),
      mc("g2-mc-3", "Qual é a negativa correta de 'He is late'?", ["He isn't late.", "He aren't late.", "He am not late."], 0, "A negativa de is é is not / isn't.", "He isn't late."),
    ],
    word_scramble: [
      scramble("g2-scr-1", "I am from Brazil.", "Eu sou do Brasil.", "Sujeito + am + complemento."),
      scramble("g2-scr-2", "She is my English teacher.", "Ela é minha professora de inglês.", "She + is + complemento."),
      scramble("g2-scr-3", "We are ready for class.", "Nós estamos prontos para a aula.", "We + are + adjetivo."),
    ],
  },
  {
    id: "articles",
    order: 3,
    title: "Artigos",
    summary: "Diferencie a, an e the na hora de falar de objetos e lugares.",
    explanation: [
      "Use a e an com um substantivo singular que você menciona pela primeira vez. A regra depende do som inicial da palavra seguinte: som de consoante usa a (a book, a university); som de vogal usa an (an apple, an hour).",
      "Use the quando você e a outra pessoa já sabem exatamente de qual item estão falando: 'the book on the desk'.",
      "Não use a ou an antes de palavras no plural.",
    ],
    examples: [
      ex("It's a notebook.", "É um caderno."),
      ex("She has an eraser in her bag.", "Ela tem uma borracha na bolsa."),
      ex("The pen is on the table.", "A caneta está em cima da mesa."),
      ex("He is an English teacher.", "Ele é um professor de inglês."),
    ],
    fill_in_gaps: [
      gap("g3-gap-1", "This is ___ umbrella.", ["a", "an", "the"], "an", "Umbrella começa com som de vogal: an umbrella."),
      gap("g3-gap-2", "I need ___ pen, please.", ["a", "an", "the"], "a", "Pen começa com som de consoante e é qualquer caneta: a pen."),
      gap("g3-gap-3", "Please close ___ door behind you.", ["a", "an", "the"], "the", "Falamos de uma porta específica: the door."),
    ],
    multiple_choice: [
      mc("g3-mc-1", "Qual opção usa o artigo corretamente?", ["a apple", "an apple", "an book"], 1, "Apple começa com som de vogal, então usa an.", "an apple"),
      mc("g3-mc-2", "Por que dizemos 'a backpack'?", ["Porque backpack é plural.", "Porque backpack começa com som de consoante.", "Porque backpack é específico."], 1, "Antes de som de consoante no singular, usamos a."),
      mc("g3-mc-3", "Complete: 'Where is ___ teacher?' (o nosso professor)", ["a", "an", "the"], 2, "Quando sabemos exatamente qual professor, usamos the.", "Where is the teacher?"),
    ],
    word_scramble: [
      scramble("g3-scr-1", "It is an orange backpack.", "É uma mochila laranja.", "An vem antes do som de vogal em orange."),
      scramble("g3-scr-2", "The book is very interesting.", "O livro é muito interessante.", "The marca um livro específico."),
      scramble("g3-scr-3", "She has a new laptop.", "Ela tem um notebook novo.", "A vem antes de new (som de consoante)."),
    ],
  },
  {
    id: "demonstratives",
    order: 4,
    title: "Demonstrativos",
    summary: "Aponte coisas perto ou longe usando this, that, these e those.",
    explanation: [
      "Pense em duas perguntas rápidas: está perto ou longe? É um ou mais de um?",
      "Perto de você: this (singular) e these (plural). Longe de você: that (singular) e those (plural).",
      "Lembre de combinar o verbo: this/that + is; these/those + are.",
    ],
    examples: [
      ex("This is my cell phone.", "Este é o meu celular."),
      ex("These are my keys.", "Estas são as minhas chaves."),
      ex("That is a nice jacket.", "Aquela é uma jaqueta legal."),
      ex("Those are our notebooks.", "Aqueles são os nossos cadernos."),
    ],
    fill_in_gaps: [
      gap("g4-gap-1", "___ is my new backpack right here.", ["This", "These", "Those"], "This", "Singular e perto de você: This."),
      gap("g4-gap-2", "___ are my glasses on my desk here.", ["This", "That", "These"], "These", "Plural e perto de você: These."),
      gap("g4-gap-3", "Look over there! ___ shoes are cool.", ["This", "Those", "These"], "Those", "Plural e longe ('over there'): Those."),
    ],
    multiple_choice: [
      mc("g4-mc-1", "Qual frase está correta?", ["This are my pens.", "These are my pens.", "That are my pens."], 1, "Pens é plural e combina com These are.", "These are my pens."),
      mc("g4-mc-2", "Para apontar uma mochila longe de você, use:", ["This backpack", "That backpack", "Those backpack"], 1, "Singular e longe usa That.", "That backpack"),
      mc("g4-mc-3", "Complete: 'What are ___?' (objetos perto da sua mão)", ["this", "that", "these"], 2, "Com are (plural) e perto, usamos these.", "What are these?"),
    ],
    word_scramble: [
      scramble("g4-scr-1", "This is my favorite shirt.", "Esta é minha camisa favorita.", "This + is para singular perto."),
      scramble("g4-scr-2", "Those are my blue sneakers.", "Aqueles são meus tênis azuis.", "Those + are para plural longe."),
      scramble("g4-scr-3", "Are these your house keys?", "Estas são as chaves da sua casa?", "Na pergunta, Are vem antes de these."),
    ],
  },
  {
    id: "plurals",
    order: 5,
    title: "Plurais",
    summary: "Forme plurais regulares (-s, -es, -ies) e irregulares frequentes.",
    explanation: [
      "Na maioria das palavras, basta colocar -s no final: book -> books, pen -> pens.",
      "Palavras terminadas em s, sh, ch, x ou z recebem -es: bus -> buses, watch -> watches, box -> boxes. Se terminar em consoante + y, troque por -ies: dictionary -> dictionaries.",
      "Alguns plurais comuns mudam de forma e vale memorizar: man -> men, woman -> women, child -> children, person -> people.",
    ],
    examples: [
      ex("I have two notebooks.", "Eu tenho dois cadernos."),
      ex("There are three watches on the shelf.", "Tem três relógios na prateleira."),
      ex("The children are at school.", "As crianças estão na escola."),
      ex("Many people live in this city.", "Muitas pessoas moram nesta cidade."),
    ],
    fill_in_gaps: [
      gap("g5-gap-1", "I have two ___ in my bag.", ["watchs", "watches", "watchies"], "watches", "Palavras terminadas em -ch recebem -es."),
      gap("g5-gap-2", "These ___ are from Japan.", ["citys", "cities", "cityes"], "cities", "Consoante + y muda para -ies: cities."),
      gap("g5-gap-3", "There are five ___ in the room.", ["person", "persons", "people"], "people", "O plural natural de person é people."),
    ],
    multiple_choice: [
      mc("g5-mc-1", "Qual é o plural correto de 'child'?", ["childs", "childes", "children"], 2, "Child tem plural irregular: children.", "children"),
      mc("g5-mc-2", "Qual palavra recebe apenas -s no plural?", ["box", "key", "bus"], 1, "Key termina em vogal + y, então apenas ganha -s (keys).", "keys"),
      mc("g5-mc-3", "Escolha a frase correta:", ["Two womans are here.", "Two women are here.", "Two woman are here."], 1, "Woman no plural é women.", "Two women are here."),
    ],
    word_scramble: [
      scramble("g5-scr-1", "The keys are on the table.", "As chaves estão em cima da mesa.", "Keys é o plural regular de key."),
      scramble("g5-scr-2", "Those boxes are very heavy.", "Aquelas caixas estão muito pesadas.", "Box termina em x e vira boxes."),
      scramble("g5-scr-3", "The students have new dictionaries.", "Os alunos têm dicionários novos.", "Dictionary vira dictionaries no plural."),
    ],
  },
  {
    id: "prepositions-of-place",
    order: 6,
    title: "Preposições de lugar simples",
    summary: "Diga onde objetos e pessoas estão com in, on, under, next to, in front of e behind.",
    explanation: [
      "Preposições de lugar funcionam como um mapa rápido na frase: in (dentro), on (em cima, encostado na superfície) e under (embaixo).",
      "Também usamos muito next to (ao lado de), in front of (na frente de) e behind (atrás de).",
      "Na fala do dia a dia, combine com the: 'on the desk', 'in the backpack', 'next to the bank'.",
    ],
    examples: [
      ex("My wallet is in my backpack.", "Minha carteira está dentro da mochila."),
      ex("The laptop is on the desk.", "O notebook está em cima da escrivaninha."),
      ex("The cat is under the chair.", "O gato está embaixo da cadeira."),
      ex("The pharmacy is next to the bank.", "A farmácia fica ao lado do banco."),
    ],
    fill_in_gaps: [
      gap("g6-gap-1", "Your keys are ___ the table.", ["in", "on", "under"], "on", "Sobre a superfície da mesa, usamos on."),
      gap("g6-gap-2", "My notebook is ___ my backpack.", ["in", "on", "behind"], "in", "Dentro da mochila, usamos in."),
      gap("g6-gap-3", "The bus stop is ___ the library.", ["in", "next to", "under"], "next to", "Para dizer ao lado de um lugar, usamos next to."),
    ],
    multiple_choice: [
      mc("g6-mc-1", "Onde fica 'under the bed'?", ["Em cima da cama", "Embaixo da cama", "Atrás da cama"], 1, "Under significa embaixo."),
      mc("g6-mc-2", "Complete: 'The dog is sleeping ___ the sofa.' (atrás)", ["behind", "in", "on"], 0, "Behind significa atrás de.", "The dog is sleeping behind the sofa."),
      mc("g6-mc-3", "Qual frase está mais natural?", ["The book is in the table.", "The book is on the table.", "The book is next the table."], 1, "Sobre a mesa é on the table (e next sempre pede to).", "The book is on the table."),
    ],
    word_scramble: [
      scramble("g6-scr-1", "The phone is on the desk.", "O telefone está em cima da mesa.", "On indica contato com a superfície."),
      scramble("g6-scr-2", "The bank is behind the park.", "O banco fica atrás do parque.", "Behind posiciona um lugar atrás do outro."),
      scramble("g6-scr-3", "My shoes are under the bed.", "Meus sapatos estão embaixo da cama.", "Under mostra que estão embaixo."),
    ],
  },
  {
    id: "to-be-wh-questions",
    order: 7,
    title: "Verbo to be 2 (com Wh-questions)",
    summary: "Faça perguntas abertas com What, Where, Who, How e When + verbo to be.",
    explanation: [
      "Para pedir informações específicas, coloque a palavra Wh- bem no começo, seguida de am/is/are e depois do sujeito: 'Where are you from?', 'Who is she?'.",
      "As mais usadas no início são What (o que/qual), Where (onde), Who (quem), How (como), How old (quantos anos) e When (quando).",
      "Em perguntas sobre idade, o inglês usa to be, e não have: 'How old are you?' -> 'I'm 22.'",
    ],
    examples: [
      ex("Where are you from?", "De onde você é?"),
      ex("Who is that man over there?", "Quem é aquele homem ali?"),
      ex("How old is your sister?", "Quantos anos tem sua irmã?"),
      ex("What's your city like?", "Como é a sua cidade?"),
    ],
    fill_in_gaps: [
      gap("g7-gap-1", "___ are you from? I'm from Mexico.", ["Who", "Where", "When"], "Where", "Where pergunta sobre lugar ou origem."),
      gap("g7-gap-2", "___ is your best friend? That's Leo.", ["Who", "What", "Where"], "Who", "Who pergunta sobre pessoas."),
      gap("g7-gap-3", "How old ___ your parents?", ["am", "is", "are"], "are", "Parents é plural, então usamos are."),
    ],
    multiple_choice: [
      mc("g7-mc-1", "Qual pergunta está na ordem correta?", ["Where you are from?", "Where are you from?", "Where is you from?"], 1, "Na pergunta com to be, are vem antes de you.", "Where are you from?"),
      mc("g7-mc-2", "Como perguntar a idade de alguém em inglês?", ["How many years do you have?", "How old are you?", "What old are you?"], 1, "Idade em inglês usa How old + be.", "How old are you?"),
      mc("g7-mc-3", "Qual resposta combina com 'What's Lima like?'", ["It's big and sunny.", "I'm from Lima.", "He's 20 years old."], 0, "'What's ... like?' pede uma descrição.", "It's big and sunny."),
    ],
    word_scramble: [
      scramble("g7-scr-1", "Where is your teacher from?", "De onde é seu professor?", "Wh- + is + sujeito + from?"),
      scramble("g7-scr-2", "Who are those two students?", "Quem são aqueles dois alunos?", "Who + are + sujeito plural."),
      scramble("g7-scr-3", "How old is your brother?", "Quantos anos tem seu irmão?", "How old + is + sujeito singular."),
    ],
  },
  {
    id: "possessives-whose",
    order: 8,
    title: "Possessivos e uso de whose",
    summary: "Pergunte de quem é com Whose e responda com 's ou mine, yours, his, hers, ours, theirs.",
    explanation: [
      "Para perguntar de quem é algum objeto, use Whose + objeto: 'Whose jacket is this?' ou 'Whose shoes are these?'.",
      "Você pode responder com 's depois do nome da pessoa (It's Ana's jacket) ou substituir o objeto usando pronomes possessivos sem substantivo depois: mine, yours, his, hers, ours, theirs.",
      "Compare: 'It's my coat' (com coat) vs. 'It's mine' (sozinho, sem repetir coat).",
    ],
    examples: [
      ex("Whose jacket is this?", "De quem é esta jaqueta?"),
      ex("It's Julia's jacket.", "É a jaqueta da Julia."),
      ex("Are these sneakers yours?", "Estes tênis são seus?"),
      ex("Yes, they're mine.", "Sim, eles são meus."),
    ],
    fill_in_gaps: [
      gap("g8-gap-1", "___ T-shirt is on the chair?", ["Who", "Whose", "Where"], "Whose", "Whose pergunta a quem pertence algo."),
      gap("g8-gap-2", "This is not my hat. It's ___.", ["your", "yours", "you"], "yours", "Sem substantivo depois, usamos o pronome possessivo yours."),
      gap("g8-gap-3", "That is ___ backpack.", ["Pedro", "Pedros", "Pedro's"], "Pedro's", "Usamos 's depois do nome para indicar posse."),
    ],
    multiple_choice: [
      mc("g8-mc-1", "Qual resposta evita repetir 'jeans' corretamente?", ["They're my.", "They're mine.", "They're me."], 1, "Mine substitui 'my jeans'.", "They're mine."),
      mc("g8-mc-2", "Escolha a pergunta correta para plural:", ["Whose socks is these?", "Whose socks are these?", "Who socks are these?"], 1, "Socks é plural, então usa Whose + socks + are these?", "Whose socks are these?"),
      mc("g8-mc-3", "Qual frase significa 'O casaco é dela'?", ["The coat is her.", "The coat is hers.", "The coat is she's."], 1, "Sem substantivo depois, usamos hers.", "The coat is hers."),
    ],
    word_scramble: [
      scramble("g8-scr-1", "Whose red jacket is this?", "De quem é esta jaqueta vermelha?", "Whose + substantivo + is this?"),
      scramble("g8-scr-2", "These black shoes are mine.", "Estes sapatos pretos são meus.", "Mine fecha a frase sem repetir shoes."),
      scramble("g8-scr-3", "That blue umbrella is Sara's.", "Aquele guarda-chuva azul é da Sara.", "Nome + 's indica posse."),
    ],
  },
  {
    id: "present-continuous",
    order: 9,
    title: "Present Continuous",
    summary: "Descreva o que está acontecendo agora com am/is/are + verbo-ing.",
    explanation: [
      "Quando a ação está acontecendo neste exato momento, use duas peças juntas: o verbo to be (am/is/are) + o verbo principal com -ing.",
      "Não esqueça do verbo to be! 'She working' fica incompleto; o certo é 'She is working'.",
      "Na negativa, coloque not no to be (isn't / aren't). Na pergunta, passe am/is/are para a frente do sujeito.",
    ],
    examples: [
      ex("I'm studying English right now.", "Eu estou estudando inglês agora mesmo."),
      ex("She's wearing a blue dress today.", "Ela está usando um vestido azul hoje."),
      ex("They aren't watching TV now.", "Eles não estão assistindo TV agora."),
      ex("What are you doing?", "O que você está fazendo?"),
    ],
    fill_in_gaps: [
      gap("g9-gap-1", "Look! It ___ outside.", ["rains", "is raining", "raining"], "is raining", "Ação acontecendo agora pede is + verbo-ing."),
      gap("g9-gap-2", "We ___ dinner in the kitchen right now.", ["are making", "making", "make"], "are making", "Com we agora, usamos are + making."),
      gap("g9-gap-3", "___ he talking on the phone?", ["Does", "Is", "Are"], "Is", "Perguntas no Present Continuous começam com Am/Is/Are."),
    ],
    multiple_choice: [
      mc("g9-mc-1", "Qual frase está completa e correta?", ["She reading a book now.", "She is reading a book now.", "She does reading a book now."], 1, "Present Continuous sempre precisa de am/is/are + -ing.", "She is reading a book now."),
      mc("g9-mc-2", "Qual negativa está correta?", ["They don't sleeping.", "They aren't sleeping.", "They isn't sleeping."], 1, "Negativa com they usa aren't + -ing.", "They aren't sleeping."),
      mc("g9-mc-3", "Escolha a escrita correta de 'run' com -ing:", ["runing", "running", "runnig"], 1, "Verbos curtos CVC como run dobram a consoante final: running.", "running"),
    ],
    word_scramble: [
      scramble("g9-scr-1", "She is wearing new sneakers.", "Ela está usando tênis novos.", "She + is + wearing + complemento."),
      scramble("g9-scr-2", "Are they studying for class?", "Eles estão estudando para a aula?", "Are vem antes de they na pergunta."),
      scramble("g9-scr-3", "I am not working today.", "Eu não estou trabalhando hoje.", "Am + not + verbo-ing."),
    ],
  },
  {
    id: "present-time-expressions",
    order: 10,
    title: "Expressões de tempo no presente",
    summary: "Combine horários, períodos do dia e dias da semana usando at, in, on e every.",
    explanation: [
      "Para falar de horários exatos e da palavra night, use at: at 7:00, at noon, at midnight, at night.",
      "Para períodos do dia, use in the: in the morning, in the afternoon, in the evening. Para dias da semana e fins de semana no inglês americano, use on: on Mondays, on weekdays, on weekends.",
      "Com every (every day, every morning), não colocamos preposição antes.",
    ],
    examples: [
      ex("I wake up at 6:30.", "Eu acordo às 6:30."),
      ex("She studies English in the evening.", "Ela estuda inglês à noite."),
      ex("We play soccer on weekends.", "Nós jogamos futebol nos fins de semana."),
      ex("He takes the bus every morning.", "Ele pega o ônibus toda manhã."),
    ],
    fill_in_gaps: [
      gap("g10-gap-1", "My class starts ___ 8:00.", ["in", "on", "at"], "at", "Horários exatos sempre usam at."),
      gap("g10-gap-2", "I work from home ___ Fridays.", ["in", "on", "at"], "on", "Dias da semana usam on."),
      gap("g10-gap-3", "She drinks coffee ___ the morning.", ["in", "on", "at"], "in", "Períodos do dia (morning/afternoon/evening) usam in the."),
    ],
    multiple_choice: [
      mc("g10-mc-1", "Qual expressão está correta no inglês americano?", ["in night", "at night", "on night"], 1, "Com night, a expressão fixa é at night.", "at night"),
      mc("g10-mc-2", "Escolha a frase sem erro de preposição:", ["I study on every day.", "I study in every day.", "I study every day."], 2, "Antes de every, não usamos preposição.", "I study every day."),
      mc("g10-mc-3", "Qual opção completa 'We relax ___ weekends' (en-US)?", ["on", "in", "at the"], 0, "Em inglês americano, usamos on weekends.", "We relax on weekends."),
    ],
    word_scramble: [
      scramble("g10-scr-1", "I get up at seven.", "Eu me levanto às sete.", "At vem antes do horário."),
      scramble("g10-scr-2", "We study English on Mondays.", "Nós estudamos inglês às segundas.", "On vem antes do dia da semana."),
      scramble("g10-scr-3", "She reads in the evening.", "Ela lê à noite.", "In the evening fecha a frase de rotina."),
    ],
  },
  {
    id: "simple-present",
    order: 11,
    title: "Simple Present",
    summary: "Fale de rotinas e hábitos dominando o -s em he/she/it e o uso de do/does.",
    explanation: [
      "Use o Simple Present para rotinas, hábitos e fatos do dia a dia. Com I, you, we e they, o verbo fica na forma base: 'I work', 'They live here'.",
      "Com he, she e it na afirmativa, o verbo ganha -s, -es ou -ies (works, watches, studies) e have vira has.",
      "Na negativa e na pergunta, entram don't/do (I/you/we/they) e doesn't/does (he/she/it) — e quando does/doesn't aparece, o verbo volta ao normal, sem -s!",
    ],
    examples: [
      ex("I take the subway to work.", "Eu pego o metrô para ir trabalhar."),
      ex("She walks to school every day.", "Ela vai a pé para a escola todo dia."),
      ex("He doesn't drive a car.", "Ele não dirige carro."),
      ex("Do you live with your parents?", "Você mora com seus pais?"),
    ],
    fill_in_gaps: [
      gap("g11-gap-1", "Ana ___ English on Tuesdays.", ["study", "studies", "studys"], "studies", "Com she na afirmativa, consoante + y muda para -ies."),
      gap("g11-gap-2", "My brother ___ coffee in the morning.", ["drink", "drinks", "drinking"], "drinks", "My brother (he) recebe -s na afirmativa."),
      gap("g11-gap-3", "He doesn't ___ on Sundays.", ["work", "works", "working"], "work", "Depois de doesn't, o verbo fica na forma base sem -s."),
    ],
    multiple_choice: [
      mc("g11-mc-1", "Qual frase está correta?", ["She have a bicycle.", "She has a bicycle.", "She haves a bicycle."], 1, "Have muda para has com he/she/it.", "She has a bicycle."),
      mc("g11-mc-2", "Escolha a pergunta correta:", ["Does he lives near here?", "Do he live near here?", "Does he live near here?"], 2, "Com he usamos Does e o verbo volta para live (sem -s).", "Does he live near here?"),
      mc("g11-mc-3", "Complete: 'They ___ take the bus.'", ["doesn't", "don't", "aren't"], 1, "Negativa de rotina com they usa don't.", "They don't take the bus."),
    ],
    word_scramble: [
      scramble("g11-scr-1", "She takes the bus daily.", "Ela pega o ônibus diariamente.", "She + takes (-s) + complemento."),
      scramble("g11-scr-2", "Do you live near downtown?", "Você mora perto do centro?", "Do + you + verbo base na pergunta."),
      scramble("g11-scr-3", "He doesn't eat meat.", "Ele não come carne.", "Doesn't + verbo base sem -s."),
    ],
  },
  {
    id: "there-is-there-are",
    order: 12,
    title: "There is / there are (there to be)",
    summary: "Diga o que existe em um lugar com there is, there are e respostas curtas.",
    explanation: [
      "Em português dizemos 'tem uma cadeira' ou 'tem dois quartos', mas em inglês NÃO usamos have para existência — usamos there is (singular ou incontável) e there are (plural).",
      "Na fala rápida, there is vira there's. Na negativa, usamos there isn't e there aren't any.",
      "Para perguntar, basta inverter: 'Is there a sofa?' -> 'Yes, there is.' / 'Are there any chairs?' -> 'No, there aren't.'",
    ],
    examples: [
      ex("There's a big sofa in the living room.", "Tem um sofá grande na sala de estar."),
      ex("There are two bedrooms in my apartment.", "Tem dois quartos no meu apartamento."),
      ex("There isn't any milk in the fridge.", "Não tem leite na geladeira."),
      ex("Are there any parks near here?", "Tem parques perto daqui?"),
    ],
    fill_in_gaps: [
      gap("g12-gap-1", "___ a lamp next to the bed.", ["There is", "There are", "It has"], "There is", "A lamp é singular: There is."),
      gap("g12-gap-2", "___ three chairs around the table.", ["There is", "There are", "Have"], "There are", "Three chairs é plural: There are."),
      gap("g12-gap-3", "___ any supermarkets on this street?", ["Is there", "Are there", "Do there"], "Are there", "Pergunta no plural usa Are there."),
    ],
    multiple_choice: [
      mc("g12-mc-1", "Qual frase está correta em inglês?", ["Have a bank near here.", "There is a bank near here.", "There are a bank near here."], 1, "Para dizer que algo existe, usamos There is.", "There is a bank near here."),
      mc("g12-mc-2", "Qual resposta curta combina com 'Is there a kitchen?'", ["Yes, there are.", "Yes, there is.", "Yes, it have."], 1, "Pergunta com Is there responde com Yes, there is.", "Yes, there is."),
      mc("g12-mc-3", "Complete: 'There ___ some water on the table.'", ["is", "are", "aren't"], 0, "Water é incontável e usa There is.", "There is some water on the table."),
    ],
    word_scramble: [
      scramble("g12-scr-1", "There is a nice park.", "Tem um parque legal.", "There + is + singular."),
      scramble("g12-scr-2", "There are two small bathrooms.", "Tem dois banheiros pequenos.", "There + are + plural."),
      scramble("g12-scr-3", "Is there a pharmacy nearby?", "Tem uma farmácia por perto?", "Is + there inicia a pergunta singular."),
    ],
  },
  {
    id: "some-and-any",
    order: 13,
    title: "Some e any",
    summary: "Use some em afirmativas e pedidos educados, e any em negativas e perguntas.",
    explanation: [
      "Quando você não quer dizer o número exato, use some ou any com plurais (some apples) e incontáveis (some water, some bread).",
      "Regra prática: some entra em frases afirmativas ('We have some cheese') e em ofertas ou pedidos educados ('Would you like some coffee?').",
      "Any entra em frases negativas ('We don't have any eggs') e na maioria das perguntas ('Do you have any rice?').",
    ],
    examples: [
      ex("We need some bread and some cheese.", "Nós precisamos de pão e queijo."),
      ex("There isn't any coffee left.", "Não sobrou café."),
      ex("Do you have any apples?", "Você tem maçãs?"),
      ex("Would you like some water?", "Você gostaria de um pouco de água?"),
    ],
    fill_in_gaps: [
      gap("g13-gap-1", "I'd like ___ salad, please.", ["some", "any", "a"], "some", "Em pedidos educados e afirmativas, usamos some."),
      gap("g13-gap-2", "We don't have ___ milk in the fridge.", ["some", "any", "an"], "any", "Em frases negativas, usamos any."),
      gap("g13-gap-3", "Are there ___ tomatoes in the kitchen?", ["some", "any", "a"], "any", "Em perguntas comuns de existência, usamos any."),
    ],
    multiple_choice: [
      mc("g13-mc-1", "Qual frase negativa está correta?", ["I don't want some rice.", "I don't want any rice.", "I don't want a rice."], 1, "Negativa com incontável usa any.", "I don't want any rice."),
      mc("g13-mc-2", "Quando usamos 'some' em uma pergunta?", ["Em qualquer pergunta.", "Em ofertas e pedidos educados (Would you like some...?).", "Nunca usamos some em perguntas."], 1, "Ofertas e pedidos educados usam some."),
      mc("g13-mc-3", "Complete: 'There are ___ oranges on the table.'", ["any", "some", "an"], 1, "Afirmativa no plural usa some.", "There are some oranges on the table."),
    ],
    word_scramble: [
      scramble("g13-scr-1", "We have some fresh bread.", "Nós temos pão fresco.", "Some em frase afirmativa."),
      scramble("g13-scr-2", "She doesn't want any coffee.", "Ela não quer café.", "Any em frase negativa."),
      scramble("g13-scr-3", "Do we need any chicken?", "Nós precisamos de frango?", "Any em pergunta geral."),
    ],
  },
  {
    id: "adverbs-of-frequency",
    order: 14,
    title: "Advérbios de frequência",
    summary: "Diga com que frequência faz algo com always, usually, often, sometimes, hardly ever e never.",
    explanation: [
      "Esses advérbios mostram a frequência da rotina: always (100%), usually, often, sometimes, hardly ever (quase nunca) e never (0%).",
      "A posição na frase é o segredo: eles ficam ANTES do verbo principal ('I always play soccer'), mas DEPOIS do verbo to be ('She is always on time').",
      "Com never e hardly ever, não use don't/doesn't junto: diga 'I never drink soda', e não 'I don't never drink'.",
    ],
    examples: [
      ex("I always play soccer on Saturdays.", "Eu sempre jogo futebol aos sábados."),
      ex("She usually goes running in the morning.", "Ela normalmente sai para correr de manhã."),
      ex("They are sometimes late for practice.", "Eles às vezes se atrasam para o treino."),
      ex("He never skips breakfast.", "Ele nunca pula o café da manhã."),
    ],
    fill_in_gaps: [
      gap("g14-gap-1", "I ___ watch basketball on TV.", ["always", "am always", "always am"], "always", "Antes do verbo principal watch, usamos apenas always."),
      gap("g14-gap-2", "She ___ tired after swimming.", ["is usually", "usually is", "usually"], "is usually", "Com o verbo to be, o advérbio vem depois de is."),
      gap("g14-gap-3", "We ___ go to the gym on Sundays.", ["hardly ever", "don't never", "never don't"], "hardly ever", "Hardly ever já tem sentido negativo, sem precisar de don't."),
    ],
    multiple_choice: [
      mc("g14-mc-1", "Qual frase coloca o advérbio no lugar certo?", ["I play always tennis.", "I always play tennis.", "Always I play tennis every."], 1, "O advérbio vem antes do verbo principal play.", "I always play tennis."),
      mc("g14-mc-2", "Qual frase está correta com o verbo to be?", ["He never is late.", "He is never late.", "He doesn't never late."], 1, "Depois de am/is/are, colocamos never.", "He is never late."),
      mc("g14-mc-3", "O que significa 'hardly ever'?", ["Sempre", "Quase nunca", "Todos os dias"], 1, "Hardly ever equivale a 'quase nunca'."),
    ],
    word_scramble: [
      scramble("g14-scr-1", "I usually play tennis here.", "Eu normalmente jogo tênis aqui.", "Usually vem antes de play."),
      scramble("g14-scr-2", "They are always very happy.", "Eles estão sempre muito felizes.", "Always vem depois de are."),
      scramble("g14-scr-3", "He never swims in winter.", "Ele nunca nada no inverno.", "Never vem antes de swims."),
    ],
  },
  {
    id: "can-ability-requests",
    order: 15,
    title: "Uso do can",
    summary: "Expresse habilidades, permissões e pedidos com can e can't.",
    explanation: [
      "Can é um verbo modal super amigável: ele não muda com he/she/it (nada de 'cans'!) e o verbo depois dele fica sempre na forma base, sem to ('She can swim').",
      "A negativa é can't (cannot). Na pergunta, basta jogar o Can para o início da frase: 'Can you speak French?' — nunca use do ou does com can.",
      "Além de habilidade, usamos can para pedir algo de forma direta e natural: 'Can you help me?'",
    ],
    examples: [
      ex("I can play the guitar.", "Eu sei tocar violão."),
      ex("She can't drive a car yet.", "Ela ainda não sabe dirigir carro."),
      ex("Can you swim well?", "Você sabe nadar bem?"),
      ex("Can you open the window, please?", "Você pode abrir a janela, por favor?"),
    ],
    fill_in_gaps: [
      gap("g15-gap-1", "Lucas ___ speak three languages.", ["can", "cans", "can to"], "can", "Can nunca ganha -s nem usa to antes do próximo verbo."),
      gap("g15-gap-2", "___ you cook Italian food?", ["Do can", "Can", "Are can"], "Can", "Perguntas com can começam direto com Can."),
      gap("g15-gap-3", "Sorry, I ___ come to the party tonight.", ["can't", "don't can", "not can"], "can't", "A negativa de can é can't."),
    ],
    multiple_choice: [
      mc("g15-mc-1", "Qual frase está correta?", ["He can to play soccer.", "He cans play soccer.", "He can play soccer."], 2, "Can + verbo base sem to e sem -s.", "He can play soccer."),
      mc("g15-mc-2", "Qual resposta curta combina com 'Can she sing?'", ["Yes, she does.", "Yes, she can.", "Yes, she is."], 1, "Pergunta com Can responde com can / can't.", "Yes, she can."),
      mc("g15-mc-3", "Escolha a pergunta correta:", ["Do you can swim?", "Can you swim?", "Can you to swim?"], 1, "Can vai direto antes do sujeito, sem do.", "Can you swim?"),
    ],
    word_scramble: [
      scramble("g15-scr-1", "She can speak English well.", "Ela sabe falar inglês bem.", "She + can + verbo base."),
      scramble("g15-scr-2", "Can you help me today?", "Você pode me ajudar hoje?", "Can + you + verbo base."),
      scramble("g15-scr-3", "They can't play volleyball here.", "Eles não podem jogar vôlei aqui.", "They + can't + verbo base."),
    ],
  },
  {
    id: "be-going-to",
    order: 16,
    title: "Be going to",
    summary: "Fale sobre planos futuros já decididos com am/is/are + going to + verbo base.",
    explanation: [
      "Quando você já tem um plano ou intenção para o futuro (feriados, fim de semana, férias), use am/is/are + going to + verbo na forma base.",
      "Não pule nenhuma peça: precisa do verbo to be (am/is/are), do going to e do verbo normal depois ('We are going to travel').",
      "Na negativa, negue o to be (isn't / aren't going to). Na pergunta, coloque am/is/are antes do sujeito ('Are you going to celebrate?').",
    ],
    examples: [
      ex("I'm going to visit my family on Christmas.", "Eu vou visitar minha família no Natal."),
      ex("She's going to bake a birthday cake.", "Ela vai fazer um bolo de aniversário."),
      ex("They aren't going to travel next week.", "Eles não vão viajar na semana que vem."),
      ex("What are you going to do on New Year's Day?", "O que você vai fazer no Ano Novo?"),
    ],
    fill_in_gaps: [
      gap("g16-gap-1", "We ___ going to have a barbecue.", ["am", "is", "are"], "are", "We combina com are going to."),
      gap("g16-gap-2", "She is going to ___ her friends tonight.", ["meet", "meets", "meeting"], "meet", "Depois de going to, o verbo fica sempre na forma base."),
      gap("g16-gap-3", "___ you going to travel in July?", ["Do", "Are", "Is"], "Are", "Pergunta com you usa Are antes do sujeito."),
    ],
    multiple_choice: [
      mc("g16-mc-1", "Qual frase está completa e correta?", ["I going to study tomorrow.", "I'm going to study tomorrow.", "I'm going study tomorrow."], 1, "Be going to precisa de am/is/are + going to + verbo base.", "I'm going to study tomorrow."),
      mc("g16-mc-2", "Escolha a negativa correta:", ["He isn't going to work.", "He doesn't going to work.", "He not going to work."], 0, "Negamos o verbo to be: isn't going to.", "He isn't going to work."),
      mc("g16-mc-3", "Complete: 'They are going to ___ a movie.'", ["watching", "watches", "watch"], 2, "Verbo base depois de going to: watch.", "They are going to watch a movie."),
    ],
    word_scramble: [
      scramble("g16-scr-1", "I am going to travel.", "Eu vou viajar.", "I + am + going to + verbo base."),
      scramble("g16-scr-2", "She is going to cook.", "Ela vai cozinhar.", "She + is + going to + verbo base."),
      scramble("g16-scr-3", "Are they going to celebrate?", "Eles vão comemorar?", "Are + they + going to + verbo base."),
    ],
  },
  {
    id: "simple-past",
    order: 17,
    title: "Simple Past",
    summary: "Conte o que já aconteceu usando verbos regulares (-ed), irregulares e did/didn't.",
    explanation: [
      "Use o Simple Past para ações que começaram e terminaram no passado (yesterday, last weekend, last night).",
      "Na afirmativa, verbos regulares ganham -ed (worked, watched, studied) e verbos irregulares mudam de forma (go -> went, see -> saw, eat -> ate).",
      "Na negativa e na pergunta, usamos didn't e did — e o verbo principal volta para a forma base ('I didn't go', 'Did you watch?').",
    ],
    examples: [
      ex("I watched a movie last night.", "Eu assisti a um filme ontem à noite."),
      ex("We went to the beach last weekend.", "Nós fomos à praia no fim de semana passado."),
      ex("She didn't buy new shoes yesterday.", "Ela não comprou sapatos novos ontem."),
      ex("Did you meet your friends on Sunday?", "Você encontrou seus amigos no domingo?"),
    ],
    fill_in_gaps: [
      gap("g17-gap-1", "I ___ to the park yesterday.", ["go", "went", "goed"], "went", "Go é irregular e vira went no passado."),
      gap("g17-gap-2", "She didn't ___ dinner last night.", ["cook", "cooked", "cooking"], "cook", "Depois de didn't, o verbo volta à forma base."),
      gap("g17-gap-3", "___ you study English yesterday?", ["Do", "Did", "Were"], "Did", "Perguntas no Simple Past com verbo de ação usam Did."),
    ],
    multiple_choice: [
      mc("g17-mc-1", "Qual frase está correta?", ["He didn't went home.", "He didn't go home.", "He doesn't went home."], 1, "Didn't já marca o passado; o verbo fica go.", "He didn't go home."),
      mc("g17-mc-2", "Escolha o passado correto de 'study':", ["studyed", "studied", "studyd"], 1, "Consoante + y muda para -ied: studied.", "studied"),
      mc("g17-mc-3", "Qual pergunta está correta?", ["Did she saw the movie?", "Did she see the movie?", "Saw she the movie?"], 1, "Did + sujeito + forma base (see).", "Did she see the movie?"),
    ],
    word_scramble: [
      scramble("g17-scr-1", "We watched a great movie.", "Nós assistimos a um ótimo filme.", "Sujeito + verbo regular no passado."),
      scramble("g17-scr-2", "She went shopping last Saturday.", "Ela foi fazer compras no sábado passado.", "Went é o passado irregular de go."),
      scramble("g17-scr-3", "Did you cook dinner yesterday?", "Você fez o jantar ontem?", "Did + sujeito + verbo base."),
    ],
  },
  {
    id: "object-pronouns",
    order: 18,
    title: "Pronomes de objeto",
    summary: "Use me, you, him, her, it, us e them depois de verbos e preposições.",
    explanation: [
      "Pronomes sujeito (I, he, she, we, they) fazem a ação e ficam antes do verbo. Pronomes de objeto (me, you, him, her, it, us, them) recebem a ação e ficam DEPOIS do verbo ou de uma preposição (to, with, for).",
      "Compare: 'He calls me' (ele me liga) vs. 'I call him' (eu ligo para ele). Não dizemos 'I call he' nem 'Come with we'.",
      "You e it mantêm a mesma forma tanto como sujeito quanto como objeto.",
    ],
    examples: [
      ex("Please call me tonight.", "Por favor, me ligue hoje à noite."),
      ex("I see him at school every day.", "Eu o vejo na escola todo dia."),
      ex("Can you help her with math?", "Você pode ajudá-la com matemática?"),
      ex("Come with us to the movies!", "Venha conosco ao cinema!"),
    ],
    fill_in_gaps: [
      gap("g18-gap-1", "Lucas is my friend. I study with ___.", ["he", "him", "his"], "him", "Depois da preposição with, usamos o pronome de objeto him."),
      gap("g18-gap-2", "We are going to the park. Come with ___!", ["we", "our", "us"], "us", "O pronome de objeto para 'nós' é us."),
      gap("g18-gap-3", "Those books are great. I love ___.", ["they", "them", "their"], "them", "Depois do verbo love, usamos them para plural."),
    ],
    multiple_choice: [
      mc("g18-mc-1", "Qual frase está correta?", ["She invited I to the party.", "She invited me to the party.", "She invited my to the party."], 1, "Depois do verbo invited, usamos me.", "She invited me to the party."),
      mc("g18-mc-2", "Complete: 'Ana is busy. Please text ___ later.'", ["she", "her", "hers"], 1, "Depois do verbo text, o objeto feminino é her.", "Please text her later."),
      mc("g18-mc-3", "Qual opção substitui 'the math homework'?", ["it", "them", "him"], 0, "Substantivo singular de coisa usa it.", "it"),
    ],
    word_scramble: [
      scramble("g18-scr-1", "Please call me tomorrow morning.", "Por favor, me ligue amanhã de manhã.", "Me vem logo depois do verbo call."),
      scramble("g18-scr-2", "I study English with them.", "Eu estudo inglês com eles.", "Them vem depois da preposição with."),
      scramble("g18-scr-3", "She helps us every week.", "Ela nos ajuda toda semana.", "Us é o pronome de objeto depois de helps."),
    ],
  },
];

export function getIntroGrammarTopic(topicId?: string): BookGrammarTopic | undefined {
  return INTRO_GRAMMAR_TOPICS.find((topic) => topic.id === topicId);
}
