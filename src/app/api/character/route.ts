import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withTelemetry } from '@/lib/telemetry';
import { memoryCache } from '@/lib/cache';
import { safeParseJson } from '@/lib/json';
import { requireUser, loadCharacterForWrite } from '@/lib/api/access';
import { notFound } from '@/lib/api/errors';
import { parseBody, parseQuery } from '@/lib/api/parse';
import { characterCacheKey, invalidateCharacter } from '@/lib/api/characterCache';
import { characterCreateSchema, characterQuerySchema, characterUpdateSchema } from '@/lib/schemas';

const fullInclude = { items: true, pokemons: true, notes: true } as const;

function withParsedJson<T extends { sheetData: string; pokemons: { pokemonData: string }[] }>(character: T) {
  return {
    ...character,
    sheetData: safeParseJson(character.sheetData, {}),
    pokemons: character.pokemons.map((p) => ({
      ...p,
      pokemonData: safeParseJson(p.pokemonData, {}),
    })),
  };
}

// GET: leitura aberta a qualquer usuário logado.
//   ?id=<uuid>   ficha completa de qualquer jogador
//   ?scope=all   resumo de todas as fichas (seletor de destinatário das trocas)
//   (nada)       fichas do próprio usuário
export const GET = withTelemetry(async function GET(request: Request) {
  const user = await requireUser();
  const { id, scope } = parseQuery(request, characterQuerySchema);

  if (id) {
    const cacheKey = characterCacheKey(id);
    const cached = memoryCache.get<unknown>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const character = await prisma.character.findUnique({ where: { id }, include: fullInclude });
    if (!character) throw notFound('Personagem não encontrado.');

    const parsed = withParsedJson(character);
    memoryCache.set(cacheKey, parsed, 10000);
    return NextResponse.json(parsed);
  }

  if (scope === 'all') {
    const characters = await prisma.character.findMany({
      select: { id: true, name: true, avatarUrl: true, user: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(
      characters.map((c) => ({ id: c.id, name: c.name, avatarUrl: c.avatarUrl, ownerName: c.user?.name ?? '' }))
    );
  }

  const characters = await prisma.character.findMany({
    where: { userId: user.id },
    include: fullInclude,
  });
  return NextResponse.json(characters.map(withParsedJson));
});

// POST: cria uma ficha do usuário logado. O dono e o id são sempre definidos pelo servidor.
export const POST = withTelemetry(async function POST(request: Request) {
  const user = await requireUser();
  const { name, level, money, avatarUrl, sheetData } = await parseBody(request, characterCreateSchema);

  const newCharacter = await prisma.character.create({
    data: {
      name,
      level: level ?? 1,
      money: money ?? 0,
      avatarUrl: avatarUrl ?? null,
      userId: user.id,
      sheetData: sheetData ? JSON.stringify(sheetData) : '{}',
    },
  });

  return NextResponse.json(newCharacter, { status: 201 });
});

// PUT: altera uma ficha. Só o dono ou o GM.
export const PUT = withTelemetry(async function PUT(request: Request) {
  const user = await requireUser();
  const { id, name, level, money, avatarUrl, sheetData } = await parseBody(request, characterUpdateSchema);

  await loadCharacterForWrite(user, id);

  const updatedCharacter = await prisma.character.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(level !== undefined && { level }),
      ...(money !== undefined && { money }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(sheetData && { sheetData: JSON.stringify(sheetData) }),
    },
  });

  invalidateCharacter(id);
  return NextResponse.json(updatedCharacter);
});
