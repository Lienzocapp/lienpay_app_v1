import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  it("renders icon-only Profile and Notifications controls with accessible labels", () => {
    render(<TopBar />);
    expect(screen.getByRole("button", { name: "Profile" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Notifications" })
    ).toBeInTheDocument();
  });

  it("allows overriding the control labels", () => {
    render(
      <TopBar profileLabel="Your profile" notificationsLabel="Alerts" />
    );
    expect(
      screen.getByRole("button", { name: "Your profile" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alerts" })).toBeInTheDocument();
  });

  it("invokes the control callbacks (no routing performed)", () => {
    const onProfileClick = vi.fn();
    const onNotificationsClick = vi.fn();
    render(
      <TopBar
        onProfileClick={onProfileClick}
        onNotificationsClick={onNotificationsClick}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Profile" }));
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(onProfileClick).toHaveBeenCalledTimes(1);
    expect(onNotificationsClick).toHaveBeenCalledTimes(1);
  });

  it("renders caller-supplied leading content", () => {
    render(<TopBar leading={<span>LienPay</span>} />);
    expect(screen.getByText("LienPay")).toBeInTheDocument();
  });
});
