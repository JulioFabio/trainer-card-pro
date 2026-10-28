import { randomUUID } from 'node:crypto';
import type { Prisma, PrismaClient } from '@prisma/client';
import type { StoredPokemon } from '@/types';
import { CharacterModelError } from './errors.ts';
import { fromPokemonRow, toPokemonRow, type ItemRow, type PokemonRow } from './mapper.ts';
import { MODEL_LIMITS, type PokemonRecordInput, type StoredPokemonInput } from './schemas.ts';

// Operações por Pokémon e por item (rotas granulares). Mesmo modelo das tabelas que a ficha
// completa usa, então os dois caminhos nunca divergem. Sem '@/...' além de tipos.

type Db = PrismaClient | Prisma.TransactionClient;

const pokemonInclude = { types: true, abilities: true, moves: true, capabilities: true, stats: true } as const;
const TRANSACTION = { timeout: 20_000, maxWait: 10_000 } as const;

// ── Pokémon ───────────────────────────────────────────────────────────

/** O Pokémon como a API granular o devolve: `id` é o do servidor, `ref` o que o front usa. */
export type PokemonDto = Omit<StoredPokemon, 'id'> & {
  id: string;
  ref: string;
  characterId: string;
  boxNumber: number;
  partySlot: number | null;
};

type PokemonRecord = PokemonRow & { id: string; characterId: string };

function toPokemonDto(row: PokemonRecord): PokemonDto {
  const { id: ref, ...pokemon } = fromPokemonRow(row);
  return { ...pokemon, id: row.id, ref, characterId: row.characterId, boxNumber: row.boxNumber, partySlot: row.partySlot };
}

const pokemonColumns = (row: PokemonRow) => {
  const { types: _t, abilities: _a, moves: _m, capabilities: _c, stats: _s, ...columns } = row;
  void [_t, _a, _m, _c, _s];
  return columns;
};

export async function listPokemons(db: Db, characterId: string): Promise<PokemonDto[]> {
  const rows = await db.pokemon.findMany({
    where: { characterId },
    include: pokemonInclude,
    orderBy: [{ boxNumber: 'asc' }, { slot: 'asc' }],
  });
  return rows.map(toPokemonDto);
}

export async function getPokemon(db: Db, id: string): Promise<PokemonDto | null> {
  const row = await db.pokemon.findUnique({ where: { id }, include: pokemonInclude });
  return row ? toPokemonDto(row) : null;
}

// Posição de caixa ou de equipe já ocupada por outro Pokémon da ficha é conflito (409).
async function assertPositionsFree(db: Db, characterId: string, row: PokemonRow) {
  const positions: Prisma.PokemonWhereInput[] = [{ boxNumber: row.boxNumber, slot: row.slot }];
  if (row.partySlot !== null) positions.push({ partySlot: row.partySlot });
  const clash = await db.pokemon.findFirst({
    where: { characterId, NOT: { ref: row.ref }, OR: positions },
    select: { boxNumber: true, slot: true },
  });
  if (!clash) return;
  const sameBox = clash.boxNumber === row.boxNumber && clash.slot === row.slot;
  throw new CharacterModelError(
    sameBox ? 'Essa posição da caixa já está ocupada.' : 'Essa posição da equipe já está ocupada.',
    409
  );
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002';
}

function conflict(): never {
  throw new CharacterModelError('Já existe um registro com esse identificador ou essa posição.', 409);
}

export async function createPokemon(
  db: PrismaClient,
  characterId: string,
  body: PokemonRecordInput
): Promise<PokemonDto> {
  const { boxNumber, partySlot, ...core } = body;
  const row = toPokemonRow({ ...core, id: randomUUID() } as StoredPokemonInput, boxNumber, partySlot ?? null);

  try {
    const created = await db.$transaction(async (tx) => {
      const total = await tx.pokemon.count({ where: { characterId } });
      if (total >= MODEL_LIMITS.pokemonPerCharacter) {
        throw new CharacterModelError(`No máximo ${MODEL_LIMITS.pokemonPerCharacter} Pokémon por ficha.`);
      }
      await assertPositionsFree(tx, characterId, row);
      return tx.pokemon.create({
        data: {
          ...pokemonColumns(row),
          characterId,
          types: { create: row.types },
          abilities: { create: row.abilities },
          moves: { create: row.moves },
          capabilities: { create: row.capabilities },
          stats: { create: row.stats },
        },
        include: pokemonInclude,
      });
    }, TRANSACTION);
    return toPokemonDto(created);
  } catch (error) {
    if (isUniqueViolation(error)) conflict();
    throw error;
  }
}

export type PokemonPatch = Partial<PokemonRecordInput> & { characterId?: string };

