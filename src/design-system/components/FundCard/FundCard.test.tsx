import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FundCard } from "./FundCard";

describe("FundCard", () => {
  it("renders name and value, reflecting an unselected state", () => {
    render(<FundCard id="f1" name="Fund A" value="₹1,00,000" />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Fund A")).toBeInTheDocument();
    expect(screen.getByText("₹1,00,000")).toBeInTheDocument();
  });

  it("reflects the selected state via aria-pressed", () => {
    render(<FundCard id="f1" name="Fund A" value={100000} selected />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("reports toggles with the fund id", async () => {
    const onToggle = vi.fn();
    render(<FundCard id="f9" name="Fund" value="₹1" onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledWith("f9");
  });

  it("does not toggle when disabled", async () => {
    const onToggle = vi.fn();
    render(
      <FundCard id="f9" name="Fund" value="₹1" onToggle={onToggle} disabled />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onToggle).not.toHaveBeenCalled();
  });
});
