import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomSheet } from "./BottomSheet";

describe("BottomSheet", () => {
  it("renders nothing when closed", () => {
    render(
      <BottomSheet open={false} title="Pay">
        <p>Body</p>
      </BottomSheet>
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders an accessible dialog labelled by its title when open", () => {
    render(
      <BottomSheet open title="Pay options">
        <p>Body</p>
      </BottomSheet>
    );
    const dialog = screen.getByRole("dialog", { name: "Pay options" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open title="Pay" onClose={onClose}>
        <button>Inside</button>
      </BottomSheet>
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("moves focus into the sheet when opened", () => {
    render(
      <BottomSheet open title="Pay">
        <button>Scan QR</button>
      </BottomSheet>
    );
    expect(screen.getByRole("button", { name: "Scan QR" })).toHaveFocus();
  });
});
