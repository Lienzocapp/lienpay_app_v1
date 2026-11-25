/**
 * ActivationScreen — Pre_Activation_Flow screen 19 (Activation).
 *
 * The confirmation step immediately before Activation Success. Confirming here
 * advances to Activation Success (screen 20) in the fixed 20-screen order — no
 * reorder or insert (Req 8.7, 5.1, 5.2). Account activation itself is performed
 * on screen 20 via the `activateAccount()` store action (task 12.2), so this
 * screen does NOT set `activationStatus`; it only advances the flow. It triggers
 * no Mock_Service operation.
 *
 * CONTENT — BLOCKED (Req 18.1, 20.4): No authoritative source copy / screenshot
 * for the Activation screen exists in the workspace. The heading and button
 * label use MINIMAL FUNCTIONAL WORDING pending the higher-precedence source and
 * are flagged BLOCKED in the batch report — EXCEPT the activation CTA label,
 * which is the locked "Activate My Credit Line". No copy is fabricated.
 *
 * Requirements: 8.7, 5.1, 5.2, 20.1, 20.2, 20.4.
 * Design: Navigation Architecture, Conflicts & Ambiguities (screen content
 * source of truth).
 */
import { useRef, useState } from "react";
import {
  CardVisual,
  LoadingState,
  PrimaryButton,
} from "../../../design-system/components";
import styles from "./onboarding.module.css";
import phase6 from "./phase6.module.css";

/** Restrained hold on the activation processing state before Success (screen 20). */
const ACTIVATION_PROCESSING_MS = 1400;

export interface ActivationScreenProps {
  /** Invoked on confirm, to advance to the Activation Success screen (20). */
  onAdvance: () => void;
}

export function ActivationScreen({ onAdvance }: ActivationScreenProps) {
  const [activating, setActivating] = useState(false);
  const startedRef = useRef(false);

  const handleActivate = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setActivating(true);
    // Restrained processing moment so activation feels meaningful, then advance
    // to the Activation Success screen (which performs the actual activation).
    window.setTimeout(onAdvance, ACTIVATION_PROCESSING_MS);
  };

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Activation"
    >
      {activating ? (
        <div className={phase6.activatingBlock}>
          <h1 className={`text-subheading ${phase6.activatingTitle}`}>
            Activating your LienPay credit line
          </h1>
          <LoadingState large label="This will only take a moment" />
        </div>
      ) : (
        <>
          <header className={styles.header}>
            <p className={styles.eyebrow}>You&rsquo;re all set</p>
            <h1 className={`text-heading ${styles.heading}`}>
              Your credit line is almost ready
            </h1>
            <p className={styles.subtext}>
              Confirm to activate your LienPay credit line and start using it.
            </p>
          </header>

          {/* Premium activation hero — the milestone the user is unlocking. */}
          <CardVisual
            size="md"
            caption="Built for flexibility. Designed for your everyday."
          />

          <div className={styles.actions}>
            {/* Locked CTA label — must remain "Activate My Credit Line". */}
            <PrimaryButton fullWidth onClick={handleActivate}>
              Activate My Credit Line
            </PrimaryButton>
          </div>
        </>
      )}
    </section>
  );
}
