import { describe, expect, it } from 'vitest';
import { INITIAL_TRAINER_DATA } from '@/constants';
import {
  itemSchema,
  pcBoxSchema,
  pokemonRecordSchema,
  storedPokemonSchema,
  talentSchema,
} from '@/lib/characterModel/schemas';

const stats = { saude: 5, ataque: 4, defesa: 3, atqEspecial: 2, defEspecial: 1, velocidade: 6 };

function pokemonBody(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Fofo',
    species: 'Pikachu',
    level: 12,
    gender: 'M',
    types: ['ELÉTRICO'],
    ball: 'Poke Ball',
    nature: 'Alegre',
    natureFeatures: '+2 Vel -2 Def',
    elementalDamageBonus: 0,
    capabilityTrait: { name: 'Faísca', description: 'Gera eletricidade' },
    abilities: [{ name: 'Estática', description: 'Paralisa ao toque' }],
    stats: { ...stats, base: stats, lvl: { ...stats, saude: 0 } },
    hp: { current: 30, max: 40 },
    evasions: { fisica: 1, especial: 2, veloz: 3 },
    movements: { terrestre: 5, voo: 0, natacao: 2, subaquatico: 0, escavacao: 0 },
    capabilities: {
      force: { value: 1, description: 'Levantar 5kg' },
      intelligence: { value: 2, description: '' },
      jump: { value: 1, description: '' },
      other: [{ name: 'Naturewalk', value: 'Floresta' }],
    },
    moves: [
      {
        id: '0',
        name: 'Choque do Trovão',
        type: 'ELÉTRICO',
        category: 'Especial',
        frequency: 'À Vontade',
        range: 'À Distância 6',
        damage: '2d8+6',
        accuracy: '2',
        descriptor: '',
        description: 'Pode paralisar',
      },
    ],
    ...overrides,
  };
}

const recordBody = (overrides: Record<string, unknown> = {}) =>
  pokemonBody({ boxNumber: 1, slot: 0, ...overrides });

describe('pokemonRecordSchema (estrito)', () => {
  it('aceita um Pokémon completo válido', () => {
    expect(pokemonRecordSchema.safeParse(recordBody()).success).toBe(true);
  });

  it('recusa golpe com categoria inválida citando o campo', () => {
    const body = recordBody({
      moves: [{ ...pokemonBody().moves[0], category: 'Mágico' }],
    });
    const result = pokemonRecordSchema.safeParse(body);
    expect(result.success).toBe(false);
    if (!result.success) {
      const path = result.error.issues[0].path.join('.');
      expect(path).toBe('moves.0.category');
      expect(JSON.stringify(result.error.issues)).not.toContain('Mágico');
    }
  });

  it('recusa campo desconhecido dentro de um golpe', () => {
    const body = recordBody({
      moves: [{ ...pokemonBody().moves[0], poder: 9000 }],
    });
    expect(pokemonRecordSchema.safeParse(body).success).toBe(false);
  });

  it('recusa caixa 100 e posição 30', () => {
    expect(pokemonRecordSchema.safeParse(recordBody({ boxNumber: 100 })).success).toBe(false);
    expect(pokemonRecordSchema.safeParse(recordBody({ slot: 30 })).success).toBe(false);
    expect(pokemonRecordSchema.safeParse(recordBody({ partySlot: 6 })).success).toBe(false);
  });

  it('recusa coleções acima do limite', () => {
    const move = pokemonBody().moves[0];
    const many = (n: number) => Array.from({ length: n }, (_, i) => ({ ...move, id: `${i}` }));
    expect(pokemonRecordSchema.safeParse(recordBody({ moves: many(50) })).success).toBe(true);
    expect(pokemonRecordSchema.safeParse(recordBody({ moves: many(51) })).success).toBe(false);
    expect(
      pokemonRecordSchema.safeParse(recordBody({ abilities: Array(11).fill({ name: 'a', description: '' }) })).success
    ).toBe(false);
    expect(pokemonRecordSchema.safeParse(recordBody({ types: ['A', 'B', 'C', 'D'] })).success).toBe(false);
    const caps = recordBody({
      capabilities: { ...pokemonBody().capabilities, other: Array(31).fill({ name: 'x', value: '1' }) },
    });
    expect(pokemonRecordSchema.safeParse(caps).success).toBe(false);
  });

  it('recusa foto em base64 e esquemas perigosos', () => {
    expect(pokemonRecordSchema.safeParse(recordBody({ imageUrl: 'data:image/png;base64,AAAA' })).success).toBe(false);
    expect(pokemonRecordSchema.safeParse(recordBody({ imageUrl: 'javascript:alert(1)' })).success).toBe(false);
    expect(pokemonRecordSchema.safeParse(recordBody({ imageUrl: '/uploads/abc/foto.png' })).success).toBe(true);
  });
});

