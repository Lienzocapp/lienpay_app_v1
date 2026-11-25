/**
 * ActiveProfile — the Active_Account Profile screen (task 18.2).
 *
 * Reachable from the Top_Bar Profile control (route `/app/active/profile`,
 * Req 10.6, 10.7); Profile is a Top_Bar destination and NEVER a bottom-nav tab
 * (Req 10.2, 10.9 — enforced by the shell's fixed 4-item ACTIVE_NAV). The screen
 * presents the account-management area (Req 11.5) and hosts the in-app access
 * point to the Learn experience (Req 11.14) — Learn is reachable here and is
 * likewise NOT a bottom-nav tab.
 *
 * The user's name is read from the centralized session state
 * (`session.userName`, set once via `setUserName` during Name Setup) — the
 * single cross-screen home for the name; this screen keeps no duplicate copy and
 * shows the name section only when a name is present (Req 19.4, no invented
 * account data).
 *
 * Content source of truth (Req 11.5, 20.1, 20.2, 20.4, 18.2): the LienPay
 * Application Design Specification's Profile screen is the authority for the
 * exact account-management options and copy. Those exact option labels / copy
 * are NOT legible/transcribed in the provided source, so — per the
 * no-fabrication rule — this screen uses minimal functional wording only, shows
 * no invented account data, and the exact Profile options/copy (and the exact
 * Learn access-point placement) are FLAGGED as BLOCKED in the batch report to be
 * captured from the source before completion.
 *
 * Requirements: 11.5, 10.6, 10.7, 11.14, 19.4, 20.1, 20.2, 20.4.
 * Design: Navigation Architecture (Active route table), Accessibility.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SecondaryButton } from "../../../design-system/components";
import { fadeSlide } from "../../../animation/product";
import { ROUTES } from "../../../navigation/navConfig";
import { useLienPayStore } from "../../../state/store";
import styles from "./active.module.css";

export function ActiveProfile() {
  const navigate = useNavigate();
  // Central session name — the single cross-screen home for the name (Req 19.4).
  const userName = useLienPayStore((s) => s.session.userName);
  const resetToSnapshot = useLienPayStore((s) => s.resetToSnapshot);

  // Sign out — resets the session to the canonical snapshot (activationStatus
  // returns to "inactive") and restarts the journey at the Splash, so the demo
  // can be re-run cleanly. Uses the existing centralized reset (no new logic).
  const handleSignOut = () => {
    resetToSnapshot();
    navigate("/app/pre/onboarding/splash");
  };

  // Verification status read verbatim from central state (no invented data).
  const verification = useLienPayStore((s) => s.verificationStatus);
  const bankStatus = useLienPayStore((s) => s.bankVerificationStatus);
  const mandateStatus = useLienPayStore((s) => s.mandateStatus);
  const identityComplete =
    verification.kyc === "complete" &&
    verification.aadhaar === "complete" &&
    verification.selfie === "complete";

  const verifyRows: { label: string; done: boolean }[] = [
    { label: "Identity verification", done: identityComplete },
    { label: "Bank account", done: bankStatus === "complete" },
    { label: "Auto-debit mandate", done: mandateStatus === "complete" },
  ];

  return (
    <motion.section
      className={styles.list}
      aria-label="Profile"
      variants={fadeSlide()}
      initial="initial"
      animate="animate"
    >
      <p className={styles.eyebrow}>Account</p>
      <h1 className={`text-heading ${styles.heading}`}>Profile</h1>

      {/* Account identity — the user's name from central session state, shown
          only when present (no invented account data). */}
      {userName ? (
        <div className={styles.profileIdentity}>
          <span className={styles.summaryLabel}>Signed in as</span>
          <span className={`text-financial-figure ${styles.summaryValue}`}>
            {userName}
          </span>
        </div>
      ) : null}

      {/* Verification status — informational rows read verbatim from central
          state (no invented account data, no dead buttons). */}
      <p className={styles.sectionLabel}>Verification</p>
      <div className={styles.verifyList}>
        {verifyRows.map((row) => (
          <div key={row.label} className={styles.verifyRow}>
            <span className={styles.verifyRowLabel}>{row.label}</span>
            <span className={styles.verifyStatus}>
              {row.done ? (
                <>
                  <span className={styles.verifyStatusDot} aria-hidden="true">
                    ✓
                  </span>
                  Verified
                </>
              ) : (
                "Pending"
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Account-management affordances. The Learn access point is provided here
          as the in-app affordance so Learn is reachable without being a
          bottom-nav tab (Req 11.14). */}
      <p className={styles.sectionLabel}>More</p>
      <nav className={styles.optionList} aria-label="Account management">
        <SecondaryButton fullWidth onClick={() => navigate(ROUTES.active.learn)}>
          Learn
        </SecondaryButton>
        <button
          type="button"
          className={styles.signOut}
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </nav>
    </motion.section>
  );
}
