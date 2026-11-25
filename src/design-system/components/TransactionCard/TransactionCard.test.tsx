import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionCard } from "./TransactionCard";

describe("TransactionCard", () => {
  it("renders merchant and amount as a static row by default", () => {
    render(<TransactionCard merchant="DMart" amount="₹1,856" />);
    expect(screen.getByText("DMart")).toBeInTheDocument();
    expect(screen.getByText("₹1,856")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("formats a numeric paise amount", () => {
    render(<TransactionCard merchant="Cafe" amount={124800} />);
    expect(screen.getByText("₹1,248")).toBeInTheDocument();
  });

  it("renders as a button and fires onClick when interactive", async () => {
    const onClick = vi.fn();
    render(<TransactionCard merchant="X" amount="₹1" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
