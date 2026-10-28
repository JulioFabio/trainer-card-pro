import fs from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CharacterModelError } from '@/lib/characterModel/errors';
import { loadCharacterSheet, migrateIfLegacy, saveCharacterSheet } from '@/lib/characterModel/store';
import type { TrainerData } from '@/types';
import { makePokemon, makeSheet } from '../helpers/sheetFixture';
import { createTestDb, type TestDb } from '../helpers/testDb';

let db: TestDb;

beforeAll(async () => {
  db = await createTestDb();
}, 60_000);

afterAll(async () => {
  await db.cleanup();
});

const save = (id: string, sheet: TrainerData) =>
  saveCharacterSheet(db.deps, id, sheet as unknown as Record<string, unknown>);

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from('foto')]);

async function counts(characterId: string) {
  const where = { characterId };
  const pokemons = await db.prisma.pokemon.findMany({ where, select: { id: true } });
  const ids = pokemons.map((p) => p.id);
  return {
    pokemons: pokemons.length,
    moves: await db.prisma.pokemonMove.count({ where: { pokemonId: { in: ids } } }),
    abilities: await db.prisma.pokemonAbility.count({ where: { pokemonId: { in: ids } } }),
    types: await db.prisma.pokemonType.count({ where: { pokemonId: { in: ids } } }),
    stats: await db.prisma.pokemonStat.count({ where: { pokemonId: { in: ids } } }),
    items: await db.prisma.item.count({ where }),
    talents: await db.prisma.talent.count({ where }),
    boxes: await db.prisma.pcBox.count({ where }),
  };
}

