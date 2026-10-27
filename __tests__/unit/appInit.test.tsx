import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { safeFetch } = vi.hoisted(() => ({ safeFetch: vi.fn() }));
vi.mock("@/lib/safeFetch", () => ({ safeFetch }));
vi.mock("next-auth/react", () => ({ signOut: vi.fn(), signIn: vi.fn() }));

import App from "@/App";

const CHARACTER_ID = "00000000-0000-4000-8000-000000000001";

describe("carregamento inicial do App (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  const creations = () =>
    safeFetch.mock.calls.filter(([url, options]) => url === "/api/character" && options?.method === "POST");

  it("em modo estrito (efeito em dobro) cria a ficha inicial uma única vez", async () => {
    safeFetch.mockImplementation(async (url: string, options?: { method?: string }) => {
      if (url === "/api/character" && !options?.method) return [];
      if (url === "/api/character" && options?.method === "POST") {
        return { id: CHARACTER_ID, name: "Treinador", sheetData: {}, avatarUrl: null };
      }
      return {};
    });

    render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    await screen.findByText("Mochila");
    expect(creations()).toHaveLength(1);
    expect(safeFetch.mock.calls.filter(([url, o]) => url === "/api/character" && !o?.method)).toHaveLength(1);
  });

  it("quando a pessoa já tem ficha, não cria outra", async () => {
    safeFetch.mockImplementation(async (url: string, options?: { method?: string }) => {
      if (url === "/api/character" && !options?.method) {
        return [{ id: CHARACTER_ID, name: "Treinador", sheetData: {}, avatarUrl: null }];
      }
      return {};
    });

    render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    await screen.findByText("Mochila");
    expect(creations()).toHaveLength(0);
  });
});
