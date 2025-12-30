import { useState } from 'react';
import { ScheduleItem } from '@/types';
import { FaCalendarAlt, FaTrash, FaTimes } from 'react-icons/fa'; // Ícone corrigido

interface Props {
  schedule: ScheduleItem[];
  onAdd: (title: string, date: string) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export default function ScheduleModal({ schedule, onAdd, onDelete, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(title && date) {
      onAdd(title, date);
      setTitle('');
      setDate('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 w-full max-w-2xl rounded-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-700 flex justify-between bg-slate-900 rounded-t-2xl">
          {/* Ícone atualizado abaixo */}
          <h3 className="text-xl font-bold flex items-center gap-2 text-white"><FaCalendarAlt className="text-blue-500"/> Agendamento</h3>
          <button onClick={onClose}><FaTimes className="text-slate-400 text-xl" /></button>
        </div>
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
             <input type="text" placeholder="Título (ex: Poker de Sexta)" value={title} onChange={e => setTitle(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white outline-none" required />
             <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white outline-none" required />
             <button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg">Agendar</button>
          </form>
          <div className="space-y-3">
            {schedule.map(s => (
              <div key={s.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white">{s.title}</h4>
                  <p className="text-xs text-slate-400">{new Date(s.date).toLocaleString('pt-BR')}</p>
                </div>
                <button onClick={() => onDelete(s.id)} className="text-slate-500 hover:text-red-500 p-2"><FaTrash /></button>
              </div>
            ))}
            {schedule.length === 0 && <p className="text-center text-slate-500">Nenhum jogo agendado.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}