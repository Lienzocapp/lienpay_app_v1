/**
 * Payment propagation example tests (task 14.6).
 *
 * Verifies a completed DMart demo payment updates Available_Credit, Used_Credit,
 * and the transactions list in centralized Application_State, and that dependent
 * UI (Active Home credit position and the Transactions list) reflects the change
 * automatically (Req 21.4, 11.11, 19.8). Includes the end-to-end Pay flow
 * interaction (task 14.3/14.4 wiring) through the shared BottomSheet.
 *
 * Requirements: 21.3, 21.4, 11.10, 11.11, 19.8. Design: Data Flow, Financial
 * State Updates (DMart demo payment), Testing Strategy.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ActiveHome } from "./screens/ActiveScreens";
import { ActiveTransactions } from "./screens/TransactionsScreen";
import { ActivePay } from "./pay/PayScreen";
import { DEMO_PAYMENT_DETAILS, mockService } from "../../mock/mockService";
import { useLienPayStore } from "../../state/store";
import type { Transaction } from "../../state/types";

/** Applies a completed demo payment to the central store synchronously. */
function applyDemoPayment() {
  const s = useLienPayStore.getState();
  const demoTxn: Transaction = {
    id: `demo_payment-dmart-${Date.now()}`,
    merchant: DEMO_PAYMENT_DETAILS.merchant,
    amount: DEMO_PAYMENT_DETAILS.amount,
    amountPaise: DEMO_PAYMENT_DETAILS.amountPaise,
    origin: "demo_payment",
    timestamp: Date.now() + 1000,
  };
  s.recordPayment(demoTxn.amountPaise, demoTxn);
}

describe("Payment propagation (task 14.6)", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useLienPayStore.getState().resetToSnapshot();
  });

  it("a completed demo payment updates Available/Used credit and the transactions list", async () => {
    // Real Mock_Service completion (no mocks): DMart ₹1,856.
    const result = await mockService.makeDemoPayment();
    expect(result.status).toBe("success");
    expect(result.data).toBeDefined();

    useLienPayStore.getState().recordPayment(result.data!.amountPaise, result.data!);
    const s = useLienPayStore.getState();

    // Central financial values updated (paise + display strings).
    // Starting usedCreditPaise = 2,468,000 (₹24,680 initial snapshot).
    // After DMart ₹1,856 (185,600 paise): 2,468,000 + 185,600 = 2,653,600 paise.
    expect(s.usedCreditPaise).toBe(2653600);
    expect(s.usedCredit).toBe("₹26,536");
    expect(s.availableCredit).toBe("₹1,94,464");
    // Invariant preserved.
    expect(s.availableCreditPaise + s.usedCreditPaise).toBe(s.creditLimitPaise);
    // Transactions list grew by exactly one distinct demo_payment row.
    expect(s.transactions).toHaveLength(6);
    expect(s.transactions[0].origin).toBe("demo_payment");
  });

  it("Home credit position reflects the completed payment", () => {
    applyDemoPayment();

    render(
      <MemoryRouter>
        <ActiveHome />
      </MemoryRouter>
    );

    // Hero Available_Credit reflects the update (unique on the screen).
    expect(screen.getByText("₹1,94,464")).toBeInTheDocument();
    // Used_Credit metric reflects ₹26,536 (initial ₹24,680 + DMart ₹1,856).
    // The same amount also appears in the Recent activity glance, so match >= 1.
    expect(screen.getAllByText("₹26,536").length).toBeGreaterThanOrEqual(1);
  });

  it("Transactions list reflects the completed payment (distinct DMart rows)", async () => {
    vi.spyOn(mockService, "getTransactions").mockResolvedValue({
      status: "success",
      data: [],
    });
    applyDemoPayment();

    render(<ActiveTransactions />);

    // Rows are day-grouped and paginated; reveal all of them.
    await userEvent.click(
      screen.getByRole("button", { name: /load more transactions/i })
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(6);
    // Two DMart rows now (seeded + demo), each counted distinctly.
    expect(screen.getAllByText("DMart")).toHaveLength(2);
    // The demo payment is prepended (most-recent-first).
    expect(items[0]).toHaveTextContent("DMart");
  });

  it("Pay flow: selecting an action and confirming completes the demo payment", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ActivePay />
      </MemoryRouter>
    );

    // The actions sheet presents the four Pay actions.
    expect(screen.getByRole("button", { name: "Scan QR" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enter UPI ID" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pay Contact" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bills" })).toBeInTheDocument();

    // Choose an action → confirmation shows the mandated demo-payment details.
    await user.click(screen.getByRole("button", { name: "Scan QR" }));
    expect(screen.getByText("LienPay Credit Line")).toBeInTheDocument();
    expect(screen.getByText(DEMO_PAYMENT_DETAILS.merchant)).toBeInTheDocument();

    // Confirm the payment (simulated through Mock_Service).
    await user.click(screen.getByRole("button", { name: "Pay ₹1,856" }));

    await waitFor(
      () => expect(screen.getByText("Payment successful")).toBeInTheDocument(),
      { timeout: 3000 }
    );

    const s = useLienPayStore.getState();
    // Starting usedCreditPaise = 2,468,000 (₹24,680). After DMart ₹1,856:
    // 2,468,000 + 185,600 = 2,653,600 → ₹26,536 used; ₹1,94,464 available.
    expect(s.usedCredit).toBe("₹26,536");
    expect(s.availableCredit).toBe("₹1,94,464");
    expect(s.transactions[0].origin).toBe("demo_payment");
    expect(s.transactions).toHaveLength(6);
  });
});
