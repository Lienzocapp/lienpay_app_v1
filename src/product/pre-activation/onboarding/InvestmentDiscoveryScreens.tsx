/**
 * InvestmentDiscoveryScreens — Fetching Investments (screen 11) and Portfolio
 * Found (screen 12) of the Check-My-Limit journey.
 *
 * Fetching Investments shows a realistic "Finding your investments" loading
 * state driven by the deterministic `Mock_Service.fetchInvestments`, then
 * transitions to "Investments found". Portfolio Found displays the discovered
 * portfolio using the SINGLE central fund dataset (no second portfolio model):
 * total portfolio value, eligible amount, and the fund holdings. Failure +
 * retry are handled; no real MF endpoint is used (Req 13.1, 13.2).
 *
 * Requirements: 5.1, 5.3, 12.5, 13.1, 13.2.
 * Design: Navigation Architecture, Mock Service Architecture, Data Models.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ErrorState,
  FinancialCard,
  FundCard,
  LoadingState,
  MetricCard,
  PrimaryButton,
  StickySummary,
  SuccessState,
} from "../../../design-system/components";
import { formatINR, parseINR } from "../../../formatting/inr";
import { mockService } from "../../../mock/mockService";
import { ELIGIBILITY_DATA } from "../../../mock/data/eligibility";
import type { Fund } from "../../../state/types";
import { useLienPayStore } from "../../../state/store";
import styles from "./onboarding.module.css";
import phase4 from "./phase4.module.css";
import phase5 from "./phase5.module.css";

/** Brief hold on the "found" confirmation before advancing. */
const FOUND_HOLD_MS = 750;

export interface DiscoveryScreenProps {
  /** Invoked on success/continue, to advance to the next step. */
  onAdvance: () => void;
}

/* -------------------------------------------------------------------------- */
/* Screen 11 — Fetching Investments                                           */
/* -------------------------------------------------------------------------- */

type FetchPhase = "fetching" | "found" | "error";

