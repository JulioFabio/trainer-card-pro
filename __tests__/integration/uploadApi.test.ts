import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { auth, prisma } = vi.hoisted(() => ({
  auth: vi.fn(),
  prisma: { user: { findUnique: vi.fn() }, character: { findUnique: vi.fn() } },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { POST } from "@/app/api/upload/route";
import { detectImageType, MAX_IMAGE_BYTES } from "@/lib/api/imageUpload";
import { IDS, USERS, signInAs, silenceConsole, type TestUser } from "../helpers/api";

const signIn = (user: TestUser) => signInAs(auth, prisma.user.findUnique, user);

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 1)]);
const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64, 2)]);
const GIF = Buffer.concat([Buffer.from("GIF89a", "latin1"), Buffer.alloc(64, 3)]);
const WEBP = Buffer.concat([Buffer.from("RIFF", "latin1"), Buffer.alloc(4), Buffer.from("WEBP", "latin1"), Buffer.alloc(32)]);

function upload(content: Buffer | string, opts: { name?: string; type?: string; characterId?: string | null } = {}) {
  const form = new FormData();
  form.append("file", new Blob([content], { type: opts.type ?? "image/png" }), opts.name ?? "avatar.png");
  if (opts.characterId !== null) form.append("characterId", opts.characterId ?? IDS.charRobert);
  return POST(new Request("http://localhost/api/upload", { method: "POST", body: form }));
}

describe("API /api/upload (Integration)", () => {
  let root: string;
  const filesWritten = () => fs.readdirSync(root, { recursive: true }).filter((f) => /\.\w+$/.test(String(f)));

  beforeEach(() => {
    vi.clearAllMocks();
    silenceConsole();
    root = fs.mkdtempSync(path.join(os.tmpdir(), "tcp-uploads-"));
    vi.stubEnv("UPLOADS_DIR", root);
    prisma.character.findUnique.mockImplementation(async ({ where }: any) =>
      where.id === IDS.charRobert ? { id: IDS.charRobert, userId: IDS.robert } : null
    );
    signIn(USERS.robert);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("Sem sessão: 401 e nada gravado", async () => {
    signIn(null);
    expect((await upload(PNG)).status).toBe(401);
    expect(filesWritten()).toEqual([]);
  });

  it("Ficha de outro jogador: 403 e nada gravado", async () => {
    signIn(USERS.tulio);
    expect((await upload(PNG)).status).toBe(403);
    expect(filesWritten()).toEqual([]);
  });

  it("Ficha inexistente: 404 e nada gravado", async () => {
    const res = await upload(PNG, { characterId: "00000000-0000-4000-8000-000000000999" });
    expect(res.status).toBe(404);
    expect(filesWritten()).toEqual([]);
  });

  it("Imagem válida: 201 com o endereço, arquivo gravado dentro da pasta de uploads", async () => {
    const res = await upload(PNG);
    expect(res.status).toBe(201);
    const { url } = await res.json();
    expect(url).toMatch(new RegExp(`^/uploads/${IDS.charRobert}/[0-9a-f-]{36}\\.png$`));
    const onDisk = path.join(root, url.replace("/uploads/", ""));
    expect(fs.readFileSync(onDisk).equals(PNG)).toBe(true);
  });

  it("o GM envia imagem para a ficha de qualquer jogador", async () => {
    signIn(USERS.gm);
    expect((await upload(PNG)).status).toBe(201);
  });

  it.each([
    ["JPEG", JPEG, "jpg"],
    ["GIF", GIF, "gif"],
    ["WebP", WEBP, "webp"],
  ])("aceita %s e usa a extensão pelo conteúdo", async (_n, content, ext) => {
    const res = await upload(content, { name: "qualquer.png", type: "image/png" });
    expect(res.status).toBe(201);
    expect((await res.json()).url).toMatch(new RegExp(`\\.${ext}$`));
  });

  it("Arquivo disfarçado: HTML com nome .png e tipo image/png é recusado", async () => {
    const res = await upload("<html><script>alert(1)</script></html>", { name: "avatar.png", type: "image/png" });
    expect(res.status).toBe(400);
    expect(filesWritten()).toEqual([]);
  });

  it("SVG é recusado, mesmo com tipo image/svg+xml ou image/png", async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
    expect((await upload(svg, { name: "a.svg", type: "image/svg+xml" })).status).toBe(400);
    expect((await upload(svg, { name: "a.png", type: "image/png" })).status).toBe(400);
    expect(filesWritten()).toEqual([]);
  });

  it("Tipo não permitido: PDF e texto", async () => {
    expect((await upload("%PDF-1.4 ...", { name: "a.pdf", type: "application/pdf" })).status).toBe(400);
    expect((await upload("texto", { name: "a.txt", type: "text/plain" })).status).toBe(400);
  });

  it("Arquivo grande: 413 acima de 5 MB e nada gravado", async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(MAX_IMAGE_BYTES)]);
    expect((await upload(big)).status).toBe(413);
    expect(filesWritten()).toEqual([]);
  });

  it("exatamente no limite ainda é aceito", async () => {
    const exact = Buffer.concat([PNG, Buffer.alloc(MAX_IMAGE_BYTES - PNG.length)]);
    expect(exact.length).toBe(MAX_IMAGE_BYTES);
    expect((await upload(exact)).status).toBe(201);
  });

  it.each(["../../x", "..", "a/b", "char-123", "C:\\\\Windows", "%2e%2e%2f", ""])(
    "Identificador com travessia de caminho (%s): 400 e nada gravado",
    async (characterId) => {
      expect((await upload(PNG, { characterId })).status).toBe(400);
      expect(filesWritten()).toEqual([]);
      expect(fs.existsSync(path.join(root, ".."))).toBe(true);
    }
  );

  it("characterId ausente: 400", async () => {
    expect((await upload(PNG, { characterId: null })).status).toBe(400);
  });

  it("Nome enviado é ignorado: ../../evil.html vira <uuid>.png dentro da ficha", async () => {
    const res = await upload(PNG, { name: "../../evil.html", type: "text/html" });
    expect(res.status).toBe(201);
    const files = filesWritten().map(String);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(new RegExp(`^${IDS.charRobert}[\\\\/][0-9a-f-]{36}\\.png$`));
    expect(JSON.stringify(await res.json())).not.toContain("evil");
  });

  it("requisição que não é formulário: 400", async () => {
    const res = await POST(new Request("http://localhost/api/upload", { method: "POST", body: "{}" }));
    expect(res.status).toBe(400);
  });
});

describe("detectImageType (Unit)", () => {
  it("reconhece PNG, JPEG, GIF e WebP pela assinatura", () => {
    expect(detectImageType(PNG)).toBe("png");
    expect(detectImageType(JPEG)).toBe("jpg");
    expect(detectImageType(GIF)).toBe("gif");
    expect(detectImageType(WEBP)).toBe("webp");
  });

  it("recusa conteúdo vazio, curto, HTML, SVG e RIFF que não é WebP", () => {
    expect(detectImageType(Buffer.alloc(0))).toBeNull();
    expect(detectImageType(Buffer.from([0x89, 0x50]))).toBeNull();
    expect(detectImageType(Buffer.from("<html></html>"))).toBeNull();
    expect(detectImageType(Buffer.from("<svg></svg>"))).toBeNull();
    expect(detectImageType(Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WAVE"), Buffer.alloc(8)]))).toBeNull();
  });
});
