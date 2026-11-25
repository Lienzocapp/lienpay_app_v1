import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProcessTimeline } from "./ProcessTimeline";

describe("ProcessTimeline", () => {
  it("renders each step label supplied via props", () => {
    render(
      <ProcessTimeline
        steps={[
          { id: "a", label: "Step A", status: "complete" },
          { id: "b", label: "Step B", status: "active" },
          { id: "c", label: "Step C", status: "pending" },
        ]}
      />
    );
    expect(screen.getByText("Step A")).toBeInTheDocument();
    expect(screen.getByText("Step B")).toBeInTheDocument();
    expect(screen.getByText("Step C")).toBeInTheDocument();
  });

  it("renders as an ordered list with an accessible label", () => {
    render(
      <ProcessTimeline
        ariaLabel="Progress"
        steps={[{ id: "a", label: "Step A", detail: "in progress" }]}
      />
    );
    expect(screen.getByRole("list", { name: "Progress" })).toBeInTheDocument();
    expect(screen.getByText("in progress")).toBeInTheDocument();
  });
});
