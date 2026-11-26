import type { ReactNode } from "react";

export type IconName =
  | "arrow-left"
  | "book"
  | "chart"
  | "check"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "clock"
  | "close"
  | "game"
  | "graduation-cap"
  | "grid"
  | "heart"
  | "home"
  | "lock"
  | "refresh"
  | "settings"
  | "sparkles"
  | "trophy"
  | "user"
  | "volume"
  | "volume-off";

interface AppIconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const paths: Record<IconName, ReactNode> = {
  "arrow-left": <path d="m15 18-6-6 6-6M9 12h10" />,
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  chart: <path d="M5 19V11M12 19V5M19 19v-8" />,
  check: <path d="m5 12 4 4L19 6" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "chevron-left": <path d="m15 18-6-6 6-6" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  clock: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2M9 2h6" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  game: (
    <>
      <path d="M8 12h4M10 10v4" />
      <path d="M15 13h.01M18 11h.01" />
      <path d="M7 7h10a4 4 0 0 1 3.8 5.2l-1.4 4.4a2 2 0 0 1-3.3.8L14.5 16h-5l-1.6 1.4a2 2 0 0 1-3.3-.8l-1.4-4.4A4 4 0 0 1 7 7Z" />
    </>
  ),
  "graduation-cap": (
    <>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
      <path d="M22 10v5" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  heart: (
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  refresh: (
    <path d="M20 7h-5V2M4 17h5v5M19 12a7 7 0 0 0-12-5l-2 2M5 12a7 7 0 0 0 12 5l2-2" />
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  sparkles: (
    <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 13l.6 1.4L21 15l-1.4.6L19 17l-.6-1.4L17 15l1.4-.6L19 13Z" />
  ),
  trophy: (
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" />
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  volume: (
    <path d="M11 5 6 9H2v6h4l5 4V5ZM15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" />
  ),
  "volume-off": (
    <path d="M11 5 6 9H2v6h4l5 4V5ZM16 10l5 5M21 10l-5 5" />
  ),
};

export default function AppIcon({
  name,
  size = 22,
  strokeWidth = 1.85,
  className,
}: AppIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}

/* ==========================================================================
   Tier 2 VSoT Brand, Sidebar Navigation & Gamification Filled Icons
   Soft glossy/filled style — zero dark outlines.
   ========================================================================== */

export function BrandMegaphoneIcon({ size = 38 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 40 40"
      width={size}
    >
      {/* 3 warm golden-orange sparkle/sound rays radiating top-right */}
      <path
        d="M27.5 8.5L30.2 5.2"
        stroke="#F9B64E"
        strokeLinecap="round"
        strokeWidth="2.6"
      />
      <path
        d="M31.2 13.8L35.4 12.2"
        stroke="#F79B38"
        strokeLinecap="round"
        strokeWidth="2.6"
      />
      <path
        d="M31.6 20.2L35.2 21.1"
        stroke="#F9B64E"
        strokeLinecap="round"
        strokeWidth="2.4"
      />

      {/* Megaphone handle */}
      <path
        d="M11.8 24.8L14.8 31.8C15.3 33 14.7 34.4 13.5 34.9L12.1 35.5C10.9 36 9.5 35.4 9 34.2L6.4 27.6L11.8 24.8Z"
        fill="#3B68B8"
      />

      {/* Megaphone back mouthpiece */}
      <ellipse
        cx="8.8"
        cy="23.8"
        fill="#4A7CE0"
        rx="3.4"
        ry="5.2"
        transform="rotate(-24 8.8 23.8)"
      />

      {/* Megaphone main cone */}
      <path
        d="M8.5 19.6L21.5 10.2C22.4 9.5 23.7 9.9 24.2 10.9L29.1 21.8C29.6 22.9 29 24.1 27.9 24.4L12.3 28.1C11 28.4 9.6 27.7 9 26.4L7.7 23.4C7.1 22 7.4 20.4 8.5 19.6Z"
        fill="#6CA1FF"
      />

      {/* Soft top highlight on cone */}
      <path
        d="M11.2 19.5L21.4 12.2L22.9 15.6L12.1 21.7L11.2 19.5Z"
        fill="#9CC0FF"
        opacity="0.55"
      />

      {/* Cone bell opening */}
      <ellipse
        cx="26.2"
        cy="17.2"
        fill="#4D80E4"
        rx="3.1"
        ry="7.6"
        transform="rotate(-24 26.2 17.2)"
      />
      <ellipse
        cx="26.4"
        cy="17.2"
        fill="#88B4FF"
        rx="1.6"
        ry="4.8"
        transform="rotate(-24 26.4 17.2)"
      />
    </svg>
  );
}

export function SidebarNavIcon({
  id,
  active = false,
  size = 24,
}: {
  id: "home" | "study" | "progress" | "profile" | "games";
  active?: boolean;
  size?: number;
}) {
  if (id === "home") {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height={size}
        viewBox="0 0 24 24"
        width={size}
      >
        <path
          d="M11.15 3.35a1.3 1.3 0 0 1 1.7 0l7.9 6.95a1.2 1.2 0 0 1-.8 2.1H19v7.2A1.4 1.4 0 0 1 17.6 21H6.4A1.4 1.4 0 0 1 5 19.6V12.4h-.95a1.2 1.2 0 0 1-.8-2.1l7.9-6.95Z"
          fill="#FF7A59"
        />
        <path
          d="M9.6 21v-5.2a2.4 2.4 0 0 1 4.8 0V21H9.6Z"
          fill="#3E547A"
        />
      </svg>
    );
  }

  if (id === "study") {
    const capColor = active ? "#FFFFFF" : "#5C92F4";
    const baseColor = active ? "#EEF4FF" : "#7AA7FA";
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height={size}
        viewBox="0 0 24 24"
        width={size}
      >
        <path
          d="M12 4.2 2.4 9.1a.7.7 0 0 0 0 1.25L12 15.2l9.6-4.85a.7.7 0 0 0 0-1.25L12 4.2Z"
          fill={capColor}
        />
        <path
          d="M6.2 13.3v3.4c0 1.4 2.6 2.7 5.8 2.7s5.8-1.3 5.8-2.7v-3.4l-5.8 2.95-5.8-2.95Z"
          fill={baseColor}
        />
        <path
          d="M20.3 10.6v4.7"
          stroke={capColor}
          strokeLinecap="round"
          strokeWidth="1.9"
        />
        <circle cx="20.3" cy="16.1" fill={capColor} r="1.2" />
      </svg>
    );
  }

  if (id === "progress") {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height={size}
        viewBox="0 0 24 24"
        width={size}
      >
        <rect fill="#679EF1" height="8" rx="2.2" width="4.4" x="3.4" y="12.5" />
        <rect fill="#FFA551" height="12" rx="2.2" width="4.4" x="9.8" y="8.5" />
        <rect fill="#57CC7B" height="16.5" rx="2.2" width="4.4" x="16.2" y="4" />
      </svg>
    );
  }

  if (id === "profile") {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height={size}
        viewBox="0 0 24 24"
        width={size}
      >
        <circle cx="12" cy="8.2" fill="#C48DF5" r="4.1" />
        <path
          d="M4.6 19.6c0-3.55 3.32-5.9 7.4-5.9s7.4 2.35 7.4 5.9c0 .77-.63 1.4-1.4 1.4H6c-.77 0-1.4-.63-1.4-1.4Z"
          fill="#C48DF5"
        />
      </svg>
    );
  }

  return <AppIcon name="game" size={size - 2} />;
}

