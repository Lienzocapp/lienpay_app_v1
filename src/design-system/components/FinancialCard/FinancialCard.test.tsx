import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FinancialCard } from "./FinancialCard";

describe("FinancialCard", () => {
  it("renders the label and a display-string value verbatim", () => {
    render(<FinancialCard label="Portfolio Value" value="₹4,72,000" />);
    expect(screen.getByText("Portfolio Value")).toBeInTheDocument();
    expect(screen.getByText("₹4,72,000")).toBeInTheDocument();
  });

  it("formats a numeric paise value via the INR formatter", () => {
    render(<FinancialCard label="Credit Limit" value={22150000} />);
    expect(screen.getByText("₹2,21,500")).toBeInTheDocument();
  });

  it("applies the financial-figure typography style to the value", () => {
    render(<FinancialCard label="Available" value="₹2,21,500" />);
    expect(screen.getByText("₹2,21,500").className).toContain(
      "text-financial-figure"
    );
  });

  it("renders an optional caption", () => {
    render(
      <FinancialCard label="Value" value="₹1" caption="as of today" />
    );
    expect(screen.getByText("as of today")).toBeInTheDocument();
  });
});
