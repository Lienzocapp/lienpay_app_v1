import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressStepper } from "./ProgressStepper";

describe("ProgressStepper", () => {
  it("shows the current position out of the total", () => {
    render(<ProgressStepper current={7} total={20} />);
    expect(screen.getByText("7 of 20")).toBeInTheDocument();
  });

  it("exposes an accessible progressbar with the current value", () => {
    render(<ProgressStepper current={7} total={20} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "7");
    expect(bar).toHaveAttribute("aria-valuemin", "1");
    expect(bar).toHaveAttribute("aria-valuemax", "20");
  });

  it("clamps an out-of-range current value into [1, total]", () => {
    render(<ProgressStepper current={99} total={20} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "20"
    );
  });

  it("renders a caller-supplied label without inventing copy", () => {
    render(<ProgressStepper current={1} total={20} label="Onboarding" />);
    expect(screen.getByText("Onboarding")).toBeInTheDocument();
  });
});
