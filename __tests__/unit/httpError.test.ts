import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { forbidden, HttpError, notFound, unauthorized } from "@/lib/api/errors";
import { withTelemetry } from "@/lib/telemetry";

describe("HttpError e withTelemetry (Unit)", () => {
  let consoleSpies: ReturnType<typeof vi.spyOn>[];

  beforeEach(() => {
    consoleSpies = (["log", "warn", "error"] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {})
    );
  });
  afterEach(() => vi.restoreAllMocks());

  const output = () => consoleSpies.flatMap((s) => s.mock.calls).map((c) => String(c[0]));
  const request = (body = "{}") =>
    new Request("http://localhost/api/x?id=1", { method: "PUT", body });

  it("converte HttpError na resposta { error } com o status dele", async () => {
    const handler = withTelemetry(async () => {
      throw forbidden("Acesso negado à ficha.");
    });
    const res = await handler(request());
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Acesso negado à ficha." });
    expect(res.headers.get("X-Request-ID")).toBeTruthy();
  });

  it.each([
    [unauthorized(), 401],
    [notFound(), 404],
    [new HttpError(409, "Conflito."), 409],
  ])("mantém o status %#", async (error, status) => {
    const res = await withTelemetry(async () => {
      throw error;
    })(request());
    expect(res.status).toBe(status);
  });

  it("erro comum continua sendo 500 genérico com requestId", async () => {
    const res = await withTelemetry(async () => {
      throw new Error("falha interna com /caminho/secreto");
    })(request());
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error).toBe("Erro interno do servidor");
    expect(body.requestId).toBeTruthy();
    expect(JSON.stringify(body)).not.toContain("secreto");
  });

  it("Acesso negado: o log registra a recusa sem o corpo enviado", async () => {
    const handler = withTelemetry(async () => {
      throw forbidden();
    });
    await handler(request(JSON.stringify({ sheetData: { notas: "SENTINELA-CORPO" } })));

    const refused = output().find((line) => line.includes("Requisição recusada"));
    expect(refused).toBeDefined();
    const entry = JSON.parse(refused!);
    expect(entry).toMatchObject({ level: "WARN", status: 403, path: "/api/x" });
    expect(output().join("\n")).not.toContain("SENTINELA-CORPO");
  });

  it("resposta de sucesso passa sem alteração", async () => {
    const res = await withTelemetry(async () => NextResponse.json({ ok: true }, { status: 201 }))(request());
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
  });
});
