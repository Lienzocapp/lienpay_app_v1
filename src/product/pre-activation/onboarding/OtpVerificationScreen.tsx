/**
 * OtpVerificationScreen — Pre_Activation_Flow screen 3 (OTP Verification).
 *
 * Heading "Verify your number", a 6-cell OTP entry (reusing the shared
 * `OTPInput`) labelled "Enter 6-digit OTP", a minimal resend control with a
 * countdown, and a "Verify OTP" primary button. On a valid submit the shared
 * `Mock_Service.verifyOtp` is called (500–2000ms, `LoadingState` shown) and the
 * flow advances to Name Setup within the time budget (Req 6.3). Empty/invalid
 * input (not exactly 6 digits) shows the error and remains, retaining the
 * entered value (Req 6.5, 6.6, 5.5). Validation uses the centralized
 * `validateOtp` (exactly 6 digits).
 *
 * Content reproduced from the LienPay — Product Flow Map (screen 03): the
 * "Verify your number" heading, "Enter 6-digit OTP" label, the 6-cell OTP
 * entry, a resend control, and the "Verify OTP" button. The supporting subtext
 * and the exact resend-timer format are NOT legible in the source and are
 * intentionally NOT invented; a minimal functional countdown is used (see
 * Content gaps).
 *
 * Requirements: 6.3, 6.5, 6.6, 5.5.
 * Design: Mock Service Architecture, Components and Interfaces, Error Handling.
 */
import { useEffect, useState } from "react";
import { LoadingState, OTPInput, PrimaryButton } from "../../../design-system/components";
import { mockService } from "../../../mock/mockService";
import { useLienPayStore } from "../../../state/store";
import { validateOtp } from "../../../state/validators";
import styles from "./onboarding.module.css";

/** Initial resend countdown, in seconds (minimal functional timer). */
export const OTP_RESEND_SECONDS = 30;

export interface OtpVerificationScreenProps {
  /** Invoked after a successful verification to advance to Name Setup. */
  onAdvance: () => void;
}

export function OtpVerificationScreen({ onAdvance }: OtpVerificationScreenProps) {
  const completeOnboardingStep = useLienPayStore((s) => s.completeOnboardingStep);
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (secondsLeft > 0 || submitting) {
      return;
    }
    setSecondsLeft(OTP_RESEND_SECONDS);
    await mockService.sendOtp("");
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }
    const result = validateOtp(otp);
    if (!result.valid) {
      setError(
        result.reason === "required"
          ? "Enter the 6-digit code to continue."
          : "Enter the 6-digit code."
      );
      return;
    }

    setError(null);
    setSubmitting(true);
    setAsyncInFlight(true);
    try {
      const response = await mockService.verifyOtp(otp);
      if (response.status !== "success") {
        setError("That code didn't work. Please try again.");
        return;
      }
      completeOnboardingStep("otpVerification");
      onAdvance();
    } finally {
      setSubmitting(false);
      setAsyncInFlight(false);
    }
  };

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="OTP Verification"
    >
      <header className={styles.header}>
        <h1 className={`text-heading ${styles.heading}`}>Verify your number</h1>
        <p className={styles.subtext}>
          Enter the 6-digit code we sent to secure access to your LienPay
          account.
        </p>
      </header>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div className={styles.otpBlock}>
          <OTPInput
            label="Enter 6-digit OTP"
            value={otp}
            length={6}
            disabled={submitting}
            onChange={(next) => {
              setOtp(next);
              if (error) {
                setError(null);
              }
            }}
          />
          {error ? (
            <p className={styles.fieldError} role="alert">
              <span className={styles.fieldErrorIcon} aria-hidden="true">
                !
              </span>
              <span>{error}</span>
            </p>
          ) : null}
        </div>


        <p className={styles.demoNote}>
          Demo account: use <span className={styles.demoNoteCode}>123456</span>{" "}
          as your OTP.
        </p>

        <div className={styles.resendRow}>
          {secondsLeft > 0 ? (
            <span>Resend code in {secondsLeft}s</span>
          ) : (
            <button
              type="button"
              className={styles.resendButton}
              onClick={() => void handleResend()}
              disabled={submitting}
            >
              Resend
            </button>
          )}
        </div>


        {submitting ? (
          <div className={styles.loadingWrap}>
            <LoadingState ariaLabel="Verifying code" />
          </div>
        ) : null}

        <div className={styles.actions}>
          <PrimaryButton type="submit" fullWidth disabled={submitting}>
            Verify OTP
          </PrimaryButton>
        </div>
      </form>
    </section>
  );
}
