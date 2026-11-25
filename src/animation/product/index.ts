/**
 * LienPay — restrained Product motion utilities (Experience B, built once).
 *
 * A single, reusable set of Framer Motion configs for the Product_Application:
 * `screenTransition`, `valueCountUp`, `fadeSlide`, and `microInteraction`. They
 * are authored ONCE here and applied consistently — never re-authored per
 * screen (Req 16.1, 17.4) — and this module attaches them to no screen.
 *
 * Motion is EASE-BASED only; overshoot, bounce, elastic, spring-back, rotation,
 * and scale-pulse are excluded (Req 16.5). Every utility honors the shared
 * reduced-motion gate: when reduced motion is preferred, the final state is
 * presented immediately with no intermediate motion (Req 16.6, 4.8). The
 * Product_Application uses NATIVE scrolling only — no smooth-scroll library is
 * imported here (Req 17.6).
 *
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 17.4, 17.6.
 * Design: Animation Architecture — Product motion utilities.
 */
import type { Transition, Variants } from "framer-motion";
import {
  MICRO_INTERACTION_MS,
  SCREEN_TRANSITION_MS,
  VALUE_COUNT_UP_MS,
  prefersReducedMotion,
} from "../contracts";

/**
 * The only easing curve used by the product utilities — a standard ease
 * (ease-in-out cubic bezier). No overshoot/bounce/elastic/spring curves are
 * used anywhere (Req 16.5).
 */
export const PRODUCT_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

/** Converts a duration in milliseconds to the seconds Framer Motion expects. */
function toSeconds(ms: number): number {
  return ms / 1000;
}

/**
 * Screen transition (fade/slide between screens), 200–400ms (Req 16.2). Uses
 * the midpoint of the contract range for a consistent feel. Under reduced
 * motion the transition is instantaneous (duration 0) so the final state shows
 * immediately (Req 16.6).
 *
 * @param reduced - Reduced-motion flag; defaults to the shared gate.
 * @returns Framer Motion `Variants` for a screen enter/exit.
 */
export function screenTransition(
  reduced: boolean = prefersReducedMotion()
): Variants {
  const durationMs = (SCREEN_TRANSITION_MS.min + SCREEN_TRANSITION_MS.max) / 2;
  const transition: Transition = reduced
    ? { duration: 0 }
    : { duration: toSeconds(durationMs), ease: PRODUCT_EASE };
  return {
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 8 },
    animate: { opacity: 1, y: 0, transition },
    exit: {
      opacity: reduced ? 1 : 0,
      y: reduced ? 0 : -8,
      transition,
    },
  };
}

/** A value count-up plan describing how to tween a financial number. */
export interface ValueCountUp {
  /** Start value of the tween. */
  from: number;
  /** End (final) value of the tween. */
  to: number;
  /** Tween duration in seconds (0 under reduced motion). */
  durationSec: number;
  /** Easing curve name for the tween. */
  ease: [number, number, number, number] | "linear";
  /** Whether reduced motion is active (final value shown immediately). */
  reduced: boolean;
}

/**
 * Animated financial value change, 300–800ms (Req 16.3). Returns a tween plan
 * from the previous value to the new value using the midpoint duration. Under
 * reduced motion the duration is 0 so the final value is shown immediately
 * (Req 16.6).
 *
 * @param from - Previous displayed numeric value.
 * @param to - New numeric value to animate to.
 * @param reduced - Reduced-motion flag; defaults to the shared gate.
 * @returns A {@link ValueCountUp} plan for the consumer to drive.
 */
export function valueCountUp(
  from: number,
  to: number,
  reduced: boolean = prefersReducedMotion()
): ValueCountUp {
  const durationMs = (VALUE_COUNT_UP_MS.min + VALUE_COUNT_UP_MS.max) / 2;
  return {
    from,
    to,
    durationSec: reduced ? 0 : toSeconds(durationMs),
    ease: PRODUCT_EASE,
    reduced,
  };
}

/**
 * Generic element enter/exit (fade + slide), ease-based only. Under reduced
 * motion the element appears in its final state with no offset (Req 16.6).
 *
 * @param offsetPx - Slide offset in px for the entrance; defaults to 16px.
 * @param reduced - Reduced-motion flag; defaults to the shared gate.
 * @returns Framer Motion `Variants` for a fade/slide.
 */
export function fadeSlide(
  offsetPx = 16,
  reduced: boolean = prefersReducedMotion()
): Variants {
  const durationMs = (SCREEN_TRANSITION_MS.min + SCREEN_TRANSITION_MS.max) / 2;
  const transition: Transition = reduced
    ? { duration: 0 }
    : { duration: toSeconds(durationMs), ease: PRODUCT_EASE };
  return {
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : offsetPx },
    animate: { opacity: 1, y: 0, transition },
    exit: { opacity: reduced ? 1 : 0, y: reduced ? 0 : offsetPx, transition },
  };
}

/**
 * Staggered container — orchestrates a gentle cascade of its children on enter
 * so a screen "comes alive" without cinematic excess (Req 16.2, 16.5). Under
 * reduced motion the children appear immediately with no stagger (Req 16.6).
 *
 * @param reduced - Reduced-motion flag; defaults to the shared gate.
 * @returns Framer Motion `Variants` for the container.
 */
export function staggerContainer(
  reduced: boolean = prefersReducedMotion()
): Variants {
  return {
    initial: {},
    animate: {
      transition: reduced
        ? {}
        : { staggerChildren: 0.06, delayChildren: 0.02 },
    },
  };
}

/**
 * Staggered item — a single fade/rise child within a {@link staggerContainer}.
 * Ease-based only; under reduced motion it appears in its final state with no
 * offset (Req 16.5, 16.6).
 *
 * @param reduced - Reduced-motion flag; defaults to the shared gate.
 * @returns Framer Motion `Variants` for a child element.
 */
export function staggerItem(
  reduced: boolean = prefersReducedMotion()
): Variants {
  const transition: Transition = reduced
    ? { duration: 0 }
    : { duration: 0.34, ease: PRODUCT_EASE };
  return {
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 },
    animate: { opacity: 1, y: 0, transition },
  };
}

/**
 * Button press/hover micro-interaction, 100–250ms (Req 16.4). Scale stays
 * within a restrained range (no scale-pulse/overshoot; Req 16.5). Under reduced
 * motion no scale change is applied (Req 16.6).
 *
 * @param reduced - Reduced-motion flag; defaults to the shared gate.
 * @returns An object with `whileHover`/`whileTap`/`transition` for a control.
 */
export function microInteraction(reduced: boolean = prefersReducedMotion()): {
  whileHover: { scale: number };
  whileTap: { scale: number };
  transition: Transition;
} {
  const durationMs = (MICRO_INTERACTION_MS.min + MICRO_INTERACTION_MS.max) / 2;
  return {
    whileHover: { scale: reduced ? 1 : 1.02 },
    whileTap: { scale: reduced ? 1 : 0.98 },
    transition: reduced
      ? { duration: 0 }
      : { duration: toSeconds(durationMs), ease: PRODUCT_EASE },
  };
}
