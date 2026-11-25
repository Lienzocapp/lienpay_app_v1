/**
 * Property-based test for the credit-position invariant (Property 4).
 *
 * For any finite sequence of simulated pay/repay operations (amounts kept
 * within the credit limit), applying them through the store actions from the
 * Initial_Snapshot preserves:
 *   - availableCreditPaise + usedCreditPaise === creditLimitPaise,
 *   - usedCreditPaise never becomes negative, and
 *   - the displayed availableCredit / usedCredit strings equal formatINR of
 *     their respective paise fields.
 *
 * Amounts are generated as a fraction of the currently-available (pay) or
 * currently-used (repay) balance so the sequence always stays within the
 * credit limit, as the property specifies.
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { useLienPayStore } from "./store";
import { formatINR } from "../formatting/inr";

/** A single simulated operation: pay or repay a fraction of the relevant balance. */
interface Op {
  type: "pay" | "repay";
  /** Fraction in [0, 1] of the available (pay) or used (repay) paise balance. */
  fraction: number;
}

const opArb: fc.Arbitrary<Op> = fc.record({
  type: fc.constantFrom<"pay" | "repay">("pay", "repay"),
  fraction: fc.double({ min: 0, max: 1, noNaN: true }),
});

// Feature: lienpay, Property 4: For any Initial_Snapshot and any finite sequence of simulated payment and repayment operations with amounts within the credit limit, after applying the sequence the equality availableCreditPaise + usedCreditPaise == creditLimitPaise holds, usedCreditPaise never becomes negative, and the displayed availableCredit/usedCredit strings equal the Indian-formatted values of the respective paise fields.
// Validates: Requirements 21.4, 11.10, 19.8
describe("Property 4: Credit position invariant across any pay/repay sequence", () => {
  it("preserves the credit invariant, non-negative used credit, and display fidelity", () => {
    fc.assert(
      fc.property(fc.array(opArb, { maxLength: 50 }), (ops) => {
        // Start from the canonical Initial_Snapshot.
        useLienPayStore.getState().resetToSnapshot();

        for (const op of ops) {
          const s = useLienPayStore.getState();
          if (op.type === "pay") {
            // Spend at most the currently-available credit (stays within limit).
            const amount = Math.floor(op.fraction * s.availableCreditPaise);
            s.recordPayment(amount);
          } else {
            // Repay at most the currently-used credit (never below zero).
            const amount = Math.floor(op.fraction * s.usedCreditPaise);
            s.recordRepayment(amount);
          }

          const next = useLienPayStore.getState();
          // Invariant holds after every operation.
          expect(next.availableCreditPaise + next.usedCreditPaise).toBe(
            next.creditLimitPaise
          );
          // Used credit is never negative.
          expect(next.usedCreditPaise).toBeGreaterThanOrEqual(0);
          // Display strings equal the Indian-formatted paise fields.
          expect(next.usedCredit).toBe(formatINR(next.usedCreditPaise));
          expect(next.availableCredit).toBe(formatINR(next.availableCreditPaise));
        }
      })
    );

    // Restore a clean canonical state for any subsequent tests.
    useLienPayStore.getState().resetToSnapshot();
  });
});
