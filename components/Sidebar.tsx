
import React from 'react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: '📊', label: '健康看板', active: true },
    { icon: '🗺️', label: '地块地图', active: false },
    { icon: '🌡️', label: '环境监控', active: false },
    { icon: '📸', label: 'AI 识别记录', active: false },
    { icon: '🎮', label: '设备控制', active: false },
    { icon: '📈', label: '产量预测', active: false },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen text-white flex flex-col fixed left-0 top-0 z-50 shadow-2xl">
      {/* Brand Logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight"><span className="text-emerald-400">农影</span>智监</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
        
        <div>
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">主控台</p>
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 group ${
                    item.active 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-emerald-400'
                  }`}
                >
                  <span className={`text-lg transition-transform group-hover:scale-110 ${item.active ? '' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">系统设置</p>
          <ul className="space-y-1">
            <li>
              <button className="w-full text-left px-4 py-2.5 rounded-xl flex items-center gap-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <span className="text-lg opacity-70">⚙️</span>
                <span className="font-medium text-sm">参数配置</span>
              </button>
            </li>
            <li>
              <button className="w-full text-left px-4 py-2.5 rounded-xl flex items-center gap-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <span className="text-lg opacity-70">🔔</span>
                <span className="font-medium text-sm">报警规则</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 border border-slate-700/50 hover:border-emerald-500/30 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
            农
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors truncate">高级农艺师</p>
            <p className="text-slate-500 text-xs truncate">第 3 号试验田</p>
          </div>
          <div className="text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
