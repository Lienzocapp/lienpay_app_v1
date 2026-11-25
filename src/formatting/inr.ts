/**
 * LienPay — Indian Rupee (INR) currency formatter (pure, reusable).
 *
 * Converts integer paise amounts to their canonical rupee display string using
 * Indian lakh digit grouping and each value's own decimal formatting, and back
 * again. `formatINR` and `parseINR` are exact inverses (round-trip identity)
 * for any non-negative integer paise amount.
 *
 * Rules (LOCKED by the source specification):
 *  - Indian lakh grouping: the last three integer digits form one group, then
 *    the remaining digits are grouped in pairs from the right
 *    (e.g. 221500 -> "2,21,500", 472000 -> "4,72,000"). No Western/standard
 *    grouping is ever used.
 *  - Per-value decimal formatting: when the amount has no paise remainder the
 *    string carries NO decimals (e.g. "₹4,72,000"); when it has a paise
 *    remainder the string carries exactly two decimals (e.g. "₹743.50").
 *  - No rounding, no reformatting.
 *
 * Canonical examples:
 *   formatINR(22150000) === "₹2,21,500"
 *   formatINR(47200000) === "₹4,72,000"
 *   formatINR(0)        === "₹0"
 *   formatINR(74350)    === "₹743.50"
 *
 * Requirements: 12.4 (character-for-character, Indian grouping, per-value
 * decimals, no rounding/reformatting), 7.1 (eligibility display), 21.6 (Pay
 * amount formatting).
 * Design: Data Models (display strings canonical, arithmetic in paise),
 * Financial State Updates (display re-derived via formatINR).
 */

/** The rupee symbol prefix used by all LienPay financial display strings. */
export const RUPEE_SYMBOL = "₹";

/**
 * Applies Indian lakh digit grouping to a non-negative integer string.
 * The last three digits form one group; the remaining digits are grouped in
 * pairs from the right. Strings of three or fewer digits are returned as-is.
 */
function groupIndian(intDigits: string): string {
  if (intDigits.length <= 3) {
    return intDigits;
  }
  const last3 = intDigits.slice(-3);
  const rest = intDigits.slice(0, -3);
  // Insert a comma before every pair of digits (counting from the right) in
  // the portion preceding the final three digits.
  const groupedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${groupedRest},${last3}`;
}

/**
 * Formats a non-negative integer paise amount as a canonical INR display
 * string using Indian lakh grouping and the value's own decimal formatting.
 *
 * @param paise - A non-negative integer amount in paise (1 rupee = 100 paise).
 * @returns The rupee display string, e.g. `"₹2,21,500"` or `"₹743.50"`.
 * @throws RangeError if `paise` is not a non-negative integer.
 */
export function formatINR(paise: number): string {
  if (!Number.isInteger(paise) || paise < 0) {
    throw new RangeError(
      `formatINR expects a non-negative integer paise amount, received: ${paise}`
    );
  }

  const rupees = Math.floor(paise / 100);
  const paiseRemainder = paise % 100;
  const groupedRupees = groupIndian(String(rupees));

  if (paiseRemainder === 0) {
    return `${RUPEE_SYMBOL}${groupedRupees}`;
  }

  const decimals = String(paiseRemainder).padStart(2, "0");
  return `${RUPEE_SYMBOL}${groupedRupees}.${decimals}`;
}

/**
 * Parses a canonical INR display string back into an integer paise amount.
 * This is the exact inverse of {@link formatINR}: for any non-negative integer
 * `p`, `parseINR(formatINR(p)) === p`.
 *
 * @param value - A rupee display string, e.g. `"₹2,21,500"` or `"₹743.50"`.
 * @returns The integer paise amount.
 * @throws RangeError if `value` is not a well-formed INR display string.
 */
export function parseINR(value: string): number {
  // Remove the rupee symbol and the Indian grouping commas; keep digits and
  // the decimal point only.
  const stripped = value.replace(RUPEE_SYMBOL, "").replace(/,/g, "").trim();

  if (!/^\d+(\.\d{1,2})?$/.test(stripped)) {
    throw new RangeError(`parseINR received a malformed INR string: ${value}`);
  }

  const [integerPart, decimalPart = ""] = stripped.split(".");
  const rupees = Number(integerPart);
  // Pad a single-digit paise remainder (e.g. ".5") to two digits so the paise
  // value is interpreted consistently; empty means zero paise.
  const paiseRemainder = decimalPart === "" ? 0 : Number(decimalPart.padEnd(2, "0"));

  return rupees * 100 + paiseRemainder;
}
