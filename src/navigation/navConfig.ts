/**
 * LienPay — centralized navigation configuration (single source).
 *
 * Declares the two product navigation sets as FIXED-LENGTH typed tuples so the
 * exactly-3 / exactly-4 tab rules are enforced by the type system as well as at
 * runtime (see `guards.ts`):
 *  - `PRE_ACTIVATION_NAV` — exactly Home, Benefits, Learn (length 3, Req 9.1).
 *  - `ACTIVE_NAV` — exactly Home, Transactions, Repayments, Portfolio
 *    (length 4, Req 10.1).
 *
 * Also declares the route path-structure constants (`/app/pre/*`,
 * `/app/active/*`, and the state-aware `/app` entry) as CONFIG ONLY. This module
 * implements no React Router, no route split (task 4.12), and no screen; the
 * path prefixes are an implementation-architecture device that does not change
 * any product navigation label, tab-count rule, or the Top_Bar placement of
 * Profile/Notifications.
 *
 * Requirements: 9.1, 9.5, 10.1, 10.2, 10.9, 11.13, 11.14, 21.2.
 * Design: Navigation Architecture (route tables, state-aware entry point),
 * Enforcing exactly-N tabs.
 */

/* -------------------------------------------------------------------------- */
/* Navigation item tuples (fixed length)                                      */
/* -------------------------------------------------------------------------- */

/**
 * Pre-activation bottom navigation: EXACTLY three items in order
 * (Req 9.1). Declared `as const` so the length and item literals are fixed.
 */
export const PRE_ACTIVATION_NAV = ["home", "benefits", "learn"] as const;

/**
 * Active-account bottom navigation: EXACTLY four items in order (Req 10.1).
 * Declared `as const` so the length and item literals are fixed.
 */
export const ACTIVE_NAV = [
  "home",
  "transactions",
  "repayments",
  "portfolio",
] as const;

/** A pre-activation bottom-nav item id. */
export type PreActivationNavItem = (typeof PRE_ACTIVATION_NAV)[number];

/** An active-account bottom-nav item id. */
export type ActiveNavItem = (typeof ACTIVE_NAV)[number];

/**
 * Items that MUST NEVER appear in any bottom navigation. Profile and
 * Notifications live only in the Top_Bar (Req 10.2, 10.9); Pay, Learn, Credit
 * Limit Increase, and Activate are reachable elsewhere and are never bottom-nav
 * tabs (Req 21.2, 11.13, 11.14, 22.6).
 */
export const FORBIDDEN_BOTTOM_NAV_ITEMS = [
  "profile",
  "notifications",
  "pay",
  "learn",
  "creditLimitIncrease",
  "activate",
] as const;

/** A forbidden bottom-nav item id. */
export type ForbiddenBottomNavItem = (typeof FORBIDDEN_BOTTOM_NAV_ITEMS)[number];

/* -------------------------------------------------------------------------- */
/* Route path-structure constants (config only)                              */
/* -------------------------------------------------------------------------- */

/**
 * Route path-structure constants. These describe the intended path namespacing
 * only; they wire up no router (the route split is task 4.12).
 */
export const ROUTES = {
  /** Landing_Page (Experience A). */
  landing: "/",
  /** State-aware product entry point — renders no screen; redirects by status. */
  appEntry: "/app",

  /** Pre-activation experience (Experience B) path prefix. */
  prePrefix: "/app/pre",
  pre: {
    home: "/app/pre/home",
    benefits: "/app/pre/benefits",
    learn: "/app/pre/learn",
    /** The 20 ordered Pre_Activation_Flow screens (flow context, no nav item). */
    onboardingStep: "/app/pre/onboarding/:step",
  },

  /** Active-account experience (Experience B) path prefix. */
  activePrefix: "/app/active",
  active: {
    home: "/app/active/home",
    transactions: "/app/active/transactions",
    repayments: "/app/active/repayments",
    portfolio: "/app/active/portfolio",
    /** Top_Bar-only destinations (NOT bottom-nav tabs; Req 10.6, 10.9). */
    profile: "/app/active/profile",
    notifications: "/app/active/notifications",
    /** Pay experience — reachable from Home, NOT a nav tab (Req 21.2). */
    pay: "/app/active/pay",
    /**
     * Learn experience — reachable via an in-app affordance (e.g. the Profile /
     * account area), NOT a bottom-nav tab in the Active_Account_Experience
     * (Req 11.14). Path constant only; adds no bottom-nav item (ACTIVE_NAV is
     * unchanged and still length 4).
     */
    learn: "/app/active/learn",
  },
} as const;

/**
 * The state-aware `/app` entry redirect targets keyed by `activationStatus`
 * (Req 22.14, 10.8). `/app` renders no screen of its own.
 */
export const APP_ENTRY_REDIRECTS = {
  inactive: ROUTES.pre.home,
  in_progress: ROUTES.pre.home,
  active: ROUTES.active.home,
} as const;
