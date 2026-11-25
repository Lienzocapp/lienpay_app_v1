/**
 * LienPay — centralized Mock_Service (single data/action layer).
 *
 * This is the ONLY data/action layer in the prototype. It NEVER calls real
 * banking / PAN / Aadhaar / UPI / mutual-fund / pledge / payment endpoints and
 * issues NO outbound network request of any kind — every method resolves from
 * the single central dataset in `mock/data/*` after a simulated `setTimeout`
 * delay (Req 13.1, 13.2). All demo data comes from one central source
 * (Req 12.5); no data is duplicated or redefined here.
 *
 * Behavior (Req 13.3, 13.4, 13.5, 7.6, 12.6):
 *  - Reads return `{ status: "success", data }` from the central dataset.
 *  - Verification / setup operations resolve success after a standard delay
 *    (500–2000ms).
 *  - `processPledge` is deliberately long-running (2000–5000ms).
 *  - State-changing operations (`makeDemoPayment`, `makeRepayment`) return the
 *    data the store's financial reducers consume — they do NOT hold a second
 *    financial state.
 *  - A request with no matching mock data resolves a mock error and leaves
 *    existing data unchanged (Req 13.4).
 *
 * Requirements: 12.5, 12.6, 13.1, 13.2, 13.3, 13.4, 13.5, 7.6.
 * Design: Mock Service Architecture (service interface, delay strategy,
 * success/failure/unknown-request behavior, how screens consume it).
 */
import type {
  Fund,
  Notification,
  RepaymentsState,
  Transaction,
} from "../state/types";
import { PORTFOLIO_DATA } from "./data/portfolio";
import { SEED_TRANSACTIONS } from "./data/transactions";
import { REPAYMENTS_DATA } from "./data/repayments";
import { FUNDS_DATA, MAX_FUNDS } from "./data/funds";
import { NOTIFICATIONS_DATA } from "./data/notifications";
import { ELIGIBILITY_DATA } from "./data/eligibility";
import { DEMO_PAN_DECLINED, isValidPanFormat, normalizePan } from "./data/pan";
import { longRunningDelay, standardDelay } from "./delay";

/* -------------------------------------------------------------------------- */
/* Result and read-model types                                                */
/* -------------------------------------------------------------------------- */

/** The uniform result envelope returned by every Mock_Service method. */
export interface MockResult<T> {
  status: "success" | "error";
  data?: T;
  error?: string;
}

/**
 * The portfolio / credit position snapshot read model (display strings plus
 * paise mirrors), sourced character-for-character from the central portfolio
 * dataset. Mirrors the mandated fixed values (Req 12.1).
 */
export interface PortfolioSnapshot {
  portfolioValue: string;
  creditLimit: string;
  availableCredit: string;
  usedCredit: string;
  ltv: string;
  creditHealth: string;
  creditLimitPaise: number;
  availableCreditPaise: number;
  usedCreditPaise: number;
}

/** The repayments read model (Outstanding, Amount Due, history). */
export type RepaymentData = RepaymentsState;

/**
 * The deterministic Check-My-Limit result read model, sourced
 * character-for-character from the central eligibility dataset. Shown on the
 * Eligible Credit Limit Result screen.
 */
export interface EligibilityResult {
  eligibleCreditLimit: string;
  portfolioValue: string;
  eligibleInvestments: string;
}

/** The centralized Mock_Service contract. */
export interface MockService {
  // --- Data reads (from the central dataset) ---
  getPortfolioSnapshot(): Promise<MockResult<PortfolioSnapshot>>;
  getFunds(): Promise<MockResult<Fund[]>>; // max 50 (Req 7.2)
  getTransactions(): Promise<MockResult<Transaction[]>>;
  getRepayments(): Promise<MockResult<RepaymentData>>;
  getNotifications(): Promise<MockResult<Notification[]>>;

  // --- Check-My-Limit (eligibility) journey — deterministic mocks ---
  /** Deterministic PAN verification (no real PAN endpoint; Req 13.1, 13.2). */
  verifyPan(pan: string): Promise<MockResult<void>>;
  /** Simulated mutual-fund account connection. */
  connectMutualFunds(): Promise<MockResult<void>>;
  /** Simulated retrieval of the user's investments (the central funds). */
  fetchInvestments(): Promise<MockResult<Fund[]>>;
  /** Deterministic eligible-credit-limit calculation (₹2,21,000). */
  calculateEligibility(): Promise<MockResult<EligibilityResult>>;

