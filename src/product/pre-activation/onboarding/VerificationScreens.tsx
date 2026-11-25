/**
 * VerificationScreens — Pre_Activation_Flow screens 11–13 (KYC, Aadhaar
 * Verification, Selfie Verification).
 *
 * All three complete the matching centralized `verificationStatus` step via the
 * centralized `Mock_Service` (no external identity API — Req 8.1, 13.3), guard
 * submission with an in-flight ref (idempotent), raise `session.asyncInFlight`
 * while a blocking op runs, show polished loading/verifying states, and advance
 * in the fixed 20-screen order on success (Req 5.1, 8.1). On a simulated failure
 * they remain on the screen with a retry.
 *
 * KYC keeps a single Submit → verifying → complete mechanic. Aadhaar presents a
 * realistic (mocked) details → send OTP → OTP → verifying → verified flow.
 * Selfie presents a realistic (mocked) simulated capture → analyzing → confirmed
 * flow WITHOUT requesting the device camera. The visible microcopy uses generic,
 * mechanical verification wording (the product owner's approved journey copy),
 * not fabricated legal/financial content; no real personal data is used.
 *
 * Requirements: 8.1, 13.3, 13.5, 20.1, 20.2, 20.4.
 * Design: Mock Service Architecture, Accessibility.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ErrorState,
  InputField,
  LoadingState,
  OTPInput,
  PrimaryButton,
  SuccessState,
} from "../../../design-system/components";
import { mockService } from "../../../mock/mockService";
import { useLienPayStore } from "../../../state/store";
import { AadhaarIcon, IdentityIcon, SelfieIcon } from "./verifyIcons";
import styles from "./onboarding.module.css";
import phase5 from "./phase5.module.css";

/** Brief hold on a success confirmation before advancing. */
const SUCCESS_HOLD_MS = 650;

export interface VerificationScreenProps {
  /** Invoked on success, to advance to the next verification screen. */
  onAdvance: () => void;
}

/* -------------------------------------------------------------------------- */
/* Shared verification hero header                                            */
/* -------------------------------------------------------------------------- */

