/**
 * ActiveAccountShell — the Active_Account navigation frame (task 12.3).
 *
 * Wraps the active-account destinations in the shared `AppShell` with a
 * `BottomNavigation` rendered from the centralized `ACTIVE_NAV` tuple, so the
 * bar shows EXACTLY the four items Home, Transactions, Repayments, Portfolio in
 * order (Req 10.1) and no item can be added or removed (Design: Enforcing
 * exactly-N tabs). This is the post-activation counterpart to
 * `PreActivationShell`: reaching `activationStatus === "active"` swaps the
 * three-item Pre_Activation_Nav for this four-item Active_Account nav and routes
 * to `/app/active/home` (Req 10.8, 22.15).
 *
 * Selecting an item navigates to the corresponding `/app/active/*` route
 * (Req 10.5); the active item is derived from the current location and rendered
 * by the shared `BottomNavigation` with a neon accent plus a non-color indicator
 * (Req 10.4, 3.6). Profile and Notifications are NOT tabs here — they are the
 * shared `TopBar`'s icon-only controls (with accessible labels, Req 3.8) that
 * route to `/app/active/profile` and `/app/active/notifications` within the
 * navigation time budget (Req 10.6, 10.7, 10.9). Native scrolling only
 * (Req 17.6).
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 22.15,
 * 3.6, 3.8. Design: Navigation Architecture (Active route table), Active-account
 * transition (nav swap), Accessibility.
 */
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell,
  BottomNavigation,
  TopBar,
  type BottomNavigationItem,
} from "../../design-system/components";
import {
  ACTIVE_NAV,
  ROUTES,
  type ActiveNavItem,
} from "../../navigation/navConfig";
import { NAV_ICONS } from "../../navigation/navIcons";

/**
 * Label + route for each active-account nav id. Iterated in the fixed order of
 * `ACTIVE_NAV`, so the rendered count/order comes from the centralized tuple
 * (Req 10.1). Labels are exactly Home | Transactions | Repayments | Portfolio.
 */
const ACTIVE_NAV_META: Record<ActiveNavItem, { label: string; path: string }> = {
  home: { label: "Home", path: ROUTES.active.home },
  transactions: { label: "Transactions", path: ROUTES.active.transactions },
  repayments: { label: "Repayments", path: ROUTES.active.repayments },
  portfolio: { label: "Portfolio", path: ROUTES.active.portfolio },
};

const NAV_ITEMS: BottomNavigationItem[] = ACTIVE_NAV.map((id) => ({
  id,
  label: ACTIVE_NAV_META[id].label,
  icon: NAV_ICONS[id]?.(),
}));

/** Resolves the active nav id from the current pathname (defaults to Home). */
function activeNavId(pathname: string): ActiveNavItem {
  const match = ACTIVE_NAV.find((id) => pathname === ACTIVE_NAV_META[id].path);
  return match ?? "home";
}

export function ActiveAccountShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = activeNavId(location.pathname);

  const handleSelect = (id: string) => {
    const meta = ACTIVE_NAV_META[id as ActiveNavItem];
    if (meta && meta.path !== location.pathname) {
      navigate(meta.path);
    }
  };

  return (
    <AppShell
      contentLabel="LienPay"
      topBar={
        <TopBar
          ariaLabel="Account"
          profilePlacement="leading"
          profileStatus
          notificationsStatus
          profileLabel="Profile"
          notificationsLabel="Notifications"
          onProfileClick={() => navigate(ROUTES.active.profile)}
          onNotificationsClick={() => navigate(ROUTES.active.notifications)}
        />
      }
      bottomNav={
        <BottomNavigation
          items={NAV_ITEMS}
          activeId={activeId}
          onSelect={handleSelect}
          ariaLabel="Active account"
        />
      }
    >
      <Outlet />
    </AppShell>
  );
}
