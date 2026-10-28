import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { auth, prisma, cache, records, store } = vi.hoisted(() => {
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
    // Pokémon e itens passam pelo módulo de registros (testado contra banco real em characterRecords.test.ts).
    records: {
      createPokemon: vi.fn(), updatePokemon: vi.fn(), deletePokemon: vi.fn(), getPokemon: vi.fn(), listPokemons: vi.fn(),
      createItem: vi.fn(), updateItem: vi.fn(), deleteItem: vi.fn(), getItem: vi.fn(), listItems: vi.fn(),
    },
    store: { migrateIfLegacy: vi.fn() },
  };
});
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/cache", () => ({ memoryCache: cache }));
vi.mock("@/lib/characterModel/records", () => records);
vi.mock("@/lib/characterModel/store", () => store);

import * as noteRoute from "@/app/api/note/route";
import * as itemRoute from "@/app/api/item/route";
import * as pokemonRoute from "@/app/api/pokemon/route";
import { IDS, USERS, req, signInAs, silenceConsole, type TestUser } from "../helpers/api";

type Handler = (r: Request) => Promise<Response>;
interface Kind {
  name: string;
  path: string;
  recordId: string;
  model: typeof prisma.note; // leitura do dono (findUnique) e as escritas (create/update/delete)
  route: { POST: Handler; PUT: Handler; DELETE: Handler };
  createBody: (characterId: string) => object;
  updateBody: (id: string) => object;
  invalidCreate: object;
  canMove: boolean;
}

const stats = { saude: 1, ataque: 1, defesa: 1, atqEspecial: 1, defEspecial: 1, velocidade: 1 };
const pokemonBody = {
  name: "Pika", species: "Pikachu", level: 5, gender: "M", types: ["ELÉTRICO"], ball: "Poke Ball",
  nature: "", natureFeatures: "", elementalDamageBonus: 0,
  capabilityTrait: { name: "", description: "" },
  abilities: [], stats: { ...stats, base: stats, lvl: stats }, hp: { current: 10, max: 10 },
  evasions: { fisica: 1, especial: 1, veloz: 1 },
  movements: { terrestre: 1, voo: 0, natacao: 0, subaquatico: 0, escavacao: 0 },
  capabilities: { force: { value: 1, description: "" }, intelligence: { value: 1, description: "" }, jump: { value: 1, description: "" }, other: [] },
  moves: [], boxNumber: 1, slot: 0,
};

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
    model: { findUnique: prisma.item.findUnique, create: records.createItem, update: records.updateItem, delete: records.deleteItem } as unknown as typeof prisma.note,
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
    model: { findUnique: prisma.pokemon.findUnique, create: records.createPokemon, update: records.updatePokemon, delete: records.deletePokemon } as unknown as typeof prisma.note,
    route: pokemonRoute,
    createBody: (characterId) => ({ characterId, ...pokemonBody }),
    updateBody: (id) => ({ id, name: "Raichu" }),
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
    store.migrateIfLegacy.mockResolvedValue(false);
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
        k.route.PUT(req("PUT", k.path, { id: k.recordId, ...(characterId && { characterId }) }));

      it("jogador tenta mover: 403 e o registro continua onde está", async () => {
        signIn(USERS.robert);
        expect((await move(IDS.charTulio)).status).toBe(403);
        expect(k.model.update).not.toHaveBeenCalled();
      });

      it("GM move para uma ficha existente e invalida as duas fichas", async () => {
        signIn(USERS.gm);
        expect((await move(IDS.charTulio)).status).toBe(200);
        expect(JSON.stringify(k.model.update.mock.calls[0])).toContain(IDS.charTulio);
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

describe.each([
  { name: "Pokémon", path: "/api/pokemon", route: pokemonRoute, list: records.listPokemons, get: records.getPokemon, owner: prisma.pokemon.findUnique },
  { name: "item", path: "/api/item", route: itemRoute, list: records.listItems, get: records.getItem, owner: prisma.item.findUnique },
])("leitura de $name (Integration)", (k) => {
  beforeEach(() => {
    vi.clearAllMocks();
    silenceConsole();
    prisma.character.findUnique.mockResolvedValue({ id: IDS.charRobert, userId: IDS.robert });
    store.migrateIfLegacy.mockResolvedValue(false);
  });
  afterEach(() => vi.restoreAllMocks());

  it("sem sessão: 401", async () => {
    signInAs(auth, prisma.user.findUnique, null);
    expect((await k.route.GET(req("GET", `${k.path}?characterId=${IDS.charRobert}`))).status).toBe(401);
    expect(k.list).not.toHaveBeenCalled();
  });

  it("jogador lista os registros da ficha de outro: 200 com a lista completa", async () => {
    signInAs(auth, prisma.user.findUnique, USERS.tulio);
    k.list.mockResolvedValue([{ id: "a" }, { id: "b" }]);
    const res = await k.route.GET(req("GET", `${k.path}?characterId=${IDS.charRobert}`));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: "a" }, { id: "b" }]);
    expect(store.migrateIfLegacy).toHaveBeenCalled();
  });

  it("jogador lê um registro de outro pelo id: 200", async () => {
    signInAs(auth, prisma.user.findUnique, USERS.tulio);
    k.get.mockResolvedValue({ id: IDS.pokemonRobert });
    expect((await k.route.GET(req("GET", `${k.path}?id=${IDS.pokemonRobert}`))).status).toBe(200);
  });

  it("registro ou ficha inexistente: 404", async () => {
    signInAs(auth, prisma.user.findUnique, USERS.tulio);
    k.get.mockResolvedValue(null);
    expect((await k.route.GET(req("GET", `${k.path}?id=${IDS.pokemonRobert}`))).status).toBe(404);
    prisma.character.findUnique.mockResolvedValue(null);
    expect((await k.route.GET(req("GET", `${k.path}?characterId=${IDS.charRobert}`))).status).toBe(404);
  });

  it("sem parâmetro, com os dois ou com id inválido: 400", async () => {
    signInAs(auth, prisma.user.findUnique, USERS.tulio);
    expect((await k.route.GET(req("GET", k.path))).status).toBe(400);
    expect((await k.route.GET(req("GET", `${k.path}?id=${IDS.pokemonRobert}&characterId=${IDS.charRobert}`))).status).toBe(400);
    expect((await k.route.GET(req("GET", `${k.path}?id=../x`))).status).toBe(400);
  });
});
