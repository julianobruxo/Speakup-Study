export type GrammarCourseId =
  | "simple_present"
  | "present_continuous"
  | "be_going_to"
  | "there_tobe";

export type CourseLevel = 1 | 2 | 3 | 4 | 5;

export interface GrammarCourseQuestion {
  id: string;
  level: CourseLevel;
  prompt: string;
  kind: "choice" | "input";
  options?: [string, string, string];
  acceptedAnswers?: string[];
  answer: string;
  feedback: {
    correct: string;
    incorrect: string;
  };
}

export interface GrammarCourse {
  id: GrammarCourseId;
  title: string;
  shortTitle: string;
  summary: string;
  goal: string;
  accent: string;
  cambridgeUrl: string;
  levels: {
    level: CourseLevel;
    title: string;
    focus: string;
  }[];
  studySections: {
    title: string;
    explanation: string;
    formula: string;
    examples: string[];
    watchOut?: string;
  }[];
  questions: GrammarCourseQuestion[];
}

function question(
  id: string,
  level: CourseLevel,
  prompt: string,
  options: [string, string, string],
  answer: string,
  correct: string,
  incorrect: string,
): GrammarCourseQuestion {
  return {
    id,
    level,
    kind: "choice",
    prompt,
    options,
    answer,
    feedback: { correct, incorrect },
  };
}

function inputQuestion(
  id: string,
  level: CourseLevel,
  prompt: string,
  answer: string,
  acceptedAnswers: string[],
  correct: string,
  incorrect: string,
): GrammarCourseQuestion {
  return {
    id,
    level,
    kind: "input",
    prompt,
    answer,
    acceptedAnswers: [answer, ...acceptedAnswers],
    feedback: { correct, incorrect },
  };
}

const simplePresentQuestions: GrammarCourseQuestion[] = [
  question("sp-1-1", 1, "I ___ English every Tuesday.", ["study", "studies", "am studying"], "study", "Com I, usamos a forma base: study.", "Para uma rotina com I, use o verbo na forma base: study."),
  question("sp-1-2", 1, "We ___ breakfast at 7 a.m.", ["have", "has", "having"], "have", "We combina com have.", "Com we, o verbo fica na forma base: have."),
  question("sp-1-3", 1, "My friends ___ near the school.", ["live", "lives", "living"], "live", "My friends é plural, então usamos live.", "Sujeito no plural pede a forma base: live."),
  question("sp-1-4", 1, "Which sentence describes a routine?", ["I walk to work every day.", "I am walking to work now.", "I walked to work yesterday."], "I walk to work every day.", "Every day indica uma rotina no Simple Present.", "Procure a frase com hábito recorrente: every day."),

  question("sp-2-1", 2, "She ___ to music after class.", ["listens", "listen", "listenning"], "listens", "Com she, acrescentamos -s: listens.", "He, she e it normalmente recebem -s no verbo."),
  question("sp-2-2", 2, "Pedro ___ TV at night.", ["watches", "watchs", "watch"], "watches", "Watch termina em -ch, então recebe -es.", "Verbos terminados em -ch recebem -es: watches."),
  question("sp-2-3", 2, "My sister ___ English at school.", ["studies", "studys", "study"], "studies", "Consoante + y muda para -ies: studies.", "Em study, tiramos o y e acrescentamos -ies."),
  question("sp-2-4", 2, "The bus ___ at 8:15.", ["leaves", "leave", "is leave"], "leaves", "The bus equivale a it, por isso usamos leaves.", "Sujeito singular na terceira pessoa pede -s: leaves."),

  question("sp-3-1", 3, "I ___ coffee in the evening.", ["don't drink", "doesn't drink", "not drink"], "don't drink", "Com I, a negativa usa don't + verbo base.", "Use don't com I, you, we e they."),
  inputQuestion("sp-3-2", 3, "Reescreva na negativa: He works on Sundays.", "He doesn't work on Sundays.", ["He does not work on Sundays"], "Isso: doesn't + verbo base.", "Use He doesn't work on Sundays. Depois de doesn't, work fica na forma base."),
  question("sp-3-3", 3, "They ___ meat.", ["don't eat", "doesn't eat", "aren't eat"], "don't eat", "They usa don't + eat.", "No Simple Present, a negativa de they usa don't, não aren't."),
  question("sp-3-4", 3, "Marina ___ a car.", ["doesn't have", "doesn't has", "don't has"], "doesn't have", "A estrutura é doesn't + have.", "Depois de doesn't, use a forma base have."),

  question("sp-4-1", 4, "___ you play tennis?", ["Do", "Does", "Are"], "Do", "Perguntas com you começam com Do.", "Use Do com I, you, we e they."),
  question("sp-4-2", 4, "___ your brother live here?", ["Does", "Do", "Is"], "Does", "Your brother equivale a he: Does he live...?", "Com he, she ou it, a pergunta começa com Does."),
  inputQuestion("sp-4-3", 4, "Escreva a pergunta completa: where / Ana / work?", "Where does Ana work?", [], "A ordem está certa: question word + does + sujeito + verbo base.", "Use Where does Ana work? O verbo work fica na forma base depois de does."),
  question("sp-4-4", 4, "Choose the natural word order.", ["I usually study at night.", "I study usually at night.", "Usually I at night study."], "I usually study at night.", "Usually costuma vir antes do verbo principal.", "Com verbos principais, o advérbio de frequência normalmente vem antes do verbo."),

  question("sp-5-1", 5, "Lucas ___ English, but he ___ French.", ["speaks / doesn't speak", "speak / don't speak", "speaks / doesn't speaks"], "speaks / doesn't speak", "Afirmativa: speaks. Depois de doesn't: speak.", "O -s aparece na afirmativa, mas desaparece depois de doesn't."),
  question("sp-5-2", 5, "How often ___ your parents ___ abroad?", ["do / travel", "does / travel", "do / travels"], "do / travel", "Parents é plural: do + travel.", "Sujeito plural usa do e o verbo na forma base."),
  question("sp-5-3", 5, "Which sentence is correct?", ["The store opens at 9 tomorrow.", "The store open at 9 tomorrow.", "The store is open at 9 tomorrow every day."], "The store opens at 9 tomorrow.", "Horários programados podem usar Simple Present.", "The store equivale a it, então usamos opens."),
  inputQuestion("sp-5-4", 5, "Complete a frase inteira com live e stay: She ___ in Brazil, but this month she ___ in Canada.", "She lives in Brazil, but this month she is staying in Canada.", ["She lives in Brazil but this month she is staying in Canada", "She lives in Brazil, but this month she's staying in Canada", "She lives in Brazil but this month she's staying in Canada"], "Lives mostra a situação estável; is staying mostra algo temporário.", "Use She lives... para a situação estável e she is staying... para o período temporário."),
];

