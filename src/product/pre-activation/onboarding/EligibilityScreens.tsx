/**
 * EligibilityScreens — Eligibility Calculation (screen 13) and Eligible Credit
 * Limit Result (screen 14), the climax of the Check-My-Limit journey.
 *
 * Eligibility Calculation shows a believable calculation state driven by the
 * DETERMINISTIC `Mock_Service.calculateEligibility`, then the Result screen
 * presents the eligible credit limit (₹80,000) as a major product moment with
 * the supporting breakdown (portfolio value, eligible investments, eligible
 * credit). The figure is the fixed central eligibility value, not a random or
 * ad-hoc computation (deterministic demo, Req 12.5, 19.3).
 *
 * Requirements: 5.1, 5.3, 12.5, 13.1, 13.2, 19.3.
 * Design: Navigation Architecture, Mock Service Architecture, Onboarding
 * Resume Logic.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ErrorState,
  FinancialCard,
  LoadingState,
  PrimaryButton,
  ProcessTimeline,
  SecondaryButton,
  SuccessState,
  type ProcessStep,
} from "../../../design-system/components";
import { mockService } from "../../../mock/mockService";
import { ELIGIBILITY_DATA } from "../../../mock/data/eligibility";
import { useLienPayStore } from "../../../state/store";
import { onboardingStepPath } from "../onboardingSteps";
import styles from "./onboarding.module.css";
import phase4 from "./phase4.module.css";
import phase5 from "./phase5.module.css";
import limit from "./limitCheck.module.css";

/** Brief hold on the "confirmed" moment before showing the result. */
const CONFIRM_HOLD_MS = 700;

export interface EligibilityScreenProps {
  /** Invoked on success/continue, to advance to the next step. */
  onAdvance: () => void;
}

/* -------------------------------------------------------------------------- */
/* Screen 13 — Eligibility Calculation                                        */
/* -------------------------------------------------------------------------- */

type CalcPhase = "calculating" | "done" | "error";

export function EligibilityCalculationScreen({
  onAdvance,
}: EligibilityScreenProps) {
  const setEligibilityStatus = useLienPayStore((s) => s.setEligibilityStatus);
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);

  const [phase, setPhase] = useState<CalcPhase>("calculating");
  const inFlightRef = useRef(false);

  const runCalc = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setPhase("calculating");
    setAsyncInFlight(true);
    try {
      const result = await mockService.calculateEligibility();
      if (result.status === "success" && result.data) {
        setEligibilityStatus("complete");
        setPhase("done");
        window.setTimeout(onAdvance, CONFIRM_HOLD_MS);
      } else {
        setPhase("error");
      }
    } finally {
      inFlightRef.current = false;
      setAsyncInFlight(false);
    }
  }, [setEligibilityStatus, setAsyncInFlight, onAdvance]);

  useEffect(() => {
    void runCalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps: ProcessStep[] = [
    { id: "portfolio", label: "Portfolio verified", status: "complete" },
    { id: "assess", label: "Assessing eligible investments", status: "active" },
    { id: "limit", label: "Calculating your credit limit", status: "pending" },
  ];

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Eligibility Calculation"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Check my limit</p>
        <h1 className={`text-heading ${styles.heading}`}>
          Calculating your limit
        </h1>
      </header>

      {phase === "calculating" ? (
        <div className={phase4.processingBlock}>
          <ProcessTimeline
            steps={steps}
            ariaLabel="Eligibility calculation progress"
          />
          <div className={phase4.processingLoading}>
            <LoadingState label="Calculating your eligible credit" />
          </div>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className={phase5.successMoment}>
          <SuccessState
            title="Eligibility confirmed"
            message="We've calculated the credit you can unlock."
          />
        </div>
      ) : null}

      {phase === "error" ? (
        <ErrorState
          title="We couldn't complete the calculation"
          message="Something went wrong while calculating your limit. Please try again."
          action={
            <PrimaryButton onClick={() => void runCalc()}>
              Try again
            </PrimaryButton>
          }
        />
      ) : null}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen 14 — Eligible Credit Limit Result (the major moment)                */
/* -------------------------------------------------------------------------- */

export function CreditLimitResultScreen({ onAdvance }: EligibilityScreenProps) {
  const navigate = useNavigate();
  const setPortfolioStatus = useLienPayStore((s) => s.setPortfolioStatus);
  const creditLimit = useLienPayStore((s) => s.creditLimit);
  const selectedPortfolioValue = useLienPayStore((s) => s.selectedPortfolioValue);

  const displayTotalPortfolio = ELIGIBILITY_DATA.portfolioValue;

  const displaySelectedInvestments =
    selectedPortfolioValue || ELIGIBILITY_DATA.eligibleInvestments;

  const selectedLabel = selectedPortfolioValue
    ? "Selected investments"
    : "Eligible investments";

  const displayCreditLimit = creditLimit || ELIGIBILITY_DATA.eligibleCreditLimit;

  const handleContinue = () => {
    // Acknowledge the result and advance to Fund Selection (Design: Onboarding
    // Resume Logic — portfolioStatus gates the credit-limit-result step).
    setPortfolioStatus("complete");
    onAdvance();
  };

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Eligible Credit Limit"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Your credit limit</p>
        <h1 className={`text-heading ${styles.heading}`}>
          You can unlock this credit
        </h1>
      </header>

      <FinancialCard
        hero
        label="Your credit limit"
        value={displayCreditLimit}
        caption="Based on your eligible investments"
      />

      <div className={limit.resultBreakdown}>
        <div className={limit.resultRow}>
          <span className={limit.resultRowLabel}>Portfolio value</span>
          <span className={limit.resultRowValue}>
            {displayTotalPortfolio}
          </span>
        </div>
        <div className={limit.resultDivider} aria-hidden="true" />
        <div className={limit.resultRow}>
          <span className={limit.resultRowLabel}>{selectedLabel}</span>
          <span className={limit.resultRowValue}>
            {displaySelectedInvestments}
          </span>
        </div>
        <div className={limit.resultDivider} aria-hidden="true" />
        <div className={limit.resultRow}>
          <span className={limit.resultRowLabel}>Eligible credit</span>
          <span
            className={`${limit.resultRowValue} ${limit.resultRowValueAccent}`}
          >
            {displayCreditLimit}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <PrimaryButton fullWidth onClick={handleContinue}>
          Continue
        </PrimaryButton>
        <SecondaryButton
          fullWidth
          onClick={() => navigate(onboardingStepPath("portfolio-found"))}
        >
          Review investments
        </SecondaryButton>
      </div>
    </section>
  );
}
