/**
 * LoadingState — a reusable loading/processing indicator.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It is the
 * single component shown during ALL simulated async operations (Req 13.5) — the
 * caller supplies any label via props; it invents no copy. It exposes an
 * accessible live status (`role="status"`, `aria-live="polite"`) so assistive
 * tech announces the in-progress state. Colors come exclusively from design
 * tokens (Req 1.2, 14.5).
 *
 * The indicator is a bold neon "infinity" (lemniscate) with a glowing segment
 * that travels the loop — a sharp, premium processing motion used before a
 * result screen is reflected. Motion collapses under `prefers-reduced-motion`
 * via the global backstop (Req 4.8, 16.6).
 *
 * Requirements: 14.1, 14.5, 14.6, 13.5.
 * Design: Components and Interfaces (LoadingState), Error Handling.
 */
import type { ReactNode } from "react";
import styles from "./LoadingState.module.css";

export interface LoadingStateProps {
  /** Optional label describing what is loading — supplied by the caller. */
  label?: ReactNode;
  /** Accessible name for the status region when no visible label is shown. */
  ariaLabel?: string;
  /** Render at the larger, centered "processing" scale (e.g. payment flow). */
  large?: boolean;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

/** The lemniscate (∞) path, normalised to pathLength 100 for resolution-free dashing. */
const INFINITY_PATH =
  "M20,25 C20,12 34,12 40,25 C46,38 60,38 66,25 C72,12 86,12 86,25 C86,38 72,38 66,25 C60,12 46,12 40,25 C34,38 20,38 20,25 Z";

export function LoadingState({
  label,
  ariaLabel,
  large = false,
  className,
}: LoadingStateProps) {
  const classes = [styles.loading, large ? styles.large : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label == null ? ariaLabel : undefined}
    >
      <span className={styles.infinity} aria-hidden="true">
        <svg viewBox="0 0 106 50" className={styles.infinitySvg}>
          <path className={styles.track} d={INFINITY_PATH} pathLength={100} />
          <path className={styles.arc} d={INFINITY_PATH} pathLength={100} />
        </svg>
      </span>
      {label != null ? <span className={styles.label}>{label}</span> : null}
    </div>
  );
}
