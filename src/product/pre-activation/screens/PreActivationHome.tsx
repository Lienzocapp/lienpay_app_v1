/**
 * PreActivationHome — the pre-activation dashboard (screen 6).
 *
 * Rebuilt against the design reference
 * (docs/Design/References/Original/Pre-activation/Pre-activation home.jpeg):
 *  - personalised header (avatar + time-of-day greeting + welcome line + bell);
 *  - a rotating value-proposition hero card with a "See how it works" action
 *    and carousel dots;
 *  - the credit-line card: "Credit Line Against Your Mutual Funds", the
 *    advertised credit RANGE (the user's own limit is unknown until they check),
 *    the primary "Check My Limit" CTA, the effort/no-commitment microcopy, and a
 *    secondary "Already know your limit? Continue activation" link;
 *  - three product-fact tiles (30 days interest-free / investments stay
 *    invested / instant UPI payments);
 *  - the "Use it for everyday needs" category strip.
 *
 * On mount it marks the `preActivationHome` onboarding step complete so the
 * read-only resume resolver continues into the Check-My-Limit journey when the
 * CTA is pressed — the sequence continues, it never restarts (Req 22.10;
 * Design: Onboarding Resume Logic). This triggers no Mock_Service operation.
 *
 * All figures come from the central mock dataset (never hard-coded in JSX) and
 * the user's name comes from central session state (Req 19.4, 20.4).
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../../../animation/product";
import { VISUALS } from "../../../design-system/assets/visuals";
import { ELIGIBILITY_DATA } from "../../../mock/data/eligibility";
import { ROUTES } from "../../../navigation/navConfig";
import { resolveResumeStep } from "../../../state/resumeResolver";
import { useLienPayStore } from "../../../state/store";
import { ActivateAccountCTA } from "../ActivateAccountCTA";
import { PreActivationHeader } from "../PreActivationHeader";
import { stepRoutePath } from "../onboardingSteps";
import {
  ArrowRightIcon,
  BoltIcon,
  Calendar30Icon,
  PieIcon,
  ShieldCheckIcon,
} from "../preIcons";
import styles from "../preActivation.module.css";

/**
 * The potential credit figure reused by Benefits, sourced from the single
 * central eligibility dataset.
 */
export const PRE_ACTIVATION_HOME_CREDIT_FIGURE =
  ELIGIBILITY_DATA.eligibleCreditLimit;

/**
 * Rotating hero slides. The copy is the documented product value proposition
 * (credit against eligible mutual funds without redeeming them, for everyday
 * needs) — no financial claims are invented (Req 20.4).
 */
const HERO_SLIDES = [
  {
    title: "Plans don't always wait.",
    body: "Travel, bills or everyday expenses. Keep flexibility close.",
  },
  {
    title: "Stay invested.",
    body: "Unlock credit against eligible mutual funds without redeeming them.",
  },
  {
    title: "Spend where it matters.",
    body: "Use your credit line for eligible everyday merchant payments.",
  },
  {
    title: "Only what you need.",
    body: "Choose the funds you pledge and the limit you actually want.",
  },
] as const;

/** The three product-fact tiles from the reference. */
const FACT_TILES = [
  { id: "interest-free", icon: <Calendar30Icon />, lines: ["30 Days", "Interest Free"] },
  { id: "invested", icon: <PieIcon />, lines: ["Investments", "Stay Invested"] },
  { id: "upi", icon: <BoltIcon />, lines: ["Instant", "UPI Payments"] },
] as const;

/** The everyday-needs categories with 3D photo-style icons. */
const EVERYDAY_CATEGORIES = [
  { id: "food", label: "Food", image: VISUALS.categoryFood },
  { id: "fuel", label: "Fuel", image: VISUALS.categoryFuel },
  { id: "grocery", label: "Grocery", image: VISUALS.categoryGrocery },
  { id: "travel", label: "Travel", image: VISUALS.categoryTravel },
  { id: "medical", label: "Medical", image: VISUALS.categoryMedical },
] as const;

