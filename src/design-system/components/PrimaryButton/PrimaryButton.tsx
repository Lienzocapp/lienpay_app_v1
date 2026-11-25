/**
 * PrimaryButton — the primary call-to-action button primitive.
 *
 * A GENERIC, reusable primitive authored once and shared by both experiences
 * (Req 14.1, 14.3, 14.6). It renders whatever label/content it is given via
 * `children`; it invents no screen copy. Styling comes exclusively from the
 * design tokens (Req 1.2, 14.5) — the neon green CTA background with near-black
 * foreground is expressed through tokens, never literal colors.
 *
 * Accessibility:
 *  - visible keyboard focus indicator (Req 3.7)
 *  - minimum 44px touch target (Req 15.1)
 *  - supports a `disabled` state (needed later by async-guarded CTAs; the
 *    Activate_Account_CTA itself is NOT implemented here).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.7, 15.1.
 * Design: Components and Interfaces (PrimaryButton), Accessibility.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./PrimaryButton.module.css";

export interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content/label — supplied by the caller (no invented copy). */
  children: ReactNode;
  /** Stretch the button to the full width of its container. */
  fullWidth?: boolean;
}

/**
 * Primary CTA button. Defaults `type` to `"button"` so it never submits a form
 * unintentionally; callers may override via the standard `type` prop.
 */
export function PrimaryButton({
  children,
  fullWidth = false,
  type = "button",
  className,
  ...rest
}: PrimaryButtonProps) {
  const classes = [styles.primaryButton, fullWidth ? styles.fullWidth : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    // eslint-disable-next-line react/button-has-type
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
