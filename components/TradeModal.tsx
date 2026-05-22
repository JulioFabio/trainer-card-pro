import React, { useState, useEffect } from 'react';

interface TradeData {
  items: { id: string, name: string, quantity: number }[];
  pokemons: { id: string, nickname: string }[];
}

interface TradeRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  tradeData: TradeData;
  sender?: { name: string, avatarUrl: string };
  receiver?: { name: string, avatarUrl: string };
}

interface TradeModalProps {
  characterId: string;
  themeColor: string;
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ characterId, themeColor, onClose }) => {
  const [trades, setTrades] = useState<TradeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'new'>('pending');

  // Para criar nova troca
  const [availableCharacters, setAvailableCharacters] = useState<{id: string, name: string}[]>([]);
  const [selectedReceiver, setSelectedReceiver] = useState<string>('');
  const [tradeMessage, setTradeMessage] = useState<string>('');

  const fetchTrades = async () => {
    try {
      const res = await fetch(`/api/trade?characterId=${characterId}`);
      if (res.ok) {
        const data = await res.json();
        setTrades(data);
      }
    } catch (e) {
      console.error('Erro ao buscar trocas', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Temporário: Buscar todos os personagens para simular os jogadores disponíveis
  const fetchCharacters = async () => {
    try {
      // Como não temos uma rota que liste todos (apenas a de buscar um específico ou a /api/character por id),
      // vamos apenas criar um mock na UI se não tivermos, ou poderiamos criar uma rota /api/characters.
      // Para a Fase 1, se não existir a rota listagem, o usuário pode digitar o ID, mas isso é ruim.
      // Vamos assumir que criaremos um endpoint básico ou usar um dropdown fixo para testes.
      const mockChars = [
        { id: 'char-123', name: 'Eu Mesmo (Teste)' },
        { id: 'rival-456', name: 'Rival (Teste)' }
      ];
      setAvailableCharacters(mockChars);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTrades();
    fetchCharacters();
  }, [characterId]);

  const handleRespond = async (tradeId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await fetch('/api/trade', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tradeId, status })
      });
      fetchTrades(); // Recarrega após atualizar
    } catch (e) {
      console.error('Erro ao responder', e);
    }
  };

  const handleCreateTrade = async () => {
    if (!selectedReceiver) return;
    try {
      await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: characterId,
          receiverId: selectedReceiver,
          tradeData: { items: [], pokemons: [] } // Mock: Troca vazia (apenas ping) para a Fase 1
        })
      });
      setTradeMessage('Proposta enviada!');
      setActiveTab('pending');
      fetchTrades();
    } catch (e) {
      console.error('Erro ao criar troca', e);
      setTradeMessage('Erro ao enviar.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex flex-col p-4 sm:p-10 animate-in fade-in zoom-in-95 backdrop-blur-sm items-center justify-center">
      <div className="w-full max-w-2xl bg-zinc-900 rounded-[2rem] border-4 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col" style={{ borderColor: themeColor }}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-4 bg-black/20" style={{ borderBottomColor: themeColor }}>
          <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2" style={{ color: themeColor }}>
            <i className="fa-solid fa-right-left text-xl" /> Link Cable (Trocas)
          </h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
          ><i className="fa-solid fa-xmark" /></button>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-900/50">
          <button onClick={() => setActiveTab('pending')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest ${activeTab === 'pending' ? 'bg-zinc-800 text-white border-b-2' : 'text-zinc-500 hover:text-zinc-300'}`} style={activeTab === 'pending' ? { borderColor: themeColor } : {}}>
             Caixa de Entrada
          </button>
          <button onClick={() => setActiveTab('new')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest ${activeTab === 'new' ? 'bg-zinc-800 text-white border-b-2' : 'text-zinc-500 hover:text-zinc-300'}`} style={activeTab === 'new' ? { borderColor: themeColor } : {}}>
             Nova Proposta
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-zinc-100 min-h-[300px] flex flex-col">
          {isLoading ? (
             <div className="flex-1 flex items-center justify-center">
               <span className="text-zinc-400 font-bold uppercase animate-pulse">Carregando Rede...</span>
             </div>
          ) : activeTab === 'pending' ? (
             <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {trades.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-50 pt-10">
                    <i className="fa-solid fa-satellite-dish text-4xl mb-4 text-zinc-400"></i>
                    <p className="text-zinc-500 font-black uppercase text-xs">Nenhum sinal detectado.</p>
                  </div>
                ) : (
                  trades.map(trade => (
                    <div key={trade.id} className="bg-white p-4 rounded-2xl shadow-sm border-2 border-zinc-200 flex justify-between items-center">
                      <div>
                        <div className="text-[10px] font-black uppercase text-zinc-400">
                          {trade.senderId === characterId ? 'Você enviou para:' : 'Recebido de:'}
                        </div>
                        <div className="font-bold text-zinc-800">
                          {trade.senderId === characterId ? trade.receiver?.name || 'Desconhecido' : trade.sender?.name || 'Desconhecido'}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1 italic">Status: {trade.status}</div>
                      </div>
                      
                      {trade.status === 'PENDING' && trade.receiverId === characterId && (
                        <div className="flex gap-2">
                          <button onClick={() => handleRespond(trade.id, 'ACCEPTED')} className="w-10 h-10 rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-md flex items-center justify-center">
                             <i className="fa-solid fa-check"></i>
                          </button>
                          <button onClick={() => handleRespond(trade.id, 'REJECTED')} className="w-10 h-10 rounded-xl text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-md flex items-center justify-center">
                             <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
             </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="w-full max-w-sm space-y-2">
                   <label className="text-[10px] font-black uppercase text-zinc-500">Selecionar Destinatário</label>
                   <select 
                     value={selectedReceiver} 
                     onChange={(e) => setSelectedReceiver(e.target.value)}
                     className="w-full bg-white border-2 border-zinc-200 rounded-xl p-3 font-bold outline-none focus:border-black"
                   >
                     <option value="">Selecione um Treinador...</option>
                     {availableCharacters.filter(c => c.id !== characterId).map(c => (
                       <option key={c.id} value={c.id}>{c.name}</option>
                     ))}
                   </select>
                </div>
                <button 
                  onClick={handleCreateTrade}
                  disabled={!selectedReceiver}
                  className={`px-8 py-3 rounded-xl font-black uppercase text-white shadow-lg transition-transform ${selectedReceiver ? 'hover:scale-105 active:scale-95' : 'opacity-50'}`}
                  style={{ backgroundColor: themeColor }}
                >
                  Enviar Ping de Troca
                </button>
                {tradeMessage && <div className="text-xs font-bold text-zinc-500 uppercase">{tradeMessage}</div>}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
