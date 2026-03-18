import React, { useState, useRef } from 'react';
import { StoredPokemon, Stats, PokemonMove } from '../types';
import { PokedexTheme } from '../constants';
import { FORCE_CAPABILITY_DESCRIPTIONS, JUMP_CAPABILITY_DESCRIPTIONS, INTELLIGENCE_CAPABILITY_DESCRIPTIONS } from '../src/data/capabilities';
import { SmartInput } from './SmartInput';

interface PokemonCreationSheetProps {
  initialData?: Partial<StoredPokemon>;
  theme: PokedexTheme;
  onSave: (pokemon: StoredPokemon) => void;
  onCancel: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  'NORMAL': '#919aa2', 'LUTADOR': '#ce416b', 'VOADOR': '#89aae3', 'VENENOSO': '#b566ce',
  'TERRESTRE': '#d97845', 'PEDRA': '#c5b78c', 'INSETO': '#91c130', 'FANTASMA': '#5269ad',
  'AÇO': '#5a8ea2', 'FOGO': '#fe9d55', 'ÁGUA': '#508fd6', 'PLANTA': '#63BC5A',
  'ELÉTRICO': '#F4D23C', 'PSÍQUICO': '#FA7179', 'GELO': '#73CEC0', 'DRAGÃO': '#0B6DC3',
  'SOMBRIO': '#5A5465', 'FADA': '#EC8FE6', 'CRISTAL': '#8E7CC3',
};

const NATURE_DATA: Record<string, { plus: string; minus: string }> = {
  'Ousada': { plus: 'Saúde', minus: 'Ataque' }, 'Dócil': { plus: 'Saúde', minus: 'Defesa' },
  'Orgulhosa': { plus: 'Saúde', minus: 'Atq Esp' }, 'Excêntrica': { plus: 'Saúde', minus: 'Def Esp' },
  'Preguiçosa': { plus: 'Saúde', minus: 'Velocidade' }, 'Desesperada': { plus: 'Ataque', minus: 'Saúde' },
  'Solitária': { plus: 'Ataque', minus: 'Defesa' }, 'Firme': { plus: 'Ataque', minus: 'Atq Esp' },
  'Travessa': { plus: 'Ataque', minus: 'Def Esp' }, 'Brava': { plus: 'Ataque', minus: 'Velocidade' },
  'Rígida': { plus: 'Defesa', minus: 'Saúde' }, 'Arrojada': { plus: 'Defesa', minus: 'Ataque' },
  'Endiabrada': { plus: 'Defesa', minus: 'Atq Esp' }, 'Negligente': { plus: 'Defesa', minus: 'Def Esp' },
  'Relaxada': { plus: 'Defesa', minus: 'Velocidade' }, 'Tímida': { plus: 'Atq Esp', minus: 'Saúde' },
  'Modesta': { plus: 'Atq Esp', minus: 'Ataque' }, 'Amável': { plus: 'Atq Esp', minus: 'Defesa' },
  'Imprudente': { plus: 'Atq Esp', minus: 'Def Esp' }, 'Quieta': { plus: 'Atq Esp', minus: 'Velocidade' },
  'Enjoada': { plus: 'Def Esp', minus: 'Saúde' }, 'Calma': { plus: 'Def Esp', minus: 'Ataque' },
  'Gentil': { plus: 'Def Esp', minus: 'Defesa' }, 'Meticulosa': { plus: 'Def Esp', minus: 'Atq Esp' },
  'Atrevida': { plus: 'Def Esp', minus: 'Velocidade' }, 'Séria': { plus: 'Velocidade', minus: 'Saúde' },
  'Medrosa': { plus: 'Velocidade', minus: 'Ataque' }, 'Apressada': { plus: 'Velocidade', minus: 'Defesa' },
  'Alegre': { plus: 'Velocidade', minus: 'Atq Esp' }, 'Ingênua': { plus: 'Velocidade', minus: 'Def Esp' },
  'Comedida': { plus: '', minus: '' }, 'Chata': { plus: '', minus: '' },
  'Paciente': { plus: '', minus: '' }, 'Sensata': { plus: '', minus: '' }, 'Estoica': { plus: '', minus: '' },
};

