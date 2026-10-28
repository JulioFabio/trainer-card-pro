import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withTelemetry } from '@/lib/telemetry';
import { memoryCache } from '@/lib/cache';
import { requireUser, loadCharacterForWrite } from '@/lib/api/access';
import { notFound } from '@/lib/api/errors';
import { parseBody, parseQuery } from '@/lib/api/parse';
import { characterCacheKey, invalidateCharacter } from '@/lib/api/characterCache';
import { modelCall, modelDeps } from '@/lib/api/characterModel';
import { loadCharacterSheet, saveCharacterSheet } from '@/lib/characterModel/store';
import { characterCreateSchema, characterQuerySchema, characterUpdateSchema } from '@/lib/schemas';

// A ficha sai das tabelas no mesmo formato de sempre (sheetData completo); a leitura migra
// fichas antigas na primeira vez. Os Pokémon e itens agora vivem em tabelas próprias.
async function withSheet<T extends { id: string }>(character: T) {
  const sheetData = await modelCall(() => loadCharacterSheet(modelDeps(), character.id));
  return { ...character, sheetData: sheetData ?? {} };
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

    const character = await prisma.character.findUnique({ where: { id }, include: { notes: true } });
    if (!character) throw notFound('Personagem não encontrado.');

    const parsed = await withSheet(character);
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
    include: { notes: true },
  });
  return NextResponse.json(await Promise.all(characters.map(withSheet)));
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
      sheetData: '{}',
    },
  });

  if (sheetData) {
    try {
      await modelCall(() => saveCharacterSheet(modelDeps(), newCharacter.id, sheetData));
    } catch (error) {
      await prisma.character.delete({ where: { id: newCharacter.id } });
      throw error;
    }
  }

  return NextResponse.json(newCharacter, { status: 201 });
});

// PUT: altera uma ficha. Só o dono ou o GM.
export const PUT = withTelemetry(async function PUT(request: Request) {
  const user = await requireUser();
  const { id, name, level, money, avatarUrl, sheetData } = await parseBody(request, characterUpdateSchema);

  await loadCharacterForWrite(user, id);

  // A ficha vai primeiro: se algo nela for recusado, nenhum outro campo é alterado.
  if (sheetData) await modelCall(() => saveCharacterSheet(modelDeps(), id, sheetData));

  const updatedCharacter = await prisma.character.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(level !== undefined && { level }),
      ...(money !== undefined && { money }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
  });

  invalidateCharacter(id);
  return NextResponse.json(updatedCharacter);
});
