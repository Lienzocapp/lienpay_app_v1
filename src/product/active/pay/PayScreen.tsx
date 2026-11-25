/**
 * ActivePay — the Pay experience (tasks 14.3 + 14.4).
 *
 * Reachable from the Active Home "Pay Now" entry point at `/app/active/pay`;
 * Pay is NOT a bottom-nav tab (Req 21.2). The screen presents the four Pay
 * actions — Scan QR, Enter UPI ID, Pay Contact, Bills (Req 21.1) — in the shared
 * `BottomSheet`. Selecting any action opens the mandated demo-payment
 * confirmation (Merchant "DMart", Amount ₹1,856, Payment Method "LienPay Credit
 * Line" — Req 21.3), which on confirm is simulated entirely through
 * `Mock_Service.makeDemoPayment` (no real UPI/network — Req 21.5) and applied to
 * the centralized store via `recordPayment`. That prepends the distinct
 * `origin: "demo_payment"` transaction and updates Used_Credit / Available_Credit
 * centrally, so every dependent screen (Home credit position, Transactions)
 * reflects the change automatically (Req 21.4, 11.10, 11.11, 19.8). All amounts
 * are Indian-formatted via the shared formatter (Req 12/21.6).
 *
 * A restrained processing state is shown WHILE the mock payment is in flight
 * (no artificial extra delay), then a polished success moment with "View
 * transaction" (→ Transactions) and "Continue" (→ Home). Async safety: the
 * confirm action is guarded by `session.asyncInFlight` so a rapid double-tap
 * cannot fire two payments (Req 13.5).
 *
 * Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 11.10, 11.11, 19.8, 20.1,
 * 20.2, 20.4. Design: Navigation (`/app/active/pay/*`), Mock Service
 * Architecture, Financial State Updates (DMart demo payment).
 */
import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  BottomSheet,
  LoadingState,
  PrimaryButton,
  SecondaryButton,
} from "../../../design-system/components";
import { DEMO_PAYMENT_DETAILS, mockService } from "../../../mock/mockService";
import { ROUTES } from "../../../navigation/navConfig";
import { useLienPayStore } from "../../../state/store";
import {
  BillsIcon,
  CheckIcon,
  ContactIcon,
  ScanIcon,
  UpiIcon,
} from "./payIcons";
import styles from "./pay.module.css";

/** The four Pay actions (Req 21.1). Labels are taken verbatim from the source. */
const PAY_ACTIONS: { label: string; icon: ReactNode; hint: string }[] = [
  { label: "Scan QR", icon: <ScanIcon />, hint: "Pay by scanning a QR code" },
  { label: "Enter UPI ID", icon: <UpiIcon />, hint: "Pay to a UPI address" },
  { label: "Pay Contact", icon: <ContactIcon />, hint: "Pay a saved contact" },
  { label: "Bills", icon: <BillsIcon />, hint: "Pay a bill" },
];

/** Which sheet is currently presented within the Pay experience. */
type PaySheet = "actions" | "confirm" | "processing" | "success";