describe('itemSchema (estrito)', () => {
  it('recusa ref com caracteres inválidos', () => {
    const item = { id: 'ok-1', name: 'Poção', description: '', quantity: 1 };
    expect(itemSchema('strict').safeParse(item).success).toBe(true);
    expect(itemSchema('strict').safeParse({ ...item, id: '../x' }).success).toBe(false);
    expect(itemSchema('strict').safeParse({ ...item, id: 'a b' }).success).toBe(false);
    expect(itemSchema('strict').safeParse({ ...item, id: '' }).success).toBe(false);
    expect(itemSchema('strict').safeParse({ ...item, id: 'x'.repeat(65) }).success).toBe(false);
  });
});

describe('versão tolerante (fachada)', () => {
  it('aceita o Pokémon padrão do PokemonCreationSheet', () => {
    const parsed = storedPokemonSchema('tolerant').safeParse({
      id: '1730000000000',
      slot: 3,
      name: 'Nome',
      species: 'Espécie',
      level: 1,
      gender: 'U',
      types: ['NORMAL'],
      ball: 'Poke Ball',
      nature: '',
      natureFeatures: '',
      elementalDamageBonus: 0,
      capabilityTrait: { name: '', description: '' },
      hp: { current: 10, max: 10 },
      stats: {
        saude: 1, ataque: 1, defesa: 1, atqEspecial: 1, defEspecial: 1, velocidade: 1,
        base: { saude: 1, ataque: 1, defesa: 1, atqEspecial: 1, defEspecial: 1, velocidade: 1 },
        lvl: { saude: 0, ataque: 0, defesa: 0, atqEspecial: 0, defEspecial: 0, velocidade: 0 },
      },
      movements: { terrestre: 4, voo: 0, natacao: 2, subaquatico: 0, escavacao: 0 },
      evasions: { fisica: 1, especial: 1, veloz: 0 },
      capabilities: {
        force: { value: 1, description: 'Levantar 5kg' },
        intelligence: { value: 2, description: '' },
        jump: { value: 1, description: '' },
        other: [],
      },
      abilities: [{ name: '', description: '' }, { name: '', description: '' }],
      moves: [{ id: '', name: '', type: '', category: 'Físico', frequency: '', range: '', damage: '', accuracy: '', description: '', descriptor: '' }],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.id).toBe('1730000000000');
  });

  it('aceita as 99 caixas e as listas do INITIAL_TRAINER_DATA', () => {
    const boxes = INITIAL_TRAINER_DATA.pcBoxes.map((b) => pcBoxSchema('tolerant').safeParse(b));
    expect(boxes).toHaveLength(99);
    expect(boxes.every((r) => r.success)).toBe(true);
    expect(INITIAL_TRAINER_DATA.talentos.every((t) => talentSchema('tolerant').safeParse(t).success)).toBe(true);
    expect(INITIAL_TRAINER_DATA.inventario.every((i) => itemSchema('tolerant').safeParse(i).success)).toBe(true);
  });

  it('completa o que falta, arredonda números e ignora campos desconhecidos', () => {
    const parsed = storedPokemonSchema('tolerant').parse({
      id: 7,
      slot: 2,
      level: 12.6,
      hp: { current: 3.4 },
      campoNovo: 'ignorado',
    });
    expect(parsed.id).toBe('7');
    expect(parsed.level).toBe(13);
    expect(parsed.hp).toEqual({ current: 3, max: 0 });
    expect(parsed.types).toEqual([]);
    expect(parsed.stats.base.saude).toBe(0);
    expect(parsed).not.toHaveProperty('campoNovo');
  });

  it('mantém a foto em base64 para o photos.ts tratar', () => {
    const parsed = storedPokemonSchema('tolerant').parse({
      id: '1',
      slot: 0,
      imageUrl: 'data:image/png;base64,AAAA',
    });
    expect(parsed.imageUrl).toBe('data:image/png;base64,AAAA');
  });

  it('continua recusando categoria inválida e coleção acima do limite', () => {
    const move = { id: '0', category: 'Mágico' };
    expect(storedPokemonSchema('tolerant').safeParse({ id: '1', slot: 0, moves: [move] }).success).toBe(false);
    const many = Array.from({ length: 51 }, (_, i) => ({ id: `${i}` }));
    expect(storedPokemonSchema('tolerant').safeParse({ id: '1', slot: 0, moves: many }).success).toBe(false);
  });
});