describe('saveCharacterSheet', () => {
  it('salva Pokémon com tipos, golpes e habilidades ligados a ele', async () => {
    const id = await db.createCharacter();
    const sheet = makeSheet();
    sheet.pcBoxes[0].pokemons = [makePokemon('p1', 0, { types: ['ELÉTRICO', 'VOADOR'] })];
    sheet.equipe = [];
    await save(id, sheet);

    const [pokemon] = await db.prisma.pokemon.findMany({
      where: { characterId: id },
      include: { types: true, moves: true, abilities: true, stats: true, capabilities: true },
    });
    expect(pokemon.ref).toBe('p1');
    expect(pokemon.types).toHaveLength(2);
    expect(pokemon.moves).toHaveLength(2);
    expect(pokemon.abilities).toHaveLength(2);
    expect(pokemon.stats.map((s) => s.kind).sort()).toEqual(['base', 'lvl', 'total']);
    expect(pokemon.capabilities).toHaveLength(1);
  });

  it('o sheetData guardado não tem inventario, talentos, equipe nem pcBoxes', async () => {
    const id = await db.createCharacter();
    await save(id, makeSheet());
    const stored = await db.prisma.character.findUniqueOrThrow({ where: { id } });
    const data = JSON.parse(stored.sheetData) as Record<string, unknown>;
    for (const key of ['inventario', 'talentos', 'equipe', 'pcBoxes']) expect(data).not.toHaveProperty(key);
    expect(data.nomePersonagem).toBe('Túlio');
    expect(stored.sheetData).not.toContain('base64');
  });

  it('gravar a mesma ficha duas vezes não altera nenhum registro', async () => {
    const id = await db.createCharacter();
    await save(id, makeSheet());
    const before = await db.totalChanges();
    await save(id, makeSheet());
    expect(await db.totalChanges()).toBe(before);
  });

  it('um Pokémon alterado regrava só ele', async () => {
    const id = await db.createCharacter();
    await save(id, makeSheet());
    const untouched = await db.prisma.pokemon.findUniqueOrThrow({
      where: { characterId_ref: { characterId: id, ref: '1730000002000' } },
    });

    const sheet = makeSheet();
    sheet.pcBoxes[0].pokemons[0].level = 13;
    await save(id, sheet);

    const loaded = await loadCharacterSheet(db.deps, id);
    expect(loaded?.pcBoxes[0].pokemons[0].level).toBe(13);
    // O outro Pokémon continua com o mesmo registro (mesmo id do servidor e conteúdo).
    const after = await db.prisma.pokemon.findUniqueOrThrow({
      where: { characterId_ref: { characterId: id, ref: '1730000002000' } },
    });
    expect(after).toEqual(untouched);
    // O alterado mantém o id do servidor.
    expect(await db.prisma.pokemon.count({ where: { characterId: id } })).toBe(3);
  });

  it('o Pokémon que mudou de nível mantém o id do servidor', async () => {
    const id = await db.createCharacter();
    await save(id, makeSheet());
    const before = await db.prisma.pokemon.findUniqueOrThrow({
      where: { characterId_ref: { characterId: id, ref: '1730000001000' } },
    });
    const sheet = makeSheet();
    sheet.pcBoxes[0].pokemons[0].level = 40;
    await save(id, sheet);
    const after = await db.prisma.pokemon.findUniqueOrThrow({
      where: { characterId_ref: { characterId: id, ref: '1730000001000' } },
    });
    expect(after.id).toBe(before.id);
    expect(after.level).toBe(40);
  });

  it('dois Pokémon trocando de posição na mesma gravação', async () => {
    const id = await db.createCharacter();
    await save(id, makeSheet());
    const sheet = makeSheet();
    const [a, b] = sheet.pcBoxes[0].pokemons;
    [a.slot, b.slot] = [b.slot, a.slot];
    await save(id, sheet);
    const loaded = await loadCharacterSheet(db.deps, id);
    expect(loaded?.pcBoxes[0].pokemons.map((p) => p.id)).toEqual([b.id, a.id]);
  });

  it('Pokémon removido some com tudo que é ligado a ele e sai da equipe', async () => {
    const id = await db.createCharacter();
    await save(id, makeSheet());
    const sheet = makeSheet();
    sheet.pcBoxes[0].pokemons = sheet.pcBoxes[0].pokemons.filter((p) => p.id !== '1730000001000');
    await save(id, sheet);

    const loaded = await loadCharacterSheet(db.deps, id);
    expect(loaded?.equipe).toEqual(['1730000002000']);
    const c = await counts(id);
    expect(c.pokemons).toBe(2);
    expect(c.moves).toBe(4);
    expect(c.types).toBe(1 + 2);
  });

  it('falha no meio da gravação não altera nada (foto inválida)', async () => {
    const id = await db.createCharacter();
    await save(id, makeSheet());
    const before = await counts(id);
    const sheetBefore = await loadCharacterSheet(db.deps, id);

    const bad = makeSheet();
    bad.nomePersonagem = 'Mudou';
    bad.inventario.push({ id: 'novo', name: 'Novo', description: '', quantity: 1 });
    bad.pcBoxes[0].pokemons[0].imageUrl = 'data:image/png;base64,PGh0bWw+';
    await expect(save(id, bad)).rejects.toBeInstanceOf(CharacterModelError);

    expect(await counts(id)).toEqual(before);
    expect(await loadCharacterSheet(db.deps, id)).toEqual(sheetBefore);
  });

  it('ficha inexistente falha na transação e não deixa registros', async () => {
    const id = await db.createCharacter();
    const other = await db.createCharacter();
    await save(id, makeSheet());
    const before = await counts(id);
    // A chave estrangeira falha no meio da gravação (ficha que não existe).
    const sheet = makeSheet();
    sheet.nomePersonagem = 'Outro';
    sheet.inventario.push({ id: 'zzz', name: 'Z', description: '', quantity: 1 });
    await expect(save('nao-existe', sheet)).rejects.toBeDefined();
    expect(await counts(id)).toEqual(before);
    expect(await counts(other)).toMatchObject({ pokemons: 0, items: 0 });
  });

  it('apagar a ficha apaga Pokémon, golpes, habilidades, itens e talentos', async () => {
    const id = await db.createCharacter();
    await save(id, makeSheet());
    expect((await counts(id)).pokemons).toBe(3);
    await db.prisma.character.delete({ where: { id } });
    expect(await counts(id)).toEqual({
      pokemons: 0, moves: 0, abilities: 0, types: 0, stats: 0, items: 0, talents: 0, boxes: 0,
    });
    expect(await db.prisma.pokemonMove.count()).toBe(
      await db.prisma.pokemonMove.count({ where: { pokemon: { characterId: { not: id } } } })
    );
  });

  it('recusa um Pokémon com 51 golpes sem gravar nada', async () => {
    const id = await db.createCharacter();
    const sheet = makeSheet();
    const move = sheet.pcBoxes[0].pokemons[0].moves[0];
    sheet.pcBoxes[0].pokemons[0].moves = Array.from({ length: 51 }, (_, i) => ({ ...move, id: `${i}` }));
    await expect(save(id, sheet)).rejects.toBeInstanceOf(CharacterModelError);
    expect((await counts(id)).pokemons).toBe(0);
  });

  it('um sheetData sem listas não apaga o que já está guardado', async () => {
    const id = await db.createCharacter();
    await save(id, makeSheet());
    await saveCharacterSheet(db.deps, id, { nomePersonagem: 'Só o treinador' });
    const loaded = await loadCharacterSheet(db.deps, id);
    expect(loaded?.nomePersonagem).toBe('Só o treinador');
    expect(loaded?.inventario).toHaveLength(3);
    expect(loaded?.pcBoxes[0].pokemons).toHaveLength(2);
  });

  it('troca a foto em base64 por arquivo e não gera outro no salvamento seguinte', async () => {
    const id = await db.createCharacter();
    const photo = `data:image/png;base64,${PNG.toString('base64')}`;
    const sheet = makeSheet();
    sheet.pcBoxes[0].pokemons[0].imageUrl = photo;
    await save(id, sheet);

    const loaded = await loadCharacterSheet(db.deps, id);
    const url = loaded?.pcBoxes[0].pokemons[0].imageUrl;
    expect(url).toMatch(new RegExp(`^/uploads/${id}/[0-9a-f]{64}\\.png$`));
    expect(fs.readdirSync(`${db.uploadsDir}/${id}`)).toHaveLength(1);

    const again = makeSheet();
    again.pcBoxes[0].pokemons[0].imageUrl = photo;
    const before = await db.totalChanges();
    await save(id, again);
    expect(await db.totalChanges()).toBe(before);
    expect(fs.readdirSync(`${db.uploadsDir}/${id}`)).toHaveLength(1);
  });
});

