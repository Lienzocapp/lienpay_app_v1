/**
 * BenefitsScreen — the pre-activation Benefits tab.
 *
 * Rebuilt against the design reference
 * (docs/Design/References/Original/Pre-activation/Benefits.jpeg):
 *  - shared personalised header;
 *  - "Benefits" screen title;
 *  - the hero card: "Let your investments support your plans", the
 *    mutual-fund-value → potential-credit-line conversion pair, and the
 *    "You stay invested. We unlock the value." reassurance pill;
 *  - three benefit rows (stay invested / month-end gaps / plans change), each
 *    opening the Learn section for the detail behind it;
 *  - the "Ways people use it" category strip;
 *  - the primary "Check My Limit" CTA with its effort microcopy.
 *
 * Every figure is read from the single central eligibility dataset — no values
 * are hard-coded in JSX and none are invented (Req 12.5, 19.3, 20.4).
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../../../animation/product";
import { VISUALS } from "../../../design-system/assets/visuals";
import { ELIGIBILITY_DATA } from "../../../mock/data/eligibility";
import { ROUTES } from "../../../navigation/navConfig";
import { ActivateAccountCTA } from "../ActivateAccountCTA";
import { PreActivationHeader } from "../PreActivationHeader";
import {
  ArrowRightIcon,
  BarsIcon,
  BriefcaseIcon,
  Calendar30Icon,
  ChevronRightIcon,
  ShieldCheckIcon,
  StarIcon,
} from "../preIcons";
import styles from "../preActivation.module.css";

/** The three documented benefit rows from the reference. */
const BENEFIT_ROWS = [
  {
    id: "stay-invested",
    icon: <BarsIcon />,
    title: "Stay invested for your goals",
    text: "No need to redeem mutual funds.",
  },
  {
    id: "month-end",
    icon: <Calendar30Icon />,
    title: "Handle month-end gaps",
    text: "Cover regular spends before salary day.",
  },
  {
    id: "plans-change",
    icon: <BriefcaseIcon />,
    title: "Be ready when plans change",
    text: "Useful for travel, shopping, bills, or sudden needs.",
  },
] as const;

/** The "Ways people use it" categories with 3D photo-style icons. */
const WAYS = [
  { id: "food", label: "Food", image: VISUALS.categoryFood },
  { id: "bills", label: "Bills", image: VISUALS.categoryBills },
  { id: "travel", label: "Travel", image: VISUALS.categoryTravel },
  { id: "grocery", label: "Grocery", image: VISUALS.categoryGrocery },
  { id: "medical", label: "Medical", image: VISUALS.categoryMedical },
] as const;

export function BenefitsScreen() {
  const navigate = useNavigate();

  return (
    <motion.section
      className={styles.screen}
      aria-label="Benefits"
      variants={staggerContainer()}
      initial="initial"
      animate="animate"
    >
      <PreActivationHeader />

      <motion.h1 className={styles.screenTitle} variants={staggerItem()}>
        Benefits
      </motion.h1>

      {/* Hero — the value proposition + the conversion pair. */}
      <motion.section
        className={styles.bnHero}
        aria-label="Let your investments support your plans"
        variants={staggerItem()}
      >
        <div className={styles.bnHeroGlow} aria-hidden="true" />
        {/* Reference hero artwork (rising arrow + rupee coins). Decorative. */}
        <img
          className={styles.bnHeroArt}
          src={VISUALS.investments}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
        <span className={styles.bnHeroBadge} aria-hidden="true">
          <StarIcon />
        </span>

        <h2 className={styles.bnHeroTitle}>
          Let your investments
          <br />
          <span className={styles.bnHeroTitleAccent}>support your plans</span>
        </h2>
        <p className={styles.bnHeroText}>
          Stay invested and get flexibility for travel, bills, and everyday
          needs.
        </p>

        <div className={styles.bnConvert}>
          <div className={styles.bnConvertBox}>
            <span className={styles.bnConvertLabel}>Your mutual fund value</span>
            <span className={styles.bnConvertValue}>
              {ELIGIBILITY_DATA.portfolioValue}
            </span>
          </div>
          <span className={styles.bnConvertArrow} aria-hidden="true">
            <ArrowRightIcon />
          </span>
          <div className={styles.bnConvertBox}>
            <span className={styles.bnConvertLabel}>
              Potential credit line up to
            </span>
            <span className={styles.bnConvertValue}>
              {ELIGIBILITY_DATA.eligibleCreditLimit}
            </span>
          </div>
        </div>

        <p className={styles.bnHeroPill}>
          <span className={styles.bnHeroPillIcon} aria-hidden="true">
            <ShieldCheckIcon />
          </span>
          You stay invested. We unlock the value.
        </p>
      </motion.section>

      {/* Benefit rows — each opens the Learn section for the detail behind it. */}
      <motion.ul className={styles.bnRows} variants={staggerItem()}>
        {BENEFIT_ROWS.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              className={styles.bnRow}
              onClick={() => navigate(ROUTES.pre.learn)}
            >
              <span className={styles.bnRowIcon} aria-hidden="true">
                {row.icon}
              </span>
              <span className={styles.bnRowBody}>
                <span className={styles.bnRowTitle}>{row.title}</span>
                <span className={styles.bnRowText}>{row.text}</span>
              </span>
              <span className={styles.bnRowChevron} aria-hidden="true">
                <ChevronRightIcon />
              </span>
            </button>
          </li>
        ))}
      </motion.ul>

      {/* Ways people use it. */}
      <motion.section className={styles.everyday} variants={staggerItem()}>
        <h2 className={styles.everydayTitle}>Ways people use it</h2>
        <ul className={styles.everydayRow}>
          {WAYS.map((w) => (
            <li key={w.id} className={styles.everydayTile}>
              <span className={styles.everydayIcon} aria-hidden="true">
                <img
                  className={styles.everydayPhoto}
                  src={w.image}
                  alt=""
                  decoding="async"
                />
              </span>
              <span className={styles.everydayLabel}>{w.label}</span>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Primary CTA + effort microcopy (reference: "Step 1 of 2"). */}
      <motion.div className={styles.bnCtaBlock} variants={staggerItem()}>
        <ActivateAccountCTA className={styles.bnCta} />
        <p className={styles.bnCtaNote}>Step 1 of 2 &middot; Takes about 2 minutes</p>
      </motion.div>
    </motion.section>
  );
}
