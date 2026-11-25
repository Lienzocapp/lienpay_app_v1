/**
 * LienPay — central seeded transaction demo data (single source).
 *
 * The five mandated example transactions, reproduced character-for-character
 * (merchant labels and amounts). All are `origin: "seed"` display-only history
 * and, consistent with the Initial_Snapshot Used_Credit ₹24,680, their total
 * exactly matches the used credit.
 *
 * DETERMINISTIC DEMO CLOCK (no Date.now()): the demo uses a FIXED reference
 * "now" (`DEMO_NOW`) and fixed UTC timestamps for each seeded transaction so the
 * Transactions screen can show real dates/times and group by Today / Yesterday
 * deterministically, with stable tests. Timestamps are strictly descending so
 * the array stays most-recent-first (Cafe Delhi Heights newest → Apollo oldest),
 * which the Transactions ordering/test relies on.
 *
 * Requirements: 12.2 (five exact transactions character-for-character),
 * 12.5 (one central data source).
 * Design: Data Models (Transaction, origin flag), Initial_Snapshot.
 */
import type { Transaction } from "../../state/types";

/**
 * Fixed reference "current time" for the demo (Sat 12 Jul 2025, 14:30 UTC).
 * All relative date labels (Today / Yesterday) and grouping are computed against
 * this constant — never against the real clock — so the demo is reproducible and
 * tests are stable.
 */
export const DEMO_NOW = Date.UTC(2025, 6, 12, 14, 30, 0);

/**
 * The five seeded transactions in most-recent-first order, matching the order
 * defined by the source specification. Amounts are the canonical display
 * strings; `amountPaise` mirrors them for arithmetic only. Timestamps are fixed
 * UTC instants relative to {@link DEMO_NOW} (two Today, one Yesterday, two
 * earlier) so date/time display and Today/Yesterday grouping are deterministic.
 */
export const SEED_TRANSACTIONS: readonly Transaction[] = [
  {
    id: "seed-cafe-delhi-heights",
    merchant: "Cafe Delhi Heights",
    amount: "₹1,248",
    amountPaise: 124800,
    origin: "seed",
    timestamp: Date.UTC(2025, 6, 12, 13, 15, 0), // Today, 1:15 PM
  },
  {
    id: "seed-bharat-petroleum",
    merchant: "Bharat Petroleum",
    amount: "₹2,000",
    amountPaise: 200000,
    origin: "seed",
    timestamp: Date.UTC(2025, 6, 12, 9, 30, 0), // Today, 9:30 AM
  },
  {
    id: "seed-dmart",
    merchant: "DMart",
    amount: "₹1,856",
    amountPaise: 185600,
    origin: "seed",
    timestamp: Date.UTC(2025, 6, 11, 19, 20, 0), // Yesterday, 7:20 PM
  },
  {
    id: "seed-makemytrip",
    merchant: "MakeMyTrip",
    amount: "₹18,832.50",
    amountPaise: 1883250,
    origin: "seed",
    timestamp: Date.UTC(2025, 6, 9, 17, 5, 0), // 9 Jul, 5:05 PM
  },
  {
    id: "seed-apollo-pharmacy",
    merchant: "Apollo Pharmacy",
    amount: "₹743.50",
    amountPaise: 74350,
    origin: "seed",
    timestamp: Date.UTC(2025, 6, 8, 10, 45, 0), // 8 Jul, 10:45 AM
  },
];
