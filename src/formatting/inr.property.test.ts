/**
 * Property-based test for the Indian currency formatter (Property 3).
 *
 * Verifies the round-trip identity of `formatINR`/`parseINR` across the whole
 * non-negative integer paise input space using fast-check (≥100 runs by
 * default). This complements the example tests in `inr.test.ts`.
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { formatINR, parseINR } from "./inr";

// Feature: lienpay, Property 3: For any non-negative integer paise amount, formatting it produces a rupee string using Indian lakh digit grouping with the value's own decimal formatting, and parsing that formatted string returns the original amount (round-trip identity).
// Validates: Requirements 12.4, 7.1, 21.6
describe("Property 3: Indian currency formatting round-trip and grouping", () => {
  it("parseINR(formatINR(paise)) === paise for any non-negative integer paise", () => {
    fc.assert(
      fc.property(
        // Non-negative integer paise. Bounded so that rupees*100 + remainder
        // stays comfortably within Number.MAX_SAFE_INTEGER (no float loss).
        fc.nat({ max: 2_147_483_647 }),
        (paise) => {
          expect(parseINR(formatINR(paise))).toBe(paise);
        }
      )
    );
  });
});
