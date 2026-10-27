import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { withTelemetry } from '../../../lib/telemetry';

export const POST = withTelemetry(async function POST(request: Request) {
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
});

export const PUT = withTelemetry(async function PUT(request: Request) {
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
});

import { requireQueryParam } from '../../../lib/routeHelpers';

export const DELETE = withTelemetry(async function DELETE(request: Request) {
  const { value: id, response } = requireQueryParam(request, 'id', 'ID do pokemon é obrigatório');
  if (response) return response;

  await prisma.pokemon.delete({
    where: { id: id! }
  });

  return NextResponse.json({ success: true });
});