function VerifyHead({
  icon,
  eyebrow,
  heading,
  lead,
}: {
  icon: ReactNode;
  eyebrow: string;
  heading: string;
  lead: string;
}) {
  return (
    <div className={styles.header}>
      <div className={phase5.verifyHead}>
        <span className={phase5.verifyBadge}>{icon}</span>
        <div className={phase5.verifyTitles}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={`text-heading ${styles.heading}`}>{heading}</h1>
          <p className={phase5.verifyLead}>{lead}</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen 11 — KYC (single submit → verifying → complete)                     */
/* -------------------------------------------------------------------------- */

type KycPhase = "idle" | "submitting" | "error";

/** Screen 11 — KYC. Submits via `Mock_Service.submitKyc`. */
export function KycScreen({ onAdvance }: VerificationScreenProps) {
  const setVerificationStatus = useLienPayStore((s) => s.setVerificationStatus);
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);
  const [phase, setPhase] = useState<KycPhase>("idle");
  const inFlightRef = useRef(false);

  const runSubmit = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setPhase("submitting");
    setAsyncInFlight(true);
    try {
      const result = await mockService.submitKyc({});
      if (result.status === "success") {
        setVerificationStatus("kyc", "complete");
        onAdvance();
      } else {
        setPhase("error");
      }
    } finally {
      inFlightRef.current = false;
      setAsyncInFlight(false);
    }
  }, [setVerificationStatus, setAsyncInFlight, onAdvance]);

  return (
    <section className={`${styles.screen} ${styles.flow}`} aria-label="KYC">
      <VerifyHead
        icon={<IdentityIcon />}
        eyebrow="Identity verification"
        heading="Verify your identity"
        lead="We'll confirm your identity to secure your credit line."
      />

      <p className={phase5.verifyNote}>
        <span className={phase5.verifyNoteDot} aria-hidden="true" />
        Securely simulated for this demo.
      </p>

      {phase === "submitting" ? (
        <div className={phase5.loadingWrap}>
          <LoadingState label="Verifying your identity" />
        </div>
      ) : null}

      {phase === "error" ? (
        <ErrorState
          title="Verification could not be completed"
          message="Something went wrong. Please try again."
          action={
            <PrimaryButton onClick={() => void runSubmit()}>
              Try again
            </PrimaryButton>
          }
        />
      ) : (
        <div className={styles.actions}>
          <PrimaryButton
            fullWidth
            disabled={phase === "submitting"}
            onClick={() => void runSubmit()}
          >
            Submit
          </PrimaryButton>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen 12 — Aadhaar (details → send OTP → OTP → verifying → verified)      */
/* -------------------------------------------------------------------------- */

type AadhaarPhase = "details" | "sending" | "otp" | "verifying" | "success" | "error";

/** Screen 12 — Aadhaar Verification. Uses `sendOtp` + `submitAadhaar` (mocked). */
export function AadhaarVerificationScreen({ onAdvance }: VerificationScreenProps) {
  const setVerificationStatus = useLienPayStore((s) => s.setVerificationStatus);
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);
  const [phase, setPhase] = useState<AadhaarPhase>("details");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const inFlightRef = useRef(false);

  const canSend = aadhaar.replace(/\D/g, "").length > 0 && phase === "details";
  const canVerify = otp.length === 6 && phase === "otp";

  const sendOtp = useCallback(async () => {
    if (inFlightRef.current || aadhaar.replace(/\D/g, "").length === 0) return;
    inFlightRef.current = true;
    setPhase("sending");
    setAsyncInFlight(true);
    try {
      await mockService.sendOtp(aadhaar);
      setPhase("otp");
    } finally {
      inFlightRef.current = false;
      setAsyncInFlight(false);
    }
  }, [aadhaar, setAsyncInFlight]);

  const verify = useCallback(async () => {
    if (inFlightRef.current || otp.length !== 6) return;
    inFlightRef.current = true;
    setPhase("verifying");
    setAsyncInFlight(true);
    try {
      const result = await mockService.submitAadhaar({ aadhaar, otp });
      if (result.status === "success") {
        setVerificationStatus("aadhaar", "complete");
        setPhase("success");
        window.setTimeout(onAdvance, SUCCESS_HOLD_MS);
      } else {
        setPhase("error");
      }
    } finally {
      inFlightRef.current = false;
      setAsyncInFlight(false);
    }
  }, [aadhaar, otp, setVerificationStatus, setAsyncInFlight, onAdvance]);

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Aadhaar Verification"
    >
      <VerifyHead
        icon={<AadhaarIcon />}
        eyebrow="Identity verification"
        heading="Aadhaar verification"
        lead="Enter your Aadhaar number and verify with a one-time code."
      />

      {phase === "success" ? (
        <div className={phase5.successMoment}>
          <SuccessState title="Aadhaar verified" message="Your identity is confirmed." />
        </div>
      ) : phase === "error" ? (
        <ErrorState
          title="Verification could not be completed"
          message="That didn't work. Please try again."
          action={
            <PrimaryButton
              onClick={() => {
                setOtp("");
                setPhase("details");
              }}
            >
              Try again
            </PrimaryButton>
          }
        />
      ) : (
        <div className={phase5.aadhaarBlock}>
          <InputField
            label="Aadhaar number"
            inputMode="numeric"
            maxLength={12}
            value={aadhaar}
            disabled={phase !== "details"}
            onChange={(e) => setAadhaar(e.target.value)}
          />

          {phase === "otp" || phase === "verifying" ? (
            <OTPInput
              label="Enter 6-digit OTP"
              value={otp}
              length={6}
              disabled={phase === "verifying"}
              onChange={setOtp}
            />
          ) : null}

          {phase === "sending" || phase === "verifying" ? (
            <div className={phase5.loadingWrap}>
              <LoadingState
                label={phase === "sending" ? "Sending code" : "Verifying"}
              />
            </div>
          ) : null}

          <div className={styles.actions}>
            {phase === "otp" || phase === "verifying" ? (
              <PrimaryButton
                fullWidth
                disabled={!canVerify}
                onClick={() => void verify()}
              >
                Verify
              </PrimaryButton>
            ) : (
              <PrimaryButton
                fullWidth
                disabled={!canSend}
                onClick={() => void sendOtp()}
              >
                Send OTP
              </PrimaryButton>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen 13 — Selfie (simulated capture → analyzing → confirmed)             */
/* -------------------------------------------------------------------------- */

type SelfiePhase = "capture" | "analyzing" | "success" | "error";

/** Screen 13 — Selfie Verification. Simulated capture; `submitSelfie` (mocked). */
export function SelfieVerificationScreen({ onAdvance }: VerificationScreenProps) {
  const setVerificationStatus = useLienPayStore((s) => s.setVerificationStatus);
  const setAsyncInFlight = useLienPayStore((s) => s.setAsyncInFlight);
  const [phase, setPhase] = useState<SelfiePhase>("capture");
  const inFlightRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (phase === "capture") {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Camera access denied or unavailable", err);
        });
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [phase, stopCamera]);

  const capture = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setPhase("analyzing");
    setAsyncInFlight(true);
    stopCamera();
    try {
      const result = await mockService.submitSelfie({});
      if (result.status === "success") {
        setVerificationStatus("selfie", "complete");
        setPhase("success");
        window.setTimeout(onAdvance, SUCCESS_HOLD_MS);
      } else {
        setPhase("error");
      }
    } finally {
      inFlightRef.current = false;
      setAsyncInFlight(false);
    }
  }, [setVerificationStatus, setAsyncInFlight, onAdvance, stopCamera]);

  return (
    <section
      className={`${styles.screen} ${styles.flow}`}
      aria-label="Selfie Verification"
    >
      <VerifyHead
        icon={<SelfieIcon />}
        eyebrow="Identity verification"
        heading="Selfie verification"
        lead="Position your face inside the frame, then capture."
      />

      {phase === "success" ? (
        <div className={phase5.successMoment}>
          <SuccessState title="Identity confirmed" message="Your selfie check is complete." />
        </div>
      ) : phase === "error" ? (
        <ErrorState
          title="We couldn't verify your selfie"
          message="Please try capturing again."
          action={
            <PrimaryButton onClick={() => setPhase("capture")}>
              Try again
            </PrimaryButton>
          }
        />
      ) : (
        <>
          <div
            className={phase5.captureFrame}
            role="img"
            aria-label="Simulated selfie capture area"
            style={{ position: "relative", overflow: "hidden" }}
          >
            {phase === "capture" && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  zIndex: 0,
                  transform: "scaleX(-1)" // Mirror the camera feed
                }}
              />
            )}
            <span className={phase5.captureCorner} style={{ top: 14, left: 14, borderRight: "none", borderBottom: "none", zIndex: 1 }} />
            <span className={phase5.captureCorner} style={{ top: 14, right: 14, borderLeft: "none", borderBottom: "none", zIndex: 1 }} />
            <span className={phase5.captureCorner} style={{ bottom: 14, left: 14, borderRight: "none", borderTop: "none", zIndex: 1 }} />
            <span className={phase5.captureCorner} style={{ bottom: 14, right: 14, borderLeft: "none", borderTop: "none", zIndex: 1 }} />
            <span className={phase5.captureOval} aria-hidden="true" style={{ zIndex: 1, boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)" }} />
            <span className={phase5.captureIcon} aria-hidden="true" style={{ zIndex: 1, opacity: phase === "capture" ? 0.3 : 1 }}>
              <SelfieIcon />
            </span>
          </div>

          {phase === "analyzing" ? (
            <div className={phase5.loadingWrap}>
              <LoadingState label="Analyzing selfie" />
            </div>
          ) : null}

          <div className={styles.actions}>
            <PrimaryButton
              fullWidth
              disabled={phase === "analyzing"}
              onClick={() => void capture()}
            >
              Capture
            </PrimaryButton>
          </div>
        </>
      )}
    </section>
  );
}
