/**
 * payIcons — line icons for the Pay actions (presentational). Inline SVGs drawn
 * with `currentColor` (no hard-coded color — Req 1.2, 14.5); decorative, so
 * each is `aria-hidden` (the visible label is the accessible name).
 */
import type { ReactNode } from "react";

const BASE = {
  viewBox: "0 0 24 24",
  width: 22,
  height: 22,
  fill: "none",
  "aria-hidden": true,
} as const;

const S = {
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Scan QR — a QR frame glyph. */
export function ScanIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <path d="M4 8.5V5.5A1.5 1.5 0 0 1 5.5 4h3M15.5 4h3A1.5 1.5 0 0 1 20 5.5v3M20 15.5v3a1.5 1.5 0 0 1-1.5 1.5h-3M8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3" {...S} />
      <path d="M7.5 12h9" {...S} />
    </svg>
  );
}

/** Enter UPI ID — an @ glyph. */
export function UpiIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <circle cx="12" cy="12" r="3.2" {...S} />
      <path d="M15.2 12v1.3a2 2 0 0 0 3.3 1.5A8 8 0 1 0 15 19" {...S} />
    </svg>
  );
}

/** Pay Contact — a person glyph. */
export function ContactIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <circle cx="12" cy="8.5" r="3.5" {...S} />
      <path d="M5.5 19.5c0-3 2.9-5 6.5-5s6.5 2 6.5 5" {...S} />
    </svg>
  );
}

/** Bills — a receipt glyph. */
export function BillsIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <path d="M6 3.5h12v17l-2.5-1.5L13 20.5 10.5 19 8 20.5 6 20.5V3.5Z" {...S} />
      <path d="M9 8h6M9 11.5h6M9 15h4" {...S} />
    </svg>
  );
}

/** Success check for the payment success state. */
export function CheckIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} fill="none" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" {...S} />
    </svg>
  );
}