export function FetchingInvestmentsScreen({ onAdvance }: DiscoveryScreenProps) {
  const setInvestmentsFetchStatus = useLienPayStore(
    (s) => s.setInvestmentsFetchStatus
  );
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);

  const [phase, setPhase] = useState<FetchPhase>("fetching");
  const inFlightRef = useRef(false);

  const runFetch = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setPhase("fetching");
    setAsyncInFlight(true);
    try {
      const result = await mockService.fetchInvestments();
      if (result.status === "success" && result.data) {
        setInvestmentsFetchStatus("complete");
        setPhase("found");
        window.setTimeout(onAdvance, FOUND_HOLD_MS);
      } else {
        setPhase("error");
      }
    } finally {
      inFlightRef.current = false;
      setAsyncInFlight(false);
    }
  }, [setInvestmentsFetchStatus, setAsyncInFlight, onAdvance]);

  useEffect(() => {
    void runFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Fetching Investments"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Check my limit</p>
        <h1 className={`text-heading ${styles.heading}`}>
          Finding your investments
        </h1>
      </header>

      {phase === "fetching" ? (
        <div className={styles.loadingWrap}>
          <LoadingState label="Finding your investments" />
        </div>
      ) : null}

      {phase === "found" ? (
        <div className={phase5.successMoment}>
          <SuccessState
            title="Investments found"
            message="We've located your mutual-fund investments."
          />
        </div>
      ) : null}

      {phase === "error" ? (
        <ErrorState
          title="We couldn't reach your investments"
          message="Something went wrong while fetching your investments. Please try again."
          action={
            <PrimaryButton onClick={() => void runFetch()}>
              Try again
            </PrimaryButton>
          }
        />
      ) : null}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen 12 — Portfolio Found (discovered portfolio review)                  */
/* -------------------------------------------------------------------------- */

type LoadState = "loading" | "ready" | "error";

export function PortfolioFoundScreen({ onAdvance }: DiscoveryScreenProps) {
  const setPortfolioFoundStatus = useLienPayStore(
    (s) => s.setPortfolioFoundStatus
  );
  const selectedFunds = useLienPayStore((s) => s.selectedFunds);
  const toggleFund = useLienPayStore((s) => s.toggleFund);

  const [funds, setFunds] = useState<Fund[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadState("loading");
      const result = await mockService.fetchInvestments();
      if (!active) return;
      if (result.status === "success" && result.data) {
        setFunds(result.data);
        setLoadState("ready");
        // Pre-select all eligible funds on initial load if no funds are currently selected
        if (useLienPayStore.getState().selectedFunds.length === 0) {
          result.data.forEach((f) => {
            if (f.eligible !== false) {
              useLienPayStore.getState().toggleFund(f.id);
            }
          });
        }
      } else {
        setLoadState("error");
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const handleContinue = () => {
    setPortfolioFoundStatus("complete");
    onAdvance();
  };

  // Compute portfolio values
  const totalPaise = funds.reduce((sum, f) => {
    try {
      return sum + parseINR(f.value);
    } catch {
      return sum;
    }
  }, 0);

  const eligibleFunds = funds.filter((f) => f.eligible !== false);
  const eligiblePaise = eligibleFunds.reduce((sum, f) => {
    try {
      return sum + parseINR(f.value);
    } catch {
      return sum;
    }
  }, 0);

  const selectedFundsList = funds.filter((f) => selectedFunds.includes(f.id));
  const selectedCount = selectedFundsList.length;
  const selectedPaise = selectedFundsList.reduce((sum, f) => {
    try {
      return sum + parseINR(f.value);
    } catch {
      return sum;
    }
  }, 0);

  const baseLimitPaise = parseINR(ELIGIBILITY_DATA.eligibleCreditLimit);
  const estimatedLimitPaise =
    eligiblePaise > 0
      ? Math.round((selectedPaise / eligiblePaise) * baseLimitPaise)
      : 0;

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Portfolio Found"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Check my limit</p>
        <h1 className={`text-heading ${styles.heading}`}>
          We found your portfolio
        </h1>
        <p className={styles.subtext}>
          Choose the eligible investments to pledge as security for your credit line.
        </p>
      </header>

      {loadState === "loading" ? (
        <div className={styles.loadingWrap}>
          <LoadingState ariaLabel="Loading your portfolio" />
        </div>
      ) : null}

      {loadState === "error" ? (
        <ErrorState
          title="Portfolio unavailable"
          message="We couldn't load your portfolio. Please try again."
        />
      ) : null}

      {loadState === "ready" ? (
        <>
          <FinancialCard
            hero
            label="Total portfolio value"
            value={formatINR(totalPaise > 0 ? totalPaise : parseINR(ELIGIBILITY_DATA.portfolioValue))}
            caption="Across your discovered investments"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <MetricCard
              label="Eligible value"
              value={formatINR(eligiblePaise > 0 ? eligiblePaise : parseINR(ELIGIBILITY_DATA.eligibleInvestments))}
            />
            <MetricCard
              label="Selected value"
              value={formatINR(selectedPaise)}
            />
          </div>

          <ul className={phase4.fundList} aria-label="Discovered investments">
            {funds.map((fund) => (
              <li key={fund.id} className={phase4.fundListItem}>
                <FundCard
                  id={fund.id}
                  name={fund.name}
                  value={fund.value}
                  meta={
                    fund.category
                      ? `${fund.category} · ${fund.eligible !== false ? "Eligible" : "Not eligible"}`
                      : fund.eligible !== false
                      ? "Eligible"
                      : "Not eligible"
                  }
                  selected={selectedFunds.includes(fund.id)}
                  disabled={fund.eligible === false}
                  onToggle={toggleFund}
                />
              </li>
            ))}
          </ul>

          <StickySummary
            ariaLabel="Fund selection summary"
            actions={
              <PrimaryButton
                onClick={handleContinue}
                disabled={selectedCount === 0}
              >
                Continue
              </PrimaryButton>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span className={phase4.summaryLabel}>
                {selectedCount} of {eligibleFunds.length} funds selected
              </span>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                Selected value: <strong style={{ color: "var(--color-text-primary)" }}>{formatINR(selectedPaise)}</strong>
              </span>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                Est. credit limit: <strong style={{ color: "var(--color-green)" }}>{formatINR(estimatedLimitPaise)}</strong>
              </span>
            </div>
          </StickySummary>
        </>
      ) : null}
    </section>
  );
}