describe('loadCharacterSheet e migrateIfLegacy', () => {
  it('ida e volta com equipe e PC equivalente', async () => {
    const id = await db.createCharacter();
    const sheet = makeSheet();
    await save(id, sheet);
    expect(await loadCharacterSheet(db.deps, id)).toEqual(sheet);
  });

  it('ficha nova devolve as 99 caixas vazias', async () => {
    const id = await db.createCharacter();
    const loaded = await loadCharacterSheet(db.deps, id);
    expect(loaded?.pcBoxes).toHaveLength(99);
    expect(loaded?.equipe).toEqual([]);
  });

  it('ficha inexistente devolve null', async () => {
    expect(await loadCharacterSheet(db.deps, 'nao-existe')).toBeNull();
  });

  it('migra uma ficha antiga na primeira leitura e não duplica na segunda', async () => {
    const id = await db.createCharacter();
    const legacy = makeSheet();
    legacy.pcBoxes[0].pokemons = legacy.pcBoxes[0].pokemons.slice(0, 1);
    legacy.pcBoxes[4].pokemons = [];
    legacy.equipe = [];
    legacy.pcBoxes[1].pokemons = [makePokemon('segundo', 3)];
    await db.prisma.character.update({ where: { id }, data: { sheetData: JSON.stringify(legacy) } });

    const first = await loadCharacterSheet(db.deps, id);
    expect(first).toEqual(legacy);
    const c1 = await counts(id);
    expect(c1.pokemons).toBe(2);
    expect(c1.items).toBe(3);

    const stored = await db.prisma.character.findUniqueOrThrow({ where: { id } });
    expect(JSON.parse(stored.sheetData)).not.toHaveProperty('pcBoxes');

    const second = await loadCharacterSheet(db.deps, id);
    expect(second).toEqual(legacy);
    expect(await counts(id)).toEqual(c1);
    expect(await migrateIfLegacy(db.deps, id)).toBe(false);
  });
});
