/**
 * TopBar — top navigation area (presentational frame component).
 *
 * A GENERIC, reusable frame component authored once (Req 14.1, 14.3, 14.6). It
 * hosts the icon-only Profile and Notifications controls. It wires up NO
 * routing — selection is surfaced via optional callbacks; the placement of
 * Profile/Notifications in the Top_Bar (and never in the bottom nav) is a
 * navigation rule enforced elsewhere.
 *
 * Each icon-only control has an accessible text label via `aria-label`
 * (Req 3.8) — the design explicitly requires accessible labels for the Top_Bar
 * Profile and Notifications controls. Labels default to generic control names
 * and can be overridden via props. Icons default to token-driven inline SVGs
 * (drawn with `currentColor`, so they inherit the token text color) and can be
 * overridden. Colors come exclusively from design tokens (Req 1.2, 14.5).
 *
 * Requirements: 14.1, 3.8; 3.7 (focus), 15.1 (touch targets).
 * Design: Components and Interfaces (TopBar), Accessibility.
 */
import type { ReactNode } from "react";
import styles from "./TopBar.module.css";

export interface TopBarProps {
  /** Optional leading content (brand/title). Supplied by caller (no invented copy). */
  leading?: ReactNode;
  /**
   * Optional brand wordmark rendered on the leading edge (e.g. "LienPay") with a
   * small controlled neon accent dot. Presentational only — the caller supplies
   * the product name; no copy is invented here.
   */
  brand?: string;
  /** Accessible label for the Profile control. */
  profileLabel?: string;
  /** Accessible label for the Notifications control. */
  notificationsLabel?: string;
  /** Icon for the Profile control (decorative; label is the accessible name). */
  profileIcon?: ReactNode;
  /** Icon for the Notifications control (decorative; label is the accessible name). */
  notificationsIcon?: ReactNode;
  /** Invoked when the Profile control is activated (no routing performed here). */
  onProfileClick?: () => void;
  /** Invoked when the Notifications control is activated (no routing performed here). */
  onNotificationsClick?: () => void;
  /**
   * Where the Profile control is placed. `"trailing"` (default) keeps it beside
   * Notifications on the right; `"leading"` renders it as a circular avatar on
   * the left edge (the LienPay Active Home reference layout). The control is the
   * same accessible button either way.
   */
  profilePlacement?: "leading" | "trailing";
  /** When true, shows a small neon status dot on the Profile control. */
  profileStatus?: boolean;
  /** When true, shows a small neon status dot on the Notifications control. */
  notificationsStatus?: boolean;
  /** Accessible label for the banner landmark. */
  ariaLabel?: string;
}

/** Default Profile icon — a simple person glyph drawn with the current text token color. */
function DefaultProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Default Notifications icon — a simple bell glyph drawn with the current text token color. */
function DefaultNotificationsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <path
        d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TopBar({
  leading,
  brand,
  profileLabel = "Profile",
  notificationsLabel = "Notifications",
  profileIcon,
  notificationsIcon,
  onProfileClick,
  onNotificationsClick,
  profilePlacement = "trailing",
  profileStatus = false,
  notificationsStatus = false,
  ariaLabel = "Top bar",
}: TopBarProps) {
  const profileControl = (
    <button
      type="button"
      className={
        profilePlacement === "leading" ? styles.avatarControl : styles.control
      }
      aria-label={profileLabel}
      onClick={onProfileClick}
    >
      <span className={styles.icon}>{profileIcon ?? <DefaultProfileIcon />}</span>
      {profileStatus ? (
        <span className={styles.statusDot} aria-hidden="true" />
      ) : null}
    </button>
  );

  const notificationsControl = (
    <button
      type="button"
      className={styles.control}
      aria-label={notificationsLabel}
      onClick={onNotificationsClick}
    >
      <span className={styles.icon}>
        {notificationsIcon ?? <DefaultNotificationsIcon />}
      </span>
      {notificationsStatus ? (
        <span className={styles.statusDot} aria-hidden="true" />
      ) : null}
    </button>
  );

  return (
    <header className={styles.bar} role="banner" aria-label={ariaLabel}>
      <div className={styles.leading}>
        {profilePlacement === "leading" ? profileControl : null}
        {brand != null ? (
          <span className={styles.brand}>
            {brand}
            <span className={styles.brandDot} aria-hidden="true">
              .
            </span>
          </span>
        ) : null}
        {leading}
      </div>
      <div className={styles.controls}>
        {profilePlacement === "trailing" ? profileControl : null}
        {notificationsControl}
      </div>
    </header>
  );
}
