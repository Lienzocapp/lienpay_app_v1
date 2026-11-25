import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusCard } from "./StatusCard";

describe("StatusCard", () => {
  it("renders the title and status text", () => {
    render(<StatusCard title="KYC" status="Verified" tone="success" />);
    expect(screen.getByText("KYC")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("renders an optional description", () => {
    render(
      <StatusCard title="Mandate" status="Pending" description="Awaiting setup" />
    );
    expect(screen.getByText("Awaiting setup")).toBeInTheDocument();
  });
});
