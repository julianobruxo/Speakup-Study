import { useEffect, useState, type ReactNode } from "react";
import type { BookSvgVariant, BookVocabularyItem } from "../content/books/intro/types";

const STROKE = "#2D3A42";

/**
 * Tier 1 VSoT Open Book Icon for the Book Selector dropdown (`Livro Intro`).
 * Flat pastel-vivid fills + uniform #2D3A42 rounded outline.
 */
export function OpenBookBadgeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 32 32"
      width={size}
    >
      {/* Back cover */}
      <rect
        fill="#6CA1FF"
        height="19"
        rx="2.5"
        stroke={STROKE}
        strokeWidth="1.8"
        width="24"
        x="4"
        y="7"
      />
      {/* Left page */}
      <path
        d="M6.5 8.5C9.8 8.5 13.5 9.2 16 11V24.5C13.5 23 9.8 22.5 6.5 22.5V8.5Z"
        fill="#FFFFFF"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      {/* Right page */}
      <path
        d="M25.5 8.5C22.2 8.5 18.5 9.2 16 11V24.5C18.5 23 22.2 22.5 25.5 22.5V8.5Z"
        fill="#F4F7FC"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      {/* Micro page lines */}
      <path
        d="M9.5 13H13.2M9.5 16H13.2M9.5 19H12.2M18.8 13H22.5M18.8 16H22.5M18.8 19H21.5"
        stroke="#8F9BB0"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

/**
 * Tier 1 VSoT Category Badge Illustrations (36x36 viewBox, stroke #2D3A42, 1.8px rounded).
 * Matches the VSoT reference cards 1:1 (burger+soda, briefcase, airplane, speech bubbles)
 * and extends coherently to all 14 Livro Intro vocabulary categories.
 */
