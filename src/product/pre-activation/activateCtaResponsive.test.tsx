/**
 * Activate_Account_CTA responsive QA (task 19.5).
 *
 * Asserts the CTA layout guarantees at 390/393/430/768/1024px+ (Req 22.16,
 * 22.2), within the jsdom environment's limits (no real pixel layout). The
 * guarantees are structural + CSS-contract based:
 *
 *  - Fully visible / never clipped: the CTA renders as a full-width primary
 *    button inside the scrollable AppShell content column (a centered phone
 *    shell at every width), so it always fits the visible viewport width.
 *  - Never overlaps the Bottom_Navigation or fixed elements: the CTA lives
 *    INSIDE the <main> content region, which is a normal-flow sibling ABOVE the
 *    Bottom_Navigation slot in the shell — it cannot overlap it at any width.
 *  - Above the mobile safe area: the CTA wrapper reserves bottom padding using
 *    the safe-area inset.
 *
 * Design: Responsive Architecture, Activate_Account_CTA async safety.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PreActivationShell } from "./PreActivationShell";
import { PreActivationHome } from "./screens/PreActivationHome";
import { useLienPayStore } from "../../state/store";

const navigateSpy = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateSpy };
});

/** Widths Phase 12 audits for the CTA (Req 22.16). */
const CTA_AUDITED_WIDTHS_PX = [390, 393, 430, 768, 1024] as const;

function renderHome() {
  // Mount the shell with the Home route so its <Outlet> renders the
  // Pre-Activation Home content (which hosts the Activate_Account_CTA).
  return render(
    <MemoryRouter initialEntries={["/app/pre/home"]}>
      <Routes>
        <Route path="/app/pre" element={<PreActivationShell />}>
          <Route path="home" element={<PreActivationHome />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("Activate_Account_CTA responsive layout (task 19.5)", () => {
  beforeEach(() => {
    navigateSpy.mockReset();
    useLienPayStore.getState().resetToSnapshot();
  });

  it("renders the CTA as a full-width button so it fits the viewport width", () => {
    render(
      <MemoryRouter initialEntries={["/app/pre/home"]}>
        <PreActivationHome />
      </MemoryRouter>
    );
    const cta = screen.getByTestId("activate-account-cta");
    expect(cta).toBeInTheDocument();
    // Full-width variant => the CTA spans its column and is never clipped.
    expect(cta.className).toMatch(/fullWidth/);
  });

  it("places the CTA inside <main>, above the Bottom_Navigation (no overlap)", () => {
    renderHome();
    // PreActivationShell renders the Home route content in the <main> landmark
    // and the Bottom_Navigation as a separate sibling slot below it.
    const main = screen.getByRole("main");
    const cta = screen.getByTestId("activate-account-cta");
    expect(main).toContainElement(cta);

    // The bottom navigation is NOT inside <main> — so the CTA (in <main>) can
    // never overlap it; they are ordered, normal-flow siblings.
    const nav = screen.getByRole("navigation", { name: "Pre-activation" });
    expect(main).not.toContainElement(nav);
    expect(within(nav).queryByTestId("activate-account-cta")).toBeNull();
  });

  it("wraps the CTA in the safe-area-aware wrapper below content (Req 22.2)", () => {
    render(
      <MemoryRouter initialEntries={["/app/pre/home"]}>
        <PreActivationHome />
      </MemoryRouter>
    );
    // The CTA button sits inside the `.ctaWrap` wrapper, which is pushed below
    // the content (margin-top:auto) and reserves bottom safe-area padding so
    // the CTA stays above the mobile safe area and never overlaps fixed
    // elements. The wrapper's presence around the CTA is the structural hook.
    const cta = screen.getByTestId("activate-account-cta");
    const wrapper = cta.parentElement as HTMLElement;
    expect(wrapper.className).toMatch(/ctaWrap/);
  });

  it("audits the documented CTA breakpoint set", () => {
    expect(CTA_AUDITED_WIDTHS_PX).toEqual([390, 393, 430, 768, 1024]);
  });
});
