/**
 * ActivationSuccessScreen — the Activated screen (terminal onboarding step).
 *
 * Reached directly after e-sign with no intermediate confirmation screen. On
 * mount it calls the centralized `activateAccount()` store action, which sets
 * `activationStatus = "active"` and terminates the Pre_Activation_Flow (there
 * is no further onboarding screen). Setting `active` is the single trigger for
 * the navigation swap from Pre_Activation_Nav to the Active_Account
 * Bottom_Navigation (Req 8.7, 5.6, 22.14, 19.8).
 *
 * Screen content (Req 8.7):
 *  - Eyebrow: "Activated"
 *  - Heading: "Your LienPay credit line is ready"
 *  - Hero: Available credit (dominant figure, from state)
 *  - Metrics: Approved credit limit + current LTV (from state)
 *  - CTA: "Continue to Home" — enters Active_Account_Experience at /app/active/home
 *
 * A single `onComplete` callback is invoked by the CTA; the host routes to
 * `/app/active/home`. The OnboardingHost keeps this screen mounted while active
 * (only redirecting the OTHER pre-activation routes to Active Home) so the
 * success confirmation is visible before entering the active experience.
 *
 * Requirements: 8.7, 5.6, 22.14, 19.8, 20.1, 20.2.
 * Design: Active-account transition (nav swap), Financial State Updates.
 */
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  FinancialCard,
  MetricCard,
  PrimaryButton,
} from "../../../design-system/components";
import { prefersReducedMotion } from "../../../animation/contracts";
import { PRODUCT_EASE } from "../../../animation/product";
import { useLienPayStore } from "../../../state/store";
import { CardVisual } from "../../../design-system/components";
import styles from "./onboarding.module.css";
import phase6 from "./phase6.module.css";

export interface ActivationSuccessScreenProps {
  /** Enters the Active_Account_Experience at `/app/active/home`. */
  onComplete: () => void;
}

export function ActivationSuccessScreen({
  onComplete,
}: ActivationSuccessScreenProps) {
  const activateAccount = useLienPayStore((s) => s.activateAccount);
  // Mandated figures read verbatim from central state (never recomputed).
  const availableCredit = useLienPayStore((s) => s.availableCredit);
  const creditLimit = useLienPayStore((s) => s.creditLimit);
  const ltv = useLienPayStore((s) => s.ltv);

  // Completing this screen activates the account (single nav-swap trigger).
  useEffect(() => {
    activateAccount();
  }, [activateAccount]);

  // Restrained badge reveal (no confetti); collapses under reduced motion.
  const reduced = prefersReducedMotion();
  const badgeMotion = reduced
    ? {}
    : {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.45, ease: PRODUCT_EASE },
      };

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Activation Success"
    >
      <div className={phase6.milestone} role="status" aria-live="polite">
        <motion.span className={phase6.milestoneBadge} aria-hidden="true" {...badgeMotion}>
          ✓
        </motion.span>

        <p className={phase6.milestoneEyebrow}>Activated</p>
        <h1 className={`text-heading ${phase6.milestoneTitle}`}>
          Your LienPay credit line is ready
        </h1>

        {/* Premium milestone visual — the card-ready moment. */}
        <CardVisual
          size="md"
          caption="Your eligible investments stay invested."
        />

        {/* Hero: Available_Credit — the dominant figure, driven from state. */}
        <div className={phase6.milestoneHero}>
          <FinancialCard hero label="Available credit" value={availableCredit} />
        </div>

        <div className={phase6.milestoneMetrics}>
          <MetricCard label="Credit limit" value={creditLimit} />
          <MetricCard label="Current LTV" value={ltv} />
        </div>
      </div>

      <div className={phase6.milestoneActions}>
        <PrimaryButton fullWidth onClick={onComplete}>
          Continue to Home
        </PrimaryButton>
      </div>
    </section>
  );
}
