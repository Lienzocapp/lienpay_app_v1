/**
 * StatusCard — a card presenting a labelled status (verification / pledge /
 * mandate, etc.).
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It renders
 * whatever title/status/description it is given via props and invents no copy.
 * The status is conveyed by BOTH a textual status value AND a non-color shape
 * indicator (so state is never signaled by color alone — Req 3.6). Colors come
 * exclusively from design tokens (Req 1.2, 14.5); rounded corners, dark border,
 * near-black surface (Req 3.1, 3.3).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3, 3.6.
 * Design: Components and Interfaces (StatusCard), Accessibility.
 */
import type { ReactNode } from "react";
import styles from "./StatusCard.module.css";

/** Visual tone for the non-color indicator; all tones stay token-based. */
export type StatusTone = "neutral" | "success" | "pending" | "error";

export interface StatusCardProps {
  /** Title of the item whose status is shown — supplied by the caller. */
  title: ReactNode;
  /** The status text (e.g. "Verified", "Processing") — supplied by the caller. */
  status: ReactNode;
  /** Visual tone driving the non-color indicator shape. Defaults to neutral. */
  tone?: StatusTone;
  /** Optional supporting description. */
  description?: ReactNode;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

/** Non-color glyph per tone (shape differs so tone is not color-only, Req 3.6). */
const TONE_GLYPH: Record<StatusTone, string> = {
  neutral: "•",
  success: "✓",
  pending: "…",
  error: "!",
};

export function StatusCard({
  title,
  status,
  tone = "neutral",
  description,
  className,
}: StatusCardProps) {
  const classes = [styles.card, className].filter(Boolean).join(" ");
  const indicatorClasses = [styles.indicator, styles[tone]]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className={styles.header}>
        <span className={indicatorClasses} aria-hidden="true">
          {TONE_GLYPH[tone]}
        </span>
        <span className={styles.title}>{title}</span>
        <span className={styles.status}>{status}</span>
      </div>
      {description != null ? (
        <p className={styles.description}>{description}</p>
      ) : null}
    </div>
  );
}
