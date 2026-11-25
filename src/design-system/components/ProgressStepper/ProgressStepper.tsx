/**
 * ProgressStepper — a generic step-position indicator.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It shows
 * the current position within a fixed-length flow as a number (e.g. "Step 7 of
 * 20") plus a visual track of segments. It supports ANY total generically — in
 * particular the 1..20 Pre_Activation_Flow position (Req 5.4) — but performs NO
 * screen wiring and invents no copy: the `current`/`total` values and the
 * optional label are supplied entirely by the caller.
 *
 * Accessibility: exposes an ARIA progressbar (role="progressbar") with
 * `aria-valuemin`/`aria-valuemax`/`aria-valuenow` and a human-readable
 * `aria-valuetext`, so assistive tech announces the position; the visible
 * number label is authoritative so state is never conveyed by color alone
 * (Req 3.6). Colors come exclusively from design tokens (Req 1.2, 14.5).
 *
 * The `current` value is clamped into `[1, total]` defensively so an
 * out-of-range prop never breaks rendering.
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3, 3.6; supports 5.4.
 * Design: Components and Interfaces (ProgressStepper).
 */
import type { ReactNode } from "react";
import styles from "./ProgressStepper.module.css";

export interface ProgressStepperProps {
  /** The current 1-based step position. Clamped into [1, total]. */
  current: number;
  /** The total number of steps (e.g. 20 for the Pre_Activation_Flow). */
  total: number;
  /**
   * Optional label rendered before the "X of Y" position text. When omitted the
   * position text is shown on its own (no invented copy).
   */
  label?: ReactNode;
  /**
   * Word joining the two numbers in the visible/announced position text.
   * Defaults to "of" (a neutral connector, not screen copy).
   */
  separatorWord?: string;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export function ProgressStepper({
  current,
  total,
  label,
  separatorWord = "of",
  className,
}: ProgressStepperProps) {
  const safeTotal = Math.max(1, Math.trunc(total));
  const safeCurrent = clamp(Math.trunc(current), 1, safeTotal);
  const positionText = `${safeCurrent} ${separatorWord} ${safeTotal}`;
  const valueText = label != null ? undefined : positionText;

  const classes = [styles.stepper, className].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={safeTotal}
      aria-valuenow={safeCurrent}
      aria-valuetext={valueText}
    >
      <div className={styles.textRow}>
        {label != null ? <span className={styles.label}>{label}</span> : null}
        <span className={styles.position}>{positionText}</span>
      </div>
      <ol className={styles.track} aria-hidden="true">
        {Array.from({ length: safeTotal }, (_, i) => {
          const index = i + 1;
          const isDone = index < safeCurrent;
          const isCurrent = index === safeCurrent;
          const segClasses = [
            styles.segment,
            isDone ? styles.segmentDone : null,
            isCurrent ? styles.segmentCurrent : null,
          ]
            .filter(Boolean)
            .join(" ");
          return <li key={index} className={segClasses} />;
        })}
      </ol>
    </div>
  );
}
