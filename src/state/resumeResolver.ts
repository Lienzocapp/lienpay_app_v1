/**
 * LienPay — pure, read-only resume-step resolver.
 *
 * `resolveResumeStep(state)` maps the Application_State status fields to the
 * FIRST incomplete step in the fixed 25-step onboarding order and returns that
 * step id. It is a pure, side-effect-free function: it performs NO mutations,
 * records NO status transitions, triggers NO mock/API operations, and is NOT
 * async. It only computes where to route; all actual step execution happens on
 * the destination screen. Completed steps are skipped and never restarted.
 *
 * Requirements: 22.8 (resolve next incomplete step), 22.9 (no add/reorder of
 * screens), 22.10 (never restart completed steps), 22.11 (read-only, preserve
 * state).
 * Design: Onboarding Resume Logic (step-ordering table, resolver pseudocode),
 * Resolver is READ-ONLY.
 */
import type { ApplicationState, StepStatus } from "./types";

/** The fixed 25-step onboarding step ids, in mandated order. */
export type StepId =
  | "splash"
  | "mobile-verification"
  | "otp-verification"
  | "name-setup"
  | "welcome"
  | "pre-activation-home"
  // --- Check-My-Limit (eligibility) journey (screens 7–14) ---
  | "pan-verification"
  | "pan-processing"
  | "mf-connection"
  | "mf-consent"
  | "fetching-investments"
  | "portfolio-found"
  | "eligibility-calculation"
  | "credit-limit-result"
  | "fund-selection"
  | "pledge-consent"
  | "pledge-processing"
  | "kyc"
  | "aadhaar-verification"
  | "selfie-verification"
  | "bank-account"
  | "auto-debit-mandate"
  | "agreement"
  | "e-sign"
  | "bank-review"
  | "activation-success";

/** True when a `StepStatus` represents a completed step. */
function isComplete(status: StepStatus): boolean {
  return status === "complete";
}

/**
 * Resolves the first incomplete step in the fixed 27-step order for the given
 * state. Every step preceding the returned step is complete; if all steps are
 * complete it returns the final step, "activation-success".
 *
 * This function is READ-ONLY: it does not mutate `state`, transition any
 * status, or trigger any mock operation.
 *
 * @param state - The current Application_State (read only).
 * @returns The step id to resume at.
 */
export function resolveResumeStep(state: Readonly<ApplicationState>): StepId {
  const ordered: Array<[StepId, () => boolean]> = [
    ["splash", () => isComplete(state.onboardingStatus.splash)],
    ["mobile-verification", () => isComplete(state.onboardingStatus.mobileVerification)],
    ["otp-verification", () => isComplete(state.onboardingStatus.otpVerification)],
    ["name-setup", () => isComplete(state.onboardingStatus.nameSetup)],
    ["welcome", () => isComplete(state.onboardingStatus.welcome)],
    ["pre-activation-home", () => isComplete(state.onboardingStatus.preActivationHome)],
    // --- Check-My-Limit (eligibility) journey (screens 7–14) ---
    ["pan-verification", () => isComplete(state.panStatus)],
    ["pan-processing", () => isComplete(state.panProcessingStatus)],
    ["mf-connection", () => isComplete(state.mfConnectionStatus)],
    ["mf-consent", () => isComplete(state.mfConsentStatus)],
    ["fetching-investments", () => isComplete(state.investmentsFetchStatus)],
    ["portfolio-found", () => isComplete(state.portfolioFoundStatus)],
    ["eligibility-calculation", () => isComplete(state.eligibilityStatus)],
    ["credit-limit-result", () => isComplete(state.portfolioStatus)],
    ["fund-selection", () => state.selectedFunds.length >= 1],
    ["pledge-consent", () => state.pledgeStatus !== "not_started"],
    ["pledge-processing", () => state.pledgeStatus === "success"],
    ["kyc", () => isComplete(state.verificationStatus.kyc)],
    ["aadhaar-verification", () => isComplete(state.verificationStatus.aadhaar)],
    ["selfie-verification", () => isComplete(state.verificationStatus.selfie)],
    ["bank-account", () => isComplete(state.bankVerificationStatus)],
    ["auto-debit-mandate", () => isComplete(state.mandateStatus)],
    ["agreement", () => isComplete(state.agreementStatus)],
    ["e-sign", () => isComplete(state.eSignStatus)],
    ["bank-review", () => isComplete(state.finalReviewStatus)],
    ["activation-success", () => state.activationStatus === "active"],
  ];

  // Return the FIRST step whose completion predicate is false.
  for (const [stepId, done] of ordered) {
    if (!done()) {
      return stepId;
    }
  }
  return "activation-success"; // all complete
}
