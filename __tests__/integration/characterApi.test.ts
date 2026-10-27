import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { auth, prisma, cache } = vi.hoisted(() => ({
  auth: vi.fn(),
  prisma: {
    user: { findUnique: vi.fn() },
    character: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
  cache: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/cache", () => ({ memoryCache: cache }));

import { GET, POST, PUT } from "@/app/api/character/route";
import { IDS, USERS, req, signInAs, silenceConsole, consoleOutput } from "../helpers/api";

const signIn = (user: Parameters<typeof signInAs>[2]) => signInAs(auth, prisma.user.findUnique, user);

const robertSheet = {
  id: IDS.charRobert,
  name: "Robert",
  userId: IDS.robert,
  sheetData: JSON.stringify({ notas: "x" }),
  pokemons: [{ id: "p", pokemonData: "{}" }],
  items: [],
  notes: [],
};

describe("API /api/character (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache.get.mockReturnValue(null);
    silenceConsole();
  });
  afterEach(() => vi.restoreAllMocks());

  describe("GET", () => {
    it("Requisição sem sessão: 401", async () => {
      signIn(null);
      const res = await GET(req("GET", "/api/character"));
      expect(res.status).toBe(401);
      expect((await res.json()).error).toContain("Não autorizado");
    });

    it("Jogador lê a ficha de outro: 200 com a ficha completa", async () => {
      signIn(USERS.tulio);
      prisma.character.findUnique.mockResolvedValue(robertSheet);
      const res = await GET(req("GET", `/api/character?id=${IDS.charRobert}`));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.name).toBe("Robert");
      expect(data.sheetData).toEqual({ notas: "x" });
    });

    it("o GM e o dono também leem", async () => {
      prisma.character.findUnique.mockResolvedValue(robertSheet);
      for (const user of [USERS.gm, USERS.robert]) {
        signIn(user);
        expect((await GET(req("GET", `/api/character?id=${IDS.charRobert}`))).status).toBe(200);
      }
    });

    it("Ficha inexistente: 404", async () => {
      signIn(USERS.tulio);
      prisma.character.findUnique.mockResolvedValue(null);
      expect((await GET(req("GET", `/api/character?id=${IDS.charRobert}`))).status).toBe(404);
    });

    it("identificador inválido: 400", async () => {
      signIn(USERS.tulio);
      expect((await GET(req("GET", "/api/character?id=../../x"))).status).toBe(400);
    });

    it("usa o cache sem repetir consulta, igual para qualquer usuário", async () => {
      signIn(USERS.tulio);
      cache.get.mockReturnValue({ id: IDS.charRobert, name: "Robert" });
      const res = await GET(req("GET", `/api/character?id=${IDS.charRobert}`));
      expect(res.status).toBe(200);
      expect(prisma.character.findUnique).not.toHaveBeenCalled();
    });

    it("Lista sem identificador: só as fichas do próprio usuário", async () => {
      signIn(USERS.tulio);
      prisma.character.findMany.mockResolvedValue([{ ...robertSheet, userId: IDS.tulio }]);
      const res = await GET(req("GET", "/api/character"));
      expect(res.status).toBe(200);
      expect(prisma.character.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: IDS.tulio } })
      );
    });

    it("o GM sem identificador também recebe só as dele", async () => {
      signIn(USERS.gm);
      prisma.character.findMany.mockResolvedValue([]);
      await GET(req("GET", "/api/character"));
      expect(prisma.character.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: IDS.gm } })
      );
    });

    it("scope=all devolve o resumo de todas as fichas", async () => {
      signIn(USERS.tulio);
      prisma.character.findMany.mockResolvedValue([
        { id: IDS.charRobert, name: "Robert", avatarUrl: null, user: { name: "Robert" }, sheetData: "SEGREDO" },
      ]);
      const res = await GET(req("GET", "/api/character?scope=all"));
      expect(await res.json()).toEqual([
        { id: IDS.charRobert, name: "Robert", avatarUrl: null, ownerName: "Robert" },
      ]);
    });
  });

  describe("POST", () => {
    it("Requisição sem sessão: 401", async () => {
      signIn(null);
      expect((await POST(req("POST", "/api/character", { name: "Red" }))).status).toBe(401);
    });

    it("sem nome: 400", async () => {
      signIn(USERS.tulio);
      const res = await POST(req("POST", "/api/character", { level: 5 }));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toContain("obrigatório");
    });

    it("injeta o userId da sessão e nunca usa o do corpo", async () => {
      signIn(USERS.tulio);
      prisma.character.create.mockResolvedValue({ id: IDS.charTulio, name: "Red", userId: IDS.tulio });
      const res = await POST(req("POST", "/api/character", { name: "Red" }));
      expect(res.status).toBe(201);
      expect(prisma.character.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: "Red", userId: IDS.tulio, level: 1, money: 0 }),
      });
    });

    it("Tentativa de definir o dono ou o id: 400, nada criado", async () => {
      signIn(USERS.tulio);
      for (const extra of [{ userId: IDS.robert }, { id: IDS.charRobert }]) {
        const res = await POST(req("POST", "/api/character", { name: "Red", ...extra }));
        expect(res.status).toBe(400);
      }
      expect(prisma.character.create).not.toHaveBeenCalled();
    });
  });

  describe("PUT", () => {
    const body = (extra: object = {}) => ({ id: IDS.charRobert, name: "Novo", ...extra });

    it("Requisição sem sessão: 401", async () => {
      signIn(null);
      expect((await PUT(req("PUT", "/api/character", body()))).status).toBe(401);
    });

    it("Dono altera a própria ficha e o cache é invalidado", async () => {
      signIn(USERS.robert);
      prisma.character.findUnique.mockResolvedValue({ id: IDS.charRobert, userId: IDS.robert });
      prisma.character.update.mockResolvedValue({ id: IDS.charRobert, name: "Novo" });
      const res = await PUT(req("PUT", "/api/character", body()));
      expect(res.status).toBe(200);
      expect(cache.delete).toHaveBeenCalledWith(`character:${IDS.charRobert}`);
    });

    it("GM altera a ficha de qualquer jogador", async () => {
      signIn(USERS.gm);
      prisma.character.findUnique.mockResolvedValue({ id: IDS.charRobert, userId: IDS.robert });
      prisma.character.update.mockResolvedValue({ id: IDS.charRobert, name: "Novo" });
      expect((await PUT(req("PUT", "/api/character", body()))).status).toBe(200);
    });

    it("Jogador altera a ficha de outro: 403 e nada muda", async () => {
      signIn(USERS.tulio);
      prisma.character.findUnique.mockResolvedValue({ id: IDS.charRobert, userId: IDS.robert });
      const res = await PUT(req("PUT", "/api/character", body()));
      expect(res.status).toBe(403);
      expect((await res.json()).error).toContain("Acesso negado");
      expect(prisma.character.update).not.toHaveBeenCalled();
      expect(cache.delete).not.toHaveBeenCalled();
    });

    it("Ficha inexistente: 404", async () => {
      signIn(USERS.tulio);
      prisma.character.findUnique.mockResolvedValue(null);
      expect((await PUT(req("PUT", "/api/character", body()))).status).toBe(404);
    });

    it("Perfil removido: 401 e nenhuma ficha é recriada", async () => {
      auth.mockResolvedValue({ user: { id: IDS.tulio, role: "PLAYER" } });
      prisma.user.findUnique.mockResolvedValue(null);
      expect((await PUT(req("PUT", "/api/character", body()))).status).toBe(401);
      expect((await POST(req("POST", "/api/character", { name: "Red" }))).status).toBe(401);
      expect(prisma.character.create).not.toHaveBeenCalled();
    });

    it("aceita o formato que o front envia (nome vazio, avatar nulo, sheetData)", async () => {
      signIn(USERS.robert);
      prisma.character.findUnique.mockResolvedValue({ id: IDS.charRobert, userId: IDS.robert });
      prisma.character.update.mockResolvedValue({ id: IDS.charRobert });
      const res = await PUT(
        req("PUT", "/api/character", { id: IDS.charRobert, name: "", level: 3, avatarUrl: null, sheetData: { a: 1 } })
      );
      expect(res.status).toBe(200);
    });

    it("Acesso negado: o log não contém os dados enviados", async () => {
      signIn(USERS.tulio);
      prisma.character.findUnique.mockResolvedValue({ id: IDS.charRobert, userId: IDS.robert });
      await PUT(req("PUT", "/api/character", body({ sheetData: { notas: "SENTINELA-FICHA" } })));
      expect(consoleOutput()).not.toContain("SENTINELA-FICHA");
    });
  });
});
