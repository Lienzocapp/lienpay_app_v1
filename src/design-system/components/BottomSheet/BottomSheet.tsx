/**
 * BottomSheet — an accessible dialog that slides up from the bottom.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). Used for
 * Pay actions (Scan QR, UPI ID, Contact, Bills) and confirmations; all content
 * is supplied by the caller via props/children — it invents no copy. It is an
 * accessible dialog: `role="dialog"`, `aria-modal`, labelled by its title, with
 * focus moved into the sheet on open, focus restored on close, a focus trap, and
 * Escape-to-close (via the shared `useDialog` behavior). Colors come exclusively
 * from design tokens (Req 1.2, 14.5); rounded top corners, dark border,
 * near-black surface (Req 3.1, 3.3).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3, 3.7.
 * Design: Components and Interfaces (BottomSheet), Accessibility.
 */
import { useId, useRef } from "react";
import type { ReactNode } from "react";
import styles from "./BottomSheet.module.css";
import { useDialog } from "../_shared/useDialog";

export interface BottomSheetProps {
  /** Whether the bottom sheet is open. */
  open: boolean;
  /** Called when the sheet requests to close (Escape or backdrop click). */
  onClose?: () => void;
  /** Optional title — supplied by the caller; also names the dialog. */
  title?: ReactNode;
  /** Sheet content — supplied by the caller. */
  children?: ReactNode;
  /** Whether clicking the backdrop closes the sheet. Defaults to true. */
  closeOnBackdrop?: boolean;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  closeOnBackdrop = true,
  className,
}: BottomSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useDialog({ open, containerRef, onClose });

  if (!open) return null;

  const classes = [styles.sheet, className].filter(Boolean).join(" ");

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
        <span className={styles.handle} aria-hidden="true" />
        {title != null ? (
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
        ) : null}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
