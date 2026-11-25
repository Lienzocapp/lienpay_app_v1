/**
 * ActiveTransactions — the Active_Account Transactions screen (task 14.1).
 *
 * Renders the transaction history from the centralized `selectTransactions`
 * selector (Req 11.2, 19.4) — a completed demo payment (task 14.4) appears
 * automatically with no local copy of the data. The presentation follows the
 * Transactions reference: a Total Spent summary + spend chart, a functional
 * search + category filter, day-grouped rows (Today / Yesterday / date) each
 * showing the merchant, "UPI Payment" + time, amount, Completed status and a
 * chevron, a Load-more control, and a payment-security note.
 *
 * Presentation only — all figures/rows come from central state; nothing is
 * fabricated. Category labels are the presentational `merchantCategory` mapping;
 * date/time + grouping come from the deterministic demo clock (`txnDateTime`).
 * The spend total is summed from the real transaction amounts via `formatINR`.
 *
 * States (Req 11.7, 11.8): empty-state message when there are no records; a
 * shared `ErrorState` (with retry) on a data-load failure WHILE the previously
 * displayed values from the store are retained (the probe never overwrites the
 * store — the store stays the single display source of truth).
 *
 * Requirements: 11.2, 11.7, 11.8, 20.1, 20.2, 20.4, 19.4, 12.4.
 * Design: Data Models, Error Handling, Navigation Architecture.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ErrorState, SecondaryButton } from "../../../design-system/components";
import { staggerContainer, staggerItem } from "../../../animation/product";
import { categoryIcon } from "../categoryIcon";
import { merchantCategory } from "../merchantCategory";
import { formatTxnTime, txnDayGroup } from "../txnDateTime";
import { ChevronRightIcon, SearchIcon, ShieldIcon } from "./homeIcons";
import { formatINR, parseINR } from "../../../formatting/inr";
import { mockService } from "../../../mock/mockService";
import { selectTransactions } from "../../../state/selectors";
import { useLienPayStore } from "../../../state/store";
import type { Transaction } from "../../../state/types";
import styles from "./active.module.css";

/** How many rows are shown before "Load more" reveals the rest. */
const INITIAL_VISIBLE = 3;

/** A contiguous day group of transactions (most-recent-first within). */
interface DayGroup {
  key: string;
  label: string;
  items: Transaction[];
}

