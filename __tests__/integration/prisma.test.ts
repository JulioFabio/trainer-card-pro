import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";

// Protege contra o bug do adaptador do Prisma 7 de 22/10/2026: cria o cliente real
// contra um SQLite temporário e executa uma query de verdade.
describe("Prisma client (Integration)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tcp-prisma-"));

  afterAll(() => {
    vi.unstubAllEnvs();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("conecta ao SQLite via adaptador e executa SELECT 1", async () => {
    vi.stubEnv("DATABASE_URL", `file:${path.join(dir, "test.db")}`);
    const { prisma } = await import("@/lib/prisma");

    const rows = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
    expect(Number(rows[0].ok)).toBe(1);

    await prisma.$disconnect();
  });
});
