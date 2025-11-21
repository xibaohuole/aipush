import React from 'react';
import { Bookmark, Share2, Zap, ExternalLink } from 'lucide-react';
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
}

const NewsCard: React.FC<NewsCardProps> = ({
  item,
  isBookmarked,
  viewMode,
  onToggleBookmark,
  onAsk,
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

  if (viewMode === 'LIST') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
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
            <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-gray-300 line-clamp-2">{item.summary}</p>
          </div>
          <div className="flex items-center gap-2">
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
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
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

      <h3 className="text-xl font-bold text-white mb-3 leading-tight">{item.title}</h3>
      <p className="text-sm text-gray-300 mb-4 line-clamp-3">{item.summary}</p>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-xs text-gray-400">{t('newsCard.source')}: {item.source}</span>
        <div className="flex items-center gap-2">
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
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition"
              title={t('newsCard.actions.readMore')}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
