/**
 * ActiveRepayments — the Active_Account Repayments screen (tasks 15.1 + 15.2).
 *
 * Displays the user's repayment position — Outstanding Amount and Amount Due —
 * plus the repayment terms, a "Pay Now" repayment action, the auto-debit status,
 * repayment history and a help affordance, driven entirely by the centralized
 * `selectRepayments` selector so a completed repayment is reflected
 * automatically without any local copy of the data (Req 11.3, 12.3, 19.4). The
 * Outstanding (₹24,680) and Amount Due (₹8,240) figures come
 * character-for-character from central state; they are never hardcoded here.
 *
 * Repayment action (task 15.2): confirming a repayment calls
 * `Mock_Service.makeRepayment` (no real API — Req 13.1/13.2) and, on success,
 * the store's `recordRepayment` action, which reduces Used_Credit, re-derives
 * Available_Credit (available + used == limit), and reduces the Outstanding /
 * Amount Due display strings centrally. Every figure is a centralized read, so
 * all dependent UI updates automatically (Req 11.10, 11.11, 19.8). LTV /
 * Credit_Health are never recomputed.
 *
 * Presentation follows the Repayments reference: a Total Outstanding hero with a
 * utilisation gauge + "View credit line details", the interest-free / APR terms,
 * a "What you need to pay" block (amount due, minimum due, due date) with the
 * Pay Now CTA, the auto-debit status, recent repayments, and a help card. The
 * supporting TERMS (30-day interest-free, 12% p.a., minimum due, due date) are
 * demo values sourced from `mock/data/repayments.ts` — not hardcoded in JSX.
 *
 * States (Req 11.7, 13.5): empty-state message when there is no history;
 * LoadingState in the sheet while the mock repayment is in flight; ErrorState if
 * it fails (displayed values preserved). The confirm action is guarded by
 * `session.asyncInFlight` so a rapid double-tap cannot fire two repayments.
 *
 * Requirements: 11.3, 11.7, 11.10, 11.11, 12.3, 19.8, 20.1, 20.2, 20.4.
 * Design: Financial State Updates (Repayment reducer), Error Handling.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArcGauge,
  BottomSheet,
  ErrorState,
  LoadingState,
  PrimaryButton,
  RepaymentCard,
  SecondaryButton,
  SuccessState,
} from "../../../design-system/components";
import { staggerContainer, staggerItem } from "../../../animation/product";
import { parseINR } from "../../../formatting/inr";
import { ROUTES } from "../../../navigation/navConfig";
import { CalendarIcon, ChevronRightIcon, InfoIcon, ShieldIcon } from "./homeIcons";
import { REPAYMENT_TERMS } from "../../../mock/data/repayments";
import { mockService } from "../../../mock/mockService";
import { selectRepayments } from "../../../state/selectors";
import { useLienPayStore } from "../../../state/store";
import styles from "./active.module.css";

/** Which sheet is currently presented within the repayment flow. */
type RepaySheet = "closed" | "confirm" | "processing" | "success" | "error";

