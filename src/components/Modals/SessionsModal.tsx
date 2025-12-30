import { Session } from '@/types';
import { FaFolderOpen, FaTrash, FaTimes } from 'react-icons/fa';

interface Props {
  sessions: Session[];
  onClear: () => void;
  onClose: () => void;
}

export default function SessionsModal({ sessions, onClear, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 w-full max-w-2xl rounded-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-700 flex justify-between bg-slate-900 rounded-t-2xl">
          <h3 className="text-xl font-bold flex items-center gap-2 text-white"><FaFolderOpen className="text-yellow-500"/> Histórico</h3>
          <div className="flex gap-2">
            <button onClick={onClear} className="text-red-400 hover:text-red-300 p-2"><FaTrash /></button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2"><FaTimes /></button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto space-y-3">
          {sessions.length === 0 ? <p className="text-center text-slate-500">Nenhum histórico.</p> : sessions.map(s => (
            <div key={s.id} className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex justify-between">
               <div>
                 <p className="text-white font-bold">{new Date(s.date).toLocaleDateString('pt-BR')}</p>
                 <p className="text-xs text-slate-400">{s.summary.playerCount} Jogadores</p>
               </div>
               <div className="text-right">
                 <p className="text-xs text-slate-400">Balanço</p>
                 <p className={`font-bold font-mono ${s.summary.balance === 0 ? 'text-slate-300' : 'text-yellow-400'}`}>R$ {s.summary.balance}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}