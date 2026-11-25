/**
 * visuals — the single source for LienPay static artwork URLs.
 *
 * Every path is resolved from `import.meta.env.BASE_URL` so the same reference
 * works on the web (Vercel, served from the domain root) and inside the
 * Capacitor native WebView, where the bundle uses relative paths
 * (`vite base: "./"`). Files live in `public/assets/visuals/` and are served
 * as-is — never inlined as base64 and never duplicated per screen.
 *
 * All four renders sit on a dark/transparent field, so they blend into the
 * near-black product surfaces without a visible plate.
 */
const BASE = import.meta.env.DEV ? '/assets/visuals/' : './assets/visuals/';

export const VISUALS = {
  /** Hand holding the LienPay card — activation + activation success hero. */
  cardHand: `${BASE}lienpay-card-hand.png`,
  /** Phone on a café table ringed by spend icons — pre-activation Home hero. */
  heroPlans: `${BASE}lienpay-hero-plans.png`,
  /** Rising arrow over rupee coins — Benefits hero (transparent background). */
  investments: `${BASE}lienpay-investments.png`,
  /** Shield over coins — Learn answer/security hero. */
  security: `${BASE}lienpay-security.png`,
} as const;

/** Name of a known LienPay visual. */
export type VisualName = keyof typeof VISUALS;
