/**
 * Property-based test for the DMart demo payment (Property 5).
 *
 * Exercises the pure state transition that "completing the DMart ₹1,856 demo
 * payment" triggers: prepending a distinct `origin: "demo_payment"` transaction
 * via the store's `recordPayment` action and moving `usedCreditPaise` by exactly
 * the demo-payment amount. The demo-payment details come from the single
 * `DEMO_PAYMENT_DETAILS` source so the test is faithful to what
 * `Mock_Service.makeDemoPayment` produces. fast-check varies the distinct id /
 * timestamp of each demo-payment instance to assert the property holds for any
 * such completion, always starting from a fresh Initial_Snapshot.
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { useLienPayStore } from "./store";
import { DEMO_PAYMENT_DETAILS } from "../mock/mockService";
import type { Transaction } from "./types";

// Feature: lienpay, Property 5: For any Initial_Snapshot, completing the DMart ₹1,856 demo payment prepends exactly one new transaction with origin: "demo_payment" and a distinct id (never merging with the seeded DMart entry), increases the transaction count by exactly one, and increases usedCreditPaise by exactly the demo-payment amount (single, non-duplicated count).
// Validates: Requirements 21.3, 21.4, 12.2
describe("Property 5: Demo payment appends a distinct transaction counted exactly once", () => {
  it("prepends one distinct demo_payment txn and moves usedCredit by exactly the amount", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1_000_000 }), (nonce) => {
        // Start from the canonical Initial_Snapshot.
        useLienPayStore.getState().resetToSnapshot();
        const before = useLienPayStore.getState();
        const beforeCount = before.transactions.length;
        const beforeUsedPaise = before.usedCreditPaise;

        // The distinct demo-payment transaction (mirrors makeDemoPayment).
        const demoTxn: Transaction = {
          id: `demo_payment-dmart-${nonce}`,
          merchant: DEMO_PAYMENT_DETAILS.merchant,
          amount: DEMO_PAYMENT_DETAILS.amount,
          amountPaise: DEMO_PAYMENT_DETAILS.amountPaise,
          origin: "demo_payment",
          timestamp: before.transactions[0]!.timestamp + nonce,
        };

        // Complete the demo payment.
        useLienPayStore
          .getState()
          .recordPayment(demoTxn.amountPaise, demoTxn);
        const after = useLienPayStore.getState();

        // Exactly one new transaction, prepended (most-recent-first).
        expect(after.transactions.length).toBe(beforeCount + 1);
        expect(after.transactions[0]!.id).toBe(demoTxn.id);
        expect(after.transactions[0]!.origin).toBe("demo_payment");

        // Never merges with the seeded DMart entry: the seeded row is still
        // present exactly once and unchanged, and the demo id is distinct.
        expect(demoTxn.id).not.toBe("seed-dmart");
        const seeded = after.transactions.filter((t) => t.id === "seed-dmart");
        expect(seeded).toHaveLength(1);
        expect(seeded[0]!.origin).toBe("seed");

        // The demo payment is counted exactly once.
        const demoMatches = after.transactions.filter(
          (t) => t.origin === "demo_payment" && t.id === demoTxn.id
        );
        expect(demoMatches).toHaveLength(1);

        // usedCreditPaise increased by EXACTLY the demo-payment amount.
        expect(after.usedCreditPaise).toBe(
          beforeUsedPaise + DEMO_PAYMENT_DETAILS.amountPaise
        );
      })
    );

    // Restore a clean canonical state for any subsequent tests.
    useLienPayStore.getState().resetToSnapshot();
  });
});
