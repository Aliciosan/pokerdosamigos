"use client";
import { useState, useEffect } from 'react';
import { FaVolumeUp, FaVolumeMute, FaFolderOpen, FaRegBell, FaTrash, FaEye } from 'react-icons/fa';
import { GiPokerHand } from 'react-icons/gi';
import { NotificationItem } from '@/types';

interface Props {
  onlineCount: number;
  accessCount: number;
  visitorsCount: number;
  notifications: NotificationItem[];
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onMarkRead: () => void;
  onClearNotifs: () => void;
  onOpenSchedule: () => void;
  onOpenSessions: () => void;
  onOpenOnline: () => void;
  onLogout: () => void;
}

export default function Header({ 
    onlineCount, accessCount, notifications, soundEnabled, setSoundEnabled, 
    onMarkRead, onClearNotifs, onOpenSchedule, onOpenSessions, onOpenOnline, onLogout 
}: Props) {
  const [time, setTime] = useState("00:00");
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Garante que não mostre número negativo
  const realVisitors = Math.max(0, accessCount - onlineCount);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-20 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 py-3 md:px-4 md:py-4">
        <div className="flex justify-between items-center">
          
          {/* LADO ESQUERDO: Logo e Título */}
          <div className="flex items-center gap-2 md:gap-4 shrink-1 overflow-hidden">
            <div className="relative w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center border border-blue-400/20 shrink-0">
               <GiPokerHand className="text-white text-lg md:text-3xl" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-sm md:text-2xl font-bold leading-none tracking-tight text-white whitespace-nowrap truncate">
                Poker dos Amigos
              </h1>
              <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 md:mt-1 font-mono">{time}</p>
            </div>
          </div>

          {/* LADO DIREITO: Ações e Notificações */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0 ml-2">
            
            {/* Botão Jogadores (Compacto no Mobile) */}
            <button onClick={onOpenOnline} className="flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-full border border-slate-600 transition-colors">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse md:mr-2"></div>
                <span className="hidden md:inline text-xs font-bold text-slate-300"><span className="text-white">{onlineCount}</span> Jogando</span>
                <span className="md:hidden text-xs font-bold text-white ml-0.5">{onlineCount}</span>
            </button>

            {/* Ícone Histórico */}
            <button onClick={onOpenSessions} className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700/50" title="Histórico">
              <FaFolderOpen className="text-lg md:text-xl" />
            </button>
            
            {/* Ícone Som */}
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700/50">
              {soundEnabled ? <FaVolumeUp className="text-lg md:text-xl" /> : <FaVolumeMute className="text-lg md:text-xl text-red-500" />}
            </button>

            {/* Ícone Notificação (Sino) - Destaque */}
            <div className="relative">
                <button 
                  onClick={() => { setShowNotifMenu(!showNotifMenu); onMarkRead(); }} 
                  className="text-slate-300 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700/50 relative"
                >
                    <FaRegBell className={`text-xl md:text-2xl ${unreadCount > 0 ? 'animate-bounce text-yellow-400' : ''}`} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-1 rounded-full border border-slate-900 min-w-[16px] text-center shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                </button>
                
                {/* Dropdown Menu */}
                {showNotifMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)}></div>
                        <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade">
                            <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                                <span className="text-sm font-bold text-white">Notificações</span>
                                <button onClick={onClearNotifs} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><FaTrash size={10}/> Limpar</button>
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? ( <div className="p-4 text-center text-slate-500 text-xs">Nenhuma notificação recente.</div> ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`p-3 border-b border-slate-700 ${n.read ? 'opacity-60' : 'bg-slate-700/30'}`}>
                                            <p className="text-sm text-slate-200 leading-tight font-medium">{n.message}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">{new Date(n.date).toLocaleTimeString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}