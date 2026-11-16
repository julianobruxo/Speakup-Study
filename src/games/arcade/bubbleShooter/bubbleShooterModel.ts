import type { PreparedArcadeChallenge, PreparedArcadeRound } from "../bridge/arcadeBridge";

/**
 * Playable bubble colors. There is no neutral/white bubble: every bubble that
 * persists on the board carries a normal playable color and obeys the exact
 * same match, support, disconnection and drop rules.
 */
export type BubbleColor = "cyan" | "violet" | "wine";

/**
 * A word bonus is a normal bubble with extra metadata. It occupies a real hex
 * cell, participates in match-3, supports and is supported by neighbours, and
 * falls when it loses its path to the ceiling. It is never immune.
 */
export type BubbleRole = "normal" | "wordBonus";

export interface BubbleCell {
  color: BubbleColor;
  column: number;
  /** Vocabulary entry id, only present on word bonus bubbles. */
  contentId?: string;
  id: string;
  /** English label rendered inside a word bonus bubble. */
  label?: string;
  role: BubbleRole;
  row: number;
}

export interface BubblePoint {
  x: number;
  y: number;
}

export const PLAYABLE_COLORS: BubbleColor[] = ["cyan", "violet", "wine"];

export const GRID_COLS = 9;
export const INITIAL_FILL_ROWS = 5;
/** A bubble occupying this row (or below) ends the round. */
export const DEFEAT_ROW = 9;
export const DANGER_ROW = 8;
/** Shots that fail to clear a group before a new ceiling row is pushed in. */
export const MISSES_BEFORE_NEW_ROW = 5;
/** Word bonus bubbles that should coexist on the board. */
export const TARGET_WORD_COUNT = 6;
export const MIN_WORD_COUNT = 4;
/** Rows rebuilt at once when a cleared board still owes the learner words. */
export const WAVE_ROWS = 4;
/** Below this many occupied rows the board is too sparse to stay playable. */
export const MIN_PLAYABLE_ROWS = 2;
/** Rows the board is topped back up to when it falls below the minimum. */
export const TARGET_PLAYABLE_ROWS = 3;

/** Distinct rows currently holding at least one bubble. */
export function countOccupiedRows(board: BubbleCell[]): number {
  return new Set(board.map((bubble) => bubble.row)).size;
}

/**
 * A sparse board with words still owed cannot be left as-is: the learner would
 * have nothing to shoot at. Words are only ever restored structurally, inside
 * connected rows — never by loading content into the shooter.
 */
export function needsDensityTopUp(
  board: BubbleCell[],
  pendingWords: number,
  objectiveOnBoard: boolean,
): boolean {
  if (pendingWords === 0 && objectiveOnBoard) return false;
  if (!objectiveOnBoard) return true;
  return countOccupiedRows(board) < MIN_PLAYABLE_ROWS;
}

export type RandomSource = () => number;

