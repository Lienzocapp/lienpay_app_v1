/**
 * LienPay — Mock_Service integration / smoke tests (example-based).
 *
 * These are example-based integration/smoke tests (NOT fast-check property
 * tests). They assert:
 *  - standard operations schedule a simulated delay within 500–2000ms,
 *  - `processPledge` schedules a deliberate long-running delay within
 *    2000–5000ms,
 *  - NO outbound network request is issued (global `fetch` and
 *    `XMLHttpRequest` are never called).
 *
 * Timing is verified by intercepting `setTimeout` and recording the requested
 * delay (then resolving immediately), so the real (unmocked) delay pickers are
 * exercised without waiting multiple seconds of wall-clock time.
 *
 * Requirements: 13.1, 13.2 (no outbound network), 13.3 (500–2000ms standard),
 * 7.6 (2000–5000ms Pledge Processing).
 * Design: Testing Strategy (integration/smoke tests), Mock Service Architecture.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockService } from "./mockService";
import {
  LONG_RUNNING_DELAY_MAX_MS,
  LONG_RUNNING_DELAY_MIN_MS,
  STANDARD_DELAY_MAX_MS,
  STANDARD_DELAY_MIN_MS,
} from "./delay";

/**
 * Installs a `setTimeout` interceptor that records each requested delay (ms)
 * and resolves immediately, so awaited Mock_Service calls complete without
 * real waiting. Returns the recorded-delays array and a restore function.
 */
function interceptSetTimeout(): { delays: number[]; restore: () => void } {
  const delays: number[] = [];
  const spy = vi
    .spyOn(globalThis, "setTimeout")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .mockImplementation(((cb: (...args: unknown[]) => void, ms?: number) => {
      delays.push(ms ?? 0);
      cb();
      return 0 as unknown as ReturnType<typeof setTimeout>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any);
  return { delays, restore: () => spy.mockRestore() };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Mock_Service delay bounds", () => {
  it("schedules standard read/verification delays within 500–2000ms", async () => {
    const { delays, restore } = interceptSetTimeout();
    try {
      // Run each standard operation several times to exercise the random picker.
      for (let i = 0; i < 25; i += 1) {
        await mockService.getPortfolioSnapshot();
        await mockService.getFunds();
        await mockService.getTransactions();
        await mockService.getRepayments();
        await mockService.getNotifications();
        await mockService.sendOtp("1234567890");
        await mockService.verifyOtp("123456");
        await mockService.submitKyc({});
        await mockService.submitAadhaar({});
        await mockService.submitSelfie({});
        await mockService.captureBankAccount({});
        await mockService.setupMandate({});
        await mockService.makeDemoPayment();
        await mockService.makeRepayment(100);
      }
    } finally {
      restore();
    }

    expect(delays.length).toBeGreaterThan(0);
    for (const ms of delays) {
      expect(ms).toBeGreaterThanOrEqual(STANDARD_DELAY_MIN_MS);
      expect(ms).toBeLessThanOrEqual(STANDARD_DELAY_MAX_MS);
    }
  });

  it("schedules Pledge Processing within the long-running 2000–5000ms band", async () => {
    const { delays, restore } = interceptSetTimeout();
    try {
      for (let i = 0; i < 25; i += 1) {
        await mockService.processPledge(["fund-axis-bluechip"]);
      }
    } finally {
      restore();
    }

    expect(delays.length).toBeGreaterThan(0);
    for (const ms of delays) {
      expect(ms).toBeGreaterThanOrEqual(LONG_RUNNING_DELAY_MIN_MS);
      expect(ms).toBeLessThanOrEqual(LONG_RUNNING_DELAY_MAX_MS);
      // The long-running band starts at the standard band's upper bound; verify
      // it is deliberately longer than the standard maximum can require.
      expect(ms).toBeGreaterThanOrEqual(STANDARD_DELAY_MAX_MS);
    }
  });
});

describe("Mock_Service issues no outbound network request", () => {
  it("never calls fetch or XMLHttpRequest across all operations", async () => {
    const { restore } = interceptSetTimeout();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const xhrOpenSpy = vi.spyOn(XMLHttpRequest.prototype, "open");
    const xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, "send");

    try {
      await mockService.getPortfolioSnapshot();
      await mockService.getFunds();
      await mockService.getTransactions();
      await mockService.getRepayments();
      await mockService.getNotifications();
      await mockService.sendOtp("1234567890");
      await mockService.verifyOtp("123456");
      await mockService.submitKyc({});
      await mockService.submitAadhaar({});
      await mockService.submitSelfie({});
      await mockService.captureBankAccount({});
      await mockService.setupMandate({});
      await mockService.processPledge(["fund-axis-bluechip"]);
      await mockService.makeDemoPayment();
      await mockService.makeRepayment(8240_00);
    } finally {
      restore();
    }

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrOpenSpy).not.toHaveBeenCalled();
    expect(xhrSendSpy).not.toHaveBeenCalled();
  });
});

describe("Mock_Service success shapes", () => {
  it("returns the mandated DMart ₹1,856 demo payment as a distinct demo_payment transaction", async () => {
    const { restore } = interceptSetTimeout();
    try {
      const result = await mockService.makeDemoPayment();
      expect(result.status).toBe("success");
      expect(result.data).toBeDefined();
      expect(result.data?.merchant).toBe("DMart");
      expect(result.data?.amount).toBe("₹1,856");
      expect(result.data?.amountPaise).toBe(185600);
      expect(result.data?.origin).toBe("demo_payment");
      // Distinct from the seeded DMart row id.
      expect(result.data?.id).not.toBe("seed-dmart");
    } finally {
      restore();
    }
  });

  it("returns a mock error for an empty pledge (no matching data), leaving data unchanged", async () => {
    const { restore } = interceptSetTimeout();
    try {
      const result = await mockService.processPledge([]);
      expect(result.status).toBe("error");
      expect(result.error).toBeTruthy();
      expect(result.data).toBeUndefined();
    } finally {
      restore();
    }
  });

  it("enforces the max-50 fund bound on getFunds", async () => {
    const { restore } = interceptSetTimeout();
    try {
      const result = await mockService.getFunds();
      expect(result.status).toBe("success");
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeLessThanOrEqual(50);
    } finally {
      restore();
    }
  });
});
