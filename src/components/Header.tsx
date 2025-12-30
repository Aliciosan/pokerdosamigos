"use client";
import { useState, useEffect } from 'react';
import { FaVolumeUp, FaVolumeMute, FaFolderOpen, FaRegBell, FaTrash, FaChevronDown, FaEye } from 'react-icons/fa';
import { GiPokerHand } from 'react-icons/gi';
import { NotificationItem } from '@/types';

interface Props {
  onlineCount: number;
  visitorsCount: number; // Novo prop
  notifications: NotificationItem[];
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onMarkRead: () => void;
  onClearNotifs: () => void;
  onOpenSchedule: () => void;
  onOpenSessions: () => void;
  onOpenOnline: () => void;
  onOpenVisitors: () => void; // Novo prop
}

export default function Header({ 
    onlineCount, visitorsCount, notifications, soundEnabled, setSoundEnabled, 
    onMarkRead, onClearNotifs, onOpenSchedule, onOpenSessions, onOpenOnline, onOpenVisitors 
}: Props) {
  const [time, setTime] = useState("00:00");
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-20 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center border border-blue-400/20">
               <GiPokerHand className="text-white text-xl md:text-3xl" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold leading-none tracking-tight text-white">Poker dos Amigos</h1>
              <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 md:mt-1">{time}</p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1 md:gap-3">
            
            {/* Botão JOGANDO (Antigo Online) */}
            <button onClick={onOpenOnline} className="hidden md:flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-600 mr-1 shadow-sm transition-colors group">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                <span className="text-white">{onlineCount}</span> Jogando
              </span>
            </button>

            {/* Botão VISITANTES (Novo) */}
            <button onClick={onOpenVisitors} className="hidden md:flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-600 mr-1 shadow-sm transition-colors group">
              <FaEye className="text-purple-400" size={12} />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                <span className="text-white">{visitorsCount}</span> Visitantes
              </span>
            </button>

            {/* Mobile: Botões compactos */}
             <div className="flex md:hidden gap-1 mr-1">
                 <button onClick={onOpenOnline} className="flex items-center justify-center w-8 h-8 bg-slate-700/50 hover:bg-slate-700 rounded-full border border-slate-600 relative">
                     <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse border border-slate-800"></div>
                     <span className="text-xs font-bold text-white">{onlineCount}</span>
                 </button>
                 <button onClick={onOpenVisitors} className="flex items-center justify-center w-8 h-8 bg-slate-700/50 hover:bg-slate-700 rounded-full border border-slate-600">
                     <FaEye className="text-purple-400" size={12} />
                     <span className="absolute top-0 right-0 text-[8px] bg-slate-800 text-white px-1 rounded-full border border-slate-600 -mr-1 -mt-1">{visitorsCount}</span>
                 </button>
             </div>


            <button onClick={onOpenSessions} className="text-slate-400 hover:text-white transition-colors p-2" title="Histórico">
              <FaFolderOpen className="text-lg md:text-xl" />
            </button>

            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-400 hover:text-white transition-colors p-2">
              {soundEnabled ? <FaVolumeUp className="text-lg md:text-xl" /> : <FaVolumeMute className="text-lg md:text-xl text-red-500" />}
            </button>

            {/* Notificações */}
            <div className="relative">
                <button onClick={() => { setShowNotifMenu(!showNotifMenu); onMarkRead(); }} className="text-slate-400 hover:text-white transition-colors p-2 relative">
                    <FaRegBell className={`text-xl md:text-2xl ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                    {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-800">{unreadCount}</span>}
                </button>
                {showNotifMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)}></div>
                        <div className="absolute right-0 mt-2 w-72 md:w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                                <span className="text-sm font-bold text-white">Notificações</span>
                                <button onClick={onClearNotifs} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><FaTrash size={10}/> Limpar</button>
                            </div>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? ( <div className="p-4 text-center text-slate-500 text-xs">Sem notificações.</div> ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`p-3 border-b border-slate-700 ${n.read ? 'opacity-60' : 'bg-slate-700/30'}`}>
                                            <p className="text-sm text-slate-200 leading-tight">{n.message}</p>
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