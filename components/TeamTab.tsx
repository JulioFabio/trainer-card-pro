import React, { useState, useMemo } from 'react';
import { PCBox, StoredPokemon } from '../types';
import { PokedexTheme } from '../constants';
import { PokemonCreationSheet } from './PokemonCreationSheet';

interface TeamTabProps {
  equipeIds: string[];
  pcBoxes: PCBox[];
  theme: PokedexTheme;
  onChange: (newEquipeIds: string[]) => void;
  onUpdateBoxes: (newBoxes: PCBox[]) => void;
}

export const TeamTab: React.FC<TeamTabProps> = ({ equipeIds, pcBoxes, theme, onChange, onUpdateBoxes }) => {
  const [isSelectingForSlot, setIsSelectingForSlot] = useState<number | null>(null);
  const [editingPokemon, setEditingPokemon] = useState<StoredPokemon | null>(null);

  const allPokemons = useMemo(() => pcBoxes.flatMap(b => b.pokemons.map(p => ({ ...p, boxId: b.id }))), [pcBoxes]);

  // Ensure equipe shows 6 slots visually
  const slots = Array.from({ length: 6 }, (_, i) => i);

  const handleSelectPokemon = (pokemonId: string) => {
    if (isSelectingForSlot === null) return;
    const newEquipe = [...equipeIds];
    
    if (isSelectingForSlot >= newEquipe.length) {
        newEquipe.push(pokemonId);
    } else {
        newEquipe[isSelectingForSlot] = pokemonId;
    }
    
    const denseEquipe = newEquipe.filter(Boolean);
    onChange(denseEquipe);
    setIsSelectingForSlot(null);
  };

  const handleRemoveMember = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newEquipe = [...equipeIds];
    newEquipe.splice(index, 1);
    onChange(newEquipe);
  };

  const handleSavePokemon = (updatedPokemon: StoredPokemon) => {
    const newBoxes = [...pcBoxes];
    let found = false;
    for (const box of newBoxes) {
      const idx = box.pokemons.findIndex(p => p.id === updatedPokemon.id);
      if (idx !== -1) {
        box.pokemons[idx] = updatedPokemon;
        found = true;
        break;
      }
    }
    
    if (found) {
      onUpdateBoxes(newBoxes);
    }
    setEditingPokemon(null);
  };

  return (
    <div className="relative h-full flex flex-col animate-in fade-in">
        <h2 className="text-xl font-black text-zinc-900 uppercase mb-6 flex items-center gap-2 px-4 shadow-sm border-b-2 border-zinc-200/50 pb-2">
           <i className="fa-solid fa-users" style={{ color: theme.color }} /> Equipe Principal
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 px-4 content-start overflow-y-auto custom-scrollbar pb-6">
            {slots.map(i => {
                const pokemonId = equipeIds[i];
                const pkmn = pokemonId ? allPokemons.find(p => p.id === pokemonId) : null;

                if (pkmn) {
                    return (
                        <div key={`slot-${i}-${pkmn.id}`} onClick={() => setEditingPokemon(pkmn)} className="bg-white p-5 rounded-[2.5rem] shadow-md border-4 border-black flex flex-col items-center group hover:scale-105 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden h-[260px] justify-center">
                           <div className="absolute top-0 right-0 p-4 z-20">
                               <button onClick={(e) => handleRemoveMember(e, i)} className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                                   <i className="fa-solid fa-xmark text-sm" />
                               </button>
                           </div>

                           <div className="w-28 h-28 rounded-full mb-4 flex items-center justify-center border-4 relative overflow-hidden transition-colors shadow-inner drop-shadow-md bg-zinc-50 shrink-0 z-10" style={{ borderColor: theme.color }}>
                               {pkmn.imageUrl ? (
                                   <img src={pkmn.imageUrl} alt={pkmn.name} className="w-full h-full object-cover" />
                               ) : (
                                   <i className="fa-solid fa-circle-dot text-4xl opacity-30" style={{ color: theme.color }} />
                               )}
                           </div>
                           
                           <div className="text-center w-full relative z-10 bg-white/80 rounded-xl p-2 shrink-0">
                               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">{pkmn.species} - Lvl {pkmn.level}</span>
                               <h4 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none truncate w-full" style={{ color: theme.color }}>{pkmn.name}</h4>
                               
                               <div className="flex gap-1 justify-center mt-2 flex-wrap">
                                  {pkmn.types.slice(0, 2).map((type, idx) => (
                                      <span key={idx} className="bg-zinc-800 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">{type}</span>
                                  ))}
                               </div>
                           </div>
                           
                           <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-5 pointer-events-none z-0" style={{ backgroundColor: theme.color }} />
                        </div>
                    );
                }

                if (i > equipeIds.length) return null;

                return (
                    <div key={`empty-${i}`} onClick={() => setIsSelectingForSlot(i)} className="bg-zinc-100/50 p-5 rounded-[2.5rem] border-4 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 hover:border-black hover:text-black hover:bg-zinc-50 transition-all cursor-pointer h-[260px] group">
                        <div className="w-16 h-16 rounded-full border-4 border-dashed border-zinc-300 group-hover:border-black flex items-center justify-center mb-4 transition-colors">
                           <i className="fa-solid fa-plus text-2xl" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-center">Adicionar<br/>Membro</span>
                    </div>
                );
            })}
        </div>

        {isSelectingForSlot !== null && (
            <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center p-6 animate-in fade-in">
                <div className="bg-white w-full max-w-3xl max-h-[85%] rounded-3xl border-4 border-black shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                   <div className="p-4 border-b-2 border-zinc-100 flex justify-between items-center bg-zinc-900" style={{ borderBottomColor: theme.color }}>
                       <h3 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-2"><i className="fa-solid fa-desktop" style={{ color: theme.color }} /> Selecionar do PC</h3>
                       <button onClick={() => setIsSelectingForSlot(null)} className="text-white/60 hover:text-rose-500 transition-colors"><i className="fa-solid fa-xmark text-xl" /></button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-zinc-50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 content-start relative">
                       {allPokemons.map(pkmn => {
                           const isAlreadyInTeam = equipeIds.includes(pkmn.id);
                           return (
                               <div 
                                  key={pkmn.id} 
                                  onClick={() => !isAlreadyInTeam && handleSelectPokemon(pkmn.id)}
                                  className={`p-4 rounded-3xl border-4 flex flex-col items-center text-center transition-all relative overflow-hidden ${isAlreadyInTeam ? 'border-zinc-200 opacity-50 cursor-not-allowed bg-zinc-100 grayscale' : 'border-black hover:scale-105 bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.1)] cursor-pointer group'}`}
                               >
                                  <div className="w-16 h-16 rounded-full mb-3 bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center overflow-hidden z-10">
                                     {pkmn.imageUrl ? (
                                         <img src={pkmn.imageUrl} alt={pkmn.name} className="w-full h-full object-cover" />
                                     ) : (
                                         <i className={`fa-solid fa-circle-dot text-2xl ${isAlreadyInTeam ? 'text-zinc-400' : 'text-zinc-600 group-hover:text-black'}`} />
                                     )}
                                  </div>
                                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5 truncate w-full z-10">{pkmn.species}</span>
                                  <span className="text-[13px] font-black tracking-tighter text-zinc-900 uppercase italic truncate w-full z-10">{pkmn.name}</span>
                                  
                                  {isAlreadyInTeam && <div className="absolute inset-0 flex items-center justify-center z-20 backdrop-blur-[1px] bg-white/20"><span className="bg-black text-white text-[10px] font-black py-1.5 px-3 rounded-full uppercase tracking-widest shadow-lg -rotate-12 border-2 border-zinc-800">Na Equipe</span></div>}
                               </div>
                           );
                       })}
                       {allPokemons.length === 0 && (
                           <div className="col-span-full py-20 text-center flex flex-col justify-center items-center opacity-30">
                              <i className="fa-solid fa-ghost text-6xl mb-6" />
                              <span className="text-xl font-black uppercase tracking-widest">O PC ESTÁ VAZIO</span>
                              <span className="text-sm font-bold uppercase mt-2">Crie pokémons na aba PC primeiro.</span>
                           </div>
                       )}
                   </div>
                </div>
            </div>
        )}

        {editingPokemon && (
            <div className="absolute inset-0 z-50 bg-[#0f172a] rounded-[2.5rem] overflow-hidden animate-in zoom-in-95">
                <PokemonCreationSheet
                    initialData={editingPokemon}
                    onSave={handleSavePokemon}
                    onCancel={() => setEditingPokemon(null)}
                    theme={theme}
                />
            </div>
        )}
    </div>
  );
};
