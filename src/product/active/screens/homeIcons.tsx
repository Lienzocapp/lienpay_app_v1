/**
 * homeIcons — inline line icons for the Active Home screen (presentational).
 *
 * Each icon is an inline SVG drawn with `currentColor`, so it inherits the
 * token-driven color from its container — no color is hard-coded (Req 1.2,
 * 14.5). Icons are decorative; adjacent text carries the meaning, so each SVG is
 * `aria-hidden`. These mirror the glyphs shown in the LienPay Active Home
 * reference (calendar, shield, info, trend, gift, chevron).
 */
import type { ReactNode } from "react";

const BASE = {
  viewBox: "0 0 24 24",
  width: 22,
  height: 22,
  fill: "none",
  "aria-hidden": true,
} as const;

const STROKE = {
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Calendar glyph — next payment due. */
export function CalendarIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <rect x="4" y="5.5" width="16" height="15" rx="3" {...STROKE} />
      <path d="M4 9.5h16M8 3.5v4M16 3.5v4" {...STROKE} />
      <path d="M8.5 14h3.5" {...STROKE} />
    </svg>
  );
}

/** Shield glyph — credit health. */
export function ShieldIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <path d="M12 3.5l6.5 2.4v5.3c0 4-2.7 6.9-6.5 8.3-3.8-1.4-6.5-4.3-6.5-8.3V5.9L12 3.5Z" {...STROKE} />
      <path d="M9.2 11.8l2 2 3.6-3.8" {...STROKE} />
    </svg>
  );
}

/** Info glyph — supporting detail affordance. */
export function InfoIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" aria-hidden={true}>
      <circle cx="12" cy="12" r="8.5" {...STROKE} />
      <path d="M12 11v5M12 7.75v.5" {...STROKE} />
    </svg>
  );
}

/** Upward trend glyph — increase available credit. */
export function TrendIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <path d="M4 15.5 9.5 10l3.5 3.5L20 6.5" {...STROKE} />
      <path d="M15 6.5h5v5" {...STROKE} />
    </svg>
  );
}

/** Interest-free tracker glyph — a clock/timer. */
export function TimerIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <circle cx="12" cy="13" r="7.5" {...STROKE} />
      <path d="M12 9v4l2.5 1.5M9.5 3.5h5" {...STROKE} />
    </svg>
  );
}

/** Gift glyph — rewards earned. */
export function GiftIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <rect x="4.5" y="10" width="15" height="9.5" rx="2" {...STROKE} />
      <path d="M4 10h16M12 10v9.5" {...STROKE} />
      <path d="M12 10S10.5 6 8.5 6.2C7 6.3 6.6 8 7.6 9c1 .9 4.4 1 4.4 1Zm0 0s1.5-4 3.5-3.8C17 6.3 17.4 8 16.4 9c-1 .9-4.4 1-4.4 1Z" {...STROKE} />
    </svg>
  );
}

/** Chevron-right glyph — a forward affordance on list rows / pills. */
export function ChevronRightIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden={true}>
      <path d="M9.5 6l6 6-6 6" {...STROKE} />
    </svg>
  );
}

/** Magnifying-glass glyph — the transaction search field affordance. */
export function SearchIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden={true}>
      <circle cx="11" cy="11" r="6.5" {...STROKE} />
      <path d="M20 20l-3.8-3.8" {...STROKE} />
    </svg>
  );
}
