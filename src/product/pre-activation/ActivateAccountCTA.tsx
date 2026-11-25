/**
 * ActivateAccountCTA — the Activate_Account_CTA UI action (tasks 7.4, 7.5).
 *
 * Rendered on the Pre-Activation Home screen (screen 6) as the primary
 * call-to-action for starting or continuing activation while the account is not
 * yet active (Req 22.1). It is a UI ACTION, not a navigation item, tab, or new
 * screen (Req 22.6): on press it invokes the pure, read-only `resolveResumeStep`
 * and navigates to the resolved existing screen in the fixed 20-step order
 * (Req 22.8, 22.10, 22.11) — it never creates, reorders, or inserts a screen
 * (Req 22.9) and never itself triggers a Mock_Service operation.
 *
 * Presentation: reuses the shared `PrimaryButton` primitive, so the CTA uses the
 * Primary Neon Green token `#B6FF00` background with near-black `#050505` text,
 * rounded premium styling, a >= 44px touch target, and only the seven Design_
 * System tokens (Req 22.3, 22.4, 22.5). A subtle press/hover micro-interaction
 * is applied via the shared product `microInteraction` utility, within the
 * Req 16.4 limits and honoring reduced motion; no excessive glow is applied
 * (Req 22.5).
 *
 * Async safety (Req 22, 6, 7, 8, 13.5):
 *  - Disabled while any blocking Mock_Service operation runs, via
 *    `selectActivateCtaDisabled` (reads `session.asyncInFlight` + in-progress
 *    blocking steps). While disabled the press is a no-op.
 *  - Idempotent: a transient in-flight ref makes the press guard against
 *    duplicate/concurrent invocations, so a rapid double-tap can never launch
 *    two navigations.
 *  - Hidden entirely when `activationStatus === "active"` (Req 22.13).
 *
 * The label defaults to "Check My Limit" (LienPay_Beta_Flow_Design_Changes_v2:
 * the pre-activation dashboard action is "Check My Limit", which starts the
 * limit-check journey; "Activate Credit Line" is not shown until an eligible
 * limit is available). On press the CTA still resolves the next incomplete step
 * via the read-only resolver — which is now the first Check-My-Limit step (PAN
 * Verification) for a session completed through Home.
 *
 * Requirements: 22.1–22.8, 22.10–22.13, 20.1, 20.2, 20.4, 13.5, 16.4.
 * Design: Onboarding Resume Logic (CTA call path), Activate_Account_CTA async
 * safety, Responsive Architecture.
 */
import { useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../design-system/components";
import { microInteraction } from "../../animation/product";
import { useLienPayStore } from "../../state/store";
import { resolveResumeStep } from "../../state/resumeResolver";
import { selectActivateCtaDisabled } from "../../state/selectors";
import { stepRoutePath } from "./onboardingSteps";
import styles from "./preActivation.module.css";

/**
 * The pre-activation dashboard CTA label. Per the beta flow doc, the action
 * presented before the user has checked their limit is "Check My Limit" — it
 * starts the eligibility (limit-check) journey. "Activate Credit Line" is only
 * shown later, once an eligible limit is available. This is the single, central
 * label constant (never hard-coded per screen).
 */
export const CHECK_MY_LIMIT_LABEL = "Check My Limit";

/**
 * @deprecated Legacy alias; use {@link CHECK_MY_LIMIT_LABEL}. Retained so any
 * external import keeps resolving. The pre-activation CTA now reads "Check My
 * Limit" (the real activation action lives deeper in the flow, on the
 * Activation screen).
 */
export const ACTIVATE_CTA_LABEL = CHECK_MY_LIMIT_LABEL;

export interface ActivateAccountCTAProps {
  /** Label override; defaults to {@link CHECK_MY_LIMIT_LABEL}. */
  label?: string;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function ActivateAccountCTA({
  label = CHECK_MY_LIMIT_LABEL,
  className,
}: ActivateAccountCTAProps) {
  const navigate = useNavigate();
  const activationStatus = useLienPayStore((s) => s.activationStatus);
  const disabled = useLienPayStore(selectActivateCtaDisabled);

  // Transient in-flight guard: makes the press idempotent so a rapid double-tap
  // or concurrent trigger can never launch two navigations (Design: async
  // safety). Local to the action; it triggers no Mock_Service operation.
  const inFlightRef = useRef(false);

  // Hidden once the account is active (Req 22.13).
  if (activationStatus === "active") {
    return null;
  }

  const handlePress = () => {
    // Ignore the press while a blocking op runs (disabled) or when the action
    // is already in flight — this makes a rapid double-tap idempotent: the CTA
    // navigates away on the first press, so the guard is a one-shot per mount
    // and a second concurrent tap can never launch a second navigation.
    if (disabled || inFlightRef.current) {
      return;
    }
    inFlightRef.current = true;
    // READ-ONLY resolve of the next incomplete step, then navigate to that
    // existing screen (Req 22.8, 22.10, 22.11). No mutation, no mock op.
    const step = resolveResumeStep(useLienPayStore.getState());
    navigate(stepRoutePath(step));
  };

  const classes = [styles.ctaWrap, className].filter(Boolean).join(" ");

  return (
    <motion.div className={classes} {...microInteraction()}>
      <PrimaryButton
        fullWidth
        disabled={disabled}
        onClick={handlePress}
        data-testid="activate-account-cta"
      >
        {label}
      </PrimaryButton>
    </motion.div>
  );
}
