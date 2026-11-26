/**
 * LienPay — single centralized Application_State store (Zustand).
 *
 * One in-memory, session-scoped Zustand store initialized from the canonical
 * `INITIAL_SNAPSHOT`. Because the store is in-memory only (no persistence, no
 * localStorage), a browser reload naturally discards mutations and re-creates
 * the store from the snapshot — satisfying reset-on-reload for both onboarding
 * (Req 5.9, 5.10) and financial state (Req 11.12, 19.7). `resetToSnapshot()`
 * provides an explicit canonical reset for tests and in-session use.
 *
 * Requirements: 19.1 (single centralized store), 19.2 (initialized from the
 * canonical snapshot), 19.4 (selector-based reactive reads), 19.7/11.12/5.9/
 * 5.10 (session-scoped reset-on-reload + resetToSnapshot), 21.4/11.10/11.11/
 * 19.8 (pay/repay update the central credit position and all dependents).
 * Design: State Model, Store choice/selectors/propagation, Financial State
 * Updates.
 */
import { create } from "zustand";
import type {
  ApplicationState,
  OnboardingStatus,
  PledgeStatus,
  StepStatus,
  Transaction,
  VerificationStatus,
} from "./types";
import { createInitialState } from "./initialSnapshot";
import { recordPayment, recordRepayment } from "./reducers/financial";
import { formatINR } from "../formatting/inr";

/**
 * Maximum number of funds the prototype supports / a user may pledge on the
 * Fund Selection screen (Req 7.2). Selection is capped at this bound.
 */
export const MAX_SELECTED_FUNDS = 50;

/**
 * The store shape: the full Application_State data plus store actions.
 */
