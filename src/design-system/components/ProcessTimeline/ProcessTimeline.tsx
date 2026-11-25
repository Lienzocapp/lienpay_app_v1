/**
 * ProcessTimeline — a generic multi-step process progress list.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It renders
 * an ordered list of process steps (used later by Pledge Processing and
 * Activation multi-step progress) from the `steps` it is passed and invents no
 * copy or values — every step label and status is supplied by the caller. Each
 * step's status is conveyed by BOTH a textual/positional cue AND a non-color
 * shape indicator (✓ complete, active dot, pending ring), so status is never
 * signaled by color alone (Req 3.6). Colors come exclusively from design tokens
 * (Req 1.2, 14.5); rounded corners, dark border, near-black surface (Req 3.1,
 * 3.3).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3, 3.6.
 * Design: Components and Interfaces (ProcessTimeline), Accessibility.
 */
import type { ReactNode } from "react";
import styles from "./ProcessTimeline.module.css";

/** Status of a single timeline step. */
export type ProcessStepStatus = "complete" | "active" | "pending";

export interface ProcessStep {
  /** Stable step id. */
  id: string;
  /** Step label — supplied by the caller (no invented copy). */
  label: ReactNode;
  /** Step status. Defaults to "pending" when omitted. */
  status?: ProcessStepStatus;
  /** Optional supporting detail line. */
  detail?: ReactNode;
}

export interface ProcessTimelineProps {
  /** The ordered process steps to render. */
  steps: readonly ProcessStep[];
  /** Accessible label for the timeline list landmark. */
  ariaLabel?: string;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

/** Non-color glyph per status (shape differs so status is not color-only). */
const STATUS_GLYPH: Record<ProcessStepStatus, string> = {
  complete: "✓",
  active: "•",
  pending: "",
};

export function ProcessTimeline({
  steps,
  ariaLabel,
  className,
}: ProcessTimelineProps) {
  const classes = [styles.timeline, className].filter(Boolean).join(" ");

  return (
    <ol className={classes} aria-label={ariaLabel}>
      {steps.map((step) => {
        const status: ProcessStepStatus = step.status ?? "pending";
        const markerClasses = [styles.marker, styles[status]]
          .filter(Boolean)
          .join(" ");
        return (
          <li key={step.id} className={styles.step}>
            <span className={markerClasses} aria-hidden="true">
              {STATUS_GLYPH[status]}
            </span>
            <span className={styles.body}>
              <span className={styles.label}>{step.label}</span>
              {step.detail != null ? (
                <span className={styles.detail}>{step.detail}</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
