import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("renders the title and message supplied via props", () => {
    render(
      <ErrorState title="Could not load" message="Please try again later." />
    );
    expect(screen.getByText("Could not load")).toBeInTheDocument();
    expect(screen.getByText("Please try again later.")).toBeInTheDocument();
  });

  it("announces itself via an assertive alert role", () => {
    render(<ErrorState title="Error" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders a caller-supplied retry action", () => {
    render(<ErrorState title="Error" action={<button>Retry</button>} />);
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
