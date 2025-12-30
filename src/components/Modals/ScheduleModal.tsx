import { useState } from 'react';
import { ScheduleItem } from '@/types';
import { FaCalendarAlt, FaTrash, FaTimes } from 'react-icons/fa';

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

  // Pega a data/hora atual formatada para o input datetime-local
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDate = now.toISOString().slice(0,16);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade">
      <div className="bg-slate-800 w-full max-w-lg rounded-2xl border border-slate-700 flex flex-col max-h-[90vh] shadow-2xl">
        <div className="p-4 md:p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 text-white"><FaCalendarAlt className="text-blue-500"/> Agendamento</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><FaTimes className="text-slate-400" /></button>
        </div>
        
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4 mb-6 flex flex-col gap-4">
             {/* Inputs com w-full para mobile */}
             <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block uppercase">Título do Jogo</label>
                <input type="text" placeholder="Ex: Poker de Sexta" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors" required />
             </div>
             <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block uppercase">Data e Hora</label>
                {/* Input de data corrigido para mobile */}
                <input type="datetime-local" min={minDate} value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors appearance-none" required />
             </div>
             <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg mt-2">Agendar Jogo</button>
          </form>
          
          <h4 className="font-bold text-slate-300 mb-3 uppercase text-sm tracking-wider">Próximos Jogos</h4>
          <div className="space-y-3">
            {schedule.map(s => (
              <div key={s.id} className="bg-slate-800 border border-slate-700/80 rounded-xl p-4 flex justify-between items-center hover:border-slate-500 transition-colors">
                <div>
                  <h4 className="font-bold text-white text-lg">{s.title}</h4>
                  <p className="text-sm text-blue-300 flex items-center gap-2 mt-1">
                    <FaCalendarAlt size={12} />
                    {new Date(s.date).toLocaleDateString('pt-BR', {weekday: 'long', day:'2-digit', month:'long'})} às {new Date(s.date).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <button onClick={() => onDelete(s.id)} className="text-slate-500 hover:text-red-500 p-3 hover:bg-red-500/10 rounded-full transition-all"><FaTrash /></button>
              </div>
            ))}
            {schedule.length === 0 && <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">Nenhum jogo agendado.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}