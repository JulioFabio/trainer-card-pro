import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { queryRaw } = vi.hoisted(() => ({ queryRaw: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: queryRaw } }));

import { GET } from "@/app/api/health/route";

describe("GET /api/health (Integration)", () => {
  let log: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    log = vi.spyOn(console, "log").mockImplementation(() => {});
    error = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryRaw.mockReset();
  });

  it("Banco disponível: 200, UP e database healthy", async () => {
    queryRaw.mockResolvedValue([{ "1": 1 }]);
    const res = await GET(new Request("http://localhost/api/health"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("UP");
    expect(body.services.database.status).toBe("healthy");
    expect(error).not.toHaveBeenCalled();
  });

  it("Banco indisponível: 503 sem detalhes e log error com a causa e o requestId", async () => {
    queryRaw.mockRejectedValue(new Error("SQLITE_CANTOPEN: C:\segredo\dev.db"));
    const res = await GET(new Request("http://localhost/api/health"));
    const text = await res.text();
    const body = JSON.parse(text);

    expect(res.status).toBe(503);
    expect(body.status).toBe("DOWN");
    expect(text).not.toContain("SQLITE_CANTOPEN");
    expect(text).not.toContain("segredo");
    expect(text).not.toContain("stack");

    const entries = error.mock.calls.map((c: unknown[]) => JSON.parse(c[0] as string));
    const entry = entries.find((e: any) => e.error?.includes("SQLITE_CANTOPEN"));
    expect(entry).toBeDefined();
    expect(entry.level).toBe("ERROR");
    expect(entry.requestId).toBe(res.headers.get("X-Request-ID"));
  });
});
