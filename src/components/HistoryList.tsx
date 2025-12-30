import { Player } from "@/types";
import { FaFilePdf, FaTrash, FaTimes } from "react-icons/fa";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  players: Player[];
  onDelete: (id: number) => void;
  onClear: () => void;
}

export default function HistoryList({ players, onDelete, onClear }: Props) {
  const finishedPlayers = players.filter(p => p.status === 'finished').sort((a,b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Poker", 14, 20);
    const rows = finishedPlayers.map(p => [p.name, `R$ ${p.buyIn + p.rebuy}`, `R$ ${p.cashOut}`, `R$ ${p.cashOut - (p.buyIn + p.rebuy)}`]);
    autoTable(doc, { head: [["Nome", "Investido", "Retirou", "Lucro"]], body: rows, startY: 30 });
    doc.save('poker.pdf');
  };

  return (
    <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-400 mb-4">Histórico (Encerrados)</h2>
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/80 text-slate-500 uppercase text-xs">
                        <tr><th className="p-4">Jogador</th><th className="p-4">Inv.</th><th className="p-4">Ret.</th><th className="p-4">Lucro</th><th className="p-4 text-right"><div className="flex justify-end gap-2"><button onClick={exportPDF} className="bg-slate-700 text-slate-300 p-2 rounded"><FaFilePdf/></button><button onClick={onClear} className="bg-slate-700 text-red-400 p-2 rounded"><FaTrash/></button></div></th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {finishedPlayers.map(p => {
                            const lucro = p.cashOut - (p.buyIn + p.rebuy);
                            return (
                                <tr key={p.id} className="hover:bg-slate-700/50">
                                    <td className="p-4 font-bold text-slate-200">{p.name}</td>
                                    <td className="p-4 text-slate-400">R$ {p.buyIn + p.rebuy}</td>
                                    <td className="p-4 text-slate-400">R$ {p.cashOut}</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${lucro >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{lucro}</span></td>
                                    <td className="p-4 text-right"><button onClick={() => onDelete(p.id)} className="text-slate-600 hover:text-red-500"><FaTimes/></button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  )
}