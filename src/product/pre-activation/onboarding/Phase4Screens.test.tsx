/**
 * Phase 4 screens (7–10) example tests — fund toggle + count, pledge consent
 * gate, and pledge-processing failure (task 9.5).
 *
 * Covers Req 7.3 (toggle updates the selected count), Req 7.5 (advancement is
 * blocked without consent or with zero funds), and Req 7.8 (pledge failure
 * keeps the screen and preserves the selected funds). The Mock_Service reads /
 * long-running pledge are stubbed so the tests are deterministic and fast; they
 * still exercise the real screen logic and the centralized store.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FundSelectionScreen } from "./FundSelectionScreen";
import { PledgeConsentScreen } from "./PledgeConsentScreen";
import { PledgeProcessingScreen } from "./PledgeProcessingScreen";
import { useLienPayStore } from "../../../state/store";
import { mockService } from "../../../mock/mockService";
import type { Fund } from "../../../state/types";

const TEST_FUNDS: Fund[] = [
  { id: "fund-a", name: "Alpha Fund", value: "₹1,00,000", eligible: true },
  { id: "fund-b", name: "Beta Fund", value: "₹50,000", eligible: true },
];

describe("Phase 4 screens (7–10)", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("FundSelectionScreen (screen 8)", () => {
    it("toggles a fund and updates the selected count", async () => {
      vi.spyOn(mockService, "getFunds").mockResolvedValue({
        status: "success",
        data: TEST_FUNDS,
      });
      const user = userEvent.setup();
      render(<FundSelectionScreen onAdvance={vi.fn()} />);

      const alphaCard = await screen.findByRole("button", {
        name: /Alpha Fund/,
      });
      expect(screen.getByText("0")).toBeInTheDocument();

      await user.click(alphaCard);

      expect(useLienPayStore.getState().selectedFunds).toEqual(["fund-a"]);
      expect(screen.getByText("1")).toBeInTheDocument();

      // Toggling off removes it and updates the count back to 0.
      await user.click(alphaCard);
      expect(useLienPayStore.getState().selectedFunds).toEqual([]);
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("PledgeConsentScreen (screen 9)", () => {
    it("blocks advancement without consent even when a fund is selected", async () => {
      useLienPayStore.getState().toggleFund("fund-a");
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      render(<PledgeConsentScreen onAdvance={onAdvance} />);

      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onAdvance).not.toHaveBeenCalled();
      // Selection is preserved.
      expect(useLienPayStore.getState().selectedFunds).toEqual(["fund-a"]);
    });

    it("blocks advancement with consent but zero funds selected", async () => {
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      render(<PledgeConsentScreen onAdvance={onAdvance} />);

      await user.click(screen.getByRole("checkbox"));
      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onAdvance).not.toHaveBeenCalled();
    });

    it("advances when consent is confirmed and at least one fund is selected", async () => {
      useLienPayStore.getState().toggleFund("fund-a");
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      render(<PledgeConsentScreen onAdvance={onAdvance} />);

      await user.click(screen.getByRole("checkbox"));
      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(onAdvance).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("PledgeProcessingScreen (screen 10)", () => {
    it("keeps the screen and preserves selected funds on pledge failure", async () => {
      useLienPayStore.getState().toggleFund("fund-a");
      vi.spyOn(mockService, "processPledge").mockResolvedValue({
        status: "error",
        error: "simulated failure",
      });
      const onAdvance = vi.fn();
      render(<PledgeProcessingScreen onAdvance={onAdvance} />);

      // The failure error state appears and the flow does not advance.
      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(onAdvance).not.toHaveBeenCalled();
      expect(useLienPayStore.getState().pledgeStatus).toBe("failed");
      // Selected funds are preserved (Req 7.8).
      expect(useLienPayStore.getState().selectedFunds).toEqual(["fund-a"]);
    });

    it("advances to KYC and marks pledge success on a successful pledge", async () => {
      useLienPayStore.getState().toggleFund("fund-a");
      vi.spyOn(mockService, "processPledge").mockResolvedValue({
        status: "success",
      });
      const onAdvance = vi.fn();
      render(<PledgeProcessingScreen onAdvance={onAdvance} />);

      await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
      expect(useLienPayStore.getState().pledgeStatus).toBe("success");
    });
  });
});
