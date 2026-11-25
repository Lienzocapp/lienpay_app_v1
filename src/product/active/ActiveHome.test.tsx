/**
 * Active_Account nav + Home example tests (task 13.3).
 *
 * Verifies the Active_Account Bottom_Navigation presents EXACTLY the four tabs
 * Home/Transactions/Repayments/Portfolio, that Profile and Notifications are
 * Top_Bar controls and NOT bottom-nav tabs, and that the Active Home screen
 * renders the credit position from centralized state.
 *
 * Requirements: 10.1, 10.2, 10.9, 11.1, 19.4.
 * Design: Navigation Architecture (Active route table), Testing Strategy.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProductEntry from "../ProductEntry";
import { useLienPayStore } from "../../state/store";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/*" element={<ProductEntry />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Active_Account navigation + Home (task 13.3)", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
    useLienPayStore.setState({ activationStatus: "active" });
  });

  it("presents exactly four bottom-nav tabs in order", () => {
    renderAt("/app/active/home");

    const nav = screen.getByRole("navigation", { name: "Active account" });
    const tabs = within(nav).getAllByRole("button");
    expect(tabs).toHaveLength(4);
    expect(tabs.map((t) => t.textContent)).toEqual([
      "Home",
      "Transactions",
      "Repayments",
      "Portfolio",
    ]);
  });

  it("does not render Profile or Notifications as bottom-nav tabs", () => {
    renderAt("/app/active/home");

    const nav = screen.getByRole("navigation", { name: "Active account" });
    expect(
      within(nav).queryByRole("button", { name: "Profile" })
    ).not.toBeInTheDocument();
    expect(
      within(nav).queryByRole("button", { name: "Notifications" })
    ).not.toBeInTheDocument();
  });

  it("exposes Profile and Notifications as Top_Bar controls", () => {
    renderAt("/app/active/home");

    const topBar = screen.getByRole("banner", { name: "Account" });
    expect(
      within(topBar).getByRole("button", { name: "Profile" })
    ).toBeInTheDocument();
    expect(
      within(topBar).getByRole("button", { name: "Notifications" })
    ).toBeInTheDocument();
  });

  it("renders the Home credit position from centralized state", () => {
    renderAt("/app/active/home");

    // Hero + supporting metrics + credit health, all driven from the snapshot.
    expect(screen.getByText("Available to use")).toBeInTheDocument();
    expect(screen.getByText("Credit limit")).toBeInTheDocument();
    expect(screen.getByText("Used")).toBeInTheDocument();
    expect(screen.getByText("Current LTV")).toBeInTheDocument();
    expect(screen.getByText("Credit health")).toBeInTheDocument();

    // Mandated snapshot values (character-for-character).
    expect(screen.getAllByText("₹2,21,000").length).toBeGreaterThanOrEqual(1);
    // Initial snapshot: usedCredit ₹24,680, availableCredit ₹1,96,320.
    expect(screen.getByText("₹24,680")).toBeInTheDocument();
    expect(screen.getByText("34%")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();

    // The hero credit card ends at the footer (no in-card button, matching the
    // reference); the primary repayment action lives in the next-payment card.
    expect(
      screen.getByRole("button", { name: "Repay Now" })
    ).toBeInTheDocument();
  });
});
