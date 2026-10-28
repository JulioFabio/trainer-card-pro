import type { Prisma, PrismaClient } from '@prisma/client';
import type { TrainerData } from '@/types';
import {
  assembleSheet,
  canonicalJson,
  decomposeSheet,
  fromPokemonRow,
  hasLegacyLists,
  type BoxRow,
  type DecomposedSheet,
  type ItemRow,
  type PokemonRow,
  type SheetRows,
  type TalentRow,
} from './mapper.ts';
import { resolvePokemonPhotos, type DetectImageType, type PhotoStore } from './photos.ts';

// Gravação e leitura da ficha nas tabelas. Recebe o cliente do Prisma e o armazenamento de
// fotos por argumento; não importa '@/...' (só tipos) para rodar também no seed.

export interface StoreDeps {
  prisma: PrismaClient;
  photos: { store: PhotoStore; detectImageType: DetectImageType; maxBytes: number };
}

type Tx = Prisma.TransactionClient;

const TRANSACTION = { timeout: 20_000, maxWait: 10_000 } as const;
const pokemonInclude = { types: true, abilities: true, moves: true, capabilities: true, stats: true } as const;

// ── Conversão linha -> dados do Prisma ────────────────────────────────

function pokemonColumns(row: PokemonRow) {
  const { types: _t, abilities: _a, moves: _m, capabilities: _c, stats: _s, ...columns } = row;
  void [_t, _a, _m, _c, _s];
  return columns;
}

function pokemonChildren(row: PokemonRow) {
  return {
    types: { create: row.types },
    abilities: { create: row.abilities },
    moves: { create: row.moves },
    capabilities: { create: row.capabilities },
    stats: { create: row.stats },
  };
}

const replaceChildren = (row: PokemonRow) => ({
  types: { deleteMany: {}, create: row.types },
  abilities: { deleteMany: {}, create: row.abilities },
  moves: { deleteMany: {}, create: row.moves },
  capabilities: { deleteMany: {}, create: row.capabilities },
  stats: { deleteMany: {}, create: row.stats },
});

// Forma comparável de cada registro: o que o front vê, mais as posições.
const pokemonKey = (row: PokemonRow) =>
  canonicalJson({ ...fromPokemonRow(row), boxNumber: row.boxNumber, partySlot: row.partySlot });

const itemKey = (row: ItemRow) =>
  canonicalJson({
    ref: row.ref,
    position: row.position,
    name: row.name,
    description: row.description,
    quantity: row.quantity,
    imageUrl: row.imageUrl,
  });

const talentKey = (row: TalentRow) =>
  canonicalJson({ position: row.position, name: row.name, description: row.description });

// ── Leitura ───────────────────────────────────────────────────────────

async function loadRows(db: Tx | PrismaClient, characterId: string): Promise<SheetRows> {
  const [pokemons, items, talents, boxes] = await Promise.all([
    db.pokemon.findMany({ where: { characterId }, include: pokemonInclude }),
    db.item.findMany({ where: { characterId } }),
    db.talent.findMany({ where: { characterId } }),
    db.pcBox.findMany({ where: { characterId } }),
  ]);
  return { pokemons, items, talents, boxes };
}

