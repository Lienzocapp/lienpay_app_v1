/**
 * PreActivationHeader — the shared pre-activation screen header.
 *
 * Matches the design references (pre-activation Home / Benefits / Learn): a
 * circular avatar, the personalised time-of-day greeting, a "Welcome to
 * LienPay" support line with the brand word accented, and a notification bell
 * carrying an unread dot.
 *
 * The name comes from central session state via {@link personalGreeting} and is
 * NEVER hard-coded — with no stored name the greeting degrades to the
 * time-of-day phrase alone (Req 19.4).
 */
import { useLienPayStore } from "../../state/store";
import { personalGreeting } from "../greeting";
import { BellIcon, PersonIcon } from "./preIcons";
import styles from "./preActivation.module.css";

export interface PreActivationHeaderProps {
  /** Optional support line under the greeting. Defaults to the welcome line. */
  supportLine?: React.ReactNode;
}

export function PreActivationHeader({ supportLine }: PreActivationHeaderProps) {
  const userName = useLienPayStore((s) => s.session.userName);
  const notifications = useLienPayStore((s) => s.notifications);
  const hasUnread = notifications.length > 0;

  return (
    <header className={styles.preHead}>
      <span className={styles.preAvatar} aria-hidden="true">
        <PersonIcon />
      </span>

      <div className={styles.preHeadText}>
        <p className={styles.preGreeting}>{personalGreeting(userName)}</p>
        <p className={styles.preWelcome}>
          {supportLine ?? (
            <>
              Welcome to <span className={styles.preBrand}>LienPay</span>
            </>
          )}
        </p>
      </div>

      {/*
       * Presentational status indicator: the Notifications screen is a Top_Bar
       * destination of the ACTIVE experience only, so there is no
       * pre-activation notifications route to link to. Rendered as an image
       * role with a label rather than a dead button (no fake affordance).
       */}
      <span
        className={styles.preBell}
        role="img"
        aria-label={hasUnread ? "Notifications, unread" : "Notifications"}
      >
        <BellIcon />
        {hasUnread ? <span className={styles.preBellDot} aria-hidden="true" /> : null}
      </span>
    </header>
  );
}
