/**
 * Property-based test for fixed LTV and Credit_Health (Property 7).
 *
 * For any sequence of pay / repay / credit-changing store operations, the
 * `ltv` display value remains the string "34%" and `creditHealth` remains
 * "Healthy". Neither is ever recomputed from other state values — they are
 * fixed display constants (Req 19.3, 19.5).
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { useLienPayStore } from "./store";

/**
 * A credit-changing operation. `reset` exercises resetToSnapshot; pay/repay
 * mutate the credit position via the store actions.
 */
interface Op {
  type: "pay" | "repay" | "reset";
  /** Fraction in [0, 1] of the available (pay) or used (repay) paise balance. */
  fraction: number;
}

const opArb: fc.Arbitrary<Op> = fc.record({
  type: fc.constantFrom<"pay" | "repay" | "reset">("pay", "repay", "reset"),
  fraction: fc.double({ min: 0, max: 1, noNaN: true }),
});

// Feature: lienpay, Property 7: For any sequence of pay/repay/pledge/credit-change operations, the ltv value remains the string "34%" and creditHealth remains "Healthy" — neither is ever recomputed from other state values.
// Validates: Requirements 19.3, 19.5
describe("Property 7: LTV and Credit_Health are fixed display values", () => {
  it('keeps ltv === "34%" and creditHealth === "Healthy" throughout any operation sequence', () => {
    fc.assert(
      fc.property(fc.array(opArb, { maxLength: 50 }), (ops) => {
        useLienPayStore.getState().resetToSnapshot();

        // Fixed values are correct from the canonical snapshot.
        expect(useLienPayStore.getState().ltv).toBe("34%");
        expect(useLienPayStore.getState().creditHealth).toBe("Healthy");

        for (const op of ops) {
          const s = useLienPayStore.getState();
          if (op.type === "pay") {
            s.recordPayment(Math.floor(op.fraction * s.availableCreditPaise));
          } else if (op.type === "repay") {
            s.recordRepayment(Math.floor(op.fraction * s.usedCreditPaise));
          } else {
            s.resetToSnapshot();
          }

          const next = useLienPayStore.getState();
          // Fixed display values are never recomputed by any operation.
          expect(next.ltv).toBe("34%");
          expect(next.creditHealth).toBe("Healthy");
        }
      })
    );

    // Restore a clean canonical state for any subsequent tests.
    useLienPayStore.getState().resetToSnapshot();
  });
});
