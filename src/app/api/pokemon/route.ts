import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withTelemetry } from '@/lib/telemetry';
import { assertCanMoveTo, loadCharacterForWrite, requireUser } from '@/lib/api/access';
import { notFound } from '@/lib/api/errors';
import { parseBody, parseQuery } from '@/lib/api/parse';
import { invalidateCharacter } from '@/lib/api/characterCache';
import { idQuerySchema, pokemonCreateSchema, pokemonUpdateSchema } from '@/lib/schemas';

// Escrita em Pokémon: só o dono da ficha ou o GM.
async function loadPokemonForWrite(user: Awaited<ReturnType<typeof requireUser>>, id: string) {
  const pokemon = await prisma.pokemon.findUnique({ where: { id }, select: { characterId: true } });
  if (!pokemon) throw notFound('Pokémon não encontrado.');
  await loadCharacterForWrite(user, pokemon.characterId);
  return pokemon;
}

export const POST = withTelemetry(async function POST(request: Request) {
  const user = await requireUser();
  const { nickname, species, isParty, boxName, imageUrl, pokemonData, characterId } = await parseBody(
    request,
    pokemonCreateSchema
  );
  await loadCharacterForWrite(user, characterId);

  const newPokemon = await prisma.pokemon.create({
    data: {
      nickname,
      species,
      isParty: isParty || false,
      boxName,
      imageUrl,
      pokemonData: pokemonData ? JSON.stringify(pokemonData) : '{}',
      characterId,
    },
  });

  invalidateCharacter(characterId);
  return NextResponse.json(newPokemon, { status: 201 });
});

export const PUT = withTelemetry(async function PUT(request: Request) {
  const user = await requireUser();
  const { id, nickname, species, isParty, boxName, imageUrl, pokemonData, characterId } = await parseBody(
    request,
    pokemonUpdateSchema
  );
  const pokemon = await loadPokemonForWrite(user, id);

  const moving = characterId !== undefined && characterId !== pokemon.characterId;
  if (moving) await assertCanMoveTo(user, characterId);

  const updatedPokemon = await prisma.pokemon.update({
    where: { id },
    data: {
      ...(nickname && { nickname }),
      ...(species && { species }),
      ...(isParty !== undefined && { isParty }),
      ...(boxName !== undefined && { boxName }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(pokemonData && { pokemonData: JSON.stringify(pokemonData) }),
      ...(moving && { characterId }), // Usado na mecânica de trocas (só o GM)
    },
  });

  invalidateCharacter(pokemon.characterId);
  if (moving) invalidateCharacter(characterId);
  return NextResponse.json(updatedPokemon);
});

export const DELETE = withTelemetry(async function DELETE(request: Request) {
  const user = await requireUser();
  const { id } = parseQuery(request, idQuerySchema);
  const pokemon = await loadPokemonForWrite(user, id);

  await prisma.pokemon.delete({ where: { id } });

  invalidateCharacter(pokemon.characterId);
  return NextResponse.json({ success: true });
});
