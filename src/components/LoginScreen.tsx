import { GiPokerHand } from "react-icons/gi";

interface Props {
    onLogin: () => void;
}

export default function LoginScreen({ onLogin }: Props) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade relative overflow-hidden">
      {/* Efeito de fundo */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-md text-center">
        {/* Logo Grande */}
        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-2xl flex items-center justify-center border-2 border-blue-400/30 mb-8 animate-pulse-slow">
            <GiPokerHand className="text-white text-6xl md:text-7xl drop-shadow-lg" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Poker dos Amigos</h1>
        <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed">
            Seja bem vindo ao Sistema. <br/>Jogue com sabedoria e responsabilidade.
        </p>

        <button 
            onClick={onLogin}
            className="group relative inline-flex items-center justify-start overflow-hidden rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition-all hover:bg-blue-500 w-full md:w-auto justify-center shadow-lg shadow-blue-900/30"
        >
            <span className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 transition-all duration-300 group-hover:from-blue-500 group-hover:via-blue-600 group-hover:to-blue-400"></span>
            <span className="relative text-lg uppercase tracking-wider flex items-center gap-2">
                Entrar no Sistema
            </span>
        </button>
      </div>
      
      <p className="absolute bottom-6 text-xs text-slate-600">© {new Date().getFullYear()} Poker Manager. Versão 33.0 Mobile</p>
    </div>
  );
}