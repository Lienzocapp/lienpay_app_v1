/**
 * LienPay — central notification demo data (single source).
 *
 * The notifications collection exposed exclusively through the centralized
 * `Mock_Service` (`getNotifications`). This is the single central source for
 * notification data and is kept consistent with the canonical
 * Initial_Snapshot, which starts with no notifications. An empty collection
 * drives the Notifications empty-state (Req 11.7); the Notifications screen
 * (task 14.x) reconciles any mandated notification content against the
 * higher-precedence LienPay Application Design Specification before that screen
 * is built (Req 18.1, 20.1, 20.2, 20.4). No screen consumes this data yet.
 *
 * Requirements: 11.7 (empty-state when no records), 12.5 (one central data
 * source).
 * Design: Mock Service Architecture, Data Models (Notification), Folder
 * Structure (mock/data/notifications.ts).
 */
import type { Notification } from "../../state/types";

/**
 * The central notification demo data. Empty by default, consistent with the
 * canonical Initial_Snapshot (`notifications: []`).
 */
export const NOTIFICATIONS_DATA: readonly Notification[] = [
  {
    id: "notif-1",
    title: "Credit line activated",
    body: "Your LienPay credit line is now active and ready to use.",
    unread: false,
  },
  {
    id: "notif-2",
    title: "Upcoming payment reminder",
    body: "You have a repayment of ₹8,240 due on 14 Aug.",
    unread: true,
  },
  {
    id: "notif-3",
    title: "New transaction",
    body: "₹1,248 was spent at Cafe Delhi Heights.",
    unread: true,
  },
];
