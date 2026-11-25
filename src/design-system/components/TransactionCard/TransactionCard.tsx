/**
 * TransactionCard — a single transaction row (merchant + amount).
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It renders
 * whatever merchant/amount/meta it is given via props and invents no copy or
 * values; a numeric (paise) amount is formatted via the central INR formatter
 * (Req 12.4). When `onClick` is provided the row is a button (for the specified
 * transaction interaction behavior, wired later); otherwise it is a static row.
 * Colors come exclusively from design tokens (Req 1.2, 14.5); rounded corners,
 * dark border, near-black surface (Req 3.1, 3.3); interactive rows meet the
 * 44px touch target (Req 15.1) with a visible focus indicator (Req 3.7).
 *
 * Requirements: 14.1, 14.5, 14.6, 3.1, 3.3, 3.7, 15.1, 12.4.
 * Design: Components and Interfaces (TransactionCard).
 */
import type { ReactNode } from "react";
import styles from "./TransactionCard.module.css";
import { toDisplayValue } from "../_shared/financialValue";
import type { FinancialValue } from "../_shared/financialValue";

export interface TransactionCardProps {
  /** Merchant / description — supplied by the caller (no invented copy). */
  merchant: ReactNode;
  /** Amount: a display string, or integer paise to be formatted. */
  amount: FinancialValue;
  /** Optional supporting meta (e.g. date/category). */
  meta?: ReactNode;
  /** Optional click handler; when set the row renders as a button. */
  onClick?: () => void;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function TransactionCard({
  merchant,
  amount,
  meta,
  onClick,
  className,
}: TransactionCardProps) {
  const classes = [styles.card, onClick ? styles.interactive : null, className]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className={styles.body}>
        <span className={styles.merchant}>{merchant}</span>
        {meta != null ? <span className={styles.meta}>{meta}</span> : null}
      </span>
      <span className={`text-financial-figure ${styles.amount}`}>
        {toDisplayValue(amount)}
      </span>
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
