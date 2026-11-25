/**
 * ESignScreen — Pre_Activation_Flow e-Sign screen.
 *
 * Requires the e-Sign ACTION to be completed before advancing directly to the
 * Activated screen (activation-success) in the fixed order (Req 8.5). The
 * e-Sign action is modeled as an explicit toggle the user must complete; a
 * separate Continue action then advances. If the user attempts to proceed
 * WITHOUT completing the e-Sign action, advancement is prevented and the shared
 * `ErrorState` shows that e-Sign completion is required (Req 8.6). On a
 * completed e-Sign + continue, `eSignStatus` is set to `"complete"` in the
 * single centralized store and the flow advances to the Activated screen where
 * the account is activated on mount.
 *
 * This screen triggers no Mock_Service operation — the e-Sign gate is a pure
 * client-side completion check.
 *
 * CONTENT — BLOCKED (Req 18.1, 20.4): No authoritative source copy / screenshot
 * for the e-Sign screen exists in the workspace. No signing UI copy, OTP/consent
 * text, or legal wording is invented; only the completion-gate mechanics are
 * built. The heading, toggle label, and button labels use MINIMAL FUNCTIONAL
 * WORDING pending the higher-precedence source and are flagged BLOCKED in the
 * batch report.
 *
 * Requirements: 8.5, 8.6, 20.1, 20.2, 20.4.
 * Design: Error Handling, Conflicts & Ambiguities (screen content source of
 * truth).
 */
import { useState } from "react";
import { ErrorState, PrimaryButton } from "../../../design-system/components";
import { useLienPayStore } from "../../../state/store";
import { SignIcon } from "./verifyIcons";
import styles from "./onboarding.module.css";
import phase5 from "./phase5.module.css";

export interface ESignScreenProps {
  /** Invoked once e-Sign is completed, to advance to the Activated screen. */
  onAdvance: () => void;
}

export function ESignScreen({ onAdvance }: ESignScreenProps) {
  const setESignStatus = useLienPayStore((s) => s.setESignStatus);

  const [signed, setSigned] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleContinue = () => {
    if (!signed) {
      // e-Sign not completed: prevent advancement and surface the requirement
      // (Req 8.6). No status transition occurs.
      setShowError(true);
      return;
    }
    setShowError(false);
    setESignStatus("complete");
    onAdvance();
  };

  return (
    <section className={`${styles.screen} ${styles.flow}`} aria-label="e-Sign">
      <div className={styles.header}>
        <div className={phase5.verifyHead}>
          <span className={phase5.verifyBadge}>
            <SignIcon />
          </span>
          <div className={phase5.verifyTitles}>
            <p className={styles.eyebrow}>Authorize</p>
            <h1 className={`text-heading ${styles.heading}`}>e-Sign agreement</h1>
            <p className={phase5.verifyLead}>
              Complete your electronic signature to authorize your credit line.
            </p>
          </div>
        </div>
      </div>

      <label className={phase5.signRow}>
        <input
          type="checkbox"
          className={phase5.signCheckbox}
          checked={signed}
          onChange={(e) => {
            setSigned(e.target.checked);
            if (showError) {
              setShowError(false);
            }
          }}
        />
        <span className={phase5.signLabelText}>
          I authorize and electronically sign this agreement.
        </span>
      </label>

      {showError ? (
        <ErrorState
          title="e-Sign is required"
          message="Please complete the e-Sign action to continue."
        />
      ) : null}

      <div className={styles.actions}>
        <PrimaryButton fullWidth onClick={handleContinue}>
          Continue
        </PrimaryButton>
      </div>
    </section>
  );
}
