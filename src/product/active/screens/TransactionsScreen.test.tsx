/**
 * Transactions screen example tests (task 14.2).
 *
 * Verifies the Transactions screen renders the seeded history most-recent-first
 * from centralized state — now presented as day-grouped rows with a "Load more"
 * control — shows the shared empty-state message when there are no records
 * (Req 11.7), and shows the shared error-state while retaining the previously
 * displayed values when a mock data load fails (Req 11.8).
 *
 * Requirements: 11.2, 11.7, 11.8. Design: Error Handling, Testing Strategy.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActiveTransactions } from "./TransactionsScreen";
import { mockService } from "../../../mock/mockService";
import { useLienPayStore } from "../../../state/store";

describe("Transactions screen states (task 14.2)", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useLienPayStore.getState().resetToSnapshot();
  });

  it("renders the five seeded transactions most-recent-first (after loading more)", async () => {
    // Deterministic successful probe (no lingering random timer).
    vi.spyOn(mockService, "getTransactions").mockResolvedValue({
      status: "success",
      data: [],
    });

    render(<ActiveTransactions />);

    // The list is paginated; reveal all rows.
    await userEvent.click(
      screen.getByRole("button", { name: /load more transactions/i })
    );

    // Rows are grouped by day; assert across all group lists.
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
    // Most-recent-first overall: Cafe Delhi Heights leads, Apollo Pharmacy trails.
    expect(items[0]).toHaveTextContent("Cafe Delhi Heights");
    expect(items[items.length - 1]).toHaveTextContent("Apollo Pharmacy");
    // Mandated amounts, character-for-character.
    expect(screen.getByText("₹1,248")).toBeInTheDocument();
    expect(screen.getByText("₹743.50")).toBeInTheDocument();
  });

  it("filters the list via the category chips", async () => {
    vi.spyOn(mockService, "getTransactions").mockResolvedValue({
      status: "success",
      data: [],
    });

    render(<ActiveTransactions />);

    // Filtering to "Fuel" shows only Bharat Petroleum (a single matching row).
    await userEvent.click(screen.getByRole("button", { name: "Fuel" }));

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("Bharat Petroleum");
  });

  it("shows the empty-state message when there are no transactions", () => {
    vi.spyOn(mockService, "getTransactions").mockResolvedValue({
      status: "success",
      data: [],
    });
    useLienPayStore.setState({ transactions: [] });

    render(<ActiveTransactions />);

    expect(screen.getByText("No transactions yet.")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("shows the error-state and retains previously displayed values on load failure", async () => {
    vi.spyOn(mockService, "getTransactions").mockResolvedValue({
      status: "error",
      error: "data unavailable",
    });

    render(<ActiveTransactions />);

    // Error message announced.
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByText("Couldn't load transactions")).toBeInTheDocument();

    // Previously displayed values are retained (the newest seeded row is still
    // shown in the first page).
    expect(screen.getByText("Cafe Delhi Heights")).toBeInTheDocument();
  });
});
