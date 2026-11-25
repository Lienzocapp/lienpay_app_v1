/**
 * app-router.tsx
 *
 * Entry-level experience split for LienPay (task 4.12).
 *
 * The application root splits IMMEDIATELY into two route trees that are
 * code-split at the entry/route level via `React.lazy` + `Suspense`, so each
 * experience ships as an independent chunk that shares the design core but not
 * each other's code (Design: Architecture, Experience separation —
 * code-splitting; Req 17.1, 17.2, 17.5, 17.6, 4.14):
 *
 *   - `/`      → Landing_Page (Experience A) — the `landing` chunk. The landing
 *                motion libraries (Lenis / GSAP) will be imported ONLY inside
 *                this chunk (built in Phase 2), never in the product chunk.
 *   - `/app/*` → Product_Application (Experience B) — the `app` chunk. A
 *                state-aware entry that will later redirect by `activationStatus`
 *                (task 7.1). Uses native scrolling only (Req 17.4, 17.6).
 *
 * Both entries are intentionally empty placeholder shells at this stage: the
 * real landing sections/motion and the product screens are built in later
 * phases. This task only establishes the split so the app boots and both routes
 * resolve without error.
 *
 * The route path constants come from the centralized navigation config so the
 * paths stay a single source of truth (`navigation/navConfig`).
 */
import { lazy, Suspense } from "react";
// HashRouter (not BrowserRouter) so routing works reliably inside the Capacitor
// native WebView on both Android and iOS: hash-based routes never depend on a
// server/native host resolving deep paths, so a reload or deep link inside the
// wrapper always resolves. This remains fully functional in the browser demo
// (paths are carried after `#`), so the same build powers browser + Android + iOS.
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "./navigation/navConfig";

// Independent lazy chunks: `landing` (Experience A) and `app` (Experience B).
// The dynamic imports are what let the bundler split these into separate chunks
// and keep the landing motion runtime out of the product bundle.
const ProductEntry = lazy(() => import("./product/ProductEntry"));

/**
 * The demo entry route — the animated splash that begins the LienPay flow. This
 * is the SAME start_url the installed PWA uses (see public/manifest.webmanifest),
 * so opening the bare deployment URL in a desktop browser lands on exactly the
 * same first screen as the installed mobile app instead of an empty shell.
 */
const DEMO_ENTRY = "/app/pre/onboarding/splash";

/**
 * Minimal Suspense fallback shown while a lazy chunk loads. Kept content-free
 * (no invented copy); screens/loading UI are added in later phases.
 */
function ChunkFallback() {
  return <div data-role="chunk-fallback" aria-hidden="true" />;
}

export default function AppRouter() {
  return (
    <HashRouter>
      <Suspense fallback={<ChunkFallback />}>
        <Routes>
          {/* Root → the demo splash. The Landing_Page (Experience A) is an
              empty placeholder shell, so the bare deployment URL now opens the
              actual animated demo instead of a blank screen — matching the
              installed PWA's start_url. */}
          <Route path={ROUTES.landing} element={<Navigate to={DEMO_ENTRY} replace />} />

          {/* Experience B — Product_Application (app chunk). `/app` is the
              state-aware entry; the `/*` splat reserves the nested pre/active
              routes added in later phases without building them here. */}
          <Route path="/app/*" element={<ProductEntry />} />

          {/* Unknown paths fall back to the demo entry so no route dead-ends
              on the empty landing shell. */}
          <Route path="*" element={<Navigate to={DEMO_ENTRY} replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
