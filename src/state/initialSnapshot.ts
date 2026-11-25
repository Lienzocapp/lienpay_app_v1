/**
 * LienPay — canonical Initial_Snapshot (single canonical source).
 *
 * `INITIAL_SNAPSHOT` is one frozen object holding the load-time canonical
 * Application_State: the mandated fixed financial values (character-for-
 * character), the paise mirrors, the five seeded transactions, the repayment
 * data, and the default onboarding/verification/session statuses. The store is
 * initialized from this snapshot and `resetToSnapshot()` restores it, which —
 * together with the store being in-memory/session-scoped — satisfies
 * reset-on-reload (Req 5.10, 11.12, 19.7).
 *
 * The mandated values are LOCKED and MUST NOT be altered; LTV and Credit_Health
 * are fixed display values (NOT computed) (Req 19.3, 19.5).
 *
 * Requirements: 12.1, 12.2, 12.3 (exact values character-for-character),
 * 19.2 (canonical Initial_Snapshot), 19.3/19.5 (fixed LTV & Credit_Health).
 * Design: Initial_Snapshot (canonical), Data Models.
 */
import type { ApplicationState } from "./types";
import { PORTFOLIO_DATA } from "../mock/data/portfolio";
import { SEED_TRANSACTIONS } from "../mock/data/transactions";
import { REPAYMENTS_DATA } from "../mock/data/repayments";
import { NOTIFICATIONS_DATA } from "../mock/data/notifications";

/**
 * Recursively freezes an object graph so the canonical snapshot cannot be
 * mutated in place. The store consumes deep clones (see {@link createInitialState})
 * so runtime mutations never touch this frozen source.
 */
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as Record<string, unknown>)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

/**
 * The canonical, frozen Initial_Snapshot. This is the single source consumed
 * by the store at initialization and on `resetToSnapshot()`.
 */
export const INITIAL_SNAPSHOT: Readonly<ApplicationState> = deepFreeze({
  // --- Onboarding / activation status fields (default: nothing started) ---
  onboardingStatus: {
    splash: "not_started",
    mobileVerification: "not_started",
    otpVerification: "not_started",
    nameSetup: "not_started",
    welcome: "not_started",
    preActivationHome: "not_started",
  },
  verificationStatus: {
    kyc: "not_started",
    aadhaar: "not_started",
    selfie: "not_started",
  },
  // Check-My-Limit (eligibility) journey — nothing started at load.
  panStatus: "not_started",
  panProcessingStatus: "not_started",
  mfConnectionStatus: "not_started",
  mfConsentStatus: "not_started",
  investmentsFetchStatus: "not_started",
  portfolioFoundStatus: "not_started",
  eligibilityStatus: "not_started",
  panNumber: null,
  portfolioStatus: "not_started",
  selectedFunds: [],
  pledgeStatus: "not_started",
  bankVerificationStatus: "not_started",
  mandateStatus: "not_started",
  agreementStatus: "not_started",
  eSignStatus: "not_started",
  finalReviewStatus: "not_started",
  activationStatus: "inactive",

  // --- Financial values (LOCKED, character-for-character) ---
  portfolioValue: PORTFOLIO_DATA.portfolioValue,
  creditLimit: PORTFOLIO_DATA.creditLimit,
  availableCredit: PORTFOLIO_DATA.availableCredit,
  usedCredit: PORTFOLIO_DATA.usedCredit,
  ltv: PORTFOLIO_DATA.ltv, // fixed "34%" — NOT computed
  creditHealth: PORTFOLIO_DATA.creditHealth, // fixed "Healthy" — NOT computed

  // --- Paise mirrors (arithmetic only) ---
  creditLimitPaise: PORTFOLIO_DATA.creditLimitPaise,
  availableCreditPaise: PORTFOLIO_DATA.availableCreditPaise,
  usedCreditPaise: PORTFOLIO_DATA.usedCreditPaise,

  // --- Collections ---
  transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
  repayments: {
    outstanding: REPAYMENTS_DATA.outstanding,
    amountDue: REPAYMENTS_DATA.amountDue,
    history: [],
  },
  notifications: NOTIFICATIONS_DATA.map((n) => ({ ...n })),

  // --- Session / preview ---
  session: {
    userName: null,
    currentScreenId: "splash",
    previewMode: false,
    asyncInFlight: false,
  },
});

/**
 * Produces a fresh, deeply-cloned mutable copy of the canonical snapshot for
 * the store to own. Because the store mutates its own copy (never the frozen
 * source), the canonical Initial_Snapshot is preserved across resets.
 */
export function createInitialState(): ApplicationState {
  return {
    onboardingStatus: { ...INITIAL_SNAPSHOT.onboardingStatus },
    verificationStatus: { ...INITIAL_SNAPSHOT.verificationStatus },
    panStatus: INITIAL_SNAPSHOT.panStatus,
    panProcessingStatus: INITIAL_SNAPSHOT.panProcessingStatus,
    mfConnectionStatus: INITIAL_SNAPSHOT.mfConnectionStatus,
    mfConsentStatus: INITIAL_SNAPSHOT.mfConsentStatus,
    investmentsFetchStatus: INITIAL_SNAPSHOT.investmentsFetchStatus,
    portfolioFoundStatus: INITIAL_SNAPSHOT.portfolioFoundStatus,
    eligibilityStatus: INITIAL_SNAPSHOT.eligibilityStatus,
    panNumber: INITIAL_SNAPSHOT.panNumber,
    portfolioStatus: INITIAL_SNAPSHOT.portfolioStatus,
    selectedFunds: [...INITIAL_SNAPSHOT.selectedFunds],
    pledgeStatus: INITIAL_SNAPSHOT.pledgeStatus,
    bankVerificationStatus: INITIAL_SNAPSHOT.bankVerificationStatus,
    mandateStatus: INITIAL_SNAPSHOT.mandateStatus,
    agreementStatus: INITIAL_SNAPSHOT.agreementStatus,
    eSignStatus: INITIAL_SNAPSHOT.eSignStatus,
    finalReviewStatus: INITIAL_SNAPSHOT.finalReviewStatus,
    activationStatus: INITIAL_SNAPSHOT.activationStatus,

    portfolioValue: INITIAL_SNAPSHOT.portfolioValue,
    creditLimit: INITIAL_SNAPSHOT.creditLimit,
    availableCredit: INITIAL_SNAPSHOT.availableCredit,
    usedCredit: INITIAL_SNAPSHOT.usedCredit,
    ltv: INITIAL_SNAPSHOT.ltv,
    creditHealth: INITIAL_SNAPSHOT.creditHealth,

    creditLimitPaise: INITIAL_SNAPSHOT.creditLimitPaise,
    availableCreditPaise: INITIAL_SNAPSHOT.availableCreditPaise,
    usedCreditPaise: INITIAL_SNAPSHOT.usedCreditPaise,

    transactions: INITIAL_SNAPSHOT.transactions.map((t) => ({ ...t })),
    repayments: {
      outstanding: INITIAL_SNAPSHOT.repayments.outstanding,
      amountDue: INITIAL_SNAPSHOT.repayments.amountDue,
      history: INITIAL_SNAPSHOT.repayments.history.map((r) => ({ ...r })),
    },
    notifications: INITIAL_SNAPSHOT.notifications.map((n) => ({ ...n })),

    session: { ...INITIAL_SNAPSHOT.session },
  };
}
