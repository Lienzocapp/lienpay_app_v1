/**
 * ArcGauge — an open (~270°) speedometer-style progress gauge.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). Unlike the
 * full-circle `ProgressRing` (kept intact for screens that use it), this renders
 * an OPEN arc with a rounded progress end and a small end-knob, matching the
 * utilisation / credit-health gauges in the LienPay Active Home reference.
 *
 * Colors come exclusively from design tokens (Req 1.2, 14.5): the inactive track
 * uses the border token and the progress arc uses the neon accent (valid token
 * usage for a key financial indicator — Req 1.5) with a restrained glow. The
 * value is ALSO shown as centered text, so progress is never conveyed by color
 * alone (Req 3.6). The whole gauge exposes an accessible label via `role="img"`.
 */
import type { ReactNode } from "react";
import styles from "./ArcGauge.module.css";

export interface ArcGaugeProps {
  /** Progress value in the range 0–100 (clamped). */
  value: number;
  /** Diameter in px. Defaults to 96. */
  size?: number;
  /** Stroke width in px. Defaults to 9. */
  stroke?: number;
  /**
   * Total sweep of the open arc in degrees (the gap sits at the bottom).
   * Defaults to 270.
   */
  sweep?: number;
  /** Centered value text (e.g. "22%" or "Safe"). */
  centerLabel?: ReactNode;
  /** Small caption beneath the center value. */
  centerCaption?: ReactNode;
  /** Accessible label describing what the gauge represents. */
  ariaLabel?: string;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Point on a circle for an angle measured clockwise from +x (screen y-down). */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** SVG arc path between two angles (clockwise). */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function ArcGauge({
  value,
  size = 96,
  stroke = 9,
  sweep = 270,
  centerLabel,
  centerCaption,
  ariaLabel,
  className,
}: ArcGaugeProps) {
  const pct = clamp(value, 0, 100);
  const center = size / 2;
  const radius = (size - stroke) / 2;

  // Center the open gap at the bottom (90° in screen coords). The arc therefore
  // starts at (90 + gap/2) and sweeps `sweep` degrees clockwise.
  const gap = 360 - sweep;
  const startDeg = 90 + gap / 2;
  const endDeg = startDeg + sweep;
  const progressDeg = startDeg + (sweep * pct) / 100;
  const knob = polar(center, center, radius, progressDeg);

  const classes = [styles.gauge, className].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <path
          className={styles.track}
          d={arcPath(center, center, radius, startDeg, endDeg)}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {pct > 0 ? (
          <path
            className={styles.arc}
            d={arcPath(center, center, radius, startDeg, progressDeg)}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        ) : null}
        {pct > 0 ? (
          <circle
            className={styles.knob}
            cx={knob.x}
            cy={knob.y}
            r={stroke / 2 + 1.5}
          />
        ) : null}
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