const presentContinuousQuestions: GrammarCourseQuestion[] = [
  question("pc-1-1", 1, "I ___ dinner right now.", ["am making", "is making", "make"], "am making", "I usa am + making.", "A estrutura é I am + verbo com -ing."),
  question("pc-1-2", 1, "The children ___ in the garden now.", ["are playing", "is playing", "play"], "are playing", "The children é plural: are playing.", "Sujeito plural usa are + -ing."),
  question("pc-1-3", 1, "She ___ to her teacher at the moment.", ["is talking", "are talking", "talks now"], "is talking", "She usa is + talking.", "Com she, he e it, usamos is + -ing."),
  question("pc-1-4", 1, "Which sentence means 'agora'?", ["We are studying now.", "We study every Monday.", "We studied last Monday."], "We are studying now.", "Are studying mostra uma ação em progresso agora.", "Now combina com am/is/are + verbo com -ing."),

  question("pc-2-1", 2, "Look! The dog is ___ after the ball.", ["running", "runing", "runs"], "running", "Run dobra a consoante final: running.", "Em run, dobramos o n antes de -ing."),
  question("pc-2-2", 2, "They are ___ a cake.", ["making", "makeing", "make"], "making", "Make perde o e antes de -ing: making.", "Verbo terminado em e geralmente perde o e: make → making."),
  question("pc-2-3", 2, "He is ___ on the floor.", ["lying", "lieing", "lie"], "lying", "Lie muda para lying.", "A forma -ing de lie é lying."),
  question("pc-2-4", 2, "We are ___ a new language.", ["studying", "studyng", "studing"], "studying", "Study mantém o y e recebe -ing.", "Com -ing, não trocamos o y: studying."),

  inputQuestion("pc-3-1", 3, "Reescreva na negativa: She is working today.", "She isn't working today.", ["She is not working today", "She's not working today"], "Isso: negamos o verbo be com isn't.", "Use She isn't working today. No Present Continuous, a negativa fica no verbo be."),
  question("pc-3-2", 3, "We ___ TV right now.", ["aren't watching", "don't watching", "isn't watching"], "aren't watching", "We usa aren't + watching.", "Com we, use are not / aren't."),
  question("pc-3-3", 3, "I ___ a jacket today.", ["am not wearing", "don't wearing", "isn't wearing"], "am not wearing", "Com I, usamos am not wearing.", "A negativa de I am é I am not."),
  question("pc-3-4", 3, "The computer ___ properly.", ["isn't working", "doesn't working", "aren't working"], "isn't working", "The computer equivale a it: isn't working.", "Sujeito singular usa isn't + -ing."),

  question("pc-4-1", 4, "___ you listening to me?", ["Are", "Do", "Is"], "Are", "A pergunta começa com Are you...?", "No Present Continuous, coloque am/is/are antes do sujeito."),
  inputQuestion("pc-4-2", 4, "Escreva a pergunta completa: what / they / do / now?", "What are they doing now?", [], "A ordem e a forma -ing estão corretas.", "Use What are they doing now? A pergunta começa com what + are + sujeito."),
  question("pc-4-3", 4, "Why ___ he laughing?", ["is", "does", "are"], "is", "He usa is: Why is he laughing?", "Depois de why, use is + he + verbo com -ing."),
  question("pc-4-4", 4, "Is Carla studying?", ["Yes, she is.", "Yes, she does.", "Yes, she studying."], "Yes, she is.", "A resposta curta repete o verbo be: Yes, she is.", "Pergunta com is recebe resposta curta com is."),

  question("pc-5-1", 5, "Choose the best sentence.", ["I understand the question now.", "I am understanding the question now.", "I understanding the question now."], "I understand the question now.", "Understand normalmente não é usado no continuous.", "Alguns verbos de estado, como understand, costumam usar Simple Present."),
  question("pc-5-2", 5, "This week, Marta ___ from home because her office is closed.", ["is working", "works always", "does working"], "is working", "This week indica uma situação temporária.", "Para algo temporário ao redor de agora, use is working."),
  question("pc-5-3", 5, "We ___ our teacher at 3 p.m. tomorrow. Everything is arranged.", ["are meeting", "meet every day", "are going meet"], "are meeting", "O Present Continuous pode indicar um compromisso já combinado.", "Para um arranjo futuro definido, am/is/are + -ing é natural."),
  inputQuestion("pc-5-4", 5, "Complete a frase inteira com drive e take: He usually ___, but today he ___ the bus.", "He usually drives, but today he is taking the bus.", ["He usually drives but today he is taking the bus", "He usually drives, but today he's taking the bus", "He usually drives but today he's taking the bus"], "Usually drives é hábito; today he is taking mostra uma situação temporária.", "Use He usually drives..., mas he is taking... para a situação de hoje."),
];

