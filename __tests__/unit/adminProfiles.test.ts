import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, prisma, logger } = vi.hoisted(() => ({
  auth: vi.fn(),
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    appSetting: { upsert: vi.fn() },
  },
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/telemetry", () => ({ logger }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import {
  createProfileAction,
  removeProfileAction,
  renameProfileAction,
  setMasterPasswordAction,
  setProfilePasswordAction,
  setSessionNameAction,
} from "@/app/admin/actions";
import { verifyPassword } from "@/lib/password";

// Simula o banco: o solicitante (sessão) e os alvos consultados por id ou username.
function asGm() {
  auth.mockResolvedValue({ user: { id: "gm1", role: "GM" } });
  prisma.user.findUnique.mockImplementation(async ({ where }: any) => {
    if (where.id === "gm1") return { id: "gm1", role: "GM" };
    return null;
  });
}

describe("gestão de perfis pelo Mestre (Unit)", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("controle de acesso", () => {
    const attempts: [string, () => Promise<unknown>][] = [
      ["createProfileAction", () => createProfileAction("Ana")],
      ["renameProfileAction", () => renameProfileAction("p1", "Ana")],
      ["removeProfileAction", () => removeProfileAction("p1")],
      ["setProfilePasswordAction", () => setProfilePasswordAction("p1", "abcd")],
      ["setMasterPasswordAction", () => setMasterPasswordAction("abcd")],
      ["setSessionNameAction", () => setSessionNameAction("Mesa")],
    ];

    it.each(attempts)("Jogador tenta gerir perfis: %s é recusada", async (_name, run) => {
      auth.mockResolvedValue({ user: { id: "p1", role: "GM" } }); // token forjado como GM
      prisma.user.findUnique.mockResolvedValue({ id: "p1", role: "PLAYER" }); // banco diz PLAYER
      await expect(run()).rejects.toThrow("Acesso negado");
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.user.delete).not.toHaveBeenCalled();
      expect(prisma.appSetting.upsert).not.toHaveBeenCalled();
    });

    it.each(attempts)("Visitante tenta gerir perfis: %s é recusada", async (_name, run) => {
      auth.mockResolvedValue(null);
      await expect(run()).rejects.toThrow("Não autorizado");
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("createProfileAction", () => {
    it("Mestre cria perfil: grava nome, nome normalizado e papel PLAYER", async () => {
      asGm();
      prisma.user.create.mockResolvedValue({ id: "novo" });

      expect(await createProfileAction("  Túlio  ")).toEqual({ success: true });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: "Túlio", username: "túlio", role: "PLAYER", passwordHash: null },
        select: { id: true },
      });
    });

    it("Nome já em uso: recusa e não cria", async () => {
      auth.mockResolvedValue({ user: { id: "gm1" } });
      prisma.user.findUnique.mockImplementation(async ({ where }: any) =>
        where.id === "gm1" ? { id: "gm1", role: "GM" } : where.username === "túlio" ? { id: "x" } : null
      );

      const result = await createProfileAction("túlio");
      expect(result).toMatchObject({ success: false });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("recusa o nome reservado do Mestre e nome vazio", async () => {
      asGm();
      expect(await createProfileAction("mestre")).toMatchObject({ success: false });
      expect(await createProfileAction("   ")).toMatchObject({ success: false });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("Senha curta: recusa a criação", async () => {
      asGm();
      expect(await createProfileAction("Ana", "abc")).toMatchObject({ success: false });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("com senha, guarda só o hash", async () => {
      asGm();
      prisma.user.create.mockResolvedValue({ id: "novo" });
      await createProfileAction("Ana", "mesa123");
      const stored = prisma.user.create.mock.calls[0][0].data.passwordHash as string;
      expect(stored).not.toContain("mesa123");
      expect(await verifyPassword("mesa123", stored)).toBe(true);
      expect(JSON.stringify(Object.values(logger).flatMap((fn) => fn.mock.calls))).not.toContain("mesa123");
    });
  });

  describe("renomear, senha e remoção", () => {
    function withTarget(role = "PLAYER") {
      auth.mockResolvedValue({ user: { id: "gm1" } });
      prisma.user.findUnique.mockImplementation(async ({ where }: any) => {
        if (where.id === "gm1") return { id: "gm1", role: "GM" };
        if (where.id === "p1") return { id: "p1", role };
        return null;
      });
    }

    it("renomeia um perfil de jogador", async () => {
      withTarget();
      expect(await renameProfileAction("p1", "Robert Jr")).toEqual({ success: true });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "p1" },
        data: { name: "Robert Jr", username: "robert jr" },
      });
    });

    it("não renomeia nem remove o perfil do Mestre", async () => {
      withTarget("GM");
      expect(await renameProfileAction("p1", "Outro")).toMatchObject({ success: false });
      expect(await removeProfileAction("p1")).toMatchObject({ success: false });
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it("Remoção de perfil: apaga o usuário (as fichas saem por cascata)", async () => {
      withTarget();
      expect(await removeProfileAction("p1")).toEqual({ success: true });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
    });

    it("define e remove a senha de um perfil", async () => {
      withTarget();
      await setProfilePasswordAction("p1", "mesa123");
      expect(prisma.user.update.mock.calls[0][0].data.passwordHash).toMatch(/^scrypt\$/);

      await setProfilePasswordAction("p1", "");
      expect(prisma.user.update.mock.calls[1][0].data.passwordHash).toBeNull();
    });

    it("Senha curta: mantém a senha anterior", async () => {
      withTarget();
      expect(await setProfilePasswordAction("p1", "abc")).toMatchObject({ success: false });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe("senha do Mestre e nome da sessão", () => {
    it("define a senha do Mestre no próprio perfil do GM", async () => {
      asGm();
      expect(await setMasterPasswordAction("mesa123")).toEqual({ success: true });
      expect(prisma.user.update.mock.calls[0][0].where).toEqual({ id: "gm1" });
      expect(prisma.user.update.mock.calls[0][0].data.passwordHash).toMatch(/^scrypt\$/);
    });

    it("Nome da sessão: grava o valor limpo", async () => {
      asGm();
      expect(await setSessionNameAction("  Mesa   de Sexta ")).toEqual({ success: true });
      expect(prisma.appSetting.upsert).toHaveBeenCalledWith({
        where: { key: "sessionName" },
        update: { value: "Mesa de Sexta" },
        create: { key: "sessionName", value: "Mesa de Sexta" },
      });
    });

    it("recusa nome da sessão vazio ou longo demais", async () => {
      asGm();
      expect(await setSessionNameAction("  ")).toMatchObject({ success: false });
      expect(await setSessionNameAction("x".repeat(61))).toMatchObject({ success: false });
      expect(prisma.appSetting.upsert).not.toHaveBeenCalled();
    });
  });
});
