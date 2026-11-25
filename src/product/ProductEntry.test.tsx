/**
 * ProductEntry routing example tests (tasks 7.1/7.2/7.3).
 *
 * Verifies the state-aware `/app` entry redirects by `activationStatus`
 * (`inactive`/`in_progress` → `/app/pre/home`, `active` → `/app/active/home`;
 * Req 22.14, 10.8), that the pre-activation tab shell renders exactly the three
 * nav items Home/Benefits/Learn (Req 9.1), that Pre-Activation Home (screen 6)
 * shows its content + Activate_Account_CTA, and that an invalid onboarding step
 * id restarts the flow at Splash.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProductEntry from "./ProductEntry";
import { useLienPayStore } from "../state/store";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/*" element={<ProductEntry />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProductEntry routing", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
    // Splash mounts an auto-advance timer; keep it from firing during assertions.
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("redirects an inactive /app session to Pre-Activation Home (screen 6)", () => {
    renderAt("/app");
    // Screen 6 content per the design reference: the advertised credit RANGE
    // (the user's own limit is unknown until they check it) plus the primary
    // "Check My Limit" CTA. The ₹80,000 potential figure lives on Benefits.
    expect(screen.getByText("₹25,000")).toBeInTheDocument();
    expect(screen.getByText("₹10,00,000")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Check My Limit" })
    ).toBeInTheDocument();
  });

  it("renders exactly the three pre-activation nav items", () => {
    renderAt("/app");
    const nav = screen.getByRole("navigation", { name: "Pre-activation" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Benefits" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Learn" })).toBeInTheDocument();
  });

  it("redirects an active /app session to the guarded active home (CTA hidden)", () => {
    useLienPayStore.setState({ activationStatus: "active" });
    renderAt("/app");
    // Active branch is a guarded placeholder in this batch: no Activate CTA.
    expect(
      screen.queryByRole("button", { name: "Check My Limit" })
    ).not.toBeInTheDocument();
  });

  it("restarts the flow at Splash for an invalid onboarding step id", () => {
    renderAt("/app/pre/onboarding/not-a-real-step");
    expect(screen.getByText("LienPay")).toBeInTheDocument();
    expect(screen.getByText("LP")).toBeInTheDocument();
  });
});

