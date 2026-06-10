import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { withTelemetry } from '../../../lib/telemetry';
import { memoryCache } from '../../../lib/cache';
import { requireQueryParam } from '../../../lib/routeHelpers';
import { safeParseJson } from '../../../lib/json';

export const GET = withTelemetry(async function GET(request: Request) {
  const { value: id, response } = requireQueryParam(request, 'id', 'ID do personagem é obrigatório');
  if (response) return response;

  // Check Cache first (Rule 6: Hit/Miss Tracking)
  const cacheKey = `character:${id}`;
  const cached = memoryCache.get<any>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const character = await prisma.character.findUnique({
    where: { id: id! },
    include: {
      items: true,
      pokemons: true,
      notes: true,
    }
  });

  if (!character) {
    return NextResponse.json({ error: 'Personagem não encontrado' }, { status: 404 });
  }

  const parsedCharacter = {
    ...character,
    sheetData: safeParseJson(character.sheetData, {}),
    pokemons: character.pokemons.map(p => ({
      ...p,
      pokemonData: safeParseJson(p.pokemonData, {}),
    }))
  };

  // Cache response for 10 seconds
  memoryCache.set(cacheKey, parsedCharacter, 10000);

  return NextResponse.json(parsedCharacter);
});


export const POST = withTelemetry(async function POST(request: Request) {
  const body = await request.json();
  const { id, name, level, money, avatarUrl, userId, sheetData } = body;

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
      ...(id && { id }),
      name,
      level: level || 1,
      money: money || 0,
      avatarUrl,
      userId,
      sheetData: sheetData ? JSON.stringify(sheetData) : '{}',
    }
  });

  return NextResponse.json(newCharacter, { status: 201 });
});

export const PUT = withTelemetry(async function PUT(request: Request) {
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

  // Invalidate Cache on update (Rule 6)
  memoryCache.delete(`character:${id}`);

  return NextResponse.json(updatedCharacter);
});

