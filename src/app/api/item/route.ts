import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withTelemetry } from '@/lib/telemetry';
import { assertCanMoveTo, loadCharacterForWrite, requireUser } from '@/lib/api/access';
import { notFound } from '@/lib/api/errors';
import { parseBody, parseQuery } from '@/lib/api/parse';
import { invalidateCharacter } from '@/lib/api/characterCache';
import { idQuerySchema, itemCreateSchema, itemUpdateSchema } from '@/lib/schemas';

// Escrita em item: só o dono da ficha ou o GM.
async function loadItemForWrite(user: Awaited<ReturnType<typeof requireUser>>, id: string) {
  const item = await prisma.item.findUnique({ where: { id }, select: { characterId: true } });
  if (!item) throw notFound('Item não encontrado.');
  await loadCharacterForWrite(user, item.characterId);
  return item;
}

export const POST = withTelemetry(async function POST(request: Request) {
  const user = await requireUser();
  const { name, description, quantity, imageUrl, characterId } = await parseBody(request, itemCreateSchema);
  await loadCharacterForWrite(user, characterId);

  const newItem = await prisma.item.create({
    data: {
      name,
      description,
      quantity: quantity !== undefined ? quantity : 1,
      imageUrl,
      characterId,
    },
  });

  invalidateCharacter(characterId);
  return NextResponse.json(newItem, { status: 201 });
});

export const PUT = withTelemetry(async function PUT(request: Request) {
  const user = await requireUser();
  const { id, name, description, quantity, imageUrl, characterId } = await parseBody(request, itemUpdateSchema);
  const item = await loadItemForWrite(user, id);

  const moving = characterId !== undefined && characterId !== item.characterId;
  if (moving) await assertCanMoveTo(user, characterId);

  const updatedItem = await prisma.item.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(quantity !== undefined && { quantity }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(moving && { characterId }), // Usado na mecânica de trocas (só o GM)
    },
  });

  invalidateCharacter(item.characterId);
  if (moving) invalidateCharacter(characterId);
  return NextResponse.json(updatedItem);
});

export const DELETE = withTelemetry(async function DELETE(request: Request) {
  const user = await requireUser();
  const { id } = parseQuery(request, idQuerySchema);
  const item = await loadItemForWrite(user, id);

  await prisma.item.delete({ where: { id } });

  invalidateCharacter(item.characterId);
  return NextResponse.json({ success: true });
});
