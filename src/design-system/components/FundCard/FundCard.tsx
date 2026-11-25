/**
 * FundCard — a selectable card representing a single fund holding.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It renders
 * whatever fund name/value/meta it is given via props and invents no copy or
 * values; a numeric (paise) value is formatted via the central INR formatter
 * (Req 12.4). It supports a SELECTED state (used later by Fund Selection —
 * Req 7.2, 7.3): the card is a toggle button exposing `aria-pressed`, and the
 * selected state is shown by BOTH a neon accent AND a non-color check indicator
 * so selection is never signaled by color alone (Req 3.6). Colors come
 * exclusively from design tokens (Req 1.2, 14.5); rounded corners, dark border,
 * near-black surface (Req 3.1, 3.3); the control meets the 44px touch target
 * (Req 15.1) with a visible focus indicator (Req 3.7).
 *
 * This component performs NO selection bookkeeping itself — it reports toggles
 * via `onToggle(id)` and reflects the `selected` prop.
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3, 3.6, 3.7, 15.1, 12.4; supports 7.2, 7.3.
 * Design: Components and Interfaces (FundCard), Accessibility.
 */
import type { ReactNode } from "react";
import styles from "./FundCard.module.css";
import { toDisplayValue } from "../_shared/financialValue";
import type { FinancialValue } from "../_shared/financialValue";

export interface FundCardProps {
  /** Stable fund id — reported back on toggle. */
  id: string;
  /** Fund name — supplied by the caller (no invented copy). */
  name: ReactNode;
  /** Fund value: a display string, or integer paise to be formatted. */
  value: FinancialValue;
  /** Optional supporting meta text (e.g. units / category). */
  meta?: ReactNode;
  /** Whether this fund is currently selected. */
  selected?: boolean;
  /** Called with the fund id when the card is toggled. */
  onToggle?: (id: string) => void;
  /** Disable the toggle. */
  disabled?: boolean;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function FundCard({
  id,
  name,
  value,
  meta,
  selected = false,
  onToggle,
  disabled = false,
  className,
}: FundCardProps) {
  const classes = [styles.card, selected ? styles.selected : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onToggle?.(id)}
    >
      <span className={styles.check} aria-hidden="true">
        {selected ? "✓" : ""}
      </span>
      <span className={styles.body}>
        <span className={styles.name}>{name}</span>
        {meta != null ? <span className={styles.meta}>{meta}</span> : null}
      </span>
      <span className={styles.value}>{toDisplayValue(value)}</span>
    </button>
  );
}
