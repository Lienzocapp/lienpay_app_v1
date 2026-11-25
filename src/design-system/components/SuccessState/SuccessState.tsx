/**
 * SuccessState — a reusable success confirmation block.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). Used for
 * Activation Success and payment success; the caller supplies the title,
 * message, and any action via props — it invents no copy. Success is conveyed by
 * BOTH a non-color check glyph AND the accent color so it is never signaled by
 * color alone (Req 3.6). It announces itself politely via `role="status"`.
 * Colors come exclusively from design tokens (Req 1.2, 14.5).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.6, 11.7.
 * Design: Components and Interfaces (SuccessState).
 */
import type { ReactNode } from "react";
import styles from "./SuccessState.module.css";

export interface SuccessStateProps {
  /** Success title — supplied by the caller (no invented copy). */
  title: ReactNode;
  /** Optional supporting message — supplied by the caller. */
  message?: ReactNode;
  /** Optional action(s) (e.g. a PrimaryButton) supplied by the caller. */
  action?: ReactNode;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function SuccessState({
  title,
  message,
  action,
  className,
}: SuccessStateProps) {
  const classes = [styles.state, className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="status" aria-live="polite">
      <span className={styles.icon} aria-hidden="true">
        ✓
      </span>
      <span className={styles.title}>{title}</span>
      {message != null ? <p className={styles.message}>{message}</p> : null}
      {action != null ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
