import type { GrammarTopicId, VocabularyCategoryId } from "../../shared/types/domain";

export type GameId =
  | "sentence_builder"
  | "error_hunt"
  | "beat_the_clock"
  | "sorting_station"
  | "secret_word"
  | "matching_pairs"
  | "crossword"
  | "memory_match"
  | "listening_ear";

export type ContentDomain = "grammar" | "vocabulary";

export interface ContentSelector {
  domain: ContentDomain;
  grammarTopicId?: GrammarTopicId;
  vocabularyCategoryId?: VocabularyCategoryId;
}

export interface GameCatalogEntry {
  id: GameId;
  title: string;
  description: string;
  compatibleDomains: ContentDomain[];
  defaultRoundSize: number;
  supportsDragAndDrop: boolean;
}

export const GAME_CATALOG: GameCatalogEntry[] = [
  {
    id: "sentence_builder",
    title: "Monte a frase",
    description: "Organize as palavras na ordem certa para formar a frase correta.",
    compatibleDomains: ["grammar"],
    defaultRoundSize: 10,
    supportsDragAndDrop: true,
  },
  {
    id: "error_hunt",
    title: "Caça ao erro",
    description: "Encontre rapidamente o ponto incorreto da frase.",
    compatibleDomains: ["grammar"],
    defaultRoundSize: 10,
    supportsDragAndDrop: false,
  },
  {
    id: "beat_the_clock",
    title: "Contra o relógio",
    description: "Uma corrida com desafios mistos de gramática e vocabulário.",
    compatibleDomains: ["grammar", "vocabulary"],
    defaultRoundSize: 10,
    supportsDragAndDrop: true,
  },
  {
    id: "sorting_station",
    title: "Cada coisa no seu lugar",
    description: "Arraste cada palavra até a imagem correspondente.",
    compatibleDomains: ["vocabulary"],
    defaultRoundSize: 12,
    supportsDragAndDrop: true,
  },
  {
    id: "secret_word",
    title: "Palavra secreta",
    description: "Use a pista em português para descobrir a palavra em inglês.",
    compatibleDomains: ["vocabulary"],
    defaultRoundSize: 5,
    supportsDragAndDrop: false,
  },
  {
    id: "matching_pairs",
    title: "Conectando",
    description: "Associe a palavra em inglês à imagem correta.",
    compatibleDomains: ["vocabulary"],
    defaultRoundSize: 6,
    supportsDragAndDrop: false,
  },
  {
    id: "crossword",
    title: "Cruzando palavras",
    description: "Complete o quebra-cabeça de palavras cruzadas.",
    compatibleDomains: ["vocabulary"],
    defaultRoundSize: 8,
    supportsDragAndDrop: false,
  },
  {
    id: "memory_match",
    title: "Par perfeito",
    description: "Encontre os pares de cartas iguais.",
    compatibleDomains: ["vocabulary"],
    defaultRoundSize: 6,
    supportsDragAndDrop: false,
  },
  {
    id: "listening_ear",
    title: "Ouvido afiado",
    description: "Ouça e responda: selecione a imagem, digite a palavra ou monte a frase.",
    compatibleDomains: ["grammar", "vocabulary"],
    defaultRoundSize: 10,
    supportsDragAndDrop: false,
  },
];

export function getGameById(id: GameId): GameCatalogEntry | undefined {
  return GAME_CATALOG.find((game) => game.id === id);
}

/**
 * Content scope for the current rollout: only present_tobe (grammar) and
 * body (vocabulary) have complete banks/assets. Extending this array is how
 * later topics/categories become playable across every game.
 */
export const ROLLOUT_CONTENT: ContentSelector[] = [
  { domain: "grammar", grammarTopicId: "present_tobe" },
  { domain: "vocabulary", vocabularyCategoryId: "body" },
];

const COMPATIBILITY: Record<GameId, ContentSelector["domain"][]> = {
  sentence_builder: ["grammar"],
  error_hunt: ["grammar"],
  beat_the_clock: ["grammar", "vocabulary"],
  sorting_station: ["vocabulary"],
  secret_word: ["vocabulary"],
  matching_pairs: ["vocabulary"],
  crossword: ["vocabulary"],
  memory_match: ["vocabulary"],
  listening_ear: ["grammar", "vocabulary"],
};

export function isGameCompatibleWithContent(
  gameId: GameId,
  selector: ContentSelector,
): boolean {
  if (selector.domain === "grammar" && selector.grammarTopicId !== "present_tobe") {
    return false;
  }
  if (selector.domain === "vocabulary" && selector.vocabularyCategoryId !== "body") {
    return false;
  }
  return COMPATIBILITY[gameId].includes(selector.domain);
}

export function getCompatibleGames(selector: ContentSelector): GameCatalogEntry[] {
  return GAME_CATALOG.filter((game) => isGameCompatibleWithContent(game.id, selector));
}

export function getCompatibleContent(gameId: GameId): ContentSelector[] {
  return ROLLOUT_CONTENT.filter((selector) => isGameCompatibleWithContent(gameId, selector));
}

