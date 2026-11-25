/**
 * Activation nav-swap example tests (task 12.4).
 *
 * Verifies that reaching the active account state swaps the pre-activation
 * experience (`/app/pre/*`) for the Active_Account experience (`/app/active/*`),
 * presents EXACTLY the four Active_Account tabs (Home/Transactions/Repayments/
 * Portfolio), and hides the Activate_Account_CTA.
 *
 * Requirements: 10.8, 22.13, 22.15.
 * Design: Active-account transition (nav swap), Testing Strategy.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
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

describe("Activation nav swap (task 12.4)", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
  });

  it("swaps /app/pre/* to the Active_Account experience once active", () => {
    useLienPayStore.setState({ activationStatus: "active" });
    renderAt("/app/pre/home");

    // Pre-activation nav is gone; the Active_Account nav is shown instead.
    expect(
      screen.queryByRole("navigation", { name: "Pre-activation" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Active account" })
    ).toBeInTheDocument();
  });

  it("presents exactly the four Active_Account tabs", () => {
    useLienPayStore.setState({ activationStatus: "active" });
    renderAt("/app/active/home");

    const nav = screen.getByRole("navigation", { name: "Active account" });
    const tabs = within(nav).getAllByRole("button");
    expect(tabs).toHaveLength(4);
    expect(within(nav).getByRole("button", { name: "Home" })).toBeInTheDocument();
    expect(
      within(nav).getByRole("button", { name: "Transactions" })
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("button", { name: "Repayments" })
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("button", { name: "Portfolio" })
    ).toBeInTheDocument();
  });

  it("hides the Activate_Account_CTA once active", () => {
    useLienPayStore.setState({ activationStatus: "active" });
    renderAt("/app/active/home");
    expect(
      screen.queryByRole("button", { name: "Check My Limit" })
    ).not.toBeInTheDocument();
  });

  it("Activation Success activates the account and enters Active Home", () => {
    // Reaching screen 20 activates the account on mount, then Continue enters
    // the Active_Account experience at /app/active/home (the nav swap target).
    renderAt("/app/pre/onboarding/activation-success");

    expect(useLienPayStore.getState().activationStatus).toBe("active");
    expect(
      screen.getByText("Your LienPay credit line is ready")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue to Home" }));

    const nav = screen.getByRole("navigation", { name: "Active account" });
    expect(within(nav).getAllByRole("button")).toHaveLength(4);
    expect(
      screen.queryByRole("button", { name: "Check My Limit" })
    ).not.toBeInTheDocument();
  });
});

