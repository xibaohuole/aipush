import React from 'react';
import { TrendingUp, Flame } from 'lucide-react';
import { Badge, Card, CardHeader, CardContent } from '@aipush/ui';
import { useTranslation } from '@aipush/i18n';
import { NewsItem } from '../types';

interface TrendingListProps {
  items: NewsItem[];
}

const TrendingList: React.FC<TrendingListProps> = ({ items }) => {
  const { t } = useTranslation();
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
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
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
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-300">{item.summary}</p>
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
