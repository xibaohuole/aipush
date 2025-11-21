import {
  Users,
  Newspaper,
  MessageSquare,
  TrendingUp,
  Activity,
  Eye,
} from 'lucide-react';
import { cn, formatNumber } from '../lib/utils';

const stats = [
  {
    name: '总用户数',
    value: '12,456',
    change: '+12.5%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: '新闻文章',
    value: '1,234',
    change: '+8.2%',
    changeType: 'positive',
    icon: Newspaper,
  },
  {
    name: '评论数量',
    value: '8,921',
    change: '-2.4%',
    changeType: 'negative',
    icon: MessageSquare,
  },
  {
    name: '日活跃用户',
    value: '3,456',
    change: '+18.3%',
    changeType: 'positive',
    icon: Activity,
  },
];

const recentNews = [
  {
    id: 1,
    title: 'OpenAI 发布 GPT-5 预览版',
    category: 'AI',
    status: 'published',
    views: 15234,
    comments: 89,
    createdAt: '2025-01-15',
  },
  {
    id: 2,
    title: 'Google 推出新一代 AI 芯片',
    category: '硬件',
    status: 'pending',
    views: 8921,
    comments: 45,
    createdAt: '2025-01-15',
  },
  {
    id: 3,
    title: 'Meta 发布 Llama 3.5',
    category: 'AI',
    status: 'published',
    views: 12456,
    comments: 67,
    createdAt: '2025-01-14',
  },
];

const recentUsers = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'user',
    status: 'active',
    joinedAt: '2025-01-15',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: 'user',
    status: 'active',
    joinedAt: '2025-01-14',
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    role: 'moderator',
    status: 'active',
    joinedAt: '2025-01-13',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          仪表盘
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          系统概览和关键指标
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <span
                className={cn(
                  'text-sm font-medium',
                  stat.changeType === 'positive'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                vs 上周
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent News */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              最新新闻
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentNews.map((news) => (
              <div key={news.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {news.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {formatNumber(news.views)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {news.comments}
                      </span>
                      <span>{news.createdAt}</span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded',
                      news.status === 'published'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    )}
                  >
                    {news.status === 'published' ? '已发布' : '待审核'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              新注册用户
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.joinedAt}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
