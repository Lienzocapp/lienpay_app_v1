/**
 * InputField — labeled single-line text input primitive.
 *
 * A GENERIC, reusable primitive authored once (Req 14.1, 14.3, 14.6). Used for
 * Mobile, Name, Bank Account, UPI ID, etc. It renders whatever label/content it
 * is given via props and invents no screen copy. Colors come exclusively from
 * design tokens (Req 1.2, 14.5).
 *
 * Accessibility:
 *  - a programmatic label is ALWAYS associated with the input via `htmlFor`/
 *    `id`; `hideLabel` keeps the label available to assistive tech while
 *    hiding it visually (Req 3.8).
 *  - visible keyboard focus indicator (Req 3.7).
 *  - minimum 44px touch target (Req 15.1).
 *  - error text is linked via `aria-describedby` and `aria-invalid` so the
 *    invalid state and message are announced.
 *
 * Requirements: 14.1, 14.5, 14.6, 3.7, 3.8, 15.1.
 * Design: Components and Interfaces (InputField), Accessibility.
 */
import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./InputField.module.css";

export interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** Accessible label text (required). Supplied by the caller (no invented copy). */
  label: ReactNode;
  /** Optional explicit id; a stable generated id is used when omitted. */
  id?: string;
  /** Optional validation/error message; sets the invalid state when present. */
  error?: ReactNode;
  /** Visually hide the label while keeping it available to assistive tech. */
  hideLabel?: boolean;
}

export function InputField({
  label,
  id,
  error,
  hideLabel = false,
  className,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = error != null && error !== "";

  const describedBy =
    [hasError ? errorId : null, ariaDescribedBy].filter(Boolean).join(" ") ||
    undefined;

  const inputClasses = [styles.input, hasError ? styles.inputError : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      <label
        htmlFor={inputId}
        className={hideLabel ? styles.labelHidden : styles.label}
      >
        {label}
      </label>
      <input
        id={inputId}
        className={inputClasses}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hasError ? (
        <span id={errorId} className={styles.error} role="alert">
          <span className={styles.errorIcon} aria-hidden="true">
            !
          </span>
          <span>{error}</span>
        </span>
      ) : null}
    </div>
  );
}
