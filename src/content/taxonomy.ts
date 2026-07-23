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
  grammarTopic("present_tobe", "Verbo TO BE - presente", 1),
  grammarTopic("past_tobe", "Verbo TO BE - passado", 2),
  grammarTopic("simple_present", "Simple Present", 3),
  grammarTopic("present_continuous", "Present Continuous", 4),
  grammarTopic("be_going_to", "Be Going To", 5),
  grammarTopic("simple_past", "Simple Past", 6),
  grammarTopic("there_tobe", "There Is / There Are", 7),
  grammarTopic("prepositions", "In / On / At", 8),
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
  category("body", "mvp_vocabulary", "Corpo", "available"),
  category("clothes", "mvp_vocabulary", "Roupas", "available"),
  category("furniture", "mvp_vocabulary", "Moveis", "available"),
  category("animals", "mvp_vocabulary", "Animais", "available"),
  category("jobs", "mvp_vocabulary", "Profissoes", "available"),
  category("places", "mvp_vocabulary", "Lugares", "available"),
  category("action_verbs", "mvp_verbs", "Action Verbs", "available"),
  category("routine_verbs", "mvp_verbs", "Routine Verbs", "available"),
  category("irregular_verbs", "mvp_verbs", "Irregular Verbs", "available"),
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
  availabilityStatus: AvailabilityStatus = "planned",
): VocabularyCategory {
  return {
    id,
    groupId,
    title,
    availabilityStatus,
  };
}
