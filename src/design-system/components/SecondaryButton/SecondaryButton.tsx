/**
 * SecondaryButton — secondary / less-prominent action button primitive.
 *
 * A GENERIC, reusable primitive authored once (Req 14.1, 14.3, 14.6). Used for
 * back and secondary actions across the flow. Renders caller-supplied content;
 * invents no copy. Colors come exclusively from design tokens (Req 1.2, 14.5);
 * neon accents are reserved for primary actions (Req 3.4), so this button uses
 * the panel/border/primary-white tokens.
 *
 * Accessibility: visible focus indicator (Req 3.7), 44px touch target
 * (Req 15.1), supports a disabled state.
 *
 * Requirements: 14.1, 14.5, 14.6, 3.7, 15.1.
 * Design: Components and Interfaces (SecondaryButton), Accessibility.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./SecondaryButton.module.css";

export interface SecondaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content/label — supplied by the caller (no invented copy). */
  children: ReactNode;
  /** Stretch the button to the full width of its container. */
  fullWidth?: boolean;
}

export function SecondaryButton({
  children,
  fullWidth = false,
  type = "button",
  className,
  ...rest
}: SecondaryButtonProps) {
  const classes = [
    styles.secondaryButton,
    fullWidth ? styles.fullWidth : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    // eslint-disable-next-line react/button-has-type
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
