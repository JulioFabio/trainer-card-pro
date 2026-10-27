import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { auth, prisma, cache } = vi.hoisted(() => {
  const model = () => ({ findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() });
  return {
    auth: vi.fn(),
    prisma: {
      user: { findUnique: vi.fn() },
      character: { findUnique: vi.fn() },
      note: model(),
      item: model(),
      pokemon: model(),
    },
    cache: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
  };
});
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/cache", () => ({ memoryCache: cache }));

import * as noteRoute from "@/app/api/note/route";
import * as itemRoute from "@/app/api/item/route";
import * as pokemonRoute from "@/app/api/pokemon/route";
import { IDS, USERS, req, signInAs, silenceConsole, type TestUser } from "../helpers/api";

type Handler = (r: Request) => Promise<Response>;
interface Kind {
  name: string;
  path: string;
  recordId: string;
  model: typeof prisma.note;
  route: { POST: Handler; PUT: Handler; DELETE: Handler };
  createBody: (characterId: string) => object;
  updateBody: (id: string) => object;
  invalidCreate: object;
  canMove: boolean;
}

const kinds: Kind[] = [
  {
    name: "nota",
    path: "/api/note",
    recordId: IDS.noteRobert,
    model: prisma.note,
    route: noteRoute,
    createBody: (characterId) => ({ characterId, title: "Diário", content: "texto" }),
    updateBody: (id) => ({ id, title: "Novo título" }),
    invalidCreate: { characterId: IDS.charRobert },
    canMove: false,
  },
  {
    name: "item",
    path: "/api/item",
    recordId: IDS.itemRobert,
    model: prisma.item,
    route: itemRoute,
    createBody: (characterId) => ({ characterId, name: "Poção", quantity: 2 }),
    updateBody: (id) => ({ id, quantity: 3 }),
    invalidCreate: { characterId: IDS.charRobert },
    canMove: true,
  },
  {
    name: "Pokémon",
    path: "/api/pokemon",
    recordId: IDS.pokemonRobert,
    model: prisma.pokemon,
    route: pokemonRoute,
    createBody: (characterId) => ({ characterId, nickname: "Pika", species: "Pikachu" }),
    updateBody: (id) => ({ id, nickname: "Raichu" }),
    invalidCreate: { characterId: IDS.charRobert, species: "Pikachu" },
    canMove: true,
  },
];

const signIn = (user: TestUser) => signInAs(auth, prisma.user.findUnique, user);

describe.each(kinds)("rotas de $name (Integration)", (k) => {
  beforeEach(() => {
    vi.clearAllMocks();
    silenceConsole();
    prisma.character.findUnique.mockImplementation(async ({ where }: any) =>
      where.id === IDS.charRobert
        ? { id: IDS.charRobert, userId: IDS.robert }
        : where.id === IDS.charTulio
          ? { id: IDS.charTulio, userId: IDS.tulio }
          : null
    );
    k.model.findUnique.mockResolvedValue({ characterId: IDS.charRobert });
    k.model.create.mockResolvedValue({ id: k.recordId });
    k.model.update.mockResolvedValue({ id: k.recordId });
    k.model.delete.mockResolvedValue({ id: k.recordId });
  });
  afterEach(() => vi.restoreAllMocks());

  const calls = {
    POST: () => k.route.POST(req("POST", k.path, k.createBody(IDS.charRobert))),
    PUT: () => k.route.PUT(req("PUT", k.path, k.updateBody(k.recordId))),
    DELETE: () => k.route.DELETE(req("DELETE", `${k.path}?id=${k.recordId}`)),
  };
  const noWrites = () => {
    expect(k.model.create).not.toHaveBeenCalled();
    expect(k.model.update).not.toHaveBeenCalled();
    expect(k.model.delete).not.toHaveBeenCalled();
  };

  it.each(["POST", "PUT", "DELETE"] as const)("visitante sem sessão: %s dá 401", async (method) => {
    signIn(null);
    expect((await calls[method]()).status).toBe(401);
    noWrites();
  });

  it.each(["POST", "PUT", "DELETE"] as const)(
    "jogador de fora na ficha de outro: %s dá 403 e nada muda",
    async (method) => {
      signIn(USERS.tulio);
      expect((await calls[method]()).status).toBe(403);
      noWrites();
      expect(cache.delete).not.toHaveBeenCalled();
    }
  );

  it.each([
    ["POST", 201],
    ["PUT", 200],
    ["DELETE", 200],
  ] as const)("dono: %s funciona e invalida o cache da ficha", async (method, status) => {
    signIn(USERS.robert);
    expect((await calls[method]()).status).toBe(status);
    expect(cache.delete).toHaveBeenCalledWith(`character:${IDS.charRobert}`);
  });

  it.each([
    ["POST", 201],
    ["PUT", 200],
    ["DELETE", 200],
  ] as const)("GM: %s funciona na ficha de qualquer jogador", async (method, status) => {
    signIn(USERS.gm);
    expect((await calls[method]()).status).toBe(status);
  });

  it("registro inexistente: PUT e DELETE dão 404", async () => {
    signIn(USERS.robert);
    k.model.findUnique.mockResolvedValue(null);
    expect((await calls.PUT()).status).toBe(404);
    expect((await calls.DELETE()).status).toBe(404);
    noWrites();
  });

  it("criar em ficha inexistente: 404", async () => {
    signIn(USERS.gm);
    const res = await k.route.POST(req("POST", k.path, k.createBody("00000000-0000-4000-8000-000000000999")));
    expect(res.status).toBe(404);
  });

  it("entrada inválida: campo faltando, campo extra e id ruim dão 400", async () => {
    signIn(USERS.robert);
    expect((await k.route.POST(req("POST", k.path, k.invalidCreate))).status).toBe(400);
    expect((await k.route.POST(req("POST", k.path, { ...k.createBody(IDS.charRobert), userId: "x" }))).status).toBe(400);
    expect((await k.route.DELETE(req("DELETE", `${k.path}?id=../../x`))).status).toBe(400);
    expect((await k.route.DELETE(req("DELETE", k.path))).status).toBe(400);
    expect((await k.route.PUT(req("PUT", k.path, "{quebrado"))).status).toBe(400);
    noWrites();
  });

  if (k.canMove) {
    describe("mudança de ficha", () => {
      const move = (characterId: string) =>
        k.route.PUT(req("PUT", k.path, { id: k.recordId, characterId }));

      it("jogador tenta mover: 403 e o registro continua onde está", async () => {
        signIn(USERS.robert);
        expect((await move(IDS.charTulio)).status).toBe(403);
        expect(k.model.update).not.toHaveBeenCalled();
      });

      it("GM move para uma ficha existente e invalida as duas fichas", async () => {
        signIn(USERS.gm);
        expect((await move(IDS.charTulio)).status).toBe(200);
        expect(k.model.update).toHaveBeenCalledWith(
          expect.objectContaining({ data: expect.objectContaining({ characterId: IDS.charTulio }) })
        );
        expect(cache.delete).toHaveBeenCalledWith(`character:${IDS.charRobert}`);
        expect(cache.delete).toHaveBeenCalledWith(`character:${IDS.charTulio}`);
      });

      it("GM move para ficha inexistente: 404", async () => {
        signIn(USERS.gm);
        expect((await move("00000000-0000-4000-8000-000000000999")).status).toBe(404);
        expect(k.model.update).not.toHaveBeenCalled();
      });

      it("mandar a mesma ficha não conta como mudança (jogador dono passa)", async () => {
        signIn(USERS.robert);
        expect((await move(IDS.charRobert)).status).toBe(200);
      });
    });
  }
});
