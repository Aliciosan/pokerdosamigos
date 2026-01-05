"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
import { FaCalendarAlt, FaPlus, FaPowerOff, FaSignOutAlt, FaUserCheck } from 'react-icons/fa';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(""); 
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // Controle do nome inicial no Modal (Vazio ou Nome do Usuário)
  const [modalInitialName, setModalInitialName] = useState(""); 

  const { 
    players, confirmedPlayers, schedule, sessions, accessCount,
    notifications, toasts, soundEnabled,
    addPlayer, updateRebuy, checkoutPlayer, finishSession, addSchedule, deleteSchedule, clearSessions,
    removeToast, setSoundEnabled, markAllRead, clearNotifications,
    removeVisualSeat, updateSeatPosition, swapSeats, deleteHistoryItem, clearHistory
  } = usePokerGame();
  
  const [activeModal, setActiveModal] = useState<'add' | 'schedule' | 'sessions' | 'online' | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);

  // --- LOGIN E PERSISTÊNCIA ---
  useEffect(() => {
      const sessionUser = sessionStorage.getItem('pokerUser');
      if(sessionUser) {
          setCurrentUser(sessionUser);
          setIsLoggedIn(true);
      }
  }, []);

  const handleLogin = async (username: string, pass: string) => {
      setLoginLoading(true);
      setLoginError("");
      try {
          const { data, error } = await supabase.from('AppUser').select('*').eq('username', username).eq('password', pass).single();
          if (error || !data) { setLoginError("Usuário ou senha incorretos."); } 
          else { 
              sessionStorage.setItem('pokerUser', username);
              setCurrentUser(username);
              setIsLoggedIn(true); 
          }
      } catch (err) { setLoginError("Erro de conexão."); } finally { setLoginLoading(false); }
  };

  const handleRegister = async (username: string, pass: string) => {
      setLoginLoading(true);
      setLoginError("");
      try {
          const { data: existing } = await supabase.from('AppUser').select('*').eq('username', username).single();
          if (existing) { setLoginError("Este usuário já existe."); setLoginLoading(false); return; }
          const { error } = await supabase.from('AppUser').insert({ username, password: pass });
          if (error) { setLoginError("Erro ao criar conta."); } 
          else { 
              sessionStorage.setItem('pokerUser', username);
              setCurrentUser(username);
              setIsLoggedIn(true);
          }
      } catch (err) { setLoginError("Erro ao conectar."); } finally { setLoginLoading(false); }
  };

  const handleLogout = () => { 
      sessionStorage.removeItem('pokerUser');
      setCurrentUser("");
      setIsLoggedIn(false); 
  };

  // --- HELPER PARA ABRIR MODAL ---
  const openAddModal = (nameToFill: string = "") => {
      setModalInitialName(nameToFill);
      setActiveModal('add');
  };

  // --- STATS ---
  const activeCount = players ? players.filter(p => p.status === 'playing').length : 0;
  const finishedCount = players ? players.filter(p => p.status === 'finished').length : 0;
  const totalInvested = players ? players.reduce((acc, p) => acc + p.buyIn + p.rebuy, 0) : 0;
  const totalCashOut = players ? players.reduce((acc, p) => acc + (p.cashOut || 0), 0) : 0;
  const moneyOnTable = totalInvested - totalCashOut;
  const isPlaying = players.some(p => p.name === currentUser && p.status === 'playing');

  // --- SEGURANÇA (PERMISSÕES) ---
  const canEdit = (targetName: string) => {
      if (currentUser === 'admin') return true; 
      return targetName === currentUser;
  };

  const safeRebuy = (id: number, amount: number) => {
      const p = players.find(x => x.id === id);
      if (p && !canEdit(p.name)) {
          alert(`🚫 Bloqueado: Você só pode fazer Rebuy na sua conta.`);
          return;
      }
      updateRebuy(id, amount);
  };

  const safeCheckout = (id: number, cashOut: number) => {
      const p = players.find(x => x.id === id);
      if (p && !canEdit(p.name)) {
          alert(`🚫 Bloqueado: Você só pode encerrar a sua conta.`);
          return;
      }
      checkoutPlayer(id, cashOut);
  };

  const safeDelete = (id: number) => {
      const p = players.find(x => x.id === id);
      if (p && !canEdit(p.name)) {
          alert(`🚫 Bloqueado: Você não pode excluir outro jogador.`);
          return;
      }
      if(confirm("Tem certeza que deseja apagar este registro?")) deleteHistoryItem(id);
  };

  // --- CORREÇÃO: Função handleClearHistory adicionada aqui ---
  const handleClearHistory = () => {
      if (currentUser !== 'admin') {
          alert("🚫 Apenas o administrador pode limpar todo o histórico.");
          return;
      }
      if(confirm("ATENÇÃO: Isso apagará todo o histórico de partidas encerradas.\nTem certeza?")) {
          clearHistory();
      }
  };

  const safeSeatAction = (seatNum: number) => {
    const occupant = confirmedPlayers.find(p => p.seat === seatNum);
    
    if (selectedSeatId) {
        // Verifica se quem está tentando mover é o dono da cadeira selecionada
        const originalPlayer = confirmedPlayers.find(p => p.id === selectedSeatId);
        if (originalPlayer && !canEdit(originalPlayer.name)) {
             alert(`🚫 Você só pode mover a si mesmo!`);
             setSelectedSeatId(null);
             return;
        }

        if (occupant && occupant.id === selectedSeatId) { setSelectedSeatId(null); return; } 
        if (occupant) { 
            alert("Lugar ocupado.");
            setSelectedSeatId(null); 
            return; 
        }
        updateSeatPosition(selectedSeatId, seatNum); setSelectedSeatId(null);
    } else { 
        if (occupant) { 
            if(!canEdit(occupant.name)) {
                 // Bloqueia seleção silenciosa ou avisa
                 // alert("Você não pode selecionar outro jogador.");
            } else {
                setSelectedSeatId(occupant.id); 
            }
        }
    }
  };

  const safeRemoveSeat = (id: number) => {
      const p = confirmedPlayers.find(x => x.id === id);
      if (p && !canEdit(p.name)) {
          alert(`🚫 Você não pode levantar outro jogador.`);
          return;
      }
      if(confirm("Levantar da mesa?")) { 
          if(selectedSeatId === id) setSelectedSeatId(null); 
          removeVisualSeat(id); 
      }
  };

  const safeFinishSession = () => {
      if (currentUser !== 'admin') {
          alert("🚫 Apenas o administrador pode encerrar a sessão.");
          return;
      }
      finishSession();
  };

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} loading={loginLoading} error={loginError} />;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 pb-24 font-sans overflow-x-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <Header 
        onlineCount={activeCount} accessCount={accessCount || 0} visitorsCount={0}
        notifications={notifications} soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled} onMarkRead={markAllRead} onClearNotifs={clearNotifications}
        onOpenSessions={() => setActiveModal('sessions')}
        onOpenOnline={() => setActiveModal('online')}
        onLogout={handleLogout}
        onOpenSchedule={() => setActiveModal('schedule')}
      />

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        
        {schedule && schedule.length > 0 && (
           <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg animate-fade">
              <div className="flex items-center gap-3 w-full">
                 <div className="bg-blue-600 p-3 rounded-lg shrink-0"><FaCalendarAlt className="text-white text-xl"/></div>
                 <div className="flex-1">
                    <p className="text-xs text-blue-300 font-bold uppercase">Próximo Jogo</p>
                    <h3 className="font-bold text-white text-lg leading-tight">{schedule[0].title}</h3>
                    <p className="text-sm text-blue-200">{new Date(schedule[0].date).toLocaleString('pt-BR')}</p>
                 </div>
              </div>
           </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Jogando</p>
                <p className="text-2xl font-bold text-white">{activeCount}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Na Mesa (Real)</p>
                <p className="text-2xl font-bold text-green-400 truncate">R$ {moneyOnTable}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Saíram</p>
                <p className="text-2xl font-bold text-slate-300">{finishedCount}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Total Arrecadado</p>
                <p className="text-2xl font-bold text-blue-300 truncate">R$ {totalInvested}</p>
            </div>
        </div>

        {/* BOTÃO ESPECIAL: Entrar como EU */}
        {!isPlaying && (
            <button 
                onClick={() => openAddModal(currentUser)} 
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-4 rounded-2xl shadow-xl shadow-green-900/30 flex items-center justify-center gap-3 transform transition-all active:scale-95 animate-fade border border-green-500/30"
            >
                <div className="bg-white/20 p-2 rounded-full"><FaUserCheck size={20} /></div>
                <div className="text-left">
                    <p className="text-xs font-bold text-green-200 uppercase">Você está observando</p>
                    <p className="text-lg font-bold leading-none">Entrar na Mesa como {currentUser}</p>
                </div>
            </button>
        )}
        
        <div className="flex flex-col gap-4 pt-2">
          <h2 className="text-lg font-bold text-green-400">Na Mesa (Ao Vivo)</h2>
          <div className="flex flex-col md:flex-row gap-3 w-full">
             <button onClick={() => setActiveModal('schedule')} className="w-full md:flex-1 bg-slate-700 active:bg-slate-600 md:hover:bg-slate-600 text-slate-200 py-4 md:py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors">
                <FaCalendarAlt size={16} /> Agendamento
             </button>
             
             {/* BOTÃO GENÉRICO: Abre vazio para adicionar amigos */}
             <button onClick={() => openAddModal("")} className="w-full md:flex-1 bg-blue-600 active:bg-blue-500 md:hover:bg-blue-500 text-white py-4 md:py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-colors">
                <FaPlus size={16} /> Novo Jogador
             </button>
             
             <button onClick={safeFinishSession} className="w-full md:flex-1 bg-red-600 active:bg-red-500 md:hover:bg-red-500 text-white py-4 md:py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors opacity-80 hover:opacity-100">
                <FaPowerOff size={16} /> Encerrar Sessão
             </button>
             <button onClick={handleLogout} className="w-full md:flex-none md:w-32 bg-slate-800 active:bg-slate-700 md:hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 py-4 md:py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors">
                <FaSignOutAlt size={16} /> Sair
             </button>
          </div>
        </div>

        <ActiveList players={players} onRebuy={safeRebuy} onCheckout={safeCheckout} onDelete={safeDelete} />
        
        <hr className="border-slate-800 my-8" />
        
        <HistoryList players={players} onDelete={safeDelete} onClear={handleClearHistory} />

        <div className="bg-slate-800/50 rounded-2xl py-8 px-2 md:p-8 border border-slate-700 overflow-hidden relative mt-8 flex justify-center">
            <div className="w-full max-w-[800px]">
                <h2 className="text-center text-lg font-bold text-blue-400 mb-2 uppercase tracking-wider">Lugares</h2>
                <p className="text-center text-xs text-slate-500 mb-8">Toque em você mesmo para mudar de lugar.</p>
                {/* Mesa com FUNÇÕES SEGURAS */}
                <PokerTable seats={confirmedPlayers} selectedId={selectedSeatId} onRemove={safeRemoveSeat} onSeatClick={safeSeatAction} />
            </div>
        </div>
      </div>

      {/* MODAL AGORA USA modalInitialName CORRETAMENTE */}
      {activeModal === 'add' && <AddPlayerModal onClose={() => setActiveModal(null)} onConfirm={addPlayer} initialName={modalInitialName} />}
      {activeModal === 'schedule' && <ScheduleModal schedule={schedule} onAdd={addSchedule} onDelete={deleteSchedule} onClose={() => setActiveModal(null)} />}
      {activeModal === 'sessions' && <SessionsModal sessions={sessions} onClear={clearSessions} onClose={() => setActiveModal(null)} />}
      {activeModal === 'online' && <OnlinePlayersModal players={players} onClose={() => setActiveModal(null)} />}
    </main>
  );
}