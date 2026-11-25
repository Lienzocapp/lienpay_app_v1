/**
 * Toolchain smoke test.
 *
 * This test exists ONLY to prove the test toolchain runs end to end:
 *   - Vitest executes in a jsdom environment
 *   - React Testing Library can render and query the DOM
 *   - jest-dom matchers are registered
 *   - fast-check property-based testing is wired up
 *
 * It intentionally does NOT test any product logic, component, token, state,
 * or the 8 correctness properties — those belong to later tasks.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import fc from "fast-check";

describe("test toolchain smoke", () => {
  it("runs a basic sanity assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("renders and queries the DOM with React Testing Library + jest-dom", () => {
    render(<span>lienpay-toolchain-ok</span>);
    expect(screen.getByText("lienpay-toolchain-ok")).toBeInTheDocument();
  });

  it("runs a trivial fast-check property (addition is commutative)", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => a + b === b + a)
    );
  });
});
