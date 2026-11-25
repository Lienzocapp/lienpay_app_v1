import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PrimaryButton } from "./PrimaryButton";

describe("PrimaryButton", () => {
  it("renders caller-supplied content as a button", () => {
    render(<PrimaryButton>Continue</PrimaryButton>);
    expect(
      screen.getByRole("button", { name: "Continue" })
    ).toBeInTheDocument();
  });

  it("defaults to type=button", () => {
    render(<PrimaryButton>Go</PrimaryButton>);
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute(
      "type",
      "button"
    );
  });

  it("supports a disabled state and does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <PrimaryButton disabled onClick={onClick}>
        Activate
      </PrimaryButton>
    );
    const button = screen.getByRole("button", { name: "Activate" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("fires onClick when enabled", () => {
    const onClick = vi.fn();
    render(<PrimaryButton onClick={onClick}>Pay</PrimaryButton>);
    fireEvent.click(screen.getByRole("button", { name: "Pay" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
