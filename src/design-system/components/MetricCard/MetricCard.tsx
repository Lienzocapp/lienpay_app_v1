/**
 * MetricCard — a compact card presenting a single labelled metric.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). Used for
 * Credit_Limit / Available / Used / LTV style metrics. It renders whatever
 * label/value it is given via props and invents no copy or values. The value
 * is rendered with the central `text-financial-figure` typography style so key
 * financial metrics are always >= 1.5x the adjacent label (Req 2.3); when a
 * numeric (paise) value is passed it is formatted via the central INR formatter
 * (Req 12.4). Non-currency metrics (e.g. an LTV percentage string) are passed
 * as strings and rendered verbatim.
 *
 * `emphasis` optionally tints the value with the neon accent (a valid token
 * usage for key financial figures — Req 1.5); by default the value uses the
 * primary text token. Colors come exclusively from design tokens (Req 1.2,
 * 14.5); rounded corners, dark border, near-black surface (Req 3.1, 3.3).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3, 2.3, 12.4.
 * Design: Components and Interfaces (MetricCard).
 */
import type { ReactNode } from "react";
import styles from "./MetricCard.module.css";
import { toDisplayValue } from "../_shared/financialValue";
import type { FinancialValue } from "../_shared/financialValue";

export interface MetricCardProps {
  /** Metric label — supplied by the caller (no invented copy). */
  label: ReactNode;
  /** The metric value: a display string, or integer paise to be formatted. */
  value: FinancialValue;
  /** Tint the value with the neon accent (for a highlighted key metric). */
  emphasis?: boolean;
  /** Optional supporting text shown beneath the value. */
  caption?: ReactNode;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function MetricCard({
  label,
  value,
  emphasis = false,
  caption,
  className,
}: MetricCardProps) {
  const valueClasses = [
    "text-financial-figure",
    styles.value,
    emphasis ? styles.valueEmphasis : null,
  ]
    .filter(Boolean)
    .join(" ");

  const classes = [styles.card, className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <span className={styles.label}>{label}</span>
      <span className={valueClasses}>{toDisplayValue(value)}</span>
      {caption != null ? <span className={styles.caption}>{caption}</span> : null}
    </div>
  );
}
