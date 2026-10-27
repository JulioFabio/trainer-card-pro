import { describe, expect, it } from "vitest";
import { hashPassword, isValidPassword, verifyPassword } from "@/lib/password";

describe("password (Unit)", () => {
  it("Armazenamento: o hash não contém a senha e é diferente a cada vez", async () => {
    const a = await hashPassword("mesa123");
    const b = await hashPassword("mesa123");
    expect(a).not.toContain("mesa123");
    expect(a).not.toBe(b);
  });

  it("verifica a senha correta e recusa a errada", async () => {
    const stored = await hashPassword("mesa123");
    expect(await verifyPassword("mesa123", stored)).toBe(true);
    expect(await verifyPassword("mesa124", stored)).toBe(false);
    expect(await verifyPassword("", stored)).toBe(false);
  });

  it("recusa formatos inválidos sem lançar erro", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "texto-puro")).toBe(false);
    expect(await verifyPassword("x", "bcrypt$1$a$b")).toBe(false);
    expect(await verifyPassword("x", "scrypt$abc$a$b")).toBe(false);
    expect(await verifyPassword("x", "scrypt$16384$$")).toBe(false);
  });

  it("Senha curta: exige no mínimo 4 caracteres", () => {
    expect(isValidPassword("abc")).toBe(false);
    expect(isValidPassword("abcd")).toBe(true);
    expect(isValidPassword(undefined)).toBe(false);
    expect(isValidPassword(1234)).toBe(false);
  });
});
