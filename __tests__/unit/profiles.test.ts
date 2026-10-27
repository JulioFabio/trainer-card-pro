import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
  prisma: {
    user: { findMany: vi.fn() },
    appSetting: { findUnique: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { getSessionName, listLoginProfiles } from "@/lib/profiles";

describe("perfis da tela de entrada (Unit)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Lista e nome da sessão: devolve os perfis e o nome configurado", async () => {
    prisma.appSetting.findUnique.mockResolvedValue({ key: "sessionName", value: "Mesa de Sexta" });
    prisma.user.findMany.mockResolvedValue([
      { id: "1", name: "Black", role: "PLAYER", passwordHash: null },
      { id: "2", name: "Robert", role: "PLAYER", passwordHash: "scrypt$x" },
      { id: "3", name: "Túlio", role: "PLAYER", passwordHash: null },
    ]);

    expect(await getSessionName()).toBe("Mesa de Sexta");
    expect(await listLoginProfiles()).toEqual([
      { id: "1", name: "Black", requiresPassword: false },
      { id: "2", name: "Robert", requiresPassword: true },
      { id: "3", name: "Túlio", requiresPassword: false },
    ]);
  });

  it("nome da sessão padrão quando não configurado", async () => {
    prisma.appSetting.findUnique.mockResolvedValue(null);
    expect(await getSessionName()).toBe("Minha Mesa");
  });

  it("Sem perfis: lista vazia", async () => {
    prisma.user.findMany.mockResolvedValue([]);
    expect(await listLoginProfiles()).toEqual([]);
  });

  it("Sem senha do Mestre: o Mestre não aparece na lista", async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: "gm", name: "Mestre", role: "GM", passwordHash: null },
      { id: "1", name: "Túlio", role: "PLAYER", passwordHash: null },
    ]);
    const names = (await listLoginProfiles()).map((p) => p.name);
    expect(names).toEqual(["Túlio"]);
  });

  it("Com senha do Mestre: o Mestre aparece e exige senha", async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: "gm", name: "Mestre", role: "GM", passwordHash: "scrypt$x" },
    ]);
    expect(await listLoginProfiles()).toEqual([{ id: "gm", name: "Mestre", requiresPassword: true }]);
  });

  it("nunca expõe o hash da senha", async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: "1", name: "Robert", role: "PLAYER", passwordHash: "scrypt$16384$SEGREDO$HASH" },
    ]);
    const serialized = JSON.stringify(await listLoginProfiles());
    expect(serialized).not.toContain("scrypt");
    expect(serialized).not.toContain("HASH");
    expect(serialized).not.toContain("passwordHash");
  });
});
