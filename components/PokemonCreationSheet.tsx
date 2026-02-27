import React, { useState } from 'react';
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

export const PokemonCreationSheet: React.FC<PokemonCreationSheetProps> = ({ initialData, onSave, onCancel }) => {
  const [pokemon, setPokemon] = useState<Partial<StoredPokemon>>({
    name: 'Nome',
    species: 'Espécie',
    level: 1,
    gender: 'U',
    types: ['Normal'],
    ball: 'Poke Ball',
    nature: 'Nature',
    natureFeatures: '-Attr +Attr',
    elementalDamageBonus: 0,
    capabilityTrait: { name: 'Traço', description: 'Descrição...' },
    hp: { current: 10, max: 10 },
    stats: {
        saude: 1, ataque: 1, defesa: 1, atqEspecial: 1, defEspecial: 1, velocidade: 1,
        base: { saude: 1, ataque: 1, defesa: 1, atqEspecial: 1, defEspecial: 1, velocidade: 1 },
        lvl: { saude: 0, ataque: 0, defesa: 0, atqEspecial: 0, defEspecial: 0, velocidade: 0 }
    },
    movements: { terrestre: 4, voo: 0, natacao: 2, subaquatico: 0, escavacao: 0 },
    evasions: { fisica: 1, especial: 1, veloz: 0 },
    capabilities: { 
        force: { value: 1, description: 'Levantar 5kg' }, 
        intelligence: { value: 2, description: '' }, 
        jump: { value: 1, description: '' }, 
        other: [] 
    },
    abilities: [],
    moves: [],
    ...initialData
  });

  // Helper to update deeply nested state would be good, but for now specific handlers or messy spreads
  const handleStatChange = (key: keyof Stats, subKey: 'base' | 'lvl', value: number) => {
      setPokemon(prev => {
          if (!prev.stats) return prev;
          const newStats = { ...prev.stats };
          newStats[subKey] = { ...newStats[subKey], [key]: value };
          // Calc total
          const newVal = newStats[subKey][key] + (subKey === 'base' ? newStats.lvl[key] : newStats.base[key]);
          newStats[key] = newVal;
          
          let newHp = prev.hp;
          if (key === 'saude') {
              const maxHp = (newStats.saude + (prev.level || 0)) * 3;
              newHp = { ...prev.hp!, max: maxHp };
          }
          
          return { ...prev, stats: newStats, hp: newHp };
      });
  };

  const statLabels: Record<keyof Stats, string> = {
      saude: 'Saúde',
      ataque: 'Ataque',
      defesa: 'Defesa',
      atqEspecial: 'Ataque SP',
      defEspecial: 'Defesa SP',
      velocidade: 'Velocidade'
  };

  const TYPE_COLORS: Record<string, string> = {
      'NORMAL': '#919aa2',
      'LUTADOR': '#ce416b',
      'VOADOR': '#89aae3',
      'VENENOSO': '#b566ce',
      'TERRESTRE': '#d97845',
      'PEDRA': '#c5b78c',
      'INSETO': '#91c130',
      'FANTASMA': '#5269ad',
      'AÇO': '#5a8ea2',
      'FOGO': '#fe9d55',
      'ÁGUA': '#508fd6',
      'PLANTA': '#63BC5A',
      'ELÉTRICO': '#F4D23C',
      'PSÍQUICO': '#FA7179',
      'GELO': '#73CEC0',
      'DRAGÃO': '#0B6DC3',
      'SOMBRIO': '#5A5465',
      'FADA': '#EC8FE6',
      'CRISTAL': '#8E7CC3',
      '-': '#FFFFFF'
  };

  const NATURE_DATA: Record<string, { plus: string, minus: string }> = {
        'Ousada': { plus: 'Saúde', minus: 'Ataque' },
        'Dócil': { plus: 'Saúde', minus: 'Defesa' },
        'Orgulhosa': { plus: 'Saúde', minus: 'Ataque Especial' },
        'Excêntrica': { plus: 'Saúde', minus: 'Defesa Especial' },
        'Preguiçosa': { plus: 'Saúde', minus: 'Velocidade' },
        'Desesperada': { plus: 'Ataque', minus: 'Saúde' },
        'Solitária': { plus: 'Ataque', minus: 'Defesa' },
        'Firme': { plus: 'Ataque', minus: 'Ataque Especial' },
        'Travessa': { plus: 'Ataque', minus: 'Defesa Especial' },
        'Brava': { plus: 'Ataque', minus: 'Velocidade' },
        'Rígida': { plus: 'Defesa', minus: 'Saúde' },
        'Arrojada': { plus: 'Defesa', minus: 'Ataque' },
        'Endiabrada': { plus: 'Defesa', minus: 'Ataque Especial' },
        'Negligente': { plus: 'Defesa', minus: 'Defesa Especial' },
        'Relaxada': { plus: 'Defesa', minus: 'Velocidade' },
        'Tímida': { plus: 'Ataque Especial', minus: 'Saúde' },
        'Modesta': { plus: 'Ataque Especial', minus: 'Ataque' },
        'Amável': { plus: 'Ataque Especial', minus: 'Defesa' },
        'Imprudente': { plus: 'Ataque Especial', minus: 'Defesa Especial' },
        'Quieta': { plus: 'Ataque Especial', minus: 'Velocidade' },
        'Enjoada': { plus: 'Defesa Especial', minus: 'Saúde' },
        'Calma': { plus: 'Defesa Especial', minus: 'Ataque' },
        'Gentil': { plus: 'Defesa Especial', minus: 'Defesa' },
        'Meticulosa': { plus: 'Defesa Especial', minus: 'Ataque Especial' },
        'Atrevida': { plus: 'Defesa Especial', minus: 'Velocidade' },
        'Séria': { plus: 'Velocidade', minus: 'Saúde' },
        'Medrosa': { plus: 'Velocidade', minus: 'Ataque' },
        'Apressada': { plus: 'Velocidade', minus: 'Defesa' },
        'Alegre': { plus: 'Velocidade', minus: 'Ataque Especial' },
        'Ingênua': { plus: 'Velocidade', minus: 'Defesa Especial' },
        'Comedida': { plus: '', minus: '' },
        'Chata': { plus: '', minus: '' },
        'Paciente': { plus: '', minus: '' },
        'Sensata': { plus: '', minus: '' },
        'Estoica': { plus: '', minus: '' },
  };

  return (
    <div className="flex-1 bg-[#D0E0D0] p-4 rounded-3xl overflow-y-auto custom-scrollbar font-sans text-xs relative text-black flex flex-col gap-4">
        
        <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto flex-1 h-full">
            
            {/* COLUMN 1: Visuals & Stats */}
            <div className="w-full lg:w-1/4 flex flex-col gap-4">
                {/* Image Area */}
                <div className="aspect-square bg-gradient-to-b from-green-300 to-green-100 rounded-xl border-4 border-green-800 shadow-inner flex items-center justify-center relative overflow-hidden group">
                     {/* Placeholder for upload or display */}
                     <i className="fa-solid fa-image text-5xl text-green-800 opacity-20" />
                     <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-white p-2 rounded-full shadow"><i className="fa-solid fa-upload" /></button>
                     </div>
                </div>

                {/* Level / Name Bar */}
                <div className="flex bg-black rounded-lg overflow-hidden border-2 border-black text-white">
                    <div className="px-2 py-1 bg-white text-black font-black border-r-2 border-black flex flex-col items-center leading-none justify-center w-12">
                        <span className="text-[7px] uppercase">Level</span>
                        <SmartInput 
                            className="w-full text-center text-lg font-black outline-none bg-transparent [&::-webkit-inner-spin-button]:appearance-none" 
                            value={pokemon.level}
                            onChange={(val) => {
                                const lvl = val || 0;
                                const totalSaude = pokemon.stats?.saude || 0;
                                const maxHp = (totalSaude + lvl) * 3;
                                setPokemon({...pokemon, level: lvl, hp: {...pokemon.hp!, max: maxHp}});
                            }}
                        />
                    </div>
                    <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                         <span className="text-[7px] uppercase text-zinc-400">Nome</span>
                         <input 
                            type="text" 
                            className="w-full bg-transparent text-white font-bold outline-none text-base"
                            value={pokemon.name}
                            onChange={(e) => setPokemon({...pokemon, name: e.target.value})}
                         />
                    </div>
                </div>

                {/* HP Bar */}
                <div className="bg-rose-900/10 p-1 rounded-lg border border-black/10">
                    <div className="flex items-center gap-1 mb-1">
                        <div className="bg-[#A04040] text-white font-black px-1.5 py-0.5 rounded text-sm border-2 border-white/50 shadow">HP</div>
                        <div className="flex-1 bg-zinc-800 h-6 rounded border-2 border-white flex items-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-green-500" style={{ width: `${Math.min(100, Math.max(0, ((pokemon.hp?.current || 0) / (pokemon.hp?.max || 1)) * 100))}%` }} />
                            <div className="relative z-10 w-full flex justify-between px-2 font-bold text-white drop-shadow-md text-xs">
                                <SmartInput className="w-8 bg-transparent text-center outline-none" value={pokemon.hp?.current} onChange={val => setPokemon({...pokemon, hp: {...pokemon.hp!, current: val || 0}})} />
                                <span>/</span>
                                <SmartInput className="w-8 bg-transparent text-center outline-none" value={pokemon.hp?.max} onChange={val => setPokemon({...pokemon, hp: {...pokemon.hp!, max: val || 0}})} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Table */}
                <div className="bg-white rounded-lg shadow border-2 border-black overflow-hidden relative">
                     <table className="w-full text-center text-[10px] font-bold">
                         <thead className="bg-[#402020] text-white">
                             <tr>
                                 <th className="py-1 px-1 text-left w-[1%] whitespace-nowrap">Atributo</th>
                                 <th className="w-7 bg-rose-900">Base</th>
                                 <th className="w-7 bg-rose-800">Lvl</th>
                                 <th className="w-7 bg-rose-700">Fase</th>
                                 <th className="w-7 bg-black">Total</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-black">
                            {(['saude', 'ataque', 'defesa', 'atqEspecial', 'defEspecial', 'velocidade'] as Array<keyof Stats>).map((stat) => (
                                <tr key={stat} className="bg-white even:bg-zinc-100">
                                    <td className="bg-[#202020] text-white uppercase text-[8px] py-1 px-2 text-left border-r border-black whitespace-nowrap w-[1%]">{statLabels[stat]}</td>
                                    <td className="border-r border-zinc-300"><SmartInput className="w-full text-center bg-transparent outline-none" value={pokemon.stats?.base[stat]} onChange={(val) => handleStatChange(stat, 'base', val || 0)} /></td>
                                    <td className="border-r border-zinc-300 text-rose-700"><SmartInput className="w-full text-center bg-transparent outline-none" value={pokemon.stats?.lvl[stat]} onChange={(val) => handleStatChange(stat, 'lvl', val || 0)} /></td>
                                    <td className="border-r border-zinc-300 bg-green-50">0</td>
                                    <td className="font-black bg-zinc-200">{pokemon.stats?.[stat]}</td>
                                </tr>
                            ))}
                         </tbody>
                     </table>
                </div>
            </div>

            {/* COLUMN 2: Info & Details */}
            <div className="w-full lg:w-1/4 flex flex-col gap-2 h-full">
                {/* Header Info Grid */}
                <div className="grid grid-cols-2 gap-1 shrink-0">
                    {/* Types Row - Using Flex to ensure Select widths are equal */}
                    <div className="col-span-2 flex h-9 w-full">
                        {/* Type 1 Group */}
                        <div className="flex items-center rounded-l border border-black border-r-0 bg-[#303030] text-white overflow-hidden shrink-0">
                             <span className="px-1 py-0.5 bg-black text-[8px] font-black uppercase h-full flex items-center">Tipagem</span>
                        </div>
                        <div className="flex-1 rounded-r border border-black border-l-0 overflow-hidden relative">
                             <select 
                                className="w-full font-bold text-center outline-none uppercase text-[9px] appearance-none h-full text-white"
                                style={{ backgroundColor: TYPE_COLORS[pokemon.types?.[0] || ''] || '#ffffff', color: pokemon.types?.[0] && pokemon.types[0] !== '' ? 'white' : 'black' }} 
                                value={pokemon.types?.[0] || ''} 
                                onChange={e => { const newT = [...(pokemon.types || [])]; newT[0] = e.target.value; setPokemon({...pokemon, types: newT})}}
                            >
                                <option value="" style={{backgroundColor: '#ffffff', color: '#000000'}}>-</option>
                                {Object.keys(TYPE_COLORS).filter(k => k !== '-').map(t => <option key={t} value={t} style={{backgroundColor: '#ffffff', color: '#000000'}}>{t}</option>)}
                            </select>
                        </div>

                        {/* Gap */}
                        <div className="w-1 shrink-0"></div>

                        {/* Type 2 Group */}
                         <div className="flex-1 rounded border border-black overflow-hidden relative">
                             <select 
                                className="w-full font-bold text-center outline-none uppercase text-[9px] appearance-none h-full text-white"
                                style={{ backgroundColor: TYPE_COLORS[pokemon.types?.[1] || '-'] || '#ffffff', color: pokemon.types?.[1] && pokemon.types[1] !== '-' ? 'white' : 'black' }}
                                value={pokemon.types?.[1] || '-'} 
                                onChange={e => { const newT = [...(pokemon.types || [])]; newT[1] = e.target.value; setPokemon({...pokemon, types: newT})}}
                            >
                                <option value="-" style={{backgroundColor: '#ffffff', color: '#000000'}}>-</option>
                                {Object.keys(TYPE_COLORS).filter(k => k !== '-').map(t => <option key={t} value={t} style={{backgroundColor: '#ffffff', color: '#000000'}}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Gender Row - Full Width */}
                    <div className="col-span-2 border-2 border-black bg-white rounded flex items-center overflow-hidden h-9">
                        <div className="bg-[#202020] text-white px-2 h-full flex items-center justify-center shrink-0 border-r border-black">
                            <span className="text-[8px] font-black uppercase">Genero</span>
                        </div>
                        <select className="flex-1 font-bold text-center bg-transparent outline-none appearance-none text-[10px] h-full" value={pokemon.gender} onChange={e => setPokemon({...pokemon, gender: e.target.value as StoredPokemon['gender']})}>
                            <option value="M">Macho</option>
                            <option value="F">Femea</option>
                            <option value="U">Unknown</option>
                        </select>
                    </div>

                    {/* Nature & Modifiers Row */}
                    <div className="col-span-2 flex gap-1 h-9">
                        {/* Nature Box */}
                        <div className="flex-1 border-2 border-black bg-white rounded flex items-center overflow-hidden h-full">
                            <div className="bg-[#202020] text-white px-2 h-full flex items-center justify-center shrink-0 border-r border-black">
                                <span className="text-[7px] font-black uppercase">Natureza</span>
                            </div>
                            <div className="flex-1 relative h-full min-w-0">
                                {/* Visual Text Layer (allows wrapping) */}
                                <div className="absolute inset-0 flex items-center justify-center text-center px-1 pointer-events-none">
                                    <span className="text-[10px] font-bold leading-none break-words">
                                        {pokemon.nature || "Selecione"}
                                    </span>
                                </div>
                                {/* Invisible Select Layer */}
                                <select 
                                    className="opacity-0 w-full h-full absolute inset-0 z-10 cursor-pointer" 
                                    value={pokemon.nature || ''} 
                                    onChange={e => {
                                        const nat = e.target.value;
                                        const data = NATURE_DATA[nat];
                                        const features = data && (data.plus || data.minus) ? `-${data.minus}\n+${data.plus}` : '';
                                        setPokemon({...pokemon, nature: nat, natureFeatures: features});
                                    }}
                                >
                                    <option value="">Selecione</option>
                                    {Object.keys(NATURE_DATA).sort().map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Modifiers Box */}
                        <div className="flex-1 border-2 border-black bg-white rounded flex overflow-hidden h-full relative">
                            <textarea 
                                className="text-[10px] font-bold text-center outline-none w-full h-full resize-none bg-transparent py-1 leading-tight [&::-webkit-scrollbar]:hidden" 
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                value={pokemon.natureFeatures} 
                                onChange={e => setPokemon({...pokemon, natureFeatures: e.target.value})} 
                                placeholder="Modificadores" 
                            />
                        </div>
                    </div>
                </div>

                {/* Bonus Dano Elemental */}
                <div className="bg-[#202020] text-white rounded border border-black flex flex-col items-center w-full shrink-0">
                     <div className="text-[8px] font-black uppercase text-center leading-tight p-0.5 w-full">Bonus Dano Elemental</div>
                     <SmartInput className="font-black text-lg text-center w-full bg-white text-black outline-none h-7" value={pokemon.elementalDamageBonus} onChange={val => setPokemon({...pokemon, elementalDamageBonus: val || 0})} />
                </div>

                {/* Traço de Capacidades (Expanded) */}
                <div className="flex-1 w-full border-2 border-black bg-white rounded flex flex-col min-h-[140px] overflow-hidden shadow-sm">
                      <div className="bg-[#102010] text-white text-[10px] font-black uppercase text-center shrink-0 py-0.5">Traço de Capacidades</div>
                      <input className="font-bold text-center text-sm outline-none bg-zinc-100 p-1.5 shrink-0 border-b border-black/10" value={pokemon.capabilityTrait?.name} onChange={e => setPokemon({...pokemon, capabilityTrait: {...pokemon.capabilityTrait!, name: e.target.value}})} placeholder="Nome" />
                      <textarea className="flex-1 p-2 text-[10px] resize-none outline-none w-full" value={pokemon.capabilityTrait?.description} onChange={e => setPokemon({...pokemon, capabilityTrait: {...pokemon.capabilityTrait!, description: e.target.value}})} placeholder="Descrição..." />
                </div>

                {/* Bottom Group (Red Block) */}
                <div className="flex flex-col gap-2 shrink-0">
                    {/* Capabilities Grid */}
                    <div className="border-2 border-black bg-white rounded overflow-hidden flex flex-col">
                        <div className="bg-[#102010] text-white text-[10px] font-black uppercase text-center py-0.5">Capacidades</div>
                        <div className="grid grid-cols-[auto_30px_1fr] text-[9px] font-bold divide-y divide-black flex-1">
                             {/* Force */}
                             <div className="bg-[#202020] text-white p-2 flex items-center justify-center">Força</div>
                             <SmartInput className="text-center outline-none border-r border-black" value={pokemon.capabilities?.force.value} onChange={val => {
                                 const desc = FORCE_CAPABILITY_DESCRIPTIONS[val] || pokemon.capabilities?.force.description || '';
                                 setPokemon({...pokemon, capabilities: {...pokemon.capabilities!, force: {value: val, description: desc}}});
                             }} />
                             <input className="px-2 outline-none bg-rose-900/10 text-rose-900" value={pokemon.capabilities?.force.description} onChange={e => setPokemon({...pokemon, capabilities: {...pokemon.capabilities!, force: {...pokemon.capabilities!.force, description: e.target.value}}})} />

                             {/* Int */}
                             <div className="bg-[#202020] text-white p-2 flex items-center justify-center">Intel</div>
                             <SmartInput className="text-center outline-none border-r border-black" value={pokemon.capabilities?.intelligence.value} onChange={val => {
                                 const desc = INTELLIGENCE_CAPABILITY_DESCRIPTIONS[val] || pokemon.capabilities?.intelligence.description || '';
                                 setPokemon({...pokemon, capabilities: {...pokemon.capabilities!, intelligence: {value: val, description: desc}}});
                             }} />
                             <input className="px-2 outline-none bg-rose-900/20 text-rose-900" value={pokemon.capabilities?.intelligence.description} onChange={e => setPokemon({...pokemon, capabilities: {...pokemon.capabilities!, intelligence: {...pokemon.capabilities!.intelligence, description: e.target.value}}})} />

                             {/* Jump */}
                             <div className="bg-[#202020] text-white p-2 flex items-center justify-center">Salto</div>
                             <SmartInput className="text-center outline-none border-r border-black" value={pokemon.capabilities?.jump.value} onChange={val => {
                                 const desc = JUMP_CAPABILITY_DESCRIPTIONS[val] || pokemon.capabilities?.jump.description || '';
                                 setPokemon({...pokemon, capabilities: {...pokemon.capabilities!, jump: {value: val, description: desc}}});
                             }} />
                             <input className="px-2 outline-none bg-rose-900/10 text-rose-900" value={pokemon.capabilities?.jump.description} onChange={e => setPokemon({...pokemon, capabilities: {...pokemon.capabilities!, jump: {...pokemon.capabilities!.jump, description: e.target.value}}})} />
                        </div>
                    </div>

                    {/* Movements & Evasions */}
                    <div className="flex flex-col gap-1">
                         {/* Move */}
                         <div className="bg-[#202020] text-white rounded border border-black overflow-hidden flex flex-col">
                             <div className="text-center text-[9px] font-black uppercase py-0.5 bg-black">Deslocamentos</div>
                             <div className="grid grid-cols-5 gap-px bg-black flex-1">
                                 {/* Col 1 */}
                                  <div className="bg-white text-black text-center flex flex-col justify-between h-full pt-1">
                                     <SmartInput className="font-black text-lg text-center w-full outline-none flex-1" value={pokemon.movements?.terrestre} onChange={val => setPokemon({...pokemon, movements: {...pokemon.movements!, terrestre: val || 0}})} />
                                     <div className="w-full bg-[#303030] text-white text-[7px] font-bold uppercase py-0.5">Terrestre</div>
                                 </div>
                                 <div className="bg-white text-black text-center flex flex-col justify-between h-full pt-1">
                                     <SmartInput className="font-black text-lg text-center w-full outline-none flex-1" value={pokemon.movements?.natacao} onChange={val => setPokemon({...pokemon, movements: {...pokemon.movements!, natacao: val || 0}})} />
                                     <div className="w-full bg-[#303030] text-white text-[7px] font-bold uppercase py-0.5">Natação</div>
                                 </div>
                                  <div className="bg-white text-black text-center flex flex-col justify-between h-full pt-1">
                                     <SmartInput className="font-black text-lg text-center w-full outline-none flex-1" value={pokemon.movements?.voo} onChange={val => setPokemon({...pokemon, movements: {...pokemon.movements!, voo: val || 0}})} />
                                     <div className="w-full bg-[#303030] text-white text-[7px] font-bold uppercase py-0.5">Voo</div>
                                 </div>
                                  <div className="bg-white text-black text-center flex flex-col justify-between h-full pt-1">
                                     <SmartInput className="font-black text-lg text-center w-full outline-none flex-1" value={pokemon.movements?.subaquatico} onChange={val => setPokemon({...pokemon, movements: {...pokemon.movements!, subaquatico: val || 0}})} />
                                     <div className="w-full bg-[#303030] text-white text-[7px] font-bold uppercase py-0.5">Subaquatico</div>
                                 </div>
                                 <div className="bg-white text-black text-center flex flex-col justify-between h-full pt-1">
                                     <SmartInput className="font-black text-lg text-center w-full outline-none flex-1" value={pokemon.movements?.escavacao} onChange={val => setPokemon({...pokemon, movements: {...pokemon.movements!, escavacao: val || 0}})} />
                                     <div className="w-full bg-[#303030] text-white text-[7px] font-bold uppercase py-0.5">Escavação</div>
                                 </div>
                             </div>
                         </div>

                         {/* Evasion */}
                         <div className="bg-[#202020] text-white rounded border border-black overflow-hidden flex flex-col">
                             <div className="text-center text-[9px] font-black uppercase py-0.5 bg-black">Evasões</div>
                             <div className="grid grid-cols-3 gap-px bg-black h-full">
                                  <div className="bg-white text-black text-center flex flex-col justify-between h-full pt-1">
                                     <SmartInput className="font-black text-xl text-center w-full outline-none flex-1" value={pokemon.evasions?.fisica} onChange={val => setPokemon({...pokemon, evasions: {...pokemon.evasions!, fisica: val || 0}})} />
                                     <div className="w-full bg-[#303030] text-white text-[7px] font-bold uppercase py-0.5">Física</div>
                                 </div>
                                 <div className="bg-white text-black text-center flex flex-col justify-between h-full pt-1">
                                     <SmartInput className="font-black text-xl text-center w-full outline-none flex-1" value={pokemon.evasions?.especial} onChange={val => setPokemon({...pokemon, evasions: {...pokemon.evasions!, especial: val || 0}})} />
                                     <div className="w-full bg-[#303030] text-white text-[7px] font-bold uppercase py-0.5">Especial</div>
                                 </div>
                                 <div className="bg-white text-black text-center flex flex-col justify-between h-full pt-1">
                                     <SmartInput className="font-black text-xl text-center w-full outline-none flex-1" value={pokemon.evasions?.veloz} onChange={val => setPokemon({...pokemon, evasions: {...pokemon.evasions!, veloz: val || 0}})} />
                                     <div className="w-full bg-[#303030] text-white text-[7px] font-bold uppercase py-0.5">Veloz</div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* COLUMN 3: Moves (The Grid) */}
            <div className="w-full lg:w-1/2 flex flex-col gap-2">
                
                {/* Abilities Block */}
                 <div className="grid grid-cols-2 gap-2">
                    {[0, 1].map(i => (
                        <div key={i} className="border-2 border-black bg-white rounded-lg overflow-hidden shadow h-24 flex flex-col">
                             <div className="bg-[#304030] text-white flex justify-between items-center px-2 py-1">
                                 <span className="text-[9px] font-black italic">Habilidade {i+1}</span>
                                 <input 
                                    className="bg-[#A06060] text-white px-2 rounded w-2/3 text-[9px] font-bold outline-none placeholder-white/50" 
                                    placeholder="Nome da Habilidade"
                                    value={pokemon.abilities?.[i]?.name || ''}
                                    onChange={e => {
                                        const newAbs = [...(pokemon.abilities || [])];
                                        if (!newAbs[i]) newAbs[i] = { name: '', description: '' };
                                        newAbs[i].name = e.target.value;
                                        setPokemon({...pokemon, abilities: newAbs});
                                    }}
                                 />
                             </div>
                             <textarea 
                                className="flex-1 text-[9px] p-2 font-medium bg-orange-50 outline-none resize-none" 
                                placeholder="Descrição..."
                                value={pokemon.abilities?.[i]?.description || ''}
                                onChange={e => {
                                    const newAbs = [...(pokemon.abilities || [])];
                                    if (!newAbs[i]) newAbs[i] = { name: '', description: '' };
                                    newAbs[i].description = e.target.value;
                                    setPokemon({...pokemon, abilities: newAbs});
                                }}
                             />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                     {/* Move Cards */}
                     {Array.from({length: 8}).map((_, i) => {
                         const move = pokemon.moves?.[i] || { id: `${i}`, name: '', type: '', category: 'Físico', frequency: '', range: '', damage: '', accuracy: '', description: '', descriptors: [], overhead: '', descriptor: '' };
                         const updateMove = (field: keyof PokemonMove, value: PokemonMove[keyof PokemonMove]) => {
                             const newMoves = [...(pokemon.moves || [])];
                             // Fill gaps if needed
                             for(let j=0; j<=i; j++) {
                                 if(!newMoves[j]) newMoves[j] = { id: `${j}`, name: '', type: '', category: 'Físico', frequency: '', range: '', damage: '', accuracy: '', description: '', descriptors: [], overhead: '', descriptor: '' };
                             }
                             newMoves[i] = { ...newMoves[i], [field]: value };
                             setPokemon({...pokemon, moves: newMoves});
                         };

                         return (
                            <div key={i} className="border-2 border-black rounded bg-white flex flex-col overflow-hidden shadow hover:shadow-lg transition-shadow">
                                <div className="p-1" style={{ backgroundColor: TYPE_COLORS[move.type] || '#DC2626' }}>
                                    <input 
                                        className="bg-transparent text-white font-black text-center text-[10px] w-full outline-none placeholder-white/70 italic uppercase" 
                                        placeholder="nome do golpe"
                                        value={move.name}
                                        onChange={e => updateMove('name', e.target.value)}
                                    />
                                </div>
                                
                                {/* Row 1: Descriptor | Accuracy */}
                                <div className="grid grid-cols-2 text-[8px] font-bold text-center border-b border-black divide-x divide-black">
                                    <input className="outline-none text-center bg-transparent min-w-0 placeholder-black/50" placeholder="Descritor" value={move.descriptor} onChange={e => updateMove('descriptor', e.target.value)} />
                                    <input className="outline-none text-center bg-transparent min-w-0 placeholder-black/50" placeholder="Precisão" value={move.accuracy} onChange={e => updateMove('accuracy', e.target.value)} />
                                </div>
                                
                                {/* Row 2: Frequency | Range */}
                                <div className="grid grid-cols-2 text-[8px] font-bold text-center border-b border-black divide-x divide-black">
                                    <input className="outline-none text-center bg-transparent min-w-0 placeholder-black/50" placeholder="Frequencia" value={move.frequency} onChange={e => updateMove('frequency', e.target.value)} />
                                    <input className="outline-none text-center bg-transparent min-w-0 placeholder-black/50" placeholder="Alcance" value={move.range} onChange={e => updateMove('range', e.target.value)} />
                                </div>

                                {/* Row 3: Type | Category */}
                                <div className="grid grid-cols-2 text-[8px] font-bold text-center border-b border-black divide-x divide-black">
                                     <select 
                                        className="outline-none text-center min-w-0 appearance-none h-full font-bold uppercase text-[8px]"
                                        style={{ 
                                            backgroundColor: TYPE_COLORS[move.type] || 'transparent', 
                                            color: move.type && TYPE_COLORS[move.type] ? 'white' : 'black' 
                                        }}
                                        value={move.type} 
                                        onChange={e => updateMove('type', e.target.value)}
                                     >
                                         <option value="" style={{backgroundColor: '#ffffff', color: '#808080'}}>Tipagem</option>
                                         {Object.keys(TYPE_COLORS).filter(k => k !== '-').map(t => (
                                             <option key={t} value={t} style={{backgroundColor: '#ffffff', color: '#000000'}}>{t}</option>
                                         ))}
                                     </select>
                                     <input className="outline-none text-center bg-transparent min-w-0 placeholder-black/50" placeholder="Aprensentação" value={move.category} onChange={e => updateMove('category', e.target.value)} />
                                </div>

                                {/* Damage Bar */}
                                <div className="border-b border-black text-[9px] font-black text-center bg-white">
                                    <input className="w-full text-center bg-transparent outline-none placeholder-black/50" placeholder="Dados de dano" value={move.damage} onChange={e => updateMove('damage', e.target.value)} />
                                </div>
                                
                                <textarea 
                                    className="flex-1 p-1 text-[8px] resize-none outline-none text-center bg-transparent placeholder-black/80 font-bold" 
                                    placeholder="Descrição do golpe" 
                                    value={move.description}
                                    onChange={e => updateMove('description', e.target.value)}
                                ></textarea>
                            </div>
                         );
                     })}
                </div>
            </div>

        </div>
        
        {/* Footer: Controls */}
        <div className="flex justify-end gap-2 mt-2 border-t border-black/10 pt-2">
            <button onClick={onCancel} className="bg-transparent text-rose-700 px-4 py-1 rounded font-bold hover:bg-rose-100 transition-colors uppercase text-[10px]">
                <i className="fa-solid fa-times mr-1" /> Cancelar
            </button>
             <button onClick={() => onSave(pokemon as StoredPokemon)} className="bg-green-700 text-white px-6 py-1 rounded font-black shadow hover:bg-green-600 transition-colors uppercase text-[10px] tracking-wider">
                <i className="fa-solid fa-save mr-1" /> Salvar Pokemon
            </button>
        </div>
    </div>
  );
};
