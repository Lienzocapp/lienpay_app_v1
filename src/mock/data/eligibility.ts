/**
 * LienPay — central Check-My-Limit eligibility demo data (single source).
 *
 * The deterministic result of the limit-check journey: the eligible credit
 * limit the user "unlocks" (₹2,21,000), together with the supporting figures
 * shown on the Portfolio Found and Eligible Credit Limit Result screens. These
 * are FIXED display values reused across screens (never computed at random) so
 * the same demo journey always produces the same ₹2,21,000 result (deterministic
 * demo, Req 12.5, 19.3).
 *
 * The eligible-investments figure is the sum of the eligible (pledge-eligible)
 * value of the central fund holdings (`funds.ts`): ₹92,000 + ₹63,000 +
 * ₹44,100 + ₹22,400 = ₹2,21,500. The eligible credit limit (₹2,21,000) is
 * derived from the eligible investments value shown in the pledge section.
 *
 * Requirements: 12.5 (one central data source), 19.3 (fixed display values).
 * Design: Data Models, Mock Service Architecture.
 */
import { PORTFOLIO_DATA } from "./portfolio";

/** The deterministic Check-My-Limit eligibility result (character-for-character). */
export const ELIGIBILITY_DATA = {
  /** Eligible credit limit unlocked by the limit check. */
  eligibleCreditLimit: "₹2,21,000",
  /** Paise mirror of the eligible credit limit (arithmetic only). */
  eligibleCreditLimitPaise: 22100000,
  /** Total discovered portfolio value (matches the central portfolio value). */
  portfolioValue: PORTFOLIO_DATA.portfolioValue,
  /** Sum of the eligible (pledge-eligible) value across the central funds. */
  eligibleInvestments: "₹2,21,500",
  /**
   * The advertised credit-line range shown on the pre-activation dashboard
   * BEFORE the user has checked their limit (design reference: pre-activation
   * Home). The user's own limit is only known after the Check-My-Limit journey.
   */
  creditRangeLow: "₹25,000",
  creditRangeHigh: "₹10,00,000",
} as const;
