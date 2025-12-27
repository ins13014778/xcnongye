
import React, { useEffect, useMemo, useState } from 'react';
import Dashboard, { SensorsState } from './components/Dashboard';
import Login from './components/Login';

type AuthState = {
  username: string;
  role: string;
  loginAt: number;
};

const AUTH_STORAGE_KEY = 'nyzm_auth_v1';

const loadAuth = (): AuthState | null => {
  try {
    let raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuthState> | null;
      if (parsed && typeof parsed.username === 'string') {
        return {
          username: parsed.username,
          role: typeof parsed.role === 'string' ? parsed.role : '高级农艺师',
          loginAt: typeof parsed.loginAt === 'number' ? parsed.loginAt : Date.now()
        };
      }
    }
    raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuthState> | null;
      if (parsed && typeof parsed.username === 'string') {
        return {
          username: parsed.username,
          role: typeof parsed.role === 'string' ? parsed.role : '高级农艺师',
          loginAt: typeof parsed.loginAt === 'number' ? parsed.loginAt : Date.now()
        };
      }
    }
    return null;
  } catch {
    return null;
  }
};

const saveAuth = (auth: AuthState): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } catch {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } catch {
      console.warn('无法保存登录状态');
    }
  }
};

const removeAuth = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {}
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {}
};

type NotificationKind = 'task' | 'alert' | 'system';
type NotificationSeverity = 'high' | 'medium' | 'low';

type NotificationItem = {
  id: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  detail: string;
  timeLabel: string;
};

const toTimeLabel = (time: string) => {
  if (!time) return '未更新';
  const match = time.match(/\b(\d{2}):(\d{2})(?::\d{2})?\b/);
  if (!match) return time;
  return `${match[1]}:${match[2]}`;
};

