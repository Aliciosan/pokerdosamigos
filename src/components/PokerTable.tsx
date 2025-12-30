import { ConfirmedPlayer } from "@/types";
import { FaUser, FaTimes } from "react-icons/fa";
import { GiPokerHand } from "react-icons/gi";

interface Props {
  seats: ConfirmedPlayer[];
  selectedId: number | null; // Novo: ID do jogador selecionado
  onRemove: (id: number) => void;
  onSeatClick: (seatNum: number) => void; // Novo: Clique genérico na cadeira
}

export default function PokerTable({ seats, selectedId, onRemove, onSeatClick }: Props) {
  const positions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="poker-table-container">
      <div className="poker-table-felt">
        <span className="poker-logo-center">POKER DOS<br/>AMIGOS</span>
      </div>

      {positions.map(num => {
        const player = seats.find(s => s.seat === num);
        const isSelected = player && player.id === selectedId;

        return (
          <div 
            key={num} 
            onClick={() => onSeatClick(num)} // Clique na cadeira (vazia ou cheia)
            className={`absolute w-[70px] h-[70px] flex flex-col items-center justify-center transition-all duration-300 seat-pos-${num} cursor-pointer hover:scale-110 z-10`}
          >
            {player ? (
              <div className="relative group">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full bg-slate-800 overflow-visible relative z-10 shadow-lg flex items-center justify-center transition-all 
                    ${isSelected ? 'border-4 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse' : 'border-2 border-blue-500'}
                `}>
                  {player.photo ? (
                    <img src={player.photo} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <FaUser className={isSelected ? "text-yellow-100" : "text-slate-400"} />
                  )}
                  
                  {/* Dealer Button */}
                  {player.isDealer && (
                    <div className="absolute -bottom-1 -left-1 bg-white text-black w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-extrabold border-2 border-slate-300 shadow-md z-20">D</div>
                  )}
                </div>
                
                {/* Fichas */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-yellow-500 z-0 filter drop-shadow-md">
                   <GiPokerHand size={20} />
                </div>

                {/* Nome */}
                <div className="text-[10px] bg-black/80 text-white px-2 py-0.5 rounded-full mt-1 text-center truncate max-w-[80px] relative z-20">
                  {player.name}
                </div>

                {/* Botão Remover */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(player.id); }} 
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] z-30 border border-slate-900 shadow-sm"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              // Cadeira Vazia
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center opacity-50 hover:opacity-100 hover:border-yellow-500 hover:text-yellow-500 transition-all">
                <span className="text-xs text-slate-500 font-bold group-hover:text-yellow-500">{num}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}