import { useCallback } from "react";
import {
  ProcessTimeline,
  PrimaryButton,
  type ProcessStep,
} from "../../../design-system/components";
import { useLienPayStore } from "../../../state/store";
import styles from "./onboarding.module.css";
import phase4 from "./phase4.module.css";

export interface BankReviewScreenProps {
  onAdvance: () => void;
}

export function BankReviewScreen({ onAdvance }: BankReviewScreenProps) {
  const setFinalReviewStatus = useLienPayStore((s) => s.setFinalReviewStatus);

  const handleContinue = useCallback(() => {
    setFinalReviewStatus("complete");
    onAdvance();
  }, [setFinalReviewStatus, onAdvance]);

  const steps: ProcessStep[] = [
    { id: "kyc", label: "KYC submitted", status: "complete" },
    { id: "review", label: "Application under bank review", status: "active" },
  ];

  return (
    <section className={`${styles.screen} ${styles.flow}`} aria-label="Bank Review">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Your verification is in progress</p>
        <h1 className={`text-heading ${styles.heading}`}>Application submitted</h1>
        <p className={styles.subtext}>
          Your application has been submitted to our partner bank for final verification. This may take up to 4 hours. We’ll notify you once your credit line is ready.
        </p>
      </header>

      <div className={phase4.processingBlock}>
        <ProcessTimeline steps={steps} ariaLabel="Bank review progress" />
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <p className={styles.subtext} style={{ fontSize: "0.875rem" }}>
            Expected decision: within 4 hours
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <PrimaryButton fullWidth onClick={handleContinue}>
          Continue
        </PrimaryButton>
      </div>
    </section>
  );
}
