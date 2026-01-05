import { useState } from "react";
import { GiPokerHand } from "react-icons/gi";
import { FaUser, FaLock, FaSpinner, FaUserPlus, FaSignInAlt } from "react-icons/fa";

interface Props {
    onLogin: (user: string, pass: string) => void;
    onRegister: (user: string, pass: string) => void;
    loading: boolean;
    error: string;
}

export default function LoginScreen({ onLogin, onRegister, loading, error }: Props) {
  const [isRegistering, setIsRegistering] = useState(false); // Alternar telas
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(username && password) {
        if (isRegistering) {
            onRegister(username, password);
        } else {
            onLogin(username, password);
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade relative overflow-hidden">
      {/* Fundo decorativo */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-2xl flex items-center justify-center border-2 border-blue-400/30 mb-4 animate-pulse-slow">
                <GiPokerHand className="text-white text-6xl drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Poker dos Amigos</h1>
            <p className="text-slate-400 text-sm">
                {isRegistering ? "Crie sua conta de administrador" : "Faça login para gerenciar a mesa"}
            </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-xl space-y-4">
            
            {/* Abas de Navegação */}
            <div className="flex bg-slate-900/50 p-1 rounded-xl mb-6">
                <button 
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${!isRegistering ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Entrar
                </button>
                <button 
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${isRegistering ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Cadastrar
                </button>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Usuário</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><FaUser /></div>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                        placeholder="Nome de usuário"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Senha</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><FaLock /></div>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                        placeholder="••••••"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3 text-red-200 text-xs text-center font-bold animate-fade">
                    {error}
                </div>
            )}

            <button 
                type="submit"
                disabled={loading}
                className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex justify-center items-center gap-2 ${isRegistering ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'} text-white`}
            >
                {loading ? <FaSpinner className="animate-spin" /> : (
                    <>
                        {isRegistering ? <FaUserPlus /> : <FaSignInAlt />}
                        {isRegistering ? "CRIAR CONTA" : "ENTRAR"}
                    </>
                )}
            </button>
        </form>
        
        <p className="text-center mt-6 text-xs text-slate-600">© {new Date().getFullYear()} Poker Manager System</p>
      </div>
    </div>
  );
}