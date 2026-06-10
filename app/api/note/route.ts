import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { withTelemetry } from '../../../lib/telemetry';

export const POST = withTelemetry(async function POST(request: Request) {
  const body = await request.json();
  const { title, content, characterId } = body;

  if (!title || !characterId) {
    return NextResponse.json({ error: 'Título e characterId são obrigatórios' }, { status: 400 });
  }

  const newNote = await prisma.note.create({
    data: {
      title,
      content: content || '',
      characterId,
    }
  });

  return NextResponse.json(newNote, { status: 201 });
});

export const PUT = withTelemetry(async function PUT(request: Request) {
  const body = await request.json();
  const { id, title, content } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID da nota é obrigatório para atualização' }, { status: 400 });
  }

  const updatedNote = await prisma.note.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(content !== undefined && { content }),
    }
  });

  return NextResponse.json(updatedNote);
});

import { requireQueryParam } from '../../../lib/routeHelpers';

export const DELETE = withTelemetry(async function DELETE(request: Request) {
  const { value: id, response } = requireQueryParam(request, 'id', 'ID da nota é obrigatório');
  if (response) return response;

  await prisma.note.delete({
    where: { id: id! }
  });

  return NextResponse.json({ success: true });
});

