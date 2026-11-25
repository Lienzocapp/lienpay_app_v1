/**
 * Property-based test for canonical, idempotent reset-to-snapshot (Property 6).
 *
 * For any mutated Application_State, `resetToSnapshot` restores the canonical
 * `INITIAL_SNAPSHOT` (all relevant state, not only financial values), is
 * idempotent, and never mutates the frozen `INITIAL_SNAPSHOT` source.
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { useLienPayStore } from "./store";
import { INITIAL_SNAPSHOT } from "./initialSnapshot";
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

/**
 * Arbitrary partial mutations spanning financial values, onboarding/
 * verification statuses, collections, and session — so the test exercises
 * "restores all relevant state", not only the financial slice.
 */
const mutationArb = fc.record(
  {
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
    creditLimitPaise: fc.nat(),
    availableCreditPaise: fc.integer(),
    usedCreditPaise: fc.integer(),
    session: fc.record({
      userName: fc.option(fc.string(), { nil: null }),
      currentScreenId: fc.string(),
      previewMode: fc.boolean(),
      asyncInFlight: fc.boolean(),
    }),
  },
  { requiredKeys: [] }
);

/** Extracts the plain Application_State slice from the store (drops actions). */
function stateOf(): ApplicationState {
  const {
    resetToSnapshot: _reset,
    recordPayment: _pay,
    recordRepayment: _repay,
    completeOnboardingStep: _completeStep,
    setUserName: _setUserName,
    setPanStatus: _setPanStatus,
    setPanNumber: _setPanNumber,
    setPanProcessingStatus: _setPanProcessingStatus,
    setMfConnectionStatus: _setMfConnectionStatus,
    setMfConsentStatus: _setMfConsentStatus,
    setInvestmentsFetchStatus: _setInvestmentsFetchStatus,
    setPortfolioFoundStatus: _setPortfolioFoundStatus,
    setEligibilityStatus: _setEligibilityStatus,
    setPortfolioStatus: _setPortfolioStatus,
    toggleFund: _toggleFund,
    setPledgeStatus: _setPledgeStatus,
    setVerificationStatus: _setVerificationStatus,
    setBankVerificationStatus: _setBankVerificationStatus,
    setMandateStatus: _setMandateStatus,
    setAgreementStatus: _setAgreementStatus,
    setESignStatus: _setESignStatus,
    setFinalReviewStatus: _setFinalReviewStatus,
    activateAccount: _activateAccount,
    setAsyncInFlight: _setAsyncInFlight,
    ...state
  } = useLienPayStore.getState();
  return state;
}

// Feature: lienpay, Property 6: For any mutated Application_State, applying resetToSnapshot yields a state whose mandated values deep-equal the canonical INITIAL_SNAPSHOT, and applying resetToSnapshot twice produces the same result as applying it once (idempotence).
// Validates: Requirements 19.7, 11.12, 5.10, 19.2
describe("Property 6: Reset-to-snapshot is canonical and idempotent", () => {
  it("restores the canonical INITIAL_SNAPSHOT, is idempotent, and never mutates the frozen source", () => {
    // Deep clone of the canonical snapshot to detect any accidental mutation.
    const canonicalBefore = structuredClone(INITIAL_SNAPSHOT);

    fc.assert(
      fc.property(mutationArb, (mutation) => {
        // Apply arbitrary mutations to the shared store.
        useLienPayStore.setState(mutation as Partial<ApplicationState>);

        // First reset restores the canonical snapshot for all relevant state.
        useLienPayStore.getState().resetToSnapshot();
        const afterFirst = stateOf();
        expect(afterFirst).toEqual(INITIAL_SNAPSHOT);

        // Idempotence: a second reset produces the same result as the first.
        useLienPayStore.getState().resetToSnapshot();
        const afterSecond = stateOf();
        expect(afterSecond).toEqual(afterFirst);

        // The frozen canonical snapshot object itself is never mutated.
        expect(INITIAL_SNAPSHOT).toEqual(canonicalBefore);
      }),
      // Fewer examples for a faster run (still exercises varied mutations).
      { numRuns: 10 }
    );

    // Restore a clean canonical state for any subsequent tests.
    useLienPayStore.getState().resetToSnapshot();
  });
});
