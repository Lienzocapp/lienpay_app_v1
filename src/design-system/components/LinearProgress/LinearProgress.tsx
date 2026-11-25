/**
 * LinearProgress — a thin horizontal progress bar with optional end labels.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It renders
 * a rounded dark inactive track with a green active fill, plus optional start /
 * end labels beneath (e.g. "0" … "₹80,000"), matching the credit-utilisation
 * bar in the LienPay Active Home reference.
 *
 * Colors come exclusively from design tokens (Req 1.2, 14.5): the track uses a
 * token-derived surface and the fill uses the neon accent (valid for a key
 * financial indicator — Req 1.5). The bar exposes `role="progressbar"` with
 * aria value attributes so progress is available to assistive tech, not just
 * conveyed by color (Req 3.6).
 */
import type { ReactNode } from "react";
import styles from "./LinearProgress.module.css";

export interface LinearProgressProps {
  /** Progress value in the range 0–100 (clamped). */
  value: number;
  /** Optional label shown beneath the start (left) of the track. */
  startLabel?: ReactNode;
  /** Optional label shown beneath the end (right) of the track. */
  endLabel?: ReactNode;
  /** Accessible label describing what the bar represents. */
  ariaLabel?: string;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function LinearProgress({
  value,
  startLabel,
  endLabel,
  ariaLabel,
  className,
}: LinearProgressProps) {
  const pct = clamp(value, 0, 100);
  const classes = [styles.wrap, className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      {startLabel != null || endLabel != null ? (
        <div className={styles.labels}>
          <span className={styles.startLabel}>{startLabel}</span>
          <span className={styles.endLabel}>{endLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
