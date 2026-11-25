/**
 * _shared/useDialogA11y.ts
 *
 * Shared accessibility behavior for the overlay dialog components (Modal and
 * BottomSheet), authored once so both feedback/overlay surfaces behave
 * identically (Req 14.3, 14.6). It provides the focus management and keyboard
 * handling expected of a modal dialog (Design: Accessibility, Components and
 * Interfaces — Error Handling/overlays):
 *
 *  - On open: remembers the previously focused element and moves focus into the
 *    dialog (the first focusable element, or the dialog container itself).
 *  - While open: traps Tab / Shift+Tab focus within the dialog, and closes on
 *    Escape.
 *  - On close/unmount: restores focus to the element that was focused before
 *    the dialog opened.
 *
 * This hook holds no color/content — it only wires behavior. Visible focus
 * indicators (Req 3.7) are provided by each component's CSS.
 */
import { useEffect, type RefObject } from "react";

/** Selector matching the elements considered focusable for the focus trap. */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

export interface UseDialogA11yOptions {
  /** Whether the dialog is currently open. */
  open: boolean;
  /** Ref to the dialog container element. */
  containerRef: RefObject<HTMLElement>;
  /** Called when the user requests to close (Escape). */
  onClose?: () => void;
}

/**
 * Wires modal-dialog focus management + keyboard handling for an overlay. Safe
 * in non-browser/test environments (guards against a missing container).
 */
export function useDialogA11y({
  open,
  containerRef,
  onClose,
}: UseDialogA11yOptions): void {
  useEffect(() => {
    if (!open) return;

    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Move focus into the dialog.
    const focusables = getFocusable(container);
    (focusables[0] ?? container).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== "Tab") return;

      const items = getFocusable(container);
      if (items.length === 0) {
        // Keep focus on the container itself.
        event.preventDefault();
        container.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || active === container) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the opener.
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [open, containerRef, onClose]);
}
