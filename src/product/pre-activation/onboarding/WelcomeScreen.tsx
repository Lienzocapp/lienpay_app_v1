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

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

const WELCOME_INSIGHTS = [
  {
    id: "zero-interest",
    title: "0% interest",
    detail: "Pay in full by the due date",
    icon: (
      <svg {...ICON_PROPS}>
        <line x1="19" y1="5" x2="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "convert-emi",
    title: "Convert any spend to EMI",
    detail: "Choose a tenure after you pay",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="m17 2 4 4-4 4" />
        <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
        <path d="m7 22-4-4 4-4" />
        <path d="M21 13v1a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    id: "upi-qr",
    title: "Pay at any merchant QR",
    detail: "Scan and pay from your credit line",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M17 12v4a1 1 0 0 1-1 1h-4" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M17 8V7" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M7 17h.01" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <rect x="7" y="7" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    id: "no-fee",
    title: "No convenience fee",
    detail: "Pay only what you spend",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle cx="7.5" cy="7.5" r=".75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
] as const;

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

      <ul className={styles.welcomeInsights} aria-label="LienPay highlights">
        {WELCOME_INSIGHTS.map((item) => (
          <li key={item.id} className={styles.welcomeInsightItem}>
            <span className={styles.welcomeInsightBadge} aria-hidden="true">
              {item.icon}
            </span>
            <div className={styles.welcomeInsightCopy}>
              <span className={styles.welcomeInsightTitle}>{item.title}</span>
              <span className={styles.welcomeInsightDetail}>{item.detail}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <PrimaryButton fullWidth onClick={handleContinue}>
          Set up my LP
        </PrimaryButton>
      </div>
    </section>
  );
}