export interface LienPayStore extends ApplicationState {
  /**
   * Restores the canonical Initial_Snapshot values, discarding any in-session
   * mutations. Idempotent: applying it twice yields the same canonical state.
   */
  resetToSnapshot: () => void;
  /**
   * Records a simulated payment/spend of `amountPaise`, optionally prepending
   * a transaction to the history. Delegates to the pure `recordPayment`
   * reducer; updates the central credit position so all dependent UI reacts.
   */
  recordPayment: (amountPaise: number, transaction?: Transaction) => void;
  /**
   * Records a simulated repayment of `amountPaise`. Delegates to the pure
   * `recordRepayment` reducer; updates the central credit position and the
   * repayment display strings so all dependent UI reacts.
   */
  recordRepayment: (amountPaise: number) => void;
  /**
   * Marks a single Pre_Activation_Flow onboarding step (steps 1–6) as
   * `"complete"` in the centralized Application_State. Used by the onboarding
   * screens as they advance so the read-only resume resolver stays consistent
   * (Req 5.2). Purely updates status; triggers no mock operation.
   */
  completeOnboardingStep: (step: keyof OnboardingStatus) => void;
  /**
   * Stores the user's entered name in the centralized session state (Req 6.4).
   * This is the single cross-screen home for the name — screens never keep a
   * duplicate copy.
   */
  setUserName: (name: string) => void;
  /**
   * Sets the PAN Verification step status (screen 7). Marked `"complete"` once
   * the user submits a well-formed PAN, so the resolver advances to PAN
   * Processing. Pure status update.
   */
  setPanStatus: (status: StepStatus) => void;
  /**
   * Stores the entered PAN (uppercased) in centralized state so PAN Processing
   * (screen 8) can run the deterministic mock verification against it. Cleared
   * on reset. The single cross-screen home for the entered PAN.
   */
  setPanNumber: (pan: string) => void;
  /**
   * Sets the PAN Processing step status (screen 8). Marked `"complete"` after a
   * successful `Mock_Service.verifyPan` so the resolver advances to MF
   * Connection. Pure status update.
   */
  setPanProcessingStatus: (status: StepStatus) => void;
  /**
   * Sets the Mutual-Fund Connection step status (screen 9). Marked `"complete"`
   * once the user starts connecting their investments so the resolver advances
   * to the Consent screen. Pure status update.
   */
  setMfConnectionStatus: (status: StepStatus) => void;
  /**
   * Sets the data-access Consent step status (screen 10). Marked `"complete"`
   * once the user grants explicit consent so the resolver advances to Fetching
   * Investments. Pure status update.
   */
  setMfConsentStatus: (status: StepStatus) => void;
  /**
   * Sets the Fetching Investments step status (screen 11). Marked `"complete"`
   * after a successful `Mock_Service.fetchInvestments` (portfolio discovered)
   * so the resolver advances to Portfolio Found. Pure status update.
   */
  setInvestmentsFetchStatus: (status: StepStatus) => void;
  /**
   * Sets the Portfolio Found step status (screen 12). Marked `"complete"` once
   * the user reviews and acknowledges the discovered portfolio so the resolver
   * advances to Eligibility Calculation. Pure status update.
   */
  setPortfolioFoundStatus: (status: StepStatus) => void;
  /**
   * Sets the Eligibility Calculation step status (screen 13). Marked
   * `"complete"` after a successful `Mock_Service.calculateEligibility` so the
   * resolver advances to the Eligible Credit Limit Result. Pure status update.
   */
  setEligibilityStatus: (status: StepStatus) => void;
  /**
   * Sets the credit-eligibility acknowledgement status (Eligible Credit Limit
   * Result, screen 14). Marked `"complete"` on continue so the read-only resume
   * resolver advances to Fund Selection. Pure status update; triggers no
   * Mock_Service operation (Design: Onboarding Resume Logic).
   */
  setPortfolioStatus: (status: StepStatus) => void;
  /**
   * Sets the dynamically calculated credit limit and selected portfolio value based on user fund selection.
   * Updates creditLimit display string, creditLimitPaise, availableCreditPaise, and selected portfolio value.
   */
  setCustomCreditLimit: (creditLimitPaise: number, selectedPortfolioValue?: string) => void;
  selectedPortfolioValue?: string;
  /**
   * Toggles a fund's selection on the Fund Selection screen (screen 8),
   * updating the centralized `selectedFunds` list (Req 7.2, 7.3). Adding is
   * capped at {@link MAX_SELECTED_FUNDS}; a fund already selected is removed.
   * This is the single cross-screen home for the selection — screens never keep
   * a duplicate copy.
   */
  toggleFund: (id: string) => void;
  /**
   * Sets the pledge lifecycle status (screen 10). The Pledge Processing screen
   * moves it `processing → success` on a successful `Mock_Service.processPledge`
   * or `→ failed` on failure, preserving `selectedFunds` either way
   * (Req 7.6, 7.7, 7.8).
   */
  setPledgeStatus: (status: PledgeStatus) => void;
  /**
   * Sets a single KYC-block verification step status (screens 11–13: kyc,
   * aadhaar, selfie). Each screen marks its step `"complete"` after a
   * successful `Mock_Service` verification so the read-only resume resolver
   * advances to the next verification screen in the fixed order (Req 8.1).
   * Pure status update; the Mock_Service call is made by the screen.
   */
  setVerificationStatus: (
    step: keyof VerificationStatus,
    status: StepStatus
  ) => void;
  /**
   * Sets the Bank Account step status (screen 14). Marked `"complete"` after a
   * successful `Mock_Service.captureBankAccount` so the resolver advances to
   * the Auto-Debit / Mandate screen (Req 8.2). Pure status update.
   */
  setBankVerificationStatus: (status: StepStatus) => void;
  /**
   * Sets the Auto-Debit / Mandate step status (screen 15). Marked `"complete"`
   * after a successful `Mock_Service.setupMandate` so the resolver advances to
   * the Agreement screen (Req 8.4). Pure status update.
   */
  setMandateStatus: (status: StepStatus) => void;
  /**
   * Sets the Agreement step status (screen 16). Marked `"complete"` on continue
   * so the resolver advances to the e-Sign screen (Req 8.5). Pure status
   * update; triggers no Mock_Service operation.
   */
  setAgreementStatus: (status: StepStatus) => void;
  /**
   * Sets the e-Sign step status (screen 17). Marked `"complete"` only once the
   * e-Sign action is performed so the resolver advances to Final Credit Review
   * (Req 8.5, 8.6). Pure status update; triggers no Mock_Service operation.
   */
  setESignStatus: (status: StepStatus) => void;
  /**
   * Sets the Final Credit Review step status (screen 18). Marked `"complete"`
   * on confirm so the read-only resume resolver advances to Activation
   * (Req 8.7, 5.1, 5.2). Pure status update; triggers no Mock_Service operation.
   */
  setFinalReviewStatus: (status: StepStatus) => void;
  /**
   * Completes activation (screen 20): sets `activationStatus = "active"`, which
   * terminates the Pre_Activation_Flow (no further onboarding screen) and is the
   * single trigger for the navigation swap from Pre_Activation_Nav to the
   * Active_Account Bottom_Navigation (Req 8.7, 5.6, 22.14, 19.8). Pure status
   * update; triggers no Mock_Service operation.
   */
  activateAccount: () => void;
  /**
   * Sets the transient `session.asyncInFlight` flag around a blocking
   * Mock_Service call (in-memory, reset on reload). Screens set it `true`
   * before awaiting a blocking operation and `false` when it resolves/errors
   * so the UI can guard against duplicate/concurrent submissions (Design:
   * Activate_Account_CTA async safety; Req 13.5).
   */
  setAsyncInFlight: (inFlight: boolean) => void;
}

