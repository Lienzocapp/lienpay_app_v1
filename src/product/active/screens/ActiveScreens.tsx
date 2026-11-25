/**
 * Active_Account_Experience screens.
 *
 * Phase 7 (tasks 13.1/13.2) builds the FULL Active Home credit-position
 * dashboard here, driven entirely by centralized selectors so every figure is
 * reactive to Application_State (Req 11.1, 11.9, 19.4). The Transactions,
 * Repayments, and Portfolio tabs remain minimal, accessibility-labelled
 * placeholders this batch — their full content is Phase 8+ (tasks 14.x+). The
 * Profile / Notifications screens are Top_Bar destinations (not tabs) and are
 * likewise minimal placeholders until Phase 11 builds their content. The Pay
 * screen is a reachable-but-minimal landing target for the Home Pay entry point;
 * the Pay bottom-sheet flow itself is Phase 8 (task 14.3).
 *
 * Content source of truth: the "LienPay — Active Account Experience" screenshot
 * shows the Home dashboard (greeting/overview, a large credit figure, a
 * credit-health indicator, Available/limit figures, a "Pay Now" action, and a
 * recent-activity list). Per the no-fabrication rule (Req 20.4, 18.3):
 *  - ALL displayed figures are driven from the centralized store/selectors
 *    (Credit_Limit ₹2,21,000, Available_Credit ₹1,96,320, Used_Credit ₹24,680,
 *    LTV 34%, Credit_Health Healthy) so they stay consistent and reactive; no
 *    hero number is hardcoded.
 *  - Metric labels use the authoritative names from the requirements glossary
 *    (Credit_Limit, Available_Credit, Used_Credit, LTV, Credit_Health).
 *  - The exact greeting/overview microcopy is NOT legible/transcribed in the
 *    source, so a minimal functional heading is used and the exact copy is
 *    FLAGGED (see batch report) rather than invented.
 *  - The recent-activity list belongs to the Transactions experience (Req 11.2)
 *    and is deferred to Phase 8; it is intentionally NOT built on Home in this
 *    batch to avoid duplicating Phase 8 work.
 *
 * Requirements: 11.1, 11.9, 19.4, 20.1, 20.2, 20.4; 10.x (nav/Top_Bar handled
 * by the shell). Design: State Model, Data Flow, Navigation Architecture
 * (Active route table), Accessibility.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArcGauge, BrandAvatar, LinearProgress } from "../../../design-system/components";
import { staggerContainer, staggerItem } from "../../../animation/product";
import { brandLogoUrl } from "../brandLogos";
import { merchantCategory } from "../merchantCategory";
import { formatTxnDateTime } from "../txnDateTime";
import {
  CalendarIcon,
  ChevronRightIcon,
  GiftIcon,
  InfoIcon,
  ShieldIcon,
  TimerIcon,
  TrendIcon,
} from "./homeIcons";
import { ROUTES } from "../../../navigation/navConfig";
import { selectCreditPosition, selectTransactions } from "../../../state/selectors";
import { useLienPayStore } from "../../../state/store";
import styles from "./active.module.css";

/** How many recent transactions the Home "Recent activity" glance previews. */
const RECENT_ACTIVITY_COUNT = 3;

/*
 * Demo-only supporting values shown to match the reference mockup (approved as
 * demo values). PRESENTATIONAL only — they never alter the mandated credit
 * position figures held in central state (Credit_Limit / Available / Used / LTV
 * / Credit_Health / Amount due all still read from selectors below).
 */
const ACCOUNT_TYPE_DEMO = "Secured Credit Line";
const INTEREST_FREE_ENDS_DEMO = "Ends in 8 days";
const NEXT_DUE_DATE_DEMO = "Due on 14 Aug";
const NEXT_DUE_URGENCY_DEMO = "8 days left";
const INTEREST_FREE_TRACKER_AMOUNT = "₹8,300";
const INTEREST_FREE_TRACKER_UNTIL = "14 Aug";
const REWARDS_DEMO = "₹240";

