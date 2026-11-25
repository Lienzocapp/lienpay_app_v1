/**
 * LienPay — Application_State type model (single centralized definition).
 *
 * This module is the single source of truth for the status enumerations, the
 * collection/entity data models, and the full `ApplicationState` shape. Both
 * experiences (Landing_Page and Product_Application) and the single Zustand
 * store consume these types; no duplicate state shapes exist elsewhere.
 *
 * Requirements: 19.1 (single centralized Application_State), 19.3 (LTV and
 * Credit_Health are fixed display values, never computed).
 * Design: State Model (status enumerations, full state shape), Data Models
 * (collection/entity models).
 */

/* -------------------------------------------------------------------------- */
/* Status enumerations                                                        */
/* -------------------------------------------------------------------------- */

/** Progress of a single onboarding/verification step. */
export type StepStatus = "not_started" | "in_progress" | "complete";

/** Lifecycle of the pledge (fund-pledging) operation. */
export type PledgeStatus = "not_started" | "processing" | "success" | "failed";

/** Whether the credit account is activated. */
export type ActivationStatus = "inactive" | "in_progress" | "active";

/**
 * Credit_Health is a FIXED display value (Req 12.1, 19.3). It is stored, never
 * computed, and the only permitted value in this prototype is `"Healthy"`.
 */
export type CreditHealth = "Healthy";

/* -------------------------------------------------------------------------- */
/* Collection / entity data models                                            */
/* -------------------------------------------------------------------------- */

/**
 * A single transaction. Display strings (`amount`) are canonical and
 * character-for-character; `amountPaise` exists only for arithmetic. `origin`
 * distinguishes seeded history from a completed demo payment so the two are
 * never conflated (e.g. the seeded DMart row vs. a demo-payment DMart row).
 */
export interface Transaction {
  /** Stable id; a demo payment receives a distinct id from any seeded entry. */
  id: string;
  /** Merchant label, e.g. "DMart" (character-for-character). */
  merchant: string;
  /** Display amount string, e.g. "₹1,856" (character-for-character). */
  amount: string;
  /** Integer paise mirror of `amount`, used for arithmetic only. */
  amountPaise: number;
  /** Distinguishes seeded history from a completed demo payment. */
  origin: "seed" | "demo_payment";
  /** Sort key; the list is presented most-recent-first. */
  timestamp: number;
}

/** A single repayment history entry. */
export interface Repayment {
  id: string;
  label: string;
  amount: string;
  timestamp: number;
}

/** A single notification item. */
export interface Notification {
  id: string;
  title: string;
  body: string;
  unread: boolean;
}

/**
 * A single mutual-fund holding available for pledging.
 *
 * The core fields (`id`, `name`, `value`, `eligible`) drive the Fund Selection
 * mechanics. The remaining fields are OPTIONAL presentational detail used by the
 * richer Portfolio holding cards (category, pledge-eligible amount, current /
 * locked NAV and units). They are optional so lightweight fund fixtures (e.g.
 * test data) remain valid without them.
 */
export interface Fund {
  id: string;
  name: string;
  /** Total holding value display string, e.g. "₹1,84,000". */
  value: string;
  eligible: boolean;
  /** Fund category label, e.g. "Large Cap" / "Flexi Cap" / "Small Cap". */
  category?: string;
  /** Pledge-eligible amount display string, e.g. "₹92,000". */
  eligibleValue?: string;
  /** Current market NAV display string, e.g. "₹152". */
  currentNav?: string;
  /** Locked (collateral) NAV display string, e.g. "₹146.68". */
  lockedNav?: string;
  /** Units held display string, e.g. "1,210.53". */
  units?: string;
}

/** The repayments block held in Application_State. */
export interface RepaymentsState {
  /** Outstanding amount display string, e.g. "₹24,680". */
  outstanding: string;
  /** Amount due display string, e.g. "₹8,240". */
  amountDue: string;
  /** Repayment history entries. */
  history: Repayment[];
}

/* -------------------------------------------------------------------------- */
/* Sub-shapes of Application_State                                            */
/* -------------------------------------------------------------------------- */

