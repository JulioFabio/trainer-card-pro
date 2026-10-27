import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withTelemetry } from '@/lib/telemetry';
import { memoryCache } from '@/lib/cache';
import { safeParseJson } from '@/lib/json';
import { auth } from '@/auth';

// GET: Recupera uma ficha de personagem específica ou lista todas as do usuário logado
export const GET = withTelemetry(async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  // Recupera a sessão ativa do usuário
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autorizado. Faça login para continuar.' }, { status: 401 });
  }

  const userId = session.user.id;
  const isGM = (session.user as any).role === 'GM';

  // Cenário A: Buscar uma ficha específica por ID
  if (id) {
    const cacheKey = `character:${id}`;
    const cached = memoryCache.get<any>(cacheKey);
    if (cached) {
      // Regra de Segurança: Validar permissão mesmo para dados cacheados
      const isOwner = cached.userId === userId;
      if (!isGM && !isOwner) {
        return NextResponse.json({ error: 'Acesso negado à ficha do personagem.' }, { status: 403 });
      }
      return NextResponse.json(cached);
    }

    const character = await prisma.character.findUnique({
      where: { id: id },
      include: {
        items: true,
        pokemons: true,
        notes: true,
      }
    });

    if (!character) {
      return NextResponse.json({ error: 'Personagem não encontrado.' }, { status: 404 });
    }

    // Regra de Segurança: Apenas o dono ou um GM pode visualizar a ficha
    const isOwner = character.userId === userId;
    if (!isGM && !isOwner) {
      return NextResponse.json({ error: 'Acesso negado à ficha do personagem.' }, { status: 403 });
    }

    const parsedCharacter = {
      ...character,
      sheetData: safeParseJson(character.sheetData, {}),
      pokemons: character.pokemons.map(p => ({
        ...p,
        pokemonData: safeParseJson(p.pokemonData, {}),
      }))
    };

    // Cacheia a resposta por 10 segundos
    memoryCache.set(cacheKey, parsedCharacter, 10000);

    return NextResponse.json(parsedCharacter);
  }

  // Cenário B: Listagem das fichas do jogador logado (Fase 3)
  const characters = await prisma.character.findMany({
    where: { userId: userId },
    include: {
      items: true,
      pokemons: true,
      notes: true,
    }
  });

  const parsedCharacters = characters.map(char => ({
    ...char,
    sheetData: safeParseJson(char.sheetData, {}),
    pokemons: char.pokemons.map(p => ({
      ...p,
      pokemonData: safeParseJson(p.pokemonData, {}),
    }))
  }));

  return NextResponse.json(parsedCharacters);
});

// POST: Cria um novo personagem vinculando-o de forma segura ao usuário da sessão ativa
export const POST = withTelemetry(async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autorizado. Faça login para continuar.' }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, level, money, avatarUrl, sheetData } = body;

  if (!name) {
    return NextResponse.json({ error: 'Nome do personagem é obrigatório.' }, { status: 400 });
  }

  const userId = session.user.id;

  // Garante a existência do usuário correspondente no banco (integridade referencial)
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      role: (session.user as any).role || 'PLAYER',
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

// PUT: Atualiza os dados de um personagem existente após validação de propriedade ou GM
export const PUT = withTelemetry(async function PUT(request: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autorizado. Faça login para continuar.' }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, level, money, avatarUrl, sheetData } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID do personagem é obrigatório para atualização.' }, { status: 400 });
  }

  // Verifica a existência do personagem e recupera o dono para validação de segurança
  const character = await prisma.character.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!character) {
    return NextResponse.json({ error: 'Personagem não encontrado.' }, { status: 404 });
  }

  const isGM = (session.user as any).role === 'GM';
  const isOwner = character.userId === session.user.id;
  if (!isGM && !isOwner) {
    return NextResponse.json({ error: 'Acesso negado. Você não tem permissão para alterar esta ficha.' }, { status: 403 });
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

  // Invalida o cache
  memoryCache.delete(`character:${id}`);

  return NextResponse.json(updatedCharacter);
});
