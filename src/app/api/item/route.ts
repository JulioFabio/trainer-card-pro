import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { withTelemetry } from '../../../lib/telemetry';

export const POST = withTelemetry(async function POST(request: Request) {
  const body = await request.json();
  const { name, description, quantity, imageUrl, characterId } = body;

  if (!name || !characterId) {
    return NextResponse.json({ error: 'Nome e characterId são obrigatórios' }, { status: 400 });
  }

  const newItem = await prisma.item.create({
    data: {
      name,
      description,
      quantity: quantity !== undefined ? quantity : 1,
      imageUrl,
      characterId,
    }
  });

  return NextResponse.json(newItem, { status: 201 });
});

export const PUT = withTelemetry(async function PUT(request: Request) {
  const body = await request.json();
  const { id, name, description, quantity, imageUrl, characterId } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID do item é obrigatório para atualização' }, { status: 400 });
  }

  const updatedItem = await prisma.item.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(quantity !== undefined && { quantity }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(characterId && { characterId }), // Usado na mecânica de trocas
    }
  });

  return NextResponse.json(updatedItem);
});

import { requireQueryParam } from '../../../lib/routeHelpers';

export const DELETE = withTelemetry(async function DELETE(request: Request) {
  const { value: id, response } = requireQueryParam(request, 'id', 'ID do item é obrigatório');
  if (response) return response;

  await prisma.item.delete({
    where: { id: id! }
  });

  return NextResponse.json({ success: true });
});

