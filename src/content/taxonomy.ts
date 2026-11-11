import type {
  GrammarTopic,
  MvpGrammarDifficulty,
  VocabularyCategory,
  VocabularyGroup,
} from "./model/content";
import type {
  GrammarTopicId,
  AvailabilityStatus,
  VocabularyCategoryId,
  VocabularyGroupId,
} from "../shared/types/domain";

const MVP_GRAMMAR_DIFFICULTIES: MvpGrammarDifficulty[] = ["easy", "medium"];
const MVP_GRAMMAR_TARGETS = {
  easy: 50,
  medium: 80,
} as const;

export const ACTIVE_GRAMMAR_TOPICS: GrammarTopic[] = [
  grammarTopic(
    "present_tobe",
    "Verbo TO BE — presente",
    1,
    "Afirmações, negativas, perguntas e respostas curtas.",
  ),
  grammarTopic(
    "past_tobe",
    "Verbo TO BE — passado",
    2,
    "Was, were, negativas e perguntas no passado.",
  ),
  grammarTopic(
    "simple_present",
    "Simple Present",
    3,
    "Rotinas, hábitos e fatos gerais.",
  ),
  grammarTopic(
    "present_continuous",
    "Present Continuous",
    4,
    "Ações acontecendo agora ou planos próximos.",
  ),
  grammarTopic(
    "be_going_to",
    "Be Going To",
    5,
    "Planos e intenções para o futuro.",
  ),
  grammarTopic(
    "simple_past",
    "Simple Past",
    6,
    "Ações e fatos concluídos no passado.",
  ),
  grammarTopic(
    "there_tobe",
    "There Is / There Are",
    7,
    "Existência e quantidade de coisas e lugares.",
  ),
  grammarTopic(
    "prepositions",
    "In / On / At",
    8,
    "Preposições de tempo e lugar.",
  ),
];

export const ACTIVE_VOCABULARY_GROUPS: VocabularyGroup[] = [
  {
    id: "mvp_vocabulary",
    title: "Vocabulario",
    availabilityStatus: "available",
    categories: ["body", "clothes", "furniture", "animals", "jobs", "places"],
  },
  {
    id: "mvp_verbs",
    title: "Verbos",
    availabilityStatus: "available",
    categories: ["action_verbs", "routine_verbs", "irregular_verbs"],
  },
];

export const ACTIVE_VOCABULARY_CATEGORIES: VocabularyCategory[] = [
  category(
    "body",
    "mvp_vocabulary",
    "Corpo",
    "available",
    "Partes do corpo e cuidados pessoais",
  ),
  category(
    "clothes",
    "mvp_vocabulary",
    "Roupas",
    "available",
    "Roupas e acessórios do dia a dia",
  ),
  category(
    "furniture",
    "mvp_vocabulary",
    "Moveis",
    "available",
    "Móveis e objetos da casa",
  ),
  category(
    "animals",
    "mvp_vocabulary",
    "Animais",
    "available",
    "Animais comuns e natureza",
  ),
  category(
    "jobs",
    "mvp_vocabulary",
    "Profissoes",
    "available",
    "Profissões e locais de trabalho",
  ),
  category(
    "places",
    "mvp_vocabulary",
    "Lugares",
    "available",
    "Lugares da cidade",
  ),
  category(
    "action_verbs",
    "mvp_verbs",
    "Action Verbs",
    "available",
    "Ações simples e frequentes",
  ),
  category(
    "routine_verbs",
    "mvp_verbs",
    "Routine Verbs",
    "available",
    "Expressões da rotina diária",
  ),
  category(
    "irregular_verbs",
    "mvp_verbs",
    "Irregular Verbs",
    "available",
    "Base, passado e particípio",
  ),
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

function grammarTopic(
  id: GrammarTopicId,
  title: string,
  sequence: number,
  description: string,
): GrammarTopic {
  return {
    id,
    title,
    sequence,
    entryLevel: "beginner",
    availableDifficulties: [...MVP_GRAMMAR_DIFFICULTIES],
    questionTargets: { ...MVP_GRAMMAR_TARGETS },
    availabilityStatus: "planned",
    description,
  };
}

function category(
  id: VocabularyCategoryId,
  groupId: VocabularyGroupId,
  title: string,
  availabilityStatus: AvailabilityStatus = "planned",
  description?: string,
): VocabularyCategory {
  return {
    id,
    groupId,
    title,
    availabilityStatus,
    description,
  };
}

