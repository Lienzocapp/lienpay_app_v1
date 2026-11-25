import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} title="Confirm">
        <p>Body</p>
      </Modal>
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders an accessible dialog labelled by its title when open", () => {
    render(
      <Modal open title="Confirm payment">
        <p>Body</p>
      </Modal>
    );
    const dialog = screen.getByRole("dialog", { name: "Confirm payment" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Confirm" onClose={onClose}>
        <button>Inside</button>
      </Modal>
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("moves focus into the dialog when opened", () => {
    render(
      <Modal open title="Confirm">
        <button>First action</button>
      </Modal>
    );
    expect(screen.getByRole("button", { name: "First action" })).toHaveFocus();
  });

  it("renders caller-supplied actions", () => {
    render(
      <Modal open title="Confirm" actions={<button>OK</button>}>
        <p>Body</p>
      </Modal>
    );
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
  });
});