export function ActiveTransactions() {
  // Centralized, reactive display source (Req 11.2, 19.4). Sorted defensively
  // most-recent-first (Req 11.2) — timestamps are distinct so order is stable.
  const transactions = useLienPayStore(selectTransactions);
  const ordered = useMemo(
    () => [...transactions].sort((a, b) => b.timestamp - a.timestamp),
    [transactions]
  );

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [loadError, setLoadError] = useState(false);

  // Data-load health probe (Req 11.8). We deliberately do NOT hydrate the store
  // from the result: the store is the single display source and already carries
  // the seeded history plus any in-session demo payment.
  const probe = useCallback(() => {
    let active = true;
    mockService
      .getTransactions()
      .then((result) => {
        if (active) setLoadError(result.status === "error");
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => probe(), [probe]);

  const hasTransactions = ordered.length > 0;

  // Distinct categories present, for the filter chips (order of appearance).
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const t of ordered) {
      const c = merchantCategory(t.merchant);
      if (!seen.includes(c)) seen.push(c);
    }
    return seen;
  }, [ordered]);

  // Functional search + category filter.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ordered.filter((t) => {
      const matchesQuery = q === "" || t.merchant.toLowerCase().includes(q);
      const matchesCategory =
        category === "all" || merchantCategory(t.merchant) === category;
      return matchesQuery && matchesCategory;
    });
  }, [ordered, query, category]);

  const visible = filtered.slice(0, visibleCount);

  // Group the visible rows into contiguous day buckets, preserving order.
  const groups = useMemo(() => {
    const out: DayGroup[] = [];
    for (const t of visible) {
      const g = txnDayGroup(t.timestamp);
      const last = out[out.length - 1];
      if (last && last.key === g.key) {
        last.items.push(t);
      } else {
        out.push({ key: g.key, label: g.label, items: [t] });
      }
    }
    return out;
  }, [visible]);

  // Real total spent (summed from actual amounts — no invented figure).
  const totalSpent = useMemo(
    () => formatINR(ordered.reduce((sum, t) => sum + parseINR(t.amount), 0)),
    [ordered]
  );

  const resetPaging = () => setVisibleCount(INITIAL_VISIBLE);

  const renderRow = (t: Transaction) => (
    <li key={t.id} className={styles.txnRow}>
      {/* Reference: a category line-art glyph in a lime circle (not a logo). */}
      <span className={styles.txnCatIcon} aria-hidden="true">
        {categoryIcon(merchantCategory(t.merchant))}
      </span>
      <span className={styles.txnRowBody}>
        <span className={styles.txnRowMerchant}>{t.merchant}</span>
        <span className={styles.txnRowMeta}>
          UPI Payment &middot; {formatTxnTime(t.timestamp)}
        </span>
      </span>
      <span className={styles.txnRowTrailing}>
        <span className={styles.txnRowAmount}>{t.amount}</span>
        <span className={styles.txnRowStatus}>Completed</span>
      </span>
      <span className={styles.txnChevron} aria-hidden="true">
        <ChevronRightIcon />
      </span>
    </li>
  );

  return (
    <motion.section
      className={styles.list}
      aria-label="Transactions"
      variants={staggerContainer()}
      initial="initial"
      animate="animate"
    >
      <motion.p className={styles.eyebrow} variants={staggerItem()}>
        Activity
      </motion.p>
      <motion.h1 className={`text-heading ${styles.heading}`} variants={staggerItem()}>
        Transactions
      </motion.h1>
      <motion.p className={styles.txnSubtitle} variants={staggerItem()}>
        Every spend on your LienPay credit line
      </motion.p>

      {hasTransactions ? (
        <>
          {/* Functional search + category filter. */}
          <motion.div className={styles.txnControls} variants={staggerItem()}>
            <div className={styles.txnSearch}>
              <span className={styles.txnSearchIcon} aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                type="text"
                className={styles.txnSearchInput}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  resetPaging();
                }}
                placeholder="Search transactions"
                aria-label="Search transactions"
              />
            </div>
            <div className={styles.txnFilters} role="group" aria-label="Filter by category">
              <button
                type="button"
                className={styles.txnChip}
                aria-pressed={category === "all"}
                onClick={() => {
                  setCategory("all");
                  resetPaging();
                }}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={styles.txnChip}
                  aria-pressed={category === c}
                  onClick={() => {
                    setCategory(c);
                    resetPaging();
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Total spent + spend chart (bars derived from the real amounts). */}
          <motion.div className={styles.txnSpend} variants={staggerItem()}>
            <div className={styles.txnSpendHead}>
              <div className={styles.txnSpendBlock}>
                <span className={styles.txnSpendLabel}>Total spent</span>
                <span className={styles.txnSpendTotal}>{totalSpent}</span>
              </div>
              <span className={styles.txnSpendCount}>
                {ordered.length} {ordered.length === 1 ? "payment" : "payments"}
              </span>
            </div>
            <div className={styles.txnBars} aria-hidden="true">
              {(() => {
                const values = ordered.map((t) => parseINR(t.amount));
                const max = Math.max(1, ...values);
                return ordered.map((t, i) => (
                  <span
                    key={t.id}
                    className={styles.txnBar}
                    style={{ height: `${Math.max(12, (values[i] / max) * 100)}%` }}
                  />
                ));
              })()}
            </div>
          </motion.div>

          {/* Error-state: shown on a data-load failure while previously displayed
              values are retained below (Req 11.8). */}
          {loadError ? (
            <ErrorState
              title="Couldn't load transactions"
              message="The transaction data could not be loaded. Showing the last available values."
              action={<SecondaryButton onClick={() => probe()}>Retry</SecondaryButton>}
            />
          ) : null}

          {/* Day-grouped rows. */}
          {groups.map((group) => (
            <motion.div
              key={group.key}
              className={styles.txnGroup}
              variants={staggerItem()}
            >
              <h2 className={styles.txnGroupTitle}>{group.label}</h2>
              <ul
                className={styles.txnGroupList}
                aria-label={`${group.label} transactions`}
              >
                {group.items.map(renderRow)}
              </ul>
            </motion.div>
          ))}

          {visible.length === 0 ? (
            <p className={styles.empty} role="status">
              No transactions match your search.
            </p>
          ) : null}

          {filtered.length > visibleCount ? (
            <motion.div className={styles.txnLoadMore} variants={staggerItem()}>
              <SecondaryButton onClick={() => setVisibleCount(filtered.length)}>
                Load more transactions
              </SecondaryButton>
            </motion.div>
          ) : null}

          {/* Payment-security note (documented product fact; no claim of real
              verification). */}
          <motion.section
            className={styles.txnSecurity}
            aria-label="Payment security"
            variants={staggerItem()}
          >
            <span className={styles.txnSecurityIcon} aria-hidden="true">
              <ShieldIcon />
            </span>
            <p className={styles.txnSecurityText}>
              Every payment goes only to eligible merchants. LienPay never
              transfers your credit line into a bank account, keeping your line
              secure.
            </p>
          </motion.section>
        </>
      ) : (
        // Empty-state message (Req 11.7) — shown only when there are no records.
        <p className={styles.empty} role="status">
          No transactions yet.
        </p>
      )}
    </motion.section>
  );
}
