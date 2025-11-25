import React from 'react';
import { TrendingUp, Flame, Search } from 'lucide-react';
import { Badge, Card, CardContent } from '@aipush/ui';
import { useTranslation } from '@aipush/i18n';
import { NewsItem } from '../types';

interface TrendingListProps {
  items: NewsItem[];
}

const TrendingList: React.FC<TrendingListProps> = ({ items }) => {
  const { t } = useTranslation();

  // Search function for TrendingList
  const handleSearch = (engine: 'google' | 'baidu' | 'bing', query: string, source: string) => {
    const searchQuery = `${query} ${source} AI news`;
    const encodedQuery = encodeURIComponent(searchQuery);

    let searchUrl = '';
    switch (engine) {
      case 'google':
        searchUrl = `https://www.google.com/search?q=${encodedQuery}`;
        break;
      case 'baidu':
        searchUrl = `https://www.baidu.com/s?wd=${encodedQuery}`;
        break;
      case 'bing':
        searchUrl = `https://www.bing.com/search?q=${encodedQuery}`;
        break;
    }

    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };
  // Sort by impact score
  const trendingItems = [...items].sort((a, b) => b.impact - a.impact).slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Flame className="w-8 h-8 text-orange-500" />
          {t('trending.title')}
        </h1>
        <p className="text-gray-400">{t('trending.description')}</p>
      </div>

      <div className="space-y-4">
        {trendingItems.map((item, index) => (
          <Card key={item.id} variant="bordered" className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="danger" size="sm">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Impact: {item.impact}
                      </Badge>
                      <Badge variant="primary" size="sm">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      {item.source && (
                        <span className="text-xs text-blue-400">
                          Source: {item.source}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-300">{item.summary}</p>
                  </div>
                </div>

                {/* Search engines dropdown */}
                <div className="relative group flex-shrink-0">
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
                        onClick={() => handleSearch('google', item.title, item.source)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 transition flex items-center gap-2"
                      >
                        <span className="text-blue-400">G</span> Google
                      </button>
                      <button
                        onClick={() => handleSearch('baidu', item.title, item.source)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 transition flex items-center gap-2"
                      >
                        <span className="text-red-400">B</span> 百度
                      </button>
                      <button
                        onClick={() => handleSearch('bing', item.title, item.source)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 transition flex items-center gap-2"
                      >
                        <span className="text-cyan-400">B</span> Bing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrendingList;
