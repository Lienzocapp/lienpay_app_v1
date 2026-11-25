/**
 * Repayments screen example tests (task 15.3).
 *
 * Verifies the Repayments screen shows the shared empty-state message when
 * there is no repayment history (Req 11.7), and that a completed repayment
 * updates the dependent UI centrally — reducing Used_Credit, increasing
 * Available_Credit, and reducing the Outstanding / Amount Due display strings —
 * and that the change propagates to the Home credit position (Req 11.10, 11.11,
 * 19.8).
 *
 * Requirements: 11.7, 11.11, 19.8. Design: Error Handling, Testing Strategy.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ActiveRepayments } from "./RepaymentsScreen";
import { ActiveHome } from "./ActiveScreens";
import { mockService } from "../../../mock/mockService";
import { useLienPayStore } from "../../../state/store";

describe("Repayments screen (task 15.3)", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
    useLienPayStore.setState({ activationStatus: "active" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useLienPayStore.getState().resetToSnapshot();
  });

  it("shows the empty-state message when there is no repayment history", () => {
    render(
      <MemoryRouter>
        <ActiveRepayments />
      </MemoryRouter>
    );

    // Mandated figures from centralized state (character-for-character).
    expect(screen.getByText("Outstanding amount")).toBeInTheDocument();
    expect(screen.getByText("₹24,680")).toBeInTheDocument();
    expect(screen.getByText("Amount due")).toBeInTheDocument();
    expect(screen.getByText("₹8,240")).toBeInTheDocument();

    // Empty-state shown; no history list rendered.
    expect(screen.getByText("No repayments yet.")).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Repayment history" })
    ).not.toBeInTheDocument();
  });

  it("propagates a completed repayment to Used/Available/outstanding and Home", async () => {
    // Give the account some used credit first so a repayment visibly reduces
    // Used_Credit (the snapshot starts at ₹0). ₹10,000 used → ₹2,11,500 avail.
    useLienPayStore.getState().recordPayment(1000000);

    vi.spyOn(mockService, "makeRepayment").mockResolvedValue({ status: "success" });

    render(
      <MemoryRouter>
        <ActiveHome />
        <ActiveRepayments />
      </MemoryRouter>
    );

    // Pre-repayment: Home shows used credit (initial ₹24,680 + ₹10,000 spend = ₹34,680);
    // Repayments shows Outstanding ₹24,680 and Amount Due ₹8,240.
    expect(screen.getByText("₹34,680")).toBeInTheDocument();
    expect(screen.getByText("₹24,680")).toBeInTheDocument();
    // ₹8,240 now appears on both the Home "Next repayment" card and the
    // Repayments amount-due metric when both are rendered together.
    expect(screen.getAllByText("₹8,240").length).toBeGreaterThanOrEqual(1);

    // Trigger the repayment from the Repayments screen (scope to that region so
    // the Home "Pay Now" entry point is not clicked).
    const repayments = screen.getByRole("region", { name: "Repayments" });
    fireEvent.click(within(repayments).getByRole("button", { name: "Pay Now" }));

    // Confirm in the sheet.
    fireEvent.click(screen.getByRole("button", { name: "Pay ₹8,240" }));

    // Success sheet appears once the mock repayment resolves.
    await waitFor(() =>
      expect(screen.getByText("Repayment successful")).toBeInTheDocument()
    );

    // Central update reflected everywhere:
    //  - Used_Credit: initial ₹24,680 + ₹10,000 spend - ₹8,240 repay = ₹26,440
    //  - Available_Credit: ₹2,21,000 - ₹26,440 = ₹1,94,560
    //  - Outstanding ₹24,680 → ₹16,440; Amount Due ₹8,240 → ₹0
    const state = useLienPayStore.getState();
    expect(state.usedCredit).toBe("₹26,440");
    expect(state.availableCredit).toBe("₹1,94,560");
    expect(state.repayments.outstanding).toBe("₹16,440");
    expect(state.repayments.amountDue).toBe("₹0");

    // Invariant preserved: available + used == limit.
    expect(state.availableCreditPaise + state.usedCreditPaise).toBe(
      state.creditLimitPaise
    );

    // LTV / Credit_Health never recomputed.
    expect(state.ltv).toBe("34%");
    expect(state.creditHealth).toBe("Healthy");

    // Propagated to Home: the new Used_Credit is displayed.
    expect(screen.getByText("₹26,440")).toBeInTheDocument();
    // And to the Repayments figures.
    expect(screen.getByText("₹16,440")).toBeInTheDocument();
  });
});
