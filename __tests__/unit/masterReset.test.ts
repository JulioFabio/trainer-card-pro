import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, logger } = vi.hoisted(() => ({
  prisma: { user: { updateMany: vi.fn() } },
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/telemetry", () => ({ logger }));

import { applyMasterPasswordReset, RESET_FILE_NAME } from "@/lib/masterReset";

describe("applyMasterPasswordReset (Unit)", () => {
  let dir: string;

  beforeEach(() => {
    vi.clearAllMocks();
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "tcp-reset-"));
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  it("Arquivo de reset presente: apaga a senha do Mestre, remove o arquivo e registra", async () => {
    const file = path.join(dir, RESET_FILE_NAME);
    fs.writeFileSync(file, "");
    prisma.user.updateMany.mockResolvedValue({ count: 1 });

    expect(await applyMasterPasswordReset(dir)).toBe(true);
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { role: "GM" },
      data: { passwordHash: null },
    });
    expect(fs.existsSync(file)).toBe(false);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it("Arquivo ausente: nada muda", async () => {
    expect(await applyMasterPasswordReset(dir)).toBe(false);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("se o banco falhar, mantém o arquivo para tentar na próxima inicialização", async () => {
    const file = path.join(dir, RESET_FILE_NAME);
    fs.writeFileSync(file, "");
    prisma.user.updateMany.mockRejectedValue(new Error("banco indisponível"));

    expect(await applyMasterPasswordReset(dir)).toBe(false);
    expect(fs.existsSync(file)).toBe(true);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
