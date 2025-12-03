import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Bookmark, Share2, ExternalLink, Calendar, Tag, MapPin, TrendingUp, Eye } from 'lucide-react';
import { Badge } from '@aipush/ui';
import { useTranslation } from '@aipush/i18n';
import { NewsItem } from '../types';
import { markAsRead } from '../services/readHistoryService';

interface NewsDetailProps {
  newsId: string;
  onBack: () => void;
  onToggleBookmark: (id: string) => void;
  isBookmarked: boolean;
  globalTranslateEnabled?: boolean;
  onNavigateToNews?: (newsId: string) => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({
  newsId,
  onBack,
  onToggleBookmark,
  isBookmarked,
  globalTranslateEnabled = false,
  onNavigateToNews,
}) => {
  const { t } = useTranslation();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 已读跟踪
  const readStartTime = useRef<number>(0);
  const scrollDepthRef = useRef<number>(0);
  const hasMarkedAsRead = useRef<boolean>(false);

  // 获取新闻详情
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
        const response = await fetch(`${API_BASE_URL}/news/${newsId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch news detail');
        }

        const result = await response.json();

        // TransformInterceptor 会将响应包装为 {success: true, data: {...}}
        if (!result.success) {
          throw new Error(result.error?.message || 'News not found');
        }

        // 从包装的响应中提取实际数据
        const data = result.data;

        if (!data || !data.id) {
          throw new Error('Invalid news data');
        }

        // 映射后端数据到前端格式
        const mappedNews: NewsItem = {
          id: data.id,
          title: data.title,
          titleCn: data.titleCn,
          summary: data.summary,
          summaryCn: data.summaryCn,
          category: data.category,
          region: data.region,
          impact: data.impactScore || 0,
          timestamp: data.publishedAt,
          source: data.source || 'Unknown',
          url: data.sourceUrl || '',
          isTrending: data.isTrending,
          tags: data.tags || [],
          whyItMatters: data.whyItMatters,
          whyItMattersCn: data.whyItMattersCn,
        };

        setNewsItem(mappedNews);

        // 标记为已读（延迟3秒，确保用户真的在阅读）
        setTimeout(() => {
          if (!hasMarkedAsRead.current) {
            markAsRead(newsId).catch(err => {
              console.error('Failed to mark as read:', err);
            });
            hasMarkedAsRead.current = true;
            readStartTime.current = Date.now();
          }
        }, 3000);
      } catch (err: any) {
        console.error('Error fetching news detail:', err);
        setError(err.message || 'Failed to load news detail');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [newsId]);

  // 获取相关新闻（基于相同分类）
  useEffect(() => {
    const fetchRelatedNews = async () => {
      if (!newsItem) return;

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
        const response = await fetch(
          `${API_BASE_URL}/news?category=${newsItem.category}&limit=4`
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data.success && data.data?.items) {
          // 过滤掉当前新闻
          const related = data.data.items
            .filter((item: any) => item.id !== newsId)
            .slice(0, 3)
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              titleCn: item.titleCn,
              summary: item.summary,
              summaryCn: item.summaryCn,
              category: item.category,
              region: item.region,
              impact: item.impactScore || 0,
              timestamp: item.publishedAt,
              source: item.source || 'Unknown',
              url: item.sourceUrl || '',
              isTrending: item.isTrending,
              tags: item.tags || [],
            }));

          setRelatedNews(related);
        }
      } catch (err) {
        console.error('Error fetching related news:', err);
      }
    };

    fetchRelatedNews();
  }, [newsItem, newsId]);

  // 跟踪滚动深度
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrolled = (scrollTop + windowHeight) / documentHeight;
      const depth = Math.round(scrolled * 100);

      if (depth > scrollDepthRef.current) {
        scrollDepthRef.current = depth;
      }
    };

    window.addEventListener('scroll', handleScroll);

    // 在组件卸载时更新阅读时长和滚动深度
    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (hasMarkedAsRead.current && readStartTime.current > 0) {
        const readDuration = Math.round((Date.now() - readStartTime.current) / 1000);
        markAsRead(newsId, undefined, readDuration, scrollDepthRef.current).catch(err => {
          console.error('Failed to update read stats:', err);
        });
      }
    };
  }, [newsId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">{t('newsDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || t('newsDetail.notFound')}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            {t('newsDetail.goBack')}
          </button>
        </div>
      </div>
    );
  }

  // 决定显示的语言
  const displayTitle = globalTranslateEnabled
    ? newsItem.title
    : (newsItem.titleCn || newsItem.title);

  const displaySummary = globalTranslateEnabled
    ? newsItem.summary
    : (newsItem.summaryCn || newsItem.summary);

  const displayWhyItMatters = globalTranslateEnabled
    ? newsItem.whyItMatters
    : (newsItem.whyItMattersCn || newsItem.whyItMatters);

  const impactColor =
    newsItem.impact >= 90
      ? 'danger'
      : newsItem.impact >= 75
      ? 'warning'
      : newsItem.impact >= 60
      ? 'info'
      : 'default';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayTitle,
        text: displaySummary,
        url: window.location.href,
      }).catch(() => {
        // 降级：复制到剪贴板
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const url = newsItem.url || window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert(t('newsDetail.linkCopied'));
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('newsDetail.backToNews')}</span>
        </button>

        {/* 新闻主体 */}
        <article className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
          {/* 头部元数据 */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge variant={impactColor} size="sm">
              {newsItem.category}
            </Badge>
            <Badge variant="default" size="sm">
              <MapPin className="w-3 h-3 inline mr-1" />
              {newsItem.region}
            </Badge>
            <Badge variant="default" size="sm">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Impact: {newsItem.impact}
            </Badge>
            {newsItem.isTrending && (
              <Badge variant="warning" size="sm">
                🔥 {t('newsDetail.trending')}
              </Badge>
            )}
          </div>

          {/* 标题 */}
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            {displayTitle}
          </h1>

          {/* 发布时间和来源 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(newsItem.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Source: {newsItem.source}</span>
            </div>
          </div>

          {/* 摘要 */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-3">{t('newsDetail.summary')}</h2>
            <p className="text-lg text-gray-300 leading-relaxed">{displaySummary}</p>
          </div>

          {/* Why It Matters */}
          {displayWhyItMatters && (
            <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center gap-2">
                💡 {t('newsCard.whyItMatters')}
              </h3>
              <p className="text-gray-300 leading-relaxed">{displayWhyItMatters}</p>
            </div>
          )}

          {/* Tags */}
          {newsItem.tags && newsItem.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {t('newsDetail.tags')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {newsItem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 原文链接 */}
          {newsItem.url && (
            <div className="mb-6">
              <a
                href={newsItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t('newsDetail.readOriginal')}</span>
              </a>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button
              onClick={() => onToggleBookmark(newsItem.id)}
              className={`flex-1 px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                isBookmarked
                  ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
              <span>{isBookmarked ? t('newsDetail.saved') : t('newsDetail.save')}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition flex items-center justify-center gap-2 border border-white/10"
            >
              <Share2 className="w-5 h-5" />
              <span>{t('newsDetail.share')}</span>
            </button>
          </div>
        </article>

        {/* 相关新闻 */}
        {relatedNews.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">{t('newsDetail.relatedNews')}</h2>
            <div className="grid gap-4">
              {relatedNews.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition cursor-pointer"
                  onClick={() => {
                    if (onNavigateToNews) {
                      window.scrollTo(0, 0);
                      onNavigateToNews(item.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" size="sm">
                          {item.category}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {globalTranslateEnabled ? item.title : (item.titleCn || item.title)}
                      </h3>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {globalTranslateEnabled ? item.summary : (item.summaryCn || item.summary)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;