export function StreakFlameIcon({ size = 34 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={Math.round(size * 1.12)}
      viewBox="0 0 32 36"
      width={size}
    >
      {/* Outer orange-red teardrop flame */}
      <path
        d="M17.2 2.2C17.2 2.2 26 9.8 26 19.6C26 26.8 21.5 32.5 15.8 32.5C10.1 32.5 5.6 26.9 5.6 20.1C5.6 15.2 8.4 11.4 10.6 9.3C10.6 9.3 10.2 13.1 12.4 14.5C12.4 14.5 11.8 8 17.2 2.2Z"
        fill="#F46B2A"
      />
      {/* Mid warm amber body */}
      <path
        d="M16.5 9.2C16.5 9.2 22.8 14.8 22.8 21.4C22.8 26.6 19.6 31.4 15.8 31.4C12 31.4 8.8 27 8.8 21.8C8.8 18.2 10.8 15.5 12.2 14.2C12.2 14.2 12.1 16.9 13.7 17.8C13.7 17.8 13.5 13 16.5 9.2Z"
        fill="#F78F1C"
      />
      {/* Inner yellow core */}
      <path
        d="M15.9 18.2C15.9 18.2 19.4 21.4 19.4 25.1C19.4 28.2 17.8 30.6 15.8 30.6C13.8 30.6 12.2 28.2 12.2 25.2C12.2 22.5 14 20.1 15.9 18.2Z"
        fill="#FFE45E"
      />
    </svg>
  );
}

