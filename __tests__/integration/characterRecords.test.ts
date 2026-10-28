import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CharacterModelError } from '@/lib/characterModel/errors';
import {
  createItem,
  createPokemon,
  deleteItem,
  deletePokemon,
  getItem,
  getPokemon,
  listItems,
  listPokemons,
  updateItem,
  updatePokemon,
} from '@/lib/characterModel/records';
import { loadCharacterSheet, saveCharacterSheet } from '@/lib/characterModel/store';
import { pokemonCreateSchema, pokemonUpdateSchema } from '@/lib/schemas';
import { makePokemon, makeSheet } from '../helpers/sheetFixture';
import { createTestDb, type TestDb } from '../helpers/testDb';

let db: TestDb;

beforeAll(async () => {
  db = await createTestDb();
}, 60_000);

afterAll(async () => {
  await db.cleanup();
});

const CHARACTER = '00000000-0000-4000-8000-000000000001';

// Corpo de um Pokémon na API granular (modelo completo, sem id nem characterId).
function body(overrides: Record<string, unknown> = {}) {
  const { id: _id, ...pokemon } = makePokemon('x', 0);
  void _id;
  return { ...pokemon, boxNumber: 1, partySlot: null, ...overrides };
}

const parse = (input: Record<string, unknown>) => pokemonCreateSchema.parse({ characterId: CHARACTER, ...input });
const create = (characterId: string, overrides: Record<string, unknown> = {}) => {
  const { characterId: _c, ...rest } = parse(body(overrides));
  void _c;
  return createPokemon(db.prisma, characterId, rest);
};

async function expectModelError(promise: Promise<unknown>, status: number) {
  const error = await promise.then(
    () => null,
    (e: unknown) => e
  );
  expect(error).toBeInstanceOf(CharacterModelError);
  expect((error as CharacterModelError).status).toBe(status);
}

describe('Pokémon (rotas granulares, banco real)', () => {
  it('cria um Pokémon completo e a leitura devolve o mesmo', async () => {
    const id = await db.createCharacter();
    const created = await create(id, { slot: 4, partySlot: 2 });

    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(created.ref).toMatch(/^[0-9a-f-]{36}$/); // o servidor define o ref
    expect(created.characterId).toBe(id);

    const read = await getPokemon(db.prisma, created.id);
    expect(read).toEqual(created);
    expect(read).toMatchObject({
      species: 'Pikachu', boxNumber: 1, slot: 4, partySlot: 2, level: 12,
      types: ['ELÉTRICO'], hp: { current: 30, max: 40 },
    });
    expect(read?.moves).toHaveLength(2);
    expect(read?.stats.base.saude).toBe(4);
  });

  it('lista os Pokémon da ficha em ordem de caixa e posição', async () => {
    const id = await db.createCharacter();
    await create(id, { boxNumber: 2, slot: 0 });
    await create(id, { boxNumber: 1, slot: 5 });
    await create(id, { boxNumber: 1, slot: 1 });
    const list = await listPokemons(db.prisma, id);
    expect(list.map((p) => [p.boxNumber, p.slot])).toEqual([[1, 1], [1, 5], [2, 0]]);
  });

  it('o Pokémon criado aparece na ficha completa (mesmas tabelas)', async () => {
    const id = await db.createCharacter();
    const created = await create(id, { slot: 3, boxNumber: 7, partySlot: 0 });
    const sheet = await loadCharacterSheet(db.deps, id);
    expect(sheet?.pcBoxes[6].pokemons.map((p) => p.id)).toEqual([created.ref]);
    expect(sheet?.equipe).toEqual([created.ref]);
  });

  it('posição de caixa ou de equipe ocupada: 409 e nada é gravado', async () => {
    const id = await db.createCharacter();
    await create(id, { slot: 0, partySlot: 0 });
    await expectModelError(create(id, { slot: 0 }), 409);
    await expectModelError(create(id, { slot: 1, partySlot: 0 }), 409);
    expect(await listPokemons(db.prisma, id)).toHaveLength(1);
  });

  it('atualização parcial troca só o que veio e substitui a lista inteira', async () => {
    const id = await db.createCharacter();
    const created = await create(id);
    const patch = pokemonUpdateSchema.parse({
      id: created.id,
      level: 30,
      moves: [{ ...created.moves[0], id: 'novo', name: 'Trovão' }],
    });
    const { id: _i, ...changes } = patch;
    void _i;
    const updated = await updatePokemon(db.prisma, created.id, changes);

    expect(updated?.level).toBe(30);
    expect(updated?.species).toBe('Pikachu');
    expect(updated?.moves.map((m) => m.name)).toEqual(['Trovão']);
    expect(updated?.id).toBe(created.id);
    expect(await db.prisma.pokemonMove.count({ where: { pokemonId: created.id } })).toBe(1);
  });

  it('mudar para uma posição ocupada: 409; para a própria posição: ok', async () => {
    const id = await db.createCharacter();
    const a = await create(id, { slot: 0 });
    await create(id, { slot: 1 });
    await expectModelError(updatePokemon(db.prisma, a.id, { slot: 1 }), 409);
    expect((await updatePokemon(db.prisma, a.id, { slot: 0, level: 2 }))?.level).toBe(2);
    expect((await updatePokemon(db.prisma, a.id, { slot: 9 }))?.slot).toBe(9);
  });

  it('PUT parcial aceita partySlot nulo para tirar da equipe', async () => {
    const id = await db.createCharacter();
    const a = await create(id, { slot: 0, partySlot: 1 });
    expect((await updatePokemon(db.prisma, a.id, { partySlot: null }))?.partySlot).toBeNull();
  });

  it('mover para outra ficha tira da equipe e respeita as posições de lá', async () => {
    const from = await db.createCharacter();
    const to = await db.createCharacter();
    const a = await create(from, { slot: 0, partySlot: 0 });
    await create(to, { slot: 0 });
    await expectModelError(updatePokemon(db.prisma, a.id, { characterId: to }), 409);
    const moved = await updatePokemon(db.prisma, a.id, { characterId: to, slot: 5 });
    expect(moved).toMatchObject({ characterId: to, slot: 5, partySlot: null });
    expect(await listPokemons(db.prisma, from)).toHaveLength(0);
  });

  it('Pokémon inexistente: atualização devolve null e a leitura também', async () => {
    expect(await updatePokemon(db.prisma, '00000000-0000-4000-8000-0000000000ff', { level: 2 })).toBeNull();
    expect(await getPokemon(db.prisma, '00000000-0000-4000-8000-0000000000ff')).toBeNull();
  });

  it('apagar remove o Pokémon e tudo que é ligado a ele', async () => {
    const id = await db.createCharacter();
    const a = await create(id);
    await deletePokemon(db.prisma, a.id);
    expect(await getPokemon(db.prisma, a.id)).toBeNull();
    expect(await db.prisma.pokemonMove.count({ where: { pokemonId: a.id } })).toBe(0);
    expect(await db.prisma.pokemonStat.count({ where: { pokemonId: a.id } })).toBe(0);
  });

});

