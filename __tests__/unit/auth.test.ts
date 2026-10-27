import { afterEach, describe, expect, it, vi } from "vitest";
import { auth, handlers, signIn, signOut } from "@/auth";

// Mock central do next-auth para isolar as importações e configurações
vi.mock("next-auth", () => {
  return {
    default: vi.fn(() => ({
      handlers: {
        GET: vi.fn(),
        POST: vi.fn(),
      },
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })),
  };
});

// Mock do prisma para isolamento do teste unitário
vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

// Mock do logger de telemetria
vi.mock("@/lib/telemetry", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("NextAuth Configuration (Unit)", () => {
  afterEach(() => {
    // Clean-up dos mocks para garantir isolamento e resiliência de teste (QA Rule 6)
    vi.clearAllMocks();
  });

  it("deve expor os métodos e manipuladores principais do NextAuth", () => {
    expect(auth).toBeDefined();
    expect(handlers).toBeDefined();
    expect(signIn).toBeDefined();
    expect(signOut).toBeDefined();
  });
});
