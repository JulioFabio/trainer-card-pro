import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { withTelemetry } from '../../../lib/telemetry';

import { requireQueryParam } from '../../../lib/routeHelpers';
import { safeParseJson } from '../../../lib/json';

// GET: Lista todas as trocas pendentes envolvendo o personagem
export const GET = withTelemetry(async function GET(request: Request) {
  const { value: characterId, response } = requireQueryParam(request, 'characterId');
  if (response) return response;

  const trades = await prisma.tradeRequest.findMany({
    where: {
      OR: [
        { senderId: characterId! },
        { receiverId: characterId! }
      ],
      status: 'PENDING'
    }
  });

  const characterIds = Array.from(new Set(trades.flatMap(t => [t.senderId, t.receiverId])));
  const characters = await prisma.character.findMany({
    where: { id: { in: characterIds } },
    select: { id: true, name: true, avatarUrl: true }
  });
  
  const charMap = Object.fromEntries(characters.map(c => [c.id, c]));

  const enrichedTrades = trades.map(t => ({
    ...t,
    sender: charMap[t.senderId],
    receiver: charMap[t.receiverId],
    tradeData: safeParseJson(t.tradeData, {}),
  }));

  return NextResponse.json(enrichedTrades);
});

// POST: Cria uma nova requisição de troca
export const POST = withTelemetry(async function POST(request: Request) {
  const body = await request.json();
  const { senderId, receiverId, tradeData } = body;

  if (!senderId || !receiverId) {
    return NextResponse.json({ error: 'senderId e receiverId são obrigatórios' }, { status: 400 });
  }

  const trade = await prisma.tradeRequest.create({
    data: {
      senderId,
      receiverId,
      tradeData: JSON.stringify(tradeData || {}),
      status: 'PENDING'
    }
  });

  return NextResponse.json(trade, { status: 201 });
});

// PUT: Atualiza o status de uma troca (ACEITAR ou RECUSAR)
export const PUT = withTelemetry(async function PUT(request: Request) {
  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: 'id e status são obrigatórios' }, { status: 400 });
  }

  const trade = await prisma.tradeRequest.update({
    where: { id },
    data: { status }
  });

  return NextResponse.json(trade);
});

