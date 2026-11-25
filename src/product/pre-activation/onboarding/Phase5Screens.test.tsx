/**
 * Phase 5 screens (11–17) example tests — verification loading, bank validation,
 * and the e-Sign gate (task 10.5).
 *
 * Covers Req 13.5 (a LoadingState shows during simulated verification and the
 * matching status is set on success), Req 8.3 (malformed/empty bank input is
 * rejected with an inline field error and retained values), and Req 8.6 (e-Sign
 * incompletion blocks advancement and shows the e-Sign-required error). The
 * Mock_Service verification/setup calls are stubbed so the tests are
 * deterministic and fast while still exercising the real screen logic and the
 * single centralized store.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KycScreen } from "./VerificationScreens";
import { BankAccountScreen } from "./BankAccountScreen";
import { ESignScreen } from "./ESignScreen";
import { useLienPayStore } from "../../../state/store";
import { mockService } from "../../../mock/mockService";

describe("Phase 5 screens (11–17)", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("KycScreen (screen 11)", () => {
    it("shows a LoadingState during simulated verification and completes on success", async () => {
      let resolveSubmit: (value: { status: "success" }) => void = () => {};
      vi.spyOn(mockService, "submitKyc").mockReturnValue(
        new Promise((resolve) => {
          resolveSubmit = resolve as typeof resolveSubmit;
        })
      );
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      render(<KycScreen onAdvance={onAdvance} />);

      await user.click(screen.getByRole("button", { name: "Submit" }));

      // While pending, the shared LoadingState (role="status") is shown.
      expect(await screen.findByRole("status")).toBeInTheDocument();
      expect(onAdvance).not.toHaveBeenCalled();

      // Resolve the simulated verification: status is set and the flow advances.
      resolveSubmit({ status: "success" });
      await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
      expect(useLienPayStore.getState().verificationStatus.kyc).toBe(
        "complete"
      );
    });
  });

  describe("BankAccountScreen (screen 14)", () => {
    it("rejects a submit with an empty required field, shows an inline error, and retains values", async () => {
      const captureSpy = vi.spyOn(mockService, "captureBankAccount");
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      render(<BankAccountScreen onAdvance={onAdvance} />);

      // Fill only two of the three required fields.
      await user.type(
        screen.getByLabelText("Account holder name"),
        "Test User"
      );
      await user.type(screen.getByLabelText("Account number"), "123456789012");
      // Leave IFSC code empty.

      await user.click(screen.getByRole("button", { name: "Continue" }));

      // Submission rejected: no capture call, no advancement.
      expect(captureSpy).not.toHaveBeenCalled();
      expect(onAdvance).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent(
        "This field is required"
      );
      // Entered values are retained.
      expect(screen.getByLabelText("Account holder name")).toHaveValue(
        "Test User"
      );
      expect(screen.getByLabelText("Account number")).toHaveValue(
        "123456789012"
      );
    });

    it("captures via Mock_Service and advances when all required fields are valid", async () => {
      vi.spyOn(mockService, "captureBankAccount").mockResolvedValue({
        status: "success",
      });
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      render(<BankAccountScreen onAdvance={onAdvance} />);

      await user.type(
        screen.getByLabelText("Account holder name"),
        "Test User"
      );
      await user.type(screen.getByLabelText("Account number"), "123456789012");
      await user.type(screen.getByLabelText("IFSC code"), "HDFC0001234");

      await user.click(screen.getByRole("button", { name: "Continue" }));

      await waitFor(() => expect(onAdvance).toHaveBeenCalledTimes(1));
      expect(useLienPayStore.getState().bankVerificationStatus).toBe(
        "complete"
      );
    });
  });

  describe("ESignScreen (screen 17)", () => {
    it("blocks advancement when e-Sign is not completed and shows the required error", async () => {
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      render(<ESignScreen onAdvance={onAdvance} />);

      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onAdvance).not.toHaveBeenCalled();
      expect(useLienPayStore.getState().eSignStatus).toBe("not_started");
    });

    it("advances and marks e-Sign complete once the e-Sign action is completed", async () => {
      const user = userEvent.setup();
      const onAdvance = vi.fn();
      render(<ESignScreen onAdvance={onAdvance} />);

      await user.click(screen.getByRole("checkbox"));
      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(onAdvance).toHaveBeenCalledTimes(1);
      expect(useLienPayStore.getState().eSignStatus).toBe("complete");
    });
  });
});
