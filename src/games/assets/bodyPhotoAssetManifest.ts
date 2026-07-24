import ankle from "../../assets/body-parts-photo-flashcards/ankle.webp";
import arm from "../../assets/body-parts-photo-flashcards/arm.webp";
import back from "../../assets/body-parts-photo-flashcards/back.webp";
import chest from "../../assets/body-parts-photo-flashcards/chest.webp";
import ear from "../../assets/body-parts-photo-flashcards/ear.webp";
import elbow from "../../assets/body-parts-photo-flashcards/elbow.webp";
import eye from "../../assets/body-parts-photo-flashcards/eye.webp";
import face from "../../assets/body-parts-photo-flashcards/face.webp";
import finger from "../../assets/body-parts-photo-flashcards/finger.webp";
import foot from "../../assets/body-parts-photo-flashcards/foot.webp";
import hair from "../../assets/body-parts-photo-flashcards/hair.webp";
import hand from "../../assets/body-parts-photo-flashcards/hand.webp";
import head from "../../assets/body-parts-photo-flashcards/head.webp";
import knee from "../../assets/body-parts-photo-flashcards/knee.webp";
import leg from "../../assets/body-parts-photo-flashcards/leg.webp";
import mouth from "../../assets/body-parts-photo-flashcards/mouth.webp";
import neck from "../../assets/body-parts-photo-flashcards/neck.webp";
import nose from "../../assets/body-parts-photo-flashcards/nose.webp";
import shoulder from "../../assets/body-parts-photo-flashcards/shoulder.webp";
import stomach from "../../assets/body-parts-photo-flashcards/stomach.webp";
import teeth from "../../assets/body-parts-photo-flashcards/teeth.webp";
import thumb from "../../assets/body-parts-photo-flashcards/thumb.webp";
import toe from "../../assets/body-parts-photo-flashcards/toe.webp";
import tongue from "../../assets/body-parts-photo-flashcards/tongue.webp";

/**
 * The 24 `body` visualKey values, in the same order as
 * `src/content/data/vocabulary.ts`. This is the single source of truth for
 * which keys have a photographic asset — `scripts/validateContent.mjs`
 * checks the manifest against this list.
 */
export const BODY_PHOTO_VISUAL_KEYS = [
  "head",
  "hair",
  "face",
  "eye",
  "ear",
  "nose",
  "mouth",
  "teeth",
  "tongue",
  "neck",
  "shoulder",
  "arm",
  "elbow",
  "hand",
  "finger",
  "thumb",
  "chest",
  "stomach",
  "back",
  "leg",
  "knee",
  "ankle",
  "foot",
  "toe",
] as const;

export type BodyPhotoVisualKey = (typeof BODY_PHOTO_VISUAL_KEYS)[number];

/**
 * Single source of physical asset imports for the `body` photo collection.
 * Every key resolves to a Vite-bundled `.webp` URL, enabling tree-shaking
 * and correct hashing/copying into the production build. Never import
 * `review-board.webp` here — it is comparison-only material.
 */
export const BODY_PHOTO_ASSET_MANIFEST: Record<BodyPhotoVisualKey, string> = {
  head,
  hair,
  face,
  eye,
  ear,
  nose,
  mouth,
  teeth,
  tongue,
  neck,
  shoulder,
  arm,
  elbow,
  hand,
  finger,
  thumb,
  chest,
  stomach,
  back,
  leg,
  knee,
  ankle,
  foot,
  toe,
};

export function isBodyPhotoVisualKey(
  visualKey: string,
): visualKey is BodyPhotoVisualKey {
  return Object.prototype.hasOwnProperty.call(BODY_PHOTO_ASSET_MANIFEST, visualKey);
}

export function getBodyPhotoAsset(visualKey?: string): string | undefined {
  if (!visualKey || !isBodyPhotoVisualKey(visualKey)) {
    return undefined;
  }
  return BODY_PHOTO_ASSET_MANIFEST[visualKey];
}