describe('Itens (rotas granulares, banco real)', () => {
  it('cria, lê, lista, atualiza e apaga', async () => {
    const id = await db.createCharacter();
    const a = await createItem(db.prisma, id, { name: 'Poção', quantity: 2 });
    const b = await createItem(db.prisma, id, { name: 'Antídoto', description: 'Cura veneno' });
    expect(a.position).toBe(0);
    expect(b.position).toBe(1);
    expect(a.ref).toMatch(/^[0-9a-f-]{36}$/);
    expect(await getItem(db.prisma, a.id)).toMatchObject({ name: 'Poção', quantity: 2, description: '' });

    expect((await listItems(db.prisma, id)).map((i) => i.name)).toEqual(['Poção', 'Antídoto']);

    const updated = await updateItem(db.prisma, a.id, { quantity: 9, position: 5 });
    expect(updated).toMatchObject({ quantity: 9, position: 5, name: 'Poção' });
    expect((await listItems(db.prisma, id)).map((i) => i.name)).toEqual(['Antídoto', 'Poção']);

    await deleteItem(db.prisma, a.id);
    expect(await getItem(db.prisma, a.id)).toBeNull();
  });

  it('aparece na ficha completa e item inexistente dá null', async () => {
    const id = await db.createCharacter();
    const item = await createItem(db.prisma, id, { name: 'Mapa' });
    const sheet = await loadCharacterSheet(db.deps, id);
    expect(sheet?.inventario).toEqual([{ id: item.ref, name: 'Mapa', description: '', quantity: 1 }]);
    expect(await updateItem(db.prisma, '00000000-0000-4000-8000-0000000000ff', { quantity: 1 })).toBeNull();
  });

  it('mover para outra ficha muda o dono', async () => {
    const from = await db.createCharacter();
    const to = await db.createCharacter();
    const item = await createItem(db.prisma, from, { name: 'Bola' });
    expect(await updateItem(db.prisma, item.id, { characterId: to })).toMatchObject({ characterId: to });
    expect(await listItems(db.prisma, from)).toHaveLength(0);
  });
});
