export interface SlicePoint {
  x: number;
  y: number;
}

export interface SliceCircle {
  center: SlicePoint;
  choiceId: string;
  id: string;
  radius: number;
}

export interface SliceHit {
  object: SliceCircle;
  t: number;
}

export const WORD_SLICE_GESTURE_THRESHOLD = 12;
export const WORD_SLICE_TRAIL_SPACING = 8;
export const WORD_SLICE_TRAIL_LIMIT = 32;

export function pointDistance(left: SlicePoint, right: SlicePoint): number {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

export function interpolateTrail(
  from: SlicePoint,
  to: SlicePoint,
  maxSpacing = WORD_SLICE_TRAIL_SPACING,
): SlicePoint[] {
  const distance = pointDistance(from, to);
  if (distance === 0) return [];
  const steps = Math.max(1, Math.ceil(distance / Math.max(1, maxSpacing)));
  return Array.from({ length: steps }, (_, index) => {
    const t = (index + 1) / steps;
    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    };
  });
}

export function intersectSegmentCircle(
  from: SlicePoint,
  to: SlicePoint,
  circle: SliceCircle,
  trailRadius = 0,
): number | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const radius = circle.radius + Math.max(0, trailRadius);
  const fx = from.x - circle.center.x;
  const fy = from.y - circle.center.y;
  const a = dx * dx + dy * dy;

  if (a === 0) return fx * fx + fy * fy <= radius * radius ? 0 : null;

  const c = fx * fx + fy * fy - radius * radius;
  if (c <= 0) return 0;
  const b = 2 * (fx * dx + fy * dy);
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;

  const root = Math.sqrt(discriminant);
  const near = (-b - root) / (2 * a);
  const far = (-b + root) / (2 * a);
  if (near >= 0 && near <= 1) return near;
  if (far >= 0 && far <= 1) return far;
  return null;
}

export function findFirstSlice(
  from: SlicePoint,
  to: SlicePoint,
  objects: SliceCircle[],
  trailRadius = 0,
): SliceHit | null {
  return objects.reduce<SliceHit | null>((closest, object) => {
    const t = intersectSegmentCircle(from, to, object, trailRadius);
    if (t === null || (closest && closest.t <= t)) return closest;
    return { object, t };
  }, null);
}

export function getWordSliceDifficulty(challengeIndex: number) {
  if (challengeIndex < 2) return { speed: 0.95, sway: 0.35 };
  if (challengeIndex < 5) return { speed: 1, sway: 0.5 };
  return { speed: 1.03, sway: 0.6 };
}

export function triangleWave(value: number): number {
  const normalized = ((value % 1) + 1) % 1;
  return 1 - Math.abs(normalized * 2 - 1);
}
