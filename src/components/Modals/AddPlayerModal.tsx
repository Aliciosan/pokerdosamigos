import { useState } from 'react';
import { FaCamera, FaTimes } from 'react-icons/fa';

interface Props {
  onClose: () => void;
  onConfirm: (name: string, buyIn: number, photo: string | null, isDealer: boolean) => void;
}

export default function AddPlayerModal({ onClose, onConfirm }: Props) {
  const [name, setName] = useState('');
  const [buyIn, setBuyIn] = useState('');
  const [isDealer, setIsDealer] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && buyIn) {
      onConfirm(name, parseFloat(buyIn), photo, isDealer);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Novo Jogador</h3>
          <button onClick={onClose}><FaTimes className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            <label className="w-24 h-24 rounded-full bg-slate-900 border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden">
              {photo ? <img src={photo} className="w-full h-full object-cover" /> : <div className="text-center text-slate-500 text-xs"><FaCamera className="text-xl mx-auto mb-1"/>Foto</div>}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>
          <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none text-white" required />
          <input type="number" placeholder="Buy-in (R$)" value={buyIn} onChange={e => setBuyIn(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none text-white" required />
          
          <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-600 cursor-pointer" onClick={() => setIsDealer(!isDealer)}>
            <input type="checkbox" checked={isDealer} onChange={() => {}} className="w-5 h-5 accent-blue-600" />
            <label className="text-sm font-bold text-slate-300 cursor-pointer">Começar como Dealer</label>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold">Entrar</button>
        </form>
      </div>
    </div>
  );
}