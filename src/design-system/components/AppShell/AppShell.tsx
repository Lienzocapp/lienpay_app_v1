/**
 * AppShell — the Product_Application frame (presentational).
 *
 * A GENERIC, reusable frame component authored once (Req 14.1, 14.3, 14.6). It
 * composes the frame layout: an optional TopBar slot, the routed content, and
 * an optional BottomNavigation slot. It wires up NO routing and knows nothing
 * about specific screens — callers pass the TopBar and BottomNavigation via
 * slots (typically the `TopBar` and `BottomNavigation` components) and the
 * screen content via `children`.
 *
 * The content region is a `<main>` landmark (a single main per shell). Colors
 * come exclusively from design tokens (Req 1.2, 14.5); the base surface uses
 * the Background token (Req 1.4).
 *
 * Requirements: 14.1; 3.6/3.8/10.4 are satisfied by the slotted TopBar /
 * BottomNavigation components.
 * Design: Components and Interfaces (AppShell), Responsive Architecture.
 */
import type { ReactNode } from "react";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  /** Top bar slot (typically the `TopBar` component). */
  topBar?: ReactNode;
  /** Bottom navigation slot (typically the `BottomNavigation` component). */
  bottomNav?: ReactNode;
  /** Routed screen content. */
  children: ReactNode;
  /** Accessible label for the main content landmark. */
  contentLabel?: string;
}

export function AppShell({
  topBar,
  bottomNav,
  children,
  contentLabel,
}: AppShellProps) {
  return (
    <div className={styles.shell}>
      {topBar != null ? <div className={styles.topSlot}>{topBar}</div> : null}
      <main className={styles.content} aria-label={contentLabel}>
        {children}
      </main>
      {bottomNav != null ? (
        <div className={styles.bottomSlot}>{bottomNav}</div>
      ) : null}
    </div>
  );
}
