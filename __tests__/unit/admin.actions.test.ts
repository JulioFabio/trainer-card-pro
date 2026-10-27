import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { deleteCharacterAction } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Mock do auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock do prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    character: {
      delete: vi.fn(),
    },
  },
}));

// Mock de telemetria
vi.mock("@/lib/telemetry", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock do cache revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Admin Server Actions - deleteCharacterAction (Unit)", () => {
  afterEach(() => {
    // Teardown para isolamento de testes (QA Rule 6)
    vi.clearAllMocks();
  });

  it("deve rejeitar se o usuário não possuir sessão ativa", async () => {
    (auth as Mock).mockResolvedValue(null);

    await expect(deleteCharacterAction("char_123")).rejects.toThrow(
      "Não autorizado"
    );
  });

  it("deve rejeitar se o usuário logado não for GM no banco de dados", async () => {
    // Sessão ativa
    (auth as Mock).mockResolvedValue({ user: { id: "user_player" } });
    
    // Retorna role PLAYER do banco de dados (mesmo se a sessão estivesse falsificada)
    (prisma.user.findUnique as Mock).mockResolvedValue({ role: "PLAYER" });

    await expect(deleteCharacterAction("char_123")).rejects.toThrow(
      "Acesso negado"
    );
    expect(prisma.character.delete).not.toHaveBeenCalled();
  });

  it("deve permitir a exclusão caso o usuário seja autenticado e GM", async () => {
    (auth as Mock).mockResolvedValue({ user: { id: "user_gm" } });
    (prisma.user.findUnique as Mock).mockResolvedValue({ id: "user_gm", role: "GM" });
    (prisma.character.delete as Mock).mockResolvedValue({ id: "char_123" });

    const result = await deleteCharacterAction("char_123");

    expect(result.success).toBe(true);
    expect(prisma.character.delete).toHaveBeenCalledWith({
      where: { id: "char_123" },
    });
  });
});
