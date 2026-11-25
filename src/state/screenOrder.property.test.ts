/**
 * Property-based test for the fixed 25-screen order invariance (Property 2).
 *
 * The resume-step resolver walks a fixed, ordered list of 25 step ids and
 * returns the first incomplete one. This test reconstructs that ordered list
 * purely by observing the resolver's output across completed-prefix states
 * (for arbitrary, unrelated base state) and asserts it equals the mandated
 * sequence exactly — same items, same order, length 25 — proving no screen is
 * added, removed, reordered, or inserted regardless of state. The sequence now
 * includes the Check-My-Limit (eligibility) journey between Pre-Activation Home
 * and Fund Selection (LienPay_Beta_Flow_Design_Changes_v2).
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { resolveResumeStep, type StepId } from "./resumeResolver";
import type {
  ApplicationState,
  StepStatus,
  PledgeStatus,
  ActivationStatus,
} from "./types";

/** The mandated 25-screen sequence, in exact order (Req 5.1). */
const MANDATED_SEQUENCE: readonly StepId[] = [
  "splash",
  "mobile-verification",
  "otp-verification",
  "name-setup",
  "welcome",
  "pre-activation-home",
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
  "activation-success",
];

const STEP_COUNT = MANDATED_SEQUENCE.length;

/**
 * Builds an Application_State in which exactly the first `k` steps of the
 * mandated sequence satisfy their completion predicate and every later step
 * does not. Completion-relevant fields are set deterministically; all other
 * fields come from `base` (arbitrary), so the reconstructed order is shown to
 * be invariant to unrelated state.
 */
function withCompletedPrefix(base: ApplicationState, k: number): ApplicationState {
  const step: StepStatus = "complete";
  const none: StepStatus = "not_started";

  // pledgeStatus drives both pledge-consent (index 15, != not_started) and
  // pledge-processing (index 16, === success).
  const pledgeStatus: PledgeStatus =
    k > 16 ? "success" : k === 16 ? "processing" : "not_started";

  // activationStatus drives activation-success (index 24), requiring "active".
  const activationStatus: ActivationStatus = k >= 24 ? "active" : "inactive";

  return {
    ...base,
    onboardingStatus: {
      splash: k > 0 ? step : none,
      mobileVerification: k > 1 ? step : none,
      otpVerification: k > 2 ? step : none,
      nameSetup: k > 3 ? step : none,
      welcome: k > 4 ? step : none,
      preActivationHome: k > 5 ? step : none,
    },
    // Check-My-Limit journey (indices 6–13).
    panStatus: k > 6 ? step : none,
    panProcessingStatus: k > 7 ? step : none,
    mfConnectionStatus: k > 8 ? step : none,
    mfConsentStatus: k > 9 ? step : none,
    investmentsFetchStatus: k > 10 ? step : none,
    portfolioFoundStatus: k > 11 ? step : none,
    eligibilityStatus: k > 12 ? step : none,
    portfolioStatus: k > 13 ? step : none, // credit-limit-result
    selectedFunds: k > 14 ? ["fund-1"] : [],
    pledgeStatus,
    verificationStatus: {
      kyc: k > 17 ? step : none,
      aadhaar: k > 18 ? step : none,
      selfie: k > 19 ? step : none,
    },
    bankVerificationStatus: k > 20 ? step : none,
    mandateStatus: k > 21 ? step : none,
    agreementStatus: k > 22 ? step : none,
    eSignStatus: k > 23 ? step : none,
    activationStatus,
  };
}

/** Reconstructs the resolver's ordered step list by walking completed prefixes. */
function reconstructResolverOrder(base: ApplicationState): StepId[] {
  const order: StepId[] = [];
  for (let k = 0; k < STEP_COUNT; k++) {
    order.push(resolveResumeStep(withCompletedPrefix(base, k)));
  }
  return order;
}

const stepStatusArb = fc.constantFrom<StepStatus>(
  "not_started",
  "in_progress",
  "complete"
);
const pledgeStatusArb = fc.constantFrom<PledgeStatus>(
  "not_started",
  "processing",
  "success",
  "failed"
);
const activationStatusArb = fc.constantFrom<ActivationStatus>(
  "inactive",
  "in_progress",
  "active"
);

/**
 * An arbitrary Application_State. The completion-relevant fields are randomized
 * too, but `withCompletedPrefix` overrides them; the remaining fields (financial
 * strings, session, collections) flow through untouched, demonstrating the
 * order is invariant to unrelated state.
 */
const applicationStateArb: fc.Arbitrary<ApplicationState> = fc.record({
  onboardingStatus: fc.record({
    splash: stepStatusArb,
    mobileVerification: stepStatusArb,
    otpVerification: stepStatusArb,
    nameSetup: stepStatusArb,
    welcome: stepStatusArb,
    preActivationHome: stepStatusArb,
  }),
  verificationStatus: fc.record({
    kyc: stepStatusArb,
    aadhaar: stepStatusArb,
    selfie: stepStatusArb,
  }),
  panStatus: stepStatusArb,
  panProcessingStatus: stepStatusArb,
  mfConnectionStatus: stepStatusArb,
  mfConsentStatus: stepStatusArb,
  investmentsFetchStatus: stepStatusArb,
  portfolioFoundStatus: stepStatusArb,
  eligibilityStatus: stepStatusArb,
  panNumber: fc.option(fc.string(), { nil: null }),
  portfolioStatus: stepStatusArb,
  selectedFunds: fc.array(fc.string()),
  pledgeStatus: pledgeStatusArb,
  bankVerificationStatus: stepStatusArb,
  mandateStatus: stepStatusArb,
  agreementStatus: stepStatusArb,
  eSignStatus: stepStatusArb,
  finalReviewStatus: stepStatusArb,
  activationStatus: activationStatusArb,
  portfolioValue: fc.string(),
  creditLimit: fc.string(),
  availableCredit: fc.string(),
  usedCredit: fc.string(),
  ltv: fc.string(),
  creditHealth: fc.constant("Healthy" as const),
  creditLimitPaise: fc.nat(),
  availableCreditPaise: fc.integer(),
  usedCreditPaise: fc.integer(),
  transactions: fc.constant([]),
  repayments: fc.record({
    outstanding: fc.string(),
    amountDue: fc.string(),
    history: fc.constant([]),
  }),
  notifications: fc.constant([]),
  session: fc.record({
    userName: fc.option(fc.string(), { nil: null }),
    currentScreenId: fc.string(),
    previewMode: fc.boolean(),
    asyncInFlight: fc.boolean(),
  }),
});

// Feature: lienpay, Property 2: For any Application_State, the ordered list of step ids produced by the resolver equals the mandated screen sequence exactly (same items, same order, length 25) — no screen is added, removed, reordered, or inserted.
// Validates: Requirements 5.1, 5.3, 7.7, 22.9
describe("Property 2: Fixed 25-screen order is invariant", () => {
  it("reconstructs exactly the mandated screen sequence for any Application_State", () => {
    fc.assert(
      fc.property(applicationStateArb, (base) => {
        const order = reconstructResolverOrder(base);
        expect(order).toHaveLength(STEP_COUNT);
        expect(order).toEqual(MANDATED_SEQUENCE);
      })
    );
  });
});
