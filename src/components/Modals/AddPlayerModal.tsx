import { useState } from 'react';
import { FaTimes, FaCheck, FaUserCircle } from 'react-icons/fa';

interface Props {
  onClose: () => void;
  onConfirm: (name: string, buyIn: number, photo: string | null, isDealer: boolean) => void;
  initialName?: string; // Nova propriedade opcional
}

export default function AddPlayerModal({ onClose, onConfirm, initialName = "" }: Props) {
  const [name, setName] = useState(initialName); // Começa com o nome do usuário logado
  const [buyIn, setBuyIn] = useState("50"); // Valor padrão sugerido (pode mudar se quiser)
  const [isDealer, setIsDealer] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && buyIn) {
      onConfirm(name, parseFloat(buyIn), null, isDealer);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade" onClick={onClose}>
      <div className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaUserCircle className="text-blue-500" />
            Entrar na Mesa
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <FaTimes className="text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome do Jogador</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors font-bold"
                    placeholder="Nome..."
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Buy-In (R$)</label>
                <input 
                    type="number" 
                    value={buyIn}
                    onChange={e => setBuyIn(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white outline-none focus:border-green-500 transition-colors font-mono text-lg"
                    placeholder="0.00"
                />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl border border-slate-700/50 cursor-pointer" onClick={() => setIsDealer(!isDealer)}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isDealer ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`}>
                    {isDealer && <FaCheck size={10} className="text-white" />}
                </div>
                <span className="text-sm text-slate-300 font-bold">Começar como Dealer (Botão)</span>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/50 transition-all transform active:scale-95 flex items-center justify-center gap-2">
                <FaCheck /> CONFIRMAR ENTRADA
            </button>
        </form>
      </div>
    </div>
  );
}