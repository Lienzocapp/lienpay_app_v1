import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SecondaryButton } from "./SecondaryButton";

describe("SecondaryButton", () => {
  it("renders caller-supplied content as a button", () => {
    render(<SecondaryButton>Back</SecondaryButton>);
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("supports a disabled state", () => {
    render(<SecondaryButton disabled>Back</SecondaryButton>);
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
  });

  it("fires onClick when enabled", () => {
    const onClick = vi.fn();
    render(<SecondaryButton onClick={onClick}>Back</SecondaryButton>);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