/* ==========================================================================
   Tier 3 VSoT Mobile Bottom Tab Bar Icons
   Solid filled #5C92F4 when active; crisp 1.75px monoline #8F939C when inactive.
   ========================================================================== */

export function MobileTabIcon({
  id,
  active = false,
  size = 22,
}: {
  id: "study" | "home" | "progress" | "profile";
  active?: boolean;
  size?: number;
}) {
  if (id === "study") {
    if (active) {
      return (
        <svg
          aria-hidden="true"
          fill="none"
          height={size}
          viewBox="0 0 24 24"
          width={size}
        >
          <path
            d="M12 4.5 2.5 9.3a.6.6 0 0 0 0 1.1L12 15.2l9.5-4.8a.6.6 0 0 0 0-1.1L12 4.5Z"
            fill="currentColor"
          />
          <path
            d="M6.4 13.4v3.2c0 1.4 2.5 2.6 5.6 2.6s5.6-1.2 5.6-2.6v-3.2L12 16.2l-5.6-2.8Z"
            fill="currentColor"
          />
          <path
            d="M20.2 10.6v4.6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    }
    return <AppIcon name="graduation-cap" size={size} strokeWidth={1.75} />;
  }

  if (id === "home") {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 2.1 : 1.75}
        viewBox="0 0 24 24"
        width={size}
      >
        <path d="M20 11a8 8 0 1 1-2.3-5.6L20 7.7" />
        <path d="M20 3.5v4.2h-4.2" />
      </svg>
    );
  }

  if (id === "progress") {
    return (
      <svg
        aria-hidden="true"
        fill={active ? "currentColor" : "none"}
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
        width={size}
      >
        <rect height="6.5" rx="1.2" width="3.2" x="4.2" y="13.5" />
        <rect height="10.5" rx="1.2" width="3.2" x="10.4" y="9.5" />
        <rect height="15" rx="1.2" width="3.2" x="16.6" y="5" />
      </svg>
    );
  }

  if (active) {
    return (
      <svg
        aria-hidden="true"
        fill="currentColor"
        height={size}
        viewBox="0 0 24 24"
        width={size}
      >
        <circle cx="12" cy="8.2" r="4" />
        <path d="M4.8 19.6c0-3.4 3.2-5.6 7.2-5.6s7.2 2.2 7.2 5.6c0 .77-.63 1.4-1.4 1.4H6.2c-.77 0-1.4-.63-1.4-1.4Z" />
      </svg>
    );
  }

  return <AppIcon name="user" size={size} strokeWidth={1.75} />;
}
