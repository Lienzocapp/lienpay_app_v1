import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CreditHealthCard } from "./CreditHealthCard";

describe("CreditHealthCard", () => {
  it("renders the label and health value supplied via props", () => {
    render(<CreditHealthCard label="Credit Health" health="Healthy" />);
    expect(screen.getByText("Credit Health")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("applies the financial-figure typography style to the value", () => {
    render(<CreditHealthCard label="Health" health="Healthy" />);
    expect(screen.getByText("Healthy").className).toContain(
      "text-financial-figure"
    );
  });

  it("renders an optional caption", () => {
    render(
      <CreditHealthCard label="Health" health="Healthy" caption="on track" />
    );
    expect(screen.getByText("on track")).toBeInTheDocument();
  });
});
