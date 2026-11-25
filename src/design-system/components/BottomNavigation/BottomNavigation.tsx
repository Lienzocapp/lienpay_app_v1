/**
 * BottomNavigation — persistent bottom navigation bar (presentational).
 *
 * A GENERIC, reusable frame component authored once (Req 14.1, 14.3, 14.6). It
 * renders STRICTLY from the `items` it is passed — it cannot be given extra
 * items beyond that list, and it wires up no routing or navigation logic (the
 * exactly-3 / exactly-4 tab rules are enforced centrally by navConfig/guards,
 * and real routing is wired in a later phase). Callers pass the current
 * `activeId`; selection is surfaced via the optional `onSelect` callback.
 *
 * The active item is signaled by BOTH a neon green accent AND a non-color
 * secondary indicator (a visible indicator bar, bolder weight, and
 * `aria-current`), so the active state is never signaled by color alone
 * (Req 3.6, 10.4). Colors come exclusively from design tokens (Req 1.2, 14.5).
 *
 * Requirements: 14.1, 3.6, 3.8, 10.4; 15.1 (touch targets), 3.7 (focus).
 * Design: Components and Interfaces (BottomNavigation), Accessibility,
 * Enforcing exactly-N tabs (rendering strictly from the tuple).
 */
import type { ReactNode } from "react";
import styles from "./BottomNavigation.module.css";

export interface BottomNavigationItem {
  /** Stable item id (e.g. "home"). */
  id: string;
  /** Visible label — supplied by the caller (no invented copy). */
  label: string;
  /** Optional leading icon (decorative; the label is the accessible name). */
  icon?: ReactNode;
}

export interface BottomNavigationProps {
  /** The exact set of items to render, in order. The component renders no more. */
  items: readonly BottomNavigationItem[];
  /** The id of the currently active item. */
  activeId: string;
  /** Called with the selected item id (no routing performed here). */
  onSelect?: (id: string) => void;
  /** Accessible label for the navigation landmark. */
  ariaLabel?: string;
}

export function BottomNavigation({
  items,
  activeId,
  onSelect,
  ariaLabel = "Primary",
}: BottomNavigationProps) {
  return (
    <nav className={styles.nav} aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        const classes = [styles.item, isActive ? styles.itemActive : null]
          .filter(Boolean)
          .join(" ");
        return (
          <button
            key={item.id}
            type="button"
            className={classes}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onSelect?.(item.id)}
          >
            {isActive ? <span className={styles.indicator} aria-hidden="true" /> : null}
            {item.icon != null ? (
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
