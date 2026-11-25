import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BottomNavigation, type BottomNavigationItem } from "./BottomNavigation";

const ACTIVE_ITEMS: readonly BottomNavigationItem[] = [
  { id: "home", label: "Home" },
  { id: "transactions", label: "Transactions" },
  { id: "repayments", label: "Repayments" },
  { id: "portfolio", label: "Portfolio" },
];

describe("BottomNavigation", () => {
  it("renders strictly the items it is given, in order", () => {
    render(<BottomNavigation items={ACTIVE_ITEMS} activeId="home" />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
    expect(buttons.map((b) => b.textContent)).toEqual([
      "Home",
      "Transactions",
      "Repayments",
      "Portfolio",
    ]);
  });

  it("marks exactly one active item with aria-current (non-color indicator)", () => {
    render(<BottomNavigation items={ACTIVE_ITEMS} activeId="repayments" />);
    const current = screen.getAllByRole("button").filter(
      (b) => b.getAttribute("aria-current") === "page"
    );
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Repayments");
  });

  it("invokes onSelect with the item id (no routing performed)", () => {
    const onSelect = vi.fn();
    render(
      <BottomNavigation items={ACTIVE_ITEMS} activeId="home" onSelect={onSelect} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Portfolio" }));
    expect(onSelect).toHaveBeenCalledWith("portfolio");
  });

  it("exposes a navigation landmark with an accessible label", () => {
    render(
      <BottomNavigation items={ACTIVE_ITEMS} activeId="home" ariaLabel="Account" />
    );
    expect(screen.getByRole("navigation", { name: "Account" })).toBeInTheDocument();
  });
});
