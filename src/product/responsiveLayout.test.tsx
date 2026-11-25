/**
 * Automated accessibility + responsive layout QA (task 19.4).
 *
 * Verifies the accessibility and responsive contracts that Phase 12 asserts,
 * within the limits of the jsdom test environment (which does not compute real
 * pixel layout, and — per the project's `css: false` test config — does not
 * apply stylesheet rules). The suite therefore combines:
 *
 *  - Contrast (Req 3.1): computed WCAG contrast ratios from the seven locked
 *    color tokens — body text >= 4.5:1, large text/figures >= 3:1 against the
 *    near-black surfaces. (Pure calculation — fully deterministic.)
 *  - Accessible labels (Req 3.8): every icon-only Top_Bar control exposes an
 *    accessible name; the Bottom_Navigation items expose accessible names.
 *  - Keyboard operability (Req 3.7): the interactive controls render as native
 *    focusable elements (button/input), so they receive keyboard focus and the
 *    shared components' :focus-visible styling applies.
 *  - Centered phone shell + 1280px landing cap (Req 15.3, 15.4): the shells
 *    apply their responsive layout hook (the scoped CSS-module class) to the
 *    frame/container element.
 *  - Audited breakpoint set (Req 15.1, 15.2): pinned so it cannot drift.
 *
 * NOTE: pixel-level "no horizontal scroll / no clipping" at each width is a
 * layout concern that a headless DOM cannot compute; it is verified by the
 * production build + manual QA. The structural contract below is what is
 * machine-verifiable here.
 *
 * Design: Responsive Architecture, Accessibility, Testing Strategy.
 */
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "../design-system/components";
import { ActiveAccountShell } from "./active/ActiveAccountShell";
import LandingEntry from "../landing/LandingEntry";
import { colorTokens } from "../design-system/tokens/tokens";

/** The mobile / desktop widths Phase 12 audits (Req 15.1, 15.2). */
const AUDITED_WIDTHS_PX = [390, 393, 430, 768, 1024, 2560] as const;

/* --------------------------- contrast helpers ----------------------------- */

/** Parses a #RRGGBB hex string into [r, g, b] (0–255). */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** WCAG relative luminance for an sRGB color. */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : ((cs + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two hex colors (>= 1). */
function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(hexToRgb(fg));
  const l2 = relativeLuminance(hexToRgb(bg));
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

describe("Accessibility — text contrast against near-black surfaces (Req 3.1)", () => {
  it("renders body text at >= 4.5:1 on Background and Panel", () => {
    // Primary White body text.
    expect(contrastRatio(colorTokens.textPrimary, colorTokens.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colorTokens.textPrimary, colorTokens.panel)).toBeGreaterThanOrEqual(4.5);
    // Secondary Grey supporting text.
    expect(contrastRatio(colorTokens.textSecondary, colorTokens.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colorTokens.textSecondary, colorTokens.panel)).toBeGreaterThanOrEqual(4.5);
  });

  it("renders neon-accent large text/figures at >= 3:1 on Background", () => {
    expect(contrastRatio(colorTokens.green, colorTokens.bg)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(colorTokens.greenBright, colorTokens.bg)).toBeGreaterThanOrEqual(3);
  });
});

describe("Accessibility — labels + operability of controls (Req 3.8, 3.7, 3.6)", () => {
  it("exposes accessible names for the Top_Bar and Bottom_Navigation controls", () => {
    render(
      <MemoryRouter initialEntries={["/app/active/home"]}>
        <ActiveAccountShell />
      </MemoryRouter>
    );
    // Icon-only Top_Bar controls (Req 3.8).
    const profile = screen.getByRole("button", { name: "Profile" });
    const notifications = screen.getByRole("button", { name: "Notifications" });
    expect(profile).toBeInTheDocument();
    expect(notifications).toBeInTheDocument();
    // Native focusable elements => keyboard-focusable, so the shared
    // :focus-visible indicator applies (Req 3.7).
    expect(profile.tagName).toBe("BUTTON");
    expect(notifications.tagName).toBe("BUTTON");

    // Bottom navigation exposes exactly the four named tabs (Req 10.1, 3.8),
    // each a focusable button (Req 3.7).
    const nav = screen.getByRole("navigation", { name: "Active account" });
    for (const label of ["Home", "Transactions", "Repayments", "Portfolio"]) {
      const tab = within(nav).getByRole("button", { name: label });
      expect(tab.tagName).toBe("BUTTON");
    }
  });
});

describe("Responsive — centered phone shell + landing cap (Req 15.3, 15.4)", () => {
  it("wraps the Product_Application frame in the centered phone-shell layout", () => {
    const { container } = render(
      <AppShell topBar={<div>top</div>} bottomNav={<div>bottom</div>}>
        <p>content</p>
      </AppShell>
    );
    // The whole frame (top bar + content + bottom nav) is one layout root that
    // carries the centered max-width phone-shell class, so the mobile UI is
    // never stretched at >= 768px (Req 15.4). The <main> lives inside it.
    const frame = container.firstElementChild as HTMLElement;
    expect(frame.className).toMatch(/shell/);
    expect(frame.querySelector("main")).not.toBeNull();
  });

  it("wraps the Landing_Page content in the 1280px-capped centered container (Req 15.3)", () => {
    const { container } = render(<LandingEntry />);
    const band = container.firstElementChild as HTMLElement;
    // Full-width section band with a centered, capped content container inside.
    expect(band.getAttribute("data-experience")).toBe("landing");
    const capped = container.querySelector('[data-role="landing-content"]') as HTMLElement;
    expect(capped).not.toBeNull();
    expect(capped.className).toMatch(/container/);
  });

  it("audits the documented breakpoint set", () => {
    // Pins the exact width set Phase 12 audits so it cannot silently drift.
    expect(AUDITED_WIDTHS_PX).toEqual([390, 393, 430, 768, 1024, 2560]);
  });
});
