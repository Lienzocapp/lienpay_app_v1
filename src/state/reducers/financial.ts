/**
 * LienPay — pure financial pay/repay reducers (integer paise arithmetic).
 *
 * `recordPayment` and `recordRepayment` are PURE functions: they take the
 * current Application_State and an integer paise amount and return a NEW state
 * object. They never mutate their input and never call any API. All arithmetic
 * is performed on integer paise mirrors (no floating point); the canonical
 * display strings (`usedCredit`, `availableCredit`, `outstanding`, `amountDue`)
 * are re-derived from the paise values via the Indian formatter (`formatINR`)
 * so display fidelity is never lost to float formatting.
 *
 * Invariant preserved by BOTH reducers:
 *   availableCreditPaise + usedCreditPaise === creditLimitPaise
 *
 * LTV and Credit_Health are FIXED display values and are NEVER recomputed here
 * (Req 19.3, 19.5); `creditLimit`/`creditLimitPaise` are likewise unchanged.
 *
 * Requirements: 21.4 (payment updates credit position), 11.10/11.11 (spend/pay
 * updates Used_Credit & Available_Credit and all dependents), 19.8 (central
 * state update), 19.3/19.5 (LTV & Credit_Health fixed, never recomputed).
 * Design: Financial State Updates (payment & repayment reducer pseudocode),
 * State Model.
 */
import type { ApplicationState, Transaction } from "../types";
import { formatINR, parseINR } from "../../formatting/inr";

/** Guards that an amount is a non-negative integer number of paise. */
function assertPaise(amountPaise: number): void {
  if (!Number.isInteger(amountPaise) || amountPaise < 0) {
    throw new RangeError(
      `financial reducer expects a non-negative integer paise amount, received: ${amountPaise}`
    );
  }
}

/**
 * Records a simulated payment/spend of `amountPaise`.
 *
 * - `usedCreditPaise` increases by `amountPaise`.
 * - `availableCreditPaise` is re-derived as `creditLimitPaise - usedCreditPaise`
 *   so the credit invariant holds by construction.
 * - `usedCredit`/`availableCredit` display strings are re-derived via `formatINR`.
 * - When a `transaction` is supplied it is prepended (most-recent-first); the
 *   transaction identity (id, merchant, origin, timestamp) is supplied by the
 *   caller so this reducer stays deterministic and invents no values.
 * - `creditLimit`, `creditLimitPaise`, `ltv`, and `creditHealth` are unchanged.
 *
 * @param state - Current Application_State (not mutated).
 * @param amountPaise - Non-negative integer paise to spend.
 * @param transaction - Optional transaction to prepend to the history.
 * @returns A new Application_State reflecting the payment.
 */
export function recordPayment(
  state: ApplicationState,
  amountPaise: number,
  transaction?: Transaction
): ApplicationState {
  assertPaise(amountPaise);

  const usedCreditPaise = state.usedCreditPaise + amountPaise;
  const availableCreditPaise = state.creditLimitPaise - usedCreditPaise;

  return {
    ...state,
    usedCreditPaise,
    availableCreditPaise,
    usedCredit: formatINR(usedCreditPaise),
    availableCredit: formatINR(availableCreditPaise),
    transactions: transaction
      ? [transaction, ...state.transactions]
      : state.transactions,
    // creditLimit / creditLimitPaise / ltv / creditHealth are NOT recomputed.
  };
}

/**
 * Records a simulated repayment of `amountPaise`.
 *
 * - `usedCreditPaise` decreases by `amountPaise`, clamped at 0 (never negative).
 * - `availableCreditPaise` is re-derived as `creditLimitPaise - usedCreditPaise`
 *   so the credit invariant holds by construction.
 * - `usedCredit`/`availableCredit` display strings are re-derived via `formatINR`.
 * - The repayment `outstanding`/`amountDue` display strings are reduced by the
 *   repaid amount using integer paise arithmetic (clamped at 0) and re-derived
 *   via `formatINR`, per the design's repayment reducer.
 * - `creditLimit`, `creditLimitPaise`, `ltv`, and `creditHealth` are unchanged.
 *
 * @param state - Current Application_State (not mutated).
 * @param amountPaise - Non-negative integer paise to repay.
 * @returns A new Application_State reflecting the repayment.
 */
export function recordRepayment(
  state: ApplicationState,
  amountPaise: number
): ApplicationState {
  assertPaise(amountPaise);

  const usedCreditPaise = Math.max(0, state.usedCreditPaise - amountPaise);
  const availableCreditPaise = state.creditLimitPaise - usedCreditPaise;

  const outstandingPaise = Math.max(
    0,
    parseINR(state.repayments.outstanding) - amountPaise
  );
  const amountDuePaise = Math.max(
    0,
    parseINR(state.repayments.amountDue) - amountPaise
  );

  return {
    ...state,
    usedCreditPaise,
    availableCreditPaise,
    usedCredit: formatINR(usedCreditPaise),
    availableCredit: formatINR(availableCreditPaise),
    repayments: {
      ...state.repayments,
      outstanding: formatINR(outstandingPaise),
      amountDue: formatINR(amountDuePaise),
    },
    // creditLimit / creditLimitPaise / ltv / creditHealth are NOT recomputed.
  };
}
