/**
 * SplashScreen example tests — auto-advance timing and step completion (Req 6.1).
 *
 * Verifies the splash displays then auto-advances within the mandated 1–3s
 * window and marks the splash onboarding step complete.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SplashScreen, SPLASH_DURATION_MS } from "./SplashScreen";
import { useLienPayStore } from "../../../state/store";

describe("SplashScreen", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders the LienPay wordmark", () => {
    render(<SplashScreen onAdvance={vi.fn()} />);
    expect(screen.getByText("LienPay")).toBeInTheDocument();
  });

  it("uses a display duration within the mandated 1–3s window", () => {
    expect(SPLASH_DURATION_MS).toBeGreaterThanOrEqual(1000);
    expect(SPLASH_DURATION_MS).toBeLessThanOrEqual(3000);
  });

  it("does not advance before the duration elapses, then advances", () => {
    const onAdvance = vi.fn();
    render(<SplashScreen onAdvance={onAdvance} durationMs={2000} />);

    vi.advanceTimersByTime(1999);
    expect(onAdvance).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  it("marks the splash onboarding step complete on mount", () => {
    render(<SplashScreen onAdvance={vi.fn()} />);
    expect(useLienPayStore.getState().onboardingStatus.splash).toBe("complete");
  });
});
