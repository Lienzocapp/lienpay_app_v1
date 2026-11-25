/**
 * ProductEntry — the Product_Application (Experience B) root mounted at
 * `/app/*` (the lazy `app` chunk). It imports the shared design core but NOT
 * the landing motion runtime (Design: Experience separation — code-splitting;
 * Req 17.1, 17.2, 17.5, 17.6). Product motion uses native scrolling only
 * (Req 17.4, 17.6).
 *
 * Routing implemented in this batch:
 *   `/app` → StateAwareEntry (task 7.1): renders no screen; reads
 *            `activationStatus` and redirects via the centralized
 *            `APP_ENTRY_REDIRECTS` map — `inactive`/`in_progress` →
 *            `/app/pre/home`, `active` → `/app/active/home` (Req 22.14, 10.8).
 *   `/app/pre/*` (tab shell) → PreActivationShell with the three tab
 *            destinations Home (screen 6) / Benefits / Learn and the
 *            pre-activation BottomNavigation (task 7.3, Req 9.1).
 *   `/app/pre/onboarding/:step` → the OnboardingHost — the ordered
 *            Pre_Activation_Flow screens (flow context, no bottom nav).
 *   `/app/active/*` (tab shell) → ActiveAccountShell with the four Active_Account
 *            destinations Home / Transactions / Repayments / Portfolio and the
 *            active 4-tab BottomNavigation (task 12.3, Req 10.1). Home is a
 *            minimal landing target for the activation nav swap; the full Active
 *            Home credit position and the other tabs are Phase 7.
 *
 * Deviation resolved (was documented in the Phase-3 checkpoint): the earlier
 * batch temporarily redirected `/app` to the onboarding Splash because
 * Pre-Activation Home (screen 6) did not yet exist. Screen 6 now exists, so this
 * entry restores the design-correct behavior — `/app` → `/app/pre/home`
 * (Design: Navigation Architecture, state-aware entry point). The onboarding
 * flow remains reachable via the Activate_Account_CTA / resume resolver on
 * screen 6.
 *
 * Nested routes are relative to the `/app/*` mount in `app-router.tsx`.
 */
import { Navigate, Route, Routes } from "react-router-dom";
import OnboardingHost from "./pre-activation/onboarding/OnboardingHost";
import { PreActivationShell } from "./pre-activation/PreActivationShell";
import { PreActivationHome } from "./pre-activation/screens/PreActivationHome";
import { LearnDetailScreen } from "./pre-activation/screens/LearnDetailScreen";
import { BenefitsScreen } from "./pre-activation/screens/BenefitsScreen";
import { LearnScreen } from "./pre-activation/screens/LearnScreen";
import { ActiveAccountShell } from "./active/ActiveAccountShell";
import {
  ActiveHome,
  ActiveLearn,
  ActiveNotifications,
  ActivePay,
  ActivePortfolio,
  ActiveProfile,
  ActiveRepayments,
  ActiveTransactions,
} from "./active/screens/ActiveScreens";
import { APP_ENTRY_REDIRECTS, ROUTES } from "../navigation/navConfig";
import { useLienPayStore } from "../state/store";

/**
 * StateAwareEntry — the `/app` state-aware entry point (task 7.1). Renders no
 * screen of its own; it reads `activationStatus` from the centralized
 * Application_State and redirects via the centralized `APP_ENTRY_REDIRECTS`
 * map (Req 22.14, 10.8):
 *   - `inactive` / `in_progress` → `/app/pre/home`
 *   - `active` → `/app/active/home`
 */
function StateAwareEntry() {
  const activationStatus = useLienPayStore((s) => s.activationStatus);
  return <Navigate to={APP_ENTRY_REDIRECTS[activationStatus]} replace />;
}

export default function ProductEntry() {
  return (
    <div data-experience="app">
      <Routes>
        {/* `/app` — state-aware entry; redirects by activationStatus (7.1). */}
        <Route index element={<StateAwareEntry />} />

        {/* `/app/pre/*` tab shell: Home (screen 6) | Benefits | Learn (7.3). */}
        <Route path="pre" element={<PreActivationShell />}>
          <Route path="home" element={<PreActivationHome />} />
          <Route path="benefits" element={<BenefitsScreen />} />
          <Route path="learn" element={<LearnScreen />} />
          {/* Learn detail — a single question opened as a readable answer page
              (design reference: Learn detail). Still a Learn tab destination,
              so the pre-activation bottom nav stays exactly three items. */}
          <Route path="learn/:questionId" element={<LearnDetailScreen />} />
        </Route>

        {/* The ordered Pre_Activation_Flow screens (flow context, no nav). */}
        <Route path="pre/onboarding/:step" element={<OnboardingHost />} />

        {/* `/app/active/*` tab shell (task 12.3 + Phase 7): the 4-tab
            Active_Account Bottom_Navigation plus the Top_Bar. Home renders the
            full credit-position dashboard (task 13.2); the other tabs remain
            minimal placeholders until Phase 8+. Profile and Notifications are
            Top_Bar destinations (NOT tabs, Req 10.2/10.9) — minimal placeholders
            until Phase 11. Pay is reachable from Home but NOT a tab (Req 21.2) —
            the Pay flow itself is Phase 8. */}
        <Route path="active" element={<ActiveAccountShell />}>
          <Route path="home" element={<ActiveHome />} />
          <Route path="transactions" element={<ActiveTransactions />} />
          <Route path="repayments" element={<ActiveRepayments />} />
          <Route path="portfolio" element={<ActivePortfolio />} />
          <Route path="profile" element={<ActiveProfile />} />
          <Route path="notifications" element={<ActiveNotifications />} />
          {/* Learn — reachable via the Profile affordance, NOT a bottom-nav tab
              (Req 11.14, task 18.1). */}
          <Route path="learn" element={<ActiveLearn />} />
          <Route path="pay" element={<ActivePay />} />
          {/* Any other active path lands on Home. */}
          <Route path="*" element={<Navigate to={ROUTES.active.home} replace />} />
        </Route>

        {/* Any other product path returns to the state-aware entry. */}
        <Route path="*" element={<Navigate to={ROUTES.appEntry} replace />} />
      </Routes>
    </div>
  );
}
