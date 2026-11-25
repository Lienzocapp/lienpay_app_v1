/**
 * OnboardingHost — the Pre_Activation_Flow host for the flow-context screens.
 *
 * Mounted at `/app/pre/onboarding/:step` (the flow-context path from the
 * centralized nav config, Design: Navigation Architecture). It reads the
 * `:step` route param and renders the matching Pre_Activation_Flow screen inside
 * the centered phone-like `AppShell`, stepping through the locked order Splash →
 * Mobile Verification → OTP Verification → Name Setup → Welcome (Req 5.1, 5.3).
 * Advancing out of Welcome (screen 5) continues to Pre-Activation Home (screen
 * 6), which is the Home tab at `/app/pre/home` — routing is resolved through the
 * centralized `stepRoutePath` so screen 6 goes to its namespaced route rather
 * than a flow-context path (Design: Pre-Activation route table).
 *
 * A `ProgressStepper` shows the current screen position as a number 1..N within
 * the flow (Req 5.4, task 7.8). All flow screens are built (Splash → Activation
 * Success). Completing Activation Success calls `activateAccount()` and routes
 * to the Active_Account experience at `/app/active/home` (the nav swap). An
 * out-of-flow id (`pre-activation-home`) redirects to the Home tab; an invalid
 * id restarts at Splash. Once the account is active, every flow-context route
 * except Activation Success redirects to Active Home (Req 10.8, 22.15).
 *
 * Step transitions use the shared restrained product motion utility
 * (`screenTransition`) and honor reduced motion via the shared gate (Req 16.2,
 * 16.6). Native scrolling only (Req 17.6). The host adds NO bottom navigation.
 *
 * Requirements: 5.1, 5.3, 5.4, 6.1–6.6, 16.2, 16.6.
 * Design: Navigation Architecture, Animation Architecture (product utilities),
 * Components and Interfaces (ProgressStepper).
 */
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../../design-system/components";
import { screenTransition } from "../../../animation/product";
import { ROUTES } from "../../../navigation/navConfig";
import type { StepId } from "../../../state/resumeResolver";
import {
  isStepId,
  nextStep,
  prevStep,
  onboardingStepPath,
  stepRoutePath,
} from "../onboardingSteps";
import { GlowField } from "./GlowField";
import { SplashScreen } from "./SplashScreen";
import { MobileVerificationScreen } from "./MobileVerificationScreen";
import { OtpVerificationScreen } from "./OtpVerificationScreen";
import { NameSetupScreen } from "./NameSetupScreen";
import { WelcomeScreen } from "./WelcomeScreen";
import { PanProcessingScreen, PanVerificationScreen } from "./PanScreens";
import { MfConnectionScreen, MfConsentScreen } from "./MutualFundScreens";
import {
  FetchingInvestmentsScreen,
  PortfolioFoundScreen,
} from "./InvestmentDiscoveryScreens";
import {
  CreditLimitResultScreen,
  EligibilityCalculationScreen,
} from "./EligibilityScreens";
import { FundSelectionScreen } from "./FundSelectionScreen";
import { PledgeConsentScreen } from "./PledgeConsentScreen";
import { PledgeProcessingScreen } from "./PledgeProcessingScreen";
import {
  AadhaarVerificationScreen,
  KycScreen,
  SelfieVerificationScreen,
} from "./VerificationScreens";
import { BankAccountScreen } from "./BankAccountScreen";
import { AutoDebitMandateScreen } from "./AutoDebitMandateScreen";
import { AgreementScreen } from "./AgreementScreen";
import { ESignScreen } from "./ESignScreen";
import { BankReviewScreen } from "./BankReviewScreen";
import { ActivationSuccessScreen } from "./ActivationSuccessScreen";
import { useLienPayStore } from "../../../state/store";
import styles from "./onboarding.module.css";



