/**
 * OTPInput — one-time passcode entry primitive.
 *
 * A GENERIC, reusable primitive authored once (Req 14.1, 14.3, 14.6). It
 * supports the 6-digit entry pattern generically (the cell count is a prop,
 * defaulting to 6) and is fully controlled via `value`/`onChange`. It invents
 * no screen copy — the accessible group label comes from props. Colors come
 * exclusively from design tokens (Req 1.2, 14.5).
 *
 * Behavior:
 *  - Each cell accepts a single digit; typing advances focus to the next cell.
 *  - Backspace clears the current cell or moves focus back when empty.
 *  - Arrow keys move focus between cells.
 *  - Pasting a numeric string distributes digits across the cells.
 *  - Only digits are accepted; non-digits are ignored.
 *
 * Accessibility:
 *  - the group has an accessible label (Req 3.8, provided via `label`).
 *  - each cell is >= 44x44px (Req 15.1) with a visible focus indicator
 *    (Req 3.7).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.7, 3.8, 15.1; 6.3 (6-digit pattern, generic).
 * Design: Components and Interfaces (OTPInput), Accessibility.
 */
import { useRef } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import styles from "./OTPInput.module.css";

export interface OTPInputProps {
  /** Current value (digits only). Controlled by the caller. */
  value: string;
  /** Called with the next value (digits only, up to `length`). */
  onChange: (value: string) => void;
  /** Accessible group label (Req 3.8). Supplied by the caller (no invented copy). */
  label: string;
  /** Number of cells. Defaults to 6 (the 6-digit OTP pattern). */
  length?: number;
  /** Disable all cells. */
  disabled?: boolean;
  /** Focus the first cell on mount. */
  autoFocus?: boolean;
}

const DIGITS_ONLY = /\D+/g;

function sanitize(raw: string, length: number): string {
  return raw.replace(DIGITS_ONLY, "").slice(0, length);
}

export function OTPInput({
  value,
  onChange,
  label,
  length = 6,
  disabled = false,
  autoFocus = false,
}: OTPInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const chars = sanitize(value, length);

  const focusCell = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  };

  const setDigitAt = (index: number, digit: string) => {
    const next = chars.split("");
    // Ensure the array is padded up to `index`.
    while (next.length < index) {
      next.push("");
    }
    next[index] = digit;
    onChange(sanitize(next.join(""), length));
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(DIGITS_ONLY, "");
    if (digits === "") {
      // Clearing the cell.
      setDigitAt(index, "");
      return;
    }
    if (digits.length > 1) {
      // Multiple characters (e.g. fast typing / autofill): distribute.
      const merged = sanitize(chars.slice(0, index) + digits, length);
      onChange(merged);
      focusCell(index + digits.length);
      return;
    }
    setDigitAt(index, digits);
    focusCell(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if ((chars[index] ?? "") === "") {
        // Empty cell: move back and clear the previous cell.
        event.preventDefault();
        if (index > 0) {
          setDigitAt(index - 1, "");
          focusCell(index - 1);
        }
      }
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusCell(index - 1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text");
    const merged = sanitize(chars.slice(0, index) + pasted, length);
    onChange(merged);
    focusCell(merged.length);
  };

  return (
    <div className={styles.group} role="group" aria-label={label}>
      <span className={styles.groupLabel}>{label}</span>
      {Array.from({ length }, (_, index) => {
        const cellValue = chars[index] ?? "";
        const cellClasses = [styles.cell, cellValue !== "" ? styles.cellFilled : null]
          .filter(Boolean)
          .join(" ");
        return (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            className={cellClasses}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            pattern="[0-9]*"
            maxLength={1}
            value={cellValue}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            aria-label={`${label} digit ${index + 1} of ${length}`}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => handlePaste(index, e)}
            onFocus={(e) => e.target.select()}
          />
        );
      })}
    </div>
  );
}
