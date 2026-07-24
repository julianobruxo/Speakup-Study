interface BodyPartIllustrationProps {
  label: string;
  part: string;
  className?: string;
}

type Highlight = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

const HIGHLIGHTS: Record<string, Highlight> = {
  head: { cx: 137, cy: 70, rx: 42, ry: 50 },
  hair: { cx: 137, cy: 42, rx: 37, ry: 19 },
  face: { cx: 137, cy: 73, rx: 31, ry: 36 },
  eye: { cx: 124, cy: 69, rx: 8, ry: 5 },
  ear: { cx: 97, cy: 73, rx: 7, ry: 13 },
  nose: { cx: 137, cy: 78, rx: 6, ry: 10 },
  neck: { cx: 137, cy: 131, rx: 16, ry: 17 },
  mouth: { cx: 137, cy: 139, rx: 58, ry: 33 },
  teeth: { cx: 137, cy: 134, rx: 42, ry: 10 },
  tongue: { cx: 137, cy: 148, rx: 29, ry: 11 },
  hand: { cx: 137, cy: 145, rx: 48, ry: 60 },
  finger: { cx: 112, cy: 92, rx: 9, ry: 37 },
  thumb: { cx: 82, cy: 151, rx: 13, ry: 30 },
  foot: { cx: 137, cy: 157, rx: 66, ry: 38 },
  toe: { cx: 79, cy: 163, rx: 13, ry: 15 },
  shoulder: { cx: 107, cy: 84, rx: 16, ry: 13 },
  arm: { cx: 88, cy: 132, rx: 13, ry: 43 },
  elbow: { cx: 80, cy: 161, rx: 12, ry: 12 },
  chest: { cx: 137, cy: 112, rx: 35, ry: 30 },
  stomach: { cx: 137, cy: 156, rx: 31, ry: 26 },
  back: { cx: 137, cy: 127, rx: 35, ry: 48 },
  leg: { cx: 118, cy: 207, rx: 17, ry: 48 },
  knee: { cx: 116, cy: 204, rx: 14, ry: 13 },
  ankle: { cx: 114, cy: 249, rx: 11, ry: 10 },
};

function variantFor(part: string) {
  if (["head", "hair", "face", "eye", "ear", "nose", "neck"].includes(part)) {
    return "head";
  }
  if (["mouth", "teeth", "tongue"].includes(part)) return "mouth";
  if (["hand", "finger", "thumb"].includes(part)) return "hand";
  if (["foot", "toe"].includes(part)) return "foot";
  if (part === "back") return "back";
  return "body";
}

export function BodyPartIllustration({
  label,
  part,
  className,
}: BodyPartIllustrationProps) {
  const highlight = HIGHLIGHTS[part] ?? HIGHLIGHTS.head;
  const variant = variantFor(part);

  return (
    <svg
      aria-label={`Ilustração destacando ${label}.`}
      className={["body-part-illustration", className].filter(Boolean).join(" ")}
      data-part={part}
      role="img"
      viewBox="0 0 320 280"
    >
      <title>{`Ilustração destacando ${label}`}</title>
      <rect className="illustration-backdrop" height="248" rx="8" width="280" x="20" y="16" />

      {variant === "head" && <HeadFigure />}
      {variant === "mouth" && <MouthFigure />}
      {variant === "hand" && <HandFigure />}
      {variant === "foot" && <FootFigure />}
      {variant === "body" && <BodyFigure />}
      {variant === "back" && <BackFigure />}

      <ellipse
        className="part-highlight"
        cx={highlight.cx}
        cy={highlight.cy}
        rx={highlight.rx}
        ry={highlight.ry}
      />
      <path
        className="highlight-callout"
        d={`M ${highlight.cx + highlight.rx} ${highlight.cy} L 244 ${highlight.cy} L 258 52`}
      />
      <circle className="highlight-marker" cx="258" cy="52" r="9" />
      <circle className="highlight-marker-core" cx="258" cy="52" r="3" />
    </svg>
  );
}

function HeadFigure() {
  return (
    <g className="figure">
      <path className="shirt-fill" d="M72 252c8-63 32-91 65-91s57 28 65 91Z" />
      <path className="skin-fill" d="M122 117h30v51h-30z" />
      <ellipse className="skin-fill" cx="98" cy="74" rx="9" ry="16" />
      <ellipse className="skin-fill" cx="176" cy="74" rx="9" ry="16" />
      <ellipse className="skin-fill" cx="137" cy="73" rx="40" ry="52" />
      <path className="hair-fill" d="M99 61c2-30 17-45 39-45 27 0 39 18 39 48-11-12-24-17-39-17-14 0-27 5-39 14Z" />
      <path className="detail-stroke" d="M116 69h15m12 0h15M137 72v17l8 2M124 101c8 6 18 6 27 0" />
      <circle className="detail-fill" cx="124" cy="72" r="3" />
      <circle className="detail-fill" cx="151" cy="72" r="3" />
    </g>
  );
}

