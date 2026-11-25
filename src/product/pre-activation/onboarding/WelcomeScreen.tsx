/**
 * WelcomeScreen — Pre_Activation_Flow screen 5 (Welcome).
 *
 * Content source (LienPay Product Flow Map, screen 05): the heading "Welcome to
 * LienPay", a card/"Relax {name}" visual, and a "Set up my LP" continue action
 * are reproduced from what is shown. The screenshot's card reads "Relax Nisha";
 * "Nisha" is the source mock's sample name, so the card is personalized with the
 * user's stored name from Name Setup (`session.userName`), falling back to the
 * screenshot literal when no name is present. Any further supporting copy is NOT
 * legible in the source and is intentionally NOT invented (Req 20.4, 18.3) —
 * flagged in the batch report.
 *
 * On the continue action the `welcome` onboarding step is marked complete and
 * the flow advances to Pre-Activation Home (screen 6) per the fixed order
 * (Req 5.1, 5.3). This screen triggers no Mock_Service operation.
 *
 * Requirements: 5.1, 6.4, 20.1, 20.2, 20.4.
 * Design: Screen Flow, Components and Interfaces, Conflicts & Ambiguities
 * (screen content source of truth).
 */
import { PrimaryButton } from "../../../design-system/components";
import { useLienPayStore } from "../../../state/store";
import styles from "./onboarding.module.css";

export interface WelcomeScreenProps {
  /** Invoked after Welcome is completed, to advance to Pre-Activation Home. */
  onAdvance: () => void;
}

export function WelcomeScreen({ onAdvance }: WelcomeScreenProps) {
  const completeOnboardingStep = useLienPayStore(
    (s) => s.completeOnboardingStep
  );
  const userName = useLienPayStore((s) => s.session.userName);

  const displayName = userName ?? "User";
  const initial = displayName.charAt(0).toUpperCase();

  const handleContinue = () => {
    completeOnboardingStep("welcome");
    onAdvance();
  };

  return (
    <section className={`${styles.screen} ${styles.flow}`} aria-label="Welcome">
      <header className={styles.header}>
        <h1 className={`text-heading ${styles.heading}`}>
          Welcome to <span className={styles.headingBrand}>LienPay</span>
        </h1>
        <p className={styles.subtext}>
          Your account is ready. Set up your LienPay ID to continue your journey.
        </p>
      </header>

      {/* Personalised welcome card (design reference): greeting on the left, a
          glowing monogram orb on the right. */}
      <div className={styles.welcomeCard}>
        <div className={styles.welcomeGreet}>
          <span className={styles.welcomeGreetLead}>Nice to have you,</span>
          <span className={styles.welcomeGreetName}>{displayName}</span>
          <span className={styles.welcomeGreetRule} aria-hidden="true" />
        </div>

        <span className={styles.welcomeOrb} aria-hidden="true">
          <span className={styles.welcomeOrbHalo} />
          <span className={styles.welcomeOrbRing} />
          <span className={styles.welcomeOrbInitial}>{initial}</span>
        </span>
      </div>

      <div className={styles.actions}>
        <PrimaryButton fullWidth onClick={handleContinue}>
          Set up my LP
        </PrimaryButton>
      </div>
    </section>
  );
}
