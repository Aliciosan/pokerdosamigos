import { Player } from '@/types';
import { FaTimes, FaUserCircle, FaClock } from 'react-icons/fa';

interface Props {
  players: Player[];
  onClose: () => void;
}

export default function OnlinePlayersModal({ players, onClose }: Props) {
  const activePlayers = players.filter(p => p.status === 'playing');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade" onClick={onClose}>
      <div className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            Jogadores Online ({activePlayers.length})
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full"><FaTimes className="text-slate-400" /></button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
            {activePlayers.length === 0 ? (
                <p className="text-center text-slate-500 py-6">Nenhum jogador na mesa.</p>
            ) : (
                <div className="space-y-1">
                    {activePlayers.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-slate-700/50 rounded-xl transition-colors">
                             {p.photo ? <img src={p.photo} className="w-10 h-10 rounded-full border border-slate-600 object-cover" /> : <FaUserCircle className="text-slate-500 text-4xl" />}
                             <div>
                                <p className="font-bold text-white">{p.name} {p.isDealer && <span className="bg-white text-black text-[10px] px-1.5 rounded font-bold">D</span>}</p>
                                <p className="text-xs text-blue-400 flex items-center gap-1"><FaClock size={10}/> Entrou às {new Date(p.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}