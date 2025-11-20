import React from 'react';
import { LayoutDashboard, FileText, Settings, Zap, Flame } from 'lucide-react';
import { ViewState } from '../types';
import { UI_TRANSLATIONS } from '../constants';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  language?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, language = 'English' }) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['English'];

  const navItems = [
    { id: ViewState.DASHBOARD, label: t.nav.dashboard, icon: LayoutDashboard },
    { id: ViewState.TRENDING, label: t.nav.trending, icon: Flame },
    { id: ViewState.DAILY_BRIEF, label: t.nav.dailyBrief, icon: FileText },
    { id: ViewState.SETTINGS, label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside className="w-64 h-full flex flex-col">
      <div className="p-6 flex items-center space-x-2 border-b border-white/5">
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/30">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight">AI Pulse</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-white/10 text-cyan-400 font-semibold shadow-[0_0_15px_rgba(34,211,238,0.15)] border border-cyan-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-gradient-to-br from-violet-900/50 to-fuchsia-900/50 border border-white/10 rounded-xl p-4 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <h4 className="font-bold text-sm mb-1 text-violet-100 relative z-10">Upgrade to Pro</h4>
          <p className="text-xs text-violet-200/70 mb-3 relative z-10">Get real-time alerts and custom analyst reports.</p>
          <button className="w-full bg-white/10 hover:bg-white/20 text-xs font-semibold py-2 rounded border border-white/10 transition relative z-10">
            Coming Soon
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;