const badgeText = (severity: NotificationSeverity) => {
  if (severity === 'high') return '高';
  if (severity === 'medium') return '中';
  return '低';
};

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState | null>(() => loadAuth());
  const [sensors, setSensors] = useState<SensorsState | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notifications = useMemo<NotificationItem[]>(() => {
    if (!sensors) {
      return [];
    }

    const items: NotificationItem[] = [];

    if (sensors.lastError) {
      items.push({
        id: 'api-error',
        kind: 'system',
        severity: 'high',
        title: '数据接口异常',
        detail: sensors.lastError,
        timeLabel: '刚刚'
      });
    }

    if (sensors.soil.value !== null && sensors.soil.value < 50) {
      const value = Math.round(sensors.soil.value);
      items.push({
        id: 'soil-low',
        kind: 'task',
        severity: sensors.soil.value < 35 ? 'high' : 'medium',
        title: '补充水分（滴灌）',
        detail: `土壤湿度 ${value}% 低于阈值 50%`,
        timeLabel: toTimeLabel(sensors.soil.time)
      });
    }

    if (sensors.light.value !== null && sensors.light.value < 200) {
      const value = Math.round(sensors.light.value);
      items.push({
        id: 'light-low',
        kind: 'alert',
        severity: 'high',
        title: '光照不足',
        detail: `当前光照 ${value} lx，建议补光或调整位置`,
        timeLabel: toTimeLabel(sensors.light.time)
      });
    } else if (sensors.light.value !== null && sensors.light.value < 800) {
      const value = Math.round(sensors.light.value);
      items.push({
        id: 'light-weak',
        kind: 'alert',
        severity: 'medium',
        title: '光照偏弱',
        detail: `当前光照 ${value} lx，可适当延长光照时长`,
        timeLabel: toTimeLabel(sensors.light.time)
      });
    } else if (sensors.light.value !== null && sensors.light.value > 20000) {
      const value = Math.round(sensors.light.value);
      items.push({
        id: 'light-strong',
        kind: 'alert',
        severity: 'high',
        title: '光照过强',
        detail: `当前光照 ${value} lx，注意遮阴防灼伤`,
        timeLabel: toTimeLabel(sensors.light.time)
      });
    }

    if (sensors.tem.value !== null && (sensors.tem.value < 18 || sensors.tem.value > 30)) {
      items.push({
        id: 'temp-risk',
        kind: 'alert',
        severity: 'high',
        title: '温度风险',
        detail: `空气温度 ${sensors.tem.value.toFixed(1)}°C，建议尽快调节环境`,
        timeLabel: toTimeLabel(sensors.tem.time)
      });
    } else if (sensors.tem.value !== null && (sensors.tem.value < 22 || sensors.tem.value > 26)) {
      items.push({
        id: 'temp-warn',
        kind: 'alert',
        severity: 'medium',
        title: '温度偏离适宜范围',
        detail: `空气温度 ${sensors.tem.value.toFixed(1)}°C，适宜范围 22-26°C`,
        timeLabel: toTimeLabel(sensors.tem.time)
      });
    }

    if (sensors.hum.value !== null && (sensors.hum.value < 30 || sensors.hum.value > 80)) {
      items.push({
        id: 'hum-risk',
        kind: 'alert',
        severity: 'high',
        title: '湿度风险',
        detail: `空气湿度 ${Math.round(sensors.hum.value)}%，建议尽快调节通风/补湿`,
        timeLabel: toTimeLabel(sensors.hum.time)
      });
    } else if (sensors.hum.value !== null && (sensors.hum.value < 40 || sensors.hum.value > 70)) {
      items.push({
        id: 'hum-warn',
        kind: 'alert',
        severity: 'medium',
        title: '湿度偏离舒适范围',
        detail: `空气湿度 ${Math.round(sensors.hum.value)}%，舒适范围 40-70%`,
        timeLabel: toTimeLabel(sensors.hum.time)
      });
    }

    if (sensors.water.value !== null && sensors.water.value < 3) {
      items.push({
        id: 'water-low',
        kind: 'task',
        severity: 'medium',
        title: '检查水位',
        detail: `水深 ${sensors.water.value.toFixed(1)} cm，可能需要补水`,
        timeLabel: toTimeLabel(sensors.water.time)
      });
    }

    return items;
  }, [sensors]);

  const notificationCount = notifications.length;
  const notificationBadge = notificationCount > 9 ? '9+' : `${notificationCount}`;

  useEffect(() => {
    if (!isNotificationsOpen && !isProfileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNotificationsOpen, isProfileOpen]);

  const handleLogin = (username: string) => {
    const next: AuthState = {
      username,
      role: '高级农艺师',
      loginAt: Date.now()
    };
    setAuth(next);
    saveAuth(next);
  };

  const handleLogout = () => {
    removeAuth();
    setAuth(null);
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  };

  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      <main className="flex-1 w-full min-h-screen flex flex-col relative z-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm/50">
           <div className="flex items-center gap-4 md:gap-8 min-w-0">
             {/* Brand Logo - Moved here since Sidebar is gone */}
             <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-lg md:text-xl font-bold tracking-tight text-slate-800 whitespace-nowrap"><span className="text-emerald-600">农影</span>智监</span>
             </div>

             {/* Breadcrumb / Location */}
             <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 border-l border-slate-200 pl-8">
               <span className="hover:text-emerald-600 cursor-pointer transition-colors">首页</span>
               <span>/</span>
               <span className="text-slate-800 font-semibold">健康看板</span>
             </div>
           </div>

           {/* Right Actions */}
           <div className="flex items-center gap-3 md:gap-6">
              <div className="relative hidden md:block">
                <input 
                  type="text" 
                  placeholder="搜索植物 ID 或地块..." 
                  className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-slate-600 placeholder:text-slate-400"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center gap-3 md:gap-4 border-l border-slate-200 pl-4 md:pl-6">
                 <div className="relative">
                   {isNotificationsOpen && (
                     <div
                       className="fixed inset-0 z-40"
                       onClick={() => setIsNotificationsOpen(false)}
                     ></div>
                   )}
                   <button
                     className="relative text-slate-400 hover:text-slate-600 transition-colors"
                     aria-label="通知"
                     type="button"
                     onClick={() => {
                       setIsProfileOpen(false);
                       setIsNotificationsOpen((v) => !v);
                     }}
                   >
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                     </svg>
                     {notificationCount > 0 && (
                       <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full border-2 border-white text-[10px] font-black text-white flex items-center justify-center">
                         {notificationBadge}
                       </span>
                     )}
                   </button>

                   {isNotificationsOpen && (
                     <div className="fixed left-4 right-4 top-[72px] z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[380px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden origin-top-right">
                       <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                         <div className="min-w-0">
                           <div className="text-sm font-black text-slate-800">通知</div>
                           <div className="text-xs text-slate-500">
                             {sensors ? `共 ${notificationCount} 条` : '正在加载数据...'}
                           </div>
                         </div>
                         <button
                           type="button"
                           className="h-8 w-8 rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center"
                           onClick={() => setIsNotificationsOpen(false)}
                           aria-label="关闭"
                         >
                           ×
                         </button>
                       </div>

                       <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2">
                         {!sensors && (
                           <div className="px-3 py-4 text-sm text-slate-500">正在从传感器接口拉取最新数据…</div>
                         )}
                         {sensors && notificationCount === 0 && (
                           <div className="px-3 py-4 text-sm text-slate-500">暂无需要处理的任务或预警。</div>
                         )}
                         {notifications.map((n) => (
                           <div
                             key={n.id}
                             className="px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                           >
                             <div className="flex items-start justify-between gap-3">
                               <div className="min-w-0 flex-1">
                                 <div className="flex flex-wrap items-center gap-2 mb-1">
                                   <span className="text-sm font-bold text-slate-800 truncate max-w-full">{n.title}</span>
                                   <div className="flex items-center gap-1 flex-shrink-0">
                                      <span
                                        className={
                                          n.severity === 'high'
                                            ? 'text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap'
                                            : n.severity === 'medium'
                                              ? 'text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 whitespace-nowrap'
                                              : 'text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap'
                                        }
                                      >
                                        {badgeText(n.severity)}
                                      </span>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                                        {n.kind === 'task' ? '任务' : n.kind === 'alert' ? '预警' : '系统'}
                                      </span>
                                   </div>
                                 </div>
                                 <div className="text-xs text-slate-600 leading-relaxed break-words">{n.detail}</div>
                               </div>
                               <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap pt-0.5 flex-shrink-0">{n.timeLabel}</div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
                 <button className="text-slate-400 hover:text-slate-600 transition-colors">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                 </button>
                 
                 <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

                 <button
                   type="button"
                   className="flex items-center gap-3 cursor-pointer group"
                   onClick={() => {
                     setIsNotificationsOpen(false);
                     setIsProfileOpen(true);
                   }}
                 >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
                        农
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-600 hidden md:block">{auth.role}</span>
                 </button>
              </div>
           </div>
        </header>

        <div className="flex-1">
          <div className="max-w-7xl mx-auto w-full">
            <Dashboard onSensorsChange={setSensors} />
          </div>
        </div>

        {/* 底部状态栏 */}
        <footer className="bg-white border-t border-slate-200 h-12 flex items-center px-4 md:px-8 text-xs text-slate-400 justify-between">
          <div className="flex items-center gap-3 md:gap-6 min-w-0">
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              系统监测：运行正常
            </span>
            <span className="hidden sm:block">数据最后更新: 刚刚</span>
          </div>
          <div className="flex gap-3 md:gap-4 whitespace-nowrap">
             <span className="hover:text-slate-600 cursor-pointer hidden sm:inline">隐私协议</span>
             <span className="hover:text-slate-600 cursor-pointer hidden sm:inline">帮助中心</span>
             <span className="font-medium">© 2024 农影智监 V2.3</span>
          </div>
        </footer>
      </main>

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsProfileOpen(false)}></div>
          <div
            className="relative w-full sm:max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-black text-slate-900">个人信息</div>
                <div className="text-xs text-slate-500 mt-1">账号信息与登录状态</div>
              </div>
              <button
                type="button"
                className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center"
                onClick={() => setIsProfileOpen(false)}
                aria-label="关闭"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-black text-white shadow-md">
                  农
                </div>
                <div className="min-w-0">
                  <div className="text-base font-black text-slate-800 truncate">{auth.role}</div>
                  <div className="text-sm text-slate-500 font-mono truncate">账号：{auth.username}</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-bold text-slate-500">登录时间</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">
                    {new Date(auth.loginAt).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-bold text-slate-500">传感器状态</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">
                    {sensors?.lastError ? '异常' : sensors ? '正常' : '加载中'}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                  onClick={() => setIsProfileOpen(false)}
                >
                  关闭
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black shadow-sm"
                  onClick={handleLogout}
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
