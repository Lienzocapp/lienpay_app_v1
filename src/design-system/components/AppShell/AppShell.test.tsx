import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders the content in a main landmark", () => {
    render(
      <AppShell>
        <p>Screen content</p>
      </AppShell>
    );
    const main = screen.getByRole("main");
    expect(main).toHaveTextContent("Screen content");
  });

  it("renders the top bar and bottom nav slots when provided", () => {
    render(
      <AppShell topBar={<div>top</div>} bottomNav={<div>bottom</div>}>
        <p>content</p>
      </AppShell>
    );
    expect(screen.getByText("top")).toBeInTheDocument();
    expect(screen.getByText("bottom")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("omits the slots when not provided", () => {
    const { container } = render(
      <AppShell>
        <p>only content</p>
      </AppShell>
    );
    // Just the main region wraps the content; no crash without slots.
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(container.querySelector("main")).toHaveTextContent("only content");
  });
});
