/**
 * verifyIcons — shared line icons for the activation-journey screens
 * (presentational). Each is an inline SVG drawn with `currentColor`, so it
 * inherits the token-driven color of its badge — no hard-coded color (Req 1.2,
 * 14.5). Icons are decorative (the visible headings/labels are authoritative),
 * so each is `aria-hidden`.
 */
import type { ReactNode } from "react";

const BASE = {
  viewBox: "0 0 24 24",
  width: 28,
  height: 28,
  fill: "none",
  "aria-hidden": true,
} as const;

const S = {
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Identity / KYC — a shield with a check. */
export function IdentityIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <path d="M12 3.5 5 6v5.5c0 4.2 3 7.2 7 9 4-1.8 7-4.8 7-9V6l-7-2.5Z" {...S} />
      <path d="M9 11.5l2 2 4-4" {...S} />
    </svg>
  );
}

/** Aadhaar — an ID card glyph. */
export function AadhaarIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" {...S} />
      <circle cx="8.5" cy="11" r="2" {...S} />
      <path d="M13 10h4M13 13.5h4M5.5 15c.6-1.4 4.4-1.4 5 0" {...S} />
    </svg>
  );
}

/** Selfie — a face glyph. */
export function SelfieIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <circle cx="12" cy="12" r="8" {...S} />
      <circle cx="9.5" cy="10.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="10.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M9 14.5c1.6 1.4 4.4 1.4 6 0" {...S} />
    </svg>
  );
}

/** Bank — a bank building glyph. */
export function BankIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <path d="M4 9.5 12 5l8 4.5" {...S} />
      <path d="M5.5 9.5v7M9.5 9.5v7M14.5 9.5v7M18.5 9.5v7" {...S} />
      <path d="M4 19.5h16" {...S} />
    </svg>
  );
}

/** Mandate / auto-debit — a recurring arrows + rupee glyph. */
export function MandateIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <path d="M5 9a7 7 0 0 1 12-3l2 2" {...S} />
      <path d="M19 5v4h-4" {...S} />
      <path d="M19 15a7 7 0 0 1-12 3l-2-2" {...S} />
      <path d="M5 19v-4h4" {...S} />
    </svg>
  );
}

/** Agreement / document — a page with lines glyph. */
export function DocumentIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <path d="M6.5 3.5h7L18 8v12.5H6.5V3.5Z" {...S} />
      <path d="M13 3.5V8h5" {...S} />
      <path d="M9 12h6M9 15h6M9 18h3" {...S} />
    </svg>
  );
}

/** e-Sign — a signature underline glyph. */
export function SignIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <path d="M4 16c2-1 3-6 4.5-6S10 15 11.5 15 13-3 15 4c1 3.5 1.5 8 3 8" {...S} />
      <path d="M4 20h16" {...S} />
    </svg>
  );
}

/** Final review — a checklist clipboard glyph. */
export function ReviewIcon(): ReactNode {
  return (
    <svg {...BASE}>
      <rect x="5" y="4.5" width="14" height="16" rx="2.5" {...S} />
      <path d="M9 4.5V3.5h6v1" {...S} />
      <path d="M8.5 10l1.5 1.5 2.5-3M8.5 15.5l1.5 1.5 2.5-3" {...S} />
    </svg>
  );
}