export function ActivePay() {
  const navigate = useNavigate();
  const recordPayment = useLienPayStore((s) => s.recordPayment);
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);
  const asyncInFlight = useLienPayStore((s) => s.session.asyncInFlight);

  // The actions sheet is open on arrival so the four Pay actions are presented.
  const [sheet, setSheet] = useState<PaySheet>("actions");
  const [paidAmount, setPaidAmount] = useState<string>(DEMO_PAYMENT_DETAILS.amount);

  const goHome = () => navigate(ROUTES.active.home);
  const goTransactions = () => navigate(ROUTES.active.transactions);

  const handleConfirmPayment = async () => {
    // Idempotent guard: ignore a second press while a payment is in flight.
    if (useLienPayStore.getState().session.asyncInFlight) return;
    setAsyncInFlight(true);
    // Show the processing state while the mock payment is in flight (the
    // existing Mock_Service delay supplies the realistic wait — no extra timer).
    setSheet("processing");
    try {
      const result = await mockService.makeDemoPayment();
      if (result.status === "success" && result.data) {
        // Central update: prepend the distinct demo_payment transaction and
        // move Used/Available credit (paise arithmetic in the reducer).
        recordPayment(result.data.amountPaise, result.data);
        setPaidAmount(result.data.amount);
        setSheet("success");
      } else {
        setSheet("confirm");
      }
    } finally {
      setAsyncInFlight(false);
    }
  };

  return (
    <section className={styles.screen} aria-label="Pay">
      {/* Legible source label used verbatim. */}
      <p className={styles.eyebrow}>Pay</p>
      <h1 className={`text-heading ${styles.heading}`}>Pay Now</h1>
      <p className={styles.intro}>Choose how you'd like to pay.</p>

      {/* Reopen entry point if the actions sheet was dismissed. */}
      <PrimaryButton fullWidth onClick={() => setSheet("actions")}>
        Pay Now
      </PrimaryButton>

      {/* Pay actions in the shared BottomSheet (Req 21.1). */}
      <BottomSheet open={sheet === "actions"} title="Pay Now" onClose={goHome}>
        <div className={styles.actions}>
          {PAY_ACTIONS.map(({ label, icon, hint }) => (
            <button
              key={label}
              type="button"
              className={styles.action}
              aria-label={label}
              onClick={() => setSheet("confirm")}
            >
              <span className={styles.actionIcon} aria-hidden="true">
                {icon}
              </span>
              <span className={styles.actionBody}>
                <span className={styles.actionLabel}>{label}</span>
                <span className={styles.actionHint}>{hint}</span>
              </span>
              <span className={styles.actionChevron} aria-hidden="true">
                ›
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Demo-payment confirmation (Req 21.3). Copy is minimal/flagged; the
          mandated data is verbatim. */}
      <BottomSheet
        open={sheet === "confirm"}
        title="Confirm payment"
        onClose={() => setSheet("actions")}
      >
        <div className={styles.confirm}>
          <div className={styles.confirmAmount}>
            <span className={styles.confirmAmountLabel}>Amount</span>
            <span className={`text-financial-figure text-financial-figure--hero ${styles.confirmAmountValue}`}>
              {DEMO_PAYMENT_DETAILS.amount}
            </span>
          </div>
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Merchant</span>
              <span className={styles.summaryValue}>
                {DEMO_PAYMENT_DETAILS.merchant}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Payment method</span>
              <span className={styles.summaryValue}>
                {DEMO_PAYMENT_DETAILS.paymentMethod}
              </span>
            </div>
          </div>
          <div className={styles.confirmActions}>
            <PrimaryButton
              fullWidth
              disabled={asyncInFlight}
              onClick={handleConfirmPayment}
            >
              {`Pay ${DEMO_PAYMENT_DETAILS.amount}`}
            </PrimaryButton>
            <SecondaryButton fullWidth onClick={() => setSheet("actions")}>
              Cancel
            </SecondaryButton>
          </div>
        </div>
      </BottomSheet>

      {/* Processing — shown while the mock payment is in flight (Req 13.5). */}
      <BottomSheet open={sheet === "processing"} onClose={() => undefined}>
        <div className={styles.processing}>
          <LoadingState large label="Processing payment" />
        </div>
      </BottomSheet>

      {/* Payment success (Req 21.4 completes). Restrained celebration. */}
      <BottomSheet open={sheet === "success"} onClose={goHome}>
        <div className={styles.success}>
          <span className={styles.successBadge} aria-hidden="true">
            <CheckIcon />
          </span>
          <p className={styles.successTitle} role="status">
            Payment successful
          </p>
          <span className={`text-financial-figure text-financial-figure--hero ${styles.successAmount}`}>
            {paidAmount}
          </span>
          <p className={styles.successMeta}>
            {DEMO_PAYMENT_DETAILS.merchant} · Paid using{" "}
            {DEMO_PAYMENT_DETAILS.paymentMethod}
          </p>
          <div className={styles.successActions}>
            <PrimaryButton fullWidth onClick={goTransactions}>
              View transaction
            </PrimaryButton>
            <SecondaryButton fullWidth onClick={goHome}>
              Continue
            </SecondaryButton>
          </div>
        </div>
      </BottomSheet>
    </section>
  );
}
