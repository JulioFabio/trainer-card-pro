import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { logger } = vi.hoisted(() => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/telemetry", () => ({ logger }));

import { handleQueryEvent } from "@/lib/queryLog";

describe("handleQueryEvent (Unit)", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.clearAllMocks());

  it("Query rápida: não emite info, warn nem error", () => {
    handleQueryEvent({ query: "SELECT 1", duration: 5 });
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("Query lenta: emite warn com duração e query, sem params", () => {
    handleQueryEvent({ query: "SELECT * FROM Character", duration: 250, params: '["SEGREDO"]' } as any);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    const [, context] = logger.warn.mock.calls[0];
    expect(context).toMatchObject({ query: "SELECT * FROM Character", durationMs: 250 });
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain("SEGREDO");
  });

  it("exatamente no limiar de 100 ms ainda é considerada rápida", () => {
    handleQueryEvent({ query: "SELECT 1", duration: 100 });
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
