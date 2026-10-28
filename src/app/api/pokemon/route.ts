import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withTelemetry } from '@/lib/telemetry';
import { assertCanMoveTo, loadCharacterForWrite, requireUser } from '@/lib/api/access';
import { notFound } from '@/lib/api/errors';
import { parseBody, parseQuery } from '@/lib/api/parse';
import { invalidateCharacter } from '@/lib/api/characterCache';
import { modelCall, modelDeps } from '@/lib/api/characterModel';
import { idQuerySchema, pokemonCreateSchema, pokemonUpdateSchema, recordQuerySchema } from '@/lib/schemas';
import { migrateIfLegacy } from '@/lib/characterModel/store';
import {
  createPokemon,
  deletePokemon,
  getPokemon,
  listPokemons,
  updatePokemon,
} from '@/lib/characterModel/records';

// Escrita em Pokémon: só o dono da ficha ou o GM.
async function loadPokemonForWrite(user: Awaited<ReturnType<typeof requireUser>>, id: string) {
  const pokemon = await prisma.pokemon.findUnique({ where: { id }, select: { characterId: true } });
  if (!pokemon) throw notFound('Pokémon não encontrado.');
  await loadCharacterForWrite(user, pokemon.characterId);
  return pokemon;
}

// GET: leitura aberta a qualquer usuário logado, com o modelo completo.
//   ?characterId=<uuid>  todos os Pokémon da ficha
//   ?id=<uuid>           um Pokémon
export const GET = withTelemetry(async function GET(request: Request) {
  await requireUser();
  const { id, characterId } = parseQuery(request, recordQuerySchema);

  if (id) {
    const pokemon = await getPokemon(prisma, id);
    if (!pokemon) throw notFound('Pokémon não encontrado.');
    return NextResponse.json(pokemon);
  }

  const character = await prisma.character.findUnique({ where: { id: characterId! }, select: { id: true } });
  if (!character) throw notFound('Personagem não encontrado.');
  await modelCall(() => migrateIfLegacy(modelDeps(), character.id));
  return NextResponse.json(await listPokemons(prisma, character.id));
});

export const POST = withTelemetry(async function POST(request: Request) {
  const user = await requireUser();
  const { characterId, ...body } = await parseBody(request, pokemonCreateSchema);
  await loadCharacterForWrite(user, characterId);

  const created = await modelCall(() => createPokemon(prisma, characterId, body));

  invalidateCharacter(characterId);
  return NextResponse.json(created, { status: 201 });
});

export const PUT = withTelemetry(async function PUT(request: Request) {
  const user = await requireUser();
  const { id, characterId, ...changes } = await parseBody(request, pokemonUpdateSchema);
  const pokemon = await loadPokemonForWrite(user, id);

  const moving = characterId !== undefined && characterId !== pokemon.characterId;
  if (moving) await assertCanMoveTo(user, characterId); // Usado na mecânica de trocas (só o GM)

  const updated = await modelCall(() => updatePokemon(prisma, id, { ...changes, ...(moving && { characterId }) }));
  if (!updated) throw notFound('Pokémon não encontrado.');

  invalidateCharacter(pokemon.characterId);
  if (moving) invalidateCharacter(characterId);
  return NextResponse.json(updated);
});

export const DELETE = withTelemetry(async function DELETE(request: Request) {
  const user = await requireUser();
  const { id } = parseQuery(request, idQuerySchema);
  const pokemon = await loadPokemonForWrite(user, id);

  await deletePokemon(prisma, id);

  invalidateCharacter(pokemon.characterId);
  return NextResponse.json({ success: true });
});
