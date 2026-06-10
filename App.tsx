"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TrainerData, Stats, Skill, StoredPokemon, PCBox } from './types';
import { INITIAL_TRAINER_DATA, POKEDEX_THEMES, DEFAULT_SKILLS, STAT_LABELS, BASE_POINTS, MAX_STAT_INITIAL } from './constants';
import { InfoField } from './components/InfoField';
import { DerivedBox } from './components/DerivedBox';
import { SmartInput } from './components/SmartInput';
import { NotesTab } from './components/NotesTab';
import { PcTab } from './components/PcTab';
import { TeamTab } from './components/TeamTab';
import { ImageCropper } from './components/ImageCropper';
import { TradeModal } from './components/TradeModal';
import { PokemonCreationSheet } from './components/PokemonCreationSheet';
import { safeFetch } from './lib/safeFetch';

// Tab agora é string para suportar IDs dinâmicos como 'pokemon-team-abc123'
type Tab = string;

// Metadados de cada aba dinâmica de Pokémon
interface PokemonTab {
  id: string;          // Formato: 'pokemon-team-<id>' ou 'pokemon-pc-<boxIndex>-<slot>'
  label: string;       // Nome exibido na aba (ex: "Sparky" ou "Novo Pokémon")
  type: 'ephemeral' | 'persistent';
  origin: 'pc' | 'team';
  pokemonId?: string;  // ID único (utilizado se origin === 'team')
  boxIndex?: number;   // Índice da Box no PC (se origin === 'pc')
  slot?: number;       // Slot ocupado no PC (se origin === 'pc')
}

const STORAGE_KEY = 'trainer_card_pro_data';

