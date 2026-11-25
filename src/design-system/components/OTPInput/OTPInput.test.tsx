import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OTPInput } from "./OTPInput";

function ControlledOTP({ length }: { length?: number }) {
  const [value, setValue] = useState("");
  return <OTPInput label="One-time passcode" value={value} onChange={setValue} length={length} />;
}

describe("OTPInput", () => {
  it("renders 6 cells by default (generic 6-digit pattern)", () => {
    render(<ControlledOTP />);
    // Each cell exposes an accessible per-digit label.
    expect(
      screen.getByRole("textbox", { name: "One-time passcode digit 1 of 6" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "One-time passcode digit 6 of 6" })
    ).toBeInTheDocument();
  });

  it("exposes an accessible group label", () => {
    render(<ControlledOTP />);
    expect(
      screen.getByRole("group", { name: "One-time passcode" })
    ).toBeInTheDocument();
  });

  it("accepts a digit per cell and ignores non-digits", () => {
    render(<ControlledOTP />);
    const first = screen.getByRole("textbox", {
      name: "One-time passcode digit 1 of 6",
    }) as HTMLInputElement;
    fireEvent.change(first, { target: { value: "4" } });
    expect(first.value).toBe("4");

    const second = screen.getByRole("textbox", {
      name: "One-time passcode digit 2 of 6",
    }) as HTMLInputElement;
    fireEvent.change(second, { target: { value: "a" } });
    expect(second.value).toBe("");
  });

  it("distributes a pasted numeric string across cells", () => {
    render(<ControlledOTP />);
    const first = screen.getByRole("textbox", {
      name: "One-time passcode digit 1 of 6",
    }) as HTMLInputElement;
    fireEvent.paste(first, {
      clipboardData: { getData: () => "123456" },
    });
    expect(first.value).toBe("1");
    expect(
      (screen.getByRole("textbox", {
        name: "One-time passcode digit 6 of 6",
      }) as HTMLInputElement).value
    ).toBe("6");
  });

  it("supports a configurable length", () => {
    render(<ControlledOTP length={4} />);
    expect(
      screen.getByRole("textbox", { name: "One-time passcode digit 4 of 4" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "One-time passcode digit 5 of 4" })
    ).not.toBeInTheDocument();
  });
});
