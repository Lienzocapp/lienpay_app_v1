/**
 * AutoDebitMandateScreen — Pre_Activation_Flow screen 15 (Auto-Debit / Mandate).
 *
 * Authorizes the auto-debit mandate through the centralized
 * `Mock_Service.setupMandate` (simulated success after a 500–2000ms standard
 * delay, no external payment API — Req 8.4, 13.3). While the operation is
 * pending the shared `LoadingState` is shown; on success `mandateStatus` is set
 * to `"complete"` in the single centralized store and the flow advances to the
 * Agreement screen (screen 16) in the fixed order. On a simulated failure the
 * screen remains and shows the shared `ErrorState` with a retry action.
 *
 * Submission is guarded by an in-flight ref so a duplicate/concurrent authorize
 * is impossible (idempotent), and the transient `session.asyncInFlight` flag is
 * raised while the blocking op runs (Design: async safety).
 *
 * CONTENT — BLOCKED (Req 18.1, 20.4): No authoritative source copy / screenshot
 * for the Auto-Debit / Mandate screen exists in the workspace. No mandate terms,
 * amounts, frequency, or legal copy are invented; only the authorize mechanics
 * are built. The heading and button label use MINIMAL FUNCTIONAL WORDING pending
 * the higher-precedence source and are flagged BLOCKED in the batch report.
 *
 * Requirements: 8.4, 13.3, 20.1, 20.2, 20.4.
 * Design: Mock Service Architecture.
 */
import { useCallback, useRef, useState } from "react";
import {
  ErrorState,
  LoadingState,
  PrimaryButton,
  SuccessState,
} from "../../../design-system/components";
import { mockService } from "../../../mock/mockService";
import { useLienPayStore } from "../../../state/store";
import { MandateIcon } from "./verifyIcons";
import styles from "./onboarding.module.css";
import phase5 from "./phase5.module.css";

type Phase = "idle" | "submitting" | "success" | "error";

/** Brief hold on the "mandate active" confirmation before advancing. */
const MANDATE_SUCCESS_HOLD_MS = 650;

export interface AutoDebitMandateScreenProps {
  /** Invoked on a successful mandate setup, to advance to Agreement (16). */
  onAdvance: () => void;
}

export function AutoDebitMandateScreen({
  onAdvance,
}: AutoDebitMandateScreenProps) {
  const setMandateStatus = useLienPayStore((s) => s.setMandateStatus);
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);

  const [phase, setPhase] = useState<Phase>("idle");
  const inFlightRef = useRef(false);

  const runAuthorize = useCallback(async () => {
    if (inFlightRef.current) {
      return;
    }
    inFlightRef.current = true;
    setPhase("submitting");
    setAsyncInFlight(true);

    try {
      const result = await mockService.setupMandate({});
      if (result.status === "success") {
        setMandateStatus("complete");
        setPhase("success");
        window.setTimeout(onAdvance, MANDATE_SUCCESS_HOLD_MS);
      } else {
        setPhase("error");
      }
    } finally {
      inFlightRef.current = false;
      setAsyncInFlight(false);
    }
  }, [setMandateStatus, setAsyncInFlight, onAdvance]);

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Auto-Debit / Mandate"
    >
      <div className={styles.header}>
        <div className={phase5.verifyHead}>
          <span className={phase5.verifyBadge}>
            <MandateIcon />
          </span>
          <div className={phase5.verifyTitles}>
            <p className={styles.eyebrow}>Authorization</p>
            <h1 className={`text-heading ${styles.heading}`}>Auto-debit mandate</h1>
            <p className={phase5.verifyLead}>
              Authorize automatic repayments from your verified bank account.
            </p>
          </div>
        </div>
      </div>

      {phase === "success" ? (
        <div className={phase5.successMoment}>
          <SuccessState
            title="Mandate active"
            message="Your auto-debit mandate is set up."
          />
        </div>
      ) : phase === "error" ? (
        <ErrorState
          title="Mandate could not be set up"
          message="Something went wrong. Please try again."
          action={
            <PrimaryButton onClick={() => void runAuthorize()}>
              Try again
            </PrimaryButton>
          }
        />
      ) : (
        <>
          {phase === "submitting" ? (
            <div className={phase5.loadingWrap}>
              <LoadingState label="Setting up mandate" />
            </div>
          ) : null}

          <div className={styles.actions}>
            <PrimaryButton
              fullWidth
              disabled={phase === "submitting"}
              onClick={() => void runAuthorize()}
            >
              Authorize
            </PrimaryButton>
          </div>
        </>
      )}
    </section>
  );
}
