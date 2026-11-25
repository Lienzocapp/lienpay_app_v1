/**
 * NameSetupScreen example tests — validation, error states, store + advance
 * (Req 6.4, 6.6, 5.5).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NameSetupScreen } from "./NameSetupScreen";
import { useLienPayStore } from "../../../state/store";

describe("NameSetupScreen", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows a required error and does not advance on empty submit", async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(<NameSetupScreen onAdvance={onAdvance} />);

    await user.click(screen.getByRole("button", { name: "Set up my ID" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(onAdvance).not.toHaveBeenCalled();
    expect(useLienPayStore.getState().session.userName).toBeNull();
  });

  it("rejects a whitespace-only name and retains the value", async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(<NameSetupScreen onAdvance={onAdvance} />);

    const input = screen.getByLabelText("Enter your name");
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: "Set up my ID" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(input).toHaveValue("   ");
    expect(onAdvance).not.toHaveBeenCalled();
    expect(useLienPayStore.getState().session.userName).toBeNull();
  });

  it("stores the name, completes the step, and advances on a valid name", async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(<NameSetupScreen onAdvance={onAdvance} />);

    await user.type(screen.getByLabelText("Enter your name"), "Asha Rao");
    await user.click(screen.getByRole("button", { name: "Set up my ID" }));

    expect(onAdvance).toHaveBeenCalledTimes(1);
    expect(useLienPayStore.getState().session.userName).toBe("Asha Rao");
    expect(useLienPayStore.getState().onboardingStatus.nameSetup).toBe(
      "complete"
    );
  });
});
