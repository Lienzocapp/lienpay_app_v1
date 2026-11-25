/**
 * LienPay Design System — Typed Color Token Accessors (single source of truth).
 *
 * Mirrors the CSS custom properties declared in `tokens.css` for JS-driven
 * styles. These seven color values are LOCKED by the source specification and
 * MUST NOT be altered or extended with additional product colors.
 *
 * Requirements: 1.1 (exact seven values), 1.2 (single central source),
 * 1.4 (Background base surface), 1.9 (Secondary Grey), 1.10 (Primary White),
 * 14.2 (authored exactly once).
 * Design: Technology Choices (typed token accessors), Folder Structure
 * (design-system/tokens/tokens.ts).
 */

/**
 * The seven locked color values, keyed by their semantic token name.
 * These hex values are the canonical source consumed by every component.
 */
export const colorTokens = {
  /** Background — base surface color for 100% of screens (Req 1.4). */
  bg: "#050505",
  /** Panel — near-black card/panel surface. */
  panel: "#111111",
  /** Border — dark card/component borders. */
  border: "#252525",
  /** Primary White — primary text (Req 1.10). */
  textPrimary: "#FFFFFF",
  /** Secondary Grey — supporting/secondary text (Req 1.9). */
  textSecondary: "#A0A0A0",
  /**
   * Lienzo Brand Green — the LOCKED brand accent extracted from the approved
   * Lienzo brand asset.
   *
   * Handoff values (do NOT approximate):
   *   HEX  #4ADE80
   *   RGB  74 222 128
   *   CSS  var(--color-green)
   *
   * Apply to: primary buttons, highlighted text, selected states, icons,
   * borders, progress indicators, and controlled glow effects.
   */
  green: "#4ADE80",
  /** Lienzo Brand Green Light — hover / highlight ramp (one step lighter). HEX #86EFAC · RGB 134 239 172 */
  greenBright: "#86EFAC",
  /**
   * Warning Amber — the single semantic urgency/time-sensitive accent (e.g. the
   * "8 days left" repayment countdown from the reference). Green stays the sole
   * brand accent; amber is reserved strictly for warning affordances. Defined
   * here (the one allowlisted token source) so no component hard-codes it.
   */
  warning: "#F5A524",
  /**
   * Reward Violet — the rewards-tile accent from the Home reference. Reserved
   * strictly for the rewards affordance; green remains the sole brand accent.
   */
  reward: "#8B5CF6",
} as const;

/** Semantic name of a color token (e.g. `"bg"`, `"green"`). */
export type ColorTokenName = keyof typeof colorTokens;

/** A locked hex color value from the token set. */
export type ColorTokenValue = (typeof colorTokens)[ColorTokenName];

/**
 * Maps each color token to the CSS custom property that carries it in
 * `tokens.css`, so JS-driven styles reference the same single source.
 */
export const colorTokenCssVariables = {
  bg: "--color-bg",
  panel: "--color-panel",
  border: "--color-border",
  textPrimary: "--color-text-primary",
  textSecondary: "--color-text-secondary",
  green: "--color-green",
  greenBright: "--color-green-bright",
  warning: "--color-warning",
  reward: "--color-reward",
} as const satisfies Record<ColorTokenName, string>;

/**
 * Returns a `var(--color-*)` reference for the given token, for use in inline
 * styles so JS-driven styling resolves through the same CSS custom property
 * (keeping `tokens.css` the single runtime source of truth).
 */
export function colorVar(name: ColorTokenName): string {
  return `var(${colorTokenCssVariables[name]})`;
}
