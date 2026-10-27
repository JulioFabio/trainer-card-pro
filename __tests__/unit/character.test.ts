import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { GET, POST, PUT } from "@/app/api/character/route";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Mock das dependências de autenticação
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock do prisma client
vi.mock("@/lib/prisma", () => ({
  prisma: {
    character: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      upsert: vi.fn(),
    },
  },
}));

// Mock do wrapper de telemetria
vi.mock("@/lib/telemetry", () => ({
  withTelemetry: (fn: any) => fn, // Bypass do middleware de telemetria em ambiente de teste unitário
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock do cache em memória
vi.mock("@/lib/cache", () => ({
  memoryCache: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Character API Route Handlers (Unit)", () => {
  afterEach(() => {
    // Teardown para isolamento de testes (QA Rule 6)
    vi.clearAllMocks();
  });

  describe("GET - Listagem e Detalhamento", () => {
    it("deve retornar 401 caso o usuário não possua sessão ativa", async () => {
      (auth as Mock).mockResolvedValue(null);
      const req = new Request("http://localhost/api/character");

      const response = await GET(req);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Não autorizado");
    });

    it("deve retornar a lista de fichas vinculadas ao jogador caso o ID não seja informado", async () => {
      (auth as Mock).mockResolvedValue({ user: { id: "user_player_1" } });
      const mockCharacters = [
        { id: "char_1", name: "Red", userId: "user_player_1", sheetData: "{}", pokemons: [] }
      ];
      (prisma.character.findMany as Mock).mockResolvedValue(mockCharacters);

      const req = new Request("http://localhost/api/character");
      const response = await GET(req);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("Red");
    });
  });

  describe("POST - Criação de Ficha", () => {
    it("deve rejeitar requisição com 400 se o nome não for informado", async () => {
      (auth as Mock).mockResolvedValue({ user: { id: "user_player_1", role: "PLAYER" } });
      const req = new Request("http://localhost/api/character", {
        method: "POST",
        body: JSON.stringify({ level: 5 }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Nome do personagem é obrigatório");
    });

    it("deve injetar automaticamente o userId da sessão na criação do personagem", async () => {
      (auth as Mock).mockResolvedValue({ user: { id: "user_player_1", role: "PLAYER" } });
      (prisma.user.upsert as Mock).mockResolvedValue({ id: "user_player_1" });
      (prisma.character.create as Mock).mockResolvedValue({
        id: "char_new_99",
        name: "Charmander Trainer",
        userId: "user_player_1",
      });

      const req = new Request("http://localhost/api/character", {
        method: "POST",
        body: JSON.stringify({ name: "Charmander Trainer" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.userId).toBe("user_player_1");
      expect(prisma.character.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Charmander Trainer",
          userId: "user_player_1",
        }),
      });
    });
  });
});
