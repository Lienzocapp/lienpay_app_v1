import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RepaymentCard } from "./RepaymentCard";

describe("RepaymentCard", () => {
  it("renders the label and amount supplied via props", () => {
    render(<RepaymentCard label="March repayment" amount="₹8,240" />);
    expect(screen.getByText("March repayment")).toBeInTheDocument();
    expect(screen.getByText("₹8,240")).toBeInTheDocument();
  });

  it("formats a numeric paise amount via the central formatter", () => {
    render(<RepaymentCard label="Repayment" amount={824000} />);
    expect(screen.getByText("₹8,240")).toBeInTheDocument();
  });

  it("renders optional meta and status when provided", () => {
    render(
      <RepaymentCard
        label="Repayment"
        amount="₹1"
        meta="12 Mar 2024"
        status="Paid"
      />
    );
    expect(screen.getByText("12 Mar 2024")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });
});
