import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET: Lista todas as trocas pendentes envolvendo o personagem
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get('characterId');

  if (!characterId) {
    return NextResponse.json({ error: 'characterId é obrigatório' }, { status: 400 });
  }

  try {
    const trades = await prisma.tradeRequest.findMany({
      where: {
        OR: [
          { senderId: characterId },
          { receiverId: characterId }
        ],
        status: 'PENDING'
      }
    });

    // Em um sistema real, faríamos um JOIN com a tabela Character para pegar os nomes dos remetentes/destinatários.
    // Como os dados não têm muitos usuários, vamos buscar todos os envolvidos manualmente.
    const characterIds = Array.from(new Set(trades.flatMap(t => [t.senderId, t.receiverId])));
    const characters = await prisma.character.findMany({
      where: { id: { in: characterIds } },
      select: { id: true, name: true, avatarUrl: true }
    });
    
    const charMap = Object.fromEntries(characters.map(c => [c.id, c]));

    const enrichedTrades = trades.map(t => {
      let parsedTradeData = {};
      try {
        parsedTradeData = JSON.parse(t.tradeData || '{}');
      } catch (e) {
        console.error('GET /api/trade JSON parse error for tradeData:', e);
      }
      return {
        ...t,
        sender: charMap[t.senderId],
        receiver: charMap[t.receiverId],
        tradeData: parsedTradeData
      };
    });

    return NextResponse.json(enrichedTrades);
  } catch (error) {
    console.error('GET /api/trade error:', error);
    return NextResponse.json({ error: 'Erro ao buscar trocas' }, { status: 500 });
  }
}

// POST: Cria uma nova requisição de troca
export async function POST(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('POST /api/trade error:', error);
    return NextResponse.json({ error: 'Erro ao criar troca' }, { status: 500 });
  }
}

// PUT: Atualiza o status de uma troca (ACEITAR ou RECUSAR)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id e status são obrigatórios' }, { status: 400 });
    }

    // Atualiza o status
    const trade = await prisma.tradeRequest.update({
      where: { id },
      data: { status }
    });

    // Se a troca for aceita, teríamos que implementar a lógica de transferir os Itens/Pokémons de um characterId para outro.
    // Como a Etapa 5 pede apenas o sistema base de TradeRequest (rotas e modal), a transferência real pode ser implementada posteriormente,
    // ou podemos apenas mudar o status para ACCEPTED por enquanto para validar o fluxo.

    return NextResponse.json(trade);
  } catch (error) {
    console.error('PUT /api/trade error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar troca' }, { status: 500 });
  }
}
