/**
 * LandingEntry — placeholder entry component for the Landing_Page (Experience A).
 *
 * This is the lazy-loaded root of the `landing` chunk (task 4.12). It exists so
 * the entry-level route split compiles and the app boots with `/` resolving to
 * an independent chunk that imports the shared design core but NOT the product
 * chunk (Design: Experience separation — code-splitting).
 *
 * IMPORTANT: the landing motion libraries (Lenis / GSAP + ScrollTrigger) MUST be
 * imported ONLY inside this landing chunk (and only when the actual landing
 * runtime is built in Phase 2, task 6.1). Nothing here imports those libraries
 * yet, so they never ship in the product (`app`) chunk (Req 17.5, 17.6, 4.14).
 * The real Landing_Page sections and cinematic motion are built later (Task 6);
 * this is an intentionally empty shell.
 *
 * The shell applies the responsive Landing rule now (Req 15.3): a full-width
 * section band whose content is capped at 1280px and centered at wider widths.
 * The band/cap are applied to the placeholder container so the rule exists and
 * is testable; the real sections/copy arrive in Phase 2.
 */
import styles from "./landing.module.css";

export default function LandingEntry() {
  return (
    <div
      className={styles.shell}
      data-experience="landing"
      data-placeholder="landing-entry"
    >
      <div className={styles.container} data-role="landing-content" />
    </div>
  );
}
