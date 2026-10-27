import { describe, expect, it } from "vitest";
import { isLocalRequest } from "@/lib/localRequest";

const h = (init: Record<string, string>) => new Headers(init);

describe("isLocalRequest (Unit)", () => {
  it("Mestre abre o app no próprio computador", () => {
    expect(isLocalRequest(h({ host: "localhost:3000" }))).toBe(true);
    expect(isLocalRequest(h({ host: "127.0.0.1:3000" }))).toBe(true);
    expect(isLocalRequest(h({ host: "[::1]:3000" }))).toBe(true);
    expect(isLocalRequest(h({ host: "LOCALHOST" }))).toBe(true);
  });

  it("Acesso pelo link do túnel", () => {
    expect(
      isLocalRequest(h({ host: "trainer-card-ptu.loca.lt", "x-forwarded-for": "1.2.3.4" }))
    ).toBe(false);
  });

  it("Host falsificado atrás do túnel: qualquer cabeçalho de proxy desqualifica", () => {
    for (const name of [
      "x-forwarded-for",
      "x-forwarded-host",
      "forwarded",
      "x-real-ip",
      "cf-connecting-ip",
      "via",
    ]) {
      expect(isLocalRequest(h({ host: "localhost:3000", [name]: "1.2.3.4" }))).toBe(false);
    }
  });

  it("Acesso pela rede local", () => {
    expect(isLocalRequest(h({ host: "192.168.0.10:3000" }))).toBe(false);
  });

  it("sem Host ou com Host parecido não conta como local", () => {
    expect(isLocalRequest(h({}))).toBe(false);
    expect(isLocalRequest(h({ host: "localhost.evil.com" }))).toBe(false);
    expect(isLocalRequest(h({ host: "evil.com:localhost" }))).toBe(false);
  });
});
