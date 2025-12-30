import { Player } from "@/types";
import { FaUser, FaTrash, FaClock } from "react-icons/fa";

interface Props {
  players: Player[];
  onRebuy: (id: number, amount: number) => void;
  onCheckout: (id: number, cashOut: number) => void;
  onDelete?: (id: number) => void;
}

export default function ActiveList({ players, onRebuy, onCheckout, onDelete }: Props) {
  const activePlayers = players.filter(p => p.status === 'playing');

  const handleCheckout = (id: number) => {
    const val = prompt("Valor de Saída (R$):");
    if(val !== null) onCheckout(id, parseFloat(val) || 0);
  };
  const handleRebuy = (id: number) => {
    const val = prompt("Valor Rebuy (R$):");
    if(val && !isNaN(parseFloat(val))) onRebuy(id, parseFloat(val));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activePlayers.length === 0 && <div className="col-span-full text-center py-10 bg-slate-800/50 rounded-xl border border-dashed border-slate-700 text-slate-500">Mesa vazia.</div>}
      {activePlayers.map(p => (
        <div key={p.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg flex flex-col gap-4 relative animate-fade">
          {onDelete && <button onClick={() => onDelete(p.id)} className="absolute top-3 right-3 text-slate-600 hover:text-red-500"><FaTrash /></button>}
          <div className="flex items-center gap-4">
            {p.photo ? <img src={p.photo} className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover" /> : <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600"><FaUser className="text-slate-400"/></div>}
            <div>
              <h3 className="font-bold text-lg text-white">{p.name} {p.isDealer && <span className="bg-white text-black text-[10px] px-2 rounded-full ml-1">D</span>}</h3>
              <div className="text-xs text-blue-400 flex items-center gap-1"><FaClock/> {new Date(p.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center border border-slate-700/50">
            <span className="text-xs text-slate-400 uppercase font-bold">Investido</span>
            <span className="text-xl font-bold text-white font-mono">R$ {p.buyIn + p.rebuy}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <button onClick={() => handleRebuy(p.id)} className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg text-xs font-bold border border-slate-600">+ REBUY</button>
            <button onClick={() => handleCheckout(p.id)} className="bg-red-900/40 hover:bg-red-900/60 text-red-200 py-2 rounded-lg text-xs font-bold border border-red-900/50">SAIR</button>
          </div>
        </div>
      ))}
    </div>
  );
}