import { describe, expect, it } from "vitest";
import { isLocalRequest } from "@/lib/localRequest";

const h = (init: Record<string, string>) => new Headers(init);

// Cabeçalhos que o próprio servidor Next injeta no acesso local direto.
const injected = (host: string, address = "::1") => ({
  host,
  "x-forwarded-for": address,
  "x-forwarded-host": host,
  "x-forwarded-port": "3000",
  "x-forwarded-proto": "http",
});

describe("isLocalRequest (Unit)", () => {
  it("Mestre abre o app no próprio computador (com e sem os cabeçalhos injetados pelo Next)", () => {
    expect(isLocalRequest(h(injected("localhost:3000")))).toBe(true);
    expect(isLocalRequest(h(injected("127.0.0.1:3000", "127.0.0.1")))).toBe(true);
    expect(isLocalRequest(h(injected("[::1]:3000")))).toBe(true);
    expect(isLocalRequest(h(injected("localhost:3000", "::ffff:127.0.0.1")))).toBe(true);
    expect(isLocalRequest(h({ host: "localhost:3000" }))).toBe(true);
    expect(isLocalRequest(h({ host: "LOCALHOST" }))).toBe(true);
  });

  it("Acesso pelo link do túnel", () => {
    expect(
      isLocalRequest(h(injected("trainer-card-ptu.loca.lt", "1.2.3.4")))
    ).toBe(false);
  });

  it("Host falsificado atrás do túnel: origem externa desqualifica", () => {
    expect(isLocalRequest(h({ ...injected("localhost:3000"), "x-forwarded-for": "1.2.3.4" }))).toBe(false);
    expect(isLocalRequest(h({ ...injected("localhost:3000"), "x-forwarded-for": "::1, 1.2.3.4" }))).toBe(false);
    expect(isLocalRequest(h({ ...injected("localhost:3000"), "x-forwarded-host": "foo.loca.lt" }))).toBe(false);
  });

  it("cabeçalhos que só proxies acrescentam desqualificam", () => {
    for (const name of ["forwarded", "x-real-ip", "cf-connecting-ip", "via"]) {
      expect(isLocalRequest(h({ ...injected("localhost:3000"), [name]: "1.2.3.4" }))).toBe(false);
    }
  });

  it("Acesso pela rede local", () => {
    expect(isLocalRequest(h(injected("192.168.0.10:3000", "192.168.0.20")))).toBe(false);
    expect(isLocalRequest(h({ host: "192.168.0.10:3000" }))).toBe(false);
  });

  it("sem Host ou com Host parecido não conta como local", () => {
    expect(isLocalRequest(h({}))).toBe(false);
    expect(isLocalRequest(h({ host: "localhost.evil.com" }))).toBe(false);
    expect(isLocalRequest(h({ host: "evil.com:localhost" }))).toBe(false);
  });
});
