/**
 * Modal — a centered accessible dialog overlay.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). Used for
 * confirmations, agreement, and error surfaces; all content (title, body,
 * actions) is supplied by the caller via props/children — it invents no copy.
 * It is an accessible dialog: `role="dialog"`, `aria-modal`, labelled by its
 * title, with focus moved into the dialog on open, focus restored on close, a
 * focus trap, and Escape-to-close (via the shared `useDialog` behavior). Colors
 * come exclusively from design tokens (Req 1.2, 14.5); rounded corners, dark
 * border, near-black surface (Req 3.1, 3.3).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3, 3.7.
 * Design: Components and Interfaces (Modal), Accessibility, Error Handling.
 */
import { useId, useRef } from "react";
import type { ReactNode } from "react";
import styles from "./Modal.module.css";
import { useDialog } from "../_shared/useDialog";

export interface ModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Called when the modal requests to close (Escape or backdrop click). */
  onClose?: () => void;
  /** Optional title — supplied by the caller; also names the dialog. */
  title?: ReactNode;
  /** Modal body content — supplied by the caller. */
  children?: ReactNode;
  /** Optional footer actions (e.g. confirm/cancel) supplied by the caller. */
  actions?: ReactNode;
  /** Whether clicking the backdrop closes the modal. Defaults to true. */
  closeOnBackdrop?: boolean;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useDialog({ open, containerRef, onClose });

  if (!open) return null;

  const classes = [styles.dialog, className].filter(Boolean).join(" ");

  return (
    <div
      className={styles.backdrop}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={classes}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title != null ? titleId : undefined}
        ref={containerRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        {title != null ? (
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
        ) : null}
        <div className={styles.body}>{children}</div>
        {actions != null ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </div>
  );
}
