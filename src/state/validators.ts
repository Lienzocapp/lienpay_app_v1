/**
 * LienPay — centralized pure input validators.
 *
 * A single source of truth for the prototype's field validation. Each
 * validator is a PURE function returning an accept/reject result that
 * identifies the offending field and a machine-readable reason on rejection.
 * All validators reject empty and whitespace-only input; they accept only
 * well-formed values within the defined bounds. No screen-specific duplicates
 * and no invented extra business rules live elsewhere.
 *
 * Field rules (from the requirements):
 *  - mobile: 10–15 numeric digits (Req 6.2, 6.5).
 *  - otp:    exactly 6 digits (Req 6.3, 6.5).
 *  - name:   1–50 characters, non-empty and not whitespace-only (Req 6.4, 6.6).
 *  - bank:   each required field must be present (non-empty, not
 *            whitespace-only) (Req 8.3). Field-specific formats are defined by
 *            the screen content spec and are not invented here.
 *
 * Requirements: 6.5, 6.6 (mobile/OTP/name invalid & required rejection),
 * 8.3 (bank required-field rejection), 5.5 (remain on screen on invalid input).
 * Design: Correctness Properties (Property 8), Error Handling.
 */

/** Machine-readable rejection reason. */
export type ValidationReason = "required" | "invalid";

/**
 * The result of a validation. On rejection, `field` identifies the offending
 * field and `reason` distinguishes an empty/whitespace-only value ("required")
 * from a present-but-malformed value ("invalid").
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; field: string; reason: ValidationReason };

/** A successful validation result. */
const ok: ValidationResult = { valid: true };

/** Builds a rejection result for the given field and reason. */
function reject(field: string, reason: ValidationReason): ValidationResult {
  return { valid: false, field, reason };
}

/** True when a string is empty or composed entirely of whitespace. */
function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Validates a mobile number: must be 10–15 numeric digits. Empty or
 * whitespace-only input is rejected as "required"; any other malformed value
 * (non-digits, or a digit count outside 10–15) is rejected as "invalid".
 */
export function validateMobile(value: string): ValidationResult {
  if (isBlank(value)) {
    return reject("mobile", "required");
  }
  if (!/^\d{10,15}$/.test(value)) {
    return reject("mobile", "invalid");
  }
  return ok;
}

/**
 * Validates a one-time passcode: must be exactly 6 digits. Empty or
 * whitespace-only input is rejected as "required"; any other malformed value
 * is rejected as "invalid".
 */
export function validateOtp(value: string): ValidationResult {
  if (isBlank(value)) {
    return reject("otp", "required");
  }
  if (!/^\d{6}$/.test(value)) {
    return reject("otp", "invalid");
  }
  return ok;
}

/**
 * Validates a name: must contain 1–50 characters and must not be empty or
 * whitespace-only. Empty/whitespace-only input is rejected as "required"; a
 * value longer than 50 characters is rejected as "invalid".
 */
export function validateName(value: string): ValidationResult {
  if (isBlank(value)) {
    return reject("name", "required");
  }
  if (value.length > 50) {
    return reject("name", "invalid");
  }
  return ok;
}

/**
 * Validates the required bank-account fields. Every entry in `fields` is a
 * required field; any entry whose value is empty or whitespace-only is
 * rejected as "required", identifying that field. Field-specific formats are
 * defined by the screen content specification and are intentionally not
 * invented here.
 *
 * @param fields - Map of required field name to its submitted value.
 */
export function validateBankFields(
  fields: Record<string, string>
): ValidationResult {
  for (const [field, value] of Object.entries(fields)) {
    if (isBlank(value)) {
      return reject(field, "required");
    }
  }
  return ok;
}
