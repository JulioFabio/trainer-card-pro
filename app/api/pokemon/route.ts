import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nickname, species, isParty, boxName, imageUrl, pokemonData, characterId } = body;

    if (!nickname || !species || !characterId) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const newPokemon = await prisma.pokemon.create({
      data: {
        nickname,
        species,
        isParty: isParty || false,
        boxName,
        imageUrl,
        pokemonData: pokemonData ? JSON.stringify(pokemonData) : '{}',
        characterId,
      }
    });

    return NextResponse.json(newPokemon, { status: 201 });
  } catch (error) {
    console.error('Erro no POST de Pokemon:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nickname, species, isParty, boxName, imageUrl, pokemonData, characterId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do pokemon é obrigatório para atualização' }, { status: 400 });
    }

    const updatedPokemon = await prisma.pokemon.update({
      where: { id },
      data: {
        ...(nickname && { nickname }),
        ...(species && { species }),
        ...(isParty !== undefined && { isParty }),
        ...(boxName !== undefined && { boxName }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(pokemonData && { pokemonData: JSON.stringify(pokemonData) }),
        ...(characterId && { characterId }), // Usado na mecânica de trocas
      }
    });

    return NextResponse.json(updatedPokemon);
  } catch (error) {
    console.error('Erro no PUT de Pokemon:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID do pokemon é obrigatório' }, { status: 400 });
  }

  try {
    await prisma.pokemon.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no DELETE de Pokemon:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
