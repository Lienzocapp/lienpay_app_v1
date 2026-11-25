/**
 * ActivePortfolio — the Active_Account Portfolio screen (tasks 17.1 + 17.2).
 *
 * Presents the complete portfolio and credit-limit experience (Req 11.4),
 * driven entirely by centralized selectors so every mandated figure is a
 * reactive, display-only read of Application_State (Req 19.4, 12.4):
 *   - Total Portfolio Value  ₹4,72,000
 *   - Credit Eligibility / Credit_Limit  ₹2,21,000; Available_Credit ₹1,96,320
 *   - current LTV  34%   (fixed display value, never recomputed — Req 19.3/19.5)
 *   - Credit_Health  "Healthy"  (fixed display value)
 * No hero number is hardcoded; all values come from `selectPortfolio`.
 *
 * Fund holdings render from the central `mock/data/funds.ts` dataset (the
 * confirmed 4-fund demo configuration whose values sum to the canonical
 * ₹4,72,000 and whose eligible amounts sum to the ₹2,21,500 credit eligibility)
 * as rich holding cards (category, total value, eligible amount, current / locked
 * NAV and units). Pledged Investments = the pledged (`selectedFunds`) subset of
 * that dataset. Fund content is display-only here; selection/pledging happens in
 * the Pre_Activation Fund Selection flow, which is preserved unchanged.
 *
 * Credit Limit Increase (task 17.2): the "Potential Credit Limit Increase"
 * experience is presented WITHIN this screen as an in-screen section/affordance
 * (Req 11.13). It is NOT a fifth bottom-nav tab and NOT a separate top-level
 * route — it is a card + BottomSheet local to the Portfolio screen.
 *
 * The NAV information card explains the locked-NAV safety buffer — a documented
 * product fact (Learn FAQ: only a portion of value is lent, funds stay invested
 * and move with the market) — it invents no figure or claim.
 *
 * Requirements: 11.4, 11.13, 19.4, 20.1, 20.2, 20.4, 12.4.
 * Design: State Model, Data Flow, Navigation Architecture (Active route table).
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BottomSheet,
  BrandAvatar,
  ErrorState,
  LinearProgress,
  LoadingState,
  PrimaryButton,
  SecondaryButton,
  SuccessState,
} from "../../../design-system/components";
import { staggerContainer, staggerItem } from "../../../animation/product";
import { brandLogoUrl } from "../brandLogos";
import { ChevronRightIcon, InfoIcon, TrendIcon } from "./homeIcons";
import { mockService } from "../../../mock/mockService";
import { standardDelay } from "../../../mock/delay";
import { selectPortfolio, selectSelectedFunds } from "../../../state/selectors";
import { useLienPayStore } from "../../../state/store";
import type { Fund } from "../../../state/types";
import styles from "./active.module.css";

type FundLoadState = "loading" | "ready" | "error";

export function ActivePortfolio() {
  // Centralized, reactive display source for the mandated figures (Req 11.4,
  // 12.4, 19.4). Nothing here is hardcoded or recomputed.
  const { portfolioValue, creditLimit, availableCredit, ltv, creditHealth } =
    useLienPayStore(selectPortfolio);
  const selectedFunds = useLienPayStore(selectSelectedFunds);
  // Numeric LTV for the bar (display value stays the canonical "34%").
  const ltvNum = parseInt(ltv, 10) || 0;

  const [funds, setFunds] = useState<Fund[]>([]);
  const [fundLoad, setFundLoad] = useState<FundLoadState>("loading");

  // In-screen Credit Limit Increase affordance (NOT a tab / route). Simulated
  // request → processing → result using the existing mock delay (no real credit
  // decision engine; no invented approval figure).
  const [increaseOpen, setIncreaseOpen] = useState(false);
  const [increasePhase, setIncreasePhase] = useState<"idle" | "processing" | "done">(
    "idle"
  );
  const increaseRef = useRef(false);

  const requestIncrease = async () => {
    if (increaseRef.current) return;
    increaseRef.current = true;
    setIncreasePhase("processing");
    try {
      await standardDelay();
      setIncreasePhase("done");
    } finally {
      increaseRef.current = false;
    }
  };

  const closeIncrease = () => {
    setIncreaseOpen(false);
    setIncreasePhase("idle");
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setFundLoad("loading");
      const result = await mockService.getFunds();
      if (!active) return;
      if (result.status === "success" && result.data) {
        setFunds(result.data);
        setFundLoad("ready");
      } else {
        setFundLoad("error");
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  // Pledged Investments = pledged (selected) funds present in the central data.
  const pledged = funds.filter((fund) => selectedFunds.includes(fund.id));
  const hasPledged = pledged.length > 0;

  /** Renders one rich holding card (display-only). */
  const renderHolding = (fund: Fund) => (
    <li key={fund.id} className={styles.pfHolding}>
      <div className={styles.pfHoldingTop}>
        <BrandAvatar name={fund.name} logoUrl={brandLogoUrl(fund.name)} />
        <span className={styles.pfHoldingId}>
          <span className={styles.pfHoldingName}>{fund.name}</span>
          <span className={styles.pfHoldingCat}>
            {fund.category ?? (fund.eligible ? "Eligible" : "Not eligible")}
          </span>
        </span>
        <span className={styles.pfHoldingValues}>
          <span className={styles.pfHoldingValue}>{fund.value}</span>
          {fund.eligibleValue ? (
            <span className={styles.pfHoldingEligible}>
              {fund.eligibleValue} eligible
            </span>
          ) : null}
        </span>
        <span className={styles.pfChevron} aria-hidden="true">
          <ChevronRightIcon />
        </span>
      </div>
      {fund.currentNav || fund.lockedNav || fund.units ? (
        <div className={styles.pfNavGrid}>
          <div className={styles.pfNavCell}>
            <span className={styles.pfNavCellLabel}>Current NAV</span>
            <span className={styles.pfNavCellValue}>{fund.currentNav}</span>
          </div>
          <div className={styles.pfNavCell}>
            <span className={styles.pfNavCellLabel}>Locked NAV</span>
            <span className={styles.pfNavCellValue}>{fund.lockedNav}</span>
          </div>
          <div className={styles.pfNavCell}>
            <span className={styles.pfNavCellLabel}>Units</span>
            <span className={styles.pfNavCellValue}>{fund.units}</span>
          </div>
        </div>
      ) : null}
    </li>
  );

  return (
    <motion.section
      className={styles.list}
      aria-label="Portfolio"
      variants={staggerContainer()}
      initial="initial"
      animate="animate"
    >
      <motion.p className={styles.eyebrow} variants={staggerItem()}>
        Your assets
      </motion.p>
      <motion.h1
        className={`text-heading ${styles.heading}`}
        variants={staggerItem()}
      >
        Portfolio
      </motion.h1>

      {/* PORTFOLIO SUMMARY — value + LTV visualization + eligible/available/
          health, all from central state. Makes the Portfolio → Eligible credit
          → LienPay credit line relationship visually obvious. */}
      <motion.section
        className={styles.pfSummary}
        aria-label="Portfolio position"
        variants={staggerItem()}
      >
        <div className={styles.pfGlow} aria-hidden="true" />
        <span className={styles.pfSummaryLabel}>Total portfolio value</span>
        <span className={styles.pfSummaryValue}>{portfolioValue}</span>

        <div className={styles.pfLtv}>
          <div className={styles.pfLtvHead}>
            <span className={styles.pfLtvLabel}>Current LTV</span>
            <span className={styles.pfLtvValue}>{ltv}</span>
          </div>
          <LinearProgress value={ltvNum} ariaLabel={`Loan to value ${ltv}`} />
          <span className={styles.pfLtvNote}>Comfortably within range</span>
        </div>

        <div className={styles.pfSummaryFooter}>
          <div className={styles.pfSummaryCol}>
            <span className={styles.pfColLabel}>Eligible credit</span>
            <span className={styles.pfColValue}>{creditLimit}</span>
          </div>
          <div className={styles.pfSummaryCol}>
            <span className={styles.pfColLabel}>Available credit</span>
            <span className={styles.pfColValue}>{availableCredit}</span>
          </div>
          <div className={styles.pfSummaryCol}>
            <span className={styles.pfColLabel}>Credit health</span>
            <span className={styles.pfColValueAccent}>{creditHealth}</span>
          </div>
        </div>
      </motion.section>

      {/* NAV information card — explains the locked-NAV safety buffer (a
          documented product fact; no invented figure/claim). */}
      <motion.section
        className={styles.pfNavInfo}
        aria-label="About locked NAV"
        variants={staggerItem()}
      >
        <span className={styles.pfNavIcon} aria-hidden="true">
          <InfoIcon />
        </span>
        <p className={styles.pfNavText}>
          Your credit is calculated on a <strong>locked NAV</strong> set below
          the current market value, leaving a safety buffer for normal market
          movements. Pledged funds stay invested and continue to move with the
          market.
        </p>
      </motion.section>

      {/* --- Potential Credit Limit Increase (task 17.2, in-screen) --- */}
      {/* Presented WITHIN the Portfolio screen; never a bottom-nav tab or a
          separate route (Req 11.13). */}
      <motion.section
        className={styles.pfBoost}
        aria-label="Potential credit limit increase"
        variants={staggerItem()}
      >
        <span className={styles.iconHolder} aria-hidden="true">
          <TrendIcon />
        </span>
        <div className={styles.pfBoostBody}>
          <h2 className={styles.pfBoostTitle}>Potential credit limit increase</h2>
          <p className={styles.pfBoostText}>
            Pledge more of your eligible investments to unlock a higher limit.
          </p>
        </div>
        <SecondaryButton onClick={() => setIncreaseOpen(true)}>
          Explore increase
        </SecondaryButton>
      </motion.section>

      {/* Pledged investments — rich holding cards (only when the user has
          pledged funds; reflects real central state, nothing fabricated). */}
      {fundLoad === "ready" && hasPledged ? (
        <motion.div variants={staggerItem()}>
          <h2 className={styles.pfSectionTitle}>Pledged investments</h2>
          <ul className={styles.pfHoldingList} aria-label="Pledged investments">
            {pledged.map(renderHolding)}
          </ul>
        </motion.div>
      ) : null}

      {/* Your holdings — the full central fund set as rich holding cards. */}
      <motion.h2 className={styles.pfSectionTitle} variants={staggerItem()}>
        Your holdings
      </motion.h2>
      {fundLoad === "loading" ? (
        <div className={styles.loadingWrap}>
          <LoadingState ariaLabel="Loading investments" />
        </div>
      ) : null}
      {fundLoad === "error" ? (
        <ErrorState
          title="Investments unavailable"
          message="We couldn't load your investments. Please try again later."
        />
      ) : null}
      {fundLoad === "ready" ? (
        funds.length > 0 ? (
          <ul className={styles.pfHoldingList} aria-label="Fund holdings">
            {funds.map(renderHolding)}
          </ul>
        ) : (
          <p className={styles.empty} role="status">
            No fund holdings available.
          </p>
        )
      ) : null}

      {/* In-screen Credit Limit Increase detail. Copy is minimal/functional and
          carries no invented increase figure. */}
      <BottomSheet
        open={increaseOpen}
        title="Potential credit limit increase"
        onClose={closeIncrease}
      >
        <div className={styles.sheet}>
          {increasePhase === "idle" ? (
            <>
              <p className={styles.pfBoostText}>
                Pledging more of your eligible investments may raise your
                available credit. Request a review and we'll check your pledged
                portfolio.
              </p>
              <div className={styles.sheetActions}>
                <PrimaryButton fullWidth onClick={() => void requestIncrease()}>
                  Request increase
                </PrimaryButton>
                <SecondaryButton fullWidth onClick={closeIncrease}>
                  Not now
                </SecondaryButton>
              </div>
            </>
          ) : null}

          {increasePhase === "processing" ? (
            <LoadingState label="Reviewing your request" />
          ) : null}

          {increasePhase === "done" ? (
            <SuccessState
              title="Request submitted"
              message="We'll review your pledged portfolio and update your available credit if you qualify."
              action={
                <PrimaryButton fullWidth onClick={closeIncrease}>
                  Got it
                </PrimaryButton>
              }
            />
          ) : null}
        </div>
      </BottomSheet>
    </motion.section>
  );
}
