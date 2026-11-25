/**
 * LienPay — central PAN verification demo data + format helper (single source).
 *
 * The prototype NEVER calls a real PAN / NSDL / income-tax API (Req 13.1,
 * 13.2). PAN verification is a DETERMINISTIC mock: a well-formed PAN is
 * accepted, a specific reserved demo PAN is deterministically declined (so the
 * failure + retry path can be demonstrated), and anything not matching the PAN
 * format is rejected as invalid. The same input always yields the same result.
 *
 * Standard PAN format: five letters, four digits, one letter (e.g. ABCDE1234F).
 *
 * Requirements: 13.1, 13.2 (no real endpoints, deterministic mock), 12.5 (one
 * central data source).
 * Design: Mock Service Architecture.
 */

/** A valid demo PAN a reviewer can enter to see the success path. */
export const DEMO_PAN = "ABCDE1234F";

/**
 * A reserved, well-formed PAN that the mock verification deterministically
 * DECLINES — used to demonstrate the PAN Processing failure + retry path
 * without any randomness.
 */
export const DEMO_PAN_DECLINED = "AAAAA0000A";

/** Standard PAN format: 5 letters, 4 digits, 1 letter. */
const PAN_FORMAT = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** Normalizes a PAN for validation/storage (trim + uppercase). */
export function normalizePan(pan: string): string {
  return pan.trim().toUpperCase();
}

/** True when `pan` matches the standard PAN format (after normalization). */
export function isValidPanFormat(pan: string): boolean {
  return PAN_FORMAT.test(normalizePan(pan));
}