const STAT_LABELS: Record<keyof Stats, string> = {
  saude: 'Saúde', ataque: 'Ataque', defesa: 'Defesa',
  atqEspecial: 'Atq. Especial', defEspecial: 'Def. Especial', velocidade: 'Velocidade',
};

const EMPTY_MOVE: PokemonMove = {
  id: '', name: '', type: '', category: 'Físico', frequency: '', range: '',
  damage: '', accuracy: '', description: '', descriptors: [], overhead: '', descriptor: '',
};

const TABS = [
  { id: 'stats' as const,        icon: 'fa-chart-bar',             label: 'Stats'       },
  { id: 'capacidades' as const,  icon: 'fa-star',                  label: 'Capacidades' },
  { id: 'golpes' as const,       icon: 'fa-bolt',                  label: 'Golpes'      },
  { id: 'habilidades' as const,  icon: 'fa-wand-magic-sparkles',   label: 'Habilidades' },
];

export const PokemonCreationSheet: React.FC<PokemonCreationSheetProps> = ({ initialData, theme, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'capacidades' | 'golpes' | 'habilidades'>('stats');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [pokemon, setPokemon] = useState<Partial<StoredPokemon>>({
    name: 'Nome', species: 'Espécie', level: 1, gender: 'U',
    types: ['NORMAL'], ball: 'Poke Ball', nature: '', natureFeatures: '',
    elementalDamageBonus: 0,
    capabilityTrait: { name: '', description: '' },
    hp: { current: 10, max: 10 },
    stats: {
      saude: 1, ataque: 1, defesa: 1, atqEspecial: 1, defEspecial: 1, velocidade: 1,
      base: { saude: 1, ataque: 1, defesa: 1, atqEspecial: 1, defEspecial: 1, velocidade: 1 },
      lvl:  { saude: 0, ataque: 0, defesa: 0, atqEspecial: 0, defEspecial: 0, velocidade: 0 },
    },
    movements: { terrestre: 4, voo: 0, natacao: 2, subaquatico: 0, escavacao: 0 },
    evasions:  { fisica: 1, especial: 1, veloz: 0 },
    capabilities: {
      force:        { value: 1, description: 'Levantar 5kg' },
      intelligence: { value: 2, description: '' },
      jump:         { value: 1, description: '' },
      other: [],
    },
    abilities: [{ name: '', description: '' }, { name: '', description: '' }],
    moves: [],
    ...initialData,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPokemon(prev => ({ ...prev, imageUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleStatChange = (key: keyof Stats, subKey: 'base' | 'lvl', value: number) => {
    setPokemon(prev => {
      if (!prev.stats) return prev;
      const s = { ...prev.stats };
      s[subKey] = { ...s[subKey], [key]: value };
      s[key] = s.base[key] + s.lvl[key];
      const newHp = key === 'saude'
        ? { ...prev.hp!, max: (s.saude + (prev.level || 0)) * 3 }
        : prev.hp;
      return { ...prev, stats: s, hp: newHp };
    });
  };

  const updateMove = (i: number, field: keyof PokemonMove, value: PokemonMove[keyof PokemonMove]) => {
    const moves = [...(pokemon.moves || [])];
    for (let j = 0; j <= i; j++) if (!moves[j]) moves[j] = { ...EMPTY_MOVE, id: `${j}` };
    moves[i] = { ...moves[i], [field]: value };
    setPokemon(p => ({ ...p, moves }));
  };

  const themeColor = theme?.color || '#22d3ee';

  return (
    <div className="flex-1 flex flex-col text-gray-800 overflow-hidden bg-white"
      style={{ fontFamily: 'sans-serif' }}>

      {/* ═══════ MAIN AREA (left + right) ═══════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ══ LEFT PANEL — 35% ══ */}
        <div className="w-[35%] shrink-0 flex flex-col gap-3 p-4 overflow-y-auto custom-scrollbar bg-gray-100"
          style={{ borderRight: `2px solid ${themeColor}40` }}>

          {/* Image upload */}
          <div
            className="relative w-full aspect-square rounded-2xl border-2 border-gray-300 overflow-hidden cursor-pointer group flex items-center justify-center bg-gray-100"
            onClick={() => imageInputRef.current?.click()}
          >
            {pokemon.imageUrl
              ? <img src={pokemon.imageUrl} alt={pokemon.name} className="w-full h-full object-cover" />
              : (
                <div className="flex flex-col items-center gap-3 text-gray-300">
                  <i className="fa-solid fa-image text-6xl" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Clique para adicionar foto</span>
                </div>
              )
            }
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
              <i className="fa-solid fa-camera text-white text-3xl" />
              <span className="text-white text-xs font-black uppercase">{pokemon.imageUrl ? 'Trocar' : 'Adicionar'} foto</span>
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Level / Name */}
          <div className="flex rounded-xl overflow-hidden border-2 bg-white shadow-sm" style={{ borderColor: themeColor + '60' }}>
            <div className="px-3 py-2 border-r flex flex-col items-center justify-center w-16 shrink-0" style={{ backgroundColor: themeColor + '15', borderColor: themeColor + '40' }}>
              <span className="text-[7px] uppercase font-black" style={{ color: themeColor }}>Level</span>
              <SmartInput className="w-full text-center text-xl font-black outline-none bg-transparent text-gray-800"
                value={pokemon.level}
                onChange={v => { const lvl = v || 0; setPokemon(p => ({ ...p, level: lvl, hp: { ...p.hp!, max: ((p.stats?.saude || 0) + lvl) * 3 } })); }} />
            </div>
            <div className="flex-1 px-3 py-2 flex flex-col justify-center">
              <span className="text-[7px] uppercase text-gray-400">Nome</span>
              <input type="text" className="w-full bg-transparent text-gray-800 font-bold outline-none text-sm mt-0.5 placeholder-gray-300"
                placeholder="Ex: Charizard"
                value={pokemon.name} onChange={e => setPokemon(p => ({ ...p, name: e.target.value }))} />
            </div>
          </div>

          {/* HP */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-300 shadow-sm">
            <div className="text-white font-black px-2.5 py-1 rounded-lg text-[10px] shrink-0" style={{ backgroundColor: themeColor }}>HP</div>
            <div className="flex-1 bg-gray-100 h-7 rounded-lg border border-gray-300 flex items-center relative overflow-hidden">
              <div className="absolute inset-0 transition-all" style={{ width: `${Math.min(100, ((pokemon.hp?.current || 0) / (pokemon.hp?.max || 1)) * 100)}%`, backgroundColor: themeColor + 'aa' }} />
              <div className="relative z-10 w-full flex justify-between px-3 font-bold text-gray-800 text-xs">
                <SmartInput className="w-8 bg-transparent text-center outline-none" value={pokemon.hp?.current}
                  onChange={v => setPokemon(p => ({ ...p, hp: { ...p.hp!, current: v || 0 } }))} />
                <span className="opacity-50">/</span>
                <SmartInput className="w-8 bg-transparent text-center outline-none" value={pokemon.hp?.max}
                  onChange={v => setPokemon(p => ({ ...p, hp: { ...p.hp!, max: v || 0 } }))} />
              </div>
            </div>
          </div>

          {/* Types */}
          <div>
            <span className="text-[7px] font-black uppercase text-gray-400 mb-1.5 block">Tipagem</span>
            <div className="flex gap-2">
              {[0, 1].map(i => (
                <div key={i} className="flex-1 rounded-xl overflow-hidden border border-gray-300"
                  style={{ backgroundColor: TYPE_COLORS[pokemon.types?.[i] || ''] || '#9ca3af' }}>
                  <select className="w-full h-10 font-black text-center text-white bg-transparent outline-none uppercase text-[9px] appearance-none"
                    value={pokemon.types?.[i] || (i === 0 ? 'NORMAL' : '')}
                    onChange={e => { const t = [...(pokemon.types || [])]; t[i] = e.target.value; setPokemon(p => ({ ...p, types: t })); }}>
                    {i === 1 && <option value="" style={{ backgroundColor: '#fff', color: '#333' }}>— Sem tipo 2 —</option>}
                    {Object.keys(TYPE_COLORS).map(t => <option key={t} value={t} style={{ backgroundColor: '#fff', color: '#333' }}>{t}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <span className="text-[7px] font-black uppercase text-gray-400 mb-1.5 block">Gênero</span>
            <div className="flex gap-2">
              {[
                { v: 'M', label: 'Macho ♂', color: '#3b82f6' },
                { v: 'F', label: 'Fêmea ♀', color: '#ec4899' },
                { v: 'U', label: '⊙ Unknown', color: '#6b7280' },
              ].map(g => (
                <button key={g.v}
                  onClick={() => setPokemon(p => ({ ...p, gender: g.v as StoredPokemon['gender'] }))}
                  className="flex-1 py-2 rounded-xl border-2 font-black text-[10px] transition-all"
                  style={{
                    borderColor: pokemon.gender === g.v ? g.color : '#d1d5db',
                    backgroundColor: pokemon.gender === g.v ? g.color + '20' : 'white',
                    color: pokemon.gender === g.v ? g.color : '#9ca3af',
                  }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nature */}
          <div>
            <span className="text-[7px] font-black uppercase text-gray-400 mb-1.5 block">Natureza</span>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl border border-gray-300 bg-white shadow-sm h-10 flex items-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-3">
                  <span className="text-xs font-bold text-gray-700">{pokemon.nature || 'Selecione...'}</span>
                </div>
                <select className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  value={pokemon.nature || ''}
                  onChange={e => {
                    const nat = e.target.value;
                    const data = NATURE_DATA[nat];
                    const features = data?.plus ? `+${data.plus} / -${data.minus}` : '';
                    setPokemon(p => ({ ...p, nature: nat, natureFeatures: features }));
                  }}>
                  <option value="">Selecione...</option>
                  {Object.keys(NATURE_DATA).sort().map(n => <option key={n} value={n} style={{ backgroundColor: '#0a0a1a' }}>{n}</option>)}
                </select>
              </div>
              {pokemon.natureFeatures && (
                <div className="rounded-xl border border-gray-300 bg-gray-100 px-3 flex items-center shrink-0">
                  <span className="text-[9px] font-bold text-gray-500 whitespace-pre">{pokemon.natureFeatures}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bonus Elemental */}
          <div className="rounded-xl bg-white shadow-sm text-center py-2 border-2" style={{ borderColor: themeColor + '50' }}>
            <span className="text-[7px] font-black uppercase" style={{ color: themeColor }}>Bonus Dano Elemental</span>
            <SmartInput className="text-2xl font-black text-gray-800 bg-transparent outline-none text-center w-full mt-1"
              value={pokemon.elementalDamageBonus}
              onChange={v => setPokemon(p => ({ ...p, elementalDamageBonus: v || 0 }))} />
          </div>

        </div>

        {/* ══ RIGHT PANEL — 65% with tabs ══ */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">

          {/* Tab Bar */}
          <div className="flex gap-0.5 px-3 pt-3 shrink-0 border-b border-gray-300">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-[10px] font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-transparent'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 border-transparent'
                }`}
                style={activeTab === tab.id
                  ? { borderColor: themeColor, color: themeColor, backgroundColor: themeColor + '10' }
                  : {}}>
                <i className={`fa-solid ${tab.icon} text-[9px]`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">

            {/* ── STATS ── */}
            {activeTab === 'stats' && (
              <div className="flex flex-col gap-4">
                {/* Tabela de Stats */}
                <div className="rounded-2xl border border-gray-300 overflow-hidden shadow-sm" style={{ borderTop: `3px solid ${themeColor}` }}>
                  <table className="w-full text-center font-bold">
                    <thead>
                      <tr className="border-b border-gray-200" style={{ backgroundColor: themeColor + '15' }}>
                        <th className="py-3 px-5 text-left text-[10px] font-black uppercase" style={{ color: themeColor }}>Atributo</th>
                        <th className="py-3 text-xs w-24" style={{ color: themeColor }}>Base</th>
                        <th className="py-3 text-rose-500 text-xs w-24">Lvl</th>
                        <th className="py-3 text-yellow-600 text-xs w-16">Fase</th>
                        <th className="py-3 text-gray-800 text-xs w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(['saude', 'ataque', 'defesa', 'atqEspecial', 'defEspecial', 'velocidade'] as Array<keyof Stats>).map(stat => (
                        <tr key={stat} className="hover:bg-gray-100 transition-colors">
                          <td className="py-3 px-5 text-left text-gray-600 uppercase text-[11px] font-black">{STAT_LABELS[stat]}</td>
                          <td><SmartInput className="w-full text-center bg-transparent outline-none font-black text-xl py-2"
                            style={{ color: themeColor }}
                            value={pokemon.stats?.base[stat]} onChange={v => handleStatChange(stat, 'base', v || 0)} /></td>
                          <td><SmartInput className="w-full text-center bg-transparent outline-none text-rose-500 font-black text-xl py-2"
                            value={pokemon.stats?.lvl[stat]} onChange={v => handleStatChange(stat, 'lvl', v || 0)} /></td>
                          <td className="text-yellow-500 text-xl">0</td>
                          <td className="font-black text-gray-900 text-2xl">{pokemon.stats?.[stat]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            {/* ── CAPACIDADES ── */}
            {activeTab === 'capacidades' && (
              <div className="flex flex-col gap-4">
                {/* Traço */}
                <div className="rounded-2xl border border-gray-300 bg-white overflow-hidden shadow-sm" style={{ borderTop: `3px solid ${themeColor}` }}>
                  <div className="text-[9px] font-black uppercase text-center py-2 border-b border-gray-200"
                    style={{ backgroundColor: themeColor + '15', color: themeColor }}>Traço de Capacidades</div>
                  <input className="w-full p-3 bg-transparent text-gray-800 font-bold outline-none text-sm border-b border-gray-200 placeholder-gray-300"
                    value={pokemon.capabilityTrait?.name}
                    onChange={e => setPokemon(p => ({ ...p, capabilityTrait: { ...p.capabilityTrait!, name: e.target.value } }))}
                    placeholder="Nome do Traço" />
                  <textarea className="w-full p-3 text-xs resize-none outline-none bg-transparent text-gray-600 placeholder-gray-300 h-24"
                    value={pokemon.capabilityTrait?.description}
                    onChange={e => setPokemon(p => ({ ...p, capabilityTrait: { ...p.capabilityTrait!, description: e.target.value } }))}
                    placeholder="Descrição do traço..." />
                </div>

                {/* Capacidades table */}
                <div className="rounded-2xl border border-gray-300 overflow-hidden shadow-sm" style={{ borderTop: `3px solid ${themeColor}` }}>
                  <div className="text-[9px] font-black uppercase text-center py-2 border-b border-gray-200"
                    style={{ backgroundColor: themeColor + '15', color: themeColor }}>Capacidades</div>
                  {[
                    { label: 'Força',        key: 'force' as const,        descs: FORCE_CAPABILITY_DESCRIPTIONS        },
                    { label: 'Inteligência', key: 'intelligence' as const,  descs: INTELLIGENCE_CAPABILITY_DESCRIPTIONS },
                    { label: 'Salto',        key: 'jump' as const,         descs: JUMP_CAPABILITY_DESCRIPTIONS         },
                  ].map(({ label, key, descs }) => (
                    <div key={key} className="grid grid-cols-[120px_64px_1fr] divide-x divide-gray-200 border-b border-gray-200 last:border-b-0">
                      <div className="text-xs font-black uppercase flex items-center justify-center py-3"
                        style={{ backgroundColor: themeColor + '08', color: themeColor }}>{label}</div>
                      <SmartInput className="text-center outline-none bg-transparent font-black text-xl py-3"
                        style={{ color: themeColor }}
                        value={pokemon.capabilities?.[key].value}
                        onChange={v => {
                          const desc = descs[v] || pokemon.capabilities?.[key].description || '';
                          setPokemon(p => ({ ...p, capabilities: { ...p.capabilities!, [key]: { value: v, description: desc } } }));
                        }} />
                      <input className="px-4 outline-none bg-transparent text-gray-600 text-xs"
                        value={pokemon.capabilities?.[key].description || ''}
                        onChange={e => setPokemon(p => ({ ...p, capabilities: { ...p.capabilities!, [key]: { ...p.capabilities![key], description: e.target.value } } }))} />
                    </div>
                  ))}
                </div>

                {/* Deslocamentos */}
                <div className="rounded-2xl border border-gray-300 overflow-hidden shadow-sm" style={{ borderTop: `3px solid ${themeColor}` }}>
                  <div className="text-[9px] font-black uppercase text-center py-2 border-b border-gray-200"
                    style={{ backgroundColor: themeColor + '15', color: themeColor }}>Deslocamentos</div>
                  <div className="grid grid-cols-5 divide-x divide-gray-200">
                    {(['terrestre', 'natacao', 'voo', 'subaquatico', 'escavacao'] as const).map(k => (
                      <div key={k} className="flex flex-col items-center py-3 gap-1">
                        <SmartInput className="font-black text-2xl text-center w-full outline-none bg-transparent"
                          style={{ color: themeColor }}
                          value={pokemon.movements?.[k]} onChange={v => setPokemon(p => ({ ...p, movements: { ...p.movements!, [k]: v || 0 } }))} />
                        <div className="text-[7px] text-gray-400 uppercase font-bold">
                          {k === 'natacao' ? 'Natação' : k === 'subaquatico' ? 'Subaq.' : k === 'escavacao' ? 'Escav.' : k}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evasões */}
                <div className="rounded-2xl border border-gray-300 overflow-hidden shadow-sm" style={{ borderTop: `3px solid ${themeColor}` }}>
                  <div className="text-[9px] font-black uppercase text-center py-2 border-b border-gray-200"
                    style={{ backgroundColor: themeColor + '15', color: themeColor }}>Evasões</div>
                  <div className="grid grid-cols-3 divide-x divide-gray-200">
                    {(['fisica', 'especial', 'veloz'] as const).map(k => (
                      <div key={k} className="flex flex-col items-center py-4 gap-1">
                        <SmartInput className="font-black text-3xl text-center w-full outline-none bg-transparent"
                          style={{ color: themeColor }}
                          value={pokemon.evasions?.[k]} onChange={v => setPokemon(p => ({ ...p, evasions: { ...p.evasions!, [k]: v || 0 } }))} />
                        <div className="text-[7px] text-gray-400 uppercase font-bold">
                          {k === 'fisica' ? 'Física' : k === 'especial' ? 'Especial' : 'Veloz'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* ── GOLPES ── */}
            {activeTab === 'golpes' && (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => {
                  const move = pokemon.moves?.[i] || { ...EMPTY_MOVE, id: `${i}` };
                  const color = TYPE_COLORS[move.type] || themeColor;
                  return (
                    <div key={i} className="rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden flex flex-col">
                      <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: color }}>
                        <input className="flex-1 bg-transparent text-white font-black text-sm outline-none placeholder-white/50 uppercase"
                          placeholder={`Golpe ${i + 1}`} value={move.name} onChange={e => updateMove(i, 'name', e.target.value)} />
                        <select className="text-[8px] font-black bg-white/20 text-white rounded-lg px-2 py-0.5 outline-none appearance-none border border-white/30 uppercase"
                          value={move.type} onChange={e => updateMove(i, 'type', e.target.value)}>
                          <option value="" style={{ backgroundColor: '#fff', color: '#111' }}>Tipo</option>
                          {Object.keys(TYPE_COLORS).map(t => <option key={t} value={t} style={{ backgroundColor: '#fff', color: '#111' }}>{t}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-4 divide-x divide-gray-200 border-y border-gray-300 text-center">
                        {[
                          { label: 'Descritor',  field: 'descriptor' as const, val: move.descriptor },
                          { label: 'Precisão',   field: 'accuracy'   as const, val: move.accuracy   },
                          { label: 'Frequência', field: 'frequency'  as const, val: move.frequency  },
                          { label: 'Alcance',    field: 'range'      as const, val: move.range      },
                        ].map(({ label, field, val }) => (
                          <div key={field} className="flex flex-col items-center py-1.5">
                            <span className="text-[6px] text-gray-400 uppercase">{label}</span>
                            <input className="w-full text-[10px] text-center bg-transparent outline-none text-gray-700 font-bold placeholder-gray-300"
                              value={val} onChange={e => updateMove(i, field, e.target.value)} placeholder="—" />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-300 text-center">
                        <div className="flex flex-col items-center py-1.5">
                          <span className="text-[6px] text-gray-400 uppercase">Dano</span>
                          <input className="w-full text-[11px] text-center bg-transparent outline-none text-gray-900 font-black placeholder-gray-300"
                            value={move.damage} onChange={e => updateMove(i, 'damage', e.target.value)} placeholder="—" />
                        </div>
                        <div className="flex flex-col items-center py-1.5">
                          <span className="text-[6px] text-gray-400 uppercase">Categoria</span>
                          <input className="w-full text-[10px] text-center bg-transparent outline-none text-gray-700 font-bold placeholder-gray-300"
                            value={move.category} onChange={e => updateMove(i, 'category', e.target.value)} placeholder="Físico" />
                        </div>
                      </div>
                      <textarea className="w-full p-2 text-[9px] resize-none outline-none bg-gray-100 text-gray-500 placeholder-gray-300"
                        rows={2} placeholder="Descrição..." value={move.description} onChange={e => updateMove(i, 'description', e.target.value)} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── HABILIDADES ── */}
            {activeTab === 'habilidades' && (
              <div className="flex flex-col gap-5">
                {[0, 1].map(i => (
                  <div key={i} className="rounded-2xl border border-gray-300 bg-white shadow-sm overflow-hidden flex flex-col"
                    style={{ borderTop: `3px solid ${themeColor}` }}>
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200"
                      style={{ backgroundColor: themeColor + '15' }}>
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                        style={{ backgroundColor: themeColor + '30', color: themeColor }}>{i + 1}</span>
                      <input className="flex-1 bg-white text-gray-800 px-3 py-1.5 rounded-xl text-xs font-bold outline-none border-2 placeholder-gray-300"
                        style={{ borderColor: themeColor + '40' }}
                        placeholder="Nome da Habilidade"
                        value={pokemon.abilities?.[i]?.name || ''}
                        onChange={e => {
                          const a = [...(pokemon.abilities || [{ name: '', description: '' }, { name: '', description: '' }])];
                          a[i] = { ...a[i], name: e.target.value };
                          setPokemon(p => ({ ...p, abilities: a }));
                        }} />
                    </div>
                    <textarea className="flex-1 w-full text-xs p-5 bg-transparent outline-none resize-none text-gray-600 placeholder-gray-300 min-h-[140px]"
                      placeholder="Descrição da habilidade..."
                      value={pokemon.abilities?.[i]?.description || ''}
                      onChange={e => {
                        const a = [...(pokemon.abilities || [{ name: '', description: '' }, { name: '', description: '' }])];
                        a[i] = { ...a[i], description: e.target.value };
                        setPokemon(p => ({ ...p, abilities: a }));
                      }} />
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ═══════ FOOTER ═══════ */}
      <div className="flex justify-end gap-2 px-5 py-2.5 border-t border-gray-300 shrink-0 bg-white">
        <button onClick={onCancel}
          className="bg-gray-100 text-rose-600 px-4 py-1.5 rounded-lg font-bold hover:bg-rose-50 transition-colors uppercase text-[10px] border border-gray-300">
          <i className="fa-solid fa-times mr-1" /> Cancelar
        </button>
        <button onClick={() => onSave(pokemon as StoredPokemon)}
          className="text-white px-6 py-1.5 rounded-lg font-black shadow transition-colors uppercase text-[10px] tracking-wider"
          style={{ backgroundColor: themeColor }}>
          <i className="fa-solid fa-save mr-1" /> Salvar Pokémon
        </button>
      </div>
    </div>
  );
};
