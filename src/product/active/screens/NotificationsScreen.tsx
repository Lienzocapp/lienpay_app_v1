/**
 * ActiveNotifications — the Active_Account Notifications screen (task 18.3).
 *
 * Reachable from the Top_Bar Notifications control (route
 * `/app/active/notifications`, Req 10.6, 10.7); Notifications is a Top_Bar
 * destination and NEVER a bottom-nav tab (Req 10.2, 10.9 — enforced by the
 * shell's fixed 4-item ACTIVE_NAV). It renders the items requiring the user's
 * attention as shared `NotificationItem` rows, driven entirely by the
 * centralized `selectNotifications` selector so the list stays reactive to
 * Application_State without any local copy of the data (Req 11.6, 19.4).
 *
 * States (Req 11.7, 11.8), mirroring the Transactions screen pattern:
 *  - Empty-state: when there are no notifications, the shared empty-state
 *    message is shown instead of the list. The canonical Initial_Snapshot starts
 *    with no notifications, so this is the current state.
 *  - Error-state: the screen probes the Mock_Service on mount purely as a
 *    data-load health check; if that load fails, the shared `ErrorState` is
 *    shown (with a retry) WHILE any previously displayed values from the
 *    centralized store are retained (Req 11.8). The probe never overwrites the
 *    store — the store remains the single display source of truth.
 *
 * Content source of truth (Req 11.6, 20.1, 20.2, 20.4, 18.3): no notification
 * rows are invented — the list renders only entries actually present in central
 * state (currently none). The exact screen header microcopy is not legible in
 * the source, so a minimal functional heading ("Notifications") is used and the
 * exact copy is FLAGGED rather than invented.
 *
 * Requirements: 11.6, 11.7, 11.8, 10.6, 10.7, 19.4, 20.1, 20.2, 20.4.
 * Design: Components and Interfaces (NotificationItem), Error Handling.
 */
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ErrorState,
  NotificationItem,
  SecondaryButton,
} from "../../../design-system/components";
import { fadeSlide } from "../../../animation/product";
import { mockService } from "../../../mock/mockService";
import { selectNotifications } from "../../../state/selectors";
import { useLienPayStore } from "../../../state/store";
import styles from "./active.module.css";

export function ActiveNotifications() {
  // Centralized, reactive display source (Req 11.6, 19.4).
  const notifications = useLienPayStore(selectNotifications);

  const [loadError, setLoadError] = useState(false);

  // Data-load health probe (Req 11.8). We deliberately do NOT hydrate the store
  // from the result: the store is the single display source of truth, so the
  // probe only detects a load failure and never overwrites displayed values.
  const probe = useCallback(() => {
    let active = true;
    mockService
      .getNotifications()
      .then((result) => {
        if (!active) return;
        setLoadError(result.status === "error");
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => probe(), [probe]);

  const hasNotifications = notifications.length > 0;

  return (
    <motion.section
      className={styles.list}
      aria-label="Notifications"
      variants={fadeSlide()}
      initial="initial"
      animate="animate"
    >
      {/* Minimal functional heading — exact source header microcopy is not
          legible and is intentionally not invented (flagged). */}
      <h1 className={`text-heading ${styles.heading}`}>Notifications</h1>

      {/* Error-state: shown on a data-load failure while previously displayed
          values are retained below (Req 11.8). */}
      {loadError ? (
        <ErrorState
          title="Couldn't load notifications"
          message="The notification data could not be loaded. Showing the last available values."
          action={
            <SecondaryButton onClick={() => probe()}>Retry</SecondaryButton>
          }
        />
      ) : null}

      {hasNotifications ? (
        <ul className={styles.rows} aria-label="Notifications">
          {notifications.map((n) => (
            <li key={n.id}>
              <NotificationItem title={n.title} body={n.body} unread={n.unread} />
            </li>
          ))}
        </ul>
      ) : (
        // Premium empty-state (Req 11.7). Keeps the "No notifications yet."
        // message as the supporting line beneath a reassuring title.
        <div className={styles.emptyState} role="status">
          <span className={styles.emptyIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
              <path
                d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M10 19a2 2 0 0 0 4 0"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <p className={styles.emptyTitle}>You&rsquo;re all caught up</p>
          <p className={styles.empty}>No notifications yet.</p>
        </div>
      )}
    </motion.section>
  );
}
