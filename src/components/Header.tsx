"use client";
import { useState, useEffect } from 'react';
import { FaVolumeUp, FaVolumeMute, FaFolderOpen, FaRegBell, FaTrash, FaEye, FaSignOutAlt } from 'react-icons/fa';
import { GiPokerHand } from 'react-icons/gi';
import { NotificationItem } from '@/types';

interface Props {
  onlineCount: number;
  visitorsCount: number;
  accessCount: number;
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
        <div className="flex justify-between items-center gap-2">
          
          {/* LOGO - Otimizado para não quebrar no mobile */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center border border-blue-400/20">
               <GiPokerHand className="text-white text-lg md:text-3xl" />
            </div>
            <div className="flex flex-col">
              {/* Texto diminui em telas muito pequenas */}
              <h1 className="text-sm min-[380px]:text-base md:text-2xl font-bold leading-none tracking-tight text-white whitespace-nowrap">
                Poker dos Amigos
              </h1>
              <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 md:mt-1 font-mono">{time}</p>
            </div>
          </div>

          {/* AÇÕES - Container flexível */}
          <div className="flex items-center gap-0.5 md:gap-3 shrink-0">
            
            {/* --- VERSÃO DESKTOP (Status) --- */}
            <div className="hidden md:flex gap-2 mr-2">
                <button onClick={onOpenOnline} className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-600 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-300"><span className="text-white">{onlineCount}</span> Jogando</span>
                </button>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700 cursor-default">
                    <FaEye className="text-purple-400" size={12} />
                    <span className="text-xs font-bold text-slate-400"><span className="text-white">{realVisitors}</span> Visitantes</span>
                </div>
            </div>

            {/* --- VERSÃO MOBILE (Status Compacto) --- */}
             <div className="flex md:hidden gap-1 mr-1">
                 <button onClick={onOpenOnline} className="flex items-center justify-center w-7 h-7 bg-slate-700/50 hover:bg-slate-700 rounded-full border border-slate-600 relative">
                     <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse border border-slate-800"></div>
                     <span className="text-[10px] font-bold text-white">{onlineCount}</span>
                 </button>
             </div>

            {/* Ícones de Ação (Padding reduzido no mobile) */}
            <button onClick={onOpenSessions} className="text-slate-400 hover:text-white transition-colors p-1.5 md:p-2" title="Histórico">
              <FaFolderOpen className="text-lg md:text-xl" />
            </button>

            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-400 hover:text-white transition-colors p-1.5 md:p-2">
              {soundEnabled ? <FaVolumeUp className="text-lg md:text-xl" /> : <FaVolumeMute className="text-lg md:text-xl text-red-500" />}
            </button>

            {/* Notificações */}
            <div className="relative">
                <button onClick={() => { setShowNotifMenu(!showNotifMenu); onMarkRead(); }} className="text-slate-400 hover:text-white transition-colors p-1.5 md:p-2 relative">
                    <FaRegBell className={`text-lg md:text-2xl ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                    {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] md:text-[10px] font-bold px-1 py-0.5 rounded-full border-2 border-slate-800 min-w-[14px] text-center">{unreadCount}</span>}
                </button>
                
                {/* Dropdown Menu */}
                {showNotifMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)}></div>
                        <div className="absolute right-0 mt-2 w-64 md:w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                                <span className="text-sm font-bold text-white">Notificações</span>
                                <button onClick={onClearNotifs} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><FaTrash size={10}/> Limpar</button>
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? ( <div className="p-4 text-center text-slate-500 text-xs">Sem notificações.</div> ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`p-3 border-b border-slate-700 ${n.read ? 'opacity-60' : 'bg-slate-700/30'}`}>
                                            <p className="text-xs md:text-sm text-slate-200 leading-tight">{n.message}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">{new Date(n.date).toLocaleTimeString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Divisória Vertical */}
            <div className="w-px h-6 bg-slate-700 mx-0.5 md:mx-1"></div>

            {/* BOTÃO SAIR (Ajustado) */}
            <button onClick={onLogout} className="text-red-400 hover:text-red-200 transition-colors p-1.5 md:p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg ml-0.5" title="Sair do Sistema">
                <FaSignOutAlt className="text-sm md:text-xl" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}