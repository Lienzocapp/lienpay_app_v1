/**
 * LienPay — central portfolio / credit demo data (single source).
 *
 * These are the mandated fixed financial values, reproduced
 * character-for-character. LTV and Credit_Health are FIXED display values that
 * are stored, never computed (Req 19.3, 19.5). The paise mirrors are used only
 * for pay/repay arithmetic; display strings remain canonical.
 *
 * Requirements: 12.1 (exact portfolio/credit values character-for-character),
 * 12.5 (one central data source), 19.3/19.5 (fixed LTV & Credit_Health).
 * Design: Data Models, Initial_Snapshot (canonical).
 */
import type { CreditHealth } from "../../state/types";

/** The mandated portfolio/credit demo values (character-for-character). */
export const PORTFOLIO_DATA = {
  /** Total portfolio value. */
  portfolioValue: "₹4,72,000",
  /** Credit limit. */
  creditLimit: "₹2,21,000",
  /** Available credit. */
  availableCredit: "₹1,96,320",
  /** Used credit. */
  usedCredit: "₹24,680",
  /** FIXED display value — NOT computed (Req 19.3, 19.5). */
  ltv: "34%",
  /** FIXED display value — NOT computed (Req 19.3). */
  creditHealth: "Healthy" as CreditHealth,

  // Paise mirrors (arithmetic only).
  creditLimitPaise: 22100000,
  availableCreditPaise: 19632000,
  usedCreditPaise: 2468000,
} as const;