const CATEGORY_BADGE_SVGS: Record<BookSvgVariant, () => ReactNode> = {
  // VSoT: Alimentos e Bebidas (burger + soda cup with straw)
  food: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      {/* Soda cup in back-right */}
      <path d="M27.5 7L29.5 13" stroke={STROKE} strokeLinecap="round" strokeWidth="1.9" />
      <path
        d="M22.5 13H32.5L31 29.5C30.9 30.6 30 31.4 28.9 31.4H26.1C25 31.4 24.1 30.6 24 29.5L22.5 13Z"
        fill="#6AD0EE"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <rect
        fill="#FFFFFF"
        height="3.2"
        rx="1.2"
        stroke={STROKE}
        strokeWidth="1.7"
        width="11.6"
        x="21.7"
        y="11"
      />
      <path d="M25 20.5H30" stroke="#FFFFFF" strokeLinecap="round" strokeOpacity="0.65" strokeWidth="1.8" />
      {/* Burger in front-left */}
      <path
        d="M7.5 22.5C7.5 17.5 11.4 15 16.5 15C21.6 15 25.5 17.5 25.5 22.5H7.5Z"
        fill="#E99B48"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path d="M11 18.2C12 17.4 13.6 17 15.2 17" stroke="#FFE2B3" strokeLinecap="round" strokeWidth="1.6" />
      {/* Lettuce */}
      <path
        d="M7 22.8C9 21.8 11 23.8 13 22.8C15 21.8 17 23.8 19 22.8C21 21.8 23.5 23.8 26 22.8"
        stroke="#57C47B"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      {/* Patty */}
      <rect
        fill="#7E4C2B"
        height="4.4"
        rx="2.1"
        stroke={STROKE}
        strokeWidth="1.8"
        width="18.6"
        x="7.2"
        y="23.4"
      />
      {/* Bottom bun */}
      <path
        d="M8.2 27.8H24.8V29.3C24.8 30.6 23.7 31.6 22.4 31.6H10.6C9.3 31.6 8.2 30.6 8.2 29.3V27.8Z"
        fill="#E99B48"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  ),

  // VSoT: No Trabalho (brown briefcase with gold clasp)
  briefcase: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      {/* Handle */}
      <path
        d="M15.5 13V10.6C15.5 9.4 16.5 8.5 17.7 8.5H22.3C23.5 8.5 24.5 9.4 24.5 10.6V13"
        stroke={STROKE}
        strokeLinecap="round"
        strokeWidth="2"
      />
      {/* Case body */}
      <rect
        fill="#9C6B4B"
        height="18"
        rx="3.5"
        stroke={STROKE}
        strokeWidth="2"
        width="26"
        x="7"
        y="13"
      />
      {/* Top flap */}
      <path
        d="M7 16.5C7 14.6 8.6 13 10.5 13H29.5C31.4 13 33 14.6 33 16.5V19.2C33 20.4 32 21.4 30.8 21.4H9.2C8 21.4 7 20.4 7 19.2V16.5Z"
        fill="#B57F5C"
        stroke={STROKE}
        strokeWidth="1.9"
      />
      {/* Highlight */}
      <path d="M10.5 16H17.5" stroke="#D9A886" strokeLinecap="round" strokeWidth="1.6" />
      {/* Gold clasp */}
      <rect
        fill="#F6C94C"
        height="5.2"
        rx="1.3"
        stroke={STROKE}
        strokeWidth="1.7"
        width="4.8"
        x="17.6"
        y="19"
      />
    </svg>
  ),

  // VSoT: Viagens / Transport (white fuselage + cornflower blue wings airplane)
  transport: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      {/* Rear wings */}
      <path
        d="M15.8 18.2L7.5 14.2L10.2 11.5L21 13.8"
        fill="#7EA7F4"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M21.8 24.2L25.8 32.5L28.5 29.8L26.2 19"
        fill="#7EA7F4"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      {/* Tail fin */}
      <path
        d="M12.5 27.5L8 29L10.5 24.5"
        fill="#7EA7F4"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      {/* Fuselage */}
      <path
        d="M31.2 8.8C32.5 10.1 31.8 13.2 29.3 15.7L15.4 29.6C13.7 31.3 11.4 31.7 10.3 30.6C9.2 29.5 9.6 27.2 11.3 25.5L25.2 11.6C27.7 9.1 30 7.6 31.2 8.8Z"
        fill="#FFFFFF"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      {/* Cockpit window */}
      <circle cx="26.5" cy="13.5" fill="#7EA7F4" r="1.7" stroke={STROKE} strokeWidth="1.4" />
    </svg>
  ),

  // VSoT: Dia a Dia / Greeting (overlapping warm orange + mint green speech bubbles)
  greeting: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      {/* Top-left warm orange bubble */}
      <path
        d="M7.5 12.5C7.5 10.3 9.3 8.5 11.5 8.5H23.5C25.7 8.5 27.5 10.3 27.5 12.5V18.5C27.5 20.7 25.7 22.5 23.5 22.5H13.5L9.2 25.5L10 22.1C8.5 21.5 7.5 20.1 7.5 18.5V12.5Z"
        fill="#F9B266"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path d="M12 13.8H22.5M12 17.5H19" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="1.9" />
      {/* Bottom-right mint green bubble */}
      <path
        d="M15.5 21.5C15.5 19.3 17.3 17.5 19.5 17.5H29.5C31.7 17.5 33.5 19.3 33.5 21.5V26.5C33.5 28.7 31.7 30.5 29.5 30.5H28.5L29.5 33.5L25 30.5H19.5C17.3 30.5 15.5 28.7 15.5 26.5V21.5Z"
        fill="#59C48E"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path d="M20 22.8H29M20 26.2H26" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  ),

  // School Items (backpack + pencil)
  school: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      <path d="M15.5 11.5C15.5 9.3 17.3 7.5 19.5 7.5H20.5C22.7 7.5 24.5 9.3 24.5 11.5" stroke={STROKE} strokeWidth="2" />
      <rect fill="#7CA8F7" height="20" rx="5.5" stroke={STROKE} strokeWidth="2" width="20" x="10" y="11" />
      <rect fill="#FFFFFF" height="7.5" rx="2.5" stroke={STROKE} strokeWidth="1.8" width="13" x="13.5" y="21" />
      <path d="M14 16H26" stroke={STROKE} strokeLinecap="round" strokeWidth="1.9" />
      <circle cx="20" cy="24.5" fill="#F9B266" r="1.5" stroke={STROKE} strokeWidth="1.2" />
    </svg>
  ),

  // Countries & Nationalities (pastel globe)
  globe: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      <circle cx="20" cy="20" fill="#7AD2F0" r="12.5" stroke={STROKE} strokeWidth="2" />
      <path
        d="M14.5 10.5C16.5 12.2 18.2 14.5 17 17C15.8 19.5 12.5 19 11.5 21.5C10.8 23.2 13 26.5 15.5 28.5"
        fill="#6FD096"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M24 11.5C26 13.5 29 15 28.5 18.5C28 21.5 24.8 22.5 23.5 25C22.8 26.5 23.8 28.8 25.2 29.8"
        fill="#6FD096"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path d="M8.5 20H31.5" stroke={STROKE} strokeOpacity="0.45" strokeWidth="1.5" />
    </svg>
  ),

  // Clothes (outlined t-shirt)
  clothing: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      <path
        d="M14.5 9.5L8 13L10.5 18.5L13.5 17V30.5H26.5V17L29.5 18.5L32 13L25.5 9.5C24.2 11.6 22.2 12.6 20 12.6C17.8 12.6 15.8 11.6 14.5 9.5Z"
        fill="#FFFFFF"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M16.5 19.5H23.5" stroke="#F68B9C" strokeLinecap="round" strokeWidth="2.4" />
      <path d="M17.5 24H22.5" stroke="#7CA8F7" strokeLinecap="round" strokeWidth="2.4" />
    </svg>
  ),

  // House & Furniture (cozy house)
  home: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      <path
        d="M10 18.5V31H30V18.5"
        fill="#FFF7EB"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M7 20L20 9L33 20"
        fill="#FF8B6A"
        stroke={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <rect
        fill="#7CA8F7"
        height="9"
        rx="2"
        stroke={STROKE}
        strokeWidth="1.8"
        width="6.5"
        x="16.8"
        y="22"
      />
      <circle cx="21.2" cy="26.5" fill="#F9D062" r="1" />
    </svg>
  ),

  // Sports (soccer ball)
  sport: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      <circle cx="20" cy="20" fill="#FFFFFF" r="12.5" stroke={STROKE} strokeWidth="2" />
      <polygon
        fill="#4A5A70"
        points="20,14 25,17.6 23.1,23.5 16.9,23.5 15,17.6"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M20 14V7.5M25 17.6L31.5 15.5M23.1 23.5L27 29.5M16.9 23.5L13 29.5M15 17.6L8.5 15.5"
        stroke={STROKE}
        strokeWidth="1.6"
      />
    </svg>
  ),

  // Holidays (calendar + star)
  calendar: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      <rect fill="#FFFFFF" height="21" rx="3.5" stroke={STROKE} strokeWidth="2" width="24" x="8" y="11" />
      <path d="M8 15C8 12.8 9.8 11 12 11H28C30.2 11 32 12.8 32 15V17.5H8V15Z" fill="#FF8474" stroke={STROKE} strokeWidth="1.9" />
      <path d="M14 8.5V13M26 8.5V13" stroke={STROKE} strokeLinecap="round" strokeWidth="2.2" />
      <path
        d="M20 20.5L21.5 23.5L24.8 24L22.4 26.3L23 29.5L20 28L17 29.5L17.6 26.3L15.2 24L18.5 23.5L20 20.5Z"
        fill="#F9CA54"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  ),

  // Body, Health & Remedies (medical heart + cross)
  health: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      <path
        d="M20 31.5C20 31.5 8.5 24.5 8.5 16.2C8.5 12.4 11.4 9.5 15 9.5C17.3 9.5 19.1 10.8 20 12.4C20.9 10.8 22.7 9.5 25 9.5C28.6 9.5 31.5 12.4 31.5 16.2C31.5 24.5 20 31.5 20 31.5Z"
        fill="#FFFFFF"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M20 16V24M16 20H24" stroke="#FF6E54" strokeLinecap="round" strokeWidth="2.8" />
    </svg>
  ),

  // Places in Town (map pin + building)
  place: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      <path
        d="M20 32.5C20 32.5 10.5 24 10.5 17C10.5 11.8 14.8 7.5 20 7.5C25.2 7.5 29.5 11.8 29.5 17C29.5 24 20 32.5 20 32.5Z"
        fill="#FFFFFF"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <circle cx="20" cy="17" fill="#FF7A59" r="4.3" stroke={STROKE} strokeWidth="1.8" />
    </svg>
  ),

  // Weekend Activities (sunny horizon / camera leisure)
  weekend: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      <circle cx="20" cy="20" fill="#FFE066" r="7.5" stroke={STROKE} strokeWidth="2" />
      <path
        d="M20 7.5V10M20 30V32.5M7.5 20H10M30 20H32.5M11.2 11.2L13 13M27 27L28.8 28.8M28.8 11.2L27 13M13 27L11.2 28.8"
        stroke={STROKE}
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  ),

  // School Subjects (graduation cap / open study badge)
  subject: () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40" width="36" height="36">
      <path
        d="M7 17.5L20 11L33 17.5L20 24L7 17.5Z"
        fill="#FFFFFF"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12.5 20.5V26.5C12.5 28.2 15.8 30 20 30C24.2 30 27.5 28.2 27.5 26.5V20.5"
        fill="#E5EEFF"
        stroke={STROKE}
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path d="M31 18.5V26" stroke={STROKE} strokeLinecap="round" strokeWidth="1.9" />
      <circle cx="31" cy="27.2" fill="#F9CA54" r="1.8" stroke={STROKE} strokeWidth="1.3" />
    </svg>
  ),
};