/** Atualização parcial: o que vem substitui o campo inteiro (listas aninhadas incluídas). */
export async function updatePokemon(db: PrismaClient, id: string, patch: PokemonPatch): Promise<PokemonDto | null> {
  const { boxNumber, partySlot, characterId, ...changes } = patch;

  try {
    const updated = await db.$transaction(async (tx) => {
      const current = await tx.pokemon.findUnique({ where: { id }, include: pokemonInclude });
      if (!current) return null;

      const moving = characterId !== undefined && characterId !== current.characterId;
      const targetCharacter = moving ? characterId : current.characterId;
      const merged = { ...fromPokemonRow(current), ...changes } as StoredPokemonInput;
      const row = toPokemonRow(
        merged,
        boxNumber ?? current.boxNumber,
        // Ao mudar de ficha, o Pokémon sai da equipe, a não ser que a requisição diga outra coisa.
        partySlot !== undefined ? partySlot : moving ? null : current.partySlot
      );

      await assertPositionsFree(tx, targetCharacter, row);
      return tx.pokemon.update({
        where: { id },
        data: {
          ...pokemonColumns(row),
          characterId: targetCharacter,
          types: { deleteMany: {}, create: row.types },
          abilities: { deleteMany: {}, create: row.abilities },
          moves: { deleteMany: {}, create: row.moves },
          capabilities: { deleteMany: {}, create: row.capabilities },
          stats: { deleteMany: {}, create: row.stats },
        },
        include: pokemonInclude,
      });
    }, TRANSACTION);
    return updated ? toPokemonDto(updated) : null;
  } catch (error) {
    if (isUniqueViolation(error)) conflict();
    throw error;
  }
}

export async function deletePokemon(db: Db, id: string): Promise<void> {
  await db.pokemon.delete({ where: { id } });
}

// ── Itens ─────────────────────────────────────────────────────────────

export interface ItemDto extends ItemRow {
  id: string;
  characterId: string;
  imageUrl: string | null;
}

export interface ItemInput {
  name: string;
  description?: string | null;
  quantity?: number;
  imageUrl?: string | null;
  position?: number;
}

export async function listItems(db: Db, characterId: string): Promise<ItemDto[]> {
  return db.item.findMany({ where: { characterId }, orderBy: { position: 'asc' } });
}

export async function getItem(db: Db, id: string): Promise<ItemDto | null> {
  return db.item.findUnique({ where: { id } });
}

export async function createItem(db: PrismaClient, characterId: string, body: ItemInput): Promise<ItemDto> {
  try {
    return await db.$transaction(async (tx) => {
      const total = await tx.item.count({ where: { characterId } });
      if (total >= MODEL_LIMITS.itemsPerCharacter) {
        throw new CharacterModelError(`No máximo ${MODEL_LIMITS.itemsPerCharacter} itens por ficha.`);
      }
      const last = await tx.item.aggregate({ where: { characterId }, _max: { position: true } });
      return tx.item.create({
        data: {
          characterId,
          ref: randomUUID(),
          position: body.position ?? (last._max.position ?? -1) + 1,
          name: body.name,
          description: body.description ?? '',
          quantity: body.quantity ?? 1,
          imageUrl: body.imageUrl ?? null,
        },
      });
    }, TRANSACTION);
  } catch (error) {
    if (isUniqueViolation(error)) conflict();
    throw error;
  }
}

export type ItemPatch = Partial<ItemInput> & { characterId?: string };

export async function updateItem(db: PrismaClient, id: string, patch: ItemPatch): Promise<ItemDto | null> {
  const current = await db.item.findUnique({ where: { id } });
  if (!current) return null;

  try {
    return await db.$transaction(async (tx) => {
      const moving = patch.characterId !== undefined && patch.characterId !== current.characterId;
      if (moving) {
        const total = await tx.item.count({ where: { characterId: patch.characterId } });
        if (total >= MODEL_LIMITS.itemsPerCharacter) {
          throw new CharacterModelError(`No máximo ${MODEL_LIMITS.itemsPerCharacter} itens por ficha.`);
        }
      }
      return tx.item.update({
        where: { id },
        data: {
          ...(patch.name !== undefined && { name: patch.name }),
          ...(patch.description !== undefined && { description: patch.description ?? '' }),
          ...(patch.quantity !== undefined && { quantity: patch.quantity }),
          ...(patch.imageUrl !== undefined && { imageUrl: patch.imageUrl }),
          ...(patch.position !== undefined && { position: patch.position }),
          ...(moving && { characterId: patch.characterId }),
        },
      });
    }, TRANSACTION);
  } catch (error) {
    if (isUniqueViolation(error)) conflict();
    throw error;
  }
}

export async function deleteItem(db: Db, id: string): Promise<void> {
  await db.item.delete({ where: { id } });
}
