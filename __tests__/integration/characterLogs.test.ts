import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { auth, prisma } = vi.hoisted(() => ({
  auth: vi.fn(),
  prisma: { character: { findUnique: vi.fn(), update: vi.fn() } },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma }));

// Telemetria e cache reais: o teste valida o que de fato vai para o console.
const SENTINELA = "SENTINELA-XYZ";

describe("PUT /api/character — privacidade dos logs (Integration)", () => {
  const spies: ReturnType<typeof vi.spyOn>[] = [];

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("LOG_LEVEL", "debug");
    for (const m of ["log", "info", "warn", "error", "debug"] as const) {
      spies.push(vi.spyOn(console, m).mockImplementation(() => {}));
    }
  });

  afterEach(() => {
    spies.length = 0;
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("nenhuma saída de console contém dados da ficha", async () => {
    auth.mockResolvedValue({ user: { id: "u1", role: "PLAYER" } });
    prisma.character.findUnique.mockResolvedValue({ userId: "u1" });
    prisma.character.update.mockResolvedValue({ id: "c1", name: "Red" });

    const { PUT } = await import("@/app/api/character/route");
    const res = await PUT(
      new Request("http://localhost/api/character", {
        method: "PUT",
        body: JSON.stringify({ id: "c1", name: "Red", sheetData: { notas: SENTINELA } }),
      })
    );

    expect(res.status).toBe(200);
    const output = spies.flatMap((s) => s.mock.calls).map((c) => JSON.stringify(c)).join("\n");
    expect(output.length).toBeGreaterThan(0); // garante que há logs sendo inspecionados
    expect(output).not.toContain(SENTINELA);
  });
});
