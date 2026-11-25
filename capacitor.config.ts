import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration — the cross-platform native wrapper for the LienPay
 * React/Vite demo. The SAME built web bundle in `webDir: "dist"` powers the
 * browser, Android, and iOS targets; there is no separate native UI or native
 * business logic.
 *
 *   React/Vite  →  Capacitor  →  { Android, iOS }
 *
 * - `appId`   : reverse-DNS demo application id.
 * - `appName` : the display name shown under the launcher icon.
 * - `webDir`  : the Vite production output (`npm run build`) that is copied
 *               into each native project by `npx cap sync`.
 *
 * Vite is configured with `base: "./"` (relative assets) and the app uses a
 * HashRouter, so deep routes resolve correctly inside the native WebView on
 * both platforms.
 */
const config: CapacitorConfig = {
  appId: "com.lienpay.demo",
  appName: "LienPay",
  webDir: "dist",
  // Keep the native status bar / content out of the notch and home indicator;
  // the web layout already honors env(safe-area-inset-*).
  android: {
    // A light-on-dark demo: allow mixed content off (no external http), and
    // keep the default https scheme for the local WebView host.
    allowMixedContent: false,
  },
  ios: {
    // Use the standard capacitor:// scheme; native scroll bounce is fine for
    // the product experience (native scrolling only — no landing motion here).
    contentInset: "always",
  },
};

export default config;