const beGoingToQuestions: GrammarCourseQuestion[] = [
  question("gt-1-1", 1, "I ___ study tonight.", ["am going to", "is going to", "going"], "am going to", "I usa am going to + verbo base.", "A estrutura completa é I am going to study."),
  question("gt-1-2", 1, "She ___ visit her grandmother this weekend.", ["is going to", "are going to", "going to"], "is going to", "She usa is going to.", "Com she, he e it, use is going to."),
  question("gt-1-3", 1, "We ___ cook at home tomorrow.", ["are going to", "is going to", "are going"], "are going to", "We usa are going to + cook.", "Não esqueça o to antes do verbo base."),
  question("gt-1-4", 1, "Choose the complete future form.", ["They are going to travel.", "They going to travel.", "They are going travel."], "They are going to travel.", "A forma completa tem are + going to + travel.", "A estrutura precisa do verbo be e também de to."),

  question("gt-2-1", 2, "My brother ___ a new course next month.", ["is going to start", "is going start", "going to starts"], "is going to start", "Depois de going to, usamos start na forma base.", "Use is going to + verbo base, sem -s."),
  question("gt-2-2", 2, "They bought paint. They ___ the kitchen.", ["are going to paint", "is going to paint", "are going to painting"], "are going to paint", "A compra da tinta mostra um plano já decidido.", "They pede are; depois de to, use paint."),
  question("gt-2-3", 2, "Look at those clouds! It ___.", ["is going to rain", "is going rain", "are going to rain"], "is going to rain", "As nuvens são uma evidência presente para a previsão.", "It usa is going to + rain."),
  question("gt-2-4", 2, "I saved enough money. I ___ a laptop.", ["am going to buy", "am going buy", "is going to buy"], "am going to buy", "A frase expressa uma intenção já planejada.", "I combina com am going to + buy."),

  inputQuestion("gt-3-1", 3, "Reescreva na negativa: We are going to stay out late tonight.", "We aren't going to stay out late tonight.", ["We are not going to stay out late tonight", "We're not going to stay out late tonight"], "Isso: a negativa fica no verbo be.", "Use We aren't going to stay out late tonight. Não use don't com going to."),
  question("gt-3-2", 3, "He ___ play football because his leg hurts.", ["isn't going to", "doesn't going to", "aren't going to"], "isn't going to", "He usa isn't going to + play.", "Não use doesn't com going to; negue o verbo be."),
  question("gt-3-3", 3, "I ___ take the car today.", ["am not going to", "don't going to", "am going not to"], "am not going to", "Com I, a negativa é am not going to.", "Not vem depois de am: I am not going to..."),
  question("gt-3-4", 3, "The shop ___ open tomorrow.", ["isn't going to", "doesn't going to", "not going to"], "isn't going to", "The shop equivale a it: isn't going to open.", "A frase precisa de isn't antes de going to."),

  question("gt-4-1", 4, "___ you going to call her?", ["Are", "Do", "Is"], "Are", "A pergunta começa com Are you going to...?", "Mova o verbo be para antes do sujeito."),
  inputQuestion("gt-4-2", 4, "Escreva a pergunta completa: what / he / cook?", "What is he going to cook?", ["What's he going to cook?"], "A estrutura completa está correta.", "Use What is he going to cook? Depois de going to, cook fica na forma base."),
  question("gt-4-3", 4, "___ they going to move?", ["When are", "When do", "When is"], "When are", "They usa are: When are they going to move?", "Em perguntas, use question word + are + they."),
  question("gt-4-4", 4, "Is Julia going to join us?", ["Yes, she is.", "Yes, she does.", "Yes, she going to."], "Yes, she is.", "A resposta curta repete is.", "Pergunta com Is recebe resposta curta com is."),

  question("gt-5-1", 5, "The glass is at the edge of the table. It ___.", ["is going to fall", "falls every day", "is fall going to"], "is going to fall", "Há evidência agora de que o copo vai cair.", "Use be going to para previsão baseada em evidência presente."),
  question("gt-5-2", 5, "We have tickets and a hotel reservation. We ___ to Recife in July.", ["are going to travel", "is going to travel", "are going to traveling"], "are going to travel", "Os preparativos mostram um plano já decidido.", "We usa are going to + verbo base travel."),
  inputQuestion("gt-5-3", 5, "Complete a frase inteira com be: She ___ a doctor.", "She is going to be a doctor.", ["She's going to be a doctor"], "Depois de going to, be fica na forma base.", "Use She is going to be a doctor: sujeito + is + going to + verbo base."),
  question("gt-5-4", 5, "Which question is correct?", ["What are you going to do after class?", "What do you going to do after class?", "What are you going do after class?"], "What are you going to do after class?", "A pergunta mantém going to + verbo base.", "Use What + are + you + going to + do."),
];

