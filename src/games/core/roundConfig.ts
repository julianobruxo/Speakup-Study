import type { GameId } from "./catalog";

export interface RoundSizeConfig {
  count: number;
  label: string;
}

/** Central round-size defaults. Never hardcode these inside a game component. */
export const ROUND_SIZES: Record<GameId, RoundSizeConfig> = {
  sentence_builder: { count: 10, label: "10 frases" },
  error_hunt: { count: 10, label: "10 frases" },
  beat_the_clock: { count: 10, label: "10 desafios mistos" },
  sorting_station: { count: 12, label: "12 itens em 3 grupos" },
  secret_word: { count: 5, label: "5 palavras" },
  matching_pairs: { count: 6, label: "6 pares" },
  crossword: { count: 8, label: "até 8 palavras" },
  memory_match: { count: 6, label: "6 pares / 12 cartas" },
  listening_ear: { count: 10, label: "10 desafios" },
  bubble_shooter: { count: 6, label: "6 lançamentos" },
  word_slice: { count: 8, label: "8 cortes" },
  ninja: { count: 10, label: "10 placas em 5 fases" },
  solo_race: { count: 10, label: "10 portais" },
};

export const BEAT_THE_CLOCK_TIMERS_MS = {
  word: 10_000,
  sentenceTyping: 20_000,
  sentenceUnscramble: 10_000,
  errorHunt: 20_000,
} as const;

/** XP economy for games, kept separate from grammar/vocabulary XP and from in-game score. */
export const GAME_XP_RULES = {
  perCorrectChallenge: 5,
  perIncorrectChallenge: 0,
  perCompletedRound: 10,
  maxPerRound: 60,
} as const;

export function calculateRoundXp(correctCount: number, totalChallenges: number): number {
  const answerXp = correctCount * GAME_XP_RULES.perCorrectChallenge;
  const completionXp = totalChallenges > 0 ? GAME_XP_RULES.perCompletedRound : 0;
  return Math.min(GAME_XP_RULES.maxPerRound, answerXp + completionXp);
}
