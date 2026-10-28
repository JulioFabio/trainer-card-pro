import { describe, expect, it } from "vitest";
import { parseBody, parseQuery } from "@/lib/api/parse";
import {
  characterCreateSchema,
  characterQuerySchema,
  characterUpdateSchema,
  itemCreateSchema,
  noteCreateSchema,
  tradeRespondSchema,
} from "@/lib/schemas";

const UUID = "3f2b8c1e-9d4a-4b6e-8a1f-2c7d5e9b0a14";
const post = (body: unknown) =>
  new Request("http://localhost/api/x", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

async function failure(fn: () => Promise<unknown> | unknown) {
  try {
    await fn();
    return null;
  } catch (e: any) {
    return { status: e.status as number, message: e.message as string };
  }
}

describe("parseBody e esquemas (Unit)", () => {
  it("Corpo com tipo errado: 400 e a mensagem cita o campo, não o valor", async () => {
    const err = await failure(() => parseBody(post({ id: UUID, level: "ALTO-SENTINELA" }), characterUpdateSchema));
    expect(err?.status).toBe(400);
    expect(err?.message).toContain('"level"');
    expect(err?.message).not.toContain("SENTINELA");
  });

  it("quantidade negativa é recusada", async () => {
    const err = await failure(() => parseBody(post({ characterId: UUID, name: "Poção", quantity: -1 }), itemCreateSchema));
    expect(err?.status).toBe(400);
    expect(err?.message).toContain('"quantity"');
  });

  it("Corpo que não é JSON: 400, e não erro interno", async () => {
    expect((await failure(() => parseBody(post("{isso não é json"), characterCreateSchema)))?.status).toBe(400);
    expect((await failure(() => parseBody(post(""), characterCreateSchema)))?.status).toBe(400);
    expect((await failure(() => parseBody(post("[1,2]"), characterCreateSchema)))?.status).toBe(400);
    expect((await failure(() => parseBody(post("null"), characterCreateSchema)))?.status).toBe(400);
  });

  it("Campo obrigatório ausente: 400 indicando o campo", async () => {
    const err = await failure(() => parseBody(post({ characterId: UUID }), itemCreateSchema));
    expect(err?.status).toBe(400);
    expect(err?.message).toContain('"name"');
    expect(err?.message).toContain("obrigatório");
  });

  it("nome vazio na criação é recusado", async () => {
    expect((await failure(() => parseBody(post({ name: "" }), characterCreateSchema)))?.status).toBe(400);
  });

  it("Tentativa de definir o dono: userId é recusado", async () => {
    const err = await failure(() => parseBody(post({ name: "Red", userId: "outro" }), characterCreateSchema));
    expect(err?.status).toBe(400);
    expect(err?.message).toContain("userId");
  });

  it("Identificador definido pelo cliente: id é recusado na criação", async () => {
    const err = await failure(() => parseBody(post({ name: "Red", id: UUID }), characterCreateSchema));
    expect(err?.status).toBe(400);
    expect(err?.message).toContain("id");
  });

  it("Ficha grande demais: 413", async () => {
    const big = { sheetData: { foto: "x".repeat(10 * 1024 * 1024 + 10) } };
    const err = await failure(() => parseBody(post({ id: UUID, ...big }), characterUpdateSchema));
    expect(err?.status).toBe(413);
  });

  it("ficha de 8 MB passa: o teto próprio do sheetData deixou de existir", async () => {
    const data = await parseBody(post({ id: UUID, sheetData: { foto: "x".repeat(8 * 1024 * 1024 + 10) } }), characterUpdateSchema);
    expect(data.id).toBe(UUID);
  });

  it("ficha com fotos em base64 de alguns MB ainda é aceita", async () => {
    const data = await parseBody(post({ id: UUID, sheetData: { foto: "x".repeat(3 * 1024 * 1024) } }), characterUpdateSchema);
    expect(data.id).toBe(UUID);
  });

  it("Nível fora da faixa: 0, 101 e fracionário", async () => {
    for (const level of [0, 101, 1.5]) {
      expect((await failure(() => parseBody(post({ name: "Red", level }), characterCreateSchema)))?.status).toBe(400);
    }
  });

  it("Valores dentro dos limites são aceitos", async () => {
    const data = await parseBody(
      post({ name: "Red", level: 100, money: 1_000_000_000, avatarUrl: null, sheetData: { a: 1 } }),
      characterCreateSchema
    );
    expect(data).toMatchObject({ name: "Red", level: 100 });
  });

  it("nome da ficha vazio no PUT significa 'sem mudança' (como o front envia)", async () => {
    const data = await parseBody(post({ id: UUID, name: "", level: 5, avatarUrl: null, sheetData: {} }), characterUpdateSchema);
    expect(data.name).toBe("");
  });

  it("Endereço com script: avatarUrl javascript: ou data: é recusado", async () => {
    for (const avatarUrl of ["javascript:alert(1)", "data:text/html;base64,AAAA", "ftp://x/y.png"]) {
      const err = await failure(() => parseBody(post({ name: "Red", avatarUrl }), characterCreateSchema));
      expect(err?.status).toBe(400);
      expect(err?.message).not.toContain("alert(1)");
    }
  });

  it("Caminho de upload e http(s) são aceitos", async () => {
    for (const avatarUrl of [`/uploads/${UUID}/a.png`, "https://exemplo.com/a.png", "", null]) {
      const data = await parseBody(post({ name: "Red", avatarUrl }), characterCreateSchema);
      expect(data.avatarUrl).toBe(avatarUrl);
    }
  });

  it("identificador que não é UUID é recusado (inclusive travessia de caminho)", async () => {
    for (const characterId of ["../../etc", "char-123", "", 123]) {
      expect((await failure(() => parseBody(post({ characterId, title: "x" }), noteCreateSchema)))?.status).toBe(400);
    }
  });

  it("estado de troca só aceita ACCEPTED ou REJECTED", async () => {
    expect((await failure(() => parseBody(post({ id: UUID, status: "PENDING" }), tradeRespondSchema)))?.status).toBe(400);
    expect((await failure(() => parseBody(post({ id: UUID, status: "ACCEPTED" }), tradeRespondSchema)))).toBeNull();
  });
});

describe("parseQuery (Unit)", () => {
  const get = (qs: string) => new Request(`http://localhost/api/character${qs}`);

  it("aceita id válido, scope=all e consulta vazia", () => {
    expect(parseQuery(get(`?id=${UUID}`), characterQuerySchema)).toEqual({ id: UUID });
    expect(parseQuery(get("?scope=all"), characterQuerySchema)).toEqual({ scope: "all" });
    expect(parseQuery(get(""), characterQuerySchema)).toEqual({});
  });

  it("recusa id inválido, scope desconhecido e parâmetros extras", () => {
    for (const qs of ["?id=abc", "?scope=tudo", `?id=${UUID}&x=1`]) {
      expect(() => parseQuery(get(qs), characterQuerySchema)).toThrow();
    }
  });
});
