/**
 * CreditHealthCard — a card presenting the Credit_Health display value.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It renders
 * whatever label/health value it is given via props and invents no copy or
 * values (the Credit_Health value — e.g. "Healthy" — is supplied by the caller
 * from central state, never recomputed here). The health status is conveyed by
 * BOTH the textual value AND a non-color shape indicator, so state is never
 * signaled by color alone (Req 3.6). The value renders with the central
 * `text-financial-figure` typography style so this key metric is >= 1.5x the
 * adjacent label/body text (Req 2.3). Colors come exclusively from design tokens
 * (Req 1.2, 14.5); rounded corners, dark border, near-black surface (Req 3.1,
 * 3.3).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3, 3.6, 2.3.
 * Design: Components and Interfaces (CreditHealthCard), Accessibility.
 */
import type { ReactNode } from "react";
import styles from "./CreditHealthCard.module.css";

/** Visual tone driving the non-color indicator; all tones stay token-based. */
export type CreditHealthTone = "healthy" | "neutral" | "caution";

export interface CreditHealthCardProps {
  /** Label describing the metric — supplied by the caller (no invented copy). */
  label: ReactNode;
  /** The Credit_Health display value (e.g. "Healthy") — supplied by the caller. */
  health: ReactNode;
  /** Visual tone driving the non-color indicator shape. Defaults to healthy. */
  tone?: CreditHealthTone;
  /** Optional supporting text shown beneath the value. */
  caption?: ReactNode;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

/** Non-color glyph per tone (shape differs so tone is not color-only, Req 3.6). */
const TONE_GLYPH: Record<CreditHealthTone, string> = {
  healthy: "✓",
  neutral: "•",
  caution: "!",
};

export function CreditHealthCard({
  label,
  health,
  tone = "healthy",
  caption,
  className,
}: CreditHealthCardProps) {
  const classes = [styles.card, className].filter(Boolean).join(" ");
  const indicatorClasses = [styles.indicator, styles[tone]]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      <span className={styles.label}>{label}</span>
      <span className={styles.valueRow}>
        <span className={indicatorClasses} aria-hidden="true">
          {TONE_GLYPH[tone]}
        </span>
        <span className={`text-financial-figure ${styles.value}`}>{health}</span>
      </span>
      {caption != null ? <span className={styles.caption}>{caption}</span> : null}
    </section>
  );
}
