"use client";
import { useState, useEffect } from 'react';
import { FaVolumeUp, FaVolumeMute, FaFolderOpen, FaRegBell, FaTrash } from 'react-icons/fa';
import { GiPokerHand } from 'react-icons/gi';
import { NotificationItem } from '@/types';

interface Props {
  onlineCount: number;
  notifications: NotificationItem[];
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onMarkRead: () => void;
  onClearNotifs: () => void;
  onOpenSchedule: () => void;
  onOpenSessions: () => void;
}

export default function Header({ 
    onlineCount, notifications, soundEnabled, setSoundEnabled, 
    onMarkRead, onClearNotifs, onOpenSchedule, onOpenSessions 
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
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg flex items-center justify-center border border-blue-400/20">
               <GiPokerHand className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-none tracking-tight text-white">Poker dos Amigos</h1>
              <p className="text-xs text-slate-400 mt-1">{time}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-600 mr-1 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-xs font-bold text-slate-300">
                <span className="text-white">{onlineCount}</span> Online
              </span>
            </div>

            <button onClick={onOpenSessions} className="text-slate-400 hover:text-white transition-colors p-2" title="Histórico">
              <FaFolderOpen className="text-xl" />
            </button>

            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-400 hover:text-white transition-colors p-2" title={soundEnabled ? "Som Ligado" : "Som Mudo"}>
              {soundEnabled ? <FaVolumeUp className="text-xl" /> : <FaVolumeMute className="text-xl text-red-500" />}
            </button>

            {/* Dropdown de Notificações */}
            <div className="relative">
                <button 
                    onClick={() => { setShowNotifMenu(!showNotifMenu); onMarkRead(); }} 
                    className="text-slate-400 hover:text-white transition-colors p-2 relative"
                >
                    <FaRegBell className={`text-2xl ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                    {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-800">{unreadCount}</span>}
                </button>

                {showNotifMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)}></div>
                        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                                <span className="text-sm font-bold text-white">Notificações</span>
                                <button onClick={onClearNotifs} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><FaTrash size={10}/> Limpar</button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-slate-500 text-xs">Sem notificações.</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`p-3 border-b border-slate-700 ${n.read ? 'opacity-60' : 'bg-slate-700/30'}`}>
                                            <p className="text-sm text-slate-200">{n.message}</p>
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