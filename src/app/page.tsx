"use client";
import { useState } from 'react';
import { usePokerGame } from '@/hooks/usePokerGame';
import Header from '@/components/Header';
import PokerTable from '@/components/PokerTable';
import ActiveList from '@/components/ActiveList';
import HistoryList from '@/components/HistoryList';
import ToastContainer from '@/components/ToastContainer';
import AddPlayerModal from '@/components/Modals/AddPlayerModal';
import ScheduleModal from '@/components/Modals/ScheduleModal';
import SessionsModal from '@/components/Modals/SessionsModal';
import { FaCalendarAlt, FaPlus, FaPowerOff } from 'react-icons/fa';

export default function Home() {
  const { 
    players, confirmedPlayers, schedule, sessions,
    notifications, toasts, soundEnabled,
    addPlayer, updateRebuy, checkoutPlayer, finishSession, addSchedule, deleteSchedule, clearSessions,
    setConfirmedPlayers, setPlayers, 
    removeToast, setSoundEnabled, markAllRead, clearNotifications
  } = usePokerGame();
  
  const [activeModal, setActiveModal] = useState<'add' | 'schedule' | 'sessions' | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);

  // --- LÓGICA DE SELEÇÃO DA MESA ---
  const handleSeatClick = (seatNum: number) => {
    const occupant = confirmedPlayers.find(p => p.seat === seatNum);

    if (selectedSeatId) {
        // Se clicar no mesmo -> Deseleciona
        if (occupant && occupant.id === selectedSeatId) {
            setSelectedSeatId(null);
            return;
        }
        // Se clicar em outro -> Troca
        if (occupant) {
            setConfirmedPlayers(prev => prev.map(p => {
                if (p.id === selectedSeatId) return { ...p, seat: seatNum };
                const selectedPlayer = prev.find(x => x.id === selectedSeatId);
                if (p.id === occupant.id) return { ...p, seat: selectedPlayer!.seat };
                return p;
            }));
            setSelectedSeatId(null);
            return;
        }
        // Se clicar vazio -> Move
        setConfirmedPlayers(prev => prev.map(p => 
            p.id === selectedSeatId ? { ...p, seat: seatNum } : p
        ));
        setSelectedSeatId(null);

    } else {
        if (occupant) setSelectedSeatId(occupant.id);
    }
  };

  const handleRemoveSeat = (id: number) => {
    if(confirm("Remover da mesa visual?")) {
        if(selectedSeatId === id) setSelectedSeatId(null);
        setConfirmedPlayers(prev => prev.filter(p => p.id !== id));
    }
  };

  // --- CÁLCULOS ---
  const activeCount = players.filter(p => p.status === 'playing').length;
  const finishedCount = players.filter(p => p.status === 'finished').length;
  const totalInvested = players.reduce((acc, p) => acc + p.buyIn + p.rebuy, 0);
  const totalCashOut = players.reduce((acc, p) => acc + (p.cashOut || 0), 0);
  const balance = totalInvested - totalCashOut;

  // --- AÇÕES ---
  const handleDeleteHistory = (id: number) => {
    if(confirm("Apagar registro do histórico?")) setPlayers(prev => prev.filter(p => p.id !== id));
  };
  const handleClearHistory = () => {
    if(confirm("Limpar todo o histórico atual?")) setPlayers(prev => prev.filter(p => p.status === 'playing'));
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 pb-20 font-sans overflow-x-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <Header 
        onlineCount={activeCount} notifications={notifications} soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled} onMarkRead={markAllRead} onClearNotifs={clearNotifications}
        onOpenSchedule={() => setActiveModal('schedule')} onOpenSessions={() => setActiveModal('sessions')}
      />

      <div className="max-w-6xl mx-auto p-3 md:p-6 space-y-6">
        
        {/* Banner Próximo Jogo Responsivo */}
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

        {/* Stats Grid: 2 colunas no mobile, 4 no desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800 p-3 md:p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Jogando</p>
                <p className="text-xl md:text-2xl font-bold text-white">{activeCount}</p>
            </div>
            <div className="bg-slate-800 p-3 md:p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Na Mesa</p>
                <p className="text-xl md:text-2xl font-bold text-green-400 truncate">R$ {totalInvested}</p>
            </div>
            <div className="bg-slate-800 p-3 md:p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Saíram</p>
                <p className="text-xl md:text-2xl font-bold text-slate-300">{finishedCount}</p>
            </div>
            <div className="bg-slate-800 p-3 md:p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Balanço</p>
                <p className="text-xl md:text-2xl font-bold truncate">{balance}</p>
            </div>
        </div>
        
        {/* Barra de Ações: Coluna no mobile, Linha no desktop */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-bold text-green-400">Na Mesa (Ao Vivo)</h2>
             <span className="text-xs text-slate-500 md:hidden">Role para ver mais</span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 w-full">
             <button onClick={() => setActiveModal('schedule')} className="w-full md:flex-1 bg-slate-700 active:bg-slate-600 md:hover:bg-slate-600 text-slate-200 py-3 md:py-2 rounded-lg text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors">
                <FaCalendarAlt /> Agendamento
             </button>
             <button onClick={() => setActiveModal('add')} className="w-full md:flex-1 bg-blue-600 active:bg-blue-500 md:hover:bg-blue-500 text-white py-3 md:py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-colors">
                <FaPlus /> Novo Jogador
             </button>
             <button onClick={finishSession} className="w-full md:flex-1 bg-red-600 active:bg-red-500 md:hover:bg-red-500 text-white py-3 md:py-2 rounded-lg text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors">
                <FaPowerOff /> Encerrar Sessão
             </button>
          </div>
        </div>

        {/* Listas */}
        <ActiveList players={players} onRebuy={updateRebuy} onCheckout={checkoutPlayer} onDelete={(id) => { if(confirm("Cancelar entrada?")) setPlayers(prev => prev.filter(p => p.id !== id)); }} />
        
        <hr className="border-slate-800 my-6 md:my-8" />
        
        <HistoryList players={players} onDelete={handleDeleteHistory} onClear={handleClearHistory} />

        {/* Mesa Visual Responsiva */}
        <div className="bg-slate-800/50 rounded-2xl py-6 px-1 md:p-8 border border-slate-700 overflow-hidden relative mt-8 flex justify-center">
            <div className="w-full max-w-[800px]">
                <h2 className="text-center text-lg font-bold text-blue-400 mb-2 uppercase tracking-wider">Lugares</h2>
                <p className="text-center text-xs text-slate-500 mb-6">Toque para selecionar. Toque vazio para mover.</p>
                <PokerTable 
                    seats={confirmedPlayers} 
                    selectedId={selectedSeatId} 
                    onRemove={handleRemoveSeat} 
                    onSeatClick={handleSeatClick} 
                />
            </div>
        </div>
      </div>

      {/* Modais */}
      {activeModal === 'add' && <AddPlayerModal onClose={() => setActiveModal(null)} onConfirm={addPlayer} />}
      {activeModal === 'schedule' && <ScheduleModal schedule={schedule} onAdd={addSchedule} onDelete={deleteSchedule} onClose={() => setActiveModal(null)} />}
      {activeModal === 'sessions' && <SessionsModal sessions={sessions} onClear={clearSessions} onClose={() => setActiveModal(null)} />}
    </main>
  );
}