import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withTelemetry } from '@/lib/telemetry';
import { safeParseJson } from '@/lib/json';
import { loadCharacterForWrite, requireUser } from '@/lib/api/access';
import { badRequest, conflict, notFound } from '@/lib/api/errors';
import { parseBody, parseQuery } from '@/lib/api/parse';
import { tradeCreateSchema, tradeListQuerySchema, tradeRespondSchema } from '@/lib/schemas';

// GET: trocas pendentes de uma ficha. Leitura aberta a qualquer usuário logado.
export const GET = withTelemetry(async function GET(request: Request) {
  await requireUser();
  const { characterId } = parseQuery(request, tradeListQuerySchema);

  const trades = await prisma.tradeRequest.findMany({
    where: {
      OR: [{ senderId: characterId }, { receiverId: characterId }],
      status: 'PENDING',
    },
  });

  const characterIds = Array.from(new Set(trades.flatMap((t) => [t.senderId, t.receiverId])));
  const characters = await prisma.character.findMany({
    where: { id: { in: characterIds } },
    select: { id: true, name: true, avatarUrl: true },
  });

  const charMap = Object.fromEntries(characters.map((c) => [c.id, c]));

  const enrichedTrades = trades.map((t) => ({
    ...t,
    sender: charMap[t.senderId],
    receiver: charMap[t.receiverId],
    tradeData: safeParseJson(t.tradeData, {}),
  }));

  return NextResponse.json(enrichedTrades);
});

// POST: propõe uma troca. Só o dono da ficha remetente (ou o GM) pode propor.
export const POST = withTelemetry(async function POST(request: Request) {
  const user = await requireUser();
  const { senderId, receiverId, tradeData } = await parseBody(request, tradeCreateSchema);

  if (senderId === receiverId) {
    throw badRequest('A ficha remetente e a destinatária precisam ser diferentes.');
  }

  await loadCharacterForWrite(user, senderId);

  const receiver = await prisma.character.findUnique({ where: { id: receiverId }, select: { id: true } });
  if (!receiver) throw notFound('Ficha destinatária não encontrada.');

  const trade = await prisma.tradeRequest.create({
    data: {
      senderId,
      receiverId,
      tradeData: JSON.stringify(tradeData || {}),
      status: 'PENDING',
    },
  });

  return NextResponse.json(trade, { status: 201 });
});

// PUT: aceita ou recusa uma troca. Só o dono da ficha destinatária (ou o GM), uma única vez.
export const PUT = withTelemetry(async function PUT(request: Request) {
  const user = await requireUser();
  const { id, status } = await parseBody(request, tradeRespondSchema);

  const trade = await prisma.tradeRequest.findUnique({ where: { id } });
  if (!trade) throw notFound('Troca não encontrada.');

  await loadCharacterForWrite(user, trade.receiverId);

  if (trade.status !== 'PENDING') throw conflict('Esta troca já foi respondida.');

  // A condição PENDING na própria escrita impede que duas respostas simultâneas passem.
  const { count } = await prisma.tradeRequest.updateMany({
    where: { id, status: 'PENDING' },
    data: { status },
  });
  if (count === 0) throw conflict('Esta troca já foi respondida.');

  return NextResponse.json({ ...trade, status });
});
