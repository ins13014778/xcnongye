
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === '123' && password === '123') {
      onLogin(username);
    } else {
      setError('账号或密码错误');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
         <img
           src="https://images.unsplash.com/photo-1625246333195-58197bd47d26?auto=format&fit=crop&q=80&w=2000"
           alt="Agriculture Background"
           className="w-full h-full object-cover opacity-40"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/30"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10 w-full max-w-md relative z-10 mx-4">
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20">
             <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
             </svg>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight mb-2">农影智监</h1>
           <p className="text-slate-300 text-sm font-medium">智慧植物生长监测管理系统</p>
        </div>

        <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">体验账号</span>
            <span className="font-mono bg-black/20 px-2 py-0.5 rounded">123</span>
          </div>
          <div className="flex items-center justify-between gap-3 mt-2">
            <span className="font-semibold">体验密码</span>
            <span className="font-mono bg-black/20 px-2 py-0.5 rounded">123</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider ml-1">账号</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all focus:bg-slate-800/80"
              placeholder="请输入管理员账号"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider ml-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all focus:bg-slate-800/80"
              placeholder="请输入密码"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-pulse">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-2"
          >
            安全登录系统
          </button>
        </form>

         <div className="mt-10 text-center border-t border-white/5 pt-6">
           <p className="text-slate-500 text-xs font-medium">
             © 2024 Smart Agriculture Monitoring System
           </p>
         </div>
      </div>
    </div>
  );
};

export default Login;
