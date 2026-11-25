/**
 * NotificationItem — a single notification row.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It renders
 * whatever title/body/meta it is given via props (used later by the
 * Notifications screen) and invents no copy. The unread state is conveyed by
 * BOTH a non-color dot indicator AND a visually-hidden "Unread" text label plus
 * a bolder title weight, so it is never signaled by color alone (Req 3.6). When
 * `onClick` is provided the row is a button meeting the 44px touch target
 * (Req 15.1) with a visible focus indicator (Req 3.7); otherwise it is a static
 * row. Colors come exclusively from design tokens (Req 1.2, 14.5); rounded
 * corners, dark border, near-black surface (Req 3.1, 3.3).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3, 3.6, 3.7, 15.1.
 * Design: Components and Interfaces (NotificationItem), Accessibility.
 */
import type { ReactNode } from "react";
import styles from "./NotificationItem.module.css";

export interface NotificationItemProps {
  /** Notification title — supplied by the caller (no invented copy). */
  title: ReactNode;
  /** Optional body text. */
  body?: ReactNode;
  /** Optional supporting meta (e.g. a timestamp). */
  meta?: ReactNode;
  /** Whether the notification is unread. */
  unread?: boolean;
  /** Optional click handler; when set the row renders as a button. */
  onClick?: () => void;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function NotificationItem({
  title,
  body,
  meta,
  unread = false,
  onClick,
  className,
}: NotificationItemProps) {
  const classes = [
    styles.item,
    unread ? styles.unread : null,
    onClick ? styles.interactive : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className={styles.indicator} aria-hidden="true" />
      <span className={styles.body}>
        <span className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          {meta != null ? <span className={styles.meta}>{meta}</span> : null}
        </span>
        {body != null ? <span className={styles.text}>{body}</span> : null}
      </span>
      {unread ? <span className={styles.srOnly}>Unread</span> : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
