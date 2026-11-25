/**
 * Example (non-property) tests for the Indian currency formatter.
 *
 * These assert the canonical LOCKED values character-for-character and a few
 * round-trip cases. The exhaustive fast-check property test (Property 3) is a
 * separate task (3.2) and is intentionally NOT implemented here.
 */
import { describe, it, expect } from "vitest";
import { formatINR, parseINR } from "./inr";

describe("formatINR — canonical values", () => {
  it("formats the locked snapshot amounts character-for-character", () => {
    expect(formatINR(22150000)).toBe("₹2,21,500");
    expect(formatINR(47200000)).toBe("₹4,72,000");
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR(74350)).toBe("₹743.50");
  });

  it("formats the seeded transaction amounts character-for-character", () => {
    expect(formatINR(124800)).toBe("₹1,248"); // Cafe Delhi Heights
    expect(formatINR(200000)).toBe("₹2,000"); // Bharat Petroleum
    expect(formatINR(185600)).toBe("₹1,856"); // DMart
    expect(formatINR(635000)).toBe("₹6,350"); // MakeMyTrip
  });

  it("rejects non-negative-integer input", () => {
    expect(() => formatINR(-1)).toThrow(RangeError);
    expect(() => formatINR(12.5)).toThrow(RangeError);
  });
});

describe("parseINR — inverse of formatINR", () => {
  it("round-trips the canonical values", () => {
    for (const paise of [0, 74350, 124800, 200000, 185600, 635000, 22150000, 47200000]) {
      expect(parseINR(formatINR(paise))).toBe(paise);
    }
  });

  it("parses grouped and decimal strings back to paise", () => {
    expect(parseINR("₹2,21,500")).toBe(22150000);
    expect(parseINR("₹743.50")).toBe(74350);
    expect(parseINR("₹0")).toBe(0);
  });
});
