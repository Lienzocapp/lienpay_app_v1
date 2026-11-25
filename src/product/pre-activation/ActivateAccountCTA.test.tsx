/**
 * ActivateAccountCTA unit tests (task 7.6).
 *
 * Asserts the CTA call path and async-safety guard (Design: Activate_Account_CTA
 * async safety; Req 22.8, 22.10, 22.11, 22.13, 13.5):
 *  - routes via the read-only resolver to the correct existing screen;
 *  - is disabled while a blocking op is in progress (`session.asyncInFlight`);
 *  - ignores a rapid double-tap (idempotent — navigates once);
 *  - never triggers a Mock_Service operation itself;
 *  - is hidden when the account is active.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const navigateSpy = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateSpy };
});

import { ActivateAccountCTA } from "./ActivateAccountCTA";
import { useLienPayStore } from "../../state/store";

function renderCTA() {
  return render(
    <MemoryRouter>
      <ActivateAccountCTA />
    </MemoryRouter>
  );
}

/** Marks onboarding steps 1–6 complete so the resolver returns screen 7. */
function completeThroughHome() {
  useLienPayStore.setState({
    onboardingStatus: {
      splash: "complete",
      mobileVerification: "complete",
      otpVerification: "complete",
      nameSetup: "complete",
      welcome: "complete",
      preActivationHome: "complete",
    },
  });
}

describe("ActivateAccountCTA", () => {
  beforeEach(() => {
    navigateSpy.mockReset();
    useLienPayStore.getState().resetToSnapshot();
  });

  it("routes via the read-only resolver to the next incomplete screen", () => {
    completeThroughHome();
    renderCTA();
    fireEvent.click(
      screen.getByRole("button", { name: "Check My Limit" })
    );
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(
      "/app/pre/onboarding/pan-verification"
    );
  });

  it("routes a fresh session to the flow start (Splash) without restarting past steps", () => {
    renderCTA();
    fireEvent.click(
      screen.getByRole("button", { name: "Check My Limit" })
    );
    expect(navigateSpy).toHaveBeenCalledWith("/app/pre/onboarding/splash");
  });

  it("is disabled and does not navigate while a blocking op is in progress", () => {
    useLienPayStore.setState((s) => ({
      session: { ...s.session, asyncInFlight: true },
    }));
    renderCTA();
    const button = screen.getByRole("button", {
      name: "Check My Limit",
    });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("ignores a rapid double-tap (idempotent — navigates once)", () => {
    completeThroughHome();
    renderCTA();
    const button = screen.getByRole("button", {
      name: "Check My Limit",
    });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it("does not mutate Application_State or set asyncInFlight on press", () => {
    completeThroughHome();
    const before = useLienPayStore.getState();
    renderCTA();
    fireEvent.click(
      screen.getByRole("button", { name: "Check My Limit" })
    );
    const after = useLienPayStore.getState();
    // The CTA triggers no mock op: the async-in-flight flag is untouched and
    // the onboarding/activation status is unchanged (read-only resolve).
    expect(after.session.asyncInFlight).toBe(false);
    expect(after.activationStatus).toBe(before.activationStatus);
    expect(after.onboardingStatus).toEqual(before.onboardingStatus);
  });

  it("is hidden when the account is active", () => {
    useLienPayStore.setState({ activationStatus: "active" });
    renderCTA();
    expect(
      screen.queryByRole("button", { name: "Check My Limit" })
    ).not.toBeInTheDocument();
  });
});