  // --- Simulated verification / setup (500–2000ms) — Req 6, 8 ---
  sendOtp(mobile: string): Promise<MockResult<void>>;
  verifyOtp(code: string): Promise<MockResult<void>>;
  submitKyc(payload: unknown): Promise<MockResult<void>>;
  submitAadhaar(payload: unknown): Promise<MockResult<void>>;
  submitSelfie(payload: unknown): Promise<MockResult<void>>;
  captureBankAccount(payload: unknown): Promise<MockResult<void>>;
  setupMandate(payload: unknown): Promise<MockResult<void>>;

  // --- Deliberately long-running (2000–5000ms) — Req 7.6 ---
  processPledge(funds: string[]): Promise<MockResult<void>>;

  // --- State-changing simulated operations — Req 21, 11 ---
  makeDemoPayment(): Promise<MockResult<Transaction>>; // DMart ₹1,856
  makeRepayment(amountPaise: number): Promise<MockResult<void>>;
}

/* -------------------------------------------------------------------------- */
/* Result helpers                                                             */
/* -------------------------------------------------------------------------- */

/** Builds a success result. */
function success<T>(data: T): MockResult<T> {
  return { status: "success", data };
}

/** Builds a success result carrying no data (void operations). */
function successVoid(): MockResult<void> {
  return { status: "success" };
}

/** Builds a mock error result. Existing screen data is left unchanged. */
function error<T>(message: string): MockResult<T> {
  return { status: "error", error: message };
}

/**
 * Wraps a read against the central dataset: if the requested data is missing
 * (no matching mock data), returns a mock error and leaves data unchanged
 * (Req 13.4, 12.6); otherwise returns a success envelope.
 */
function readResult<T>(data: T | null | undefined, label: string): MockResult<T> {
  if (data === null || data === undefined) {
    return error<T>(`No mock data available for "${label}".`);
  }
  return success<T>(data);
}

/* -------------------------------------------------------------------------- */
/* Demo payment factory (DMart ₹1,856, origin "demo_payment")                 */
/* -------------------------------------------------------------------------- */

/**
 * The mandated demo-payment details (Req 21.3), exposed as a single source so
 * the Pay UI's confirmation view and the transaction factory agree exactly.
 * Merchant "DMart", Amount ₹1,856 (character-for-character), Payment Method
 * "LienPay Credit Line". `amountPaise` mirrors the display amount for the
 * store's paise arithmetic only.
 */
export const DEMO_PAYMENT_DETAILS = {
  merchant: "DMart",
  amount: "₹1,856",
  amountPaise: 185600,
  paymentMethod: "LienPay Credit Line",
} as const;

/**
 * Builds a fresh demo-payment Transaction distinct from the seeded DMart row
 * (distinct id + `origin: "demo_payment"`), so seeded history and the demo
 * payment are never conflated. The store's `recordPayment` reducer consumes
 * this object; the Mock_Service holds no financial state of its own.
 */
function buildDemoPaymentTransaction(): Transaction {
  const timestamp = Date.now();
  return {
    id: `demo_payment-dmart-${timestamp}`,
    merchant: DEMO_PAYMENT_DETAILS.merchant,
    amount: DEMO_PAYMENT_DETAILS.amount,
    amountPaise: DEMO_PAYMENT_DETAILS.amountPaise,
    origin: "demo_payment",
    timestamp,
  };
}

/* -------------------------------------------------------------------------- */
/* Mock_Service implementation                                                */
/* -------------------------------------------------------------------------- */

/**
 * The single centralized Mock_Service instance. All async goes through the
 * simulated-delay helpers; there is no `fetch`/`XMLHttpRequest` usage anywhere.
 */
