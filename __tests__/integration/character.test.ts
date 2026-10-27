import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { GET, PUT } from "@/app/api/character/route";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Mock do auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock do prisma client
vi.mock("@/lib/prisma", () => ({
  prisma: {
    character: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock do wrapper de telemetria
vi.mock("@/lib/telemetry", () => ({
  withTelemetry: (fn: any) => fn,
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

describe("Character API Route Permissions (Integration)", () => {
  afterEach(() => {
    // Teardown para isolamento de testes (QA Rule 6)
    vi.clearAllMocks();
  });

  describe("Acesso a Fichas Individuais (GET)", () => {
    it("deve permitir que o Mestre (GM) visualize qualquer ficha do sistema", async () => {
      // Simula sessão de GM
      (auth as Mock).mockResolvedValue({ user: { id: "user_gm", role: "GM" } });

      const mockCharacter = {
        id: "char_player_1",
        name: "Red",
        userId: "user_player_1",
        sheetData: "{}",
        pokemons: [],
      };
      (prisma.character.findUnique as Mock).mockResolvedValue(mockCharacter);

      const req = new Request("http://localhost/api/character?id=char_player_1");
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.name).toBe("Red");
    });

    it("deve permitir que o jogador comum acesse sua própria ficha", async () => {
      // Simula sessão do próprio dono
      (auth as Mock).mockResolvedValue({ user: { id: "user_player_1", role: "PLAYER" } });

      const mockCharacter = {
        id: "char_player_1",
        name: "Red",
        userId: "user_player_1",
        sheetData: "{}",
        pokemons: [],
      };
      (prisma.character.findUnique as Mock).mockResolvedValue(mockCharacter);

      const req = new Request("http://localhost/api/character?id=char_player_1");
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.name).toBe("Red");
    });

    it("deve rejeitar com 403 se o jogador tentar acessar a ficha de outro jogador", async () => {
      // Simula sessão de outro jogador
      (auth as Mock).mockResolvedValue({ user: { id: "user_player_2", role: "PLAYER" } });

      const mockCharacter = {
        id: "char_player_1",
        name: "Red",
        userId: "user_player_1",
        sheetData: "{}",
        pokemons: [],
      };
      (prisma.character.findUnique as Mock).mockResolvedValue(mockCharacter);

      const req = new Request("http://localhost/api/character?id=char_player_1");
      const response = await GET(req);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain("Acesso negado");
    });
  });

  describe("Alteração de Fichas (PUT)", () => {
    it("deve permitir que o Mestre (GM) altere a ficha de qualquer jogador", async () => {
      (auth as Mock).mockResolvedValue({ user: { id: "user_gm", role: "GM" } });

      const mockCharacter = { id: "char_player_1", userId: "user_player_1" };
      (prisma.character.findUnique as Mock).mockResolvedValue(mockCharacter);
      (prisma.character.update as Mock).mockResolvedValue({
        id: "char_player_1",
        name: "Red Modificado",
      });

      const req = new Request("http://localhost/api/character", {
        method: "PUT",
        body: JSON.stringify({ id: "char_player_1", name: "Red Modificado" }),
      });

      const response = await PUT(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.name).toBe("Red Modificado");
    });

    it("deve negar permissão (403) para jogador tentando alterar ficha de terceiros", async () => {
      (auth as Mock).mockResolvedValue({ user: { id: "user_player_2", role: "PLAYER" } });

      const mockCharacter = { id: "char_player_1", userId: "user_player_1" };
      (prisma.character.findUnique as Mock).mockResolvedValue(mockCharacter);

      const req = new Request("http://localhost/api/character", {
        method: "PUT",
        body: JSON.stringify({ id: "char_player_1", name: "Tentativa de Hack" }),
      });

      const response = await PUT(req);
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain("Acesso negado");
    });
  });
});
