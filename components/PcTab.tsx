import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PCBox, StoredPokemon } from '../types';
import { PokedexTheme } from '../constants';
import { PokemonCreationSheet } from './PokemonCreationSheet';

interface PcTabProps {
  boxes: PCBox[];
  onChange: (boxes: PCBox[]) => void;
  theme: PokedexTheme;
}

export const PcTab: React.FC<PcTabProps> = ({ boxes, onChange, theme }) => {
  const [currentBoxIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [moveSource, setMoveSource] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'box' | 'sheet'>('box');

  // Form State
  const [formData, setFormData] = useState<Partial<StoredPokemon>>({
    name: '',
    species: '',
    level: 1,
    gender: 'U',
    types: [],
    ball: 'Poke Ball'
  });
  const [typesInput, setTypesInput] = useState('');

  const currentBox = useMemo(() => boxes[currentBoxIndex] || { id: 0, name: 'Box ??', pokemons: [] }, [boxes, currentBoxIndex]);

  const getPokemonAt = useCallback((slot: number) => {
    return currentBox.pokemons.find(p => p.slot === slot);
  }, [currentBox]);

  // Reset states when slot changes
  useEffect(() => {
    setIsCreating(false);
    // If not creating, viewMode should be box? or strictly controlled by manual trigger?
    // Let's keep viewMode persistent until canceled/saved.
    if (selectedSlot !== null) {
      const pkmn = getPokemonAt(selectedSlot);
      if (pkmn) {
        setFormData(pkmn);
        setTypesInput(pkmn.types.join(', '));
      } else {
        setFormData({
            name: '',
            species: '',
            level: 1,
            gender: 'U',
            types: [],
            ball: 'Poke Ball'
        });
        setTypesInput('');
      }
    }
  }, [selectedSlot, currentBox, getPokemonAt]); // Removed boxes dependency to avoid loop, dependent on currentBox memo

  const handleSlotClick = (slot: number) => {
    if (moveSource !== null) {
      // Execute Move
      const newBoxes = [...boxes];
      const box = { ...newBoxes[currentBoxIndex] };
      const sourcePkmnIndex = box.pokemons.findIndex(p => p.slot === moveSource);
      const targetPkmnIndex = box.pokemons.findIndex(p => p.slot === slot);

      if (sourcePkmnIndex !== -1) {
        // Update source pokemon slot
        box.pokemons[sourcePkmnIndex] = { ...box.pokemons[sourcePkmnIndex], slot };
        
        // If target has pokemon, swap slots
        if (targetPkmnIndex !== -1) {
           box.pokemons[targetPkmnIndex] = { ...box.pokemons[targetPkmnIndex], slot: moveSource };
        }
        
        newBoxes[currentBoxIndex] = box;
        onChange(newBoxes);
      }
      setMoveSource(null);
      setSelectedSlot(slot);
    } else {
      setSelectedSlot(slot);
    }
  };

  const handleCreate = () => {
    if (selectedSlot === null) return;
    const newPkmn: StoredPokemon = {
      id: Date.now().toString(),
      name: formData.name || 'Unknown',
      species: formData.species || 'Unknown',
      level: formData.level || 1,
      gender: formData.gender as any,
      types: typesInput.split(',').map(t => t.trim()).filter(Boolean),
      ball: formData.ball || 'Poke Ball',
      slot: selectedSlot,
      nature: 'Hardy',
      natureFeatures: '',
      elementalDamageBonus: 0,
      abilities: [],
      stats: {
          saude: 10, ataque: 10, defesa: 10, atqEspecial: 10, defEspecial: 10, velocidade: 10,
          base: { saude: 10, ataque: 10, defesa: 10, atqEspecial: 10, defEspecial: 10, velocidade: 10 },
          lvl: { saude: 0, ataque: 0, defesa: 0, atqEspecial: 0, defEspecial: 0, velocidade: 0 }
      },
      hp: { current: 10, max: 10 },
      evasions: { fisica: 0, especial: 0, veloz: 0 },
      movements: { terrestre: 4, voo: 0, natacao: 0, subaquatico: 0, escavacao: 0 },
      capabilities: { force: 0, intelligence: 0, jump: 0, other: [] },
      moves: []
    };

    const newBoxes = [...boxes];
    if (!newBoxes[currentBoxIndex]) return;
    
    newBoxes[currentBoxIndex] = {
        ...newBoxes[currentBoxIndex],
        pokemons: [...newBoxes[currentBoxIndex].pokemons.filter(p => p.slot !== selectedSlot), newPkmn]
    };
    
    
    onChange(newBoxes);
    setIsCreating(false);
    setViewMode('box');
  };

  const handleSaveSheet = (pkmn: StoredPokemon) => {
      // Integration with new sheet
      if (selectedSlot === null) return;
      const newBoxes = [...boxes];
      if (!newBoxes[currentBoxIndex]) return;
      
      const newPkmn = { ...pkmn, id: pkmn.id || Date.now().toString(), slot: selectedSlot };
      
      newBoxes[currentBoxIndex] = {
        ...newBoxes[currentBoxIndex],
        pokemons: [...newBoxes[currentBoxIndex].pokemons.filter(p => p.slot !== selectedSlot), newPkmn]
      };
      
      onChange(newBoxes);
      setViewMode('box');
  };

  const handleDelete = () => {
      if (selectedSlot === null) return;
      if (!confirm('Tem certeza que deseja liberar este Pokémon?')) return;

      const newBoxes = [...boxes];
      newBoxes[currentBoxIndex] = {
          ...newBoxes[currentBoxIndex],
          pokemons: newBoxes[currentBoxIndex].pokemons.filter(p => p.slot !== selectedSlot)
      };
      onChange(newBoxes);
      setFormData({ name: '', species: '', level: 1, gender: 'U', types: [], ball: 'Poke Ball' });
      setTypesInput('');
  };

  const handleStartMove = () => {
    setMoveSource(selectedSlot);
    setSelectedSlot(null); // Optional: clear selection to focus on picking destination
  };

  const slots = Array.from({ length: 30 }, (_, i) => i);

  if (viewMode === 'sheet') {
      return (
          <PokemonCreationSheet 
            theme={theme}
            initialData={selectedSlot !== null ? getPokemonAt(selectedSlot) : {}}
            onSave={handleSaveSheet}
            onCancel={() => setViewMode('box')}
          />
      );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-in fade-in zoom-in-95">
      {/* LEFT PANEL - DETAILS / FORM */}
      <div className="w-full lg:w-1/3 flex flex-col">
        <div className="bg-white p-6 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.1)] h-full flex flex-col relative overflow-hidden">
            {/* Background Pattern */}
             <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {selectedSlot === null ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-4">
                    {moveSource !== null ? (
                        <>
                            <i className="fa-solid fa-arrows-to-dot text-6xl opacity-20 animate-pulse" style={{ color: theme.color }} />
                            <p className="text-xs font-black uppercase tracking-widest text-center">Selecione o slot<br/>de destino</p>
                            <button onClick={() => setMoveSource(null)} className="px-4 py-2 rounded-lg bg-zinc-200 text-zinc-600 font-bold hover:bg-zinc-300 transition-colors text-xs uppercase">Cancelar</button>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-gamepad text-6xl opacity-20" />
                            <p className="text-xs font-black uppercase tracking-widest text-center">Selecione um slot<br/>para ver opções</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="relative z-10 flex flex-col h-full">
                     <h3 className="text-sm font-black uppercase text-zinc-800 mb-6 border-b-2 border-zinc-100 pb-2 flex items-center gap-2">
                        {getPokemonAt(selectedSlot) ? <><i className="fa-solid fa-id-card" /> Detalhes</> : (isCreating ? <><i className="fa-solid fa-pen-to-square" /> Novo Pokemon</> : <><i className="fa-solid fa-box" /> Slot Vazio</>)}
                     </h3>

                     {(!getPokemonAt(selectedSlot) && !isCreating) ? (
                         <div className="flex-1 flex flex-col items-center justify-center text-zinc-300">
                             <span className="text-4xl font-black opacity-20 mb-2">{selectedSlot + 1}</span>
                             <span className="text-[10px] uppercase font-bold">Slot Disponível</span>
                         </div>
                     ) : (
                        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                           {/* Show inputs only if creating or if pokemon exists (read-only for view, editable only if creating? user said "fill info" so creating needs edit) */}
                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400 ml-2">Espécie</label>
                                <input 
                                    type="text" 
                                    value={formData.species} 
                                    onChange={e => setFormData({...formData, species: e.target.value})}
                                    disabled={!isCreating} // ReadOnly unless creating
                                    className={`w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-2 font-black italic text-zinc-700 outline-none transition-all ${isCreating ? 'focus:border-black' : 'opacity-80'}`}
                                    placeholder="Pikachu"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400 ml-2">Apelido (Nome)</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    disabled={!isCreating}
                                    className={`w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-2 font-black italic text-zinc-700 outline-none transition-all ${isCreating ? 'focus:border-black' : 'opacity-80'}`}
                                    placeholder="Sparky"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-2">Nível</label>
                                    <input 
                                        type="number" 
                                        value={formData.level} 
                                        onChange={e => setFormData({...formData, level: parseInt(e.target.value) || 1})}
                                        disabled={!isCreating}
                                        className={`w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-2 font-black italic text-zinc-700 outline-none transition-all text-center ${isCreating ? 'focus:border-black' : 'opacity-80'}`}
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-2">Gênero</label>
                                    <select 
                                        value={formData.gender} 
                                        onChange={e => setFormData({...formData, gender: e.target.value as any})}
                                        disabled={!isCreating}
                                        className={`w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-2 py-2 font-black text-zinc-700 outline-none transition-all appearance-none text-center ${isCreating ? 'focus:border-black' : 'opacity-80'}`}
                                    >
                                        <option value="U">-</option>
                                        <option value="M">♂</option>
                                        <option value="F">♀</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400 ml-2">Tipos (sep. virgula)</label>
                                <input 
                                    type="text" 
                                    value={typesInput} 
                                    onChange={e => setTypesInput(e.target.value)}
                                    disabled={!isCreating} 
                                    className={`w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-2 text-xs font-bold text-zinc-600 outline-none transition-all ${isCreating ? 'focus:border-black' : 'opacity-80'}`}
                                    placeholder="Electric, Steel..."
                                />
                            </div>
                        </div>
                     )}

                     <div className="mt-auto pt-4 border-t-2 border-zinc-100 flex flex-col gap-2">
                        {getPokemonAt(selectedSlot) ? (
                            <>
                                <button onClick={handleStartMove} className="w-full py-3 rounded-xl bg-orange-400 text-white font-black uppercase text-xs shadow-lg hover:scale-105 active:scale-95 transition-all">
                                    <i className="fa-solid fa-arrows-up-down-left-right" /> Mover
                                </button>
                                <button onClick={handleDelete} className="w-full py-3 rounded-xl bg-rose-500 text-white font-black uppercase text-xs shadow-lg hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all">
                                    <i className="fa-solid fa-trash" /> Excluir
                                </button>
                            </>
                        ) : (
                            isCreating ? (
                                <>
                                    <button onClick={handleCreate} className="w-full py-3 rounded-xl text-white font-black uppercase text-xs shadow-lg hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: theme.color }}>
                                        <i className="fa-solid fa-check" /> Confirmar
                                    </button>
                                    <button onClick={() => setIsCreating(false)} className="w-full py-2 rounded-xl text-zinc-400 font-bold uppercase text-[10px] hover:bg-zinc-100 transition-all">
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setViewMode('sheet')} className="w-full py-3 rounded-xl text-white font-black uppercase text-xs shadow-lg hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: theme.color }}>
                                    <i className="fa-solid fa-plus" /> Criar Pokemon
                                </button>
                            )
                        )}
                     </div>
                </div>
            )}
        </div>
      </div>

      {/* RIGHT PANEL - BOX GRID */}
      <div className="flex-1 flex flex-col rounded-[2.5rem] border-[12px] border-white shadow-2xl overflow-hidden relative" style={{ backgroundColor: theme.color }}>
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
         
         {/* Box Header */}
         <div className={`p-4 flex items-center justify-between text-white relative z-10 shadow-md ${theme.main}`}>
            <button className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"><i className="fa-solid fa-caret-left text-xl" /></button>
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Armazenamento</span>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter drop-shadow-md">{currentBox.name}</h2>
            </div>
            <button className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"><i className="fa-solid fa-caret-right text-xl" /></button>
         </div>

         {/* Box Grid */}
         <div className="flex-1 p-6 grid grid-cols-6 grid-rows-5 gap-3 relative z-10">
            {slots.map(slot => {
                const pkmn = getPokemonAt(slot);
                const isSelected = selectedSlot === slot;
                
                return (
                    <div 
                        key={slot}
                        onClick={() => handleSlotClick(slot)}
                        className={`
                            relative rounded-2xl border-2 transition-all cursor-pointer group
                            flex items-center justify-center
                            ${isSelected ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)] scale-110 z-20' : 'bg-white/80 border-white/50 hover:bg-white hover:scale-105'}
                            ${pkmn && moveSource === slot ? 'animate-bounce' : ''}
                        `}
                        style={isSelected || (pkmn && moveSource === slot) ? { borderColor: theme.color } : {}}
                    >
                        {pkmn ? (
                            <div className="flex flex-col items-center animate-in zoom-in spin-in-3 duration-300">
                                <i className={`fa-solid fa-dragon text-2xl drop-shadow-sm mb-1 ${moveSource === slot ? '' : 'text-zinc-800'}`} style={moveSource === slot ? { color: theme.color } : {}} />
                                <span className="text-[8px] font-black uppercase text-zinc-600 leading-none">{pkmn.species.slice(0, 6)}</span>
                            </div>
                        ) : (
                            isSelected && (
                                <span className="text-[8px] font-black uppercase animate-pulse" style={{ color: theme.color }}>Vazio</span>
                            )
                        )}
                        
                        {/* Selected Indicator */}
                        {isSelected && moveSource === null && (
                            <div className="absolute -inset-1 border-2 rounded-3xl animate-pulse pointer-events-none" style={{ borderColor: theme.color }} />
                        )}
                        
                         {/* Move Source Indicator */}
                        {moveSource === slot && (
                           <div className="absolute -inset-2 border-4 border-dashed rounded-3xl animate-spin-slow pointer-events-none" style={{ borderColor: theme.color }} />
                        )}
                    </div>
                );
            })}
         </div>
         
         <div className={`p-2 text-center ${theme.dark}`}>
             <span className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">SISTEMA DE ARMAZENAMENTO POKEMON // V.2.0</span>
         </div>
      </div>
    </div>
  );
};
