export const NINJA_MAX_LIVES = 3;

export interface NinjaProgress {
  combo: number;
  gameOver: boolean;
  lives: number;
  score: number;
}

export function createNinjaProgress(): NinjaProgress {
  return {
    combo: 0,
    gameOver: false,
    lives: NINJA_MAX_LIVES,
    score: 0,
  };
}

export function settleNinjaProgress(
  current: NinjaProgress,
  correct: boolean,
  roundComplete: boolean,
): NinjaProgress {
  if (correct) {
    return {
      ...current,
      combo: current.combo + 1,
      gameOver: false,
      score: current.score + 100 + Math.min(current.combo, 4) * 25,
    };
  }

  const lives = Math.max(0, current.lives - 1);
  return {
    ...current,
    combo: 0,
    gameOver: lives === 0 && !roundComplete,
    lives,
  };
}

export function recoverNinjaProgress(current: NinjaProgress): NinjaProgress {
  return {
    ...current,
    combo: 0,
    gameOver: false,
    lives: NINJA_MAX_LIVES,
  };
}