const thereToBeQuestions: GrammarCourseQuestion[] = [
  question("tb-1-1", 1, "___ a book on the desk.", ["There is", "There are", "It is"], "There is", "A book é singular: There is.", "Use There is para uma coisa no singular."),
  question("tb-1-2", 1, "___ three students in the room.", ["There are", "There is", "They are"], "There are", "Three students é plural: There are.", "Use There are com substantivos no plural."),
  question("tb-1-3", 1, "___ some milk in the fridge.", ["There is", "There are", "They are"], "There is", "Milk é incontável e combina com There is.", "Substantivos incontáveis, como milk, normalmente usam There is."),
  question("tb-1-4", 1, "Choose the sentence that says something exists.", ["There is a park near here.", "The park visits near here.", "It a park near here."], "There is a park near here.", "There is apresenta a existência do parque.", "Para dizer que algo existe ou está em um lugar, use there is/are."),

  question("tb-2-1", 2, "There is ___ orange in my bag.", ["an", "a", "two"], "an", "Orange começa com som de vogal: an orange.", "Use an antes de som de vogal; a não combina com esse som, e two exigiria there are."),
  question("tb-2-2", 2, "There are ___ chairs in the kitchen.", ["some", "a", "an"], "some", "Chairs é plural; some funciona aqui.", "A e an só acompanham substantivos contáveis no singular."),
  question("tb-2-3", 2, "There is ___ hospital called Saint Mary's near the station.", ["a", "an", "two"], "a", "Hospital começa com som de consoante: a hospital.", "Use a antes de som de consoante. An não combina com esse som, e two exigiria there are."),
  question("tb-2-4", 2, "There is ___ information on the website.", ["some", "an", "a"], "some", "Information é incontável, então não usamos a/an.", "Com substantivo incontável, use some em frases afirmativas."),

  inputQuestion("tb-3-1", 3, "Reescreva na negativa: There is a bank on this street.", "There isn't a bank on this street.", ["There is not a bank on this street", "There's not a bank on this street", "There is no bank on this street", "There's no bank on this street"], "A negativa singular está correta.", "Use There isn't a bank on this street. A negativa fica em is not / isn't."),
  question("tb-3-2", 3, "___ any clean glasses.", ["There aren't", "There isn't", "There don't"], "There aren't", "Glasses é plural: There aren't any.", "A negativa plural é There aren't."),
  question("tb-3-3", 3, "There ___ any sugar left.", ["isn't", "aren't", "doesn't"], "isn't", "Sugar é incontável e usa isn't.", "Substantivo incontável normalmente combina com there isn't."),
  question("tb-3-4", 3, "Choose the correct negative sentence.", ["There aren't any buses after midnight.", "There isn't any buses after midnight.", "There don't have buses after midnight."], "There aren't any buses after midnight.", "Buses é plural: aren't any buses.", "Faça a concordância com o substantivo plural buses."),

  inputQuestion("tb-4-1", 4, "Escreva a pergunta completa: a pharmacy / near here?", "Is there a pharmacy near here?", [], "A pergunta singular começa corretamente com Is there.", "Use Is there a pharmacy near here? Mova is para antes de there."),
  question("tb-4-2", 4, "___ any restaurants open now?", ["Are there", "Is there", "Do there"], "Are there", "Restaurants é plural: Are there...?", "Pergunta plural começa com Are there."),
  question("tb-4-3", 4, "Choose the correct short answer: Is there a bathroom upstairs?", ["Yes, there is.", "Yes, there are.", "Yes, there be."], "Yes, there is.", "A resposta curta singular é Yes, there is.", "A pergunta começa com Is there, então a resposta curta repete there is."),
  question("tb-4-4", 4, "Are there any questions?", ["No, there aren't.", "No, there isn't.", "No, they don't."], "No, there aren't.", "A resposta curta plural usa aren't.", "Repita there are/aren't na resposta curta."),

  inputQuestion("tb-5-1", 5, "Complete a frase inteira: ___ one sofa, but ___ two chairs.", "There is one sofa, but there are two chairs.", ["There is one sofa but there are two chairs", "There's one sofa, but there are two chairs", "There's one sofa but there are two chairs"], "One sofa é singular; two chairs é plural.", "Use There is one sofa, but there are two chairs."),
  question("tb-5-2", 5, "___ two chairs and a sofa in the living room.", ["There are", "There is", "It has"], "There are", "Two chairs é plural, então usamos There are.", "A expressão começa com o plural two chairs, então use There are."),
  question("tb-5-3", 5, "Choose the correct sentence.", ["There is a lot of traffic today.", "There are a lot of traffic today.", "There have a lot of traffic today."], "There is a lot of traffic today.", "Traffic é incontável e usa There is.", "Mesmo com a lot of, traffic continua incontável."),
  question("tb-5-4", 5, "Choose the natural question.", ["How many people are there in the class?", "How many people is there in the class?", "How much people are there in the class?"], "How many people are there in the class?", "People é plural e contável: How many ... are there?", "Use How many com contáveis no plural e are there."),
];

