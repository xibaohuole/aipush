import React, { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { Badge } from '@aipush/ui';
import { getUserReadHistory, getReadStats } from '../services/readHistoryService';
import { NewsItem } from '../types';

interface ReadHistoryProps {
  onNavigateToNews?: (newsId: string) => void;
}

interface ReadHistoryItem {
  id: string;
  readAt: string;
  readDuration?: number;
  scrollDepth?: number;
  news: NewsItem;
}

interface ReadStats {
  totalRead: number;
  todayRead: number;
  weekRead: number;
  avgReadDuration: number;
}

const ReadHistory: React.FC<ReadHistoryProps> = ({ onNavigateToNews }) => {
  const [history, setHistory] = useState<ReadHistoryItem[]>([]);
  const [stats, setStats] = useState<ReadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [historyData, statsData] = await Promise.all([
        getUserReadHistory(currentPage, 10),
        getReadStats(),
      ]);

      setHistory(historyData.items);
      setTotalPages(historyData.pagination.totalPages);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load read history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatReadTime = (seconds?: number) => {
    if (!seconds) return '未知';
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分钟`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  if (loading && history.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">阅读历史</h1>
        <p className="text-slate-400">查看你的阅读记录和统计</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">总阅读量</span>
              <Eye className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalRead}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">今日阅读</span>
              <Calendar className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.todayRead}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">本周阅读</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.weekRead}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">平均阅读时长</span>
              <Clock className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-white">{formatReadTime(stats.avgReadDuration)}</div>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-lg">
            <Eye className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">还没有阅读记录</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/10 transition-all cursor-pointer group"
              onClick={() => onNavigateToNews && onNavigateToNews(item.news.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" size="sm">
                      {item.news.category}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDate(item.readAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition">
                    {item.news.titleCn || item.news.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {item.news.summaryCn || item.news.summary}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {item.readDuration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        阅读时长: {formatReadTime(item.readDuration)}
                      </div>
                    )}
                    {item.scrollDepth && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        滚动深度: {item.scrollDepth}%
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition flex-shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            上一页
          </button>
          <span className="text-sm text-gray-400">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};

export default ReadHistory;