export const mockService: MockService = {
  // --- Data reads ---------------------------------------------------------
  async getPortfolioSnapshot(): Promise<MockResult<PortfolioSnapshot>> {
    await standardDelay();
    const snapshot: PortfolioSnapshot = {
      portfolioValue: PORTFOLIO_DATA.portfolioValue,
      creditLimit: PORTFOLIO_DATA.creditLimit,
      availableCredit: PORTFOLIO_DATA.availableCredit,
      usedCredit: PORTFOLIO_DATA.usedCredit,
      ltv: PORTFOLIO_DATA.ltv,
      creditHealth: PORTFOLIO_DATA.creditHealth,
      creditLimitPaise: PORTFOLIO_DATA.creditLimitPaise,
      availableCreditPaise: PORTFOLIO_DATA.availableCreditPaise,
      usedCreditPaise: PORTFOLIO_DATA.usedCreditPaise,
    };
    return readResult(snapshot, "portfolioSnapshot");
  },

  async getFunds(): Promise<MockResult<Fund[]>> {
    await standardDelay();
    // Enforce the max-50 bound (Req 7.2); the central dataset is copied so the
    // source is never mutated by a consumer.
    const funds = FUNDS_DATA.slice(0, MAX_FUNDS).map((f) => ({ ...f }));
    return readResult(funds, "funds");
  },

  async getTransactions(): Promise<MockResult<Transaction[]>> {
    await standardDelay();
    const transactions = SEED_TRANSACTIONS.map((t) => ({ ...t }));
    return readResult(transactions, "transactions");
  },

  async getRepayments(): Promise<MockResult<RepaymentData>> {
    await standardDelay();
    const repayments: RepaymentData = {
      outstanding: REPAYMENTS_DATA.outstanding,
      amountDue: REPAYMENTS_DATA.amountDue,
      history: REPAYMENTS_DATA.history.map((r) => ({ ...r })),
    };
    return readResult(repayments, "repayments");
  },

  async getNotifications(): Promise<MockResult<Notification[]>> {
    await standardDelay();
    const notifications = NOTIFICATIONS_DATA.map((n) => ({ ...n }));
    return readResult(notifications, "notifications");
  },

  // --- Check-My-Limit (eligibility) journey — deterministic mocks ---------
  async verifyPan(pan: string): Promise<MockResult<void>> {
    await standardDelay();
    const normalized = normalizePan(pan);
    // Deterministic: malformed PAN or the reserved declined demo PAN fail; any
    // other well-formed PAN succeeds. No randomness, no real endpoint.
    if (!isValidPanFormat(normalized)) {
      return error<void>("That PAN doesn't look right. Please check and try again.");
    }
    if (normalized === DEMO_PAN_DECLINED) {
      return error<void>("We couldn't verify this PAN. Please try again.");
    }
    return successVoid();
  },

  async connectMutualFunds(): Promise<MockResult<void>> {
    await standardDelay();
    return successVoid();
  },

  async fetchInvestments(): Promise<MockResult<Fund[]>> {
    await standardDelay();
    // Reuses the single central fund dataset (no second portfolio model).
    const funds = FUNDS_DATA.slice(0, MAX_FUNDS).map((f) => ({ ...f }));
    return readResult(funds, "investments");
  },

  async calculateEligibility(): Promise<MockResult<EligibilityResult>> {
    await standardDelay();
    // Deterministic result from the central eligibility dataset (₹2,21,000).
    const result: EligibilityResult = {
      eligibleCreditLimit: ELIGIBILITY_DATA.eligibleCreditLimit,
      portfolioValue: ELIGIBILITY_DATA.portfolioValue,
      eligibleInvestments: ELIGIBILITY_DATA.eligibleInvestments,
    };
    return readResult(result, "eligibility");
  },

  // --- Simulated verification / setup (500–2000ms) ------------------------
  async sendOtp(_mobile: string): Promise<MockResult<void>> {
    await standardDelay();
    return successVoid();
  },

  async verifyOtp(_code: string): Promise<MockResult<void>> {
    await standardDelay();
    return successVoid();
  },

  async submitKyc(_payload: unknown): Promise<MockResult<void>> {
    await standardDelay();
    return successVoid();
  },

  async submitAadhaar(_payload: unknown): Promise<MockResult<void>> {
    await standardDelay();
    return successVoid();
  },

  async submitSelfie(_payload: unknown): Promise<MockResult<void>> {
    await standardDelay();
    return successVoid();
  },

  async captureBankAccount(_payload: unknown): Promise<MockResult<void>> {
    await standardDelay();
    return successVoid();
  },

  async setupMandate(_payload: unknown): Promise<MockResult<void>> {
    await standardDelay();
    return successVoid();
  },

  // --- Deliberately long-running (2000–5000ms) — Pledge Processing --------
  async processPledge(funds: string[]): Promise<MockResult<void>> {
    await longRunningDelay();
    // With no funds selected there is no matching pledge to process; the caller
    // (Pledge Consent gate) prevents this, but the service still guards it.
    if (!Array.isArray(funds) || funds.length === 0) {
      return error<void>("No funds selected to pledge.");
    }
    return successVoid();
  },

  // --- State-changing simulated operations --------------------------------
  async makeDemoPayment(): Promise<MockResult<Transaction>> {
    await standardDelay();
    // Return the distinct demo-payment transaction for the store's
    // `recordPayment` reducer to apply (Req 21.3, 21.4); no financial state is
    // held here.
    return success(buildDemoPaymentTransaction());
  },

  async makeRepayment(amountPaise: number): Promise<MockResult<void>> {
    await standardDelay();
    if (!Number.isInteger(amountPaise) || amountPaise < 0) {
      return error<void>("Repayment amount must be a non-negative integer (paise).");
    }
    return successVoid();
  },
};
