/**
 * FundSelectionScreen — Pre_Activation_Flow screen 8 (Fund Selection).
 *
 * Renders each fund supplied by the centralized `Mock_Service.getFunds` as an
 * individual shared `FundCard`, supporting a maximum of 50 funds (Req 7.2).
 * Selecting or deselecting a fund toggles the corresponding card and updates the
 * displayed selected-count via the centralized `selectedFunds` list; because the
 * toggle is a synchronous store update, the count updates well within 200ms
 * (Req 7.3). A shared `StickySummary` shows the running selected-count and the
 * continue action. Advancing goes to Pledge Consent (screen 9), where the
 * consent + at-least-one-fund gate is enforced (Req 7.4, 7.5).
 *
 * While funds load, the shared `LoadingState` is shown; if the Mock_Service
 * returns no data, the shared `ErrorState` is shown and no fund content is
 * fabricated (Req 13.4, 13.5).
 *
 * CONTENT — NON-AUTHORITATIVE / BLOCKED (Req 18.1, 20.4): No authoritative fund
 * list (names, values, units, holdings) exists in the source specification /
 * screenshots in the workspace. The funds rendered here come from the PROVISIONAL
 * demo dataset (`mock/data/funds.ts`) purely to make the selection MECHANICS
 * runnable. The provisional nature is disclosed on-screen; the fund CONTENT must
 * be reconciled against the LienPay Application Design Specification before this
 * screen is content-complete. The screen mechanics (render/toggle/count/max-50)
 * are complete; the fund content is flagged BLOCKED in the batch report. The
 * header and continue label use minimal functional wording pending the source.
 *
 * Requirements: 7.2, 7.3, 20.1, 20.2, 20.4.
 * Design: Mock Service Architecture, Components and Interfaces (FundCard,
 * StickySummary), Conflicts & Ambiguities (screen content source of truth).
 */
import { useEffect, useState } from "react";
import {
  ErrorState,
  FundCard,
  LoadingState,
  PrimaryButton,
  StickySummary,
} from "../../../design-system/components";
import { mockService } from "../../../mock/mockService";
import { useLienPayStore } from "../../../state/store";
import type { Fund } from "../../../state/types";
import styles from "./onboarding.module.css";
import phase4 from "./phase4.module.css";

type LoadState = "loading" | "ready" | "error";

export interface FundSelectionScreenProps {
  /** Invoked on continue, to advance to Pledge Consent (screen 9). */
  onAdvance: () => void;
}

export function FundSelectionScreen({ onAdvance }: FundSelectionScreenProps) {
  const selectedFunds = useLienPayStore((s) => s.selectedFunds);
  const toggleFund = useLienPayStore((s) => s.toggleFund);

  const [funds, setFunds] = useState<Fund[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    // Discovery and selection are combined on "We found your portfolio".
    // If funds have already been selected, auto-advance so the user is not shown a second redundant screen repeating the fund list.
    if (selectedFunds.length >= 1) {
      onAdvance();
    }
  }, [selectedFunds.length, onAdvance]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoadState("loading");
      const result = await mockService.getFunds();
      if (!active) {
        return;
      }
      if (result.status === "success" && result.data) {
        setFunds(result.data);
        setLoadState("ready");
      } else {
        setLoadState("error");
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const selectedCount = selectedFunds.length;

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Fund Selection"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Back your credit line</p>
        <h1 className={`text-heading ${styles.heading}`}>Select funds</h1>
        <p className={styles.subtext}>
          Choose the investments to pledge as security for your credit line.
        </p>
      </header>

      {loadState === "loading" ? (
        <div className={styles.loadingWrap}>
          <LoadingState ariaLabel="Loading funds" />
        </div>
      ) : null}

      {loadState === "error" ? (
        <ErrorState
          title="Funds unavailable"
          message="We couldn't load your funds. Please try again."
        />
      ) : null}

      {loadState === "ready" ? (
        <>
          {/*
           * Provisional-data disclosure: the fund list below is NON-AUTHORITATIVE
           * demo data pending the LienPay Application Design Specification
           * (Req 18.1, 20.4). Shown so the provisional content is never presented
           * as final.
           */}
          <p className={phase4.provisionalNote}>
            Fund data shown is provisional demo data pending the design
            specification and is not final.
          </p>

          <ul className={phase4.fundList} aria-label="Eligible funds">
            {funds.map((fund) => (
              <li key={fund.id} className={phase4.fundListItem}>
                <FundCard
                  id={fund.id}
                  name={fund.name}
                  value={fund.value}
                  meta={fund.eligible ? "Eligible" : "Not eligible"}
                  selected={selectedFunds.includes(fund.id)}
                  disabled={!fund.eligible}
                  onToggle={toggleFund}
                />
              </li>
            ))}
          </ul>

          <StickySummary
            ariaLabel="Fund selection summary"
            actions={
              <PrimaryButton
                onClick={onAdvance}
                disabled={selectedCount === 0}
              >
                Continue
              </PrimaryButton>
            }
          >
            <span className={phase4.summaryLabel}>Funds selected</span>
            <span className={phase4.summaryValue} aria-live="polite">
              <span className={phase4.summaryCount}>{selectedCount}</span>
              <span className={phase4.summaryTotal}> / {funds.length}</span>
            </span>
          </StickySummary>
        </>
      ) : null}
    </section>
  );
}
