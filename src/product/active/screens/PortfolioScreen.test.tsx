/**
 * Portfolio screen example tests (task 17.3).
 *
 * Verifies that, on the Portfolio screen, the Active_Account Bottom_Navigation
 * still presents EXACTLY the four tabs Home/Transactions/Repayments/Portfolio
 * and that the Potential Credit Limit Increase experience is presented WITHIN
 * the screen and is NOT a fifth bottom-nav tab / separate top-level route
 * (Req 11.13). Also spot-checks that the mandated portfolio/credit figures render
 * verbatim from centralized state (Req 11.4, 12.4).
 *
 * Requirements: 11.13, 11.4, 12.4, 10.1, 10.2.
 * Design: Navigation Architecture (Active route table), Testing Strategy.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProductEntry from "../../ProductEntry";
import { useLienPayStore } from "../../../state/store";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/*" element={<ProductEntry />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Portfolio screen (task 17.3)", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
    useLienPayStore.setState({ activationStatus: "active" });
  });

  it("keeps exactly four bottom-nav tabs on the Portfolio screen", () => {
    renderAt("/app/active/portfolio");

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

  it("does not add a Credit Limit Increase bottom-nav tab", () => {
    renderAt("/app/active/portfolio");

    const nav = screen.getByRole("navigation", { name: "Active account" });
    expect(
      within(nav).queryByRole("button", { name: /credit limit increase/i })
    ).not.toBeInTheDocument();
    expect(
      within(nav).queryByRole("button", { name: /increase/i })
    ).not.toBeInTheDocument();
  });

  it("presents the Potential Credit Limit Increase experience within the screen", () => {
    renderAt("/app/active/portfolio");

    // The affordance lives inside the Portfolio content, not the nav.
    expect(
      screen.getByRole("region", { name: /potential credit limit increase/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /explore increase/i })
    ).toBeInTheDocument();
  });

  it("renders the mandated portfolio and credit figures from central state", () => {
    renderAt("/app/active/portfolio");

    expect(screen.getByText("Total portfolio value")).toBeInTheDocument();
    // Total Portfolio Value ₹4,72,000 (character-for-character).
    expect(screen.getByText("₹4,72,000")).toBeInTheDocument();
    // Credit Eligibility / Credit_Limit all ₹2,21,000; Available_Credit ₹1,96,320.
    expect(screen.getAllByText("₹2,21,000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("34%")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });
});
