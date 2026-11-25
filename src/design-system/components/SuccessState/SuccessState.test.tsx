import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SuccessState } from "./SuccessState";

describe("SuccessState", () => {
  it("renders the title and message supplied via props", () => {
    render(
      <SuccessState title="Account activated" message="You're all set." />
    );
    expect(screen.getByText("Account activated")).toBeInTheDocument();
    expect(screen.getByText("You're all set.")).toBeInTheDocument();
  });

  it("announces itself via an accessible status role", () => {
    render(<SuccessState title="Done" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders a caller-supplied action", () => {
    render(<SuccessState title="Done" action={<button>Continue</button>} />);
    expect(
      screen.getByRole("button", { name: "Continue" })
    ).toBeInTheDocument();
  });
});
