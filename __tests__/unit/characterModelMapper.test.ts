import { describe, expect, it } from 'vitest';
import { INITIAL_TRAINER_DATA } from '@/constants';
import { CharacterModelError } from '@/lib/characterModel/errors';
import { assembleSheet, decomposeSheet } from '@/lib/characterModel/mapper';
import type { TrainerData } from '@/types';
import { makePokemon, makeSheet } from '../helpers/sheetFixture';

const roundTrip = (sheet: TrainerData) => {
  const { reduced, touches: _touches, ...rows } = decomposeSheet(sheet as unknown as Record<string, unknown>);
  void _touches;
  return assembleSheet(reduced, rows);
};

describe('decomposeSheet / assembleSheet', () => {
  it('ficha vazia: listas vazias e 99 caixas "Box 1" a "Box 99"', () => {
    const out = roundTrip(structuredClone(INITIAL_TRAINER_DATA));
    expect(out.inventario).toEqual([]);
    expect(out.talentos).toEqual([]);
    expect(out.equipe).toEqual([]);
    expect(out.pcBoxes).toHaveLength(99);
    expect(out.pcBoxes[0]).toEqual({ id: 1, name: 'Box 1', pokemons: [] });
    expect(out.pcBoxes[98]).toEqual({ id: 99, name: 'Box 99', pokemons: [] });
  });

  it('ida e volta equivalente, com posições, caixa renomeada e ordem da equipe', () => {
    const sheet = makeSheet();
    expect(roundTrip(sheet)).toEqual(sheet);
  });

  it('guarda os ids do front como ref e a equipe os referencia', () => {
    const rows = decomposeSheet(makeSheet() as unknown as Record<string, unknown>);
    expect(rows.pokemons.map((p) => p.ref).sort()).toEqual(['1730000001000', '1730000002000', '1730000003000']);
    expect(rows.items.map((i) => i.ref)).toEqual(['1730000000001', '1730000000002', '1730000000003']);
    const party = rows.pokemons.filter((p) => p.partySlot !== null).sort((a, b) => a.partySlot! - b.partySlot!);
    expect(party.map((p) => p.ref)).toEqual(['1730000002000', '1730000001000']);
    expect(roundTrip(makeSheet()).equipe).toEqual(['1730000002000', '1730000001000']);
  });

  it('só caixas com nome diferente do padrão viram linha', () => {
    const rows = decomposeSheet(makeSheet() as unknown as Record<string, unknown>);
    expect(rows.boxes).toEqual([{ number: 5, name: 'Raros' }]);
  });

  it('o sheetData reduzido não tem inventario, talentos, equipe nem pcBoxes', () => {
    const { reduced } = decomposeSheet(makeSheet() as unknown as Record<string, unknown>);
    expect(Object.keys(reduced)).not.toEqual(expect.arrayContaining(['inventario']));
    for (const key of ['inventario', 'talentos', 'equipe', 'pcBoxes']) expect(reduced).not.toHaveProperty(key);
    expect(reduced.nomePersonagem).toBe('Túlio');
    expect(reduced.hpActual).toBe(20);
  });

  it('lista ausente significa "não mexer"', () => {
    const only = decomposeSheet({ nomePersonagem: 'X' });
    expect(only.touches).toEqual({ pokemons: false, items: false, talents: false });
    expect(decomposeSheet(makeSheet() as unknown as Record<string, unknown>).touches).toEqual({
      pokemons: true,
      items: true,
      talents: true,
    });
  });

  it('ordena os Pokémon da caixa pela posição, não pela ordem recebida', () => {
    const sheet = makeSheet();
    sheet.pcBoxes[0].pokemons.reverse();
    const out = roundTrip(sheet);
    expect(out.pcBoxes[0].pokemons.map((p) => p.slot)).toEqual([0, 7]);
  });

  it('golpe sem id recebe o índice como ref', () => {
    const sheet = makeSheet();
    sheet.pcBoxes[0].pokemons[0].moves[1].id = '';
    const out = roundTrip(sheet);
    expect(out.pcBoxes[0].pokemons[0].moves[1].id).toBe('1');
  });

  it('descarta ids da equipe que não existem e repetições', () => {
    const sheet = makeSheet();
    sheet.equipe = ['999', '1730000001000', '1730000001000', '1730000003000'];
    expect(roundTrip(sheet).equipe).toEqual(['1730000001000', '1730000003000']);
  });

  it('recusa duas posições iguais na mesma caixa', () => {
    const sheet = makeSheet();
    sheet.pcBoxes[0].pokemons[1].slot = 0;
    expect(() => roundTrip(sheet)).toThrow(CharacterModelError);
  });

  it('recusa equipe com sete Pokémon', () => {
    const sheet = makeSheet();
    sheet.pcBoxes[1].pokemons = Array.from({ length: 7 }, (_, i) => makePokemon(`20${i}`, i));
    sheet.equipe = sheet.pcBoxes[1].pokemons.map((p) => p.id);
    expect(() => roundTrip(sheet)).toThrow(/equipe/);
  });

  it('recusa itens com o mesmo ref e Pokémon com o mesmo ref', () => {
    const sheet = makeSheet();
    sheet.inventario[1].id = sheet.inventario[0].id;
    expect(() => roundTrip(sheet)).toThrow(/repetido/);

    const other = makeSheet();
    other.pcBoxes[1].pokemons = [makePokemon('1730000001000', 0)];
    expect(() => roundTrip(other)).toThrow(/repetido/);
  });

  it('recusa ref com caracteres inválidos', () => {
    const sheet = makeSheet();
    sheet.inventario[0].id = '../x';
    expect(() => roundTrip(sheet)).toThrow(CharacterModelError);
  });

  it('recusa os limites de itens e talentos', () => {
    const sheet = makeSheet();
    sheet.inventario = Array.from({ length: 501 }, (_, i) => ({ id: `i${i}`, name: 'x', description: '', quantity: 1 }));
    expect(() => roundTrip(sheet)).toThrow(/itens/);
    const talents = makeSheet();
    talents.talentos = Array.from({ length: 201 }, () => ({ name: 'x', description: '' }));
    expect(() => roundTrip(talents)).toThrow(/talentos/);
  });
});
