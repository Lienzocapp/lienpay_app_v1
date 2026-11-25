/**
 * Global test setup for the LienPay test toolchain.
 *
 * Imports jest-dom matchers (e.g. toBeInTheDocument) so they are available in
 * every test file. Registered via `test.setupFiles` in vite.config.ts.
 *
 * It also lowers the global fast-check example count so the property-based
 * tests run faster. 25 generated examples per property keeps meaningful
 * coverage for this prototype while cutting property-test runtime versus the
 * library default of 100. Individual tests may still override this locally.
 *
 * This file only wires up the test environment; it contains no product tokens,
 * components, state, or content.
 */
import "@testing-library/jest-dom";
import { configureGlobal } from "fast-check";

configureGlobal({ numRuns: 25 });
