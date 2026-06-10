import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PCBox, StoredPokemon } from '../types';
import { PokedexTheme } from '../constants';

interface PcTabProps {
  boxes: PCBox[];
  onChange: (boxes: PCBox[]) => void;
  theme: PokedexTheme;
  characterId: string;
  openPokemonTab: (params: {
    origin: 'pc' | 'team';
    type: 'ephemeral' | 'persistent';
    label: string;
    pokemonId?: string;
    boxIndex?: number;
    slot?: number;
  }) => void;
}

export const PcTab: React.FC<PcTabProps> = ({ boxes, onChange, theme, characterId, openPokemonTab }) => {
  const [currentBoxIndex, setCurrentBoxIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [moveSource, setMoveSource] = useState<{ boxIndex: number, slot: number } | null>(null);

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
  }, [selectedSlot, currentBox, getPokemonAt]);

  const handleSlotClick = (slot: number) => {
    if (moveSource !== null) {
      // Execute Move
      const newBoxes = [...boxes];
      const targetBoxIndex = currentBoxIndex;
      const sourceBoxIndex = moveSource.boxIndex;

      const sourceBox = { ...newBoxes[sourceBoxIndex] };
      const targetBox = targetBoxIndex === sourceBoxIndex ? sourceBox : { ...newBoxes[targetBoxIndex] };

      const sourcePkmnIndex = sourceBox.pokemons.findIndex(p => p.slot === moveSource.slot);
      const targetPkmnIndex = targetBox.pokemons.findIndex(p => p.slot === slot);

      if (sourcePkmnIndex !== -1) {
        const sourcePkmn = { ...sourceBox.pokemons[sourcePkmnIndex], slot };
        
        let targetPkmn = null;
        if (targetPkmnIndex !== -1) {
          targetPkmn = { ...targetBox.pokemons[targetPkmnIndex], slot: moveSource.slot };
        }

        // Remove from old positions
        sourceBox.pokemons = sourceBox.pokemons.filter((_, idx) => idx !== sourcePkmnIndex);
        if (targetPkmn && targetBoxIndex !== sourceBoxIndex) {
            targetBox.pokemons = targetBox.pokemons.filter((_, idx) => idx !== targetPkmnIndex);
        } else if (targetPkmn && targetBoxIndex === sourceBoxIndex) {
            // Se for na mesma caixa, o targetPkmnIndex mudou depois do primeiro filter,
            // então filtramos pelo slot direto
            sourceBox.pokemons = sourceBox.pokemons.filter(p => p.slot !== slot);
        }

        // Add to new positions
        if (targetBoxIndex === sourceBoxIndex) {
            sourceBox.pokemons.push(sourcePkmn);
            if (targetPkmn) sourceBox.pokemons.push(targetPkmn);
            newBoxes[targetBoxIndex] = sourceBox;
        } else {
            targetBox.pokemons.push(sourcePkmn);
            if (targetPkmn) sourceBox.pokemons.push(targetPkmn);
            newBoxes[sourceBoxIndex] = sourceBox;
            newBoxes[targetBoxIndex] = targetBox;
        }

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
       capabilities: { 
        force: { value: 0, description: '' }, 
        intelligence: { value: 0, description: '' }, 
        jump: { value: 0, description: '' }, 
        other: [] 
      },
      capabilityTrait: { name: '', description: '' },
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
    if (selectedSlot === null) return;
    setMoveSource({ boxIndex: currentBoxIndex, slot: selectedSlot });
    setSelectedSlot(null); // Optional: clear selection to focus on picking destination
  };

  const slots = Array.from({ length: 30 }, (_, i) => i);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-in fade-in zoom-in-95 relative">
      {/* LEFT PANEL - DETAILS / FORM */}
      <div className="w-full lg:w-1/3 flex flex-col">
        <div className="bg-white p-6 rounded-[2.5rem] border-[4px] shadow-[8px_8px_0px_rgba(0,0,0,0.1)] h-full flex flex-col relative overflow-hidden" style={{ borderColor: theme.color }}>
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
                     <h3 className="text-sm font-black uppercase mb-6 border-b-2 border-zinc-100 pb-2 flex items-center gap-2" style={{ color: theme.color }}>
                        {getPokemonAt(selectedSlot) ? <><i className="fa-solid fa-id-card" style={{ color: theme.color }} /> Detalhes</> : (isCreating ? <><i className="fa-solid fa-pen-to-square" style={{ color: theme.color }} /> Novo Pokemon</> : <><i className="fa-solid fa-box" style={{ color: theme.color }} /> Slot Vazio</>)}
                     </h3>

                     {(!getPokemonAt(selectedSlot) && !isCreating) ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-zinc-300">
                              <span className="text-4xl font-black opacity-20 mb-2">{selectedSlot + 1}</span>
                              <span className="text-[10px] uppercase font-bold">Slot Disponível</span>
                          </div>
                     ) : (
                        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
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
                                <button onClick={() => {
                                  const pkmn = getPokemonAt(selectedSlot);
                                  openPokemonTab({
                                    origin: 'pc',
                                    type: 'ephemeral',
                                    boxIndex: currentBoxIndex,
                                    slot: selectedSlot,
                                    label: pkmn?.name || pkmn?.species || 'Pokémon'
                                  });
                                }} className="w-full py-3 rounded-xl text-white font-black uppercase text-xs shadow-lg hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: theme.color }}>
                                    <i className="fa-solid fa-id-card" /> Abrir Ficha
                                </button>
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
                                <button onClick={() => {
                                  openPokemonTab({
                                    origin: 'pc',
                                    type: 'ephemeral',
                                    boxIndex: currentBoxIndex,
                                    slot: selectedSlot,
                                    label: 'Novo Pokémon'
                                  });
                                }} className="w-full py-3 rounded-xl text-white font-black uppercase text-xs shadow-lg hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: theme.color }}>
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
            <button
              onClick={() => { setCurrentBoxIndex(i => Math.max(0, i - 1)); setSelectedSlot(null); }}
              disabled={currentBoxIndex === 0}
              className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <i className="fa-solid fa-caret-left text-xl" />
            </button>
            <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{currentBoxIndex + 1} / 99</span>
                <input
                  value={boxes[currentBoxIndex]?.name ?? ''}
                  onChange={e => {
                    const newBoxes = [...boxes];
                    newBoxes[currentBoxIndex] = { ...newBoxes[currentBoxIndex], name: e.target.value };
                    onChange(newBoxes);
                  }}
                  className="text-2xl font-black italic uppercase tracking-tighter drop-shadow-md bg-transparent text-white text-center outline-none border-b-2 border-white/0 focus:border-white/50 transition-all w-48"
                />
            </div>
            <button
              onClick={() => { setCurrentBoxIndex(i => Math.min(98, i + 1)); setSelectedSlot(null); }}
              disabled={currentBoxIndex === 98}
              className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <i className="fa-solid fa-caret-right text-xl" />
            </button>
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
                            ${pkmn && moveSource?.slot === slot && moveSource.boxIndex === currentBoxIndex ? 'animate-bounce' : ''}
                        `}
                        style={isSelected || (pkmn && moveSource?.slot === slot && moveSource.boxIndex === currentBoxIndex) ? { borderColor: theme.color } : {}}
                    >
                        {pkmn ? (
                            <div className="flex flex-col items-center justify-center w-full h-full animate-in zoom-in spin-in-3 duration-300 p-1">
                                {pkmn.imageUrl ? (
                                    <img src={pkmn.imageUrl} alt={pkmn.name || pkmn.species} className="w-full h-full object-contain drop-shadow-sm" />
                                ) : (
                                    <>
                                        <i className={`fa-solid fa-circle-dot text-2xl drop-shadow-sm mb-1 ${moveSource?.slot === slot && moveSource.boxIndex === currentBoxIndex ? '' : 'text-zinc-600'}`} style={moveSource?.slot === slot && moveSource.boxIndex === currentBoxIndex ? { color: theme.color } : {}} />
                                        <span className="text-[7px] font-black uppercase text-zinc-500 leading-none text-center truncate w-full px-1">{pkmn.species || 'PKMN'}</span>
                                    </>
                                )}
                            </div>
                        ) : (
                            isSelected && (
                                <span className="text-[8px] font-black uppercase animate-pulse" style={{ color: theme.color }}>Vazio</span>
                            )
                        )}
                        
                        {/* Name Tooltip */}
                        {pkmn && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center transform" style={{ backgroundColor: theme.color }}>
                                {pkmn.name || pkmn.species}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ backgroundColor: theme.color }} />
                            </div>
                        )}
                        
                        {/* Selected Indicator */}
                        {isSelected && moveSource === null && (
                            <div className="absolute -inset-1 border-2 rounded-3xl animate-pulse pointer-events-none" style={{ borderColor: theme.color }} />
                        )}
                        
                         {/* Move Source Indicator */}
                        {moveSource?.slot === slot && moveSource.boxIndex === currentBoxIndex && (
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
