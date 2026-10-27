import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveAuthSecret, SECRET_FILE_NAME } from "@/lib/authSecret";

describe("resolveAuthSecret (Unit)", () => {
  let dir: string;
  const env = (extra: Record<string, string> = {}) =>
    ({ APP_DATA_DIR: dir, ...extra }) as unknown as NodeJS.ProcessEnv;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "tcp-secret-"));
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  it("Variável definida: usa o valor e não cria arquivo", () => {
    expect(resolveAuthSecret(env({ AUTH_SECRET: "do-ambiente" }))).toBe("do-ambiente");
    expect(fs.existsSync(path.join(dir, SECRET_FILE_NAME))).toBe(false);
  });

  it("Primeira execução sem variável: gera e salva um segredo aleatório", () => {
    const secret = resolveAuthSecret(env());
    expect(secret.length).toBeGreaterThanOrEqual(32);
    expect(fs.readFileSync(path.join(dir, SECRET_FILE_NAME), "utf8")).toBe(secret);
  });

  it("Execuções seguintes: reutiliza o mesmo segredo", () => {
    expect(resolveAuthSecret(env())).toBe(resolveAuthSecret(env()));
  });

  it("Instalações diferentes: segredos diferentes", () => {
    const other = fs.mkdtempSync(path.join(os.tmpdir(), "tcp-secret-"));
    try {
      const a = resolveAuthSecret(env());
      const b = resolveAuthSecret({ APP_DATA_DIR: other } as unknown as NodeJS.ProcessEnv);
      expect(a).not.toBe(b);
    } finally {
      fs.rmSync(other, { recursive: true, force: true });
    }
  });

  it("durante o build não cria arquivo", () => {
    resolveAuthSecret(env({ NEXT_PHASE: "phase-production-build" }));
    expect(fs.existsSync(path.join(dir, SECRET_FILE_NAME))).toBe(false);
  });
});
