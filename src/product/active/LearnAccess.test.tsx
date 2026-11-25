/**
 * Active Learn access example tests (task 18.4).
 *
 * Verifies the Learn experience is reachable in the Active_Account_Experience
 * via an in-app affordance (the Profile / account area) but is NEVER a
 * bottom-nav tab — the Active_Account Bottom_Navigation stays exactly the four
 * items Home/Transactions/Repayments/Portfolio (Req 11.14, 10.1).
 *
 * Requirements: 11.14, 10.1, 10.9. Design: Navigation Architecture (Active route
 * table — Learn never a tab), Testing Strategy.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("Active Learn access (task 18.4)", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
    useLienPayStore.setState({ activationStatus: "active" });
  });

  it("does not add Learn as a bottom-nav tab (still exactly 4 tabs)", () => {
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
    expect(
      within(nav).queryByRole("button", { name: "Learn" })
    ).not.toBeInTheDocument();
  });

  it("makes Learn reachable via the in-app Profile affordance", async () => {
    const user = userEvent.setup();
    renderAt("/app/active/profile");

    // The Profile screen exposes the Learn access point (not a bottom-nav tab).
    const learnControl = screen.getByRole("button", { name: "Learn" });
    await user.click(learnControl);

    // Navigation reaches the Learn screen (its heading is present).
    expect(
      screen.getByRole("heading", { name: "Learn" })
    ).toBeInTheDocument();

    // Bottom nav is unaffected — still exactly the four active tabs.
    const nav = screen.getByRole("navigation", { name: "Active account" });
    expect(within(nav).getAllByRole("button")).toHaveLength(4);
  });
});
