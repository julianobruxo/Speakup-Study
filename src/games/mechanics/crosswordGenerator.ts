import type { CrosswordEntryChallenge } from "../core/challengeTypes";

export interface PlacedWord {
  challenge: CrosswordEntryChallenge;
  row: number;
  col: number;
  direction: "across" | "down";
}

export interface CrosswordGrid {
  width: number;
  height: number;
  placements: PlacedWord[];
}

/**
 * Deterministic crossword layout: places the first word across, then tries
 * to intersect each subsequent word on a shared letter. Words that cannot
 * intersect safely are skipped rather than forcing an invalid board —
 * the returned grid may contain fewer than `challenges.length` placements.
 */
export function generateCrossword(challenges: CrosswordEntryChallenge[]): CrosswordGrid {
  if (challenges.length === 0) return { width: 0, height: 0, placements: [] };

  const cells = new Map<string, string>();
  const placements: PlacedWord[] = [];

  function key(row: number, col: number) {
    return `${row},${col}`;
  }

  function canPlace(word: string, row: number, col: number, direction: "across" | "down"): boolean {
    for (let i = 0; i < word.length; i += 1) {
      const r = direction === "down" ? row + i : row;
      const c = direction === "across" ? col + i : col;
      const existing = cells.get(key(r, c));
      if (existing && existing !== word[i]) return false;
    }
    return true;
  }

  function place(challenge: CrosswordEntryChallenge, row: number, col: number, direction: "across" | "down") {
    const word = challenge.answer.toUpperCase();
    for (let i = 0; i < word.length; i += 1) {
      const r = direction === "down" ? row + i : row;
      const c = direction === "across" ? col + i : col;
      cells.set(key(r, c), word[i]);
    }
    placements.push({ challenge, row, col, direction });
  }

  const first = challenges[0];
  place(first, 0, 0, "across");

  for (const challenge of challenges.slice(1)) {
    const word = challenge.answer.toUpperCase();
    let placed = false;

    for (const existing of placements) {
      if (placed) break;
      const existingWord = existing.challenge.answer.toUpperCase();
      for (let e = 0; e < existingWord.length && !placed; e += 1) {
        for (let w = 0; w < word.length && !placed; w += 1) {
          if (existingWord[e] !== word[w]) continue;

          const direction = existing.direction === "across" ? "down" : "across";
          const row = existing.direction === "across" ? existing.row - w : existing.row + e;
          const col = existing.direction === "across" ? existing.col + e : existing.col - w;

          if (canPlace(word, row, col, direction)) {
            place(challenge, row, col, direction);
            placed = true;
          }
        }
      }
    }
  }

  const rows = placements.flatMap((p) =>
    p.direction === "down"
      ? [p.row, p.row + p.challenge.answer.length - 1]
      : [p.row],
  );
  const cols = placements.flatMap((p) =>
    p.direction === "across"
      ? [p.col, p.col + p.challenge.answer.length - 1]
      : [p.col],
  );
  const minRow = Math.min(...rows);
  const minCol = Math.min(...cols);
  const maxRow = Math.max(...rows);
  const maxCol = Math.max(...cols);

  const normalized = placements.map((p) => ({ ...p, row: p.row - minRow, col: p.col - minCol }));

  return {
    width: maxCol - minCol + 1,
    height: maxRow - minRow + 1,
    placements: normalized,
  };
}

