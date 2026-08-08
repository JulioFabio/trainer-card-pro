import NextAuth from "next-auth";

// Mock central do next-auth que captura as opções de configuração
jest.mock("next-auth", () => {
  const mNextAuth = jest.fn((options) => {
    (global as any).lastNextAuthOptions = options;
    return {
      handlers: { GET: jest.fn(), POST: jest.fn() },
      auth: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    };
  });
  return mNextAuth;
});

// Mock do prisma para evitar acesso físico ao SQLite local
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      count: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock do logger de telemetria
jest.mock("@/lib/telemetry", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("NextAuth Config Integration (Fase 2)", () => {
  let options: any;

  beforeAll(() => {
    // Importa a configuração central do auth para disparar a inicialização do NextAuth mockado
    require("@/auth");
    options = (global as any).lastNextAuthOptions;
  });

  afterEach(() => {
    // Limpeza rigorosa pós execução de testes (QA Rule 6)
    jest.clearAllMocks();
  });

  it("deve carregar as configurações básicas de adaptadores e provedores", () => {
    expect(options).toBeDefined();
    expect(options.adapter).toBeDefined();
    expect(options.providers).toBeDefined();
    expect(options.providers.length).toBeGreaterThan(0);
  });

  describe("createUser Event", () => {
    it("deve atribuir o cargo de GM ao primeiro usuário criado no sistema", async () => {
      const createUserEvent = options.events?.createUser;
      expect(createUserEvent).toBeDefined();

      const mockUser = { id: "user_cuid_1", name: "Primeiro Jogador" };
      const { prisma } = require("@/lib/prisma");

      // Simula que é o primeiro usuário do banco
      prisma.user.count.mockResolvedValue(1);
      prisma.user.update.mockResolvedValue({ id: "user_cuid_1", role: "GM" });

      await createUserEvent({ user: mockUser });

      expect(prisma.user.count).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { role: "GM" },
      });
    });

    it("não deve alterar o cargo para GM se o banco já possuir mais usuários cadastrados", async () => {
      const createUserEvent = options.events?.createUser;
      const mockUser = { id: "user_cuid_2", name: "Segundo Jogador" };
      const { prisma } = require("@/lib/prisma");

      // Simula que já existem 2 usuários cadastrados
      prisma.user.count.mockResolvedValue(2);

      await createUserEvent({ user: mockUser });

      expect(prisma.user.count).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe("Callbacks (jwt e session)", () => {
    it("deve mapear e propagar id e role no token JWT", async () => {
      const jwtCallback = options.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      const mockUser = { id: "user_cuid_jwt", role: "GM" };
      const resultToken = await jwtCallback({ token: {}, user: mockUser });

      expect(resultToken.id).toBe("user_cuid_jwt");
      expect(resultToken.role).toBe("GM");
    });

    it("deve propagar claims a partir do token (JWT session strategy)", async () => {
      const sessionCallback = options.callbacks?.session;
      expect(sessionCallback).toBeDefined();

      const mockSession = { user: { name: "Red" } };
      const mockToken = { id: "user_cuid_jwt", role: "GM" };

      const finalSession = await sessionCallback({
        session: mockSession,
        token: mockToken,
        user: null,
      });

      expect(finalSession.user.id).toBe("user_cuid_jwt");
      expect(finalSession.user.role).toBe("GM");
    });

    it("deve propagar claims a partir do user (Database session strategy)", async () => {
      const sessionCallback = options.callbacks?.session;
      const mockSession = { user: { name: "Green" } };
      const mockUser = { id: "user_cuid_db", role: "PLAYER" };

      const finalSession = await sessionCallback({
        session: mockSession,
        token: null,
        user: mockUser,
      });

      expect(finalSession.user.id).toBe("user_cuid_db");
      expect(finalSession.user.role).toBe("PLAYER");
    });
  });
});
