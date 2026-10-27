import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withTelemetry } from '@/lib/telemetry';
import { loadCharacterForWrite, requireUser } from '@/lib/api/access';
import { notFound } from '@/lib/api/errors';
import { parseBody, parseQuery } from '@/lib/api/parse';
import { invalidateCharacter } from '@/lib/api/characterCache';
import { idQuerySchema, noteCreateSchema, noteUpdateSchema } from '@/lib/schemas';

// Escrita em nota: só o dono da ficha ou o GM (a leitura vem junto com a ficha).
async function loadNoteForWrite(user: Awaited<ReturnType<typeof requireUser>>, id: string) {
  const note = await prisma.note.findUnique({ where: { id }, select: { characterId: true } });
  if (!note) throw notFound('Nota não encontrada.');
  await loadCharacterForWrite(user, note.characterId);
  return note;
}

export const POST = withTelemetry(async function POST(request: Request) {
  const user = await requireUser();
  const { title, content, characterId } = await parseBody(request, noteCreateSchema);
  await loadCharacterForWrite(user, characterId);

  const newNote = await prisma.note.create({
    data: { title, content: content || '', characterId },
  });

  invalidateCharacter(characterId);
  return NextResponse.json(newNote, { status: 201 });
});

export const PUT = withTelemetry(async function PUT(request: Request) {
  const user = await requireUser();
  const { id, title, content } = await parseBody(request, noteUpdateSchema);
  const note = await loadNoteForWrite(user, id);

  const updatedNote = await prisma.note.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(content !== undefined && { content }),
    },
  });

  invalidateCharacter(note.characterId);
  return NextResponse.json(updatedNote);
});

export const DELETE = withTelemetry(async function DELETE(request: Request) {
  const user = await requireUser();
  const { id } = parseQuery(request, idQuerySchema);
  const note = await loadNoteForWrite(user, id);

  await prisma.note.delete({ where: { id } });

  invalidateCharacter(note.characterId);
  return NextResponse.json({ success: true });
});