/**
 * The single LienPay Zustand store hook. Components subscribe via selectors
 * (see `selectors.ts`) so only dependent UI re-renders on change.
 */
export const useLienPayStore = create<LienPayStore>((set) => ({
  ...createInitialState(),
  resetToSnapshot: () => set(() => ({ ...createInitialState() })),
  recordPayment: (amountPaise, transaction) =>
    set((state) => recordPayment(state, amountPaise, transaction)),
  recordRepayment: (amountPaise) =>
    set((state) => recordRepayment(state, amountPaise)),
  completeOnboardingStep: (step) =>
    set((state) => ({
      onboardingStatus: { ...state.onboardingStatus, [step]: "complete" },
    })),
  setUserName: (name) =>
    set((state) => ({
      session: { ...state.session, userName: name },
    })),
  setPanStatus: (status) => set(() => ({ panStatus: status })),
  setPanNumber: (pan) => set(() => ({ panNumber: pan })),
  setPanProcessingStatus: (status) =>
    set(() => ({ panProcessingStatus: status })),
  setMfConnectionStatus: (status) =>
    set(() => ({ mfConnectionStatus: status })),
  setMfConsentStatus: (status) => set(() => ({ mfConsentStatus: status })),
  setInvestmentsFetchStatus: (status) =>
    set(() => ({ investmentsFetchStatus: status })),
  setPortfolioFoundStatus: (status) =>
    set(() => ({ portfolioFoundStatus: status })),
  setEligibilityStatus: (status) => set(() => ({ eligibilityStatus: status })),
  setPortfolioStatus: (status) => set(() => ({ portfolioStatus: status })),
  setCustomCreditLimit: (limitPaise, selectedPortfolioValue) =>
    set((state) => {
      const formatted = formatINR(limitPaise);
      const used = state.usedCreditPaise;
      const availablePaise = Math.max(0, limitPaise - used);
      return {
        creditLimit: formatted,
        creditLimitPaise: limitPaise,
        availableCredit: formatINR(availablePaise),
        availableCreditPaise: availablePaise,
        ...(selectedPortfolioValue !== undefined ? { selectedPortfolioValue } : {}),
      };
    }),
  toggleFund: (id) =>
    set((state) => {
      if (state.selectedFunds.includes(id)) {
        return {
          selectedFunds: state.selectedFunds.filter((fundId) => fundId !== id),
        };
      }
      // Enforce the max-selection bound (Req 7.2): ignore additions beyond it.
      if (state.selectedFunds.length >= MAX_SELECTED_FUNDS) {
        return {};
      }
      return { selectedFunds: [...state.selectedFunds, id] };
    }),
  setPledgeStatus: (status) => set(() => ({ pledgeStatus: status })),
  setVerificationStatus: (step, status) =>
    set((state) => ({
      verificationStatus: { ...state.verificationStatus, [step]: status },
    })),
  setBankVerificationStatus: (status) =>
    set(() => ({ bankVerificationStatus: status })),
  setMandateStatus: (status) => set(() => ({ mandateStatus: status })),
  setAgreementStatus: (status) => set(() => ({ agreementStatus: status })),
  setESignStatus: (status) => set(() => ({ eSignStatus: status })),
  setFinalReviewStatus: (status) => set(() => ({ finalReviewStatus: status })),
  activateAccount: () => set(() => ({ activationStatus: "active" })),
  setAsyncInFlight: (inFlight) =>
    set((state) => ({
      session: { ...state.session, asyncInFlight: inFlight },
    })),
}));
