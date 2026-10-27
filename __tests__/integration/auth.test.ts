import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const { captured, authorizeProfile, authorizeLocalGm } = vi.hoisted(() => ({
  captured: { options: undefined as any },
  authorizeProfile: vi.fn(),
  authorizeLocalGm: vi.fn(),
}));

// Captura as opções passadas ao NextAuth para validar a configuração.
vi.mock("next-auth", () => ({
  default: vi.fn((options) => {
    captured.options = options;
    return { handlers: { GET: vi.fn(), POST: vi.fn() }, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() };
  }),
}));
vi.mock("@/lib/authorize", () => ({ authorizeProfile, authorizeLocalGm }));
vi.mock("@/lib/telemetry", () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe("Configuração do NextAuth (Integration)", () => {
  let options: any;

  beforeAll(async () => {
    vi.stubEnv("AUTH_SECRET", "segredo-de-teste");
    await import("@/auth");
    options = captured.options;
  });

  afterEach(() => vi.clearAllMocks());

  it("usa sessão JWT de 3 horas, sem adaptador de banco e com o segredo resolvido", () => {
    expect(options.session.strategy).toBe("jwt");
    expect(options.session.maxAge).toBe(3 * 60 * 60);
    expect(options.adapter).toBeUndefined();
    expect(options.secret).toBe("segredo-de-teste");
    expect(options.cookies.sessionToken.options.httpOnly).toBe(true);
  });

  it("expõe só os provedores profile e local-gm", () => {
    const ids = options.providers.map((p: any) => p.options?.id ?? p.id);
    expect(ids.sort()).toEqual(["local-gm", "profile"]);
  });

  it("o provedor profile delega para authorizeProfile", async () => {
    authorizeProfile.mockResolvedValue({ id: "p1", name: "Túlio", role: "PLAYER" });
    const provider = options.providers.find((p: any) => (p.options?.id ?? p.id) === "profile");
    const authorize = provider.options?.authorize ?? provider.authorize;
    expect(await authorize({ profileId: "p1" }, new Request("http://localhost/"))).toMatchObject({ id: "p1" });
    expect(authorizeProfile).toHaveBeenCalledWith({ profileId: "p1" });
  });

  it("o provedor local-gm repassa os cabeçalhos da requisição", async () => {
    authorizeLocalGm.mockResolvedValue(null);
    const provider = options.providers.find((p: any) => (p.options?.id ?? p.id) === "local-gm");
    const authorize = provider.options?.authorize ?? provider.authorize;
    const request = new Request("http://localhost:3000/", { headers: { host: "localhost:3000" } });
    await authorize({}, request);
    expect(authorizeLocalGm).toHaveBeenCalledWith(request.headers);
  });

  it("callbacks propagam id e papel para o token e para a sessão", async () => {
    const token = await options.callbacks.jwt({ token: {}, user: { id: "u1", role: "GM" } });
    expect(token).toMatchObject({ id: "u1", role: "GM" });

    const session = await options.callbacks.session({ session: { user: { name: "x" } }, token });
    expect(session.user).toMatchObject({ id: "u1", role: "GM" });
  });

  it("papel desconhecido vira PLAYER", async () => {
    const token = await options.callbacks.jwt({ token: {}, user: { id: "u2", role: "ADMIN" } });
    expect(token.role).toBe("PLAYER");
  });

  it("não há segredo fixo no código", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync("src/auth.ts", "utf8");
    expect(source).not.toContain("development-fallback");
  });
});
