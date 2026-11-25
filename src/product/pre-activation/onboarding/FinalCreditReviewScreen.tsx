/**
 * FinalCreditReviewScreen — Pre_Activation_Flow screen 18 (Bank Review / Processing).
 *
 * Dedicated processing screen presented immediately after the user submits the
 * completed application and e-signs the agreement.
 *
 * Recommended screen copy & structure:
 *  - Eyebrow: "Your verification is in progress"
 *  - Heading: "Application submitted"
 *  - Subtext: "Your application has been submitted to our partner bank for final verification. This may take up to 4 hours. We’ll notify you once your credit line is ready."
 *  - Status 1: "KYC submitted" (Complete)
 *  - Status 2: "Application under bank review" (Active — partner bank final verification & underwriting)
 *  - Expected decision: "within 4 hours"
 *
 * Requirements: 8.7, 5.1, 5.2, 20.1, 20.2, 20.4.
 */
import {
  CreditHealthCard,
  FinancialCard,
  MetricCard,
  PrimaryButton,
  ProcessTimeline,
  type ProcessStep,
} from "../../../design-system/components";
import { useLienPayStore } from "../../../state/store";
import { ReviewIcon } from "./verifyIcons";
import styles from "./onboarding.module.css";
import phase6 from "./phase6.module.css";

export interface FinalCreditReviewScreenProps {
  /** Invoked on confirm, to advance to the Activation screen. */
  onAdvance: () => void;
}

export function FinalCreditReviewScreen({
  onAdvance,
}: FinalCreditReviewScreenProps) {
  // Mandated figures read verbatim from centralized state.
  const creditLimit = useLienPayStore((s) => s.creditLimit);
  const portfolioValue = useLienPayStore((s) => s.portfolioValue);
  const availableCredit = useLienPayStore((s) => s.availableCredit);
  const ltv = useLienPayStore((s) => s.ltv);
  const creditHealth = useLienPayStore((s) => s.creditHealth);
  const setFinalReviewStatus = useLienPayStore((s) => s.setFinalReviewStatus);

  const bankReviewSteps: ProcessStep[] = [
    {
      id: "kyc-submitted",
      label: "KYC submitted",
      status: "complete",
      detail: "Identity & document verification completed",
    },
    {
      id: "bank-review",
      label: "Application under bank review",
      status: "active",
      detail: "Partner bank completing final verification and underwriting",
    },
    {
      id: "expected-decision",
      label: "Expected decision",
      status: "pending",
      detail: "within 4 hours",
    },
  ];

  const handleConfirm = () => {
    setFinalReviewStatus("complete");
    onAdvance();
  };

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Application Submitted - Bank Review"
    >
      <div className={styles.header}>
        <div className={phase6.reviewHead}>
          <span className={phase6.reviewBadge}>
            <ReviewIcon />
          </span>
          <div className={phase6.reviewTitles}>
            <p className={styles.eyebrow}>Your verification is in progress</p>
            <h1 className={`text-heading ${styles.heading}`}>Application submitted</h1>
            <p className={styles.subtext} style={{ marginTop: "8px" }}>
              Your application has been submitted to our partner bank for final verification. This may take up to 4 hours. We’ll notify you once your credit line is ready.
            </p>
          </div>
        </div>
      </div>

      <ProcessTimeline steps={bankReviewSteps} ariaLabel="Bank review status" />

      <div className={phase6.reviewCards}>
        <FinancialCard label="Credit Line Under Bank Review" value={creditLimit} hero />
        <div className={phase6.metrics}>
          <MetricCard label="Portfolio Value" value={portfolioValue} />
          <MetricCard label="Available Credit" value={availableCredit} />
          <MetricCard label="LTV" value={ltv} />
          <CreditHealthCard label="Credit Health" health={creditHealth} tone="healthy" />
        </div>
      </div>

      <div className={styles.actions}>
        <PrimaryButton fullWidth onClick={handleConfirm}>
          Continue
        </PrimaryButton>
      </div>
    </section>
  );
}
