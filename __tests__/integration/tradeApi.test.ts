import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { auth, prisma } = vi.hoisted(() => ({
  auth: vi.fn(),
  prisma: {
    user: { findUnique: vi.fn() },
    character: { findUnique: vi.fn(), findMany: vi.fn() },
    tradeRequest: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
  },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { GET, POST, PUT } from "@/app/api/trade/route";
import { IDS, USERS, req, signInAs, silenceConsole, uuid, type TestUser } from "../helpers/api";

const signIn = (user: TestUser) => signInAs(auth, prisma.user.findUnique, user);

const pendingTrade = {
  id: IDS.tradeId,
  senderId: IDS.charTulio,
  receiverId: IDS.charRobert,
  status: "PENDING",
  tradeData: "{}",
};

describe("API /api/trade (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    silenceConsole();
    prisma.character.findUnique.mockImplementation(async ({ where }: any) =>
      where.id === IDS.charRobert
        ? { id: IDS.charRobert, userId: IDS.robert }
        : where.id === IDS.charTulio
          ? { id: IDS.charTulio, userId: IDS.tulio }
          : null
    );
    prisma.tradeRequest.create.mockResolvedValue({ id: IDS.tradeId });
    prisma.tradeRequest.findUnique.mockResolvedValue(pendingTrade);
    prisma.tradeRequest.updateMany.mockResolvedValue({ count: 1 });
  });
  afterEach(() => vi.restoreAllMocks());

  const propose = (senderId: string, receiverId: string) =>
    POST(req("POST", "/api/trade", { senderId, receiverId, tradeData: { items: [], pokemons: [] } }));
  const respond = (status: string) => PUT(req("PUT", "/api/trade", { id: IDS.tradeId, status }));

  describe("sem sessão", () => {
    it("GET, POST e PUT dão 401", async () => {
      signIn(null);
      expect((await GET(req("GET", `/api/trade?characterId=${IDS.charTulio}`))).status).toBe(401);
      expect((await propose(IDS.charTulio, IDS.charRobert)).status).toBe(401);
      expect((await respond("ACCEPTED")).status).toBe(401);
      expect(prisma.tradeRequest.create).not.toHaveBeenCalled();
      expect(prisma.tradeRequest.updateMany).not.toHaveBeenCalled();
    });
  });

  describe("GET", () => {
    it("qualquer logado lê as trocas pendentes de uma ficha", async () => {
      signIn(USERS.robert);
      prisma.tradeRequest.findMany.mockResolvedValue([pendingTrade]);
      prisma.character.findMany.mockResolvedValue([
        { id: IDS.charTulio, name: "Túlio", avatarUrl: null },
        { id: IDS.charRobert, name: "Robert", avatarUrl: null },
      ]);
      const res = await GET(req("GET", `/api/trade?characterId=${IDS.charTulio}`));
      expect(res.status).toBe(200);
      const [trade] = await res.json();
      expect(trade.sender.name).toBe("Túlio");
      expect(trade.receiver.name).toBe("Robert");
    });

    it("characterId inválido: 400", async () => {
      signIn(USERS.robert);
      expect((await GET(req("GET", "/api/trade?characterId=char-123"))).status).toBe(400);
      expect((await GET(req("GET", "/api/trade"))).status).toBe(400);
    });
  });

  describe("POST (propor)", () => {
    it("Proposta feita pelo dono do remetente: cria PENDING", async () => {
      signIn(USERS.tulio);
      const res = await propose(IDS.charTulio, IDS.charRobert);
      expect(res.status).toBe(201);
      expect(prisma.tradeRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ senderId: IDS.charTulio, receiverId: IDS.charRobert, status: "PENDING" }),
      });
    });

    it("o GM pode propor em nome de qualquer ficha", async () => {
      signIn(USERS.gm);
      expect((await propose(IDS.charTulio, IDS.charRobert)).status).toBe(201);
    });

    it("Proposta em nome de outro: 403 e nenhuma troca criada", async () => {
      signIn(USERS.robert);
      expect((await propose(IDS.charTulio, IDS.charRobert)).status).toBe(403);
      expect(prisma.tradeRequest.create).not.toHaveBeenCalled();
    });

    it("Destinatário inexistente: 404", async () => {
      signIn(USERS.tulio);
      expect((await propose(IDS.charTulio, uuid(999))).status).toBe(404);
      expect(prisma.tradeRequest.create).not.toHaveBeenCalled();
    });

    it("Destinatário igual ao remetente: 400", async () => {
      signIn(USERS.tulio);
      expect((await propose(IDS.charTulio, IDS.charTulio)).status).toBe(400);
      expect(prisma.tradeRequest.create).not.toHaveBeenCalled();
    });

    it("rejeita ids que não são UUID e campos extras", async () => {
      signIn(USERS.tulio);
      expect((await propose("char-123", "rival-456")).status).toBe(400);
      const extra = await POST(
        req("POST", "/api/trade", { senderId: IDS.charTulio, receiverId: IDS.charRobert, status: "ACCEPTED" })
      );
      expect(extra.status).toBe(400);
    });
  });

  describe("PUT (responder)", () => {
    it("Destinatário responde: aceita e recusa", async () => {
      signIn(USERS.robert);
      const accepted = await respond("ACCEPTED");
      expect(accepted.status).toBe(200);
      expect((await accepted.json()).status).toBe("ACCEPTED");
      expect(prisma.tradeRequest.updateMany).toHaveBeenCalledWith({
        where: { id: IDS.tradeId, status: "PENDING" },
        data: { status: "ACCEPTED" },
      });
      expect((await respond("REJECTED")).status).toBe(200);
    });

    it("o GM também responde", async () => {
      signIn(USERS.gm);
      expect((await respond("REJECTED")).status).toBe(200);
    });

    it("Outro jogador tenta responder (inclusive o remetente): 403 e a troca fica pendente", async () => {
      signIn(USERS.tulio); // dono da ficha remetente, não da destinatária
      expect((await respond("ACCEPTED")).status).toBe(403);
      expect(prisma.tradeRequest.updateMany).not.toHaveBeenCalled();
    });

    it("Troca já respondida: 409", async () => {
      signIn(USERS.robert);
      prisma.tradeRequest.findUnique.mockResolvedValue({ ...pendingTrade, status: "ACCEPTED" });
      expect((await respond("REJECTED")).status).toBe(409);
      expect(prisma.tradeRequest.updateMany).not.toHaveBeenCalled();
    });

    it("duas respostas simultâneas: a que perde a corrida recebe 409", async () => {
      signIn(USERS.robert);
      prisma.tradeRequest.updateMany.mockResolvedValue({ count: 0 });
      expect((await respond("ACCEPTED")).status).toBe(409);
    });

    it("Estado inválido: 400 (PENDING, minúsculas e vazio)", async () => {
      signIn(USERS.robert);
      for (const status of ["PENDING", "accepted", ""]) {
        expect((await respond(status)).status).toBe(400);
      }
      expect(prisma.tradeRequest.updateMany).not.toHaveBeenCalled();
    });

    it("troca inexistente: 404", async () => {
      signIn(USERS.robert);
      prisma.tradeRequest.findUnique.mockResolvedValue(null);
      expect((await respond("ACCEPTED")).status).toBe(404);
    });
  });
});
