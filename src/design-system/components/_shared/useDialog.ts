/**
 * _shared/useDialog.ts
 *
 * Shared accessible-dialog behavior for the overlay components (Modal,
 * BottomSheet). It provides the behavior common to any modal surface so the
 * logic is authored once (Req 14.3): focus management (move focus into the
 * dialog on open, restore focus to the previously focused element on close),
 * Escape-to-close, and a simple focus trap that keeps Tab focus within the
 * dialog while it is open.
 *
 * The hook is presentation-agnostic and invents no content; consumers pass a
 * ref to the dialog container and an `onClose` callback.
 *
 * Design: Components and Interfaces (overlay layer), Accessibility.
 */
import { useEffect } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusable(container: HTMLElement): HTMLElement[] {
  // Exclude elements that are explicitly hidden. We intentionally do NOT rely on
  // `offsetParent`/layout for visibility, because layout is unavailable in the
  // (non-rendering) test environment, which would otherwise report every element
  // as hidden and collapse the focusable set to empty.
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(
    (el) =>
      !el.hasAttribute("hidden") &&
      el.getAttribute("aria-hidden") !== "true" &&
      el.closest("[hidden]") === null
  );
}

export interface UseDialogOptions {
  /** Whether the dialog is currently open. */
  open: boolean;
  /** Ref to the dialog container element. */
  containerRef: RefObject<HTMLElement>;
  /** Called when the dialog requests to close (Escape). */
  onClose?: () => void;
}

/**
 * Wires focus management, Escape-to-close, and a focus trap for a dialog.
 */
export function useDialog({ open, containerRef, onClose }: UseDialogOptions): void {
  useEffect(() => {
    if (!open) return;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Move focus into the dialog (first focusable, else the container itself).
    if (container) {
      const focusable = getFocusable(container);
      (focusable[0] ?? container).focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== "Tab" || !container) return;

      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      // Restore focus to the element focused before the dialog opened.
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [open, containerRef, onClose]);
}
