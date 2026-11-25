/**
 * ErrorState — a reusable error/failure block.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). Used for
 * validation and mock-failure states; the caller supplies the title, message,
 * and any retry action via props — it invents no copy. The error is conveyed by
 * BOTH a non-color glyph AND text so it is never signaled by color alone
 * (Req 3.6), and it announces itself assertively via `role="alert"`. Colors come
 * exclusively from design tokens (Req 1.2, 14.5) — no red is introduced; the
 * high-contrast primary/secondary text tokens carry the message.
 *
 * Requirements: 14.1, 14.5, 14.6, 3.6, 11.8, 13.5.
 * Design: Components and Interfaces (ErrorState), Error Handling.
 */
import type { ReactNode } from "react";
import styles from "./ErrorState.module.css";

export interface ErrorStateProps {
  /** Error title — supplied by the caller (no invented copy). */
  title: ReactNode;
  /** Optional supporting message — supplied by the caller. */
  message?: ReactNode;
  /** Optional action(s) (e.g. a retry button) supplied by the caller. */
  action?: ReactNode;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function ErrorState({
  title,
  message,
  action,
  className,
}: ErrorStateProps) {
  const classes = [styles.state, className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="alert">
      <span className={styles.icon} aria-hidden="true">
        !
      </span>
      <span className={styles.title}>{title}</span>
      {message != null ? <p className={styles.message}>{message}</p> : null}
      {action != null ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
