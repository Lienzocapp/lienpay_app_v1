/**
 * txnDateTime — presentational date/time helpers for transactions.
 *
 * Formats a transaction's fixed epoch `timestamp` into a human date/time string
 * and resolves its Today / Yesterday / date grouping — all relative to the
 * FIXED demo clock `DEMO_NOW` (never the real clock) so display and grouping are
 * deterministic and tests are stable. All calculations use UTC getters so the
 * output does not vary with the host machine's timezone.
 *
 * This is a thin display helper over the existing central transaction data
 * (like `merchantCategory` / `brandLogos`); it invents no data and holds no
 * state.
 */
import { DEMO_NOW } from "../../mock/data/transactions";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const DAY_MS = 86_400_000;

/** UTC midnight (day bucket) for an epoch, used for day-level comparisons. */
function dayBucket(ts: number): number {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Formats the clock portion, e.g. "1:15 PM" (12-hour, UTC). */
function timeLabel(ts: number): string {
  const d = new Date(ts);
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const suffix = hours < 12 ? "AM" : "PM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** A transaction day grouping relative to the fixed demo clock. */
export interface TxnDayGroup {
  /** Stable key for grouping (e.g. "today", "yesterday", "d-<bucket>"). */
  key: string;
  /** Human label ("Today", "Yesterday", or "9 Jul"). */
  label: string;
}

/**
 * Resolves the Today / Yesterday / date group for a transaction timestamp,
 * relative to {@link DEMO_NOW}. Timestamps newer than the demo "today" (e.g. a
 * live demo payment stamped with the real clock) fall into the "today" bucket
 * so a just-made payment groups at the top under Today.
 */
export function txnDayGroup(ts: number): TxnDayGroup {
  const today = dayBucket(DEMO_NOW);
  const bucket = dayBucket(ts);
  if (bucket >= today) {
    return { key: "today", label: "Today" };
  }
  if (bucket === today - DAY_MS) {
    return { key: "yesterday", label: "Yesterday" };
  }
  const d = new Date(ts);
  return { key: `d-${bucket}`, label: `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` };
}

/**
 * Formats a transaction timestamp for inline display, e.g.
 * "Today, 1:15 PM", "Yesterday, 7:20 PM", or "9 Jul, 5:05 PM".
 */
export function formatTxnDateTime(ts: number): string {
  const group = txnDayGroup(ts);
  return `${group.label}, ${timeLabel(ts)}`;
}

/**
 * Formats only the clock portion of a transaction timestamp, e.g. "1:15 PM".
 * Used inside day-grouped rows where the group header already carries the day.
 */
export function formatTxnTime(ts: number): string {
  return timeLabel(ts);
}
