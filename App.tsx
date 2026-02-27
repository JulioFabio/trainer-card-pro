
import React, { useState, useEffect, useMemo } from 'react';
import { TrainerData, Stats, Skill } from './types';
import { INITIAL_TRAINER_DATA, POKEDEX_THEMES, DEFAULT_SKILLS, STAT_LABELS, BASE_POINTS, MAX_STAT_INITIAL } from './constants';
import { InfoField } from './components/InfoField';
import { DerivedBox } from './components/DerivedBox';
import { SmartInput } from './components/SmartInput';
import { NotesTab } from './components/NotesTab';
import { PcTab } from './components/PcTab';

type Tab = 'treinador' | 'combate' | 'equipe' | 'mochila' | 'notas' | 'computador';

const STORAGE_KEY = 'trainer_card_pro_data';

const App: React.FC = () => {
  // Inicializa o estado tentando carregar do LocalStorage
  const [trainer, setTrainer] = useState<TrainerData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migração de dados antigos (string[] -> Talent[])
        if (parsed.talentos && parsed.talentos.length > 0 && typeof parsed.talentos[0] === 'string') {
          parsed.talentos = parsed.talentos.map((t: string) => ({ name: t, description: 'Sem descrição.' }));
        }
        // Migração de Perícias (Se não existir, usa o padrão)
        if (!parsed.skills || parsed.skills.length === 0) {
           parsed.skills = DEFAULT_SKILLS;
        } else {
           // Merge para garantir que novas perícias apareçam
           const existingNames = new Set(parsed.skills.map((s: Skill) => s.name));
           const newSkills = DEFAULT_SKILLS.filter(s => !existingNames.has(s.name));
           parsed.skills = [...parsed.skills, ...newSkills];
        }

        return { ...INITIAL_TRAINER_DATA, ...parsed };
      } catch {
        return INITIAL_TRAINER_DATA;
      }
    }
    return INITIAL_TRAINER_DATA;
  });

  const [activeTab, setActiveTab] = useState<Tab>('treinador');
  const [currentTheme, setCurrentTheme] = useState(POKEDEX_THEMES[0]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newTalent, setNewTalent] = useState('');
  const [newTalentDesc, setNewTalentDesc] = useState('');
  const [hoveredTalent, setHoveredTalent] = useState<{ content: string, x: number, y: number } | null>(null);
  const [showOnlyTrained, setShowOnlyTrained] = useState(false);

  // --- CÁLCULOS MATEMÁTICOS AUTOMÁTICOS ---
  
  // Cálculo de Perícia
  const calculateSkillTotal = (skill: typeof trainer.skills[0], stats: Stats) => {
     // Perícias de Saúde são apenas "Possui" (Rank > 0) ou "Não Possui"
     if (skill.attr === 'saude') return 0;
     
     // Usa a função existente definida mais abaixo
     const mod = Math.floor((stats[skill.attr] - 10) / 2);
     
     if (skill.ranks === 0) return 0; // Untrained = d20 (apenas dado)
     if (skill.ranks === 1) return 2 + mod + skill.bonus; // Trained = d20 + 2 + Mod + Bônus
     if (skill.ranks === 2) return 4 + (2 * mod) + skill.bonus; // Expert = d20 + 4 + 2*Mod + Bônus
     return 0;
  }; 

  // 1. HP Máximo: (Saúde + Nível) * 4
  const calculatedHpMax = useMemo(() => {
    return (trainer.stats.saude + trainer.levelGeral) * 4;
  }, [trainer.stats.saude, trainer.levelGeral]);

  // 2. Evasões (Derivadas dos Atributos / 5)
  const calculatedEvasion = useMemo(() => ({
    fisica: Math.floor(trainer.stats.defesa / 5),
    especial: Math.floor(trainer.stats.defEspecial / 5),
    veloz: Math.floor(trainer.stats.velocidade / 5)
  }), [trainer.stats.defesa, trainer.stats.defEspecial, trainer.stats.velocidade]);

  // 3. Movimentação (Terrestre = 5 + Vel/2)
  const calculatedMovement = useMemo(() => {
    const terrestre = 5 + Math.floor(trainer.stats.velocidade / 2);
    const natacao = Math.floor(terrestre / 2);
    const subaquatico = Math.floor(natacao / 2);
    return { terrestre, natacao, subaquatico };
  }, [trainer.stats.velocidade]);

  // 4. Pontos Gastos (Soma dos Atributos Base)
  const totalSpentPoints = useMemo(() => {
    return Object.values(trainer.stats).reduce((acc: number, val: number) => acc + val, 0);
  }, [trainer.stats]);

  // 5. Pontos Máximos Dinâmicos: Regra da Tabela (66 até lvl 10, depois +1 a cada nível ímpar)
  const calculatedMaxPoints = useMemo(() => {
    if (trainer.levelGeral <= 10) {
      return BASE_POINTS + trainer.levelGeral;
    }
    // Nível 10 = 76.
    // Nível 11 = 77 (+1)
    // Nível 12 = 77 (+0)
    // Fórmula: 76 + ArredondaPraCima((Nivel - 10) / 2)
    return 76 + Math.ceil((trainer.levelGeral - 10) / 2);
  }, [trainer.levelGeral]);

  // 7. Max Talentos: Regra da Tabela (2 até lvl 0(?), 2+lvl até 10, depois +1 a cada nível ímpar)
  // Tabela: Lvl 0=2, Lvl 1=3 ... Lvl 10=12.
  // Lvl 11=13 (ímpar +1), Lvl 12=13.
  const calculatedMaxTalents = useMemo(() => {
     if (trainer.levelGeral <= 10) {
       return 2 + trainer.levelGeral;
     }
     // Nivel 10 = 12.
     // Nivel 11 = 13 (+1).
     // Fórmula segue mesma lógica dos pontos: 12 + ceil((Nivel - 10)/2)
     return 12 + Math.ceil((trainer.levelGeral - 10) / 2);
  }, [trainer.levelGeral]);

  // 6. Cap de Atributo Dinâmico: Base + (Nível / 2)
  const calculatedStatCap = useMemo(() => {
    return MAX_STAT_INITIAL + Math.floor(trainer.levelGeral / 2);
  }, [trainer.levelGeral]);

  // Modificador genérico: (Valor - 10) / 2
  const calculateModifier = (val: number) => Math.floor((val - 10) / 2);

  // Efeito para garantir que o HP atual não ultrapasse o novo máximo calculado
  useEffect(() => {
    if (trainer.hpActual > calculatedHpMax) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrainer(prev => ({ ...prev, hpActual: calculatedHpMax }));
    }
  }, [calculatedHpMax, trainer.hpActual]);

  // Salvamento automático
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trainer));
  }, [trainer]);

  // Aviso de saída (Prevent Data Loss)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Mensagens personalizadas não são mais suportadas pela maioria dos navegadores modernos,
      // mas definir returnValue é necessário para ativar o prompt padrão.
      e.preventDefault();
      e.returnValue = ''; 
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // --- HANDLERS ---

  const handleStatChange = (key: keyof Stats, value: number) => {
    setTrainer(prev => ({
      ...prev,
      ...prev,
      stats: { ...prev.stats, [key]: Math.max(0, value) }
    }));
  };

  const handleProfileChange = (field: keyof TrainerData, value: TrainerData[keyof TrainerData]) => {
    setTrainer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTrainer(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(trainer, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ficha_${trainer.nomePersonagem.toLowerCase().replace(/\s/g, '_') || 'treinador'}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setTrainer({ ...INITIAL_TRAINER_DATA, ...json });
        alert("Ficha importada com sucesso!");
      } catch {
        alert("Erro no arquivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  const resetTrainer = () => {
    if (confirm("Deseja resetar a ficha? Todos os dados atuais serão perdidos.")) {
      setTrainer(INITIAL_TRAINER_DATA);
      localStorage.removeItem(STORAGE_KEY);
      alert("Ficha resetada com sucesso!");
    }
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: any = {
      id: Date.now().toString(),
      name: newItemName,
      description: newItemDesc || 'Sem descrição',
      quantity: newItemQty
    };
    setTrainer(prev => ({
      ...prev,
      inventario: [...prev.inventario, newItem]
    }));
    setNewItemName('');
    setNewItemDesc('');
    setNewItemQty(1);
  };

  const updateItemQty = (id: string, delta: number) => {
    setTrainer(prev => ({
      ...prev,
      inventario: prev.inventario.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
    }));
  };

  const addTalent = () => {
    if (!newTalent.trim()) return;
    setTrainer(prev => ({
      ...prev,
      talentos: [...prev.talentos, { name: newTalent.trim(), description: newTalentDesc.trim() || 'Sem descrição.' }]
    }));
    setNewTalent('');
    setNewTalentDesc('');
  };

  const removeTalent = (index: number) => {
    setTrainer(prev => ({
       ...prev,
       talentos: prev.talentos.filter((_, i) => i !== index)
    }));
  };

  const handleTalentHover = (e: React.MouseEvent, content: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHoveredTalent({
      content,
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  const handleSkillChange = (index: number, field: 'ranks' | 'bonus', value: number) => {
    setTrainer(prev => {
       const newSkills = [...prev.skills];
       newSkills[index] = { ...newSkills[index], [field]: value };
       return { ...prev, skills: newSkills };
    });
  };



  // --- UI COMPONENTS ---



  const rootStyle = {
    '--theme-color': currentTheme.color,
    '--scrollbar-color': `${currentTheme.color}66`,
    '--scrollbar-color-hover': `${currentTheme.color}aa`,
  } as React.CSSProperties;

  return (
    <div style={rootStyle} className="min-h-screen bg-zinc-900 flex items-center justify-center p-2 sm:p-6 font-sans select-none overflow-hidden">
      <div className={`${currentTheme.main} w-full max-w-7xl h-[95vh] rounded-[2.5rem] shadow-2xl border-[12px] border-black/20 overflow-hidden flex flex-col transition-colors duration-500`}>
        
        {/* Header Superior */}
        <div className="bg-black/30 p-4 flex items-center justify-between border-b border-white/10 dark-spin-buttons">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-400 border-4 border-white shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" />
            <div className="flex gap-2">
              {POKEDEX_THEMES.map(t => (
                <button key={t.id} onClick={() => setCurrentTheme(t)} className={`w-5 h-5 rounded-full border border-white/20 transition-all hover:scale-110 ${t.main} ${currentTheme.id === t.id ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-60'}`} />
              ))}
            </div>
          </div>
          <div className="hidden sm:flex gap-4 text-[10px] font-bold text-white tracking-widest uppercase items-center">
            <div className="bg-black/40 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <span className="opacity-80 font-black tracking-tighter">DIAS JORNADA:</span>
              <input type="number" value={trainer.diasJornada} onChange={(e) => handleProfileChange('diasJornada', parseInt(e.target.value) || 0)} className="bg-transparent w-8 text-center text-white font-black outline-none" />
            </div>
            <div className="bg-black/40 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <span className="opacity-80 font-black tracking-tighter">POKEDEX:</span>
              <input type="number" value={trainer.pokedexCount} onChange={(e) => handleProfileChange('pokedexCount', parseInt(e.target.value) || 0)} className="bg-transparent w-8 text-center text-white font-black outline-none" />
            </div>
          </div>
        </div>

        {/* Sistema de Abas */}
        <div className="flex flex-wrap bg-black/10 px-2 pt-2 gap-1 border-b border-white/5 overflow-x-auto no-scrollbar">
          {([
            { id: 'treinador', label: 'Treinador' },
            { id: 'combate', label: 'Combate' },
            { id: 'equipe', label: 'Equipe' },
            { id: 'mochila', label: 'Mochila' },
            { id: 'computador', label: 'PC' },
            { id: 'notas', label: 'Notas' }
          ]).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`px-6 py-2 rounded-t-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab.id ? 'bg-zinc-100 text-zinc-900 shadow-lg translate-y-0' : 'bg-black/30 text-white/70 hover:text-white translate-y-1'}`}>{tab.label}</button>
          ))}
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 bg-zinc-100 m-2 rounded-3xl p-4 sm:p-6 shadow-inner overflow-y-auto custom-scrollbar border-b-8 border-black/5">
          
          {activeTab === 'treinador' && (
            <div className="animate-in fade-in zoom-in-95 h-full flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
                <div className="lg:col-span-8 space-y-6">
                  {/* Avatar e Identidade */}
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="relative w-40 h-40 rounded-[2.5rem] border-4 border-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden group shrink-0 transition-transform hover:rotate-1">
                      {trainer.avatar ? (
                        <img src={trainer.avatar} className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        <i className="fa-solid fa-user-ninja text-6xl text-zinc-200" />
                      )}
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <i className="fa-solid fa-camera text-2xl text-white" />
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="flex-1 w-full space-y-3">
                      <div className="flex border-4 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,0.1)] transition-colors duration-500" style={{ backgroundColor: currentTheme.color }}>
                        <div className="px-4 flex items-center font-black italic uppercase text-[10px] text-white tracking-widest drop-shadow-sm border-r-2 border-black/20">Identidade</div>
                        <input type="text" value={trainer.nomePersonagem} onChange={(e) => handleProfileChange('nomePersonagem', e.target.value)} className="flex-1 bg-transparent px-4 py-2 text-2xl font-black italic uppercase outline-none text-white placeholder-white/50" placeholder="NOME DO TREINADOR" />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1 border-2 border-black rounded-xl overflow-hidden flex shadow-[2px_2px_0px_rgba(0,0,0,0.05)] transition-colors duration-500" style={{ backgroundColor: currentTheme.color }}>
                           <div className="bg-black/20 px-3 flex items-center font-black italic uppercase text-[9px] border-r-2 border-black/10 text-white tracking-widest">Frase</div>
                           <input type="text" value={trainer.conceito} onChange={(e) => handleProfileChange('conceito', e.target.value)} className="flex-1 px-3 py-1 font-black italic text-white outline-none text-xs placeholder-white/50 bg-transparent" placeholder="CONCEITO DO PERSONAGEM" />
                        </div>
                        {/* BOX NÍVEL GERAL - MOTOR DOS CÁLCULOS */}
                        <div className="w-24 border-2 border-black rounded-xl overflow-hidden text-white flex flex-col items-center justify-center p-1 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] transition-colors duration-500" style={{ backgroundColor: currentTheme.color }}>
                          <span className="text-[8px] font-black uppercase text-white/90 drop-shadow-sm tracking-tighter">Nível Geral</span>
                          <input type="number" value={trainer.levelGeral} onChange={(e) => handleProfileChange('levelGeral', Math.max(0, parseInt(e.target.value) || 0))} className="bg-transparent w-full text-center text-xl font-black outline-none text-white drop-shadow-md" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dados Biográficos */}
                    <div className="bg-white p-4 rounded-3xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
                      <h3 className="text-[10px] font-black uppercase text-zinc-800 mb-3 border-b-2 border-zinc-100 pb-1 flex items-center gap-2"><i className="fa-solid fa-address-card opacity-80" /> Dados Biográficos</h3>
                      <div className="grid grid-cols-1 gap-2">
                        <InfoField label="Idade" value={trainer.idade} field="idade" type="number" onChange={handleProfileChange} themeColor={currentTheme.color} />
                        <InfoField label="Gênero" value={trainer.genero} field="genero" onChange={handleProfileChange} themeColor={currentTheme.color} />
                        <InfoField label="Peso" value={trainer.peso} field="peso" onChange={handleProfileChange} themeColor={currentTheme.color} />
                        <InfoField label="Altura" value={trainer.altura} field="altura" onChange={handleProfileChange} themeColor={currentTheme.color} />
                        <InfoField label="Naturalidade" value={trainer.naturalidade} field="naturalidade" onChange={handleProfileChange} themeColor={currentTheme.color} />
                        <InfoField label="Jogador" value={trainer.jogador} field="jogador" onChange={handleProfileChange} themeColor={currentTheme.color} />
                        <InfoField label="Campanha" value={trainer.campanha} field="campanha" onChange={handleProfileChange} themeColor={currentTheme.color} />
                      </div>
                    </div>
                    {/* Coluna 2: Classes e Movimentos Stackados */}
                    <div className="space-y-6">
                      {/* Classes e Níveis de Classe */}
                      <div className="bg-white p-3 rounded-3xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.05)] h-fit">
                        <h3 className="text-[10px] font-black uppercase text-zinc-800 mb-2 border-b-2 border-zinc-100 pb-1 flex items-center gap-2"><i className="fa-solid fa-graduation-cap opacity-80" /> Classes de Carreira</h3>
                        <div className="space-y-2">
                          {[1, 2, 3, 4].map(num => (
                            <div key={num} className="flex border-2 border-black rounded-xl overflow-hidden min-h-[2.5rem] h-auto group hover:border-black/50 transition-all shadow-[1px_1px_0px_rgba(0,0,0,0.02)]">
                              <div className="w-16 flex items-center justify-center border-r-2 border-black border-dotted text-white transition-colors duration-500" style={{ backgroundColor: currentTheme.color }}>
                                 <span className="text-[8px] font-black uppercase drop-shadow-sm tracking-tighter">Classe {num}</span>
                              </div>
                              <input type="text" value={trainer[`classe${num}` as keyof TrainerData] as string} onChange={(e) => handleProfileChange(`classe${num}` as keyof TrainerData, e.target.value)} className="flex-1 bg-white px-3 text-[10px] font-black italic text-zinc-800 outline-none" placeholder="Definir..." />
                              <div className="w-10 flex items-center justify-center text-white transition-colors duration-500 drop-shadow-sm border-l-2 border-black border-dotted" style={{ backgroundColor: currentTheme.color }}>
                                  <input type="number" value={trainer[`level${num}` as keyof TrainerData] as number} onChange={(e) => handleProfileChange(`level${num}` as keyof TrainerData, Math.max(0, parseInt(e.target.value) || 0))} className="bg-transparent w-full text-center text-[10px] font-black outline-none" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Movimentos (Visualização) */}
                      <div className="bg-white p-3 rounded-3xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.05)] h-fit">
                        <h3 className="text-[10px] font-black uppercase text-zinc-800 mb-2 border-b-2 border-zinc-100 pb-1 flex items-center gap-2"><i className="fa-solid fa-shoe-prints opacity-80" /> Capacidade de Movimento</h3>
                        <div className="flex flex-col gap-2">
                          <DerivedBox label="Terrestre" value={calculatedMovement.terrestre} icon="fa-person-walking" color={currentTheme.color} />
                          <DerivedBox label="Natação" value={calculatedMovement.natacao} icon="fa-person-swimming" color={currentTheme.color} />
                          <DerivedBox label="Subaquático" value={calculatedMovement.subaquatico} icon="fa-soap" color={currentTheme.color} />
                        </div>
                      </div>
                    </div>


                  </div>
                </div>

                {/* COLUNA DIREITA: TALENTOS */}
                <div className="lg:col-span-4 h-full">
                  <div className="bg-white p-5 rounded-[2.5rem] border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,0.15)] h-full flex flex-col">
                     <div className="flex justify-between items-end mb-4 border-b-2 border-zinc-100 pb-2">
                        <h3 className="text-[10px] font-black uppercase text-zinc-800 flex items-center gap-2"><i className="fa-solid fa-star opacity-80" /> Talentos</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${trainer.talentos.length > calculatedMaxTalents ? 'text-rose-500 animate-pulse' : 'text-zinc-400'}`}>
                           {trainer.talentos.length} / {calculatedMaxTalents}
                        </span>
                     </div>
                     
                     <div className="flex-1 content-start flex flex-wrap gap-2 mb-4 overflow-y-auto custom-scrollbar max-h-[500px]">
                        {trainer.talentos.map((talento, idx) => (
                          <div 
                            key={idx} 
                            onMouseEnter={(e) => handleTalentHover(e, talento.description)}
                            onMouseLeave={() => setHoveredTalent(null)}
                            className="bg-zinc-100 border-2 border-zinc-200 px-3 py-1.5 rounded-xl flex items-center gap-2 hover:border-black transition-colors h-fit cursor-default"
                          >
                             <span className="text-xs font-black italic text-zinc-700 uppercase tracking-tight">{talento.name}</span>
                             <button onClick={(e) => { e.stopPropagation(); removeTalent(idx); }} className="w-4 h-4 rounded-full bg-zinc-300 text-white flex items-center justify-center text-[8px] hover:bg-rose-500 transition-colors"><i className="fa-solid fa-xmark" /></button>
                          </div>
                        ))}
                        {trainer.talentos.length === 0 && <span className="text-xs text-zinc-300 font-black uppercase italic p-2">Nenhum talento adquirido.</span>}
                     </div>

                     <div className="flex flex-col gap-2 mt-auto bg-zinc-50 p-3 rounded-2xl border-2 border-zinc-100">
                        <input 
                          type="text" 
                          value={newTalent} 
                          onChange={(e) => setNewTalent(e.target.value)} 
                          className="w-full bg-white px-3 py-2 rounded-xl text-xs font-black italic text-zinc-800 border-2 border-zinc-200 focus:border-black outline-none transition-all placeholder-zinc-300 uppercase" 
                          placeholder="NOME DO TALENTO..." 
                        />
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={newTalentDesc}
                            onChange={(e) => setNewTalentDesc(e.target.value)} 
                            onKeyPress={(e) => e.key === 'Enter' && addTalent()}
                            className="flex-1 bg-white px-3 py-2 rounded-xl text-[10px] font-medium text-zinc-600 border-2 border-zinc-200 focus:border-black outline-none transition-all placeholder-zinc-300" 
                            placeholder="Descrição breve..." 
                          />
                          <button onClick={addTalent} className="px-4 py-2 rounded-xl text-white font-black uppercase text-[10px] shadow-md hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: currentTheme.color }}>
                            <i className="fa-solid fa-plus" />
                          </button>
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Botões de Gestão */}
              <div className="mt-8 flex flex-wrap gap-4 border-t-2 border-zinc-200 pt-6">
                <button onClick={exportData} className="px-6 py-3 rounded-2xl border-2 border-zinc-200 text-zinc-400 font-black uppercase text-xs italic flex items-center gap-2 hover:border-black hover:text-black transition-all">
                  <i className="fa-solid fa-file-export" /> Exportar (.json)
                </button>
                <label className="px-6 py-3 rounded-2xl border-2 border-zinc-200 text-zinc-400 font-black uppercase text-xs italic flex items-center gap-2 hover:border-black hover:text-black transition-all cursor-pointer">
                  <i className="fa-solid fa-file-import" /> Importar Ficha
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
                <button onClick={resetTrainer} className="px-6 py-3 rounded-2xl border-2 border-zinc-200 text-zinc-400 font-black uppercase text-xs italic flex items-center gap-2 hover:border-rose-500 hover:text-rose-500 transition-all ml-auto">
                  <i className="fa-solid fa-rotate-left" /> Resetar Ficha
                </button>
              </div>
            </div>
          )}

          {activeTab === 'combate' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-black text-zinc-900 uppercase flex items-center gap-2"><i className="fa-solid fa-shield-halved" style={{ color: currentTheme.color }} /> Atributos Base</h2>
                  <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-black">
                    {/* BARRA DE HP - CALCULADA PELO NÍVEL E SAÚDE */}
                    <div className="mb-6">
                      <div className="flex justify-between text-[10px] font-black uppercase text-zinc-700 mb-1 tracking-widest">
                        <span>HP: {trainer.hpActual}/{calculatedHpMax}</span>
                      </div>
                      <div className="h-10 bg-zinc-100 rounded-2xl border-2 border-black overflow-hidden p-1 shadow-inner">
                        <div className="h-full rounded-xl transition-all duration-500 shadow-md" style={{ width: `${(trainer.hpActual / calculatedHpMax) * 100}%`, backgroundColor: currentTheme.color }} />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">HP Atual:</span>
                         <SmartInput 
                            value={trainer.hpActual} 
                            onChange={(val) => handleProfileChange('hpActual', Math.min(calculatedHpMax, val || 0))} 
                            className="flex-1 text-center font-black bg-zinc-50 border-2 border-zinc-100 rounded-xl py-1 text-xs outline-none focus:border-black transition-all" 
                        />
                      </div>
                    </div>
                    
                    {/* Grid de Atributos Editáveis */}
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.keys(trainer.stats) as Array<keyof Stats>).map(key => (
                        <div key={key} className="flex items-center gap-3 bg-zinc-50 p-2 rounded-2xl border-2 border-transparent hover:border-black/5 transition-all">
                          <span className="w-24 text-[10px] font-black text-zinc-600 uppercase tracking-tighter">{STAT_LABELS[key]}</span>
                          <input type="number" value={trainer.stats[key]} onChange={(e) => handleStatChange(key, parseInt(e.target.value) || 0)} className="w-14 text-center font-black bg-white border-2 border-zinc-200 rounded-xl py-1 focus:border-black outline-none transition-colors" style={{ color: currentTheme.color }} />
                          <div className="flex-1 text-center bg-zinc-200 rounded-xl text-xs font-black py-1 text-zinc-800" title="Modificador: (Stat - 10) / 2">
                            {calculateModifier(trainer.stats[key]) >= 0 ? '+' : ''}{calculateModifier(trainer.stats[key])}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-zinc-100 flex justify-between items-center px-2">
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Pontos Gastos</span>
                        <div className={`text-xl font-black italic ${totalSpentPoints > calculatedMaxPoints ? 'text-rose-500 animate-pulse' : 'text-zinc-800'}`}>
                          {totalSpentPoints} / {calculatedMaxPoints}
                        </div>
                    </div>
                  </div>
                </div>
                
                {/* Perícias Interativas */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-zinc-900 uppercase flex items-center gap-2"><i className="fa-solid fa-list-check" style={{ color: currentTheme.color }} /> Perícias</h2>
                    <button 
                      onClick={() => setShowOnlyTrained(!showOnlyTrained)}
                      className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all border-2 ${showOnlyTrained ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-transparent text-zinc-400 border-zinc-200 hover:border-zinc-400'}`}
                    >
                      {showOnlyTrained ? 'MOSTRAR TODAS' : 'FILTRAR TREINADAS'}
                    </button>
                  </div>
                  <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-black overflow-hidden">
                    <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                      {trainer.skills
                        .filter(skill => !showOnlyTrained || skill.ranks > 0)
                        .map((skill, idx) => {
                        const total = calculateSkillTotal(skill, trainer.stats);
                        const isHealth = skill.attr === 'saude';
                        const mod = Math.floor((trainer.stats[skill.attr] - 10) / 2);
                        
                        return (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-2 border-b-2 border-zinc-50 hover:bg-zinc-50 transition-colors gap-2">
                          <div className="flex-1 min-w-[120px]">
                             <span className="font-black text-zinc-800 italic uppercase text-[10px] tracking-tighter block">{skill.name}</span>
                             <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">{STAT_LABELS[skill.attr]} ({mod >= 0 ? '+' : ''}{mod})</span>
                          </div>
                          
                          <div className="flex items-center gap-2 justify-end">
                            {/* Rank Selection */}
                            <div className="flex bg-zinc-100 rounded-lg p-0.5 border border-zinc-200">
                               {[0, 1, 2].map(r => (
                                  (!isHealth || r <= 1) && (
                                  <button key={r} 
                                    onClick={() => handleSkillChange(idx, 'ranks', r as 0|1|2)}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-black transition-all ${skill.ranks === r ? 'text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    style={{ backgroundColor: skill.ranks === r ? currentTheme.color : 'transparent' }}
                                    title={r === 0 ? 'Untrained' : r === 1 ? 'Trained' : 'Expert'}
                                  >
                                     {r === 0 ? '-' : r === 1 ? 'T' : 'E'}
                                  </button>
                                  )
                               ))}
                            </div>

                            {/* Bonus Input */}
                            {!isHealth && (
                              <div className="w-10">
                                <input 
                                  type="number" 
                                  value={skill.bonus} 
                                  onChange={(e) => handleSkillChange(idx, 'bonus', parseInt(e.target.value) || 0)}
                                  className="w-full text-center bg-zinc-50 border border-zinc-200 rounded-lg py-1 font-bold text-zinc-600 outline-none focus:border-black text-[10px]"
                                  placeholder="Bn"
                                />
                              </div>
                            )}

                             {/* Total Display */}
                            <span className="w-10 text-right font-black text-lg italic" style={{ color: currentTheme.color }}>
                              {isHealth ? (skill.ranks > 0 ? 'SIM' : '-') : (skill.ranks === 0 ? 'd20' : `+${total}`)}
                            </span>
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>
                  </div>


                {/* Coluna 3: Evasão e Movimento (Movido da aba Treinador) */}
                <div className="space-y-6">
                   <div className="h-fit p-3 rounded-[2.5rem] border-4 border-black flex shadow-[6px_6px_0px_rgba(0,0,0,0.15)] bg-white">
                    <div className="flex items-center justify-center w-10 border-r-2 border-zinc-100"><span className="[writing-mode:vertical-lr] font-black italic text-2xl tracking-[0.2em] uppercase drop-shadow-sm rotate-180" style={{ color: currentTheme.color }}>EVASÃO</span></div>
                    <div className="flex-1 flex flex-col gap-2 py-2 ml-4">
                      <DerivedBox label="Física (Def)" value={calculatedEvasion.fisica} icon="fa-hand-fist" color={currentTheme.color} />
                      <DerivedBox label="Especial (SpD)" value={calculatedEvasion.especial} icon="fa-bolt" color={currentTheme.color} />
                      <DerivedBox label="Veloz (Vel)" value={calculatedEvasion.veloz} icon="fa-wind" color={currentTheme.color} />
                    </div>
                  </div>

                  <div className="h-fit p-3 rounded-[2.5rem] border-4 border-black flex shadow-[6px_6px_0px_rgba(0,0,0,0.15)] bg-white">
                    <div className="flex items-center justify-center w-10 border-r-2 border-zinc-100"><span className="[writing-mode:vertical-lr] font-black italic text-2xl tracking-[0.1em] uppercase drop-shadow-sm rotate-180" style={{ color: currentTheme.color }}>MOVES</span></div>
                    <div className="flex-1 flex flex-col gap-2 py-2 ml-4">
                      <DerivedBox label="Terrestre" value={calculatedMovement.terrestre} icon="fa-shoe-prints" color={currentTheme.color} />
                      <DerivedBox label="Natação" value={calculatedMovement.natacao} icon="fa-person-swimming" color={currentTheme.color} />
                      <DerivedBox label="Subaquático" value={calculatedMovement.subaquatico} icon="fa-soap" color={currentTheme.color} />
                    </div>
                  </div>
                </div>



              </div>
            </div>
          )}

          {/* Abas restantes: Equipe, Mochila e Notas */}
          {activeTab === 'equipe' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
                {trainer.equipe.map((pkmn) => (
                  <div key={pkmn.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border-2 border-black flex flex-col items-center group hover:scale-105 transition-transform cursor-pointer">
                    <div className="w-24 h-24 rounded-full mb-3 flex items-center justify-center border-4 border-zinc-50 relative overflow-hidden transition-colors" style={{ backgroundColor: `${currentTheme.color}22` }}>
                      <i className="fa-solid fa-paw text-3xl opacity-30" style={{ color: currentTheme.color }} />
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{pkmn.species}</span>
                    <h4 className="text-xl font-black text-zinc-900 uppercase tracking-tighter italic">{pkmn.name}</h4>
                  </div>
                ))}
                <div className="bg-white/50 p-5 rounded-[2.5rem] border-4 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-500 hover:border-black hover:text-black transition-all cursor-pointer">
                  <i className="fa-solid fa-plus text-2xl mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Membro</span>
                </div>
             </div>
          )}

          {activeTab === 'mochila' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-[2.5rem] border-2 border-black shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-2">
                    <div>
                       <label className="text-[10px] font-black uppercase text-zinc-400 mb-1 block ml-2">Nome do Item</label>
                       <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Ex: Poção, Ultra Ball..." className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-2 font-black italic text-zinc-700 outline-none focus:border-black transition-all" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-zinc-400 mb-1 block ml-2">Descrição</label>
                       <input type="text" value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} placeholder="Ex: Cura 20 HP, +5 Captura..." className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-2 text-sm font-medium text-zinc-500 outline-none focus:border-black transition-all" />
                    </div>
                </div>
                <div className="w-full md:w-32"><label className="text-[10px] font-black uppercase text-zinc-400 mb-1 block ml-2">Qtd Inicial</label><input type="number" value={newItemQty} onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-2 font-black italic text-zinc-700 outline-none focus:border-black transition-all text-center" /></div>
                <button onClick={addItem} className="w-full md:w-auto px-8 py-2.5 rounded-xl font-black uppercase text-white shadow-lg hover:scale-105 active:scale-95 transition-all h-[42px]" style={{ backgroundColor: currentTheme.color }}>Adicionar</button>
              </div>
              <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-black overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-100 text-[10px] font-black text-zinc-700 uppercase tracking-widest border-b-2 border-zinc-200"><tr><th className="px-8 py-5">Descrição do Item</th><th className="px-8 py-5 text-center w-48">Quantidade</th><th className="px-8 py-5 text-center w-24">Ação</th></tr></thead>
                  <tbody className="divide-y divide-zinc-50">
                    {trainer.inventario.length === 0 ? (<tr><td colSpan={3} className="px-8 py-10 text-center text-zinc-300 font-black italic uppercase text-xs">A mochila está vazia</td></tr>) : (
                      trainer.inventario.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group">
                          <td className="px-8 py-4">
                             <div className="flex flex-col">
                                <span className="font-black text-zinc-800 uppercase text-xs italic tracking-tight">{item.name}</span>
                                {item.description && <span className="text-[10px] font-bold text-zinc-400 mt-0.5">{item.description}</span>}
                             </div>
                          </td>
                          <td className="px-8 py-4"><div className="flex items-center justify-center gap-3"><button onClick={() => updateItemQty(item.id, -1)} className="w-8 h-8 rounded-lg border-2 border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-black hover:text-black transition-all"><i className="fa-solid fa-minus text-[10px]" /></button><span className="w-10 text-center font-black text-lg" style={{ color: currentTheme.color }}>{item.quantity}</span><button onClick={() => updateItemQty(item.id, 1)} className="w-8 h-8 rounded-lg border-2 border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-black hover:text-black transition-all"><i className="fa-solid fa-plus text-[10px]" /></button></div></td>
                          <td className="px-8 py-4 text-center"><button onClick={() => (setTrainer(prev => ({ ...prev, inventario: prev.inventario.filter(i => i.id !== item.id) })))} className="text-zinc-200 hover:text-rose-500 transition-colors"><i className="fa-solid fa-trash-can" /></button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notas' && (
             <NotesTab 
               content={trainer.anotacoes} 
               onChange={(val) => handleProfileChange('anotacoes', val)} 
               themeColor={currentTheme.color} 
             />
          )}

          {activeTab === 'computador' && (
            <PcTab 
              boxes={trainer.pcBoxes || []} 
              onChange={(val) => handleProfileChange('pcBoxes', val)}
              theme={currentTheme}
            />
          )}

        </div>

        {/* Footer */}
        <div className="bg-black/20 p-4 text-center text-[8px] font-black text-white/60 uppercase tracking-[0.5em]">ADVANCED POKEDEX OS // SESSÃO CRIPTOGRAFADA // JOGADOR: {trainer.jogador.toUpperCase()}</div>
      </div>

      {hoveredTalent && (
        <div 
          className="fixed z-[9999] pointer-events-none w-48"
          style={{ 
            left: hoveredTalent.x, 
            top: hoveredTalent.y - 12, 
            transform: 'translate(-50%, -100%)' 
          }}
        >
          <div className="bg-zinc-900/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-2xl border-2 border-black/10 animate-in fade-in zoom-in-95">
             <div className="text-[10px] italic leading-tight text-center">{hoveredTalent.content}</div>
             <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-900/95"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