/**
 * ActiveHome — the Active_Account Home dashboard (task 13.2).
 *
 * Renders the user's current credit position via centralized selectors and the
 * shared financial cards, plus a reachable "Pay Now" entry point that routes
 * toward the Pay experience (the Pay flow itself is Phase 8). Every figure is a
 * display-only read of Application_State, so a later simulated spend/payment
 * updates them automatically (Req 11.9, 11.11, 19.4). The large hero figure is
 * Available_Credit, driven from state (never a hardcoded number).
 */
export function ActiveHome() {
  const navigate = useNavigate();
  const { creditLimit, availableCredit, usedCredit, ltv, creditHealth } =
    useLienPayStore(selectCreditPosition);
  const userName = useLienPayStore((s) => s.session.userName);
  const transactions = useLienPayStore(selectTransactions);

  // Utilisation is a display derivation of the central credit position (Used /
  // Limit), not an invented value: it stays reactive to any simulated payment
  // that moves Used_Credit. Paise mirrors are used for the arithmetic only.
  const usedCreditPaise = useLienPayStore((s) => s.usedCreditPaise);
  const creditLimitPaise = useLienPayStore((s) => s.creditLimitPaise);
  const utilisation =
    creditLimitPaise > 0
      ? Math.round((usedCreditPaise / creditLimitPaise) * 100)
      : 0;
  const utilisationDisplay = `${utilisation}%`;

  const recent = transactions.slice(0, RECENT_ACTIVITY_COUNT);
  const amountDue = useLienPayStore((s) => s.repayments.amountDue);
  // Numeric LTV for the health gauge fill only (display still uses the `ltv`
  // string from state, character-for-character); never a fabricated figure.
  const ltvNumber = Number.parseInt(ltv, 10) || 0;

  return (
    <motion.section
      className={styles.home}
      aria-label="Home"
      variants={staggerContainer()}
      initial="initial"
      animate="animate"
    >
      {/* Greeting/context (reference: "Good morning …" + overview). */}
      <motion.header className={styles.greeting} variants={staggerItem()}>
        <p className={styles.greetingEyebrow}>
          {userName ? `Good morning, ${userName}` : "Good morning"}
        </p>
        <h1 className={styles.greetingTitle}>Here&rsquo;s your LienPay overview</h1>
      </motion.header>

      {/* PRIMARY CREDIT CARD — reference hierarchy: eyebrow → hero figure →
          "Used … of …" pill → linear utilisation bar → arc gauge → 3-column
          divided footer. Every figure is a display-only read of central state. */}
      <motion.section
        className={styles.heroCard}
        aria-label="Credit position"
        variants={staggerItem()}
      >
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroTop}>
          <div className={styles.heroFigureBlock}>
            <span className={styles.heroEyebrow}>Available to use</span>
            <span className={styles.heroFigure}>{availableCredit}</span>
            <button
              type="button"
              className={styles.usedPill}
              onClick={() => navigate(ROUTES.active.transactions)}
              aria-label="View credit usage"
            >
              <span className={styles.usedPillKey}>Used</span>
              <span className={styles.usedPillVal}>{usedCredit}</span>
              <span className={styles.usedPillOf}>of {creditLimit}</span>
              <span className={styles.usedPillChevron} aria-hidden="true">
                <ChevronRightIcon />
              </span>
            </button>
          </div>
          <ArcGauge
            value={utilisation}
            size={104}
            stroke={9}
            centerLabel={utilisationDisplay}
            centerCaption="of limit used"
            ariaLabel={`Credit utilisation ${utilisationDisplay}`}
          />
        </div>

        <LinearProgress
          className={styles.heroProgress}
          value={utilisation}
          startLabel="0"
          endLabel={creditLimit}
          ariaLabel={`Credit utilisation ${utilisationDisplay}`}
        />

        <div className={styles.heroFooter}>
          <div className={styles.heroFooterCol}>
            <span className={styles.heroFooterLabel}>Credit limit</span>
            <span className={styles.heroFooterValue}>{creditLimit}</span>
          </div>
          <div className={styles.heroFooterCol}>
            <span className={styles.heroFooterLabel}>Account type</span>
            <span className={styles.heroFooterValue}>{ACCOUNT_TYPE_DEMO}</span>
          </div>
          <div className={styles.heroFooterCol}>
            <span className={styles.heroFooterLabelRow}>
              <span className={styles.heroFooterLabel}>Interest-free</span>
              <span className={styles.heroInfoIcon} aria-hidden="true">
                <InfoIcon />
              </span>
            </span>
            <span className={styles.heroFooterAccent}>{INTEREST_FREE_ENDS_DEMO}</span>
          </div>
        </div>
      </motion.section>

      {/* NEXT PAYMENT — leading calendar icon, amount, due date + urgency
          (amber warning token), Repay Now + View Repayments (both functional). */}
      <motion.section
        className={styles.payCard}
        aria-label="Next payment"
        variants={staggerItem()}
      >
        <span className={styles.iconHolder} aria-hidden="true">
          <CalendarIcon />
        </span>
        <div className={styles.payCardMain}>
          <span className={styles.payCardLabel}>Next payment due</span>
          <span className={styles.payCardAmount}>{amountDue}</span>
          <span className={styles.payCardDue}>
            {NEXT_DUE_DATE_DEMO}
            <span className={styles.payCardDot} aria-hidden="true">
              ·
            </span>
            <span className={styles.payCardUrgent}>{NEXT_DUE_URGENCY_DEMO}</span>
          </span>
        </div>
        <div className={styles.payCardActions}>
          <button
            type="button"
            className={styles.repayPrimary}
            onClick={() => navigate(ROUTES.active.repayments)}
          >
            Repay Now
          </button>
          <button
            type="button"
            className={styles.repayGhost}
            onClick={() => navigate(ROUTES.active.repayments)}
          >
            View Repayments
          </button>
        </div>
      </motion.section>

      {/* CREDIT HEALTH — shield holder + status (from state) + Current LTV +
          an arc gauge. The health state derives from Application_State. */}
      <motion.section
        className={styles.healthCard}
        aria-label="Credit health"
        variants={staggerItem()}
      >
        <div className={styles.healthLead}>
          <span className={styles.iconHolder} aria-hidden="true">
            <ShieldIcon />
          </span>
          <div className={styles.healthLeadText}>
            <span className={styles.healthLabel}>Credit health</span>
            <span className={styles.healthStatus}>{creditHealth}</span>
            <span className={styles.healthSub}>Your line is safe</span>
          </div>
        </div>
        <div className={styles.healthLtv}>
          <span className={styles.healthLtvLabel}>Current LTV</span>
          <span className={styles.healthLtvValue}>{ltv}</span>
          <span className={styles.healthLtvSub}>Comfort zone: below 42%</span>
        </div>
        <div className={styles.healthGauge}>
          <ArcGauge
            value={ltvNumber}
            size={84}
            stroke={8}
            centerLabel="Safe"
            ariaLabel={`Credit health ${creditHealth}, current LTV ${ltv}`}
          />
          <span className={styles.healthGaugeCaption}>Well within limit</span>
        </div>
      </motion.section>

      {/* Recent activity — merchant logo, category, amount, interest-free tag,
          chevron. Uses central transaction data (no invented rows; Req 11.2). */}
      <motion.section
        className={styles.recent}
        aria-label="Recent activity"
        variants={staggerItem()}
      >
        <div className={styles.recentHeader}>
          <h2 className={styles.recentTitle}>Recent activity</h2>
          <button
            type="button"
            className={styles.viewAll}
            onClick={() => navigate(ROUTES.active.transactions)}
          >
            View all
            <span className={styles.viewAllChevron} aria-hidden="true">
              <ChevronRightIcon />
            </span>
          </button>
        </div>
        <ul className={styles.hActivityPanel}>
          {recent.map((t) => (
            <li key={t.id} className={styles.activityRow}>
              <BrandAvatar name={t.merchant} logoUrl={brandLogoUrl(t.merchant)} />
              <span className={styles.activityBody}>
                <span className={styles.activityMerchant}>{t.merchant}</span>
                <span className={styles.activityMeta}>
                  {merchantCategory(t.merchant)} &middot; {formatTxnDateTime(t.timestamp)}
                </span>
              </span>
              <span className={styles.hActivityTrailing}>
                <span className={styles.activityAmount}>{t.amount}</span>
                <span className={styles.hTag}>Interest-free</span>
              </span>
              <span className={styles.hChevron} aria-hidden="true">
                <ChevronRightIcon />
              </span>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Two support cards — Interest-free tracker + Rewards earned (demo copy). */}
      <motion.div className={styles.supportRow} variants={staggerItem()}>
        <div className={styles.supportCard}>
          <span className={styles.iconHolderSm} aria-hidden="true">
            <TimerIcon />
          </span>
          <span className={styles.supportLabel}>Interest-free tracker</span>
          <span className={styles.supportText}>
            <span className={styles.supportAccentInline}>
              {INTEREST_FREE_TRACKER_AMOUNT}
            </span>{" "}
            of your spends are interest-free until{" "}
            <span className={styles.supportAccentInline}>
              {INTEREST_FREE_TRACKER_UNTIL}
            </span>
          </span>
        </div>
        <div className={styles.supportCard}>
          <span
            className={`${styles.iconHolderSm} ${styles.iconHolderReward}`}
            aria-hidden="true"
          >
            <GiftIcon />
          </span>
          <span className={styles.supportLabel}>Rewards earned</span>
          <span className={styles.supportText}>
            You&rsquo;ve earned{" "}
            <span className={styles.supportAccentInline}>{REWARDS_DEMO}</span> this
            month
          </span>
        </div>
      </motion.div>

      {/* Increase available credit — wide card with a trend icon + Add Funds. */}
      <motion.section
        className={styles.boostCard}
        aria-label="Increase your available credit"
        variants={staggerItem()}
      >
        <span className={styles.iconHolder} aria-hidden="true">
          <TrendIcon />
        </span>
        <div className={styles.boostBody}>
          <span className={styles.boostTitle}>Increase your available credit</span>
          <span className={styles.boostText}>
            Add more eligible mutual funds to unlock higher limits.
          </span>
        </div>
        <button
          type="button"
          className={styles.boostCta}
          onClick={() => navigate(ROUTES.active.portfolio)}
        >
          Add Funds
          <span className={styles.boostCtaChevron} aria-hidden="true">
            <ChevronRightIcon />
          </span>
        </button>
      </motion.section>
    </motion.section>
  );
}

/**
 * Transactions screen (task 14.1) — authored once in `TransactionsScreen.tsx`
 * and re-exported here so the route wiring in `ProductEntry` stays stable.
 */
export { ActiveTransactions } from "./TransactionsScreen";

/**
 * Repayments screen (tasks 15.1 + 15.2) — authored once in
 * `RepaymentsScreen.tsx` and re-exported here so the route wiring in
 * `ProductEntry` stays stable.
 */
export { ActiveRepayments } from "./RepaymentsScreen";

/**
 * Portfolio screen (tasks 17.1 + 17.2) — authored once in `PortfolioScreen.tsx`
 * and re-exported here so the route wiring in `ProductEntry` stays stable. It
 * presents the portfolio + credit-limit experience and the in-screen Potential
 * Credit Limit Increase affordance (never a fifth bottom-nav tab).
 */
export { ActivePortfolio } from "./PortfolioScreen";

/**
 * Profile screen (task 18.2) — Top_Bar destination, NOT a tab. Authored once in
 * `ProfileScreen.tsx` and re-exported here so the route wiring in `ProductEntry`
 * stays stable. Presents the account-management area and hosts the in-app Learn
 * access point (Req 11.5, 11.14).
 */
export { ActiveProfile } from "./ProfileScreen";

/**
 * Notifications screen (task 18.3) — Top_Bar destination, NOT a tab. Authored
 * once in `NotificationsScreen.tsx` and re-exported here so the route wiring in
 * `ProductEntry` stays stable. Renders the shared `NotificationItem` list from
 * central state with empty/error states (Req 11.6, 11.7, 11.8).
 */
export { ActiveNotifications } from "./NotificationsScreen";

/**
 * Learn experience (task 18.1) — reachable via an in-app affordance (Profile),
 * NEVER a bottom-nav tab in the Active_Account_Experience. Authored once in
 * `LearnScreen.tsx` and re-exported here so the route wiring in `ProductEntry`
 * stays stable (Req 11.14).
 */
export { ActiveLearn } from "./LearnScreen";

/**
 * Pay experience (tasks 14.3 + 14.4) — reachable from Home, NOT a bottom-nav
 * tab. Authored once in `pay/PayScreen.tsx` and re-exported here so the route
 * wiring in `ProductEntry` stays stable.
 */
export { ActivePay } from "../pay/PayScreen";
