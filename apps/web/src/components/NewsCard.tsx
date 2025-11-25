import React, { useState } from 'react';
import { Bookmark, Share2, Zap, Languages, RefreshCw, Search } from 'lucide-react';
import { Badge } from '@aipush/ui';
import { useTranslation } from '@aipush/i18n';
import { NewsItem, ViewMode } from '../types';
import { translateToChinese } from '../services/geminiService';

interface NewsCardProps {
  item: NewsItem;
  targetLanguage: string;
  isBookmarked: boolean;
  viewMode: ViewMode;
  onToggleBookmark: (id: string) => void;
  onAsk: (item: NewsItem) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({
  item,
  isBookmarked,
  viewMode,
  onToggleBookmark,
  onAsk,
}) => {
  const { t } = useTranslation();
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<{
    translatedTitle: string;
    translatedSummary: string;
  } | null>(null);

  const impactColor =
    item.impact >= 90
      ? 'danger'
      : item.impact >= 75
      ? 'warning'
      : item.impact >= 60
      ? 'info'
      : 'default';

  const handleTranslate = async () => {
    if (isTranslated) {
      // Toggle back to original
      setIsTranslated(false);
      return;
    }

    setIsTranslating(true);
    try {
      const translatedTitle = await translateToChinese(item.title);
      const translatedSummary = await translateToChinese(item.summary);
      setTranslatedContent({ translatedTitle, translatedSummary });
      setIsTranslated(true);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const displayTitle = isTranslated && translatedContent ? translatedContent.translatedTitle : item.title;
  const displaySummary = isTranslated && translatedContent ? translatedContent.translatedSummary : item.summary;

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
            <h3 className="text-lg font-semibold text-white mb-2">
              {isTranslating ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  Translating...
                </div>
              ) : (
                displayTitle
              )}
            </h3>
            <p className="text-sm text-gray-300 line-clamp-2 mb-2">{displaySummary}</p>
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
              {isTranslated && (
                <span className="text-green-400 font-medium">已翻译 (Chinese)</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className={`p-2 rounded-lg transition ${
                isTranslated
                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                  : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400'
              } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isTranslated ? 'Show original (English)' : 'Translate to Chinese'}
            >
              {isTranslating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Languages className="w-4 h-4" />
              )}
            </button>
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

      <h3 className="text-xl font-bold text-white mb-3 leading-tight">
        {isTranslating ? (
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
            Translating...
          </div>
        ) : (
          displayTitle
        )}
      </h3>
      <p className="text-sm text-gray-300 mb-4 line-clamp-3">{displaySummary}</p>

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
          {isTranslated && (
            <div className="text-xs text-green-400 font-medium mt-1">已翻译 (Chinese)</div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className={`p-2 rounded-lg transition ${
              isTranslated
                ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400'
            } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isTranslated ? 'Show original (English)' : 'Translate to Chinese'}
          >
            {isTranslating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Languages className="w-4 h-4" />
            )}
          </button>
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
