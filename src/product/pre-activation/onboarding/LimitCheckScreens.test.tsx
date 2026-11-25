/**
 * Tests for the Check-My-Limit (eligibility) journey screens (7–14):
 * PAN Verification/Processing, MF Connection/Consent, Investment discovery
 * (fetch + portfolio found), Eligibility Calculation, and the Eligible Credit
 * Limit Result. Mirrors the Phase 4/5 patterns (store-backed, mock-service
 * spies, loading/success/failure/retry, consent/validation gates).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import {
  PanProcessingScreen,
  PanVerificationScreen,
} from "./PanScreens";
import { MfConnectionScreen, MfConsentScreen } from "./MutualFundScreens";
import {
  FetchingInvestmentsScreen,
  PortfolioFoundScreen,
} from "./InvestmentDiscoveryScreens";
import {
  CreditLimitResultScreen,
  EligibilityCalculationScreen,
} from "./EligibilityScreens";
import { useLienPayStore } from "../../../state/store";
import { mockService } from "../../../mock/mockService";
import type { Fund } from "../../../state/types";

const TEST_FUNDS: Fund[] = [
  {
    id: "fund-a",
    name: "Alpha Fund",
    value: "₹1,00,000",
    eligible: true,
    category: "Large Cap",
  },
];

/** Renders a screen inside a router (some screens call useNavigate). */
function renderIn(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("Check-My-Limit journey (screens 7–14)", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("PanVerificationScreen (screen 7)", () => {
    it("rejects a malformed PAN with an inline error and does not advance", async () => {
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      renderIn(<PanVerificationScreen onAdvance={onAdvance} />);

      await user.type(screen.getByLabelText("PAN number"), "ABC12");
      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onAdvance).not.toHaveBeenCalled();
      expect(useLienPayStore.getState().panStatus).toBe("not_started");
    });

    it("accepts a valid PAN, stores it, and advances", async () => {
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      renderIn(<PanVerificationScreen onAdvance={onAdvance} />);

      await user.type(screen.getByLabelText("PAN number"), "ABCDE1234F");
      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(onAdvance).toHaveBeenCalledTimes(1);
      expect(useLienPayStore.getState().panStatus).toBe("complete");
      expect(useLienPayStore.getState().panNumber).toBe("ABCDE1234F");
    });
  });

  describe("PanProcessingScreen (screen 8)", () => {
    it("verifies the PAN and advances on success", async () => {
      useLienPayStore.getState().setPanNumber("ABCDE1234F");
      vi.spyOn(mockService, "verifyPan").mockResolvedValue({ status: "success" });
      const onAdvance = vi.fn();
      renderIn(<PanProcessingScreen onAdvance={onAdvance} />);

      await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
      expect(useLienPayStore.getState().panProcessingStatus).toBe("complete");
    });

    it("shows an error and retry option on verification failure", async () => {
      useLienPayStore.getState().setPanNumber("AAAAA0000A");
      vi.spyOn(mockService, "verifyPan").mockResolvedValue({
        status: "error",
        error: "declined",
      });
      const onAdvance = vi.fn();
      renderIn(<PanProcessingScreen onAdvance={onAdvance} />);

      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(onAdvance).not.toHaveBeenCalled();
      expect(useLienPayStore.getState().panProcessingStatus).toBe("not_started");
    });
  });

  describe("MfConnectionScreen (screen 9)", () => {
    it("connects investments and advances", async () => {
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      renderIn(<MfConnectionScreen onAdvance={onAdvance} />);

      await user.click(
        screen.getByRole("button", { name: "Connect Investments" })
      );

      expect(onAdvance).toHaveBeenCalledTimes(1);
      expect(useLienPayStore.getState().mfConnectionStatus).toBe("complete");
    });
  });

  describe("MfConsentScreen (screen 10)", () => {
    it("gates Continue behind explicit consent", async () => {
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      renderIn(<MfConsentScreen onAdvance={onAdvance} />);

      // Disabled until consent is given.
      expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();

      await user.click(screen.getByRole("checkbox"));
      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(onAdvance).toHaveBeenCalledTimes(1);
      expect(useLienPayStore.getState().mfConsentStatus).toBe("complete");
    });
  });

  describe("FetchingInvestmentsScreen (screen 11)", () => {
    it("fetches investments and advances on success", async () => {
      vi.spyOn(mockService, "fetchInvestments").mockResolvedValue({
        status: "success",
        data: TEST_FUNDS,
      });
      const onAdvance = vi.fn();
      renderIn(<FetchingInvestmentsScreen onAdvance={onAdvance} />);

      await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
      expect(useLienPayStore.getState().investmentsFetchStatus).toBe("complete");
    });

    it("shows an error and retry on fetch failure", async () => {
      vi.spyOn(mockService, "fetchInvestments").mockResolvedValue({
        status: "error",
        error: "unreachable",
      });
      const onAdvance = vi.fn();
      renderIn(<FetchingInvestmentsScreen onAdvance={onAdvance} />);

      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(onAdvance).not.toHaveBeenCalled();
    });
  });

  describe("PortfolioFoundScreen (screen 12)", () => {
    it("shows the discovered portfolio and advances on continue", async () => {
      vi.spyOn(mockService, "fetchInvestments").mockResolvedValue({
        status: "success",
        data: TEST_FUNDS,
      });
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      renderIn(<PortfolioFoundScreen onAdvance={onAdvance} />);

      expect(await screen.findByText("Alpha Fund")).toBeInTheDocument();
      // Discovered portfolio value is shown.
      expect(screen.getAllByText("₹1,00,000").length).toBeGreaterThan(0);

      await user.click(screen.getByRole("button", { name: "Continue" }));
      expect(onAdvance).toHaveBeenCalledTimes(1);
      expect(useLienPayStore.getState().portfolioFoundStatus).toBe("complete");
    });
  });

  describe("EligibilityCalculationScreen (screen 13)", () => {
    it("calculates eligibility and advances on success", async () => {
      vi.spyOn(mockService, "calculateEligibility").mockResolvedValue({
        status: "success",
        data: {
          eligibleCreditLimit: "₹2,21,000",
          portfolioValue: "₹4,72,000",
          eligibleInvestments: "₹2,21,500",
        },
      });
      const onAdvance = vi.fn();
      renderIn(<EligibilityCalculationScreen onAdvance={onAdvance} />);

      await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
      expect(useLienPayStore.getState().eligibilityStatus).toBe("complete");
    });
  });

  describe("CreditLimitResultScreen (screen 14)", () => {
    it("presents the eligible credit limit and advances on continue", async () => {
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      renderIn(<CreditLimitResultScreen onAdvance={onAdvance} />);

      // The ₹2,21,000 result is the headline moment.
      expect(screen.getAllByText("₹2,21,000").length).toBeGreaterThan(0);

      await user.click(screen.getByRole("button", { name: "Continue" }));
      expect(onAdvance).toHaveBeenCalledTimes(1);
      expect(useLienPayStore.getState().portfolioStatus).toBe("complete");
    });
  });
});