export function CategoryBadgeIcon({
  variant,
  size = 36,
}: {
  variant: BookSvgVariant;
  size?: number;
}) {
  const render = CATEGORY_BADGE_SVGS[variant] ?? CATEGORY_BADGE_SVGS.school;
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {render()}
    </span>
  );
}

/**
 * Tier 1 VSoT Custom Item Illustrations (120x120 viewBox, #2D3A42 2.4px rounded stroke,
 * clean flat fills with soft cel-shading).
 * Takes priority over generic Twemoji so key flashcards like `Coffee` match VSoT 1:1.
 */
const VSOT_ITEM_SVGS: Record<string, () => ReactNode> = {
  // EXACT VSoT Hero Flashcard Illustration: Mint steaming Coffee cup on saucer
  "intro-food-coffee": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 120 120" width="100%" height="100%">
      {/* 3 wavy steam lines */}
      <path
        d="M44 37C41 31 46 25 43 18"
        stroke="#9CA5B0"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M57 34C54 27 59 21 56 14"
        stroke="#9CA5B0"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M70 37C67 31 72 25 69 18"
        stroke="#9CA5B0"
        strokeLinecap="round"
        strokeWidth="3"
      />
      {/* Saucer */}
      <ellipse
        cx="58"
        cy="95"
        fill="#C3E8D6"
        rx="34"
        ry="10.5"
        stroke="#2E3E44"
        strokeWidth="2.8"
      />
      <ellipse
        cx="58"
        cy="94"
        fill="#94C9CE"
        opacity="0.45"
        rx="22"
        ry="5.5"
      />
      {/* Cup handle */}
      <path
        d="M84 56H92C98.5 56 102 61 101 68C100 75 94 79.5 87 79.5H82"
        stroke="#2E3E44"
        strokeLinecap="round"
        strokeWidth="8.5"
      />
      <path
        d="M84 56H92C98.5 56 102 61 101 68C100 75 94 79.5 87 79.5H82"
        stroke="#A4D6D2"
        strokeLinecap="round"
        strokeWidth="3.8"
      />
      {/* Cup body */}
      <path
        d="M27 51H89L84.5 79C82.5 88.5 72 94.5 58 94.5C44 94.5 33.5 88.5 31.5 79L27 51Z"
        fill="#D3EBDB"
        stroke="#2E3E44"
        strokeLinejoin="round"
        strokeWidth="2.8"
      />
      {/* Soft cel-shading shadow on right side of cup */}
      <path
        d="M70 53H87.5L83.4 78.5C81.8 86 74 91.5 64 93C71 89 74 82 75 74L70 53Z"
        fill="#84BFCF"
        opacity="0.55"
      />
      {/* Highlight crescent on left */}
      <path
        d="M36 62C36.8 71 39.2 79 44 84"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeOpacity="0.65"
        strokeWidth="3.5"
      />
      {/* Cup rim */}
      <ellipse
        cx="58"
        cy="51"
        fill="#E5F4EC"
        rx="31"
        ry="9"
        stroke="#2E3E44"
        strokeWidth="2.8"
      />
      {/* Rich coffee liquid */}
      <ellipse
        cx="58"
        cy="52.5"
        fill="#A26E47"
        rx="25.5"
        ry="6.2"
        stroke="#2E3E44"
        strokeWidth="2.2"
      />
      {/* Coffee surface sheen */}
      <path
        d="M44 51.5C48 49.5 54 49 60 49.5"
        stroke="#C8936A"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  ),

  "intro-place-coffee-shop": () => VSOT_ITEM_SVGS["intro-food-coffee"](),

  "intro-school-desk": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <rect x="14" y="14" width="16" height="5.5" rx="1.8" fill="#6FA6F7" stroke={STROKE} strokeWidth="2" />
      <rect x="35" y="17" width="14" height="3" rx="1.2" fill="#FBAC5B" stroke={STROKE} strokeWidth="1.6" />
      <rect x="7" y="20" width="50" height="6.5" rx="2.2" fill="#D99B66" stroke={STROKE} strokeWidth="2.2" />
      <rect x="36" y="26.5" width="17" height="15.5" rx="2" fill="#B57F5C" stroke={STROKE} strokeWidth="2.2" />
      <rect x="42" y="30.5" width="5" height="1.8" rx="0.9" fill="#FFE45E" />
      <rect x="42" y="36.5" width="5" height="1.8" rx="0.9" fill="#FFE45E" />
      <rect x="11" y="26.5" width="4.5" height="25.5" rx="1.5" fill="#9C6B4B" stroke={STROKE} strokeWidth="2" />
      <rect x="48.5" y="42" width="4.5" height="10" rx="1.5" fill="#9C6B4B" stroke={STROKE} strokeWidth="2" />
      <rect x="36" y="42" width="4" height="10" rx="1.5" fill="#9C6B4B" stroke={STROKE} strokeWidth="2" />
    </svg>
  ),

  "intro-school-eraser": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <g transform="rotate(-22 32 32)">
        <rect x="10" y="21" width="44" height="22" rx="4.5" fill="#F68B9C" stroke={STROKE} strokeWidth="2.4" />
        <path d="M35 21H49.5C52 21 54 23 54 25.5V38.5C54 41 52 43 49.5 43H35V21Z" fill="#6FA6F7" stroke={STROKE} strokeWidth="2.4" />
        <rect x="30" y="21" width="7" height="22" fill="#FFFFFF" stroke={STROKE} strokeWidth="2" />
        <path d="M14 25.5H25" stroke="#FFFFFF" strokeLinecap="round" strokeOpacity="0.65" strokeWidth="2.5" />
      </g>
      <line x1="12" y1="52" x2="52" y2="52" stroke="#9CA5B0" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 5" />
    </svg>
  ),

  "intro-school-calculator": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <rect x="14" y="7" width="36" height="50" rx="6" fill="#E5E9F0" stroke={STROKE} strokeWidth="2.4" />
      <rect x="19" y="12" width="26" height="11" rx="2.5" fill="#C3E8D6" stroke={STROKE} strokeWidth="2" />
      <text x="42" y="20.5" textAnchor="end" fontSize="9" fontWeight="700" fontFamily="monospace" fill="#2D3A42">
        123
      </text>
      <rect x="19" y="27" width="6" height="6" rx="1.8" fill="#FFFFFF" stroke={STROKE} strokeWidth="1.6" />
      <rect x="29" y="27" width="6" height="6" rx="1.8" fill="#FFFFFF" stroke={STROKE} strokeWidth="1.6" />
      <rect x="39" y="27" width="6" height="6" rx="1.8" fill="#FBAC5B" stroke={STROKE} strokeWidth="1.6" />
      <rect x="19" y="36" width="6" height="6" rx="1.8" fill="#FFFFFF" stroke={STROKE} strokeWidth="1.6" />
      <rect x="29" y="36" width="6" height="6" rx="1.8" fill="#FFFFFF" stroke={STROKE} strokeWidth="1.6" />
      <rect x="39" y="36" width="6" height="6" rx="1.8" fill="#FBAC5B" stroke={STROKE} strokeWidth="1.6" />
      <rect x="19" y="45" width="16" height="6" rx="1.8" fill="#FFFFFF" stroke={STROKE} strokeWidth="1.6" />
      <rect x="39" y="45" width="6" height="6" rx="1.8" fill="#65C68E" stroke={STROKE} strokeWidth="1.6" />
    </svg>
  ),

  "intro-school-whiteboard": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <rect x="7" y="12" width="50" height="34" rx="4" fill="#9EB9F0" stroke={STROKE} strokeWidth="2.4" />
      <rect x="11" y="16" width="42" height="26" rx="2" fill="#FFFFFF" stroke={STROKE} strokeWidth="1.8" />
      <line x1="16" y1="23" x2="36" y2="23" stroke="#5C92F4" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="16" y1="30" x2="45" y2="30" stroke="#F68B9C" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="16" y1="36.5" x2="31" y2="36.5" stroke="#65C68E" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="16" y="46" width="32" height="4.5" rx="2" fill="#E5E9F0" stroke={STROKE} strokeWidth="2" />
    </svg>
  ),

  "intro-clothes-skirt": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <polygon points="20,18 44,18 53,51 11,51" fill="#F68B9C" stroke={STROKE} strokeLinejoin="round" strokeWidth="2.4" />
      <rect x="20" y="12" width="24" height="6.5" rx="2" fill="#BE8BEA" stroke={STROKE} strokeWidth="2.2" />
      <line x1="27" y1="19" x2="22" y2="50" stroke={STROKE} strokeOpacity="0.35" strokeWidth="2" />
      <line x1="37" y1="19" x2="42" y2="50" stroke={STROKE} strokeOpacity="0.35" strokeWidth="2" />
    </svg>
  ),

  "intro-house-table": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <rect x="16" y="33" width="4" height="17" rx="1.2" fill="#9C6B4B" stroke={STROKE} strokeWidth="2" />
      <rect x="44" y="33" width="4" height="17" rx="1.2" fill="#9C6B4B" stroke={STROKE} strokeWidth="2" />
      <rect x="10" y="33" width="4.5" height="21" rx="1.5" fill="#B57F5C" stroke={STROKE} strokeWidth="2" />
      <rect x="49.5" y="33" width="4.5" height="21" rx="1.5" fill="#B57F5C" stroke={STROKE} strokeWidth="2" />
      <polygon points="10,21 54,21 58,28 6,28" fill="#E5A86E" stroke={STROKE} strokeLinejoin="round" strokeWidth="2.2" />
      <rect x="6" y="28" width="52" height="5.5" rx="1.5" fill="#B57F5C" stroke={STROKE} strokeWidth="2.2" />
    </svg>
  ),

  "intro-house-lamp": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <ellipse cx="32" cy="35" rx="17" ry="6.5" fill="#FFE45E" opacity="0.45" />
      <rect x="29.5" y="32" width="5" height="18" fill="#9EB9F0" stroke={STROKE} strokeWidth="2" />
      <ellipse cx="32" cy="51.5" rx="12.5" ry="4" fill="#6FA6F7" stroke={STROKE} strokeWidth="2.2" />
      <polygon points="21,12 43,12 50,32 14,32" fill="#FBAC5B" stroke={STROKE} strokeLinejoin="round" strokeWidth="2.4" />
      <line x1="38" y1="32" x2="38" y2="39" stroke={STROKE} strokeWidth="1.8" />
      <circle cx="38" cy="40.5" r="2" fill="#FFE45E" stroke={STROKE} strokeWidth="1.5" />
    </svg>
  ),

  "intro-house-kitchen": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <rect x="8" y="9" width="22" height="13" rx="2.5" fill="#E5E9F0" stroke={STROKE} strokeWidth="2" />
      <rect x="34" y="9" width="22" height="13" rx="2.5" fill="#E5E9F0" stroke={STROKE} strokeWidth="2" />
      <rect x="8" y="34" width="48" height="21" rx="2.5" fill="#FFFFFF" stroke={STROKE} strokeWidth="2.2" />
      <rect x="6.5" y="30.5" width="51" height="4.5" rx="1.8" fill="#9EB9F0" stroke={STROKE} strokeWidth="2" />
      <rect x="24" y="38.5" width="16" height="13" rx="2" fill="#6FA6F7" stroke={STROKE} strokeWidth="2" />
      <rect x="27" y="24" width="10" height="6.5" rx="1.8" fill="#FF7A59" stroke={STROKE} strokeWidth="2" />
      <path d="M14 30.5V26a3 3 0 0 1 6 0v1" stroke={STROKE} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),

  "intro-house-refrigerator": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <rect x="17" y="8" width="30" height="48" rx="5" fill="#E5F4EC" stroke={STROKE} strokeWidth="2.4" />
      <line x1="17" y1="25" x2="47" y2="25" stroke={STROKE} strokeWidth="2.2" />
      <rect x="21" y="13.5" width="3" height="7" rx="1.5" fill="#5C92F4" />
      <rect x="21" y="30" width="3" height="14" rx="1.5" fill="#5C92F4" />
    </svg>
  ),

  "intro-house-bookshelf": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <rect x="11" y="8" width="42" height="48" rx="3.5" fill="#B57F5C" stroke={STROKE} strokeWidth="2.4" />
      <rect x="15" y="12" width="34" height="11.5" fill="#FFF7EB" stroke={STROKE} strokeWidth="1.6" />
      <rect x="15" y="27" width="34" height="11.5" fill="#FFF7EB" stroke={STROKE} strokeWidth="1.6" />
      <rect x="15" y="42" width="34" height="10" fill="#FFF7EB" stroke={STROKE} strokeWidth="1.6" />
      <rect x="17" y="14" width="5.5" height="9.5" fill="#F68B9C" stroke={STROKE} strokeWidth="1.4" />
      <rect x="23" y="15" width="5.5" height="8.5" fill="#6FA6F7" stroke={STROKE} strokeWidth="1.4" />
      <rect x="29" y="13.5" width="5.5" height="10" fill="#65C68E" stroke={STROKE} strokeWidth="1.4" />
      <rect x="17" y="29" width="6" height="9.5" fill="#BE8BEA" stroke={STROKE} strokeWidth="1.4" />
      <rect x="24" y="30" width="6" height="8.5" fill="#FBAC5B" stroke={STROKE} strokeWidth="1.4" />
      <rect x="31" y="28.5" width="6" height="10" fill="#50C0D8" stroke={STROKE} strokeWidth="1.4" />
      <rect x="18" y="44" width="7" height="8" fill="#5C92F4" stroke={STROKE} strokeWidth="1.4" />
      <rect x="26" y="43.5" width="7" height="8.5" fill="#65C68E" stroke={STROKE} strokeWidth="1.4" />
    </svg>
  ),

  "intro-house-wardrobe": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <rect x="13" y="9" width="38" height="45" rx="4" fill="#B57F5C" stroke={STROKE} strokeWidth="2.4" />
      <rect x="16.5" y="12.5" width="14.5" height="32" rx="1.8" fill="#D99B66" stroke={STROKE} strokeWidth="1.8" />
      <rect x="33" y="12.5" width="14.5" height="32" rx="1.8" fill="#D99B66" stroke={STROKE} strokeWidth="1.8" />
      <rect x="16.5" y="47" width="31" height="4.5" rx="1.5" fill="#9C6B4B" stroke={STROKE} strokeWidth="1.6" />
      <circle cx="28.5" cy="29" r="1.8" fill="#FFE45E" stroke={STROKE} strokeWidth="1.2" />
      <circle cx="35.5" cy="29" r="1.8" fill="#FFE45E" stroke={STROKE} strokeWidth="1.2" />
    </svg>
  ),

  "intro-house-rug": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <rect x="12" y="17" width="40" height="30" rx="4" fill="#F68B9C" stroke={STROKE} strokeWidth="2.4" />
      <rect x="16.5" y="21.5" width="31" height="21" rx="2" fill="#FFF7EB" stroke={STROKE} strokeWidth="1.8" />
      <polygon points="32,24 41,32 32,40 23,32" fill="#FBAC5B" stroke={STROKE} strokeWidth="1.8" />
      <circle cx="32" cy="32" r="3" fill="#5C92F4" />
    </svg>
  ),

  "intro-bhr-cough": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <path d="M11 52c0-8 5-13 13-13s13 5 13 13" fill="#6FA6F7" stroke={STROKE} strokeWidth="2.2" />
      <circle cx="24" cy="25" r="11" fill="#FCE1C6" stroke={STROKE} strokeWidth="2.2" />
      <ellipse cx="32.5" cy="28.5" rx="2.6" ry="3.2" fill="#D9485F" stroke={STROKE} strokeWidth="1.5" />
      <path d="M39 24c3 1 5 3 6 6M40 31c4 0 7 1 10 4" stroke="#FF6E54" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="51" cy="24" r="2.2" fill="#FF6E54" />
      <circle cx="53" cy="31" r="2.4" fill="#FF6E54" />
    </svg>
  ),

  "intro-bhr-stomachache": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <circle cx="32" cy="14" r="7" fill="#FCE1C6" stroke={STROKE} strokeWidth="2.2" />
      <rect x="20" y="23" width="24" height="31" rx="8" fill="#6FA6F7" stroke={STROKE} strokeWidth="2.2" />
      <circle cx="32" cy="39" r="7.5" fill="#FF6E54" stroke={STROKE} strokeWidth="2" />
      <path d="M12 36l4 2-3 3 4 2M52 36l-4 2 3 3-4 2" stroke="#D9485F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  "intro-bhr-cough-syrup": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <rect x="20" y="10" width="12" height="6" rx="1.8" fill="#FF6E54" stroke={STROKE} strokeWidth="2" />
      <rect x="14" y="20" width="24" height="34" rx="5.5" fill="#FBAC5B" stroke={STROKE} strokeWidth="2.4" />
      <rect x="17" y="28" width="18" height="16" rx="2.5" fill="#FFFFFF" stroke={STROKE} strokeWidth="1.8" />
      <path d="M26 32v8M22 36h8" stroke="#FF6E54" strokeLinecap="round" strokeWidth="2.8" />
      <ellipse cx="48" cy="45" rx="6" ry="4" fill="#E5E9F0" stroke={STROKE} strokeWidth="2" />
      <line x1="48" y1="49" x2="48" y2="56" stroke={STROKE} strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  ),

  "intro-bhr-eye-drops": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <g transform="rotate(-28 24 20)">
        <rect x="16" y="7" width="16" height="18" rx="4" fill="#50C0D8" stroke={STROKE} strokeWidth="2.2" />
        <polygon points="21,25 27,25 24,33" fill="#FFFFFF" stroke={STROKE} strokeWidth="2" />
      </g>
      <path d="M33 32c0 0-3.5 4.5-3.5 6.8a3.5 3.5 0 0 0 7 0C36.5 36.5 33 32 33 32Z" fill="#5C92F4" stroke={STROKE} strokeWidth="1.8" />
      <path d="M12 49c6-8 14-11 21-11s15 3 21 11c-6 8-14 11-21 11s-15-3-21-11Z" fill="#FFFFFF" stroke={STROKE} strokeWidth="2.4" />
      <circle cx="33" cy="49" r="5.5" fill="#5C92F4" stroke={STROKE} strokeWidth="1.8" />
      <circle cx="33" cy="49" r="2.2" fill={STROKE} />
    </svg>
  ),

  "intro-place-pharmacy": () => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 64 64" width="88%" height="88%">
      <rect x="10" y="20" width="44" height="34" rx="3.5" fill="#FFFFFF" stroke={STROKE} strokeWidth="2.4" />
      <rect x="16" y="10" width="32" height="12" rx="3" fill="#65C68E" stroke={STROKE} strokeWidth="2.2" />
      <path d="M32 13v6M29 16h6" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2.6" />
      <rect x="26" y="36" width="12" height="18" rx="2" fill="#50C0D8" stroke={STROKE} strokeWidth="2" />
      <rect x="14" y="27" width="9" height="10" rx="2" fill="#E5F4EC" stroke={STROKE} strokeWidth="1.8" />
      <rect x="41" y="27" width="9" height="10" rx="2" fill="#E5F4EC" stroke={STROKE} strokeWidth="1.8" />
    </svg>
  ),
};

