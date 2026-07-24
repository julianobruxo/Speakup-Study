import { useEffect, useState } from "react";
import { BodyPartIllustration } from "../../components/BodyPartIllustration";
import { getBodyPhotoAsset } from "./bodyPhotoAssetManifest";

/**
 * Central visual resolver: every consumer (flashcards, Conectando, Par
 * perfeito, Cada coisa no seu lugar, Ouvido afiado) renders vocabulary art
 * through this component, keyed by `visualKey`. No consumer may hardcode or
 * duplicate a physical asset path.
 *
 * Resolution order: photographic asset (`bodyPhotoAssetManifest`) → drawn
 * SVG fallback (`BodyPartIllustration`) → plain text label. The SVG fallback
 * also covers a failed image load (`onError`), so a broken/missing photo
 * never renders as nothing.
 */
export function VisualAsset({
  visualKey,
  label,
  className,
}: {
  visualKey?: string;
  label: string;
  className?: string;
}) {
  const photoSrc = getBodyPhotoAsset(visualKey);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [photoSrc]);

  if (!visualKey) {
    return (
      <div className={joinClassNames("game-visual-fallback", className)} role="img" aria-label={label}>
        <span>{label}</span>
      </div>
    );
  }

  if (photoSrc && !photoFailed) {
    return (
      <img
        alt={`Parte do corpo: ${label}`}
        className={joinClassNames("visual-asset-photo", className)}
        loading="lazy"
        onError={() => setPhotoFailed(true)}
        src={photoSrc}
      />
    );
  }

  return <BodyPartIllustration className={className} label={label} part={visualKey} />;
}

function joinClassNames(...values: (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}
