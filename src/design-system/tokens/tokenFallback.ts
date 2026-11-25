/**
 * LienPay Design System — runtime token-fallback path (Req 3.5).
 *
 * "IF a screen cannot resolve a required shared design token, THEN the app
 *  SHALL fall back to the corresponding default token from the shared design
 *  system and record the unresolved-token condition, preserving the dark
 *  high-contrast presentation."
 *
 * This is the design-system-layer implementation of that rule. It is pure infra
 * (no screens): screens/components call `resolveColorToken` / `resolveColorValue`
 * instead of reading tokens unguarded, so an unknown or unresolved token can
 * never produce an undefined/blank color — it always degrades to one of the
 * seven locked tokens, keeping the interface dark and high-contrast.
 *
 * Design: Error Handling ("Unresolved design token → Fall back to default token,
 * record condition, preserve dark high-contrast presentation").
 */
import {
  colorTokens,
  colorVar,
  type ColorTokenName,
} from "./tokens";

/**
 * The semantic role a color is being used for. The default fallback token for
 * each role is chosen from the seven locked tokens so the dark, high-contrast
 * presentation is always preserved (Req 3.5, 3.1).
 */
export type ColorRole = "surface" | "text" | "accent";

/**
 * Dark high-contrast default tokens per role. Every value is one of the seven
 * locked tokens, so falling back can never introduce a non-token color:
 *  - surface → Background `#050505` (keeps the dark base surface)
 *  - text    → Primary White `#FFFFFF` (max contrast on the dark surface)
 *  - accent  → Lienzo Brand Green `#4ADE80`
 */
const ROLE_DEFAULT_TOKEN: Record<ColorRole, ColorTokenName> = {
  surface: "bg",
  text: "textPrimary",
  accent: "green",
};

/** A recorded unresolved-token condition (Req 3.5 "record the condition"). */
export interface UnresolvedTokenRecord {
  /** The token name/value that could not be resolved. */
  readonly requested: string;
  /** The locked default token actually applied as the fallback. */
  readonly fallbackToken: ColorTokenName;
  /** The role whose default was used. */
  readonly role: ColorRole;
  /** Epoch milliseconds when the condition was recorded. */
  readonly at: number;
}

const unresolvedRecords: UnresolvedTokenRecord[] = [];

/** Returns the recorded unresolved-token conditions (read-only snapshot). */
export function getUnresolvedTokenRecords(): readonly UnresolvedTokenRecord[] {
  return unresolvedRecords.slice();
}

/** Clears the recorded unresolved-token conditions (useful for tests/session resets). */
export function clearUnresolvedTokenRecords(): void {
  unresolvedRecords.length = 0;
}

function recordUnresolved(
  requested: string,
  fallbackToken: ColorTokenName,
  role: ColorRole
): void {
  unresolvedRecords.push({ requested, fallbackToken, role, at: Date.now() });
  // Surface the condition without breaking rendering.
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(
      `[design-system] Unresolved design token "${requested}"; ` +
        `falling back to default token "${fallbackToken}" (role: ${role}).`
    );
  }
}

/** Type guard: is `name` one of the seven known color token names? */
export function isColorTokenName(name: string): name is ColorTokenName {
  return Object.prototype.hasOwnProperty.call(colorTokens, name);
}

/**
 * Resolve a color token to a `var(--color-*)` reference for styling.
 *
 * When `name` is one of the seven known tokens, its CSS custom-property
 * reference is returned. When it is not resolvable, the unresolved condition is
 * recorded and the role's dark high-contrast default token is returned instead,
 * so the element still renders with a locked token color (Req 3.5).
 */
export function resolveColorToken(
  name: string,
  role: ColorRole = "surface"
): string {
  if (isColorTokenName(name)) {
    return colorVar(name);
  }
  const fallback = ROLE_DEFAULT_TOKEN[role];
  recordUnresolved(name, fallback, role);
  return colorVar(fallback);
}

/**
 * Resolve a color token to a concrete hex value, given the value the runtime
 * actually resolved for it (e.g. from `getComputedStyle(...).getPropertyValue`).
 *
 * If the token name is known and the runtime produced a non-empty value, that
 * value is used. If the token is known but the runtime value is empty/undefined
 * (the CSS custom property did not resolve), the condition is recorded and the
 * token's own locked literal value is used as its default. If the token name is
 * unknown, the role's dark high-contrast default token value is used. In every
 * case the returned value is one of the seven locked tokens, preserving the dark
 * high-contrast presentation (Req 3.5).
 */
export function resolveColorValue(
  name: string,
  resolvedValue: string | null | undefined,
  role: ColorRole = "surface"
): string {
  if (isColorTokenName(name)) {
    const value = (resolvedValue ?? "").trim();
    if (value !== "") {
      return value;
    }
    // Known token but the CSS variable did not resolve → use its literal default.
    recordUnresolved(name, name, role);
    return colorTokens[name];
  }
  const fallback = ROLE_DEFAULT_TOKEN[role];
  recordUnresolved(name, fallback, role);
  return colorTokens[fallback];
}
