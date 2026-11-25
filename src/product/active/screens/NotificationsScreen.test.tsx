/**
 * Notifications screen example tests (task 18.4).
 *
 * Verifies the Notifications screen shows the shared empty-state message when
 * there are no records (Req 11.7 — the canonical Initial_Snapshot starts with no
 * notifications), renders the shared `NotificationItem` list when records exist
 * (Req 11.6), and shows the shared error-state while retaining previously
 * displayed values when a mock data load fails (Req 11.8).
 *
 * Requirements: 11.6, 11.7, 11.8. Design: Error Handling, Testing Strategy.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { ActiveNotifications } from "./NotificationsScreen";
import { mockService } from "../../../mock/mockService";
import { useLienPayStore } from "../../../state/store";
import type { Notification } from "../../../state/types";

describe("Notifications screen states (task 18.4)", () => {
  beforeEach(() => {
    useLienPayStore.getState().resetToSnapshot();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useLienPayStore.getState().resetToSnapshot();
  });

  it("shows the empty-state message when there are no notifications", () => {
    // Deterministic successful probe (no lingering random timer).
    vi.spyOn(mockService, "getNotifications").mockResolvedValue({
      status: "success",
      data: [],
    });
    // Clear any seeded notifications so the screen shows the empty state.
    useLienPayStore.setState({ notifications: [] });
    expect(useLienPayStore.getState().notifications).toHaveLength(0);

    render(<ActiveNotifications />);

    expect(screen.getByText("No notifications yet.")).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Notifications" })
    ).not.toBeInTheDocument();
  });

  it("renders NotificationItem rows from central state when records exist", () => {
    vi.spyOn(mockService, "getNotifications").mockResolvedValue({
      status: "success",
      data: [],
    });
    const records: Notification[] = [
      { id: "n1", title: "Payment received", body: "A payment was recorded.", unread: true },
      { id: "n2", title: "Statement ready", body: "Your statement is available.", unread: false },
    ];
    useLienPayStore.setState({ notifications: records });

    render(<ActiveNotifications />);

    const list = screen.getByRole("list", { name: "Notifications" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(within(list).getByText("Payment received")).toBeInTheDocument();
    expect(within(list).getByText("Statement ready")).toBeInTheDocument();
    expect(
      screen.queryByText("No notifications yet.")
    ).not.toBeInTheDocument();
  });

  it("shows the error-state and retains previously displayed values on load failure", async () => {
    vi.spyOn(mockService, "getNotifications").mockResolvedValue({
      status: "error",
      error: "data unavailable",
    });
    const records: Notification[] = [
      { id: "n1", title: "Payment received", body: "A payment was recorded.", unread: true },
    ];
    useLienPayStore.setState({ notifications: records });

    render(<ActiveNotifications />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(
      screen.getByText("Couldn't load notifications")
    ).toBeInTheDocument();

    // Previously displayed values are retained (list still shown).
    const list = screen.getByRole("list", { name: "Notifications" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(within(list).getByText("Payment received")).toBeInTheDocument();
  });
});
