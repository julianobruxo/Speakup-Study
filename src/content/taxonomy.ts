import type {
  GrammarTopic,
  IrregularVerbEntry,
  MvpGrammarDifficulty,
  VocabularyCategory,
  VocabularyGroup,
} from "./model/content";
import type {
  GrammarTopicId,
  VocabularyCategoryId,
  VocabularyEntryId,
  VocabularyGroupId,
} from "../shared/types/domain";

const MVP_GRAMMAR_DIFFICULTIES: MvpGrammarDifficulty[] = ["easy", "medium"];
const MVP_GRAMMAR_TARGETS = {
  easy: 50,
  medium: 80,
} as const;

export const ACTIVE_GRAMMAR_TOPICS: GrammarTopic[] = [
  grammarTopic("to_be_present", "Verbo TO BE - presente", 1),
  grammarTopic("to_be_past", "Verbo TO BE - passado", 2),
  grammarTopic("simple_present", "Simple Present", 3),
  grammarTopic("present_continuous", "Present Continuous", 4),
  grammarTopic("be_going_to", "Be Going To", 5),
  grammarTopic("simple_past", "Simple Past", 6),
  grammarTopic("there_is_there_are", "There Is / There Are", 7),
  grammarTopic("in_on_at", "In / On / At", 8),
];

export const ACTIVE_VOCABULARY_GROUPS: VocabularyGroup[] = [
  {
    id: "mvp_vocabulary",
    title: "Vocabulario",
    availabilityStatus: "planned",
    categories: ["body", "clothes", "furniture", "animals", "jobs", "places"],
  },
  {
    id: "mvp_verbs",
    title: "Verbos",
    availabilityStatus: "planned",
    categories: ["action_verbs", "routine_verbs", "irregular_verbs"],
  },
];

export const ACTIVE_VOCABULARY_CATEGORIES: VocabularyCategory[] = [
  category("body", "mvp_vocabulary", "Corpo"),
  category("clothes", "mvp_vocabulary", "Roupas"),
  category("furniture", "mvp_vocabulary", "Moveis"),
  category("animals", "mvp_vocabulary", "Animais"),
  category("jobs", "mvp_vocabulary", "Profissoes"),
  category("places", "mvp_vocabulary", "Lugares"),
  category("action_verbs", "mvp_verbs", "Action Verbs"),
  category("routine_verbs", "mvp_verbs", "Routine Verbs"),
  category("irregular_verbs", "mvp_verbs", "Irregular Verbs"),
];

export const IRREGULAR_VERB_PRACTICE_MODES = [
  "base_to_past",
  "base_to_participle",
  "past_to_base",
  "participle_to_base",
  "verb_to_translation",
  "translation_to_verb",
  "mixed",
] as const;