function MouthFigure() {
  return (
    <g className="figure">
      <ellipse className="skin-fill" cx="137" cy="139" rx="83" ry="73" />
      <path className="nose-line" d="M130 91c0 17-7 25-15 32 14 5 28 5 43 0-9-6-15-15-16-32" />
      <path className="mouth-fill" d="M77 138c19-25 42-34 60-34 20 0 43 9 61 34-19 29-41 40-61 40-21 0-43-11-60-40Z" />
      <path className="teeth-fill" d="M91 133c14-12 31-18 46-18 16 0 33 6 47 18-27 10-64 10-93 0Z" />
      <path className="tongue-fill" d="M105 154c10-8 21-11 32-11 13 0 25 4 34 11-8 9-20 14-34 14-13 0-24-5-32-14Z" />
    </g>
  );
}

function HandFigure() {
  return (
    <g className="figure">
      <path
        className="skin-fill"
        d="M112 235c-4-25-7-44-20-61-10-13-23-22-21-36 1-9 8-12 15-7l25 20-10-76c-1-10 5-17 13-16 7 1 10 7 11 15l5 47 1-58c0-10 6-16 14-15 7 1 10 7 10 15l1 58 6-48c1-9 7-14 14-12 7 2 9 8 8 16l-5 54 7-31c2-8 8-12 14-9 6 3 7 9 5 16l-13 72c-4 25-18 43-38 52l-3 24Z"
      />
      <path className="detail-stroke" d="M112 151c17 15 35 20 56 17M130 121l3 42M156 121l-1 44" />
    </g>
  );
}

function FootFigure() {
  return (
    <g className="figure">
      <path
        className="skin-fill"
        d="M180 60c-7 34-5 60 7 82 12 21 30 35 29 57-1 26-28 43-77 43H78c-20 0-33-10-32-25 1-12 10-21 27-25 18-4 31-13 40-27 11-17 17-51 18-105Z"
      />
      <circle className="detail-stroke" cx="78" cy="205" r="12" />
      <circle className="detail-stroke" cx="101" cy="201" r="10" />
      <circle className="detail-stroke" cx="121" cy="198" r="9" />
      <circle className="detail-stroke" cx="139" cy="196" r="8" />
      <path className="detail-stroke" d="M112 165c25 8 50 8 74 0" />
    </g>
  );
}

function BodyFigure() {
  return (
    <g className="figure body-figure">
      <circle className="skin-fill" cx="137" cy="43" r="27" />
      <path className="hair-fill" d="M111 42c1-22 12-32 27-32 17 0 27 12 27 33-15-9-35-9-54-1Z" />
      <path className="skin-fill" d="M126 66h22v18h-22z" />
      <path className="shirt-fill" d="M105 78c18-8 46-8 64 0l12 78-28 18h-33l-27-18Z" />
      <path className="skin-fill" d="M105 82 91 90l-24 67 20 8 30-61ZM169 82l14 8 24 67-20 8-30-61Z" />
      <path className="skin-fill" d="m68 156 18 5-5 26-17-5zM188 161l18-5 4 26-17 5z" />
      <path className="pants-fill" d="M111 166h52l4 48-22 44h-15l-23-44Z" />
      <path className="skin-fill" d="m108 206 23 2-8 53h-19zM144 208l23-2 4 55h-19z" />
      <path className="shoe-fill" d="M102 254h22v14H92c0-8 4-12 10-14ZM151 254h21c7 2 10 6 10 14h-31Z" />
    </g>
  );
}

function BackFigure() {
  return (
    <g className="figure body-figure">
      <circle className="skin-fill" cx="137" cy="43" r="27" />
      <path className="hair-fill" d="M111 42c1-22 12-32 27-32 17 0 27 12 27 33v17c-15 8-39 7-54-1Z" />
      <path className="skin-fill" d="M126 66h22v18h-22z" />
      <path className="shirt-fill" d="M105 78c18-8 46-8 64 0l12 78-28 18h-33l-27-18Z" />
      <path className="detail-stroke" d="M137 86v68M107 118c18 8 40 8 60 0" />
      <path className="skin-fill" d="M105 82 91 90l-24 67 20 8 30-61ZM169 82l14 8 24 67-20 8-30-61Z" />
      <path className="pants-fill" d="M111 166h52l4 48-22 44h-15l-23-44Z" />
      <path className="skin-fill" d="m108 206 23 2-8 53h-19zM144 208l23-2 4 55h-19z" />
      <path className="shoe-fill" d="M102 254h22v14H92c0-8 4-12 10-14ZM151 254h21c7 2 10 6 10 14h-31Z" />
    </g>
  );
}
