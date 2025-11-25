import React from 'react';
import { NewsItem } from '../types';
import { TrendingUp, Globe, Zap, Package } from 'lucide-react';

interface DashboardStatsProps {
  newsItems: NewsItem[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ newsItems }) => {
  // Calculate statistics
  const totalNews = newsItems.length;
  const categories = newsItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  const avgImpactScore = newsItems.length > 0
    ? (newsItems.reduce((sum, item) => sum + (item.impact || 5), 0) / newsItems.length).toFixed(1)
    : '0';

  const highImpactCount = newsItems.filter(item => (item.impact || 5) >= 7).length;

  const stats = [
    {
      icon: Package,
      label: 'Total News',
      value: totalNews.toString(),
      color: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-400',
    },
    {
      icon: TrendingUp,
      label: 'High Impact',
      value: highImpactCount.toString(),
      color: 'from-emerald-500 to-teal-500',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Zap,
      label: 'Avg Impact',
      value: avgImpactScore,
      color: 'from-amber-500 to-orange-500',
      iconColor: 'text-amber-400',
    },
    {
      icon: Globe,
      label: 'Top Category',
      value: topCategory ? topCategory[0] : 'N/A',
      color: 'from-purple-500 to-pink-500',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="mb-6">
      {/* Mobile: Horizontal scroll cards */}
      <div className="md:hidden overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-3 min-w-max">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="glass-card rounded-lg p-3 hover:scale-105 transition-transform duration-300 min-w-[140px] flex-shrink-0"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                </div>
                <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="glass-card rounded-xl p-5 hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                </div>
              </div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardStats;
