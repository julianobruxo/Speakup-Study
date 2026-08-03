import type { PreparedArcadeChallenge } from "../bridge/arcadeBridge";

export type BubbleColor = "cyan" | "violet" | "wine" | "gold" | "neutral";
export type BubbleRole = "target" | "support" | "hanger" | "shot";

export interface BubbleCell {
  choiceId?: string;
  color: BubbleColor;
  column: number;
  id: string;
  label?: string;
  role: BubbleRole;
  row: number;
}

export interface BubbleShotResolution {
  boardWithShot: BubbleCell[];
  disconnectedIds: string[];
  remainingBoard: BubbleCell[];
  removedGroupIds: string[];
  shot: BubbleCell;
}

export interface BubblePoint {
  x: number;
  y: number;
}

const TARGET_COLORS: BubbleColor[] = ["cyan", "violet", "wine"];
const TARGET_COLUMNS = [0, 2, 4];
const SUPPORT_COLUMNS = [0, 2, 4];
const HANGER_COLUMNS = [0, 2, 4];

export function getChoiceColor(
  challenge: PreparedArcadeChallenge,
  choiceId: string,
): BubbleColor {
  const index = challenge.choices.findIndex((choice) => choice.id === choiceId);
  return TARGET_COLORS[Math.max(0, index) % TARGET_COLORS.length];
}

export function createChallengeBoard(
  challenge: PreparedArcadeChallenge,
): BubbleCell[] {
  return challenge.choices.slice(0, 3).flatMap((choice, index) => {
    const color = TARGET_COLORS[index];
    return [
      {
        choiceId: choice.id,
        color,
        column: TARGET_COLUMNS[index],
        id: `target:${choice.id}`,
        label: choice.label,
        role: "target" as const,
        row: 0,
      },
      {
        choiceId: choice.id,
        color,
        column: SUPPORT_COLUMNS[index],
        id: `support:${choice.id}`,
        role: "support" as const,
        row: 1,
      },
      {
        choiceId: choice.id,
        color: "gold" as const,
        column: HANGER_COLUMNS[index],
        id: `hanger:${choice.id}`,
        role: "hanger" as const,
        row: 2,
      },
    ];
  });
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

export function findSameColorGroup(
  board: BubbleCell[],
  startId: string,
): string[] {
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

export function resolveBubbleShot(
  board: BubbleCell[],
  impactId: string,
  impactPoint: BubblePoint,
  shotColor: BubbleColor,
  shotId: string,
): BubbleShotResolution | null {
  const impact = board.find((bubble) => bubble.id === impactId);
  if (!impact) return null;
  const occupied = createPositionMap(board);
  const candidates = getHexNeighbors(impact.row, impact.column)
    .filter(({ row, column }) => row >= 0 && row <= 6 && column >= 0 && column <= 5)
    .filter(({ row, column }) => !occupied.has(positionKey(row, column)))
    .map((cell) => {
      const center = getHexCellCenter(cell.row, cell.column);
      return {
        ...cell,
        distanceSquared:
          (center.x - impactPoint.x) ** 2 + (center.y - impactPoint.y) ** 2,
      };
    })
    .sort((left, right) =>
      left.distanceSquared - right.distanceSquared ||
      left.row - right.row ||
      left.column - right.column
    );
  const snapCell = candidates[0];
  if (!snapCell) return null;

  const shot: BubbleCell = {
    color: shotColor,
    column: snapCell.column,
    id: shotId,
    role: "shot",
    row: snapCell.row,
  };
  const boardWithShot = [...board, shot];
  const group = findSameColorGroup(boardWithShot, shot.id);
  const removedGroupIds = group.length >= 3 ? group : [];
  const afterGroup = boardWithShot.filter((bubble) => !removedGroupIds.includes(bubble.id));
  const disconnectedIds = findDisconnectedBubbleIds(afterGroup);
  const remainingBoard = afterGroup.filter((bubble) => !disconnectedIds.includes(bubble.id));

  return {
    boardWithShot,
    disconnectedIds,
    remainingBoard,
    removedGroupIds,
    shot,
  };
}

function createPositionMap(board: BubbleCell[]): Map<string, BubbleCell> {
  return new Map(board.map((bubble) => [positionKey(bubble.row, bubble.column), bubble]));
}

function positionKey(row: number, column: number): string {
  return `${row}:${column}`;
}