const commonLevels: GrammarCourse["levels"] = [
  { level: 1, title: "Reconhecer", focus: "Entenda a estrutura principal." },
  { level: 2, title: "Formar", focus: "Monte frases afirmativas com segurança." },
  { level: 3, title: "Negar", focus: "Pratique as formas negativas." },
  { level: 4, title: "Perguntar", focus: "Trabalhe perguntas e respostas curtas." },
  { level: 5, title: "Use in context (B1)", focus: "Choose the structure that fits the meaning in natural US English." },
];

export const GRAMMAR_COURSES: Record<GrammarCourseId, GrammarCourse> = {
  simple_present: {
    id: "simple_present",
    title: "Simple Present",
    shortTitle: "Simple Present",
    summary: "Fale sobre rotinas, hábitos, fatos gerais e horários.",
    goal: "Distinguir rotina de ação momentânea e usar do/does sem tropeçar no -s.",
    accent: "#1f6feb",
    cambridgeUrl: "https://dictionary.cambridge.org/us/dictionary/english/present-simple",
    levels: commonLevels,
    studySections: [
      {
        title: "Quando usar",
        explanation: "Use o Simple Present para hábitos, rotinas, fatos gerais e situações consideradas estáveis.",
        formula: "I / You / We / They + verbo base",
        examples: ["I study at night.", "They live in Brazil."],
        watchOut: "Palavras como usually, often, every day e on Mondays costumam sinalizar rotina.",
      },
      {
        title: "He, she e it",
        explanation: "Na afirmativa, a terceira pessoa do singular normalmente recebe -s. Alguns verbos recebem -es ou mudam -y para -ies.",
        formula: "He / She / It + verbo-s",
        examples: ["She works here.", "He watches TV.", "Ana studies English."],
        watchOut: "Have vira has. Depois de does ou doesn't, o verbo volta à forma base.",
      },
      {
        title: "Negativas",
        explanation: "Use don't com I, you, we e they. Use doesn't com he, she e it.",
        formula: "sujeito + don't / doesn't + verbo base",
        examples: ["We don't work on Sundays.", "He doesn't like coffee."],
        watchOut: "Evite doesn't likes. O auxiliar já carrega a marca da terceira pessoa.",
      },
      {
        title: "Perguntas",
        explanation: "Coloque do ou does antes do sujeito. O verbo principal continua na forma base.",
        formula: "Do / Does + sujeito + verbo base?",
        examples: ["Do you work here?", "Does she speak English?"],
        watchOut: "Com o verbo be, não usamos do/does: Is she tired?",
      },
    ],
    questions: simplePresentQuestions,
  },
  present_continuous: {
    id: "present_continuous",
    title: "Present Continuous",
    shortTitle: "Present Continuous",
    summary: "Descreva ações em progresso, situações temporárias e arranjos próximos.",
    goal: "Combinar am/is/are com a forma -ing e separar ação momentânea de rotina.",
    accent: "#7c3aed",
    cambridgeUrl: "https://dictionary.cambridge.org/us/dictionary/english/present-continuous",
    levels: commonLevels,
    studySections: [
      {
        title: "A estrutura",
        explanation: "O Present Continuous precisa de duas partes: o verbo be no presente e o verbo principal com -ing.",
        formula: "sujeito + am / is / are + verbo-ing",
        examples: ["I am reading.", "She is working.", "They are playing."],
        watchOut: "Sem am/is/are, a frase fica incompleta: She working não está correto.",
      },
      {
        title: "Quando usar",
        explanation: "Use para algo acontecendo agora, uma situação temporária ou uma mudança em andamento.",
        formula: "now / right now / at the moment / this week",
        examples: ["It is raining now.", "I am working from home this week."],
        watchOut: "Para hábitos recorrentes, normalmente usamos Simple Present.",
      },
      {
        title: "Negativas e perguntas",
        explanation: "Na negativa, acrescente not ao verbo be. Na pergunta, coloque am/is/are antes do sujeito.",
        formula: "isn't / aren't · Am / Is / Are + sujeito?",
        examples: ["He isn't sleeping.", "Are you listening?"],
        watchOut: "Não use do/does junto com verbo-ing nessa estrutura.",
      },
      {
        title: "Forma -ing e limites",
        explanation: "Alguns verbos mudam a escrita: make → making, run → running. Verbos de estado como know e understand normalmente ficam no Simple Present.",
        formula: "make → making · run → running · lie → lying",
        examples: ["She is making lunch.", "I understand the problem."],
        watchOut: "O Present Continuous também pode indicar um compromisso futuro já combinado: We are meeting tomorrow.",
      },
    ],
    questions: presentContinuousQuestions,
  },
  be_going_to: {
    id: "be_going_to",
    title: "Be Going To",
    shortTitle: "Be Going To",
    summary: "Fale sobre planos já decididos e previsões com evidência.",
    goal: "Usar am/is/are going to com o verbo base em afirmações, negativas e perguntas.",
    accent: "#c2410c",
    cambridgeUrl: "https://dictionary.cambridge.org/us/dictionary/english/be-going-to",
    levels: commonLevels,
    studySections: [
      {
        title: "A estrutura",
        explanation: "Be going to combina o verbo be com going to e um verbo principal na forma base.",
        formula: "sujeito + am / is / are + going to + verbo base",
        examples: ["I am going to study.", "They are going to travel."],
        watchOut: "Não retire o verbo be nem o to: They going travel está incompleto.",
      },
      {
        title: "Planos e intenções",
        explanation: "Use quando a decisão já foi tomada antes do momento da fala.",
        formula: "decisão anterior → be going to",
        examples: ["We are going to move next year.", "She is going to start a course."],
        watchOut: "Uma decisão tomada na hora costuma aparecer com will, conteúdo que pode ser estudado depois.",
      },
      {
        title: "Previsões com evidência",
        explanation: "Também usamos be going to quando vemos sinais agora de que algo provavelmente vai acontecer.",
        formula: "evidência agora → previsão",
        examples: ["Look at the clouds. It is going to rain.", "That glass is going to fall."],
        watchOut: "A evidência presente é a pista principal desse uso.",
      },
      {
        title: "Negativas e perguntas",
        explanation: "Negue o verbo be. Para perguntar, mova am/is/are para antes do sujeito.",
        formula: "isn't going to · Are + sujeito + going to...?",
        examples: ["He isn't going to drive.", "Are you going to call her?"],
        watchOut: "Depois de going to, use verbo base: going to start, não going to starts.",
      },
    ],
    questions: beGoingToQuestions,
  },
  there_tobe: {
    id: "there_tobe",
    title: "There Is / There Are",
    shortTitle: "There Is / Are",
    summary: "Diga que pessoas, objetos ou lugares existem e onde estão.",
    goal: "Fazer a concordância com singular, plural e substantivos incontáveis.",
    accent: "#0f766e",
    cambridgeUrl: "https://dictionary.cambridge.org/us/dictionary/english/there",
    levels: commonLevels,
    studySections: [
      {
        title: "Singular e plural",
        explanation: "Use there is com uma coisa no singular e there are com duas ou mais coisas.",
        formula: "There is + singular · There are + plural",
        examples: ["There is a bank nearby.", "There are two parks here."],
        watchOut: "There is pode virar there's. Na escrita cuidada, evite there's com plural.",
      },
      {
        title: "Incontáveis e quantidades",
        explanation: "Substantivos incontáveis, como water, information e traffic, normalmente usam there is.",
        formula: "There is + some + incontável",
        examples: ["There is some water.", "There is a lot of traffic."],
        watchOut: "Information não recebe -s e não usa a/an.",
      },
      {
        title: "Negativas",
        explanation: "Use there isn't com singular ou incontável e there aren't com plural. Any é comum nas negativas.",
        formula: "There isn't / aren't + any...",
        examples: ["There isn't any milk.", "There aren't any buses."],
        watchOut: "A concordância depende do substantivo que vem depois.",
      },
      {
        title: "Perguntas",
        explanation: "Mova is ou are para o começo e mantenha there depois do verbo.",
        formula: "Is there...? · Are there...?",
        examples: ["Is there a bathroom?", "Are there any questions?"],
        watchOut: "Respostas curtas repetem a estrutura: Yes, there is. No, there aren't.",
      },
    ],
    questions: thereToBeQuestions,
  },
};

export const GRAMMAR_COURSE_IDS = Object.keys(
  GRAMMAR_COURSES,
) as GrammarCourseId[];

export function getGrammarCourse(
  courseId: string | undefined,
): GrammarCourse | undefined {
  if (!courseId) return undefined;
  return GRAMMAR_COURSES[courseId as GrammarCourseId];
}
