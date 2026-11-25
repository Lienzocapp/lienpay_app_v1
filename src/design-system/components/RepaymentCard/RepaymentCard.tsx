/**
 * RepaymentCard — a single repayment-history entry.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It renders
 * whatever label/amount/meta/status it is given via props and invents no copy or
 * values; a numeric (paise) amount is formatted via the central INR formatter
 * (Req 12.4). Colors come exclusively from design tokens (Req 1.2, 14.5);
 * rounded corners, dark border, near-black surface (Req 3.1, 3.3).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3, 12.4.
 * Design: Components and Interfaces (RepaymentCard).
 */
import type { ReactNode } from "react";
import styles from "./RepaymentCard.module.css";
import { toDisplayValue } from "../_shared/financialValue";
import type { FinancialValue } from "../_shared/financialValue";

export interface RepaymentCardProps {
  /** Repayment label / description — supplied by the caller (no invented copy). */
  label: ReactNode;
  /** Amount: a display string, or integer paise to be formatted. */
  amount: FinancialValue;
  /** Optional supporting meta (e.g. date). */
  meta?: ReactNode;
  /** Optional status text (e.g. "Paid"). */
  status?: ReactNode;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function RepaymentCard({
  label,
  amount,
  meta,
  status,
  className,
}: RepaymentCardProps) {
  const classes = [styles.card, className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <span className={styles.body}>
        <span className={styles.label}>{label}</span>
        {meta != null ? <span className={styles.meta}>{meta}</span> : null}
      </span>
      <span className={styles.trailing}>
        <span className={`text-financial-figure ${styles.amount}`}>
          {toDisplayValue(amount)}
        </span>
        {status != null ? <span className={styles.status}>{status}</span> : null}
      </span>
    </div>
  );
}
