/**
 * LienPay — Pre_Activation_Flow onboarding step routing helpers (single source).
 *
 * The fixed 25-step order is owned by the resume resolver's `StepId` union and
 * the mandated sequence (Req 5.1, 5.3). This module derives the ordered list of
 * step ids and the `/app/pre/onboarding/:step` route builder + next-step lookup
 * so the flow never reorders, inserts, or removes screens (Req 5.3, 22.9). It
 * does NOT build any screen and holds no state; it is pure routing config.
 *
 * Only the first four screens (splash, mobile-verification, otp-verification,
 * name-setup) are implemented in this batch; they live in `onboarding/` and are
 * hosted by `onboarding/OnboardingHost`, which consumes `onboardingStepPath`
 * and `nextStep` from this single routing source. Every other step id renders a
 * minimal placeholder in the host until its screen is built.
 *
 * Requirements: 5.1, 5.2, 5.3, 22.9.
 * Design: Navigation Architecture (Pre-Activation route table), Onboarding
 * Resume Logic.
 */
import type { StepId } from "../../state/resumeResolver";
import { ROUTES } from "../../navigation/navConfig";

/**
 * The mandated 25-step Pre_Activation_Flow order (Req 5.1). This is the single
 * ordered list used for next/previous navigation and route building; it must
 * match the resolver's step ordering exactly.
 */
export const ONBOARDING_STEP_ORDER: readonly StepId[] = [
  "splash",
  "mobile-verification",
  "otp-verification",
  "name-setup",
  "welcome",
  "pre-activation-home",
  // Check-My-Limit (eligibility) journey — begun from the dashboard CTA.
  "pan-verification",
  "pan-processing",
  "mf-connection",
  "mf-consent",
  "fetching-investments",
  "portfolio-found",
  "eligibility-calculation",
  "credit-limit-result",
  "fund-selection",
  "pledge-consent",
  "pledge-processing",
  "kyc",
  "aadhaar-verification",
  "selfie-verification",
  "bank-account",
  "auto-debit-mandate",
  "agreement",
  "e-sign",
  "bank-review",
  "activation-success",
] as const;

/** True when `value` is a valid onboarding `StepId`. */
export function isStepId(value: string | undefined): value is StepId {
  return value !== undefined && (ONBOARDING_STEP_ORDER as readonly string[]).includes(value);
}

/**
 * Builds the route path for an onboarding step (`/app/pre/onboarding/{step}`).
 * Uses the centralized route template so the path prefix stays a single source.
 */
export function onboardingStepPath(step: StepId): string {
  return ROUTES.pre.onboardingStep.replace(":step", step);
}

/**
 * Resolves the router path for a Pre_Activation_Flow step id.
 *
 * Every step maps to the flow-context route `/app/pre/onboarding/{step}` EXCEPT
 * `pre-activation-home` (screen 6), which is the Home tab and lives at its own
 * namespaced route `/app/pre/home` (Design: Navigation Architecture —
 * Pre-Activation route table). Centralizing this mapping keeps the flow's route
 * structure a single source and lets both the OnboardingHost (advancing out of
 * Welcome) and the Activate_Account_CTA route consistently without reordering
 * or inserting any screen (Req 5.3, 22.9).
 */
export function stepRoutePath(step: StepId): string {
  if (step === "pre-activation-home") {
    return ROUTES.pre.home;
  }
  return onboardingStepPath(step);
}

/**
 * Returns the step id immediately after `step` in the fixed order, or `null`
 * if `step` is the final screen. Never reorders/inserts (Req 22.9).
 */
export function nextStep(step: StepId): StepId | null {
  const index = ONBOARDING_STEP_ORDER.indexOf(step);
  if (index < 0 || index >= ONBOARDING_STEP_ORDER.length - 1) {
    return null;
  }
  return ONBOARDING_STEP_ORDER[index + 1];
}

/**
 * Returns the step id immediately before `step` in the fixed order, or `null`
 * if `step` is the first screen (splash). Used by OnboardingHost to render
 * the back arrow on eligible screens without duplicating order logic.
 */
export function prevStep(step: StepId): StepId | null {
  const index = ONBOARDING_STEP_ORDER.indexOf(step);
  if (index <= 0) {
    return null;
  }
  return ONBOARDING_STEP_ORDER[index - 1];
}
