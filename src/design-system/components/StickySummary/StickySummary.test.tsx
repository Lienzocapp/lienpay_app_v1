import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StickySummary } from "./StickySummary";

describe("StickySummary", () => {
  it("renders a headline label and value supplied via props", () => {
    render(<StickySummary label="Selected" value="3 funds" />);
    expect(screen.getByText("Selected")).toBeInTheDocument();
    expect(screen.getByText("3 funds")).toBeInTheDocument();
  });

  it("renders children and an actions slot", () => {
    render(
      <StickySummary ariaLabel="Summary" actions={<button>Continue</button>}>
        <span>custom content</span>
      </StickySummary>
    );
    expect(screen.getByRole("region", { name: "Summary" })).toBeInTheDocument();
    expect(screen.getByText("custom content")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue" })
    ).toBeInTheDocument();
  });
});
