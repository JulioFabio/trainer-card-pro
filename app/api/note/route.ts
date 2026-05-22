import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    console.error('Erro no POST de Note:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
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
  } catch (error) {
    console.error('Erro no PUT de Note:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID da nota é obrigatório' }, { status: 400 });
  }

  try {
    await prisma.note.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no DELETE de Note:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
