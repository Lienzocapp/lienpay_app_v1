/**
 * SplashScreen — Pre_Activation_Flow screen 1 (Splash).
 *
 * Near-black base (Background token) with a subtle green glow motif behind a
 * centered "LP" monogram and the "LienPay" wordmark. Per Req 6.1 the Splash is
 * displayed for a duration between 1 and 3 seconds, then auto-advances to
 * Mobile Verification (screen 2). On mount it marks the splash step complete in
 * the centralized Application_State (Req 5.2).
 *
 * Content reproduced from the LienPay — Product Flow Map (screen 01): the LP
 * monogram + "LienPay" wordmark. The tagline line under the wordmark is NOT
 * legible in the source and is intentionally NOT invented (see Content gaps).
 *
 * Requirements: 6.1 (1–3s display then advance), 5.2.
 * Design: Screen Flow, Components and Interfaces (AppShell), Onboarding.
 */
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLienPayStore } from "../../../state/store";
import { PRODUCT_EASE } from "../../../animation/product";
import { prefersReducedMotion } from "../../../animation/contracts";
import styles from "./onboarding.module.css";

/**
 * Splash display duration in ms, within the mandated 1–3s window (Req 6.1).
 * Exposed so timing behavior is a single named constant.
 */
export const SPLASH_DURATION_MS = 2600;

export interface SplashScreenProps {
  /** Invoked when the splash auto-advances to Mobile Verification. */
  onAdvance: () => void;
  /** Display duration override (ms); defaults to {@link SPLASH_DURATION_MS}. */
  durationMs?: number;
}

export function SplashScreen({
  onAdvance,
  durationMs = SPLASH_DURATION_MS,
}: SplashScreenProps) {
  const completeOnboardingStep = useLienPayStore(
    (s) => s.completeOnboardingStep
  );

  useEffect(() => {
    completeOnboardingStep("splash");
    const timer = window.setTimeout(onAdvance, durationMs);
    return () => window.clearTimeout(timer);
  }, [completeOnboardingStep, onAdvance, durationMs]);

  // Restrained, staged brand reveal (ease-based only, no bounce). Collapses to
  // the final state immediately under reduced motion (Req 16.5, 16.6).
  const reduced = prefersReducedMotion();
  const enter = (delay: number) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: PRODUCT_EASE, delay },
        };

  return (
    <section
      className={`${styles.screen} ${styles.splash}`}
      aria-label="LienPay"
    >
      <span className={styles.splashGlow} aria-hidden="true" />
      <motion.span className={styles.logoMark} aria-hidden="true" {...enter(0)}>
        <span className={styles.logoShine} aria-hidden="true" />
        LP
      </motion.span>
      <motion.h1 className={`text-display ${styles.wordmark}`} {...enter(0.15)}>
        LienPay
      </motion.h1>
      <motion.p className={styles.tagline} {...enter(0.28)}>
        Secure · Simple · Trusted
      </motion.p>
    </section>
  );
}
