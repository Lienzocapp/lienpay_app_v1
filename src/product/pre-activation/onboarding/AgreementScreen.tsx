/**
 * AgreementScreen — Pre_Activation_Flow screen 16 (Agreement).
 *
 * Presents the agreement in a minimal functional scrollable container, then
 * lets the user continue to the e-Sign screen (screen 17) in the fixed order.
 * On continue, `agreementStatus` is set to `"complete"` in the single
 * centralized store so the read-only resume resolver advances to e-Sign
 * (Req 8.5). This screen triggers no Mock_Service operation — it is a
 * review + advance step.
 *
 * CONTENT — BLOCKED (Req 18.1, 20.4): No authoritative agreement/legal copy or
 * screenshot for this screen exists in the workspace. The agreement text is
 * DELIBERATELY NOT fabricated — the panel is an empty functional container with
 * a flagged placeholder note; the exact agreement copy is BLOCKED pending the
 * higher-precedence source and is called out in the batch report. The heading
 * and continue label use MINIMAL FUNCTIONAL WORDING.
 *
 * Requirements: 8.5, 20.1, 20.2, 20.4.
 * Design: Conflicts & Ambiguities (screen content source of truth).
 */
import { useState } from "react";
import { ErrorState, PrimaryButton } from "../../../design-system/components";
import { useLienPayStore } from "../../../state/store";
import { DocumentIcon } from "./verifyIcons";
import styles from "./onboarding.module.css";
import phase5 from "./phase5.module.css";

export interface AgreementScreenProps {
  /** Invoked on continue, to advance to the e-Sign screen (17). */
  onAdvance: () => void;
}

export function AgreementScreen({ onAdvance }: AgreementScreenProps) {
  const setAgreementStatus = useLienPayStore((s) => s.setAgreementStatus);
  const [accepted, setAccepted] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleContinue = () => {
    if (!accepted) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setAgreementStatus("complete");
    onAdvance();
  };

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Agreement"
    >
      <div className={styles.header}>
        <div className={phase5.verifyHead}>
          <span className={phase5.verifyBadge}>
            <DocumentIcon />
          </span>
          <div className={phase5.verifyTitles}>
            <p className={styles.eyebrow}>Review</p>
            <h1 className={`text-heading ${styles.heading}`}>Credit agreement</h1>
            <p className={phase5.verifyLead}>
              Review the agreement for your LienPay credit line, then accept to
              continue.
            </p>
          </div>
        </div>
      </div>

      {/*
       * CONTENT BLOCKED (Req 18.1, 20.4): the authoritative agreement/legal copy
       * is not supplied in the workspace and is NOT fabricated. This is a
       * scrollable document container only.
       */}
      <div className={phase5.agreementPanel} aria-label="Agreement document">
        <p className={phase5.blockedNote}>
          The full agreement text will appear here from the design specification.
        </p>
      </div>

      <label className={phase5.signRow}>
        <input
          type="checkbox"
          className={phase5.signCheckbox}
          checked={accepted}
          onChange={(e) => {
            setAccepted(e.target.checked);
            if (showError) {
              setShowError(false);
            }
          }}
        />
        <span className={phase5.signLabelText}>
          I have read and accept the agreement.
        </span>
      </label>

      {showError ? (
        <ErrorState
          title="Acceptance required"
          message="Please accept the agreement to continue."
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
