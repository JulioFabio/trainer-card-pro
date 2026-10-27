import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, logger } = vi.hoisted(() => ({
  prisma: {
    user: { findUnique: vi.fn(), findFirst: vi.fn(), upsert: vi.fn() },
  },
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/telemetry", () => ({ logger }));

import { authorizeLocalGm, authorizeProfile } from "@/lib/authorize";
import { hashPassword } from "@/lib/password";

let withPassword: string;
beforeAll(async () => {
  withPassword = await hashPassword("mesa123");
});

const player = (over: Record<string, unknown> = {}) => ({
  id: "p1",
  name: "Túlio",
  role: "PLAYER",
  passwordHash: null,
  ...over,
});

describe("authorizeProfile (Unit)", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.clearAllMocks());

  it("Perfil sem senha: entra só escolhendo o perfil, com papel PLAYER", async () => {
    prisma.user.findUnique.mockResolvedValue(player({ id: "sem-senha" }));
    expect(await authorizeProfile({ profileId: "sem-senha" })).toEqual({
      id: "sem-senha",
      name: "Túlio",
      role: "PLAYER",
    });
  });

  it("Escolha do perfil de outro jogador é aceita", async () => {
    prisma.user.findUnique.mockResolvedValue(player({ id: "robert", name: "Robert" }));
    const result = await authorizeProfile({ profileId: "robert" });
    expect(result?.name).toBe("Robert");
  });

  it("Perfil com senha e senha correta", async () => {
    prisma.user.findUnique.mockResolvedValue(player({ id: "com-senha-ok", passwordHash: withPassword }));
    expect(await authorizeProfile({ profileId: "com-senha-ok", password: "mesa123" })).toMatchObject({
      id: "com-senha-ok",
    });
  });

  it("Perfil com senha e senha incorreta ou ausente", async () => {
    prisma.user.findUnique.mockResolvedValue(player({ id: "com-senha-erro", passwordHash: withPassword }));
    expect(await authorizeProfile({ profileId: "com-senha-erro", password: "errada" })).toBeNull();
    expect(await authorizeProfile({ profileId: "com-senha-erro" })).toBeNull();
  });

  it("Papel enviado pelo cliente é ignorado", async () => {
    prisma.user.findUnique.mockResolvedValue(player({ id: "role-forjado" }));
    const result = await authorizeProfile({ profileId: "role-forjado", role: "GM" });
    expect(result?.role).toBe("PLAYER");
  });

  it("Perfil inexistente: nenhuma sessão e nenhum perfil criado", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    expect(await authorizeProfile({ profileId: "nao-existe" })).toBeNull();
    expect(await authorizeProfile({})).toBeNull();
    expect(await authorizeProfile(undefined)).toBeNull();
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });

  it("Mestre sem senha não entra pelo seletor", async () => {
    prisma.user.findUnique.mockResolvedValue(player({ id: "gm-sem", name: "Mestre", role: "GM" }));
    expect(await authorizeProfile({ profileId: "gm-sem", password: "" })).toBeNull();
  });

  it("Entrada do Mestre por outro aparelho, com a senha do Mestre", async () => {
    prisma.user.findUnique.mockResolvedValue(
      player({ id: "gm-com", name: "Mestre", role: "GM", passwordHash: withPassword })
    );
    expect(await authorizeProfile({ profileId: "gm-com", password: "mesa123" })).toMatchObject({
      role: "GM",
    });
    expect(await authorizeProfile({ profileId: "gm-com", password: "outra" })).toBeNull();
  });

  it("Quinta falha seguida bloqueia, até com a senha correta", async () => {
    prisma.user.findUnique.mockResolvedValue(player({ id: "bloqueio", passwordHash: withPassword }));
    for (let i = 0; i < 5; i++) {
      expect(await authorizeProfile({ profileId: "bloqueio", password: "x" })).toBeNull();
    }
    expect(await authorizeProfile({ profileId: "bloqueio", password: "mesa123" })).toBeNull();
  });

  it("Senha fora dos logs", async () => {
    prisma.user.findUnique.mockResolvedValue(player({ id: "log", passwordHash: withPassword }));
    await authorizeProfile({ profileId: "log", password: "SENHA-SECRETA-XYZ" });
    await authorizeProfile({ profileId: "log", password: "mesa123" });
    const logged = JSON.stringify(Object.values(logger).flatMap((fn) => fn.mock.calls));
    expect(logged).not.toContain("SENHA-SECRETA-XYZ");
    expect(logged).not.toContain("mesa123");
  });
});

describe("authorizeLocalGm (Unit)", () => {
  beforeEach(() => vi.clearAllMocks());

  const local = new Headers({ host: "localhost:3000" });

  it("Mestre abre o app no próprio computador: entra como GM sem senha", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: "gm1", name: "Mestre", role: "GM" });
    expect(await authorizeLocalGm(local)).toEqual({ id: "gm1", name: "Mestre", role: "GM" });
  });

  it("cria o perfil do Mestre na primeira entrada local", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.upsert.mockResolvedValue({ id: "gm-novo", name: "Mestre", role: "GM" });
    expect(await authorizeLocalGm(local)).toMatchObject({ id: "gm-novo", role: "GM" });
    expect(prisma.user.upsert).toHaveBeenCalledTimes(1);
  });

  it("Acesso pelo link do túnel não vira GM", async () => {
    const tunnel = new Headers({ host: "trainer-card-ptu.loca.lt", "x-forwarded-for": "1.2.3.4" });
    expect(await authorizeLocalGm(tunnel)).toBeNull();
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it("Host falsificado atrás do túnel não vira GM", async () => {
    const spoofed = new Headers({ host: "localhost:3000", "x-forwarded-for": "1.2.3.4" });
    expect(await authorizeLocalGm(spoofed)).toBeNull();
  });

  it("Acesso pela rede local não vira GM", async () => {
    expect(await authorizeLocalGm(new Headers({ host: "192.168.0.10:3000" }))).toBeNull();
  });
});
