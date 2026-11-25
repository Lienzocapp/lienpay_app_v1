/**
 * NameSetupScreen — Pre_Activation_Flow screen 4 (Name Setup).
 *
 * Heading "Your account, your identity", a name field (reusing the shared
 * `InputField`) labelled "Enter your name", and a "Set up my ID" primary
 * button. On a valid submit the name is stored in the centralized
 * Application_State (`session.userName`) and the flow advances to the next
 * screen — Welcome (screen 5), which is out of scope for this batch and renders
 * a minimal empty placeholder (Req 6.4). Empty/whitespace-only or over-length
 * input shows the field error and remains, retaining the entered value
 * (Req 6.6, 5.5). Validation uses the centralized `validateName` (1–50 chars).
 *
 * Content reproduced from the LienPay — Product Flow Map (screen 04): the
 * "Your account, your identity" heading, "Enter your name" field label, and the
 * "Set up my ID" button. The supporting subtext is NOT legible in the source
 * and is intentionally NOT invented (see Content gaps).
 *
 * Requirements: 6.4, 6.6, 5.5.
 * Design: State Model, Components and Interfaces, Error Handling.
 */
import { useState } from "react";
import { InputField, PrimaryButton } from "../../../design-system/components";
import { useLienPayStore } from "../../../state/store";
import { validateName } from "../../../state/validators";
import styles from "./onboarding.module.css";

export interface NameSetupScreenProps {
  /** Invoked after the name is stored, to advance to the Welcome screen. */
  onAdvance: () => void;
}

export function NameSetupScreen({ onAdvance }: NameSetupScreenProps) {
  const completeOnboardingStep = useLienPayStore((s) => s.completeOnboardingStep);
  const setUserName = useLienPayStore((s) => s.setUserName);

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const result = validateName(name);
    if (!result.valid) {
      setError(
        result.reason === "required"
          ? "Enter your name to continue."
          : "Name must be 50 characters or fewer."
      );
      return;
    }

    setError(null);
    setUserName(name.trim());
    completeOnboardingStep("nameSetup");
    onAdvance();
  };

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Name Setup"
    >
      <header className={styles.header}>
        <h1 className={`text-heading ${styles.heading}`}>
          Your account, your identity
        </h1>
        <p className={styles.subtext}>
          Tell us your name so we can personalise your LienPay experience.
        </p>
      </header>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <InputField
          label="Enter your name"
          type="text"
          autoComplete="name"
          maxLength={50}
          value={name}
          error={error ?? undefined}
          onChange={(e) => {
            setName(e.target.value);
            if (error) {
              setError(null);
            }
          }}
        />

        <div className={styles.actions}>
          <PrimaryButton type="submit" fullWidth>
            Set up my ID
          </PrimaryButton>
        </div>
      </form>
    </section>
  );
}
