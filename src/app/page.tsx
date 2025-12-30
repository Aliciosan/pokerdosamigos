"use client";
import { useState, useEffect } from 'react';
import { usePokerGame } from '@/hooks/usePokerGame';
import Header from '@/components/Header';
import PokerTable from '@/components/PokerTable';
import ActiveList from '@/components/ActiveList';
import HistoryList from '@/components/HistoryList';
import ToastContainer from '@/components/ToastContainer';
import LoginScreen from '@/components/LoginScreen';
import AddPlayerModal from '@/components/Modals/AddPlayerModal';
import ScheduleModal from '@/components/Modals/ScheduleModal';
import SessionsModal from '@/components/Modals/SessionsModal';
import OnlinePlayersModal from '@/components/Modals/OnlinePlayersModal';
import VisitorsModal from '@/components/Modals/VisitorsModal';
import { FaCalendarAlt, FaPlus, FaPowerOff } from 'react-icons/fa';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const { 
    players, confirmedPlayers, schedule, sessions, visitors,
    notifications, toasts, soundEnabled,
    addPlayer, updateRebuy, checkoutPlayer, finishSession, addSchedule, deleteSchedule, clearSessions,
    addVisitor, removeVisitor, 
    removeToast, setSoundEnabled, markAllRead, clearNotifications,
    // Funções Supabase
    removeVisualSeat, updateSeatPosition, swapSeats, deleteHistoryItem, clearHistory
  } = usePokerGame();
  
  const [activeModal, setActiveModal] = useState<'add' | 'schedule' | 'sessions' | 'online' | 'visitors' | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);

  useEffect(() => {
      const savedLogin = localStorage.getItem('pokerLogin_v33');
      if(savedLogin === 'true') setIsLoggedIn(true);
  }, []);

  const handleLogin = () => {
      localStorage.setItem('pokerLogin_v33', 'true');
      setIsLoggedIn(true);
  };

  // --- LÓGICA DE SELEÇÃO DA MESA (ONLINE) ---
  const handleSeatClick = (seatNum: number) => {
    const occupant = confirmedPlayers.find(p => p.seat === seatNum);

    if (selectedSeatId) {
        // Clicou no mesmo -> Deseleciona
        if (occupant && occupant.id === selectedSeatId) {
            setSelectedSeatId(null);
            return;
        }

        // Clicou em outro jogador -> TROCA (Swap Online)
        if (occupant) {
            swapSeats(selectedSeatId, occupant.id); // Função do Hook
            setSelectedSeatId(null);
            return;
        }

        // Clicou em vazio -> MOVE (Update Online)
        updateSeatPosition(selectedSeatId, seatNum); // Função do Hook
        setSelectedSeatId(null);

    } else {
        // Seleciona o jogador
        if (occupant) setSelectedSeatId(occupant.id);
    }
  };

  const handleRemoveSeat = (id: number) => {
    if(confirm("Remover da mesa visual?")) {
        if(selectedSeatId === id) setSelectedSeatId(null);
        removeVisualSeat(id); // Função do Hook
    }
  };

  // --- CÁLCULOS ---
  const activeCount = players.filter(p => p.status === 'playing').length;
  const finishedCount = players.filter(p => p.status === 'finished').length;
  const totalInvested = players.reduce((acc, p) => acc + p.buyIn + p.rebuy, 0);
  const totalCashOut = players.reduce((acc, p) => acc + (p.cashOut || 0), 0);
  const balance = totalInvested - totalCashOut;

  const handleDeleteHistory = (id: number) => { if(confirm("Apagar registro?")) deleteHistoryItem(id); };
  const handleClearHistory = () => { if(confirm("Limpar histórico?")) clearHistory(); };

  if (!isLoggedIn) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 pb-24 font-sans overflow-x-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <Header 
        onlineCount={activeCount} visitorsCount={visitors.length} 
        notifications={notifications} soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled} onMarkRead={markAllRead} onClearNotifs={clearNotifications}
        onOpenSchedule={() => setActiveModal('schedule')} 
        onOpenSessions={() => setActiveModal('sessions')}
        onOpenOnline={() => setActiveModal('online')}
        onOpenVisitors={() => setActiveModal('visitors')}
      />

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        
        {schedule.length > 0 && (
           <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg animate-fade">
              <div className="flex items-center gap-3 w-full">
                 <div className="bg-blue-600 p-3 rounded-lg"><FaCalendarAlt className="text-white text-xl"/></div>
                 <div className="flex-1">
                    <p className="text-xs text-blue-300 font-bold uppercase">Próximo Jogo</p>
                    <h3 className="font-bold text-white text-lg leading-tight">{schedule[0].title}</h3>
                    <p className="text-sm text-blue-200">{new Date(schedule[0].date).toLocaleString('pt-BR')}</p>
                 </div>
              </div>
           </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-[10px] text-slate-500 uppercase font-bold">Jogando</p><p className="text-2xl font-bold text-white">{activeCount}</p></div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-[10px] text-slate-500 uppercase font-bold">Na Mesa</p><p className="text-2xl font-bold text-green-400 truncate">R$ {totalInvested}</p></div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-[10px] text-slate-500 uppercase font-bold">Saíram</p><p className="text-2xl font-bold text-slate-300">{finishedCount}</p></div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-[10px] text-slate-500 uppercase font-bold">Balanço</p><p className="text-2xl font-bold truncate">{balance}</p></div>
        </div>
        
        <div className="flex flex-col gap-4 pt-2">
          <h2 className="text-lg font-bold text-green-400">Na Mesa (Ao Vivo)</h2>
          <div className="flex flex-col md:flex-row gap-3 w-full">
             <button onClick={() => setActiveModal('schedule')} className="w-full md:flex-1 bg-slate-700 active:bg-slate-600 md:hover:bg-slate-600 text-slate-200 py-4 md:py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors"><FaCalendarAlt size={16} /> Agendamento</button>
             <button onClick={() => setActiveModal('add')} className="w-full md:flex-1 bg-blue-600 active:bg-blue-500 md:hover:bg-blue-500 text-white py-4 md:py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-colors"><FaPlus size={16} /> Novo Jogador</button>
             <button onClick={finishSession} className="w-full md:flex-1 bg-red-600 active:bg-red-500 md:hover:bg-red-500 text-white py-4 md:py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors"><FaPowerOff size={16} /> Encerrar Sessão</button>
          </div>
        </div>

        <ActiveList players={players} onRebuy={updateRebuy} onCheckout={checkoutPlayer} onDelete={(id) => { if(confirm("Cancelar entrada?")) deleteHistoryItem(id); }} />
        
        <hr className="border-slate-800 my-8" />
        
        <HistoryList players={players} onDelete={handleDeleteHistory} onClear={handleClearHistory} />

        <div className="bg-slate-800/50 rounded-2xl py-8 px-2 md:p-8 border border-slate-700 overflow-hidden relative mt-8 flex justify-center">
            <div className="w-full">
                <h2 className="text-center text-lg font-bold text-blue-400 mb-2 uppercase tracking-wider">Lugares</h2>
                <p className="text-center text-xs text-slate-500 mb-8">Toque para selecionar. Toque vazio para mover.</p>
                <PokerTable seats={confirmedPlayers} selectedId={selectedSeatId} onRemove={handleRemoveSeat} onSeatClick={handleSeatClick} />
            </div>
        </div>
      </div>

      {activeModal === 'add' && <AddPlayerModal onClose={() => setActiveModal(null)} onConfirm={addPlayer} />}
      {activeModal === 'schedule' && <ScheduleModal schedule={schedule} onAdd={addSchedule} onDelete={deleteSchedule} onClose={() => setActiveModal(null)} />}
      {activeModal === 'sessions' && <SessionsModal sessions={sessions} onClear={clearSessions} onClose={() => setActiveModal(null)} />}
      {activeModal === 'online' && <OnlinePlayersModal players={players} onClose={() => setActiveModal(null)} />}
      {activeModal === 'visitors' && <VisitorsModal visitors={visitors} onAdd={addVisitor} onRemove={removeVisitor} onClose={() => setActiveModal(null)} />}
    </main>
  );
}