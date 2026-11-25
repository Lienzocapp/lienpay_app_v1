/**
 * MobileVerificationScreen example tests — validation, error states, advance
 * (Req 6.2, 6.5, 6.6, 5.5).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileVerificationScreen } from "./MobileVerificationScreen";
import { useLienPayStore } from "../../../state/store";
import { mockService } from "../../../mock/mockService";

vi.mock("../../../mock/mockService", () => ({
  mockService: {
    sendOtp: vi.fn(async () => ({ status: "success" as const })),
  },
}));

const sendOtp = vi.mocked(mockService.sendOtp);

describe("MobileVerificationScreen", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
    sendOtp.mockClear();
    sendOtp.mockResolvedValue({ status: "success" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows a required error and does not advance on empty submit", async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(<MobileVerificationScreen onAdvance={onAdvance} />);

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(sendOtp).not.toHaveBeenCalled();
    expect(onAdvance).not.toHaveBeenCalled();
  });

  it("shows an invalid error and retains the value for a too-short number", async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(<MobileVerificationScreen onAdvance={onAdvance} />);

    const input = screen.getByLabelText("Enter mobile number");
    await user.type(input, "12345");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(input).toHaveValue("12345"); // value retained (Req 5.5)
    expect(sendOtp).not.toHaveBeenCalled();
    expect(onAdvance).not.toHaveBeenCalled();
  });

  it("sends the OTP, completes the step, and advances on a valid number", async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(<MobileVerificationScreen onAdvance={onAdvance} />);

    await user.type(screen.getByLabelText("Enter mobile number"), "9876543210");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
    expect(sendOtp).toHaveBeenCalledWith("9876543210");
    expect(
      useLienPayStore.getState().onboardingStatus.mobileVerification
    ).toBe("complete");
  });
});
