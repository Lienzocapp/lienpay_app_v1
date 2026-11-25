import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./design-system/tokens/tokens.css";
import "./design-system/tokens/scale.css";
import "./design-system/fonts/satoshi/satoshi.css";
import "./design-system/tokens/typography.css";
import "./design-system/base.css";
import AppRouter from "./app-router";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);

/*
 * Register the PWA service worker so the deployed web app installs to the home
 * screen and launches offline. Guarded to run ONLY in a production browser
 * build — never during dev, and never inside the Capacitor native app (which
 * serves its own bundled assets), so the native experience is unaffected.
 */
if (
  import.meta.env.PROD &&
  !("Capacitor" in window) &&
  "serviceWorker" in navigator
) {
  /*
   * Whether this page load was already controlled by a worker. Used to tell a
   * genuine UPDATE (returning visitor, worker swapped) apart from the FIRST
   * install (no previous controller), so we only reload in the former case and
   * never loop on a first visit.
   */
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;

  /*
   * When a newly deployed worker takes control, reload once so the page runs the
   * new build immediately. Without this, a returning visitor keeps the old app
   * until they manually hard-refresh — which makes a successful deploy look like
   * nothing shipped.
   */
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        // Explicitly check for a new worker on every load, so a deploy is
        // detected without waiting for the browser's own update heuristics.
        void registration.update();
      })
      .catch(() => {
        /* PWA is a progressive enhancement; ignore registration failures. */
      });
  });
}
// abc 123 231 123
