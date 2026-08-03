export const NINJA_RUN_SPEED = 190;

export interface NinjaTrackSegment {
  id: number;
  x: number;
}

export interface NinjaFoundationLayout {
  groundY: number;
  poolSize: number;
  runnerStartX: number;
  segmentWidth: number;
}

export function getNinjaFoundationLayout(
  viewportWidth: number,
  viewportHeight: number,
): NinjaFoundationLayout {
  const width = Math.max(320, viewportWidth);
  const height = Math.max(420, viewportHeight);
  const segmentWidth = Math.max(180, Math.min(260, Math.round(width / 4)));

  return {
    groundY: Math.round(Math.min(height - 76, Math.max(300, height * 0.76))),
    poolSize: Math.ceil(width / segmentWidth) + 7,
    runnerStartX: Math.round(Math.min(230, Math.max(112, width * 0.22))),
    segmentWidth,
  };
}

export function createNinjaTrackPool(
  poolSize: number,
  segmentWidth: number,
): NinjaTrackSegment[] {
  return Array.from({ length: Math.max(1, Math.trunc(poolSize)) }, (_, index) => ({
    id: index,
    x: (index - 2) * segmentWidth,
  }));
}

export function recycleNinjaTrackPool(
  segments: readonly NinjaTrackSegment[],
  cameraLeft: number,
  segmentWidth: number,
): { reuseCount: number; segments: NinjaTrackSegment[] } {
  const next = segments.map((segment) => ({ ...segment }));
  let furthestX = Math.max(...next.map((segment) => segment.x));
  let reuseCount = 0;

  for (const segment of [...next].sort((left, right) => left.x - right.x)) {
    if (segment.x + segmentWidth >= cameraLeft - segmentWidth) continue;
    furthestX += segmentWidth;
    segment.x = furthestX;
    reuseCount += 1;
  }

  return { reuseCount, segments: next };
}

export function getNinjaParallaxOffsets(cameraX: number) {
  const scroll = Math.max(0, cameraX);
  return {
    clouds: scroll * 0.08,
    far: scroll * 0.18,
    near: scroll * 0.38,
  };
}
