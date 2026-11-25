/**
 * navIcons — shared bottom-navigation icon set (presentational).
 *
 * A single, reusable set of line icons for the Pre_Activation_Nav and
 * Active_Account Bottom_Navigation, authored once and consumed by both shells.
 * Every icon is an inline SVG drawn with `currentColor`, so it inherits the
 * token-driven text/accent color from the active/inactive nav item state — no
 * color is hard-coded (Req 1.2, 14.5). Icons are decorative; the visible label
 * remains the accessible name (Req 3.6/3.8), so each SVG is `aria-hidden`.
 */
import type { ReactNode } from "react";

const BASE_PROPS = {
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

/** Home — a house glyph. */
export function HomeIcon(): ReactNode {
  return (
    <svg {...BASE_PROPS}>
      <path d="M4 11.5 12 5l8 6.5" {...STROKE} />
      <path d="M6 10.5V19h12v-8.5" {...STROKE} />
      <path d="M10 19v-4.5h4V19" {...STROKE} />
    </svg>
  );
}

/** Benefits — a gift glyph (matches the pre-activation design reference). */
export function BenefitsIcon(): ReactNode {
  return (
    <svg {...BASE_PROPS}>
      <rect x="3.5" y="9" width="17" height="10.5" rx="2" {...STROKE} />
      <path d="M3.5 12.8h17M12 9v10.5" {...STROKE} />
      <path d="M12 9C11 6.6 9.8 5.4 8.4 5.4a2 2 0 0 0 0 3.6H12Zm0 0c1-2.4 2.2-3.6 3.6-3.6a2 2 0 0 1 0 3.6H12Z" {...STROKE} />
    </svg>
  );
}

/** Learn — an open book glyph. */
export function LearnIcon(): ReactNode {
  return (
    <svg {...BASE_PROPS}>
      <path d="M12 6.5C10.5 5.5 8 5 4.5 5.2v12C8 17 10.5 17.5 12 18.5" {...STROKE} />
      <path d="M12 6.5c1.5-1 4-1.5 7.5-1.3v12C16 17 13.5 17.5 12 18.5" {...STROKE} />
      <path d="M12 6.5v12" {...STROKE} />
    </svg>
  );
}

/** Transactions — a two-way transfer glyph. */
export function TransactionsIcon(): ReactNode {
  return (
    <svg {...BASE_PROPS}>
      <path d="M6 8.5h12l-3-3" {...STROKE} />
      <path d="M18 15.5H6l3 3" {...STROKE} />
    </svg>
  );
}

/** Repayments — a coin / return glyph. */
export function RepaymentsIcon(): ReactNode {
  return (
    <svg {...BASE_PROPS}>
      <circle cx="12" cy="12" r="7.5" {...STROKE} />
      <path d="M12 8v8M9.5 10c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2-1.1 2-2.5 2-2.5.8-2.5 2 1.1 2 2.5 2 2.5-.8 2.5-2" {...STROKE} />
    </svg>
  );
}

/** Portfolio — a segmented donut / allocation glyph. */
export function PortfolioIcon(): ReactNode {
  return (
    <svg {...BASE_PROPS}>
      <circle cx="12" cy="12" r="7.5" {...STROKE} />
      <path d="M12 4.5v7.5l5.3 5.3" {...STROKE} />
    </svg>
  );
}

/** Icon lookup by nav id (pre-activation + active). */
export const NAV_ICONS: Record<string, () => ReactNode> = {
  home: HomeIcon,
  benefits: BenefitsIcon,
  learn: LearnIcon,
  transactions: TransactionsIcon,
  repayments: RepaymentsIcon,
  portfolio: PortfolioIcon,
};