export function ActiveRepayments() {
  const navigate = useNavigate();

  // Centralized, reactive display source (Req 11.3, 12.3, 19.4).
  const { outstanding, amountDue, history } = useLienPayStore(selectRepayments);
  const creditLimitPaise = useLienPayStore((s) => s.creditLimitPaise);
  const recordRepayment = useLienPayStore((s) => s.recordRepayment);
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);
  const asyncInFlight = useLienPayStore((s) => s.session.asyncInFlight);

  const [sheet, setSheet] = useState<RepaySheet>("closed");
  const [paidAmount, setPaidAmount] = useState<string>(amountDue);

  // The repayment amount is the current Amount Due (paise mirror). When it has
  // been fully repaid the action is disabled — no amount remains to pay.
  const amountDuePaise = parseINR(amountDue);
  const nothingDue = amountDuePaise <= 0;

  // Utilisation of the credit line by the outstanding balance (display-only
  // derivation; reactive to repayments). Never recomputes LTV / Credit_Health.
  const utilisation =
    creditLimitPaise > 0
      ? Math.round((parseINR(outstanding) / creditLimitPaise) * 100)
      : 0;

  const hasHistory = history.length > 0;

  const handleConfirmRepayment = async () => {
    // Idempotent guard: ignore a second press while a repayment is in flight.
    if (useLienPayStore.getState().session.asyncInFlight) return;
    const amount = amountDue;
    const amountPaise = parseINR(amount);
    setAsyncInFlight(true);
    setSheet("processing");
    try {
      const result = await mockService.makeRepayment(amountPaise);
      if (result.status === "success") {
        recordRepayment(amountPaise);
        setPaidAmount(amount);
        setSheet("success");
      } else {
        setSheet("error");
      }
    } catch {
      setSheet("error");
    } finally {
      setAsyncInFlight(false);
    }
  };

  const closeSheet = () => setSheet("closed");

  return (
    <motion.section
      className={styles.list}
      aria-label="Repayments"
      variants={staggerContainer()}
      initial="initial"
      animate="animate"
    >
      <motion.p className={styles.eyebrow} variants={staggerItem()}>
        Repay
      </motion.p>
      <motion.h1 className={`text-heading ${styles.heading}`} variants={staggerItem()}>
        Repayments
      </motion.h1>

      {/* TOTAL OUTSTANDING hero — outstanding figure + utilisation gauge +
          "View credit line details" (all figures from central state). */}
      <motion.section
        className={styles.rpHero}
        aria-label="Outstanding position"
        variants={staggerItem()}
      >
        <div className={styles.rpGlow} aria-hidden="true" />
        <div className={styles.rpHeroTop}>
          <div className={styles.rpHeroBlock}>
            <span className={styles.rpHeroLabel}>Outstanding amount</span>
            <span className={styles.rpHeroValue}>{outstanding}</span>
            <span className={styles.rpHeroSub}>Utilized from your credit line</span>
            <button
              type="button"
              className={styles.rpLink}
              onClick={() => navigate(ROUTES.active.portfolio)}
            >
              View credit line details
              <span className={styles.rpLinkChevron} aria-hidden="true">
                <ChevronRightIcon />
              </span>
            </button>
          </div>
          <ArcGauge
            value={utilisation}
            size={104}
            stroke={9}
            centerLabel={`${utilisation}%`}
            centerCaption="of credit line"
            ariaLabel={`Outstanding is ${utilisation}% of your credit line`}
          />
        </div>
      </motion.section>

      {/* Interest-free / APR terms (demo terms from central mock data). */}
      <motion.div className={styles.rpTerms} variants={staggerItem()}>
        <div className={styles.rpTerm}>
          <span className={styles.rpTermTop}>Interest-free</span>
          <span className={styles.rpTermAccent}>{REPAYMENT_TERMS.interestFreeDays}</span>
        </div>
        <div className={styles.rpTerm}>
          <span className={styles.rpTermTop}>After that</span>
          <span className={styles.rpTermValue}>{REPAYMENT_TERMS.apr}</span>
        </div>
      </motion.div>

      {/* WHAT YOU NEED TO PAY — amount due + minimum due + due date + Pay Now. */}
      <motion.section
        className={styles.rpDue}
        aria-label="What you need to pay"
        variants={staggerItem()}
      >
        <div className={styles.rpDueHead}>
          <span className={styles.iconHolder} aria-hidden="true">
            <CalendarIcon />
          </span>
          <span className={styles.rpDueTitle}>What you need to pay</span>
        </div>
        <div className={styles.rpDueRow}>
          <div className={styles.rpDueCol}>
            <span className={styles.rpDueLabel}>Amount due</span>
            <span className={styles.rpDueValue}>{amountDue}</span>
          </div>
          <div className={styles.rpDueCol}>
            <span className={styles.rpDueLabel}>Minimum due</span>
            <span className={styles.rpDueValueMuted}>{REPAYMENT_TERMS.minimumDue}</span>
          </div>
        </div>
        <span className={styles.rpDueDate}>
          {REPAYMENT_TERMS.dueDateLabel}
          <span className={styles.rpDueDot} aria-hidden="true"> &middot; </span>
          <span className={styles.rpDueUrgent}>{REPAYMENT_TERMS.daysLeftLabel}</span>
        </span>
        <button
          type="button"
          className={styles.rpPayNow}
          disabled={asyncInFlight || nothingDue}
          onClick={() => setSheet("confirm")}
        >
          Pay Now
        </button>
      </motion.section>

      {/* Auto-debit status (demo — matches the reference "auto-debit enabled"). */}
      <motion.section
        className={styles.rpAutoDebit}
        aria-label="Auto-debit"
        variants={staggerItem()}
      >
        <span className={styles.rpAutoIcon} aria-hidden="true">
          <ShieldIcon />
        </span>
        <div className={styles.rpAutoBody}>
          <span className={styles.rpAutoTitle}>Auto-debit enabled</span>
          <span className={styles.rpAutoText}>
            We'll collect the amount due from your verified bank account on the
            due date.
          </span>
        </div>
      </motion.section>

      {/* Recent repayments. */}
      <motion.h2 className={styles.rpSectionTitle} variants={staggerItem()}>
        Recent repayments
      </motion.h2>
      {hasHistory ? (
        <ul className={styles.rpHistory} aria-label="Repayment history">
          {history.map((entry) => (
            <li key={entry.id}>
              <RepaymentCard label={entry.label} amount={entry.amount} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty} role="status">
          No repayments yet.
        </p>
      )}

      {/* Help / support card — routes to the in-app Learn content. */}
      <motion.section
        className={styles.rpHelp}
        aria-label="Repayment help"
        variants={staggerItem()}
      >
        <span className={styles.rpHelpIcon} aria-hidden="true">
          <InfoIcon />
        </span>
        <div className={styles.rpHelpBody}>
          <span className={styles.rpHelpTitle}>Questions about repayment?</span>
          <span className={styles.rpHelpText}>
            Learn how interest-free periods, due dates and auto-debit work.
          </span>
        </div>
        <button
          type="button"
          className={styles.rpHelpAction}
          onClick={() => navigate(ROUTES.active.learn)}
        >
          Learn more
        </button>
      </motion.section>

      {/* Repayment confirmation (copy minimal; the mandated Amount Due value is
          verbatim from state). */}
      <BottomSheet open={sheet === "confirm"} title="Confirm repayment" onClose={closeSheet}>
        <div className={styles.sheet}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Amount due</span>
            <span className={`text-financial-figure ${styles.summaryValue}`}>
              {amountDue}
            </span>
          </div>
          <div className={styles.sheetActions}>
            <PrimaryButton
              fullWidth
              disabled={asyncInFlight || nothingDue}
              onClick={handleConfirmRepayment}
            >
              {`Pay ${amountDue}`}
            </PrimaryButton>
            <SecondaryButton fullWidth onClick={closeSheet}>
              Cancel
            </SecondaryButton>
          </div>
        </div>
      </BottomSheet>

      {/* Loading during the mock delay (Req 13.5). */}
      <BottomSheet open={sheet === "processing"} onClose={() => undefined}>
        <div className={styles.sheet}>
          <LoadingState large label="Processing repayment" />
        </div>
      </BottomSheet>

      {/* Repayment success. */}
      <BottomSheet open={sheet === "success"} onClose={closeSheet}>
        <SuccessState
          title="Repayment successful"
          message={`Repaid ${paidAmount} towards your outstanding balance.`}
          action={
            <PrimaryButton fullWidth onClick={closeSheet}>
              Done
            </PrimaryButton>
          }
        />
      </BottomSheet>

      {/* Repayment failure — displayed values are preserved (Req 13.5). */}
      <BottomSheet open={sheet === "error"} onClose={closeSheet}>
        <div className={styles.sheet}>
          <ErrorState
            title="Repayment failed"
            message="The repayment could not be completed. Your balance is unchanged."
            action={
              <div className={styles.sheetActions}>
                <PrimaryButton
                  fullWidth
                  disabled={asyncInFlight}
                  onClick={handleConfirmRepayment}
                >
                  Try again
                </PrimaryButton>
                <SecondaryButton fullWidth onClick={closeSheet}>
                  Cancel
                </SecondaryButton>
              </div>
            }
          />
        </div>
      </BottomSheet>
    </motion.section>
  );
}
