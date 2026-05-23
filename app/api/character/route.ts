import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID do personagem é obrigatório' }, { status: 400 });
  }

  try {
    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        items: true,
        pokemons: true,
        notes: true,
      }
    });

    if (!character) {
      return NextResponse.json({ error: 'Personagem não encontrado' }, { status: 404 });
    }

    // Fazendo parse dos campos JSON para objetos nativos antes de enviar ao client com segurança
    let parsedSheet = {};
    try {
      parsedSheet = JSON.parse(character.sheetData || '{}');
    } catch (e) {
      console.error('GET /api/character JSON parse error for sheetData:', e);
    }

    const parsedCharacter = {
      ...character,
      sheetData: parsedSheet,
      pokemons: character.pokemons.map(p => {
        let parsedPkmnData = {};
        try {
          parsedPkmnData = JSON.parse(p.pokemonData || '{}');
        } catch (e) {
          console.error('GET /api/character JSON parse error for pokemonData:', e, p.id);
        }
        return {
          ...p,
          pokemonData: parsedPkmnData
        };
      })
    };

    return NextResponse.json(parsedCharacter);
  } catch (error) {
    console.error('Erro no GET de Character:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, level, money, avatarUrl, userId, sheetData } = body;

    if (!name || !userId) {
      return NextResponse.json({ error: 'Nome e userId são obrigatórios' }, { status: 400 });
    }

    // Garante que o User com o userId fornecido exista para não violar a chave estrangeira
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        username: `treinador_${userId}`,
        role: 'PLAYER',
      },
    });

    const newCharacter = await prisma.character.create({
      data: {
        name,
        level: level || 1,
        money: money || 0,
        avatarUrl,
        userId,
        sheetData: sheetData ? JSON.stringify(sheetData) : '{}',
      }
    });

    return NextResponse.json(newCharacter, { status: 201 });
  } catch (error) {
    console.error('Erro no POST de Character:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, level, money, avatarUrl, sheetData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do personagem é obrigatório para atualização' }, { status: 400 });
    }

    const updatedCharacter = await prisma.character.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(level !== undefined && { level }),
        ...(money !== undefined && { money }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(sheetData && { sheetData: JSON.stringify(sheetData) }),
      }
    });

    return NextResponse.json(updatedCharacter);
  } catch (error) {
    console.error('Erro no PUT de Character:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
