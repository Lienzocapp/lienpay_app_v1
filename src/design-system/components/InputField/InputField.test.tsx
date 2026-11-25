import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { InputField } from "./InputField";

describe("InputField", () => {
  it("associates the label with the input", () => {
    render(<InputField label="Mobile number" />);
    const input = screen.getByLabelText("Mobile number");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("keeps the label available to assistive tech when hidden", () => {
    render(<InputField label="Mobile number" hideLabel />);
    // Still resolvable by accessible name even when visually hidden.
    expect(screen.getByLabelText("Mobile number")).toBeInTheDocument();
  });

  it("marks the input invalid and links the error message when error is present", () => {
    render(<InputField label="Name" error="Name is required" />);
    const input = screen.getByLabelText("Name");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent("Name is required");
    expect(input.getAttribute("aria-describedby")).toContain(error.id);
  });

  it("has no invalid state when there is no error", () => {
    render(<InputField label="Name" />);
    const input = screen.getByLabelText("Name");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
