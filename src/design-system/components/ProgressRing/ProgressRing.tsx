/**
 * ProgressRing — a compact circular progress indicator (donut).
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It renders
 * a track ring plus a progress arc for a 0–100 value, with an optional centered
 * value + caption. Used for the credit-utilisation / LTV rings shown in the
 * LienPay reference. Colors come exclusively from design tokens (Req 1.2, 14.5)
 * via `currentColor` on each ring segment; the progress arc uses the neon accent
 * (valid token usage for a key financial indicator — Req 1.5). Progress is
 * conveyed by BOTH the arc AND the centered numeric text, so it is never
 * signalled by color alone (Req 3.6).
 */
import type { ReactNode } from "react";
import styles from "./ProgressRing.module.css";

export interface ProgressRingProps {
  /** Progress value in the range 0–100 (clamped). */
  value: number;
  /** Diameter in px. Defaults to 72. */
  size?: number;
  /** Stroke width in px. Defaults to 8. */
  stroke?: number;
  /** Centered value text (e.g. "22%"). */
  centerLabel?: ReactNode;
  /** Small caption beneath the center value. */
  centerCaption?: ReactNode;
  /** Accessible label describing what the ring represents. */
  ariaLabel?: string;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function ProgressRing({
  value,
  size = 72,
  stroke = 8,
  centerLabel,
  centerCaption,
  ariaLabel,
  className,
}: ProgressRingProps) {
  const pct = clamp(value, 0, 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;
  const center = size / 2;

  const classes = [styles.ring, className].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className={styles.track}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className={styles.arc}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      {centerLabel != null || centerCaption != null ? (
        <div className={styles.center}>
          {centerLabel != null ? (
            <span className={styles.value}>{centerLabel}</span>
          ) : null}
          {centerCaption != null ? (
            <span className={styles.caption}>{centerCaption}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