/** Onboarding step statuses that drive the resume resolver (steps 1–6). */
export interface OnboardingStatus {
  splash: StepStatus;
  mobileVerification: StepStatus;
  otpVerification: StepStatus;
  nameSetup: StepStatus;
  welcome: StepStatus;
  preActivationHome: StepStatus;
}

/** KYC-block verification statuses (steps 11–13). */
export interface VerificationStatus {
  kyc: StepStatus;
  aadhaar: StepStatus;
  selfie: StepStatus;
}

/** Transient session / preview state (in-memory, reset on reload). */
export interface SessionState {
  /** The user's entered name, or null before Name Setup. */
  userName: string | null;
  /** Current screen id, used for the 1..20 progress indicator. */
  currentScreenId: string;
  /** Preview/session flag. */
  previewMode: boolean;
  /**
   * Transient: a blocking mock operation is currently running. Drives the
   * Activate_Account_CTA disabled/in-flight guard; reset on reload.
   */
  asyncInFlight: boolean;
}

/* -------------------------------------------------------------------------- */
/* Full Application_State shape                                               */
/* -------------------------------------------------------------------------- */

/**
 * The complete, typed Application_State shape. Held by the single Zustand
 * store, initialized from the canonical Initial_Snapshot, and session-scoped
 * (reset on reload).
 */
export interface ApplicationState {
  // --- Onboarding / activation status fields (drive the resume resolver) ---
  onboardingStatus: OnboardingStatus;
  verificationStatus: VerificationStatus;

  // --- Check-My-Limit (eligibility) journey statuses (screens 7–14) ---
  /** PAN entered + accepted on the PAN Verification screen. */
  panStatus: StepStatus;
  /** PAN verified by the (mock) verification service on PAN Processing. */
  panProcessingStatus: StepStatus;
  /** Mutual-fund account connection initiated on MF Connection. */
  mfConnectionStatus: StepStatus;
  /** Explicit data-access consent granted on the Consent screen. */
  mfConsentStatus: StepStatus;
  /** Investments retrieved (portfolio discovered) on Fetching Investments. */
  investmentsFetchStatus: StepStatus;
  /** Discovered portfolio reviewed + acknowledged on Portfolio Found. */
  portfolioFoundStatus: StepStatus;
  /** Eligible credit limit computed on Eligibility Calculation. */
  eligibilityStatus: StepStatus;
  /**
   * The PAN the user entered (uppercased display string), or null before the
   * PAN Verification screen. Session-scoped demo value; cleared on reset. Read
   * by PAN Processing to run the deterministic mock verification.
   */
  panNumber: string | null;

  /**
   * Credit-eligibility acknowledgement (the Eligible Credit Limit Result
   * "Continue"). Retained from the original single Portfolio/Eligibility step;
   * now marks that the user has seen their limit and is proceeding to Fund
   * Selection (Design: Onboarding Resume Logic).
   */
  portfolioStatus: StepStatus;
  selectedFunds: string[];
  pledgeStatus: PledgeStatus;
  bankVerificationStatus: StepStatus;
  mandateStatus: StepStatus;
  agreementStatus: StepStatus;
  eSignStatus: StepStatus;
  finalReviewStatus: StepStatus;
  activationStatus: ActivationStatus;

  // --- Financial values (Initial_Snapshot on load, display strings) ---
  portfolioValue: string;
  creditLimit: string;
  availableCredit: string;
  usedCredit: string;
  /** FIXED display value "34%" — NOT computed (Req 19.3, 19.5). */
  ltv: string;
  /** FIXED display value "Healthy" — NOT computed (Req 19.3). */
  creditHealth: CreditHealth;

  // --- Numeric mirrors used ONLY for pay/repay arithmetic (paise integers) ---
  creditLimitPaise: number;
  availableCreditPaise: number;
  usedCreditPaise: number;

  // --- Collections ---
  transactions: Transaction[];
  repayments: RepaymentsState;
  notifications: Notification[];

  // --- Session / preview ---
  session: SessionState;
}
