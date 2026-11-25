/**
 * Property-based test for the input validators (Property 8).
 *
 * Verifies that every validator rejects empty and whitespace-only input, that
 * the typed validators additionally reject format-violating input (mobile
 * outside 10–15 digits, OTP not exactly 6 digits, name longer than 50 chars,
 * blank bank fields), and that any well-formed value within the defined bounds
 * is accepted.
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  validateMobile,
  validateOtp,
  validateName,
  validateBankFields,
} from "./validators";

const digitChar = fc.constantFrom(
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9"
);
const letterChar = fc.constantFrom(
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("")
);
const whitespaceChar = fc.constantFrom(" ", "\t", "\n", "\r", "\f", "\v");

/** Empty or whitespace-only strings. */
const blankArb = fc.oneof(
  fc.constant(""),
  fc.stringOf(whitespaceChar, { minLength: 1, maxLength: 8 })
);

// Feature: lienpay, Property 8: For any string that is empty or composed entirely of whitespace (and, for typed fields, any string violating the field's format such as a mobile number outside 10–15 digits or an OTP not exactly 6 digits), the corresponding validator rejects the input; for any well-formed value within the defined bounds, the validator accepts it.
// Validates: Requirements 6.5, 6.6, 8.3, 5.5
describe("Property 8: Input validators reject empty, whitespace-only, and malformed input", () => {
  it("rejects blank input across every validator", () => {
    fc.assert(
      fc.property(blankArb, (blank) => {
        expect(validateMobile(blank).valid).toBe(false);
        expect(validateOtp(blank).valid).toBe(false);
        expect(validateName(blank).valid).toBe(false);
        // A bank submission with any blank required field is rejected.
        expect(validateBankFields({ accountNumber: blank }).valid).toBe(false);
      })
    );
  });

  it("rejects format-violating typed input", () => {
    // Mobile numbers outside 10–15 digits, or containing non-digits.
    const malformedMobile = fc.oneof(
      fc.stringOf(digitChar, { minLength: 1, maxLength: 9 }),
      fc.stringOf(digitChar, { minLength: 16, maxLength: 25 }),
      fc.stringOf(letterChar, { minLength: 1, maxLength: 15 })
    );
    fc.assert(
      fc.property(malformedMobile, (value) => {
        expect(validateMobile(value).valid).toBe(false);
      })
    );

    // OTPs that are not exactly 6 digits, or contain non-digits.
    const malformedOtp = fc.oneof(
      fc.stringOf(digitChar, { minLength: 1, maxLength: 5 }),
      fc.stringOf(digitChar, { minLength: 7, maxLength: 12 }),
      fc.stringOf(letterChar, { minLength: 1, maxLength: 6 })
    );
    fc.assert(
      fc.property(malformedOtp, (value) => {
        expect(validateOtp(value).valid).toBe(false);
      })
    );

    // Names longer than 50 characters (non-blank).
    const tooLongName = fc.stringOf(letterChar, { minLength: 51, maxLength: 80 });
    fc.assert(
      fc.property(tooLongName, (value) => {
        expect(validateName(value).valid).toBe(false);
      })
    );

    // Bank submissions where at least one required field is blank.
    const bankWithBlankField = fc
      .record({
        good: fc.stringOf(letterChar, { minLength: 1, maxLength: 12 }),
        bad: blankArb,
      })
      .map(({ good, bad }) => ({ ifsc: good, accountNumber: bad }));
    fc.assert(
      fc.property(bankWithBlankField, (fields) => {
        expect(validateBankFields(fields).valid).toBe(false);
      })
    );
  });

  it("accepts well-formed values within the defined bounds", () => {
    // Mobile: 10–15 digits.
    fc.assert(
      fc.property(fc.stringOf(digitChar, { minLength: 10, maxLength: 15 }), (v) => {
        expect(validateMobile(v).valid).toBe(true);
      })
    );

    // OTP: exactly 6 digits.
    fc.assert(
      fc.property(fc.stringOf(digitChar, { minLength: 6, maxLength: 6 }), (v) => {
        expect(validateOtp(v).valid).toBe(true);
      })
    );

    // Name: 1–50 non-blank characters.
    fc.assert(
      fc.property(fc.stringOf(letterChar, { minLength: 1, maxLength: 50 }), (v) => {
        expect(validateName(v).valid).toBe(true);
      })
    );

    // Bank: every required field non-blank.
    const validBank = fc.dictionary(
      fc.stringOf(letterChar, { minLength: 1, maxLength: 10 }),
      fc.stringOf(letterChar, { minLength: 1, maxLength: 12 }),
      { minKeys: 1 }
    );
    fc.assert(
      fc.property(validBank, (fields) => {
        expect(validateBankFields(fields).valid).toBe(true);
      })
    );
  });
});
