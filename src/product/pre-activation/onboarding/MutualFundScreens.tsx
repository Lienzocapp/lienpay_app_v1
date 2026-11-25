/**
 * MutualFundScreens — MF Connection (screen 9) and Consent (screen 10).
 *
 * After PAN verification, the user connects their mutual-fund investments. MF
 * Connection explains WHY the information is needed, WHAT is accessed, that the
 * user stays in control, and that it is used to determine eligibility — then
 * offers a "Connect Investments" CTA. Consent requires an explicit checkbox
 * before any (simulated) retrieval begins; Continue stays disabled until
 * consent is given. No real MF / MF Central endpoint is used (Req 13.1, 13.2).
 *
 * Requirements: 5.1, 5.3, 13.1, 13.2, 20.4.
 * Design: Navigation Architecture, Onboarding Resume Logic.
 */
import { useState } from "react";
import { PrimaryButton } from "../../../design-system/components";
import { useLienPayStore } from "../../../state/store";
import styles from "./onboarding.module.css";
import phase4 from "./phase4.module.css";
import limit from "./limitCheck.module.css";

export interface MfScreenProps {
  /** Invoked on continue, to advance to the next step in the fixed order. */
  onAdvance: () => void;
}

/* -------------------------------------------------------------------------- */
/* Screen 9 — MF Connection (explanation + Connect Investments)               */
/* -------------------------------------------------------------------------- */

/** What connecting explains — documented, non-fabricated reassurance points. */
const CONNECT_POINTS = [
  {
    title: "Why we need this",
    body: "We check the value and type of your eligible investments to work out how much credit you can unlock.",
  },
  {
    title: "What we access",
    body: "A read-only view of your mutual-fund holdings — enough to assess eligibility. We can't transact on them.",
  },
  {
    title: "You stay in control",
    body: "You choose what to pledge later. Connecting your investments does not place anything under lien.",
  },
] as const;

export function MfConnectionScreen({ onAdvance }: MfScreenProps) {
  const setMfConnectionStatus = useLienPayStore(
    (s) => s.setMfConnectionStatus
  );

  const handleConnect = () => {
    setMfConnectionStatus("complete");
    onAdvance();
  };

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Connect Investments"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Check my limit</p>
        <h1 className={`text-heading ${styles.heading}`}>
          Fetch Your Investment
        </h1>
        <p className={styles.subtext}>
          Securely link your mutual funds so we can check your eligible credit.
        </p>
      </header>

      <ul className={limit.infoList}>
        {CONNECT_POINTS.map((point) => (
          <li key={point.title} className={limit.infoRow}>
            <span className={limit.infoBullet} aria-hidden="true">
              ✓
            </span>
            <span className={limit.infoBody}>
              <span className={limit.infoTitle}>{point.title}</span>
              <span className={limit.infoText}>{point.body}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <PrimaryButton fullWidth onClick={handleConnect}>
          Connect Investments
        </PrimaryButton>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen 10 — Consent (explicit checkbox gate before retrieval)              */
/* -------------------------------------------------------------------------- */

export function MfConsentScreen({ onAdvance }: MfScreenProps) {
  const setMfConsentStatus = useLienPayStore((s) => s.setMfConsentStatus);
  const [consented, setConsented] = useState(false);

  const handleContinue = () => {
    // Continue is disabled until consent is given, so reaching here means
    // consent is granted.
    setMfConsentStatus("complete");
    onAdvance();
  };

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Consent"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Check my limit</p>
        <h1 className={`text-heading ${styles.heading}`}>
          Confirm data access
        </h1>
        <p className={styles.subtext}>
          We'll retrieve a read-only view of your mutual-fund holdings to check
          your eligibility. You can revoke access at any time.
        </p>
      </header>

      <label className={phase4.consentRow}>
        <input
          type="checkbox"
          className={phase4.consentCheckbox}
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
        />
        <span className={phase4.consentLabelText}>
          I consent to LienPay accessing my investment details to check my
          eligible credit limit.
        </span>
      </label>

      <div className={styles.actions}>
        <PrimaryButton fullWidth disabled={!consented} onClick={handleContinue}>
          Continue
        </PrimaryButton>
      </div>
    </section>
  );
}
