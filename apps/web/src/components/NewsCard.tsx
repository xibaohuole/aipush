import React from 'react';
import { Bookmark, Share2, Zap, Search } from 'lucide-react';
import { Badge } from '@aipush/ui';
import { useTranslation } from '@aipush/i18n';
import { NewsItem, ViewMode } from '../types';

interface NewsCardProps {
  item: NewsItem;
  targetLanguage: string;
  isBookmarked: boolean;
  viewMode: ViewMode;
  onToggleBookmark: (id: string) => void;
  onAsk: (item: NewsItem) => void;
  globalTranslateEnabled?: boolean; // 全局翻译开关
}

const NewsCard: React.FC<NewsCardProps> = ({
  item,
  isBookmarked,
  viewMode,
  onToggleBookmark,
  onAsk,
  globalTranslateEnabled = false,
}) => {
  const { t } = useTranslation();

  const impactColor =
    item.impact >= 90
      ? 'danger'
      : item.impact >= 75
      ? 'warning'
      : item.impact >= 60
      ? 'info'
      : 'default';

  // 默认显示中文，点击"显示原文"按钮时显示英文
  // globalTranslateEnabled = false（默认）：显示中文
  // globalTranslateEnabled = true（显示原文）：显示英文
  const displayTitle = globalTranslateEnabled
    ? item.title  // 显示原文：英文标题
    : (item.titleCn || item.title); // 默认：中文标题，没有则显示英文

  const displaySummary = globalTranslateEnabled
    ? item.summary // 显示原文：英文摘要
    : (item.summaryCn || item.summary); // 默认：中文摘要，没有则显示英文

  const displayWhyItMatters = globalTranslateEnabled
    ? item.whyItMatters // 显示原文：英文重要性说明
    : (item.whyItMattersCn || item.whyItMatters); // 默认：中文重要性说明，没有则显示英文

  // Search engine URLs
  const generateSearchUrl = (engine: 'google' | 'baidu' | 'bing', query: string) => {
    const searchQuery = `${query} ${item.source}`;
    const encodedQuery = encodeURIComponent(searchQuery);

    switch (engine) {
      case 'google':
        return `https://www.google.com/search?q=${encodedQuery}`;
      case 'baidu':
        return `https://www.baidu.com/s?wd=${encodedQuery}`;
      case 'bing':
        return `https://www.bing.com/search?q=${encodedQuery}`;
      default:
        return `https://www.google.com/search?q=${encodedQuery}`;
    }
  };

  const handleSearch = (engine: 'google' | 'baidu' | 'bing', query: string) => {
    const searchUrl = generateSearchUrl(engine, query);
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  if (viewMode === 'LIST') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={impactColor} size="sm">
                {item.category}
              </Badge>
              <Badge variant="default" size="sm">
                {item.region}
              </Badge>
              <span className="text-xs text-gray-400">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{displayTitle}</h3>
            <p className="text-sm text-gray-300 line-clamp-2 mb-2">{displaySummary}</p>
            {displayWhyItMatters && (
              <div className="mb-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded">
                <p className="text-xs text-purple-300 font-semibold mb-1">💡 {t('newsCard.whyItMatters')}</p>
                <p className="text-xs text-gray-300 line-clamp-2">{displayWhyItMatters}</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-gray-400">Source: {item.source}</span>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline max-w-xs truncate"
                  title={item.url}
                >
                  {item.url}
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onAsk(item)}
              className="p-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 transition"
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleBookmark(item.id)}
              className={`p-2 rounded-lg transition ${
                isBookmarked
                  ? 'bg-yellow-600/20 text-yellow-400'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>

            {/* Search engines dropdown */}
            <div className="relative group">
              <button
                className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition"
                title="Search article"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-slate-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => handleSearch('google', displayTitle)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 transition flex items-center gap-2"
                  >
                    <span className="text-blue-400">G</span> Google
                  </button>
                  <button
                    onClick={() => handleSearch('baidu', displayTitle)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 transition flex items-center gap-2"
                  >
                    <span className="text-red-400">B</span> 百度
                  </button>
                  <button
                    onClick={() => handleSearch('bing', displayTitle)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 transition flex items-center gap-2"
                  >
                    <span className="text-cyan-400">B</span> Bing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={impactColor} size="sm">
            {item.category}
          </Badge>
          <Badge variant="default" size="sm">
            {t('newsCard.impact')}: {item.impact}
          </Badge>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(item.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-3 leading-tight">{displayTitle}</h3>
      <p className="text-sm text-gray-300 mb-3 line-clamp-3">{displaySummary}</p>

      {displayWhyItMatters && (
        <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <p className="text-xs text-purple-300 font-semibold mb-1">💡 {t('newsCard.whyItMatters')}</p>
          <p className="text-sm text-gray-300 line-clamp-2">{displayWhyItMatters}</p>
        </div>
      )}

      <div className="flex items-start justify-between pt-4 border-t border-white/10">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 mb-1">{t('newsCard.source')}: {item.source}</div>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline truncate block"
              title={item.url}
            >
              {item.url}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onAsk(item)}
            className="p-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 transition"
            title={t('newsCard.actions.askAI')}
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleBookmark(item.id)}
            className={`p-2 rounded-lg transition ${
              isBookmarked
                ? 'bg-yellow-600/20 text-yellow-400'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            title={t('newsCard.actions.bookmark')}
          >
            <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition" title={t('newsCard.actions.share')}>
            <Share2 className="w-4 h-4" />
          </button>

          {/* Search engines dropdown */}
          <div className="relative group">
            <button
              className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition"
              title="Search article"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-slate-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                <button
                  onClick={() => handleSearch('google', displayTitle)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <span className="text-blue-400">G</span> Google
                </button>
                <button
                  onClick={() => handleSearch('baidu', displayTitle)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <span className="text-red-400">B</span> 百度
                </button>
                <button
                  onClick={() => handleSearch('bing', displayTitle)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <span className="text-cyan-400">B</span> Bing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
