import { auth, handlers, signIn, signOut } from "@/auth";

// Mock central do next-auth para isolar as importações e configurações
jest.mock("next-auth", () => {
  return jest.fn(() => ({
    handlers: {
      GET: jest.fn(),
      POST: jest.fn(),
    },
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  }));
});

// Mock do prisma para isolamento do teste unitário
jest.mock("@/lib/prisma", () => ({
  prisma: {},
}));

// Mock do logger de telemetria
jest.mock("@/lib/telemetry", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("NextAuth Configuration (Unit)", () => {
  afterEach(() => {
    // Clean-up dos mocks para garantir isolamento e resiliência de teste (QA Rule 6)
    jest.clearAllMocks();
  });

  it("deve expor os métodos e manipuladores principais do NextAuth", () => {
    expect(auth).toBeDefined();
    expect(handlers).toBeDefined();
    expect(signIn).toBeDefined();
    expect(signOut).toBeDefined();
  });
});
