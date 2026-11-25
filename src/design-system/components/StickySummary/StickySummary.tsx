/**
 * StickySummary — a sticky summary bar pinned to the bottom of a screen.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It renders
 * whatever summary content and actions it is given via props/children (used
 * later by Fund Selection / Pledge / Review summaries) and invents no copy or
 * values. It stays pinned to the bottom of its scroll container via
 * `position: sticky`. Colors come exclusively from design tokens (Req 1.2,
 * 14.5); rounded corners, dark border, near-black surface (Req 3.1, 3.3).
 *
 * The summary is exposed as a labelled region so assistive tech can find it.
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3.
 * Design: Components and Interfaces (StickySummary).
 */
import type { ReactNode } from "react";
import styles from "./StickySummary.module.css";

export interface StickySummaryProps {
  /**
   * Summary content (e.g. a selected-count / total block). Supplied by the
   * caller — either via `children` or these optional label/value slots.
   */
  children?: ReactNode;
  /** Optional label for a headline figure (no invented copy). */
  label?: ReactNode;
  /** Optional headline value shown beside the label. */
  value?: ReactNode;
  /** Optional actions slot (e.g. a primary button), rendered trailing. */
  actions?: ReactNode;
  /** Accessible label for the summary region. */
  ariaLabel?: string;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function StickySummary({
  children,
  label,
  value,
  actions,
  ariaLabel,
  className,
}: StickySummaryProps) {
  const classes = [styles.summary, className].filter(Boolean).join(" ");
  const hasHeadline = label != null || value != null;

  return (
    <section className={classes} aria-label={ariaLabel}>
      <div className={styles.content}>
        {hasHeadline ? (
          <div className={styles.headline}>
            {label != null ? <span className={styles.label}>{label}</span> : null}
            {value != null ? <span className={styles.value}>{value}</span> : null}
          </div>
        ) : null}
        {children}
      </div>
      {actions != null ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  );
}
