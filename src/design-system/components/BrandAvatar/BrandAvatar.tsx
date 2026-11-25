/**
 * BrandAvatar — a merchant / fund brand tile.
 *
 * A GENERIC, reusable component authored once (Req 14.1, 14.3, 14.6). It shows a
 * real brand logo loaded from the web when a `logoUrl` is provided, and falls
 * back gracefully to a neon-tinted initial tile if no URL is given OR the image
 * fails to load (offline / blocked / missing). The fallback keeps the row
 * looking intentional in every environment (including a packaged offline app).
 *
 * The tile is decorative — the adjacent merchant/fund name is the accessible
 * label — so the image `alt` is empty and the tile is `aria-hidden`. Colors come
 * exclusively from design tokens (Req 1.2, 14.5); the logo chip sits on a clean
 * light token surface so colored brand marks read well on the dark UI.
 */
import { useState } from "react";
import styles from "./BrandAvatar.module.css";

export interface BrandAvatarProps {
  /** Merchant / fund name — used for the initial fallback + (indirectly) intent. */
  name: string;
  /** Optional web logo URL. When absent or on load error, the initial shows. */
  logoUrl?: string;
  /** Additional class name(s) for layout composition. */
  className?: string;
}

export function BrandAvatar({ name, logoUrl, className }: BrandAvatarProps) {
  const [showImage, setShowImage] = useState<boolean>(Boolean(logoUrl));
  const initial = name.trim().charAt(0).toUpperCase() || "•";

  const classes = [
    styles.tile,
    showImage ? styles.tileImage : styles.tileInitial,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-hidden="true">
      {showImage && logoUrl ? (
        <img
          className={styles.image}
          src={logoUrl}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setShowImage(false)}
        />
      ) : (
        <span className={styles.initial}>{initial}</span>
      )}
    </span>
  );
}
