/**
 * PreActivationShell — the pre-activation navigation frame (task 7.3).
 *
 * Wraps the pre-activation tab destinations (Home, Benefits, Learn) in the
 * shared `AppShell` with a `BottomNavigation` rendered in pre-activation mode.
 * The nav shows EXACTLY the three items Home, Benefits, Learn (Req 9.1), sourced
 * from the centralized `PRE_ACTIVATION_NAV` tuple so no item can be added or
 * removed (Design: Enforcing exactly-N tabs). Selecting an item navigates to the
 * corresponding `/app/pre/*` route within the nav's time budget (Req 9.2); the
 * active item is derived from the current location and rendered with a neon
 * accent plus a non-color indicator by the shared `BottomNavigation` (Req 9.3,
 * 3.6).
 *
 * The bottom nav is only shown for the tab destinations. The 20 ordered
 * Pre_Activation_Flow screens render under `/app/pre/onboarding/:step` in the
 * `OnboardingHost` (flow context, no bottom nav — Design: Pre-Activation route
 * table); the Activate_Account_CTA is a UI action, never a nav item (Req 22.6).
 * Native scrolling only (Req 17.6).
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 3.6.
 * Design: Navigation Architecture (Pre-Activation route table), Accessibility.
 */
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell,
  BottomNavigation,
  type BottomNavigationItem,
} from "../../design-system/components";
import {
  PRE_ACTIVATION_NAV,
  ROUTES,
  type PreActivationNavItem,
} from "../../navigation/navConfig";
import { NAV_ICONS } from "../../navigation/navIcons";
import { useLienPayStore } from "../../state/store";

/**
 * Label + route for each pre-activation nav id. Iterated in the fixed order of
 * `PRE_ACTIVATION_NAV`, so the rendered count/order comes from the centralized
 * tuple (Req 9.1). Labels are exactly Home | Benefits | Learn (Req 9.1).
 */
const PRE_NAV_META: Record<PreActivationNavItem, { label: string; path: string }> = {
  home: { label: "Home", path: ROUTES.pre.home },
  benefits: { label: "Benefits", path: ROUTES.pre.benefits },
  learn: { label: "Learn", path: ROUTES.pre.learn },
};

const NAV_ITEMS: BottomNavigationItem[] = PRE_ACTIVATION_NAV.map((id) => ({
  id,
  label: PRE_NAV_META[id].label,
  icon: NAV_ICONS[id]?.(),
}));

/**
 * Resolves the active nav id from the current pathname (defaults to Home).
 * Nested destinations keep their parent tab active — e.g. the Learn detail
 * route `/app/pre/learn/:questionId` still highlights Learn.
 */
function activeNavId(pathname: string): PreActivationNavItem {
  const match = PRE_ACTIVATION_NAV.find((id) => {
    const path = PRE_NAV_META[id].path;
    return pathname === path || pathname.startsWith(`${path}/`);
  });
  return match ?? "home";
}

export function PreActivationShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const activationStatus = useLienPayStore((s) => s.activationStatus);
  const activeId = activeNavId(location.pathname);

  // Nav swap (Req 10.8, 22.15): once the account is active, the pre-activation
  // tab shell is replaced by the Active_Account experience — redirect any
  // `/app/pre/*` tab route to Active Home.
  if (activationStatus === "active") {
    return <Navigate to={ROUTES.active.home} replace />;
  }

  const handleSelect = (id: string) => {
    const meta = PRE_NAV_META[id as PreActivationNavItem];
    if (meta && meta.path !== location.pathname) {
      navigate(meta.path);
    }
  };

  return (
    <AppShell
      contentLabel="LienPay"
      /*
       * No brand top bar: the design references start each pre-activation screen
       * directly with the personalised avatar/greeting header (rendered by the
       * screen itself via `PreActivationHeader`), so a separate "LienPay." bar
       * would be extra chrome the reference does not have.
       */
      bottomNav={
        <BottomNavigation
          items={NAV_ITEMS}
          activeId={activeId}
          onSelect={handleSelect}
          ariaLabel="Pre-activation"
        />
      }
    >
      <Outlet />
    </AppShell>
  );
}