export function PreActivationHome() {
  const navigate = useNavigate();
  const completeOnboardingStep = useLienPayStore(
    (s) => s.completeOnboardingStep
  );
  const [slide, setSlide] = useState(0);

  // Screen 6 reached: mark it complete so the resolver continues into the
  // Check-My-Limit journey (Req 22.10). Pure status update, no mock op.
  // We also mark all preceding steps complete so that a page refresh (which resets
  // the in-memory Zustand store) doesn't bounce the user back to the splash screen.
  useEffect(() => {
    const precedingSteps = [
      "splash",
      "mobileVerification",
      "otpVerification",
      "nameSetup",
      "welcome",
      "preActivationHome",
    ] as const;
    precedingSteps.forEach((step) => completeOnboardingStep(step));
  }, [completeOnboardingStep]);

  const hero = HERO_SLIDES[slide];

  /** Resumes the documented flow at the next incomplete step (read-only). */
  const continueActivation = () => {
    navigate(stepRoutePath(resolveResumeStep(useLienPayStore.getState())));
  };

  return (
    <motion.section
      className={styles.screen}
      aria-label="Home"
      variants={staggerContainer()}
      initial="initial"
      animate="animate"
    >
      <PreActivationHeader />

      {/* Rotating value-proposition hero. */}
      <motion.section
        className={styles.heroSlide}
        aria-label="How LienPay helps"
        variants={staggerItem()}
      >
        {/* Reference hero artwork sits behind the copy on the right, with a
            scrim so the text keeps its contrast. Decorative. */}
        <img
          className={styles.heroSlideArt}
          src={VISUALS.heroPlans}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
        <div className={styles.heroSlideBody}>
          <h2 className={styles.heroSlideTitle}>{hero.title}</h2>
          <p className={styles.heroSlideText}>{hero.body}</p>
          <button
            type="button"
            className={styles.heroSlideCta}
            onClick={() => navigate(ROUTES.pre.learn)}
          >
            See how it works
            <span className={styles.heroSlideCtaIcon} aria-hidden="true">
              <ArrowRightIcon />
            </span>
          </button>
        </div>
        <ul className={styles.heroDots} aria-label="Hero slides">
          {HERO_SLIDES.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                className={i === slide ? styles.heroDotOn : styles.heroDot}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === slide || undefined}
                onClick={() => setSlide(i)}
              />
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Credit-line card — the advertised range + the primary CTA. */}
      <motion.section
        className={styles.limitCard}
        aria-label="Credit line against your mutual funds"
        variants={staggerItem()}
      >
        <p className={styles.limitCardHead}>
          <span className={styles.limitCardHeadIcon} aria-hidden="true">
            <ShieldCheckIcon />
          </span>
          Credit Line Against Your Mutual Funds
        </p>

        <p className={styles.limitRange}>
          <span>{ELIGIBILITY_DATA.creditRangeLow}</span>
          <span className={styles.limitRangeDash}>to</span>
          <span>{ELIGIBILITY_DATA.creditRangeHigh}</span>
        </p>
        <p className={styles.limitRangeNote}>
          Credit lines available based on your portfolio
        </p>

        <ActivateAccountCTA className={styles.limitCta} />

        <p className={styles.limitEffort}>
          Takes ~30 seconds &middot; No commitment
        </p>

        <button
          type="button"
          className={styles.limitResume}
          onClick={continueActivation}
        >
          Already know your limit? Continue activation
          <span className={styles.limitResumeIcon} aria-hidden="true">
            <ArrowRightIcon />
          </span>
        </button>
      </motion.section>

      {/* Product-fact tiles. */}
      <motion.ul className={styles.factRow} variants={staggerItem()}>
        {FACT_TILES.map((tile) => (
          <li key={tile.id} className={styles.factTile}>
            <span className={styles.factIcon} aria-hidden="true">
              {tile.icon}
            </span>
            <span className={styles.factText}>
              {tile.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          </li>
        ))}
      </motion.ul>

      {/* Everyday-needs categories. */}
      <motion.section className={styles.everyday} variants={staggerItem()}>
        <h2 className={styles.everydayTitle}>Use it for everyday needs</h2>
        <ul className={styles.everydayRow}>
          {EVERYDAY_CATEGORIES.map((cat) => (
            <li key={cat.id} className={styles.everydayTile}>
              <span className={styles.everydayIcon} aria-hidden="true">
                <img
                  className={styles.everydayPhoto}
                  src={cat.image}
                  alt=""
                  decoding="async"
                />
              </span>
              <span className={styles.everydayLabel}>{cat.label}</span>
            </li>
          ))}
        </ul>
      </motion.section>
    </motion.section>
  );
}
