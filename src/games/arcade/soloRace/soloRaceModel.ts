export const SOLO_RACE_LANE_COUNT = 3;
export const SOLO_RACE_SWIPE_THRESHOLD = 42;

const SPEED_MULTIPLIERS = [0.78, 0.9, 1, 1.12, 1.24, 1.36] as const;

export interface SoloRaceProgress {
  combo: number;
  score: number;
  speedTier: number;
}

export interface SoloRaceLayout {
  horizonY: number;
  portalY: number;
  roadBottomHalf: number;
  roadBottomY: number;
  roadHorizonHalf: number;
  vehicleY: number;
}

export function createSoloRaceProgress(): SoloRaceProgress {
  return {
    combo: 0,
    score: 0,
    speedTier: 2,
  };
}

export function clampRaceLane(lane: number): number {
  return Math.min(SOLO_RACE_LANE_COUNT - 1, Math.max(0, Math.trunc(lane)));
}

export function laneFromPosition(x: number, width: number): number {
  const normalized = Math.min(0.999, Math.max(0, x / Math.max(1, width)));
  return clampRaceLane(Math.floor(normalized * SOLO_RACE_LANE_COUNT));
}

export function laneAfterSwipe(
  currentLane: number,
  startX: number,
  endX: number,
  threshold = SOLO_RACE_SWIPE_THRESHOLD,
): number {
  const distance = endX - startX;
  if (Math.abs(distance) < Math.max(1, threshold)) return clampRaceLane(currentLane);
  return clampRaceLane(currentLane + Math.sign(distance));
}

export function isHorizontalRaceSwipe(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  threshold = SOLO_RACE_SWIPE_THRESHOLD,
): boolean {
  const horizontal = Math.abs(endX - startX);
  const vertical = Math.abs(endY - startY);
  return horizontal >= Math.max(1, threshold) && horizontal >= vertical * 1.25;
}

export function getSoloRaceSpeedMultiplier(progress: SoloRaceProgress): number {
  return SPEED_MULTIPLIERS[clampRaceSpeedTier(progress.speedTier)];
}

export function getSoloRaceSpeedLabel(progress: SoloRaceProgress): string {
  const multiplier = getSoloRaceSpeedMultiplier(progress);
  if (multiplier < 0.9) return "Recuperando";
  if (multiplier < 1) return "Aquecendo";
  if (multiplier < 1.2) return "Ritmo";
  if (multiplier < 1.3) return "Boost";
  return "Turbo";
}

export function settleSoloRaceProgress(
  current: SoloRaceProgress,
  correct: boolean,
): SoloRaceProgress {
  const speedTier = correct
    ? clampRaceSpeedTier(current.speedTier + 1)
    : clampRaceSpeedTier(current.speedTier - 2);
  const combo = correct ? current.combo + 1 : 0;
  return {
    combo,
    score: correct
      ? current.score + 100 + Math.min(combo - 1, 4) * 25
      : current.score,
    speedTier,
  };
}

export function getSoloRaceLayout(width: number, height: number): SoloRaceLayout {
  const safeHeight = Math.max(320, height);
  return {
    horizonY: Math.round(safeHeight * 0.25),
    portalY: Math.round(safeHeight * 0.48),
    roadBottomHalf: Math.round(Math.max(320, width) * 0.48),
    roadBottomY: safeHeight,
    roadHorizonHalf: Math.round(Math.max(320, width) * 0.08),
    vehicleY: Math.round(safeHeight * 0.82),
  };
}

function clampRaceSpeedTier(tier: number): number {
  return Math.min(SPEED_MULTIPLIERS.length - 1, Math.max(0, Math.trunc(tier)));
}
