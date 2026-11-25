/**
 * BankAccountScreen — Pre_Activation_Flow screen 14 (Bank Account).
 *
 * Captures bank details via the shared `InputField` primitives. On a VALID
 * submit it calls the centralized `Mock_Service.captureBankAccount` (simulated
 * success after a 500–2000ms standard delay, no external banking API — Req 8.2,
 * 13.3), shows the shared `LoadingState` while pending, sets
 * `bankVerificationStatus` to `"complete"` in the single centralized store, and
 * advances to the Auto-Debit / Mandate screen (screen 15) in the fixed order.
 *
 * Validation (Req 8.3): required fields are checked through the centralized
 * `validateBankFields` validator (single source — no duplicate validation).
 * If any required field is empty or whitespace-only, the submission is rejected,
 * an inline error is shown on the offending field via `InputField`'s `error`
 * prop, and ALL previously entered values are retained (they live in local
 * component state and are never cleared on a failed submit). Submission is
 * guarded by an in-flight ref so duplicate/concurrent submits are impossible.
 *
 * CONTENT — BLOCKED (Req 18.1, 20.4): No authoritative source copy / screenshot
 * for the Bank Account screen exists in the workspace, so the exact field set,
 * field labels, and formats are unknown. The fields rendered here
 * (account number, IFSC code, account holder name) are MINIMAL FUNCTIONAL
 * required-field mechanics needed to exercise capture + validation; their exact
 * labels and any field-specific format rules are flagged BLOCKED in the batch
 * report and must be reconciled against the design specification. No extra
 * business/format rules are invented (the validator checks required-only).
 *
 * Requirements: 8.2, 8.3, 13.3, 20.1, 20.2, 20.4.
 * Design: Mock Service Architecture, Error Handling.
 */
import { useCallback, useRef, useState } from "react";
import {
  InputField,
  LoadingState,
  PrimaryButton,
  SuccessState,
} from "../../../design-system/components";
import { mockService } from "../../../mock/mockService";
import { useLienPayStore } from "../../../state/store";
import { validateBankFields } from "../../../state/validators";
import { BankIcon } from "./verifyIcons";
import styles from "./onboarding.module.css";
import phase5 from "./phase5.module.css";

/** Brief hold on the verified confirmation before advancing. */
const BANK_SUCCESS_HOLD_MS = 650;

/**
 * The required bank fields captured by this screen. Keys are the field ids used
 * by the centralized validator; the labels are minimal functional wording
 * pending the authoritative source (content BLOCKED — Req 20.4).
 */
const BANK_FIELDS = [
  { key: "accountHolderName", label: "Account holder name" },
  { key: "accountNumber", label: "Account number" },
  { key: "ifsc", label: "IFSC code" },
] as const;

type BankFieldKey = (typeof BANK_FIELDS)[number]["key"];

type FormValues = Record<BankFieldKey, string>;

const EMPTY_VALUES: FormValues = {
  accountHolderName: "",
  accountNumber: "",
  ifsc: "",
};

type Phase = "idle" | "submitting" | "success";

export interface BankAccountScreenProps {
  /** Invoked on a successful capture, to advance to Auto-Debit / Mandate (15). */
  onAdvance: () => void;
}

export function BankAccountScreen({ onAdvance }: BankAccountScreenProps) {
  const setBankVerificationStatus = useLienPayStore(
    (s) => s.setBankVerificationStatus
  );
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);

  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  // The single offending field id from the centralized validator, or null.
  const [errorField, setErrorField] = useState<BankFieldKey | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const inFlightRef = useRef(false);

  const handleChange = (key: BankFieldKey) => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errorField === key) {
      setErrorField(null);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (inFlightRef.current) {
      return;
    }

    // Validate required fields through the centralized validator (Req 8.3).
    const result = validateBankFields(values);
    if (!result.valid) {
      // Reject: show the inline field error and RETAIN entered values.
      setErrorField(result.field as BankFieldKey);
      return;
    }

    setErrorField(null);
    inFlightRef.current = true;
    setPhase("submitting");
    setAsyncInFlight(true);

    try {
      const capture = await mockService.captureBankAccount(values);
      if (capture.status === "success") {
        setBankVerificationStatus("complete");
        // Show a brief "verified" confirmation before advancing.
        setPhase("success");
        window.setTimeout(onAdvance, BANK_SUCCESS_HOLD_MS);
      } else {
        // On a simulated capture failure, remain on the screen; values are
        // retained. Surface the failure on the first field.
        setPhase("idle");
        setErrorField(BANK_FIELDS[0].key);
      }
    } finally {
      inFlightRef.current = false;
      setAsyncInFlight(false);
    }
  }, [values, setBankVerificationStatus, setAsyncInFlight, onAdvance]);

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Bank Account"
    >
      <div className={styles.header}>
        <div className={phase5.verifyHead}>
          <span className={phase5.verifyBadge}>
            <BankIcon />
          </span>
          <div className={phase5.verifyTitles}>
            <p className={styles.eyebrow}>Bank verification</p>
            <h1 className={`text-heading ${styles.heading}`}>Bank account</h1>
            <p className={phase5.verifyLead}>
              Add the account we'll use for repayments and disbursals.
            </p>
          </div>
        </div>
      </div>

      {phase === "success" ? (
        <div className={phase5.successMoment}>
          <SuccessState
            title="Account verified"
            message="Your bank account has been verified."
          />
        </div>
      ) : (
        <>
          <div className={phase5.form}>
            {BANK_FIELDS.map((field) => (
              <InputField
                key={field.key}
                label={field.label}
                value={values[field.key]}
                disabled={phase === "submitting"}
                onChange={(e) => handleChange(field.key)(e.target.value)}
                error={
                  errorField === field.key ? "This field is required" : undefined
                }
              />
            ))}
          </div>

          {phase === "submitting" ? (
            <div className={phase5.loadingWrap}>
              <LoadingState label="Verifying bank account" />
            </div>
          ) : null}

          <div className={styles.actions}>
            <PrimaryButton
              fullWidth
              disabled={phase === "submitting"}
              onClick={() => void handleSubmit()}
            >
              Continue
            </PrimaryButton>
          </div>
        </>
      )}
    </section>
  );
}
