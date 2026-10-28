import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withTelemetry } from '@/lib/telemetry';
import { assertCanMoveTo, loadCharacterForWrite, requireUser } from '@/lib/api/access';
import { notFound } from '@/lib/api/errors';
import { parseBody, parseQuery } from '@/lib/api/parse';
import { invalidateCharacter } from '@/lib/api/characterCache';
import { modelCall, modelDeps } from '@/lib/api/characterModel';
import { idQuerySchema, itemCreateSchema, itemUpdateSchema, recordQuerySchema } from '@/lib/schemas';
import { migrateIfLegacy } from '@/lib/characterModel/store';
import { createItem, deleteItem, getItem, listItems, updateItem } from '@/lib/characterModel/records';

// Escrita em item: só o dono da ficha ou o GM.
async function loadItemForWrite(user: Awaited<ReturnType<typeof requireUser>>, id: string) {
  const item = await prisma.item.findUnique({ where: { id }, select: { characterId: true } });
  if (!item) throw notFound('Item não encontrado.');
  await loadCharacterForWrite(user, item.characterId);
  return item;
}

// GET: leitura aberta a qualquer usuário logado.
//   ?characterId=<uuid>  todos os itens da ficha, em ordem de posição
//   ?id=<uuid>           um item
export const GET = withTelemetry(async function GET(request: Request) {
  await requireUser();
  const { id, characterId } = parseQuery(request, recordQuerySchema);

  if (id) {
    const item = await getItem(prisma, id);
    if (!item) throw notFound('Item não encontrado.');
    return NextResponse.json(item);
  }

  const character = await prisma.character.findUnique({ where: { id: characterId! }, select: { id: true } });
  if (!character) throw notFound('Personagem não encontrado.');
  await modelCall(() => migrateIfLegacy(modelDeps(), character.id));
  return NextResponse.json(await listItems(prisma, character.id));
});

export const POST = withTelemetry(async function POST(request: Request) {
  const user = await requireUser();
  const { characterId, ...body } = await parseBody(request, itemCreateSchema);
  await loadCharacterForWrite(user, characterId);

  const created = await modelCall(() => createItem(prisma, characterId, body));

  invalidateCharacter(characterId);
  return NextResponse.json(created, { status: 201 });
});

export const PUT = withTelemetry(async function PUT(request: Request) {
  const user = await requireUser();
  const { id, characterId, ...changes } = await parseBody(request, itemUpdateSchema);
  const item = await loadItemForWrite(user, id);

  const moving = characterId !== undefined && characterId !== item.characterId;
  if (moving) await assertCanMoveTo(user, characterId); // Usado na mecânica de trocas (só o GM)

  const updated = await modelCall(() => updateItem(prisma, id, { ...changes, ...(moving && { characterId }) }));
  if (!updated) throw notFound('Item não encontrado.');

  invalidateCharacter(item.characterId);
  if (moving) invalidateCharacter(characterId);
  return NextResponse.json(updated);
});

export const DELETE = withTelemetry(async function DELETE(request: Request) {
  const user = await requireUser();
  const { id } = parseQuery(request, idQuerySchema);
  const item = await loadItemForWrite(user, id);

  await deleteItem(prisma, id);

  invalidateCharacter(item.characterId);
  return NextResponse.json({ success: true });
});
