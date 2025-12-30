import { useState } from 'react';
import { Visitor } from '@/types';
import { FaTimes, FaUserPlus, FaTrash, FaClock, FaEye } from 'react-icons/fa';

interface Props {
  visitors: Visitor[];
  onAdd: (name: string) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
}

export default function VisitorsModal({ visitors, onAdd, onRemove, onClose }: Props) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(name.trim()) {
      onAdd(name.trim());
      setName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade" onClick={onClose}>
      <div className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaEye className="text-purple-400" />
            Visitantes ({visitors.length})
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full"><FaTimes className="text-slate-400" /></button>
        </div>
        
        <div className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    placeholder="Nome do visitante..." 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-2 text-white outline-none focus:border-purple-500"
                    autoFocus
                />
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg font-bold"><FaUserPlus /></button>
            </form>

            <div className="max-h-[50vh] overflow-y-auto space-y-2">
                {visitors.length === 0 ? (
                    <p className="text-center text-slate-500 text-sm py-4">Nenhum visitante registrado.</p>
                ) : (
                    visitors.map(v => (
                        <div key={v.id} className="flex justify-between items-center bg-slate-700/30 p-3 rounded-xl border border-slate-700">
                            <div>
                                <p className="font-bold text-white text-sm">{v.name}</p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <FaClock size={8} /> {new Date(v.since).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                            <button onClick={() => onRemove(v.id)} className="text-slate-500 hover:text-red-500 p-2"><FaTrash size={12}/></button>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
}