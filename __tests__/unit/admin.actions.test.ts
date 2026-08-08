import { deleteCharacterAction } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Mock do auth
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

// Mock do prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    character: {
      delete: jest.fn(),
    },
  },
}));

// Mock de telemetria
jest.mock("@/lib/telemetry", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock do cache revalidatePath
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Admin Server Actions - deleteCharacterAction (Unit)", () => {
  afterEach(() => {
    // Teardown para isolamento de testes (QA Rule 6)
    jest.clearAllMocks();
  });

  it("deve rejeitar se o usuário não possuir sessão ativa", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    await expect(deleteCharacterAction("char_123")).rejects.toThrow(
      "Não autorizado"
    );
  });

  it("deve rejeitar se o usuário logado não for GM no banco de dados", async () => {
    // Sessão ativa
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user_player" } });
    
    // Retorna role PLAYER do banco de dados (mesmo se a sessão estivesse falsificada)
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: "PLAYER" });

    await expect(deleteCharacterAction("char_123")).rejects.toThrow(
      "Acesso negado"
    );
    expect(prisma.character.delete).not.toHaveBeenCalled();
  });

  it("deve permitir a exclusão caso o usuário seja autenticado e GM", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user_gm" } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "user_gm", role: "GM" });
    (prisma.character.delete as jest.Mock).mockResolvedValue({ id: "char_123" });

    const result = await deleteCharacterAction("char_123");

    expect(result.success).toBe(true);
    expect(prisma.character.delete).toHaveBeenCalledWith({
      where: { id: "char_123" },
    });
  });
});
