import React from 'react';
import { LayoutDashboard, TrendingUp, FileText, Settings as SettingsIcon } from 'lucide-react';
import { ViewState } from '../types';
import { UI_TRANSLATIONS } from '../constants';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  language: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, language }) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['English'];

  const navItems = [
    { view: ViewState.DASHBOARD, label: t.nav.dashboard, icon: LayoutDashboard },
    { view: ViewState.TRENDING, label: t.nav.trending, icon: TrendingUp },
    { view: ViewState.DAILY_BRIEF, label: t.nav.brief, icon: FileText },
    { view: ViewState.SETTINGS, label: t.nav.settings, icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          AI Pulse
        </h1>
        <p className="text-sm text-gray-400 mt-1">Daily News</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;

          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
