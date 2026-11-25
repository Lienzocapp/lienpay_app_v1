/**
 * PanScreens — PAN Verification (screen 7) and PAN Processing (screen 8) of the
 * Check-My-Limit journey.
 *
 * Per the beta flow doc, PAN input + verification MUST happen before the
 * mutual-fund journey. PAN Verification collects a well-formed PAN (client-side
 * format validation, invalid state, retry) and PAN Processing runs the
 * DETERMINISTIC mock verification (`Mock_Service.verifyPan`) with a realistic
 * processing state, success, failure, and retry. No real PAN endpoint is used
 * (Req 13.1, 13.2).
 *
 * Requirements: 5.1, 5.3, 13.1, 13.2, 13.5, 16.2.
 * Design: Navigation Architecture, Mock Service Architecture, Onboarding
 * Resume Logic.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ErrorState,
  InputField,
  LoadingState,
  PrimaryButton,
  ProcessTimeline,
  SecondaryButton,
  SuccessState,
  type ProcessStep,
} from "../../../design-system/components";
import { mockService } from "../../../mock/mockService";
import { isValidPanFormat, normalizePan } from "../../../mock/data/pan";
import { ROUTES } from "../../../navigation/navConfig";
import { useLienPayStore } from "../../../state/store";
import { onboardingStepPath } from "../onboardingSteps";
import styles from "./onboarding.module.css";
import phase4 from "./phase4.module.css";
import phase5 from "./phase5.module.css";
import limit from "./limitCheck.module.css";

/** Brief hold on a success confirmation before advancing. */
const SUCCESS_HOLD_MS = 650;

export interface PanScreenProps {
  /** Invoked on success, to advance to the next step in the fixed order. */
  onAdvance: () => void;
}

/* -------------------------------------------------------------------------- */
/* Screen 7 — PAN Verification (input + format validation)                    */
/* -------------------------------------------------------------------------- */

export function PanVerificationScreen({ onAdvance }: PanScreenProps) {
  const navigate = useNavigate();
  const setPanStatus = useLienPayStore((s) => s.setPanStatus);
  const setPanNumber = useLienPayStore((s) => s.setPanNumber);
  const existingPan = useLienPayStore((s) => s.panNumber);

  const [pan, setPan] = useState(existingPan ?? "");
  const [showError, setShowError] = useState(false);

  const valid = isValidPanFormat(pan);

  const handleContinue = () => {
    if (!valid) {
      setShowError(true);
      return;
    }
    // Persist the PAN and mark the input step complete so the resolver advances
    // to PAN Processing, which runs the mock verification against it.
    setPanNumber(normalizePan(pan));
    setPanStatus("complete");
    onAdvance();
  };

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="PAN Verification"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Check my limit</p>
        <h1 className={`text-heading ${styles.heading}`}>Verify your PAN</h1>
        <p className={styles.subtext}>
          Your PAN lets us securely locate your mutual-fund investments and
          check how much credit you can unlock.
        </p>
      </header>

      <div className={limit.panForm}>
        <InputField
          label="PAN number"
          value={pan}
          maxLength={10}
          autoCapitalize="characters"
          error={
            showError
              ? "A PAN has five letters, four digits and one letter (e.g. ABCDE1234F)."
              : undefined
          }
          onChange={(e) => {
            setPan(e.target.value.toUpperCase());
            if (showError) setShowError(false);
          }}
        />
        <p className={styles.fieldHelp}>Format: ABCDE1234F</p>
      </div>

      <div className={styles.actions}>
        <PrimaryButton fullWidth onClick={handleContinue}>
          Continue
        </PrimaryButton>
        <SecondaryButton fullWidth onClick={() => navigate(ROUTES.pre.home)}>
          Back
        </SecondaryButton>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen 8 — PAN Processing (deterministic mock verification)                */
/* -------------------------------------------------------------------------- */

type PanPhase = "processing" | "success" | "failed";

export function PanProcessingScreen({ onAdvance }: PanScreenProps) {
  const navigate = useNavigate();
  const panNumber = useLienPayStore((s) => s.panNumber);
  const setPanProcessingStatus = useLienPayStore(
    (s) => s.setPanProcessingStatus
  );
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);

  const [phase, setPhase] = useState<PanPhase>("processing");
  const inFlightRef = useRef(false);

  const runVerify = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setPhase("processing");
    setAsyncInFlight(true);
    try {
      const result = await mockService.verifyPan(panNumber ?? "");
      if (result.status === "success") {
        setPanProcessingStatus("complete");
        setPhase("success");
        window.setTimeout(onAdvance, SUCCESS_HOLD_MS);
      } else {
        setPhase("failed");
      }
    } finally {
      inFlightRef.current = false;
      setAsyncInFlight(false);
    }
  }, [panNumber, setPanProcessingStatus, setAsyncInFlight, onAdvance]);

  useEffect(() => {
    void runVerify();
    // Launch once on mount; the ref guard prevents concurrent runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps: ProcessStep[] = [
    { id: "received", label: "PAN received", status: "complete" },
    { id: "verifying", label: "Verifying your PAN", status: "active" },
    { id: "locating", label: "Locating your investments", status: "pending" },
  ];

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="PAN Processing"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Check my limit</p>
        <h1 className={`text-heading ${styles.heading}`}>Verifying your PAN</h1>
      </header>

      {phase === "processing" ? (
        <div className={phase4.processingBlock}>
          <ProcessTimeline steps={steps} ariaLabel="PAN verification progress" />
          <div className={phase4.processingLoading}>
            <LoadingState label="Verifying your PAN" />
          </div>
        </div>
      ) : null}

      {phase === "success" ? (
        <div className={phase5.successMoment}>
          <SuccessState
            title="PAN verified"
            message="Your PAN is verified. Next, Fetch Your Investment."
          />
        </div>
      ) : null}

      {phase === "failed" ? (
        <ErrorState
          title="We couldn't verify your PAN"
          message="Please check your PAN and enter it again."
          action={
            <PrimaryButton
              onClick={() => navigate(onboardingStepPath("pan-verification"))}
            >
              Re-enter PAN
            </PrimaryButton>
          }
        />
      ) : null}
    </section>
  );
}
