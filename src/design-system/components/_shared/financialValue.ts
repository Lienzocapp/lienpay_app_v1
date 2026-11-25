/**
 * _shared/financialValue.ts
 *
 * Tiny shared helper for the financial/content card components. It lets a
 * component accept a financial value either as an already-formatted display
 * string (the canonical, character-for-character form supplied by the
 * Mock_Service — Req 12.4) OR as a raw non-negative integer paise number, in
 * which case it is rendered through the central Indian currency formatter
 * (Req 12.4, 7.1, 21.6).
 *
 * This helper invents NO financial values — it only formats a numeric value
 * that a caller passes in. Components remain fully generic and props-driven.
 *
 * Design: Data Models (display strings canonical; arithmetic in paise),
 * Components and Interfaces.
 */
import { formatINR } from "../../../formatting/inr";

/** A financial value accepted by the card components. */
export type FinancialValue = string | number;

/**
 * Resolves a {@link FinancialValue} to its display string. Numbers are treated
 * as integer paise and formatted with Indian lakh grouping via `formatINR`;
 * strings are passed through unchanged (already character-for-character).
 */
export function toDisplayValue(value: FinancialValue): string {
  return typeof value === "number" ? formatINR(value) : value;
}
