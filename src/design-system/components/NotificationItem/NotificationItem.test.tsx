import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationItem } from "./NotificationItem";

describe("NotificationItem", () => {
  it("renders the title and body supplied via props", () => {
    render(<NotificationItem title="Payment received" body="Your payment posted" />);
    expect(screen.getByText("Payment received")).toBeInTheDocument();
    expect(screen.getByText("Your payment posted")).toBeInTheDocument();
  });

  it("exposes a non-color 'Unread' text label when unread", () => {
    render(<NotificationItem title="New" unread />);
    expect(screen.getByText("Unread")).toBeInTheDocument();
  });

  it("renders as a button and reports clicks when onClick is provided", async () => {
    const onClick = vi.fn();
    render(<NotificationItem title="Tap me" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: /Tap me/ }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders as a static row when no onClick is provided", () => {
    render(<NotificationItem title="Static" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
