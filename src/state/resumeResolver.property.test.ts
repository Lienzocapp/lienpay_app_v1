/**
 * Property-based test for the resume-step resolver (Property 1).
 *
 * For any Application_State the resolver returns the first step in the fixed
 * 20-step order whose completion predicate is false, every preceding step is
 * complete, and the resolver is deterministic and read-only (no mutation of
 * the input state).
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { resolveResumeStep, type StepId } from "./resumeResolver";
import { createInitialState } from "./initialSnapshot";
import type {
  ApplicationState,
  StepStatus,
  PledgeStatus,
  ActivationStatus,
} from "./types";

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

/** Builds an arbitrary Application_State from the resolver-relevant fields. */
const stateArb: fc.Arbitrary<ApplicationState> = fc
  .record({
    splash: stepStatusArb,
    mobileVerification: stepStatusArb,
    otpVerification: stepStatusArb,
    nameSetup: stepStatusArb,
    welcome: stepStatusArb,
    preActivationHome: stepStatusArb,
    panStatus: stepStatusArb,
    panProcessingStatus: stepStatusArb,
    mfConnectionStatus: stepStatusArb,
    mfConsentStatus: stepStatusArb,
    investmentsFetchStatus: stepStatusArb,
    portfolioFoundStatus: stepStatusArb,
    eligibilityStatus: stepStatusArb,
    portfolioStatus: stepStatusArb,
    selectedFunds: fc.array(fc.string()),
    pledgeStatus: pledgeStatusArb,
    kyc: stepStatusArb,
    aadhaar: stepStatusArb,
    selfie: stepStatusArb,
    bankVerificationStatus: stepStatusArb,
    mandateStatus: stepStatusArb,
    agreementStatus: stepStatusArb,
    eSignStatus: stepStatusArb,
    activationStatus: activationStatusArb,
  })
  .map((r) => {
    const base = createInitialState();
    return {
      ...base,
      onboardingStatus: {
        splash: r.splash,
        mobileVerification: r.mobileVerification,
        otpVerification: r.otpVerification,
        nameSetup: r.nameSetup,
        welcome: r.welcome,
        preActivationHome: r.preActivationHome,
      },
      verificationStatus: {
        kyc: r.kyc,
        aadhaar: r.aadhaar,
        selfie: r.selfie,
      },
      panStatus: r.panStatus,
      panProcessingStatus: r.panProcessingStatus,
      mfConnectionStatus: r.mfConnectionStatus,
      mfConsentStatus: r.mfConsentStatus,
      investmentsFetchStatus: r.investmentsFetchStatus,
      portfolioFoundStatus: r.portfolioFoundStatus,
      eligibilityStatus: r.eligibilityStatus,
      portfolioStatus: r.portfolioStatus,
      selectedFunds: r.selectedFunds,
      pledgeStatus: r.pledgeStatus,
      bankVerificationStatus: r.bankVerificationStatus,
      mandateStatus: r.mandateStatus,
      agreementStatus: r.agreementStatus,
      eSignStatus: r.eSignStatus,
      activationStatus: r.activationStatus,
    };
  });

/**
 * Independent reference specification of the fixed 20-step order and each
 * step's completion predicate (mirrors the design's step-ordering table). The
 * resolver's output is cross-checked against this independent computation.
 */
const ORDERED_STEPS: Array<[StepId, (s: ApplicationState) => boolean]> = [
  ["splash", (s) => s.onboardingStatus.splash === "complete"],
  ["mobile-verification", (s) => s.onboardingStatus.mobileVerification === "complete"],
  ["otp-verification", (s) => s.onboardingStatus.otpVerification === "complete"],
  ["name-setup", (s) => s.onboardingStatus.nameSetup === "complete"],
  ["welcome", (s) => s.onboardingStatus.welcome === "complete"],
  ["pre-activation-home", (s) => s.onboardingStatus.preActivationHome === "complete"],
  ["pan-verification", (s) => s.panStatus === "complete"],
  ["pan-processing", (s) => s.panProcessingStatus === "complete"],
  ["mf-connection", (s) => s.mfConnectionStatus === "complete"],
  ["mf-consent", (s) => s.mfConsentStatus === "complete"],
  ["fetching-investments", (s) => s.investmentsFetchStatus === "complete"],
  ["portfolio-found", (s) => s.portfolioFoundStatus === "complete"],
  ["eligibility-calculation", (s) => s.eligibilityStatus === "complete"],
  ["credit-limit-result", (s) => s.portfolioStatus === "complete"],
  ["fund-selection", (s) => s.selectedFunds.length >= 1],
  ["pledge-consent", (s) => s.pledgeStatus !== "not_started"],
  ["pledge-processing", (s) => s.pledgeStatus === "success"],
  ["kyc", (s) => s.verificationStatus.kyc === "complete"],
  ["aadhaar-verification", (s) => s.verificationStatus.aadhaar === "complete"],
  ["selfie-verification", (s) => s.verificationStatus.selfie === "complete"],
  ["bank-account", (s) => s.bankVerificationStatus === "complete"],
  ["auto-debit-mandate", (s) => s.mandateStatus === "complete"],
  ["agreement", (s) => s.agreementStatus === "complete"],
  ["e-sign", (s) => s.eSignStatus === "complete"],
  ["activation-success", (s) => s.activationStatus === "active"],
];

// Feature: lienpay, Property 1: For any Application_State, the resume-step resolver returns the first step in the fixed 20-step order whose completion predicate is false, and every step preceding the returned step is complete (no completed step is ever restarted). If no activation step is complete, it returns the first pending onboarding step rather than any newly created screen.
// Validates: Requirements 22.10, 22.8, 22.11
describe("Property 1: Resume resolver returns the first incomplete step", () => {
  it("returns the first incomplete step, is deterministic, and is read-only", () => {
    fc.assert(
      fc.property(stateArb, (state) => {
        // Read-only: snapshot the state before resolving.
        const before = structuredClone(state);

        const result = resolveResumeStep(state);

        // The resolver never mutates its input.
        expect(state).toEqual(before);

        // Deterministic: the same input always yields the same output.
        expect(resolveResumeStep(state)).toBe(result);

        // Compute the expected first-incomplete step independently.
        const expectedIndex = ORDERED_STEPS.findIndex(([, done]) => !done(state));
        const expected =
          expectedIndex === -1
            ? "activation-success"
            : ORDERED_STEPS[expectedIndex][0];
        expect(result).toBe(expected);

        // Every step preceding the returned step is complete.
        const returnedIndex = ORDERED_STEPS.findIndex(([id]) => id === result);
        for (let i = 0; i < returnedIndex; i += 1) {
          expect(ORDERED_STEPS[i][1](state)).toBe(true);
        }
      })
    );
  });
});
