/**
 * PledgeProcessingScreen — Pre_Activation_Flow screen 10 (Pledge Processing).
 *
 * Runs the deliberately long-running pledge simulation through the centralized
 * `Mock_Service.processPledge` (2–5s delay — Req 7.6, 13.5). While it runs the
 * shared `ProcessTimeline` + `LoadingState` are shown and `pledgeStatus` is set
 * to `"processing"`; the transient `session.asyncInFlight` flag is raised so the
 * app guards against duplicate/concurrent operations (Design: async safety).
 *
 * Idempotency: the pledge is started exactly once per mount via a ref guard, so
 * re-renders never launch a second concurrent operation. On SUCCESS the store's
 * `pledgeStatus` becomes `"success"` and the flow advances directly to KYC
 * (screen 11) per the fixed 20-screen order — no screen is added or reordered
 * (Req 7.7). On FAILURE the screen remains, sets `pledgeStatus` `"failed"`, and
 * shows the shared `ErrorState` with a retry action; the selected funds are
 * preserved throughout (they live in the centralized `selectedFunds`, Req 7.8).
 *
 * The processing status labels ("Verifying selection", "Pledging funds",
 * "Finalizing") are generic mechanics/progress descriptors, not screen content
 * from the source; the header uses minimal functional wording pending the
 * higher-precedence source (Req 20.4).
 *
 * Requirements: 7.6, 7.7, 7.8, 13.5.
 * Design: Mock Service Architecture (delay strategy), Navigation, Error
 * Handling.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ErrorState,
  LoadingState,
  PrimaryButton,
  ProcessTimeline,
  SuccessState,
  type ProcessStep,
} from "../../../design-system/components";
import { mockService } from "../../../mock/mockService";
import { useLienPayStore } from "../../../state/store";
import styles from "./onboarding.module.css";
import phase4 from "./phase4.module.css";
import phase5 from "./phase5.module.css";

type Phase = "processing" | "success" | "failed";

/** Brief hold on the success confirmation before entering the next screen. */
const PLEDGE_SUCCESS_HOLD_MS = 650;

export interface PledgeProcessingScreenProps {
  /** Invoked on a successful pledge, to advance directly to KYC (screen 11). */
  onAdvance: () => void;
}

export function PledgeProcessingScreen({
  onAdvance,
}: PledgeProcessingScreenProps) {
  const selectedFunds = useLienPayStore((s) => s.selectedFunds);
  const setPledgeStatus = useLienPayStore((s) => s.setPledgeStatus);
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);

  const [phase, setPhase] = useState<Phase>("processing");
  // Ref guard: ensures the pledge is launched exactly once at a time
  // (idempotent — no duplicate/concurrent operation on re-render/retry).
  const inFlightRef = useRef(false);

  const runPledge = useCallback(async () => {
    if (inFlightRef.current) {
      return;
    }
    inFlightRef.current = true;
    setPhase("processing");
    setPledgeStatus("processing");
    setAsyncInFlight(true);

    try {
      const result = await mockService.processPledge(selectedFunds);
      if (result.status === "success") {
        setPledgeStatus("success");
        // Show a brief success confirmation before continuing (do not snap
        // straight to the next screen).
        setPhase("success");
        window.setTimeout(onAdvance, PLEDGE_SUCCESS_HOLD_MS);
      } else {
        // Failure: remain on the screen; selected funds are preserved (Req 7.8).
        setPledgeStatus("failed");
        setPhase("failed");
      }
    } finally {
      inFlightRef.current = false;
      setAsyncInFlight(false);
    }
  }, [selectedFunds, setPledgeStatus, setAsyncInFlight, onAdvance]);

  useEffect(() => {
    void runPledge();
    // Launch once on mount; runPledge's ref guard prevents concurrent runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps: ProcessStep[] = [
    { id: "portfolio", label: "Portfolio verified", status: "complete" },
    { id: "eligibility", label: "Eligibility confirmed", status: "complete" },
    { id: "pledge", label: "Creating pledge", status: "active" },
    { id: "finalise", label: "Finalising pledge", status: "pending" },
  ];

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Pledge Processing"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Creating your pledge</p>
        <h1 className={`text-heading ${styles.heading}`}>Processing pledge</h1>
      </header>

      {phase === "processing" ? (
        <div className={phase4.processingBlock}>
          <ProcessTimeline steps={steps} ariaLabel="Pledge progress" />
          <div className={phase4.processingLoading}>
            <LoadingState label="Creating your pledge" />
          </div>
        </div>
      ) : null}

      {phase === "success" ? (
        <div className={phase5.successMoment}>
          <SuccessState
            title="Pledge created"
            message="Your funds are pledged and your credit line is being prepared."
          />
        </div>
      ) : null}

      {phase === "failed" ? (
        <ErrorState
          title="Pledge could not be completed"
          message="Something went wrong while processing your pledge. Your selected funds are saved, so you can try again."
          action={
            <PrimaryButton onClick={() => void runPledge()}>
              Try again
            </PrimaryButton>
          }
        />
      ) : null}
    </section>
  );
}
