/**
 * OtpVerificationScreen example tests — validation, error states, advance
 * (Req 6.3, 6.5, 6.6, 5.5).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OtpVerificationScreen } from "./OtpVerificationScreen";
import { useLienPayStore } from "../../../state/store";
import { mockService } from "../../../mock/mockService";

vi.mock("../../../mock/mockService", () => ({
  mockService: {
    verifyOtp: vi.fn(async () => ({ status: "success" as const })),
    sendOtp: vi.fn(async () => ({ status: "success" as const })),
  },
}));

const verifyOtp = vi.mocked(mockService.verifyOtp);

/** Enters a full OTP string into the first cell (the component distributes it). */
function enterOtp(value: string) {
  const firstCell = screen.getByLabelText("Enter 6-digit OTP digit 1 of 6");
  fireEvent.change(firstCell, { target: { value } });
}

describe("OtpVerificationScreen", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
    verifyOtp.mockClear();
    verifyOtp.mockResolvedValue({ status: "success" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows a required error and does not advance on empty submit", async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(<OtpVerificationScreen onAdvance={onAdvance} />);

    await user.click(screen.getByRole("button", { name: "Verify OTP" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(verifyOtp).not.toHaveBeenCalled();
    expect(onAdvance).not.toHaveBeenCalled();
  });

  it("shows an invalid error for fewer than 6 digits", async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(<OtpVerificationScreen onAdvance={onAdvance} />);

    enterOtp("123");
    await user.click(screen.getByRole("button", { name: "Verify OTP" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(verifyOtp).not.toHaveBeenCalled();
    expect(onAdvance).not.toHaveBeenCalled();
  });

  it("verifies, completes the step, and advances on a 6-digit code", async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(<OtpVerificationScreen onAdvance={onAdvance} />);

    enterOtp("123456");
    await user.click(screen.getByRole("button", { name: "Verify OTP" }));

    await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
    expect(verifyOtp).toHaveBeenCalledWith("123456");
    expect(
      useLienPayStore.getState().onboardingStatus.otpVerification
    ).toBe("complete");
  });
});
