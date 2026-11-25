/**
 * LienPay — navigation guards (exactly-N tab enforcement).
 *
 * `assertNav()` validates the centralized navigation tuples at module load and
 * in tests: `PRE_ACTIVATION_NAV` must be EXACTLY 3 items and `ACTIVE_NAV`
 * EXACTLY 4, and neither may contain a forbidden bottom-nav item (profile,
 * notifications, pay, learn, creditLimitIncrease, activate). This makes the
 * exactly-3 / exactly-4 rules and the Top_Bar-only placement of Profile /
 * Notifications structurally impossible to violate.
 *
 * This module wires up no UI. The `BottomNavigation` component (task 4.8) will
 * render strictly from the validated tuples and cannot be passed extra items.
 *
 * Requirements: 9.1, 9.5, 10.1, 10.2, 10.9, 11.13, 11.14, 21.2.
 * Design: Navigation Architecture, Enforcing exactly-N tabs.
 */
import {
  ACTIVE_NAV,
  FORBIDDEN_BOTTOM_NAV_ITEMS,
  PRE_ACTIVATION_NAV,
} from "./navConfig";

/** Number of items required in the pre-activation bottom navigation (Req 9.1). */
export const PRE_ACTIVATION_NAV_LENGTH = 3;

/** Number of items required in the active-account bottom navigation (Req 10.1). */
export const ACTIVE_NAV_LENGTH = 4;

/**
 * Validates the centralized navigation tuples. Throws if either tuple has the
 * wrong length or contains a forbidden bottom-nav item.
 *
 * @throws Error if `PRE_ACTIVATION_NAV` is not exactly 3 items.
 * @throws Error if `ACTIVE_NAV` is not exactly 4 items.
 * @throws Error if either tuple contains a forbidden bottom-nav item.
 */
export function assertNav(): void {
  if (PRE_ACTIVATION_NAV.length !== PRE_ACTIVATION_NAV_LENGTH) {
    throw new Error(
      `Pre-activation nav must be exactly ${PRE_ACTIVATION_NAV_LENGTH} items`
    );
  }
  if (ACTIVE_NAV.length !== ACTIVE_NAV_LENGTH) {
    throw new Error(`Active nav must be exactly ${ACTIVE_NAV_LENGTH} items`);
  }

  const forbidden = new Set<string>(FORBIDDEN_BOTTOM_NAV_ITEMS);
  const offenders = [...PRE_ACTIVATION_NAV, ...ACTIVE_NAV].filter((item) =>
    forbidden.has(item)
  );
  if (offenders.length > 0) {
    throw new Error(
      `Forbidden bottom-nav item(s): ${[...new Set(offenders)].join(", ")}`
    );
  }
}

/**
 * Reports whether an arbitrary item id is forbidden from any bottom navigation
 * (Req 10.2, 10.9, 21.2, 11.13, 11.14). Useful for defensive checks in
 * consumers and tests.
 *
 * @param item - The candidate nav item id.
 * @returns `true` if the item must not appear in a bottom navigation.
 */
export function isForbiddenBottomNavItem(item: string): boolean {
  return (FORBIDDEN_BOTTOM_NAV_ITEMS as readonly string[]).includes(item);
}

// Validate the centralized tuples at module load so any misconfiguration fails
// fast (Req 9.1, 10.1).
assertNav();
