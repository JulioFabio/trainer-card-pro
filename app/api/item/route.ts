import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    console.error('Erro no POST de Item:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
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
  } catch (error) {
    console.error('Erro no PUT de Item:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID do item é obrigatório' }, { status: 400 });
  }

  try {
    await prisma.item.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no DELETE de Item:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
