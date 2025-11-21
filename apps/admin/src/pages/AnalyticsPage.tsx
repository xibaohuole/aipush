import { TrendingUp, Users, Newspaper, Eye } from 'lucide-react';
import { formatNumber } from '../lib/utils';

const stats = [
  { name: '总浏览量', value: '1,234,567', change: '+12.5%', icon: Eye },
  { name: '活跃用户', value: '45,678', change: '+8.2%', icon: Users },
  { name: '新闻文章', value: '1,234', change: '+15.3%', icon: Newspaper },
  { name: '参与度', value: '68.5%', change: '+3.2%', icon: TrendingUp },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          数据分析
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          平台数据统计和分析报告
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {stat.change} vs 上周
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            用户增长趋势
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            图表区域（可集成 Recharts）
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            内容分类分布
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            图表区域（可集成 Recharts）
          </div>
        </div>
      </div>
    </div>
  );
}
