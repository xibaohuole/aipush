import React from 'react';
import { LayoutDashboard, TrendingUp, FileText, Settings as SettingsIcon, Clock } from 'lucide-react';
import { useTranslation } from '@aipush/i18n';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  language: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { t } = useTranslation();

  const navItems = [
    { view: ViewState.DASHBOARD, label: t('nav.dashboard'), icon: LayoutDashboard },
    { view: ViewState.TRENDING, label: t('nav.trending'), icon: TrendingUp },
    { view: ViewState.DAILY_BRIEF, label: t('nav.dailyBrief'), icon: FileText },
    { view: ViewState.READ_HISTORY, label: '阅读历史', icon: Clock },
    { view: ViewState.SETTINGS, label: t('nav.settings'), icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {t('header.title')}
        </h1>
        <p className="text-sm text-gray-400 mt-1">{t('header.subtitle')}</p>
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