export function createSeededRandom(seed: number): RandomSource {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function columnsForRow(row: number): number {
  return row % 2 === 0 ? GRID_COLS : GRID_COLS - 1;
}

export function getHexNeighbors(
  row: number,
  column: number,
): { row: number; column: number }[] {
  const diagonals = row % 2 === 0 ? [-1, 0] : [0, 1];
  return [
    { row, column: column - 1 },
    { row, column: column + 1 },
    { row: row - 1, column: column + diagonals[0] },
    { row: row - 1, column: column + diagonals[1] },
    { row: row + 1, column: column + diagonals[0] },
    { row: row + 1, column: column + diagonals[1] },
  ];
}

export function getHexCellCenter(row: number, column: number): BubblePoint {
  return {
    x: 1 + column * 2 + (row % 2 === 0 ? 0 : 1),
    y: row * Math.sqrt(3),
  };
}

export function isValidCell(row: number, column: number): boolean {
  return row >= 0 && column >= 0 && column < columnsForRow(row);
}

function positionKey(row: number, column: number): string {
  return `${row}:${column}`;
}

function createPositionMap(board: BubbleCell[]): Map<string, BubbleCell> {
  return new Map(board.map((bubble) => [positionKey(bubble.row, bubble.column), bubble]));
}

/* ── colour queue ── */

/**
 * Colors still present on the board. The launcher queue may only ever offer
 * these, so an eliminated color can never be dealt and a shot can always,
 * in principle, find a matching partner.
 */
export function getActiveColors(board: BubbleCell[]): BubbleColor[] {
  const present = new Set(board.map((bubble) => bubble.color));
  return PLAYABLE_COLORS.filter((color) => present.has(color));
}

export function pickQueueColor(
  board: BubbleCell[],
  random: RandomSource,
): BubbleColor | null {
  const active = getActiveColors(board);
  if (active.length === 0) return null;
  return active[Math.min(active.length - 1, Math.floor(random() * active.length))];
}

/* ── connectivity ── */

export function findSameColorGroup(board: BubbleCell[], startId: string): string[] {
  const start = board.find((bubble) => bubble.id === startId);
  if (!start) return [];
  const byPosition = createPositionMap(board);
  const visited = new Set<string>();
  const pending = [start];

  while (pending.length > 0) {
    const bubble = pending.pop()!;
    if (visited.has(bubble.id) || bubble.color !== start.color) continue;
    visited.add(bubble.id);
    for (const neighbor of getHexNeighbors(bubble.row, bubble.column)) {
      const next = byPosition.get(positionKey(neighbor.row, neighbor.column));
      if (next && !visited.has(next.id)) pending.push(next);
    }
  }

  return [...visited];
}

/**
 * Any bubble without a neighbour path to row 0 is unsupported and must fall.
 * Word bonus bubbles are included with no exception whatsoever.
 */
export function findDisconnectedBubbleIds(board: BubbleCell[]): string[] {
  const byPosition = createPositionMap(board);
  const connected = new Set<string>();
  const pending = board.filter((bubble) => bubble.row === 0);

  while (pending.length > 0) {
    const bubble = pending.pop()!;
    if (connected.has(bubble.id)) continue;
    connected.add(bubble.id);
    for (const neighbor of getHexNeighbors(bubble.row, bubble.column)) {
      const next = byPosition.get(positionKey(neighbor.row, neighbor.column));
      if (next && !connected.has(next.id)) pending.push(next);
    }
  }

  return board.filter((bubble) => !connected.has(bubble.id)).map((bubble) => bubble.id);
}

/* ── board creation ── */

export interface BoardCreationResult {
  board: BubbleCell[];
  /** Content ids placed on the board, in board order. */
  placedContentIds: string[];
}

/**
 * Builds the persistent starting board. Word bonus bubbles replace ordinary
 * bubbles in already-connected cells, spread across multiple rows and colors,
 * so nothing about a word's position, color or size reveals the answer.
 */
export function createInitialBoard(
  round: PreparedArcadeRound,
  seed: number,
): BoardCreationResult {
  const random = createSeededRandom(seed);
  const board: BubbleCell[] = [];

  for (let row = 0; row < INITIAL_FILL_ROWS; row++) {
    const cols = columnsForRow(row);
    for (let column = 0; column < cols; column++) {
      board.push({
        color: PLAYABLE_COLORS[Math.floor(random() * PLAYABLE_COLORS.length)],
        column,
        id: `bubble:${row}:${column}`,
        role: "normal",
        row,
      });
    }
  }

  const wordEntries = collectRoundWords(round).slice(0, TARGET_WORD_COUNT);
  const placedContentIds = assignWordBubbles(board, wordEntries, random);

  return { board, placedContentIds };
}

export interface RoundWord {
  challengeId: string;
  contentId: string;
  label: string;
}

/** The correct English word of every challenge, in round order. */
export function collectRoundWords(round: PreparedArcadeRound): RoundWord[] {
  const words: RoundWord[] = [];
  for (const challenge of round.challenges) {
    const choice = challenge.choices.find((item) => item.id === challenge.correctChoiceId);
    if (!choice) continue;
    words.push({
      challengeId: challenge.id,
      contentId: choice.id,
      label: choice.label,
    });
  }
  return words;
}

/**
 * Converts existing, already-connected bubbles into word bonus bubbles.
 * Candidate cells are spread over the lower rows and shuffled deterministically,
 * so words never form an artificial answer row and keep their host cell's color.
 */
function assignWordBubbles(
  board: BubbleCell[],
  words: RoundWord[],
  random: RandomSource,
): string[] {
  if (words.length === 0) return [];

  const candidates = board.filter(
    (bubble) => bubble.role === "normal" && bubble.row >= 1,
  );
  shuffleInPlace(candidates, random);

  const placed: string[] = [];
  const usedRows = new Map<number, number>();
  const maxPerRow = Math.max(2, Math.ceil(words.length / 2));

  for (const word of words) {
    const cell = candidates.find((candidate) => {
      if (candidate.role !== "normal") return false;
      return (usedRows.get(candidate.row) ?? 0) < maxPerRow;
    });
    if (!cell) break;
    cell.role = "wordBonus";
    cell.contentId = word.contentId;
    cell.label = word.label;
    cell.id = `word:${word.contentId}`;
    usedRows.set(cell.row, (usedRows.get(cell.row) ?? 0) + 1);
    placed.push(word.contentId);
  }

  return placed;
}

function shuffleInPlace<T>(items: T[], random: RandomSource): T[] {
  for (let index = items.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items;
}

/* ── shot resolution ── */

export interface CollectedWord {
  contentId: string;
  label: string;
  /** How the word left the board. Direct contact never collects. */
  via: "match" | "drop";
}

export interface BubbleShotResolution {
  /** Board immediately after the shot snapped, before removals. */
  boardWithShot: BubbleCell[];
  collectedWords: CollectedWord[];
  disconnectedIds: string[];
  /** True when the shot cleared a group of three or more. */
  matched: boolean;
  remainingBoard: BubbleCell[];
  removedGroupIds: string[];
  shot: BubbleCell;
}

export function findSnapCell(
  board: BubbleCell[],
  impactId: string,
  impactPoint: BubblePoint,
): { row: number; column: number } | null {
  const impact = board.find((bubble) => bubble.id === impactId);
  if (!impact) return null;
  const occupied = createPositionMap(board);

  const candidates = getHexNeighbors(impact.row, impact.column)
    .filter(({ row, column }) => isValidCell(row, column))
    .filter(({ row, column }) => !occupied.has(positionKey(row, column)))
    .map((cell) => {
      const center = getHexCellCenter(cell.row, cell.column);
      return {
        ...cell,
        distanceSquared:
          (center.x - impactPoint.x) ** 2 + (center.y - impactPoint.y) ** 2,
      };
    })
    .sort(
      (left, right) =>
        left.distanceSquared - right.distanceSquared ||
        left.row - right.row ||
        left.column - right.column,
    );

  return candidates[0] ?? null;
}

/**
 * Pure physical resolution of a shot. It knows nothing about the current
 * objective: it only reports what was removed, what fell, and which words left
 * the board. The pedagogical layer interprets that afterwards.
 */
export function resolveBubbleShot(
  board: BubbleCell[],
  impactId: string,
  impactPoint: BubblePoint,
  shotColor: BubbleColor,
  shotId: string,
): BubbleShotResolution | null {
  const snapCell = findSnapCell(board, impactId, impactPoint);
  if (!snapCell) return null;

  const shot: BubbleCell = {
    color: shotColor,
    column: snapCell.column,
    id: shotId,
    role: "normal",
    row: snapCell.row,
  };

  const boardWithShot = [...board, shot];
  const group = findSameColorGroup(boardWithShot, shot.id);
  const matched = group.length >= 3;
  const removedGroupIds = matched ? group : [];
  const afterGroup = boardWithShot.filter(
    (bubble) => !removedGroupIds.includes(bubble.id),
  );
  const disconnectedIds = findDisconnectedBubbleIds(afterGroup);
  const remainingBoard = afterGroup.filter(
    (bubble) => !disconnectedIds.includes(bubble.id),
  );

  const removedSet = new Set(removedGroupIds);
  const droppedSet = new Set(disconnectedIds);
  const collectedWords: CollectedWord[] = [];
  for (const bubble of boardWithShot) {
    if (bubble.role !== "wordBonus" || !bubble.contentId) continue;
    if (removedSet.has(bubble.id)) {
      collectedWords.push({
        contentId: bubble.contentId,
        label: bubble.label ?? "",
        via: "match",
      });
    } else if (droppedSet.has(bubble.id)) {
      collectedWords.push({
        contentId: bubble.contentId,
        label: bubble.label ?? "",
        via: "drop",
      });
    }
  }

  return {
    boardWithShot,
    collectedWords,
    disconnectedIds,
    matched,
    remainingBoard,
    removedGroupIds,
    shot,
  };
}

/* ── pressure ── */

export interface NewRowResult {
  board: BubbleCell[];
  /** Words seeded into the new row. */
  placedContentIds: string[];
  /** Words pushed off the edge of the grid; they must return to the pool. */
  displacedContentIds: string[];
}

/**
 * Pushes a fully connected row in at the ceiling and shifts everything down by
 * one row. Bubbles keep their ids and metadata, so a word bonus descends with
 * its own cell instead of being repositioned. Pending words may be seeded into
 * the new row, which is the only structurally valid way to reintroduce a word.
 */
export function insertCeilingRow(
  board: BubbleCell[],
  random: RandomSource,
  pendingWords: RoundWord[] = [],
): NewRowResult {
  // Rows alternate width, so a bubble in the last column of a wide row has no
  // cell beneath it: it leaves the grid rather than overlapping its neighbour.
  const displacedContentIds: string[] = [];
  const shifted: BubbleCell[] = [];
  for (const bubble of board) {
    if (bubble.column >= columnsForRow(bubble.row + 1)) {
      if (bubble.role === "wordBonus" && bubble.contentId) {
        displacedContentIds.push(bubble.contentId);
      }
      continue;
    }
    shifted.push({ ...bubble, row: bubble.row + 1 });
  }

  const colors = getActiveColors(shifted);
  const palette = colors.length > 0 ? colors : PLAYABLE_COLORS;

  const newRow: BubbleCell[] = [];
  const cols = columnsForRow(0);
  for (let column = 0; column < cols; column++) {
    newRow.push({
      color: palette[Math.floor(random() * palette.length)],
      column,
      id: `bubble:new:${column}:${Math.floor(random() * 0xffffff)}`,
      role: "normal",
      row: 0,
    });
  }

  const placedContentIds: string[] = [];
  if (pendingWords.length > 0) {
    const slots = shuffleInPlace([...newRow], random);
    for (const word of pendingWords) {
      const cell = slots.find((candidate) => candidate.role === "normal");
      if (!cell) break;
      cell.role = "wordBonus";
      cell.contentId = word.contentId;
      cell.label = word.label;
      cell.id = `word:${word.contentId}`;
      placedContentIds.push(word.contentId);
    }
  }

  // Losing an edge bubble can orphan whatever it was supporting, so the new
  // board is swept before it is handed back: nothing may be left floating.
  const combined = [...newRow, ...shifted];
  const floating = new Set(findDisconnectedBubbleIds(combined));
  if (floating.size === 0) {
    return { board: combined, displacedContentIds, placedContentIds };
  }

  const supported: BubbleCell[] = [];
  for (const bubble of combined) {
    if (!floating.has(bubble.id)) {
      supported.push(bubble);
      continue;
    }
    if (bubble.role === "wordBonus" && bubble.contentId) {
      displacedContentIds.push(bubble.contentId);
    }
  }

  return { board: supported, displacedContentIds, placedContentIds };
}

/* ── round state ── */

export function detectDefeat(board: BubbleCell[]): boolean {
  return board.some((bubble) => bubble.row >= DEFEAT_ROW);
}

export function detectDanger(board: BubbleCell[]): boolean {
  return board.some((bubble) => bubble.row >= DANGER_ROW);
}

export function getWordBubbles(board: BubbleCell[]): BubbleCell[] {
  return board.filter((bubble) => bubble.role === "wordBonus" && bubble.contentId);
}

export function findChallengeForContent(
  round: PreparedArcadeRound,
  contentId: string,
): PreparedArcadeChallenge | undefined {
  return round.challenges.find((challenge) => challenge.correctChoiceId === contentId);
}

/**
 * Chooses the next Portuguese objective. It always prefers a word that is
 * actually present on the board, so the learner is never forced to wait for a
 * word that has not been dealt yet. Round order is respected when possible.
 */
export function selectNextObjective(
  round: PreparedArcadeRound,
  board: BubbleCell[],
  resolvedChallengeIds: Set<string>,
): PreparedArcadeChallenge | null {
  const onBoard = new Set(getWordBubbles(board).map((bubble) => bubble.contentId));
  const pending = round.challenges.filter(
    (challenge) => !resolvedChallengeIds.has(challenge.id),
  );
  return (
    pending.find((challenge) => onBoard.has(challenge.correctChoiceId)) ??
    pending[0] ??
    null
  );
}

/**
 * Keeps the board stocked with word bubbles by converting ordinary, already
 * connected bubbles in place. This is a structural substitution — never a new
 * cell, never an arbitrary free slot — so connectivity is preserved by
 * construction and the learner is never left waiting for a word to appear.
 */
export function replenishWordBubbles(
  board: BubbleCell[],
  pool: RoundWord[],
  random: RandomSource,
  desired: number = TARGET_WORD_COUNT,
): { board: BubbleCell[]; placedContentIds: string[] } {
  const present = new Set(getWordBubbles(board).map((bubble) => bubble.contentId));
  const missing = desired - present.size;
  if (missing <= 0 || pool.length === 0) return { board, placedContentIds: [] };

  const next = board.map((bubble) => ({ ...bubble }));
  const candidates = next.filter(
    (bubble) => bubble.role === "normal" && bubble.row >= 1,
  );
  shuffleInPlace(candidates, random);

  const placedContentIds: string[] = [];
  for (const word of pool) {
    if (placedContentIds.length >= missing) break;
    if (present.has(word.contentId)) continue;
    const cell = candidates.find((candidate) => candidate.role === "normal");
    if (!cell) break;
    cell.role = "wordBonus";
    cell.contentId = word.contentId;
    cell.label = word.label;
    cell.id = `word:${word.contentId}`;
    present.add(word.contentId);
    placedContentIds.push(word.contentId);
  }

  return { board: next, placedContentIds };
}

/**
 * Moves a pending word onto an existing, ceiling-connected ordinary bubble.
 *
 * Used when a word bubble is knocked down before it was ever studied: the
 * content must survive the round, so it is re-hosted on a real connected cell
 * instead of being lost. Never targets an empty cell, a bubble already carrying
 * a word, or anything disconnected.
 */
export function reassignWordToConnectedBubble(
  board: BubbleCell[],
  word: RoundWord,
  random: RandomSource,
): { board: BubbleCell[]; placed: boolean } {
  const alreadyPresent = board.some(
    (bubble) => bubble.role === "wordBonus" && bubble.contentId === word.contentId,
  );
  if (alreadyPresent) return { board, placed: false };

  const connected = new Set(
    board
      .map((bubble) => bubble.id)
      .filter((id) => !findDisconnectedBubbleIds(board).includes(id)),
  );

  const next = board.map((bubble) => ({ ...bubble }));
  // Prefer lower rows so re-hosted words stay reachable, but accept any
  // connected ordinary bubble rather than lose the word.
  const eligible = next.filter(
    (bubble) => bubble.role === "normal" && connected.has(bubble.id),
  );
  const candidates = eligible.filter((bubble) => bubble.row >= 1);
  const pool = candidates.length > 0 ? candidates : eligible;
  if (pool.length === 0) return { board, placed: false };

  shuffleInPlace(pool, random);
  const host = pool[0];
  host.role = "wordBonus";
  host.contentId = word.contentId;
  host.label = word.label;
  host.id = `word:${word.contentId}`;

  return { board: next, placed: true };
}

/**
 * Builds a fresh playable wave when the board has been cleared but words are
 * still pending. Rows are stacked from the ceiling down so everything is
 * connected by construction, and the supplied words are seeded into them.
 */
export function createWave(
  words: RoundWord[],
  random: RandomSource,
  rows: number = WAVE_ROWS,
): NewRowResult {
  let board: BubbleCell[] = [];
  const pending = [...words];

  for (let index = 0; index < rows; index++) {
    // Seed at most one word per inserted row so they spread across the wave.
    const seed = pending.length > 0 ? [pending[0]] : [];
    const result = insertCeilingRow(board, random, seed);
    board = result.board;
    for (const contentId of result.placedContentIds) {
      const at = pending.findIndex((word) => word.contentId === contentId);
      if (at >= 0) pending.splice(at, 1);
    }
  }

  // A word seeded into the ceiling row can still be pushed off the parity edge
  // by a later row, so placement is read from the finished board rather than
  // from the per-row reports. Anything not actually present stays pending.
  const placedContentIds = getWordBubbles(board)
    .map((bubble) => bubble.contentId)
    .filter((contentId): contentId is string => Boolean(contentId));
  const placed = new Set(placedContentIds);

  const displacedContentIds = words
    .map((word) => word.contentId)
    .filter((contentId) => !placed.has(contentId));

  return { board, displacedContentIds, placedContentIds };
}

/** Debug/testing invariant: no static bubble may float, and no cell may repeat. */
export function assertBoardInvariants(board: BubbleCell[]): void {
  const seen = new Set<string>();
  for (const bubble of board) {
    const key = positionKey(bubble.row, bubble.column);
    if (seen.has(key)) {
      throw new Error(`Duplicate cell at ${key} (${bubble.id})`);
    }
    seen.add(key);
    if (!isValidCell(bubble.row, bubble.column)) {
      throw new Error(`Invalid cell ${key} (${bubble.id})`);
    }
  }
  const floating = findDisconnectedBubbleIds(board);
  if (floating.length > 0) {
    throw new Error(`Floating bubbles remain: ${floating.join(", ")}`);
  }
}

/* ── geometry ── */

export function segmentCircleFirstHit(
  x0: number, y0: number,
  x1: number, y1: number,
  cx: number, cy: number,
  combinedRadius: number,
): number | null {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const fx = x0 - cx;
  const fy = y0 - cy;
  const a = dx * dx + dy * dy;
  if (a < 1e-10) return null;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - combinedRadius * combinedRadius;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;
  const sqrtD = Math.sqrt(discriminant);
  const t = (-b - sqrtD) / (2 * a);
  if (t >= 0 && t <= 1) return t;
  const t2 = (-b + sqrtD) / (2 * a);
  if (t2 >= 0 && t2 <= 1) return t2;
  return null;
}
