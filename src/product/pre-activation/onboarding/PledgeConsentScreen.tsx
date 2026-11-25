/**
 * PledgeConsentScreen — Pre_Activation_Flow screen 9 (Pledge Consent).
 *
 * Implements the pledge consent gate exactly: the flow advances to Pledge
 * Processing (screen 10) only WHEN the user has confirmed consent AND at least
 * one fund is selected (Req 7.4). Otherwise the screen remains and shows a
 * message indicating that consent and at least one selected fund are required
 * (Req 7.5); the selection is preserved throughout (it lives in the centralized
 * `selectedFunds`, never duplicated here).
 *
 * The selected-fund count is read from the centralized Application_State; consent
 * is a transient UI gate held in local component state (it is not a persisted
 * status value in the state model). The required-inputs message uses the shared
 * `ErrorState`.
 *
 * CONTENT GAP (flagged, not invented — Req 20.4, 18.3): the higher-precedence
 * LienPay Application Design Specification / screenshot for this screen is not
 * present in the workspace, so the exact consent wording, header, and button
 * label are unavailable. Minimal functional wording is used pending the source;
 * no consent/legal copy is fabricated.
 *
 * Requirements: 7.4, 7.5, 20.1, 20.2, 20.4.
 * Design: Error Handling, Conflicts & Ambiguities (screen content source of
 * truth).
 */
import { useState } from "react";
import { ErrorState, PrimaryButton } from "../../../design-system/components";
import { useLienPayStore } from "../../../state/store";
import styles from "./onboarding.module.css";
import phase4 from "./phase4.module.css";

export interface PledgeConsentScreenProps {
  /** Invoked once the gate passes, to advance to Pledge Processing (screen 10). */
  onAdvance: () => void;
}

export function PledgeConsentScreen({ onAdvance }: PledgeConsentScreenProps) {
  const selectedFunds = useLienPayStore((s) => s.selectedFunds);
  // Read verbatim from central state — the credit line this pledge enables.
  const creditLimit = useLienPayStore((s) => s.creditLimit);

  const [consented, setConsented] = useState(false);
  const [showError, setShowError] = useState(false);

  const hasSelection = selectedFunds.length >= 1;
  const canProceed = consented && hasSelection;
  const fundWord = selectedFunds.length === 1 ? "fund" : "funds";

  const handleProceed = () => {
    if (!canProceed) {
      // Gate not satisfied: remain on the screen and surface the required
      // inputs (Req 7.5). Selection is preserved (centralized state).
      setShowError(true);
      return;
    }
    setShowError(false);
    onAdvance();
  };

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Pledge Consent"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Confirm pledge</p>
        <h1 className={`text-heading ${styles.heading}`}>Confirm your pledge</h1>
      </header>

      {/* What is being pledged and what credit it enables (both from state). */}
      <div className={phase4.pledgeSummary}>
        <div className={phase4.pledgeRow}>
          <span className={phase4.pledgeRowLabel}>Pledging</span>
          <span className={phase4.pledgeRowValue}>
            {selectedFunds.length} {fundWord}
          </span>
        </div>
        <div className={phase4.pledgeDivider} aria-hidden="true" />
        <div className={phase4.pledgeRow}>
          <span className={phase4.pledgeRowLabel}>Credit line to activate</span>
          <span className={`text-financial-figure ${phase4.pledgeCredit}`}>
            {creditLimit}
          </span>
        </div>
      </div>

      <label className={phase4.consentRow}>
        <input
          type="checkbox"
          className={phase4.consentCheckbox}
          checked={consented}
          onChange={(e) => {
            setConsented(e.target.checked);
            if (showError) {
              setShowError(false);
            }
          }}
        />
        <span className={phase4.consentLabelText}>
          I consent to pledging my selected funds.
        </span>
      </label>

      {showError ? (
        <ErrorState
          title="Consent and a selected fund are required"
          message="Please confirm consent and select at least one fund to continue."
        />
      ) : null}

      <div className={styles.actions}>
        <PrimaryButton fullWidth onClick={handleProceed}>
          Continue
        </PrimaryButton>
      </div>
    </section>
  );
}
