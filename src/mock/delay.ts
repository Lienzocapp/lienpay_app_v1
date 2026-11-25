/**
 * LienPay — simulated delay helpers for the centralized Mock_Service.
 *
 * Two delay classes, per the design's Delay strategy:
 *  - **Standard simulated delay:** 500–2000ms for verification, OTP, bank,
 *    mandate, and generic async reads (Req 6.2/6.3, 8.1/8.2/8.4, 13.3).
 *  - **Deliberate long-running:** 2000–5000ms used ONLY for Pledge Processing
 *    (Req 7.6, 13.3).
 *
 * These helpers use `setTimeout` only — there is NO network activity of any
 * kind. Timing is split into a PURE duration picker (`pickStandardDelayMs` /
 * `pickLongRunningDelayMs`) and the awaited `delay(ms)` wait, so tests can
 * assert bounds deterministically and drive the wait with fake timers.
 *
 * Requirements: 13.3 (500–2000ms simulated async), 7.6 (2000–5000ms Pledge
 * Processing), 13.1/13.2 (no outbound network).
 * Design: Mock Service Architecture — Delay strategy.
 */

/** Inclusive lower/upper bounds (ms) for the standard simulated delay. */
export const STANDARD_DELAY_MIN_MS = 500;
export const STANDARD_DELAY_MAX_MS = 2000;

/** Inclusive lower/upper bounds (ms) for the deliberate long-running delay. */
export const LONG_RUNNING_DELAY_MIN_MS = 2000;
export const LONG_RUNNING_DELAY_MAX_MS = 5000;

/** A source of randomness in `[0, 1)`, injectable for deterministic tests. */
export type RandomSource = () => number;

/**
 * Picks an integer millisecond value in the inclusive range `[min, max]`.
 *
 * @param min - Inclusive lower bound (ms).
 * @param max - Inclusive upper bound (ms).
 * @param random - Randomness source in `[0, 1)`; defaults to `Math.random`.
 * @returns An integer in `[min, max]`.
 */
export function pickDelayMs(
  min: number,
  max: number,
  random: RandomSource = Math.random
): number {
  const span = max - min;
  return min + Math.round(random() * span);
}

/**
 * Picks a standard simulated delay in `[500, 2000]` ms.
 *
 * @param random - Randomness source; defaults to `Math.random`.
 * @returns An integer delay in ms within the standard bounds.
 */
export function pickStandardDelayMs(random: RandomSource = Math.random): number {
  return pickDelayMs(STANDARD_DELAY_MIN_MS, STANDARD_DELAY_MAX_MS, random);
}

/**
 * Picks a deliberate long-running delay in `[2000, 5000]` ms (Pledge
 * Processing only).
 *
 * @param random - Randomness source; defaults to `Math.random`.
 * @returns An integer delay in ms within the long-running bounds.
 */
export function pickLongRunningDelayMs(
  random: RandomSource = Math.random
): number {
  return pickDelayMs(
    LONG_RUNNING_DELAY_MIN_MS,
    LONG_RUNNING_DELAY_MAX_MS,
    random
  );
}

/**
 * Resolves after `ms` milliseconds using `setTimeout` (no network activity).
 *
 * @param ms - Delay in milliseconds.
 * @returns A promise that resolves once the delay elapses.
 */
export function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Awaits a standard simulated delay (500–2000ms).
 *
 * @param random - Randomness source; defaults to `Math.random`.
 * @returns A promise that resolves after the chosen standard delay.
 */
export function standardDelay(random: RandomSource = Math.random): Promise<void> {
  return delay(pickStandardDelayMs(random));
}

/**
 * Awaits a deliberate long-running delay (2000–5000ms), used ONLY for Pledge
 * Processing.
 *
 * @param random - Randomness source; defaults to `Math.random`.
 * @returns A promise that resolves after the chosen long-running delay.
 */
export function longRunningDelay(
  random: RandomSource = Math.random
): Promise<void> {
  return delay(pickLongRunningDelayMs(random));
}
