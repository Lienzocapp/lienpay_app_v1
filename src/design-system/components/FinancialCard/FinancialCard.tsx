/**
 * FinancialCard — a card that presents a key financial figure with its label.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It renders
 * whatever label/value it is given via props and invents no screen copy or
 * financial values. The figure is rendered with the central typography
 * `text-financial-figure` style so it is always >= 1.5x the adjacent label/body
 * text (Req 2.3); when a numeric (paise) value is passed it is formatted via the
 * central INR formatter (Req 12.4). Colors come exclusively from design tokens
 * (Req 1.2, 14.5); the card uses rounded corners, a dark border, and a near-black
 * panel surface with high-contrast text (Req 3.1, 3.3).
 *
 * The `hero` variant renders the single primary/hero figure larger; glow is not
 * applied here (glow limits are enforced by the screens/animation layer, Req 1.6).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3, 2.3, 12.4.
 * Design: Components and Interfaces (FinancialCard).
 */
import type { ReactNode } from "react";
import styles from "./FinancialCard.module.css";
import { toDisplayValue } from "../_shared/financialValue";
import type { FinancialValue } from "../_shared/financialValue";

export interface FinancialCardProps {
  /** Label describing the figure — supplied by the caller (no invented copy). */
  label: ReactNode;
  /** The financial figure: a display string, or integer paise to be formatted. */
  value: FinancialValue;
  /** Optional supporting text shown beneath the figure. */
  caption?: ReactNode;
  /** Render the single primary/hero figure at the larger hero scale. */
  hero?: boolean;
  /** Optional extra content (e.g. a trailing control) rendered below. */
  children?: ReactNode;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function FinancialCard({
  label,
  value,
  caption,
  hero = false,
  children,
  className,
}: FinancialCardProps) {
  const figureClasses = [
    "text-financial-figure",
    hero ? "text-financial-figure--hero" : null,
    styles.figure,
  ]
    .filter(Boolean)
    .join(" ");

  const classes = [styles.card, hero ? styles.hero : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      <span className={styles.label}>{label}</span>
      <span className={figureClasses}>{toDisplayValue(value)}</span>
      {caption != null ? <span className={styles.caption}>{caption}</span> : null}
      {children}
    </section>
  );
}
