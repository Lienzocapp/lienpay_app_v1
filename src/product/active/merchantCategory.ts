/**
 * merchantCategory — resolves a PRESENTATIONAL spend category for a known
 * merchant name.
 *
 * The reference Active Home shows a category line beneath each merchant (e.g.
 * "Food & Dining"). The central Transaction model carries no category field, so
 * this is a thin, deterministic display mapping over the EXISTING canonical
 * merchant names — exactly like `brandLogos` maps a merchant to a logo asset. It
 * invents no transactions and mutates no state; unknown merchants fall back to a
 * neutral label so nothing is fabricated.
 */

/** Keyword → category label (checked in order, case-insensitive). */
const CATEGORY_RULES: ReadonlyArray<readonly [RegExp, string]> = [
  [/cafe delhi|swiggy|zomato|restaurant|food/i, "Food & Dining"],
  [/bharat petroleum|bpcl|indian oil|iocl|fuel|petrol/i, "Fuel"],
  [/dmart|blinkit|grocery|groceries|supermart/i, "Groceries"],
  [/makemytrip|travel|flight|irctc|airlines/i, "Travel"],
  [/apollo|pharmacy|chemist|medical|health/i, "Pharmacy"],
];

/** Neutral fallback for merchants with no known category (no fabrication). */
const DEFAULT_CATEGORY = "LienPay Credit Line";

/**
 * Returns a display category for a merchant name, or a neutral fallback when no
 * known category matches.
 */
export function merchantCategory(name: string): string {
  for (const [pattern, category] of CATEGORY_RULES) {
    if (pattern.test(name)) {
      return category;
    }
  }
  return DEFAULT_CATEGORY;
}
