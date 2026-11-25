/**
 * LienPay — central repayment demo data (single source).
 *
 * The mandated repayment values, reproduced character-for-character. History
 * starts empty in the canonical snapshot.
 *
 * Requirements: 12.3 (Outstanding ₹24,680, Amount Due ₹8,240
 * character-for-character), 12.5 (one central data source).
 * Design: Data Models (RepaymentsState), Initial_Snapshot.
 */
import type { RepaymentsState } from "../../state/types";

/** The mandated repayment demo data (character-for-character). */
export const REPAYMENTS_DATA: RepaymentsState = {
  outstanding: "₹24,680",
  amountDue: "₹8,240",
  history: [],
};

/**
 * Presentational repayment TERMS shown on the Repayments screen (demo values,
 * kept here in the central mock data — not hard-coded in JSX — so they can later
 * be replaced by backend-provided values). These are display-only supporting
 * details; they never affect the mandated Outstanding / Amount Due figures or
 * the credit-position arithmetic.
 *
 * `interestFreeDays` and `apr` reflect the supplied reference (30 days
 * interest-free; 12% p.a. after the interest-free period). `minimumDue` and the
 * due-date labels are approved demo values consistent with the Home "Next
 * payment" card.
 */
export const REPAYMENT_TERMS = {
  interestFreeDays: "30 days",
  apr: "12% p.a.",
  aprNote: "after interest-free period",
  minimumDue: "₹4,120",
  dueDateLabel: "Due on 14 Aug",
  daysLeftLabel: "6 days left",
} as const;
