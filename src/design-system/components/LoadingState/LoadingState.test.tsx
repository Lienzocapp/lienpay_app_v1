import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "./LoadingState";

describe("LoadingState", () => {
  it("renders an accessible status region", () => {
    render(<LoadingState label="Processing" />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("uses ariaLabel as the accessible name when no visible label", () => {
    render(<LoadingState ariaLabel="Loading data" />);
    expect(screen.getByRole("status", { name: "Loading data" })).toBeInTheDocument();
  });
});
