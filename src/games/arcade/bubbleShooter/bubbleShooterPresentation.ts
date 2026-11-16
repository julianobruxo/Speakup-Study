import { MISSES_BEFORE_NEW_ROW, type BubbleColor } from "./bubbleShooterModel.ts";

/**
 * Presentation constants and pure helpers for the Bubble Shooter scene.
 *
 * Kept free of any Phaser import so the rules that govern what the player sees
 * — the shot colour, the countdown wording, message priority, speed and hold
 * times — can be asserted directly in the pure test suite.
 */

export const COLORS: Record<BubbleColor, number> = {
  cyan: 0x36c6d9,
  violet: 0x8b6cf6,
  wine: 0xd63864,
};

export const HIGHLIGHT: Record<BubbleColor, number> = {
  cyan: 0x8cf0ff,
  violet: 0xc4aeff,
  wine: 0xff8aaa,
};

export const DARK: Record<BubbleColor, number> = {
  cyan: 0x1a8f9e,
  violet: 0x5a3ec0,
  wine: 0x8f1e3e,
};

/**
 * Feedback hold times. Every entry except `gameOver` is the original duration
 * raised once by 15% so messages stay readable; `gameOver` is the deliberate
 * 2500 ms window the round needs before it reports back to React.
 */
export const FEEDBACK_MS = {
  correct: 1265,
  wrong: 1265,
  combo: 1495,
  perfect: 1610,
  bigDrop: 1725,
  chain: 1725,
  score: 1265,
  danger: 1495,
  newRow: 1495,
  gameOver: 2500,
} as const;

/**
 * Vertical slots for the right-hand feedback column. Distinct offsets keep the
 * critical states from ever overwriting each other: GAME OVER outranks DANGER,
 * which outranks NEW ROW, which outranks the scoring chatter.
 */
export const SLOT_Y = {
  gameOver: -90,
  danger: -45,
  newRow: 0,
  primary: 45,
  combo: 85,
  score: 120,
} as const;

/** Projectile speed, raised once by 10% over the original 440–660 range. */
export const PROJECTILE_SPEED_MIN = 484;
export const PROJECTILE_SPEED_MAX = 726;

/** How long the board takes to visibly descend when a new row is pushed in. */
export const NEW_ROW_TWEEN_MS = 320;
export const NEW_ROW_TWEEN_REDUCED_MS = 120;

/**
 * Disconnected clusters do not pop out of existence: they break away, fall
 * together for a beat, then split so each bubble plummets off-screen on its own
 * arc. Speeds are tuned against the projectile so the drop reads as arcade
 * energy rather than a feather or a teleport.
 */
export const CLUSTER_DROP = {
  /** Break-away: the cluster lurches free before gravity takes over. */
  breakMs: 100,
  /** Sideways nudge applied to the whole cluster during the break. */
  breakDriftX: 6,
  /** Downward nudge during the break. */
  breakDriftY: 10,
  /** How long the cluster keeps falling as one body before separating. */
  blockMs: 130,
  /** Initial fall speed at separation, in px/s — close to the shot speed. */
  separationSpeed: PROJECTILE_SPEED_MIN,
  /** Gravity applied after separation, in px/s². */
  gravity: 2200,
  /** Maximum absolute spin per bubble during the individual fall, in radians. */
  spin: 2.2,
  /** Horizontal spread each bubble can pick up once it separates, in px. */
  spreadX: 140,
  /** Reduced motion collapses the whole sequence into one short fade. */
  reducedMs: 160,
} as const;

/**
 * Time a separated bubble needs to clear the arena, derived from the drop
 * kinematics so visuals are destroyed only after they leave the screen.
 */
export function getClusterFallDurationMs(distanceToBottom: number): number {
  const v = CLUSTER_DROP.separationSpeed;
  const g = CLUSTER_DROP.gravity;
  // Solve distance = v·t + ½·g·t² for t.
  const seconds = (-v + Math.sqrt(v * v + 2 * g * Math.max(0, distanceToBottom))) / g;
  return Math.max(180, Math.round(seconds * 1000));
}

/* ── flight integration ── */

/** Remaining frame time below this is treated as spent. */
export const TIME_EPSILON = 1e-5;
/** Tolerance when comparing a wall crossing against a bubble contact. */
export const T_EPSILON = 1e-6;
/** Nudge applied inward after a bounce so the same wall is not re-detected. */
export const WALL_EPSILON = 0.01;
/** Defensive cap; a real shot bounces far fewer times within one frame. */
export const MAX_BOUNCES_PER_FRAME = 8;

/**
 * Where a horizontal sweep first crosses a side wall, as a normalised position
 * along the segment, or null when it stays inside. Used to split a frame at the
 * bounce so the rest of the travel is swept along the reflected path.
 */
export function segmentWallCrossing(
  startX: number,
  endX: number,
  leftWall: number,
  rightWall: number,
): number | null {
  const dx = endX - startX;
  if (Math.abs(dx) < TIME_EPSILON) return null;

  if (dx < 0 && endX <= leftWall && startX > leftWall) {
    return (leftWall - startX) / dx;
  }
  if (dx > 0 && endX >= rightWall && startX < rightWall) {
    return (rightWall - startX) / dx;
  }
  return null;
}

/* ── pressure ── */

/** Active play time before the ceiling pushes a row in, independent of misses. */
export const PRESSURE_INTERVAL_MS = 30_000;

/** Compact HUD line for the time-based pressure trigger. */
export function getPressureTimeLabel(remainingMs: number): string {
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
  return `NEW ROW IN ${seconds}s`;
}

/** Fill colour of the bubble loaded in the launcher — always the real shot colour. */
export function getLauncherFillColor(color: BubbleColor): number {
  return COLORS[color];
}

/** Fill colour of the small preview bubble beside the launcher. */
export function getPreviewFillColor(color: BubbleColor): number {
  return COLORS[color];
}

/**
 * Countdown shown next to the launcher. A shot without a match may be perfectly
 * strategic, so the wording never says MISS, ERROR or WRONG — it only states how
 * much pressure is left before the ceiling pushes a new row in.
 */
export function getNewRowLabel(missesSinceMatch: number): string {
  const remaining = Math.max(0, MISSES_BEFORE_NEW_ROW - missesSinceMatch);
  return remaining <= 1 ? "NEW ROW NEXT SHOT" : `${remaining} SHOTS UNTIL NEW ROW`;
}