const App: React.FC = () => {
  // Inicializa o estado com os dados padrão
  const [trainer, setTrainer] = useState<TrainerData>(INITIAL_TRAINER_DATA);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [syncState, setSyncState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [initError, setInitError] = useState<string | null>(null);

  // 1. CARREGAMENTO INICIAL DO BANCO DE DADOS
  useEffect(() => {
    const initCharacter = async () => {
      try {
        setInitError(null);
        const mockCharId = 'char-123';
        let data: any = null;
        
        try {
          data = await safeFetch(`/api/character?id=${mockCharId}`);
        } catch (fetchErr: any) {
          if (fetchErr.message.includes('404') || fetchErr.message.includes('não encontrado')) {
            data = await safeFetch('/api/character', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: 'Treinador', userId: 'user-123', id: mockCharId })
            });
          } else {
            throw fetchErr;
          }
        }

        if (data) {
          setCharacterId(data.id);
          
          let offlineBackup: any = null;
          try {
            const savedBackup = localStorage.getItem('trainer_card_pro_offline_backup');
            if (savedBackup) {
              offlineBackup = JSON.parse(savedBackup);
            }
          } catch {}

          let finalSheetData = data.sheetData || {};
          if (offlineBackup && offlineBackup.id === data.id) {
            finalSheetData = offlineBackup.sheetData || offlineBackup;
            setSyncState('error'); // Mostra que estamos com pendências offline
          }

          const loadedTrainer = { 
             ...INITIAL_TRAINER_DATA, 
             ...finalSheetData, 
             avatar: data.avatarUrl || INITIAL_TRAINER_DATA.avatar
          };
          setTrainer(loadedTrainer);
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados da API:', error);
        setInitError(error.message || 'Erro de conexão com o servidor.');
      } finally {
        setIsInitializing(false);
      }
    };
    initCharacter();
  }, []);

  const [activeTab, setActiveTab] = useState<Tab>('treinador');
  const [pokemonTabs, setPokemonTabs] = useState<PokemonTab[]>([]);
  const [currentTheme, setCurrentTheme] = useState(POKEDEX_THEMES[0]);

  // Carrega o tema do localStorage após o mount no cliente para evitar hydration mismatches
  useEffect(() => {
    const saved = localStorage.getItem('trainer_card_pro_theme');
    if (saved) {
      const found = POKEDEX_THEMES.find(t => t.id === saved);
      if (found) {
        setCurrentTheme(found);
      }
    }
  }, []);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newTalent, setNewTalent] = useState('');
  const [newTalentDesc, setNewTalentDesc] = useState('');
  const [hoveredTalent, setHoveredTalent] = useState<{ content: string, x: number, y: number } | null>(null);
  const [showOnlyTrained, setShowOnlyTrained] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);

  // --- SISTEMA DE ABAS DINÂMICAS DE POKÉMON ---

  // Troca de aba com limpeza automática de abas efêmeras
  const changeTab = useCallback((newTabId: string) => {
    setActiveTab(prev => {
      if (prev && prev.startsWith('pokemon-')) {
        const leavingTab = pokemonTabs.find(t => t.id === prev);
        if (leavingTab && leavingTab.type === 'ephemeral') {
          setPokemonTabs(tabs => tabs.filter(t => t.id !== prev));
        }
      }
      return newTabId;
    });
  }, [pokemonTabs]);

  // Abre (ou foca) uma aba de Pokémon dinâmica
  const openPokemonTab = useCallback((params: {
    origin: 'pc' | 'team';
    type: 'ephemeral' | 'persistent';
    label: string;
    pokemonId?: string;
    boxIndex?: number;
    slot?: number;
  }) => {
    const tabId = params.origin === 'team'
      ? `pokemon-team-${params.pokemonId}`
      : `pokemon-pc-${params.boxIndex}-${params.slot}`;

    // Se já existe, apenas foca nela
    const existing = pokemonTabs.find(t => t.id === tabId);
    if (existing) {
      changeTab(tabId);
      return;
    }

    const newTab: PokemonTab = {
      id: tabId,
      label: params.label,
      type: params.type,
      origin: params.origin,
      pokemonId: params.pokemonId,
      boxIndex: params.boxIndex,
      slot: params.slot,
    };

    setPokemonTabs(prev => [...prev, newTab]);
    setActiveTab(tabId);
  }, [pokemonTabs, changeTab]);

  // Fecha manualmente uma aba de Pokémon (botão X)
  const closePokemonTab = useCallback((tabId: string) => {
    setPokemonTabs(prev => prev.filter(t => t.id !== tabId));
    // Se estávamos nessa aba, volta para uma aba segura
    setActiveTab(prev => prev === tabId ? 'equipe' : prev);
  }, []);

  // Resolve o StoredPokemon a partir de uma PokemonTab
  const resolvePokemonFromTab = useCallback((tab: PokemonTab): StoredPokemon | undefined => {
    if (tab.origin === 'team' && tab.pokemonId) {
      for (const box of trainer.pcBoxes) {
        const found = box.pokemons.find(p => p.id === tab.pokemonId);
        if (found) return found;
      }
    } else if (tab.origin === 'pc' && tab.boxIndex !== undefined && tab.slot !== undefined) {
      const box = trainer.pcBoxes[tab.boxIndex];
      if (box) return box.pokemons.find(p => p.slot === tab.slot);
    }
    return undefined;
  }, [trainer.pcBoxes]);

  // Handler de Save para fichas de Pokémon abertas em abas dinâmicas
  const handlePokemonTabSave = useCallback((tab: PokemonTab, updatedPokemon: StoredPokemon) => {
    const newBoxes = [...trainer.pcBoxes];

    if (tab.origin === 'pc' && tab.boxIndex !== undefined && tab.slot !== undefined) {
      // PC Save: atualiza slot correto na box
      const box = { ...newBoxes[tab.boxIndex] };
      const newPkmn = { ...updatedPokemon, id: updatedPokemon.id || Date.now().toString(), slot: tab.slot };
      box.pokemons = [...box.pokemons.filter(p => p.slot !== tab.slot), newPkmn];
      newBoxes[tab.boxIndex] = box;
      handleProfileChange('pcBoxes', newBoxes);
      // Efêmera: fecha a aba e volta ao PC
      setPokemonTabs(prev => prev.filter(t => t.id !== tab.id));
      setActiveTab('computador');
    } else if (tab.origin === 'team' && tab.pokemonId) {
      // Team Save: localiza e atualiza o Pokémon na box de origem
      let found = false;
      for (let i = 0; i < newBoxes.length; i++) {
        const idx = newBoxes[i].pokemons.findIndex(p => p.id === tab.pokemonId);
        if (idx !== -1) {
          newBoxes[i] = { ...newBoxes[i], pokemons: [...newBoxes[i].pokemons] };
          newBoxes[i].pokemons[idx] = updatedPokemon;
          found = true;
          break;
        }
      }
      if (found) {
        handleProfileChange('pcBoxes', newBoxes);
        // Atualiza o label da aba se o nome mudou
        const newLabel = updatedPokemon.name || updatedPokemon.species || 'Pokémon';
        setPokemonTabs(prev => prev.map(t =>
          t.id === tab.id ? { ...t, label: newLabel } : t
        ));
      }
    }
  }, [trainer.pcBoxes]);

  // Garbage Collection: limpa abas de Pokémon deletados
  const handlePcBoxesChangeWithGC = useCallback((newBoxes: PCBox[]) => {
    handleProfileChange('pcBoxes', newBoxes);
    // Verifica se alguma aba aponta para um Pokémon que não existe mais
    setPokemonTabs(prev => prev.filter(tab => {
      if (tab.origin === 'pc' && tab.boxIndex !== undefined && tab.slot !== undefined) {
        const box = newBoxes[tab.boxIndex];
        return box && box.pokemons.some(p => p.slot === tab.slot);
      }
      if (tab.origin === 'team' && tab.pokemonId) {
        return newBoxes.some(box => box.pokemons.some(p => p.id === tab.pokemonId));
      }
      return true;
    }));
  }, []);

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

  // Salvamento automático via API (Substituindo localStorage)
  useEffect(() => {
    if (!characterId || isInitializing || initError) return;
    const saveTimer = setTimeout(async () => {
      try {
        setSyncState('saving');
        await safeFetch('/api/character', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
             id: characterId, 
             name: trainer.nomePersonagem, 
             level: trainer.levelGeral, 
             avatarUrl: trainer.avatar,
             sheetData: trainer 
          })
        });
        setSyncState('saved');
        localStorage.removeItem('trainer_card_pro_offline_backup');
      } catch (e) {
        console.error('Erro no Auto-Save da Ficha', e);
        setSyncState('error');
        try {
          localStorage.setItem('trainer_card_pro_offline_backup', JSON.stringify({
            id: characterId,
            sheetData: trainer
          }));
        } catch {}
      }
    }, 1000); // 1 segundo de debounce
    
    return () => clearTimeout(saveTimer);
  }, [trainer, characterId, isInitializing, initError]);

  useEffect(() => {
    localStorage.setItem('trainer_card_pro_theme', currentTheme.id);
    
    // Atualiza as variáveis CSS no elemento raiz do documento (html) para que as barras
    // de rolagem (que pertencem ao escopo do documento) sigam dinamicamente a cor do tema.
    const root = document.documentElement;
    root.style.setProperty('--theme-color', currentTheme.color);
    root.style.setProperty('--scrollbar-color', `${currentTheme.color}66`);
    root.style.setProperty('--scrollbar-color-hover', `${currentTheme.color}aa`);
  }, [currentTheme]);

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
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
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
  } as React.CSSProperties;

  return (
    <div style={rootStyle} className="min-h-screen h-screen bg-[#0f172a] flex items-center justify-center p-[20px] font-sans overflow-hidden">
      {isInitializing ? (
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <div className="w-16 h-16 rounded-full bg-cyan-400 border-4 border-white shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" />
           <span className="text-white font-black uppercase tracking-widest text-sm">Carregando Banco de Dados...</span>
        </div>
      ) : initError ? (
        <div className="max-w-md w-full bg-zinc-900 border-4 border-rose-500 rounded-[2rem] p-8 text-center shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 border-2 border-rose-500/30">
            <i className="fa-solid fa-cloud-slash text-4xl animate-bounce"></i>
          </div>
          <h2 className="text-lg font-black uppercase tracking-widest text-rose-500 mb-2">
            Erro de Conexão
          </h2>
          <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
            Não foi possível carregar os dados da sua Pokédex. Verifique a conexão com o servidor local.
          </p>
          <div className="bg-black/40 p-4 rounded-xl text-left font-mono text-xs text-rose-400/80 mb-6 max-h-24 overflow-y-auto">
            {initError}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-95"
          >
            Tentar Novamente
          </button>
        </div>
      ) : (
      <div className={`${currentTheme.main} w-full h-full rounded-[2.5rem] shadow-2xl border-[12px] border-black/20 overflow-hidden flex flex-col transition-colors duration-500`}>
        
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
          <div className="hidden sm:flex gap-2 text-[12px] font-bold text-white tracking-widest uppercase items-center">
            <div className="bg-black/40 px-4 py-2 rounded-full border border-white/10 flex items-center gap-1.5">
              <span className="opacity-80 font-black tracking-tighter">DIAS JORNADA:</span>
              <input type="number" value={trainer.diasJornada} onChange={(e) => handleProfileChange('diasJornada', parseInt(e.target.value) || 0)} className="bg-transparent w-10 text-center text-white font-black outline-none" />
            </div>
            <div className="bg-black/40 px-4 py-2 rounded-full border border-white/10 flex items-center gap-1.5">
              <span className="opacity-80 font-black tracking-tighter">POKEDEX:</span>
              <input type="number" value={trainer.pokedexCount} onChange={(e) => handleProfileChange('pokedexCount', parseInt(e.target.value) || 0)} className="bg-transparent w-10 text-center text-white font-black outline-none" />
            </div>

            {/* Divisor */}
            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Ícone de Nuvem de Sincronia */}
            <div 
              title={
                syncState === 'saving' ? "Gravando dados..." :
                syncState === 'error' ? "Erro ao salvar (Salvo Localmente)" :
                "Dados totalmente salvos na nuvem"
              }
              className="w-9 h-9 rounded-full bg-black/30 border border-white/10 flex items-center justify-center transition-all select-none"
            >
              {syncState === 'saving' && (
                <i className="fa-solid fa-cloud text-[14px] text-amber-400 animate-pulse" />
              )}
              {(syncState === 'saved' || syncState === 'idle') && (
                <i className="fa-solid fa-cloud text-[14px] text-emerald-400" />
              )}
              {syncState === 'error' && (
                <i className="fa-solid fa-cloud text-[14px] text-rose-500 animate-bounce" />
              )}
            </div>

            {/* Botões de Gestão - compactos */}
            <button onClick={() => setShowTradeModal(true)} title="Sistema de Trocas (Link Cable)" className="w-9 h-9 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/50 hover:border-emerald-400 transition-all">
              <i className="fa-solid fa-right-left text-[13px]" />
            </button>

          </div>
        </div>


        {/* Conteúdo Principal + Abas Integradas */}
        <div className="flex-1 bg-zinc-100 m-2 rounded-3xl shadow-inner border-b-8 border-black/5 flex flex-col overflow-hidden">

          {/* Abas dentro do painel */}
          <div className="flex flex-wrap px-4 pt-4 pb-3 gap-2 shrink-0 border-b border-zinc-200/80">
            {/* Abas Fixas */}
            {([
              { id: 'treinador', label: 'Treinador', icon: 'fa-user' },
              { id: 'combate', label: 'Combate', icon: 'fa-shield-halved' },
              { id: 'equipe', label: 'Equipe', icon: 'fa-users' },
              { id: 'mochila', label: 'Mochila', icon: 'fa-bag-shopping' },
              { id: 'computador', label: 'PC', icon: 'fa-desktop' },
              { id: 'notas', label: 'Notas', icon: 'fa-book' }
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'text-white shadow-md scale-105'
                    : 'bg-zinc-200 text-zinc-500 hover:bg-zinc-300 hover:text-zinc-700 hover:scale-105'
                }`}
                style={activeTab === tab.id ? { backgroundColor: currentTheme.color } : {}}
              >
                <i className={`fa-solid ${tab.icon} text-[9px]`} />
                {tab.label}
              </button>
            ))}

            {/* Divisor visual entre abas fixas e dinâmicas */}
            {pokemonTabs.length > 0 && (
              <div className="w-px h-6 bg-zinc-300 self-center mx-1" />
            )}

            {/* Abas Dinâmicas de Pokémon */}
            {pokemonTabs.map((pTab) => {
              const isActive = activeTab === pTab.id;
              return (
                <div
                  key={pTab.id}
                  onClick={() => changeTab(pTab.id)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'text-white shadow-md scale-105'
                      : 'bg-zinc-200 text-zinc-500 hover:bg-zinc-300 hover:text-zinc-700 hover:scale-105'
                  }`}
                  style={isActive ? { backgroundColor: currentTheme.color } : {}}
                >
                  <i className={`fa-solid ${pTab.origin === 'team' ? 'fa-paw' : 'fa-circle-dot'} text-[9px]`} />
                  <span className="max-w-[90px] truncate">{pTab.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closePokemonTab(pTab.id);
                    }}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? 'hover:bg-white/20 text-white/70 hover:text-white'
                        : 'hover:bg-zinc-400/30 text-zinc-400 hover:text-rose-500'
                    }`}
                    title="Fechar aba"
                  >
                    <i className="fa-solid fa-xmark text-[8px]" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Área de conteúdo com scroll */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar ${activeTab.startsWith('pokemon-') ? 'p-[5px]' : 'p-4 sm:p-6'}`}>

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
                        <input type="text" value={trainer.nomePersonagem} onChange={(e) => handleProfileChange('nomePersonagem', e.target.value)} className="flex-1 bg-transparent px-4 py-2 text-2xl font-black italic uppercase outline-none text-white placeholder-white/50" placeholder="Ex: Carlos" />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1 border-2 border-black rounded-xl overflow-hidden flex shadow-[2px_2px_0px_rgba(0,0,0,0.05)] transition-colors duration-500" style={{ backgroundColor: currentTheme.color }}>
                           <div className="bg-black/20 px-3 flex items-center font-black italic uppercase text-[9px] border-r-2 border-black/10 text-white tracking-widest">Frase</div>
                           <input type="text" value={trainer.conceito} onChange={(e) => handleProfileChange('conceito', e.target.value)} className="flex-1 px-3 py-1 font-black italic text-white outline-none text-xs placeholder-white/50 bg-transparent" placeholder="Ex: Gotta catch'em all!" />
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
                        <InfoField label="Idade" value={trainer.idade} field="idade" type="number" onChange={handleProfileChange} themeColor={currentTheme.color} placeholder="Ex: 16" />
                        <InfoField label="Gênero" value={trainer.genero} field="genero" onChange={handleProfileChange} themeColor={currentTheme.color} placeholder="Ex: Masculino" />
                        <InfoField label="Peso" value={trainer.peso} field="peso" onChange={handleProfileChange} themeColor={currentTheme.color} placeholder="Ex: 60kg" />
                        <InfoField label="Altura" value={trainer.altura} field="altura" onChange={handleProfileChange} themeColor={currentTheme.color} placeholder="Ex: 1,64" />
                        <InfoField label="Naturalidade" value={trainer.naturalidade} field="naturalidade" onChange={handleProfileChange} themeColor={currentTheme.color} placeholder="Ex: Pallet Town" />
                        <InfoField label="Jogador" value={trainer.jogador} field="jogador" onChange={handleProfileChange} themeColor={currentTheme.color} placeholder="Ex: Tulio" />
                        <InfoField label="Campanha" value={trainer.campanha} field="campanha" onChange={handleProfileChange} themeColor={currentTheme.color} placeholder="Ex: - (Liga)" />
                      </div>
                    </div>
                    {/* Coluna 2: Classes e Movimentos Stackados */}
                    <div className="space-y-6">
                      {/* Classes e Níveis de Classe */}
                      <div className="bg-white p-3 rounded-3xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.05)] h-fit">
                        <h3 className="text-[10px] font-black uppercase text-zinc-800 mb-2 border-b-2 border-zinc-100 pb-1 flex items-center gap-2"><i className="fa-solid fa-graduation-cap opacity-80" /> Classes de Carreira</h3>
                        <div className="space-y-2">
                          {[1, 2, 3, 4].map(num => {
                            const classPlaceholders = ["Ex: Captor", "Ex: Colecionador", "Ex: Pokebolista", "Ex: Engenheiro"];
                            return (
                              <div key={num} className="flex border-2 border-black rounded-xl overflow-hidden min-h-[2.5rem] h-auto group hover:border-black/50 transition-all shadow-[1px_1px_0px_rgba(0,0,0,0.02)]">
                                <div className="w-16 flex items-center justify-center border-r-2 border-black border-dotted text-white transition-colors duration-500" style={{ backgroundColor: currentTheme.color }}>
                                   <span className="text-[8px] font-black uppercase drop-shadow-sm tracking-tighter">Classe {num}</span>
                                </div>
                                <input type="text" value={trainer[`classe${num}` as keyof TrainerData] as string} onChange={(e) => handleProfileChange(`classe${num}` as keyof TrainerData, e.target.value)} className="flex-1 bg-white px-3 text-[10px] font-black italic text-zinc-800 outline-none placeholder-zinc-400/60" placeholder={classPlaceholders[num - 1]} />
                                <div className="w-10 flex items-center justify-center text-white transition-colors duration-500 drop-shadow-sm border-l-2 border-black border-dotted" style={{ backgroundColor: currentTheme.color }}>
                                    <input type="number" value={trainer[`level${num}` as keyof TrainerData] as number} onChange={(e) => handleProfileChange(`level${num}` as keyof TrainerData, Math.max(0, parseInt(e.target.value) || 0))} className="bg-transparent w-full text-center text-[10px] font-black outline-none" />
                                </div>
                              </div>
                            );
                          })}
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
                            onKeyDown={(e) => e.key === 'Enter' && addTalent()}
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
                        .map((skill, realIdx) => ({ skill, realIdx }))
                        .filter(({ skill }) => !showOnlyTrained || skill.ranks > 0)
                        .map(({ skill, realIdx }) => {
                        const total = calculateSkillTotal(skill, trainer.stats);
                        const isHealth = skill.attr === 'saude';
                        const mod = Math.floor((trainer.stats[skill.attr] - 10) / 2);
                        
                        return (
                        <div key={realIdx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-2 border-b-2 border-zinc-50 hover:bg-zinc-50 transition-colors gap-2">
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
                                    onClick={() => handleSkillChange(realIdx, 'ranks', r as 0|1|2)}
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
                                  onChange={(e) => handleSkillChange(realIdx, 'bonus', parseInt(e.target.value) || 0)}
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
          {activeTab === 'equipe' && characterId && (
             <TeamTab 
               equipeIds={trainer.equipe || []}
               pcBoxes={trainer.pcBoxes}
               theme={currentTheme}
               characterId={characterId}
               onChange={(newEquipe) => handleProfileChange('equipe', newEquipe)}
               onUpdateBoxes={(newBoxes) => handlePcBoxesChangeWithGC(newBoxes)}
               openPokemonTab={openPokemonTab}
             />
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

          {activeTab === 'notas' && characterId && (
             <NotesTab 
               characterId={characterId}
               themeColor={currentTheme.color}
             />
          )}

          {activeTab === 'computador' && characterId && (
            <PcTab 
              boxes={trainer.pcBoxes || []} 
              characterId={characterId}
              onChange={(val) => handlePcBoxesChangeWithGC(val)}
              theme={currentTheme}
              openPokemonTab={openPokemonTab}
            />
          )}

          {/* Abas Dinâmicas de Pokémon — renderiza PokemonCreationSheet inline */}
          {activeTab.startsWith('pokemon-') && characterId && (() => {
            const currentPokemonTab = pokemonTabs.find(t => t.id === activeTab);
            if (!currentPokemonTab) return null;
            const pokemonData = resolvePokemonFromTab(currentPokemonTab);
            return (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300 h-full">
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-2 flex flex-col shadow-lg"
                  style={{ borderColor: currentTheme.color + '40', background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)' }}
                >
                  <PokemonCreationSheet
                    initialData={pokemonData || {}}
                    onSave={(pkmn) => handlePokemonTabSave(currentPokemonTab, pkmn)}
                    onCancel={() => closePokemonTab(currentPokemonTab.id)}
                    theme={currentTheme}
                    characterId={characterId}
                  />
                </div>
              </div>
            );
          })()}

          </div>{/* fim scroll */}
        </div>{/* fim painel */}

        {/* Footer */}
        <div className="bg-black/20 py-1.5 px-4 text-center text-[8px] font-black text-white/60 uppercase tracking-[0.5em]">ADVANCED POKEDEX OS // SESSÃO CRIPTOGRAFADA // JOGADOR: {trainer.jogador.toUpperCase()}</div>
      </div>
      )}

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
      
      {imageToCrop && characterId && (
        <ImageCropper
          imageSrc={imageToCrop}
          characterId={characterId}
          themeColor={currentTheme.color}
          onCancel={() => setImageToCrop(null)}
          onCropComplete={(imageUrl) => {
            setTrainer(prev => ({ ...prev, avatar: imageUrl }));
            setImageToCrop(null);
          }}
        />
      )}

      {showTradeModal && characterId && (
        <TradeModal
          characterId={characterId}
          themeColor={currentTheme.color}
          onClose={() => setShowTradeModal(false)}
        />
      )}
    </div>
  );
};

export default App;
