/**
 * LienPay — centralized selectors (thin reads over Application_State).
 *
 * Screens never read raw internal fields directly; they read through these
 * selectors so refactors stay local and reactive propagation stays consistent
 * (Req 19.4). Selectors are pure, thin reads. `selectResumeStep` delegates to
 * the read-only resume resolver.
 *
 * Requirements: 19.4 (selector-based reactive reads), 22.8/22.10/22.11 (resume
 * via the read-only resolver, through the selector skeleton).
 * Design: State Model, Store choice/selectors/propagation, Onboarding Resume
 * Logic.
 */
import type {
  ApplicationState,
  CreditHealth,
  Notification,
  RepaymentsState,
  StepStatus,
  Transaction,
} from "./types";
import { resolveResumeStep, type StepId } from "./resumeResolver";

/** The active in-app navigation mode derived from `activationStatus`. */
export type NavMode = "pre-activation" | "active";

/** The user's current credit-position display values. */
export interface CreditPosition {
  creditLimit: string;
  availableCredit: string;
  usedCredit: string;
  ltv: string;
  creditHealth: CreditHealth;
}

/**
 * The Portfolio screen display values (character-for-character): the Total
 * Portfolio Value plus the credit position. `portfolioValue` and every credit
 * field are read as fixed display strings from central state — never computed
 * or reformatted — so the Portfolio screen stays reactive to Application_State
 * (Req 11.4, 19.4). LTV and Credit_Health remain fixed display values.
 */
export interface PortfolioView extends CreditPosition {
  portfolioValue: string;
}

/**
 * Returns the Portfolio screen display values (Total Portfolio Value + credit
 * position), read verbatim from central state (Req 11.4, 19.4). This is a thin,
 * pure read composed from the same central fields the Home screen consumes, so
 * both screens stay consistent with a single source of truth.
 */
export function selectPortfolio(state: Readonly<ApplicationState>): PortfolioView {
  return {
    portfolioValue: state.portfolioValue,
    creditLimit: state.creditLimit,
    availableCredit: state.availableCredit,
    usedCredit: state.usedCredit,
    ltv: state.ltv,
    creditHealth: state.creditHealth,
  };
}

/** Returns the centralized list of pledged (selected) fund ids. */
export function selectSelectedFunds(state: Readonly<ApplicationState>): string[] {
  return state.selectedFunds;
}

/**
 * Returns the credit-position display strings (character-for-character). LTV
 * and Credit_Health are read as fixed display values, never computed.
 */
export function selectCreditPosition(state: Readonly<ApplicationState>): CreditPosition {
  return {
    creditLimit: state.creditLimit,
    availableCredit: state.availableCredit,
    usedCredit: state.usedCredit,
    ltv: state.ltv,
    creditHealth: state.creditHealth,
  };
}

/** Returns the transaction list (most-recent-first, as stored). */
export function selectTransactions(state: Readonly<ApplicationState>): Transaction[] {
  return state.transactions;
}

/**
 * Returns the notifications list read from central state (Req 11.6, 19.4). Thin,
 * pure read; the Notifications screen renders these via the shared
 * `NotificationItem` and shows the shared empty-state when the list is empty
 * (Req 11.7). The canonical Initial_Snapshot starts with no notifications.
 */
export function selectNotifications(state: Readonly<ApplicationState>): Notification[] {
  return state.notifications;
}

/**
 * Returns the repayments block (Outstanding / Amount Due display strings and
 * the repayment history), read as centralized display values so the Repayments
 * screen stays reactive to `recordRepayment` (Req 11.3, 12.3, 19.4).
 */
export function selectRepayments(state: Readonly<ApplicationState>): RepaymentsState {
  return state.repayments;
}

/**
 * Returns the active navigation mode: `"active"` once the account is active,
 * otherwise `"pre-activation"`.
 */
export function selectActiveNavMode(state: Readonly<ApplicationState>): NavMode {
  return state.activationStatus === "active" ? "active" : "pre-activation";
}

/**
 * Returns the step id to resume at, delegating to the pure, read-only resume
 * resolver. This selector performs no mutation and triggers no side effects.
 */
export function selectResumeStep(state: Readonly<ApplicationState>): StepId {
  return resolveResumeStep(state);
}

/** True when a `StepStatus` represents a currently-running blocking step. */
function isBlockingInProgress(status: StepStatus): boolean {
  return status === "in_progress";
}

/**
 * Reports whether the Activate_Account_CTA must be rendered in a disabled state
 * because a blocking Mock_Service operation is currently running (Design:
 * Activate_Account_CTA async safety; Req 22, 6, 7, 8, 13.5).
 *
 * The CTA is disabled when the transient `session.asyncInFlight` flag is set OR
 * when any of the blocking activation/verification steps is `in_progress`:
 * OTP verification, Pledge Processing (`pledgeStatus === "processing"`), KYC,
 * Aadhaar, Selfie, Bank Verification, Mandate, e-Sign, Final Review, and
 * Activation. This selector is a pure read; it triggers no mock operation and
 * mutates nothing.
 *
 * @param state - The current Application_State (read only).
 * @returns `true` if the CTA should be disabled while a blocking op runs.
 */
export function selectActivateCtaDisabled(state: Readonly<ApplicationState>): boolean {
  if (state.session.asyncInFlight) {
    return true;
  }
  return (
    isBlockingInProgress(state.onboardingStatus.otpVerification) ||
    state.pledgeStatus === "processing" ||
    isBlockingInProgress(state.verificationStatus.kyc) ||
    isBlockingInProgress(state.verificationStatus.aadhaar) ||
    isBlockingInProgress(state.verificationStatus.selfie) ||
    isBlockingInProgress(state.bankVerificationStatus) ||
    isBlockingInProgress(state.mandateStatus) ||
    isBlockingInProgress(state.eSignStatus) ||
    isBlockingInProgress(state.finalReviewStatus) ||
    state.activationStatus === "in_progress"
  );
}
