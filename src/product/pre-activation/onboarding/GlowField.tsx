/**
 * GlowField — an ambient animated green glow backdrop for the onboarding flow.
 *
 * Purely decorative (aria-hidden): two slowly drifting radial green glows plus a
 * diagonal sheen that sweeps across, giving every onboarding page the shiny,
 * moving, premium feel of the LienPay reference. All color comes from the design
 * tokens (Req 1.2, 14.5) via color-mix on the neon green; motion collapses to a
 * static state under prefers-reduced-motion (global backstop, Req 4.8/16.6).
 */
import styles from "./glowField.module.css";

export function GlowField() {
  return (
    <div className={styles.field} aria-hidden="true">
      <span className={styles.glowA} />
      <span className={styles.glowB} />
      <span className={styles.sheen} />
    </div>
  );
}
