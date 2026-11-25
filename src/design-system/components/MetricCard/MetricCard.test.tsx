import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("renders label and string value (e.g. LTV) verbatim", () => {
    render(<MetricCard label="Current LTV" value="34%" />);
    expect(screen.getByText("Current LTV")).toBeInTheDocument();
    expect(screen.getByText("34%")).toBeInTheDocument();
  });

  it("formats a numeric paise value", () => {
    render(<MetricCard label="Used" value={0} />);
    expect(screen.getByText("₹0")).toBeInTheDocument();
  });

  it("applies the financial-figure typography style", () => {
    render(<MetricCard label="Credit Limit" value="₹2,21,500" />);
    expect(screen.getByText("₹2,21,500").className).toContain(
      "text-financial-figure"
    );
  });
});
