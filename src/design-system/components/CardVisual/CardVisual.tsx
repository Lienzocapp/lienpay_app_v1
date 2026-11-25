/**
 * CardVisual — the premium LienPay card hero visual (hand holding the card).
 *
 * A GENERIC, reusable presentational component authored once (Req 14.1, 14.3,
 * 14.6) so the same artwork can be used anywhere without duplicating the file
 * or the markup. The image is a STATIC asset served from `public/assets/visuals`
 * (never inlined as base64), referenced through a single exported constant.
 *
 * The URL is built from `import.meta.env.BASE_URL` so it resolves correctly both
 * on the web (Vercel, served from the domain root) and inside the Capacitor
 * native WebView, where the bundle uses relative paths (`vite base: "./"`).
 *
 * Colors come exclusively from design tokens (Req 1.2, 14.5); the optional glow
 * is a token-derived radial wash. Motion collapses under prefers-reduced-motion
 * via the global backstop.
 */
import type { CSSProperties } from "react";
import { VISUALS } from "../../assets/visuals";
import styles from "./CardVisual.module.css";

/**
 * The card artwork path, re-exported from the central visuals map so callers can
 * reference the raw URL (e.g. for preloading) without repeating the string.
 */
export const CARD_VISUAL_SRC = VISUALS.cardHand;

/** Rendered footprint of the visual. */
export type CardVisualSize = "sm" | "md" | "lg";

export interface CardVisualProps {
  /** Footprint preset. Defaults to `"md"`. */
  size?: CardVisualSize;
  /** Render the soft green glow behind the artwork. Defaults to `true`. */
  glow?: boolean;
  /** Accessible description of the artwork. */
  alt?: string;
  /** Optional caption rendered beneath the artwork. */
  caption?: string;
  /** How the artwork fills its box. Defaults to `"contain"`. */
  objectFit?: CSSProperties["objectFit"];
  /** Focal point of the artwork. Defaults to `"center"`. */
  objectPosition?: CSSProperties["objectPosition"];
  /** Additional class name(s) for layout composition. */
  className?: string;
  /** Override the artwork source (e.g. an alternative render). */
  src?: string;
}

const SIZE_CLASS: Record<CardVisualSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export function CardVisual({
  size = "md",
  glow = true,
  alt = "A hand holding a LienPay card",
  caption,
  objectFit = "contain",
  objectPosition = "center",
  className,
  src = CARD_VISUAL_SRC,
}: CardVisualProps) {
  const classes = [styles.stage, SIZE_CLASS[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {glow ? <span className={styles.glow} aria-hidden="true" /> : null}
      <img
        className={styles.image}
        src={src}
        alt={alt}
        style={{ objectFit, objectPosition }}
        decoding="async"
      />
      {caption ? <p className={styles.caption}>{caption}</p> : null}
    </div>
  );
}