export const IRREGULAR_VERBS: IrregularVerbEntry[] = [
  irregularVerb("irregular_be", "be", "was/were", "been", "ser/estar"),
  irregularVerb("irregular_become", "become", "became", "become", "tornar-se"),
  irregularVerb("irregular_begin", "begin", "began", "begun", "comecar"),
  irregularVerb("irregular_break", "break", "broke", "broken", "quebrar"),
  irregularVerb("irregular_bring", "bring", "brought", "brought", "trazer"),
  irregularVerb("irregular_build", "build", "built", "built", "construir"),
  irregularVerb("irregular_buy", "buy", "bought", "bought", "comprar"),
  irregularVerb("irregular_catch", "catch", "caught", "caught", "pegar"),
  irregularVerb("irregular_choose", "choose", "chose", "chosen", "escolher"),
  irregularVerb("irregular_come", "come", "came", "come", "vir"),
  irregularVerb("irregular_cost", "cost", "cost", "cost", "custar"),
  irregularVerb("irregular_cut", "cut", "cut", "cut", "cortar"),
  irregularVerb("irregular_do", "do", "did", "done", "fazer"),
  irregularVerb("irregular_drink", "drink", "drank", "drunk", "beber"),
  irregularVerb("irregular_drive", "drive", "drove", "driven", "dirigir"),
  irregularVerb("irregular_eat", "eat", "ate", "eaten", "comer"),
  irregularVerb("irregular_fall", "fall", "fell", "fallen", "cair"),
  irregularVerb("irregular_feel", "feel", "felt", "felt", "sentir"),
  irregularVerb("irregular_find", "find", "found", "found", "encontrar"),
  irregularVerb("irregular_fly", "fly", "flew", "flown", "voar"),
  irregularVerb("irregular_forget", "forget", "forgot", "forgotten", "esquecer"),
  irregularVerb("irregular_get", "get", "got", "gotten", "conseguir"),
  irregularVerb("irregular_give", "give", "gave", "given", "dar"),
  irregularVerb("irregular_go", "go", "went", "gone", "ir"),
  irregularVerb("irregular_have", "have", "had", "had", "ter"),
  irregularVerb("irregular_hear", "hear", "heard", "heard", "ouvir"),
  irregularVerb("irregular_keep", "keep", "kept", "kept", "manter"),
  irregularVerb("irregular_know", "know", "knew", "known", "saber"),
  irregularVerb("irregular_leave", "leave", "left", "left", "sair"),
  irregularVerb("irregular_lose", "lose", "lost", "lost", "perder"),
  irregularVerb("irregular_make", "make", "made", "made", "fazer"),
  irregularVerb("irregular_meet", "meet", "met", "met", "encontrar"),
  irregularVerb("irregular_pay", "pay", "paid", "paid", "pagar"),
  irregularVerb("irregular_put", "put", "put", "put", "colocar"),
  irregularVerb("irregular_read", "read", "read", "read", "ler"),
  irregularVerb("irregular_run", "run", "ran", "run", "correr"),
  irregularVerb("irregular_say", "say", "said", "said", "dizer"),
  irregularVerb("irregular_see", "see", "saw", "seen", "ver"),
  irregularVerb("irregular_sell", "sell", "sold", "sold", "vender"),
  irregularVerb("irregular_send", "send", "sent", "sent", "enviar"),
  irregularVerb("irregular_sit", "sit", "sat", "sat", "sentar"),
  irregularVerb("irregular_sleep", "sleep", "slept", "slept", "dormir"),
  irregularVerb("irregular_speak", "speak", "spoke", "spoken", "falar"),
  irregularVerb("irregular_spend", "spend", "spent", "spent", "gastar"),
  irregularVerb("irregular_take", "take", "took", "taken", "pegar"),
  irregularVerb("irregular_teach", "teach", "taught", "taught", "ensinar"),
  irregularVerb("irregular_tell", "tell", "told", "told", "contar"),
  irregularVerb("irregular_think", "think", "thought", "thought", "pensar"),
  irregularVerb(
    "irregular_understand",
    "understand",
    "understood",
    "understood",
    "entender",
  ),
  irregularVerb("irregular_write", "write", "wrote", "written", "escrever"),
];

export function getGrammarTopicById(
  topicId: GrammarTopicId,
): GrammarTopic | undefined {
  return ACTIVE_GRAMMAR_TOPICS.find((topic) => topic.id === topicId);
}

export function getVocabularyGroupById(
  groupId: VocabularyGroupId,
): VocabularyGroup | undefined {
  return ACTIVE_VOCABULARY_GROUPS.find((group) => group.id === groupId);
}

export function getVocabularyCategoryById(
  categoryId: VocabularyCategoryId,
): VocabularyCategory | undefined {
  return ACTIVE_VOCABULARY_CATEGORIES.find(
    (category) => category.id === categoryId,
  );
}

export function getIrregularVerbById(
  entryId: VocabularyEntryId,
): IrregularVerbEntry | undefined {
  return IRREGULAR_VERBS.find((entry) => entry.id === entryId);
}

function grammarTopic(
  id: GrammarTopicId,
  title: string,
  sequence: number,
): GrammarTopic {
  return {
    id,
    title,
    sequence,
    entryLevel: "beginner",
    availableDifficulties: [...MVP_GRAMMAR_DIFFICULTIES],
    questionTargets: { ...MVP_GRAMMAR_TARGETS },
    availabilityStatus: "planned",
  };
}

function category(
  id: VocabularyCategoryId,
  groupId: VocabularyGroupId,
  title: string,
): VocabularyCategory {
  return {
    id,
    groupId,
    title,
    availabilityStatus: "planned",
  };
}

function irregularVerb(
  id: VocabularyEntryId,
  baseForm: string,
  simplePast: string,
  pastParticiple: string,
  translation: string,
): IrregularVerbEntry {
  return {
    id,
    baseForm,
    simplePast,
    pastParticiple,
    translation,
  };
}
