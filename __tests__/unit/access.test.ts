import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, prisma, logger } = vi.hoisted(() => ({
  auth: vi.fn(),
  prisma: { user: { findUnique: vi.fn() }, character: { findUnique: vi.fn() } },
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/telemetry", () => ({ logger }));

import { canWrite, loadCharacterForWrite, requireUser } from "@/lib/api/access";

const status = async (fn: () => Promise<unknown>) => {
  try {
    await fn();
    return 200;
  } catch (e: any) {
    return e.status as number;
  }
};

describe("requireUser (Unit)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Requisição sem sessão: 401", async () => {
    auth.mockResolvedValue(null);
    expect(await status(requireUser)).toBe(401);
    auth.mockResolvedValue({ user: {} });
    expect(await status(requireUser)).toBe(401);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("devolve id e papel lidos do banco", async () => {
    auth.mockResolvedValue({ user: { id: "u1", role: "PLAYER" } });
    prisma.user.findUnique.mockResolvedValue({ id: "u1", role: "PLAYER" });
    expect(await requireUser()).toEqual({ id: "u1", role: "PLAYER" });
  });

  it("Perfil removido: 401 e registra a recusa", async () => {
    auth.mockResolvedValue({ user: { id: "removido", role: "PLAYER" } });
    prisma.user.findUnique.mockResolvedValue(null);
    expect(await status(requireUser)).toBe(401);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it("Papel alterado no banco: o token diz GM, o banco diz PLAYER", async () => {
    auth.mockResolvedValue({ user: { id: "u1", role: "GM" } });
    prisma.user.findUnique.mockResolvedValue({ id: "u1", role: "PLAYER" });
    expect((await requireUser()).role).toBe("PLAYER");
  });

  it("papel desconhecido no banco vira PLAYER", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });
    prisma.user.findUnique.mockResolvedValue({ id: "u1", role: "ADMIN" });
    expect((await requireUser()).role).toBe("PLAYER");
  });
});

describe("canWrite e loadCharacterForWrite (Unit)", () => {
  beforeEach(() => vi.clearAllMocks());

  const player = { id: "p1", role: "PLAYER" as const };
  const gm = { id: "gm", role: "GM" as const };

  it("dono e GM escrevem; outro jogador não", () => {
    expect(canWrite(player, "p1")).toBe(true);
    expect(canWrite(gm, "p1")).toBe(true);
    expect(canWrite(player, "p2")).toBe(false);
  });

  it("Ficha inexistente: 404", async () => {
    prisma.character.findUnique.mockResolvedValue(null);
    expect(await status(() => loadCharacterForWrite(player, "x"))).toBe(404);
  });

  it("Jogador altera a ficha de outro: 403 e log só com identificadores", async () => {
    prisma.character.findUnique.mockResolvedValue({ id: "c1", userId: "p2" });
    expect(await status(() => loadCharacterForWrite(player, "c1"))).toBe(403);
    expect(logger.warn).toHaveBeenCalledWith("Escrita negada em ficha de outro jogador", {
      userId: "p1",
      characterId: "c1",
    });
  });

  it("dono e GM carregam a ficha", async () => {
    prisma.character.findUnique.mockResolvedValue({ id: "c1", userId: "p1" });
    expect(await loadCharacterForWrite(player, "c1")).toEqual({ id: "c1", userId: "p1" });
    expect(await loadCharacterForWrite(gm, "c1")).toEqual({ id: "c1", userId: "p1" });
  });
});
