/**
 * LienPay — centralized Animation_System contracts (single source).
 *
 * The Animation_System is centralized as CONTRACTS (durations, thresholds, and
 * the reduced-motion gate) consumed by BOTH implementation layers — the
 * Landing (cinematic) runtime and the Product (restrained) utilities — so
 * behavior is consistent (Req 16.1) and reduced-motion is honored everywhere
 * (Req 4.8, 16.6). This module is pure and reusable; it imports no motion
 * library and no landing code.
 *
 * Requirements: 16.1/16.5/16.6 (consistent, ease-based, reduced-motion), 4.8
 * (reduced-motion presents final states immediately).
 * Design: Animation Architecture (contracts + reduced-motion gate).
 */

/** An inclusive duration range in milliseconds. */
export interface DurationRange {
  /** Inclusive minimum duration (ms). */
  min: number;
  /** Inclusive maximum duration (ms). */
  max: number;
}

/* -------------------------------------------------------------------------- */
/* Product (restrained) motion durations — Req 16                             */
/* -------------------------------------------------------------------------- */

/** Screen transition duration bounds: 200–400ms (Req 16.2). */
export const SCREEN_TRANSITION_MS: DurationRange = { min: 200, max: 400 };

/** Financial value count-up duration bounds: 300–800ms (Req 16.3). */
export const VALUE_COUNT_UP_MS: DurationRange = { min: 300, max: 800 };

/** Button micro-interaction duration bounds: 100–250ms (Req 16.4). */
export const MICRO_INTERACTION_MS: DurationRange = { min: 100, max: 250 };

/* -------------------------------------------------------------------------- */
/* Landing (cinematic) motion contracts — Req 4                               */
/* -------------------------------------------------------------------------- */

/** Smooth inertial scroll settle-time bounds: 0.8–1.2s (Req 4.1). */
export const LANDING_SCROLL_SETTLE_MS: DurationRange = { min: 800, max: 1200 };

/** Section/text/card reveal duration bounds: 400–800ms (Req 4.2). */
export const LANDING_REVEAL_MS: DurationRange = { min: 400, max: 800 };

/** Animated financial number duration bounds: 1000–2000ms (Req 4.4). */
export const LANDING_NUMBER_MS: DurationRange = { min: 1000, max: 2000 };

/** Fraction of a section that must be visible before it reveals (≥10%, Req 4.2/4.9/4.10). */
export const LANDING_REVEAL_VISIBILITY_THRESHOLD = 0.1;

/** Reveal translate-offset bounds in px: 16–32px → 0 (Req 4.2). */
export const LANDING_REVEAL_TRANSLATE_PX: DurationRange = { min: 16, max: 32 };

/** Maximum parallax offset in px (Req 4.3). */
export const LANDING_PARALLAX_MAX_PX = 60;

/** Button micro-interaction scale bounds on the Landing_Page (Req 4.5). */
export const LANDING_BUTTON_SCALE = { min: 0.95, max: 1.05 } as const;

/** Time budget (ms) to begin a Landing button micro-interaction (Req 4.5). */
export const LANDING_BUTTON_BEGIN_MS = 100;

/** Maximum number of neon-green glow elements visible per screen (Req 1.6, 4.11). */
export const MAX_GLOW_ELEMENTS_PER_SCREEN = 3;

/** Viewport width (px) below which parallax + glow are reduced/disabled (Req 4.14). */
export const LANDING_MOBILE_PERF_BREAKPOINT_PX = 768;

/** Target frame rate for landing motion (Req 4.1, 4.14). */
export const TARGET_FPS = 60;

/* -------------------------------------------------------------------------- */
/* Reduced-motion gate (shared)                                               */
/* -------------------------------------------------------------------------- */

/**
 * Reports whether the operating environment requests reduced motion, via the
 * `(prefers-reduced-motion: reduce)` media query. When true, both experiences
 * disable motion and present completed final states immediately (Req 4.8,
 * 16.6). Guards against non-browser/test environments where `matchMedia` is
 * unavailable (returns `false`).
 *
 * @returns `true` when reduced motion is preferred, otherwise `false`.
 */
export function prefersReducedMotion(): boolean {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
