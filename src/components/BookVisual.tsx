import { useEffect, useState } from "react";
import type { BookSvgVariant, BookVocabularyItem } from "../content/books/intro/types";

type FallbackStage = "clipart" | "image" | "svg" | "emoji";

function initialStage(item: BookVocabularyItem): FallbackStage {
  if (item.clipartUrl) return "clipart";
  if (item.imageUrl) return "image";
  if (item.svgVariant) return "svg";
  return "emoji";
}

function nextStage(stage: FallbackStage, item: BookVocabularyItem): FallbackStage {
  if (stage === "clipart") {
    if (item.imageUrl) return "image";
    if (item.svgVariant) return "svg";
    return "emoji";
  }
  if (stage === "image") {
    if (item.svgVariant) return "svg";
    return "emoji";
  }
  return "emoji";
}

const SVG_GLYPHS: Record<BookSvgVariant, { bg: string; fg: string; path: string }> = {
  greeting: { bg: "#dbeafe", fg: "#1d4ed8", path: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0" },
  school: { bg: "#e0e7ff", fg: "#4338ca", path: "M4 6l8-3 8 3v12l-8 3-8-3V6Zm8-3v18" },
  globe: { bg: "#dcfce7", fg: "#15803d", path: "M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm-8 9h16M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" },
  clothing: { bg: "#fce7f3", fg: "#be185d", path: "M8 4l4 2 4-2 4 3-2 4-2-1v10H8V10l-2 1-2-4 4-3Z" },
  transport: { bg: "#fef3c7", fg: "#b45309", path: "M5 11l2-5h10l2 5v6H5v-6Zm2 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" },
  home: { bg: "#ede9fe", fg: "#6d28d9", path: "M3 11l9-7 9 7v9H3v-9Zm6 9v-6h6v6" },
  briefcase: { bg: "#e2e8f0", fg: "#334155", path: "M4 8h16v11H4V8Zm5-3h6v3H9V5Z" },
  food: { bg: "#ffedd5", fg: "#c2410c", path: "M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8Zm0 3a5 5 0 1 1-5 5" },
  sport: { bg: "#dcfce7", fg: "#166534", path: "M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm-6 3l12 12M18 6L6 18" },
  calendar: { bg: "#fee2e2", fg: "#b91c1c", path: "M4 6h16v14H4V6Zm0 4h16M8 3v4M16 3v4" },
  health: { bg: "#ffe4e6", fg: "#e11d48", path: "M12 5v14M5 12h14" },
  place: { bg: "#cffafe", fg: "#0e7490", path: "M12 3a6 6 0 0 0-6 6c0 4.5 6 12 6 12s6-7.5 6-12a6 6 0 0 0-6-6Zm0 8a2 2 0 1 1 2-2 2 2 0 0 1-2 2Z" },
  weekend: { bg: "#fef9c3", fg: "#a16207", path: "M12 3v3M12 18v3M3 12h3M18 12h3M12 7a5 5 0 1 0 5 5 5 5 0 0 0-5-5Z" },
  subject: { bg: "#e0f2fe", fg: "#0369a1", path: "M5 4h10l4 4v12H5V4Zm10 0v4h4M8 12h8M8 16h6" },
};

/**
 * Visual resolver for Livro Intro vocabulary cards.
 * Strict fallback order: clipartUrl -> imageUrl -> inline SVG -> emoji.
 */
export function BookVisual({
  item,
  size = 96,
  className = "",
}: {
  item: BookVocabularyItem;
  size?: number;
  className?: string;
}) {
  const [stage, setStage] = useState<FallbackStage>(() => initialStage(item));

  useEffect(() => {
    setStage(initialStage(item));
  }, [item.id, item.clipartUrl, item.imageUrl, item.svgVariant]);

  const src =
    stage === "clipart"
      ? item.clipartUrl
      : stage === "image"
        ? item.imageUrl
        : undefined;

  if (src) {
    return (
      <img
        alt={item.en}
        className={className}
        loading="lazy"
        onError={() => setStage((current) => nextStage(current, item))}
        referrerPolicy="no-referrer"
        src={src}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          borderRadius: 12,
        }}
      />
    );
  }

  if (stage === "svg" && item.svgVariant) {
    const glyph = SVG_GLYPHS[item.svgVariant];
    return (
      <div
        aria-label={item.en}
        className={className}
        role="img"
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          background: glyph.bg,
          display: "grid",
          placeItems: "center",
        }}
      >
        <svg
          aria-hidden="true"
          fill="none"
          height={Math.round(size * 0.56)}
          stroke={glyph.fg}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
          width={Math.round(size * 0.56)}
        >
          <path d={glyph.path} />
        </svg>
      </div>
    );
  }

  return (
    <span
      aria-label={item.en}
      className={className}
      role="img"
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        fontSize: Math.round(size * 0.52),
      }}
    >
      {item.emoji}
    </span>
  );
}
