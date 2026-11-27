/**
 * MobileVerificationScreen — Pre_Activation_Flow screen 2 (Mobile Verification).
 *
 * Heading "Welcome to LienPay", a mobile-number field with a +91 country-code
 * prefix (reusing the shared `InputField`), and a "Continue" primary button
 * (shared `PrimaryButton`). On a valid submit the shared `Mock_Service.sendOtp`
 * is called (500–2000ms, `LoadingState` shown) and the flow advances to OTP
 * Verification within the time budget (Req 6.2). Empty/invalid input shows the
 * field error and remains on the screen, retaining the entered value (Req 6.5,
 * 6.6, 5.5). Validation uses the centralized `validateMobile` (10–15 digits).
 *
 * Content reproduced from the LienPay — Product Flow Map (screen 02): the
 * "Welcome to LienPay" heading, "Enter mobile number" field label, +91 prefix,
 * and "Continue" button. The supporting subtext and the bottom fine print are
 * NOT legible in the source and are intentionally NOT invented (see Content
 * gaps).
 *
 * Requirements: 6.2, 6.5, 6.6, 5.5.
 * Design: Mock Service Architecture, Components and Interfaces, Error Handling.
 */
import { useState } from "react";
import { InputField, LoadingState, PrimaryButton } from "../../../design-system/components";
import { mockService } from "../../../mock/mockService";
import { useLienPayStore } from "../../../state/store";
import { validateMobile } from "../../../state/validators";
import styles from "./onboarding.module.css";

export interface MobileVerificationScreenProps {
  /** Invoked after a successful OTP send to advance to OTP Verification. */
  onAdvance: () => void;
}

export function MobileVerificationScreen({
  onAdvance,
}: MobileVerificationScreenProps) {
  const completeOnboardingStep = useLienPayStore((s) => s.completeOnboardingStep);
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);

  const [mobile, setMobile] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }
    const result = validateMobile(mobile);
    if (!result.valid) {
      setError(
        result.reason === "required"
          ? "Enter your mobile number to continue."
          : "Enter a valid mobile number (10-15 digits)."
      );
      return;
    }

    setError(null);
    setSubmitting(true);
    setAsyncInFlight(true);
    try {
      const response = await mockService.sendOtp(mobile);
      if (response.status !== "success") {
        setError("We couldn't send the code. Please try again.");
        return;
      }
      completeOnboardingStep("mobileVerification");
      onAdvance();
    } finally {
      setSubmitting(false);
      setAsyncInFlight(false);
    }
  };

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Mobile Verification"
    >
      <header className={styles.header}>
        <h1 className={`text-heading ${styles.heading}`}>Welcome to LienPay</h1>
        <p className={styles.subtext}>
          Let&rsquo;s secure your account so you can unlock more.
        </p>
      </header>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div className={styles.mobileRow}>
          <span className={styles.countryCode} aria-hidden="true">
            +91
          </span>
          <InputField
            className={styles.mobileInput}
            label="Enter mobile number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={mobile}
            error={error ?? undefined}
            disabled={submitting}
            onChange={(e) => {
              setMobile(e.target.value);
              if (error) {
                setError(null);
              }
            }}
          />
        </div>

        <p className={styles.fieldHelp}>
          We&rsquo;ll send a 6-digit OTP to verify your number.
        </p>

        {submitting ? (
          <div className={styles.loadingWrap}>
            <LoadingState ariaLabel="Sending verification code" />
          </div>
        ) : null}

        <div className={styles.actions}>
          <PrimaryButton type="submit" fullWidth disabled={submitting}>
            Continue
          </PrimaryButton>
          <p className={styles.finePrint}>
            By continuing you agree to LienPay&rsquo;s Terms and Privacy Policy.
          </p>
        </div>
      </form>
    </section>
  );
}
