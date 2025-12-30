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
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null); // Estado para controlar a seleção na mesa

  // --- LÓGICA DE MOVIMENTAÇÃO NA MESA ---
  const handleSeatClick = (seatNum: number) => {
    const occupant = confirmedPlayers.find(p => p.seat === seatNum);

    // Cenário 1: Já existe alguém selecionado
    if (selectedSeatId) {
        // Clicou no mesmo jogador? -> Deseleciona
        if (occupant && occupant.id === selectedSeatId) {
            setSelectedSeatId(null);
            return;
        }

        // Clicou em outro jogador? -> Troca de lugares (Swap)
        if (occupant) {
            setConfirmedPlayers(prev => prev.map(p => {
                if (p.id === selectedSeatId) return { ...p, seat: seatNum }; // Selecionado vai para o destino
                const selectedPlayer = prev.find(x => x.id === selectedSeatId);
                if (p.id === occupant.id) return { ...p, seat: selectedPlayer!.seat }; // Ocupante vai para a origem
                return p;
            }));
            setSelectedSeatId(null);
            return;
        }

        // Clicou em cadeira vazia? -> Move o jogador
        setConfirmedPlayers(prev => prev.map(p => 
            p.id === selectedSeatId ? { ...p, seat: seatNum } : p
        ));
        setSelectedSeatId(null);

    } else {
        // Cenário 2: Ninguém selecionado
        if (occupant) {
            setSelectedSeatId(occupant.id); // Seleciona o jogador clicado
        }
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

  // --- OUTRAS AÇÕES ---
  const handleDeleteHistory = (id: number) => {
    if(confirm("Apagar registro do histórico?")) setPlayers(prev => prev.filter(p => p.id !== id));
  };
  const handleClearHistory = () => {
    if(confirm("Limpar todo o histórico atual?")) setPlayers(prev => prev.filter(p => p.status === 'playing'));
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 pb-20 font-sans">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <Header 
        onlineCount={activeCount} notifications={notifications} soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled} onMarkRead={markAllRead} onClearNotifs={clearNotifications}
        onOpenSchedule={() => setActiveModal('schedule')} onOpenSessions={() => setActiveModal('sessions')}
      />

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        
        {/* Banner Próximo Jogo */}
        {schedule.length > 0 && (
           <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-4 flex justify-between items-center shadow-lg animate-fade">
              <div className="flex items-center gap-3">
                 <div className="bg-blue-600 p-2 rounded-lg"><FaCalendarAlt className="text-white"/></div>
                 <div>
                    <p className="text-xs text-blue-300 font-bold uppercase">Próximo Jogo Agendado</p>
                    <h3 className="font-bold text-white text-lg leading-tight">{schedule[0].title}</h3>
                    <p className="text-sm text-blue-200">{new Date(schedule[0].date).toLocaleString('pt-BR')}</p>
                 </div>
              </div>
           </div>
        )}

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-[10px] text-slate-500 uppercase font-bold">Jogando</p><p className="text-2xl font-bold text-white">{activeCount}</p></div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-[10px] text-slate-500 uppercase font-bold">Na Mesa (R$)</p><p className="text-2xl font-bold text-green-400">{totalInvested}</p></div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-[10px] text-slate-500 uppercase font-bold">Saíram</p><p className="text-2xl font-bold text-slate-300">{finishedCount}</p></div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-[10px] text-slate-500 uppercase font-bold">Balanço</p><p className="text-2xl font-bold">{balance}</p></div>
        </div>
        
        {/* Barra de Ações */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-3 pt-2">
          <h2 className="text-lg font-bold text-green-400 w-full md:w-auto">Na Mesa (Ao Vivo)</h2>
          <div className="flex gap-2 w-full md:w-auto">
             <button onClick={() => setActiveModal('schedule')} className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors"><FaCalendarAlt />&nbsp; Agendamento</button>
             <button onClick={() => setActiveModal('add')} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-colors"><FaPlus />&nbsp; Novo Jogador</button>
             <button onClick={finishSession} className="flex-1 md:flex-none bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors"><FaPowerOff />&nbsp; Encerrar Sessão</button>
          </div>
        </div>

        <ActiveList players={players} onRebuy={updateRebuy} onCheckout={checkoutPlayer} onDelete={(id) => { if(confirm("Cancelar entrada?")) setPlayers(prev => prev.filter(p => p.id !== id)); }} />
        <hr className="border-slate-800 my-8" />
        <HistoryList players={players} onDelete={handleDeleteHistory} onClear={handleClearHistory} />

        {/* Mesa Visual */}
        <div className="bg-slate-800/50 rounded-2xl p-4 md:p-8 mb-8 border border-slate-700 overflow-hidden relative mt-8">
            <h2 className="text-center text-lg font-bold text-blue-400 mb-2 uppercase tracking-wider">Mesa de Lugares (Visual)</h2>
            <p className="text-center text-xs text-slate-500 mb-6">Clique no jogador para selecionar. Clique em outro lugar para mover.</p>
            
            {/* COMPONENTE DA MESA ATUALIZADO */}
            <PokerTable 
                seats={confirmedPlayers} 
                selectedId={selectedSeatId} // Passa quem está selecionado
                onRemove={handleRemoveSeat} 
                onSeatClick={handleSeatClick} // Nova função de clique
            />
        </div>
      </div>

      {activeModal === 'add' && <AddPlayerModal onClose={() => setActiveModal(null)} onConfirm={addPlayer} />}
      {activeModal === 'schedule' && <ScheduleModal schedule={schedule} onAdd={addSchedule} onDelete={deleteSchedule} onClose={() => setActiveModal(null)} />}
      {activeModal === 'sessions' && <SessionsModal sessions={sessions} onClear={clearSessions} onClose={() => setActiveModal(null)} />}
    </main>
  );
}