export default function OnboardingHost() {
  const { step } = useParams();
  const navigate = useNavigate();
  const activationStatus = useLienPayStore((s) => s.activationStatus);

  // Nav swap (Req 10.8, 22.15): once the account is active, the Pre_Activation
  // flow is terminated — every flow-context route redirects to Active Home,
  // EXCEPT the Activation Success screen (20) itself, which stays mounted so its
  // success confirmation is visible before the user enters the active
  // experience (Design: Active-account transition).
  if (activationStatus === "active" && step !== "activation-success") {
    return <Navigate to={ROUTES.active.home} replace />;
  }

  // Pre-Activation Home (screen 6) is the Home tab, not a flow-context screen:
  // send it to its namespaced route (Design: Pre-Activation route table).
  if (step === "pre-activation-home") {
    return <Navigate to={ROUTES.pre.home} replace />;
  }

  // A valid step id beyond Welcome (screens 7–20) is not built in this batch:
  // render a minimal placeholder so the flow stays reachable and non-crashing.
  const isValidStep = isStepId(step);

  // An unknown/invalid step id restarts the flow at Splash (Req 5.10 spirit).
  if (!isValidStep) {
    return <Navigate to={onboardingStepPath("splash")} replace />;
  }

  const currentStep = step as StepId;

  const advanceFrom = (current: StepId) => () => {
    // Advance to the next screen in the fixed order (Req 5.1, 5.3),
    // routing through the centralized path resolver so no order is duplicated
    // and screen 6 (Home tab) gets its namespaced route.
    const next = nextStep(current);
    if (next) {
      navigate(stepRoutePath(next));
    }
  };

  /**
   * Steps that must NOT show a back arrow:
   *  - splash: the flow entry point, nothing to go back to.
   *  - auto-processing screens: they advance themselves; a back tap during
   *    processing would create a confusing state.
   *  - activation-success: post-submission terminal screen — no backward
   *    navigation into editable application steps (Req 8, task 7).
   */
  const NO_BACK_STEPS = new Set<StepId>([
    "splash",
    "pan-processing",
    "fetching-investments",
    "eligibility-calculation",
    "pledge-processing",
    "bank-review",
    "activation-success",
  ]);

  const showBack = !NO_BACK_STEPS.has(currentStep);

  const handleBack = () => {
    let prev = prevStep(currentStep);

    // Skip processing screens (which auto-advance forward) and the skipped
    // fund-selection screen to prevent forward-bouncing loops when going back.
    while (
      prev !== null &&
      prev !== "splash" &&
      (NO_BACK_STEPS.has(prev) || prev === "fund-selection")
    ) {
      prev = prevStep(prev);
    }

    if (prev === null) return;
    // pre-activation-home is the Home tab — route to its namespaced path.
    navigate(stepRoutePath(prev));
  };

  const renderStep = () => {
    switch (currentStep) {
      case "splash":
        return <SplashScreen onAdvance={advanceFrom("splash")} />;
      case "mobile-verification":
        return (
          <MobileVerificationScreen
            onAdvance={advanceFrom("mobile-verification")}
          />
        );
      case "otp-verification":
        return (
          <OtpVerificationScreen onAdvance={advanceFrom("otp-verification")} />
        );
      case "name-setup":
        return <NameSetupScreen onAdvance={advanceFrom("name-setup")} />;
      case "welcome":
        return <WelcomeScreen onAdvance={advanceFrom("welcome")} />;
      case "pan-verification":
        return (
          <PanVerificationScreen
            onAdvance={advanceFrom("pan-verification")}
          />
        );
      case "pan-processing":
        return (
          <PanProcessingScreen onAdvance={advanceFrom("pan-processing")} />
        );
      case "mf-connection":
        return (
          <MfConnectionScreen onAdvance={advanceFrom("mf-connection")} />
        );
      case "mf-consent":
        return <MfConsentScreen onAdvance={advanceFrom("mf-consent")} />;
      case "fetching-investments":
        return (
          <FetchingInvestmentsScreen
            onAdvance={advanceFrom("fetching-investments")}
          />
        );
      case "portfolio-found":
        return (
          <PortfolioFoundScreen onAdvance={advanceFrom("portfolio-found")} />
        );
      case "eligibility-calculation":
        return (
          <EligibilityCalculationScreen
            onAdvance={advanceFrom("eligibility-calculation")}
          />
        );
      case "credit-limit-result":
        return (
          <CreditLimitResultScreen
            onAdvance={advanceFrom("credit-limit-result")}
          />
        );
      case "fund-selection":
        return (
          <FundSelectionScreen onAdvance={advanceFrom("fund-selection")} />
        );
      case "pledge-consent":
        return (
          <PledgeConsentScreen onAdvance={advanceFrom("pledge-consent")} />
        );
      case "pledge-processing":
        return (
          <PledgeProcessingScreen
            onAdvance={advanceFrom("pledge-processing")}
          />
        );
      case "kyc":
        return <KycScreen onAdvance={advanceFrom("kyc")} />;
      case "aadhaar-verification":
        return (
          <AadhaarVerificationScreen
            onAdvance={advanceFrom("aadhaar-verification")}
          />
        );
      case "selfie-verification":
        return (
          <SelfieVerificationScreen
            onAdvance={advanceFrom("selfie-verification")}
          />
        );
      case "bank-account":
        return <BankAccountScreen onAdvance={advanceFrom("bank-account")} />;
      case "auto-debit-mandate":
        return (
          <AutoDebitMandateScreen
            onAdvance={advanceFrom("auto-debit-mandate")}
          />
        );
      case "agreement":
        return <AgreementScreen onAdvance={advanceFrom("agreement")} />;
      case "e-sign":
        return <ESignScreen onAdvance={advanceFrom("e-sign")} />;
      case "bank-review":
        return <BankReviewScreen onAdvance={advanceFrom("bank-review")} />;
      case "activation-success":
        // Terminal screen: activates the account and enters the Active_Account
        // experience at /app/active/home (the nav swap target).
        return (
          <ActivationSuccessScreen
            onComplete={() => navigate(ROUTES.active.home)}
          />
        );
      default:
        // All flow screens are now built; an unexpected id renders a minimal,
        // non-crashing placeholder (no invented content).
        return (
          <section
            className={`${styles.screen} ${styles.placeholder}`}
            aria-label={currentStep}
            data-placeholder={currentStep}
          />
        );
    }
  };

  // The Splash (screen 1) is a full-bleed brand moment — no progress stepper,
  // matching the reference.
  const showStepper = currentStep !== "splash";

  return (
    <AppShell contentLabel="LienPay onboarding">
      <div className={styles.onboardingCanvas}>
        <GlowField />
        <div className={styles.onboardingContent}>
          {showStepper ? (
            showBack ? (
              /* Back-arrow variant: 3-column grid keeps wordmark centred. */
              <div className={styles.obBrandBarWithBack}>
                <button
                  type="button"
                  className={styles.obBackBtn}
                  aria-label="Go back"
                  onClick={handleBack}
                >
                  {/* Chevron-left SVG — 22×22, stroked with currentColor. */}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12.5 15L7.5 10L12.5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className={styles.obBrandBarWordmark}>
                  <span className={styles.obBrandWord}>
                    LienPay
                    <span className={styles.obBrandDot} aria-hidden="true">
                      .
                    </span>
                  </span>
                </div>
                <span className={styles.obBrandChip} aria-hidden="true">
                  <span className={styles.obBrandChipShine} aria-hidden="true" />
                  LP
                </span>
              </div>
            ) : (
              /* Standard brand bar (no back arrow). */
              <div className={styles.obBrandBar}>
                <span className={styles.obBrandWord}>
                  LienPay
                  <span className={styles.obBrandDot} aria-hidden="true">
                    .
                  </span>
                </span>
                <span className={styles.obBrandChip} aria-hidden="true">
                  <span className={styles.obBrandChipShine} aria-hidden="true" />
                  LP
                </span>
              </div>
            )
          ) : null}
          {/*
           * No global "Step X of N" indicator: exposing the raw flow length made
           * the journey feel long and administrative, and the count is not part
           * of the design references. Individual screens still carry their own
           * contextual progress (e.g. the process timelines during verification).
           */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              variants={screenTransition()}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