type FallbackStage = "clipart" | "image" | "svg" | "emoji";

function initialStage(item: BookVocabularyItem, preferBadge: boolean): FallbackStage {
  if (preferBadge || VSOT_ITEM_SVGS[item.id]) return "svg";
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

/**
 * Visual resolver for Livro Intro vocabulary cards & category badges.
 * - `variant="badge"` renders the crisp Tier 1 VSoT category badge SVG.
 * - `variant="card"` (default) prioritizes VSoT custom item illustrations (e.g. Coffee cup),
 *   then cleanly falls back through clipartUrl -> imageUrl -> Tier 1 category SVG -> emoji.
 */
export function BookVisual({
  item,
  size = 96,
  className = "",
  variant = "card",
}: {
  item: BookVocabularyItem;
  size?: number;
  className?: string;
  variant?: "badge" | "card";
}) {
  const preferBadge = variant === "badge";
  const [stage, setStage] = useState<FallbackStage>(() =>
    initialStage(item, preferBadge),
  );

  useEffect(() => {
    setStage(initialStage(item, preferBadge));
  }, [item.id, item.clipartUrl, item.imageUrl, item.svgVariant, preferBadge]);

  if (preferBadge) {
    return (
      <CategoryBadgeIcon
        size={size}
        variant={item.svgVariant}
      />
    );
  }

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
          borderRadius: 14,
          flexShrink: 0,
        }}
      />
    );
  }

  if (stage === "svg") {
    const customRender = VSOT_ITEM_SVGS[item.id];
    if (customRender) {
      return (
        <div
          aria-label={item.en}
          className={className}
          role="img"
          style={{
            width: size,
            height: size,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {customRender()}
        </div>
      );
    }

    if (item.svgVariant) {
      return (
        <div
          aria-label={item.en}
          className={className}
          role="img"
          style={{
            width: size,
            height: size,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <CategoryBadgeIcon size={Math.round(size * 0.72)} variant={item.svgVariant} />
        </div>
      );
    }
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
        flexShrink: 0,
      }}
    >
      {item.emoji}
    </span>
  );
}