function parseStoredSheet(raw: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Lê a ficha no formato do front. Migra antes, se o `sheetData` ainda for do formato antigo. */
export async function loadCharacterSheet(deps: StoreDeps, characterId: string): Promise<TrainerData | null> {
  await migrateIfLegacy(deps, characterId);
  const character = await deps.prisma.character.findUnique({ where: { id: characterId }, select: { sheetData: true } });
  if (!character) return null;
  const rows = await loadRows(deps.prisma, characterId);
  return assembleSheet(parseStoredSheet(character.sheetData), rows);
}

/** Decompõe nas tabelas uma ficha antiga (listas dentro do `sheetData`). Idempotente. */
export async function migrateIfLegacy(deps: StoreDeps, characterId: string): Promise<boolean> {
  const character = await deps.prisma.character.findUnique({ where: { id: characterId }, select: { sheetData: true } });
  if (!character) return false;
  const stored = parseStoredSheet(character.sheetData);
  if (!hasLegacyLists(stored)) return false;

  try {
    await saveCharacterSheet(deps, characterId, stored);
    return true;
  } catch (error) {
    // Outra leitura pode ter migrado ao mesmo tempo: se não há mais nada a migrar, está feito.
    const again = await deps.prisma.character.findUnique({ where: { id: characterId }, select: { sheetData: true } });
    if (again && !hasLegacyLists(parseStoredSheet(again.sheetData))) return false;
    throw error;
  }
}

// ── Gravação ──────────────────────────────────────────────────────────

/**
 * Grava a ficha: valida, resolve as fotos fora da transação e então, numa única transação,
 * escreve só o que mudou (comparando por `ref`).
 */
export async function saveCharacterSheet(
  deps: StoreDeps,
  characterId: string,
  sheet: Record<string, unknown>
): Promise<void> {
  const next = decomposeSheet(sheet);
  await resolvePokemonPhotos(next.pokemons, { characterId, ...deps.photos });

  await deps.prisma.$transaction(async (tx) => {
    const current = await loadRows(tx, characterId);
    if (next.touches.pokemons) await syncPokemons(tx, characterId, current.pokemons, next.pokemons);
    if (next.touches.items) await syncItems(tx, characterId, current.items, next.items);
    if (next.touches.talents) await syncTalents(tx, characterId, current.talents, next.talents);
    if (next.touches.pokemons) await syncBoxes(tx, characterId, current.boxes, next.boxes);
    await syncSheetData(tx, characterId, next);
  }, TRANSACTION);
}

async function syncPokemons(tx: Tx, characterId: string, current: PokemonRow[], next: PokemonRow[]) {
  const currentByRef = new Map(current.map((row) => [row.ref, row]));
  const nextRefs = new Set(next.map((row) => row.ref));

  const removed = current.filter((row) => !nextRefs.has(row.ref));
  if (removed.length > 0) {
    await tx.pokemon.deleteMany({ where: { characterId, ref: { in: removed.map((row) => row.ref) } } });
  }

  const created: PokemonRow[] = [];
  const changed: PokemonRow[] = [];
  for (const row of next) {
    const existing = currentByRef.get(row.ref);
    if (!existing) created.push(row);
    else if (pokemonKey(existing) !== pokemonKey(row)) changed.push(row);
  }

  // Dois Pokémon podem trocar de posição na mesma gravação. Antes de escrever, os que mudam
  // saem para posições temporárias (caixa 0), para as restrições de unicidade não atrapalharem.
  for (const [index, row] of changed.entries()) {
    await tx.pokemon.update({
      where: { characterId_ref: { characterId, ref: row.ref } },
      data: { boxNumber: 0, slot: index, partySlot: null },
    });
  }
  for (const row of changed) {
    await tx.pokemon.update({
      where: { characterId_ref: { characterId, ref: row.ref } },
      data: { ...pokemonColumns(row), ...replaceChildren(row) },
    });
  }
  for (const row of created) {
    await tx.pokemon.create({ data: { ...pokemonColumns(row), ...pokemonChildren(row), characterId } });
  }
}

async function syncItems(tx: Tx, characterId: string, current: ItemRow[], next: ItemRow[]) {
  const currentByRef = new Map(current.map((row) => [row.ref, row]));
  const nextRefs = new Set(next.map((row) => row.ref));

  const removed = current.filter((row) => !nextRefs.has(row.ref));
  if (removed.length > 0) {
    await tx.item.deleteMany({ where: { characterId, ref: { in: removed.map((row) => row.ref) } } });
  }
  for (const row of next) {
    const existing = currentByRef.get(row.ref);
    if (!existing) {
      await tx.item.create({ data: { ...row, characterId } });
    } else if (itemKey(existing) !== itemKey(row)) {
      await tx.item.update({ where: { characterId_ref: { characterId, ref: row.ref } }, data: row });
    }
  }
}

async function syncTalents(tx: Tx, characterId: string, current: TalentRow[], next: TalentRow[]) {
  const sorted = [...current].sort((a, b) => a.position - b.position);
  // Talentos não têm identidade: comparam-se pela posição.
  for (const row of next) {
    const existing = sorted[row.position];
    if (!existing) {
      await tx.talent.create({ data: { ...row, characterId } });
    } else if (talentKey(existing) !== talentKey(row)) {
      await tx.talent.updateMany({ where: { characterId, position: row.position }, data: row });
    }
  }
  if (sorted.length > next.length) {
    await tx.talent.deleteMany({ where: { characterId, position: { gte: next.length } } });
  }
}

async function syncBoxes(tx: Tx, characterId: string, current: BoxRow[], next: BoxRow[]) {
  const currentByNumber = new Map(current.map((row) => [row.number, row]));
  const nextNumbers = new Set(next.map((row) => row.number));

  const removed = current.filter((row) => !nextNumbers.has(row.number));
  if (removed.length > 0) {
    await tx.pcBox.deleteMany({ where: { characterId, number: { in: removed.map((row) => row.number) } } });
  }
  for (const row of next) {
    const existing = currentByNumber.get(row.number);
    if (!existing) {
      await tx.pcBox.create({ data: { ...row, characterId } });
    } else if (existing.name !== row.name) {
      await tx.pcBox.update({ where: { characterId_number: { characterId, number: row.number } }, data: { name: row.name } });
    }
  }
}

async function syncSheetData(tx: Tx, characterId: string, next: DecomposedSheet) {
  const serialized = JSON.stringify(next.reduced);
  const character = await tx.character.findUnique({ where: { id: characterId }, select: { sheetData: true } });
  if (character && character.sheetData !== serialized) {
    await tx.character.update({ where: { id: characterId }, data: { sheetData: serialized } });
  }
}
