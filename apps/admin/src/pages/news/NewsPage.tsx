import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn, formatDateTime, formatNumber } from '../../lib/utils';

const mockNews = [
  {
    id: '1',
    title: 'OpenAI 发布 GPT-5 预览版，性能大幅提升',
    category: 'AI',
    status: 'published',
    views: 15234,
    comments: 89,
    author: '编辑部',
    createdAt: '2025-01-15T10:00:00Z',
    publishedAt: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Google 推出新一代 AI 芯片 TPU v6',
    category: '硬件',
    status: 'pending',
    views: 0,
    comments: 0,
    author: '张三',
    createdAt: '2025-01-15T09:00:00Z',
    publishedAt: null,
  },
  {
    id: '3',
    title: 'Meta 开源 Llama 3.5 模型',
    category: 'AI',
    status: 'published',
    views: 12456,
    comments: 67,
    author: '李四',
    createdAt: '2025-01-14T15:00:00Z',
    publishedAt: '2025-01-14T15:30:00Z',
  },
  {
    id: '4',
    title: '违规内容测试',
    category: 'AI',
    status: 'rejected',
    views: 0,
    comments: 0,
    author: '测试用户',
    createdAt: '2025-01-13T12:00:00Z',
    publishedAt: null,
  },
];

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredNews = mockNews.filter((news) => {
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || news.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || news.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            新闻管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            审核、编辑和发布新闻内容
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索新闻标题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">所有状态</option>
            <option value="published">已发布</option>
            <option value="pending">待审核</option>
            <option value="rejected">已拒绝</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">所有分类</option>
            <option value="AI">AI</option>
            <option value="硬件">硬件</option>
            <option value="软件">软件</option>
          </select>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.map((news) => (
          <div
            key={news.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Link
                    to={`/news/${news.id}`}
                    className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {news.title}
                  </Link>
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded',
                      news.status === 'published'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : news.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    )}
                  >
                    {news.status === 'published' ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        已发布
                      </span>
                    ) : news.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        待审核
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        已拒绝
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <span>分类: {news.category}</span>
                  <span>作者: {news.author}</span>
                  <span>创建: {formatDateTime(news.createdAt)}</span>
                  {news.publishedAt && (
                    <span>发布: {formatDateTime(news.publishedAt)}</span>
                  )}
                </div>

                {news.status === 'published' && (
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatNumber(news.views)} 浏览
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {news.comments} 评论
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {news.status === 'pending' && (
                  <>
                    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg">
                      批准
                    </button>
                    <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg">
                      拒绝
                    </button>
                  </>
                )}
                <Link
                  to={`/news/${news.id}`}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg"
                >
                  查看详情
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">没有找到匹配的新闻</p>
        </div>
      )}
    </div>
  );
}
