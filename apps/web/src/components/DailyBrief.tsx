import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, Spinner } from '@aipush/ui';
import { DailySummary } from '../types';

interface DailyBriefProps {
  summary: DailySummary | null;
  isLoading: boolean;
  onGenerate: () => void;
}

const DailyBrief: React.FC<DailyBriefProps> = ({ summary, isLoading, onGenerate }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Daily Brief</h1>
        <p className="text-gray-400">AI-generated summary of today's news</p>
      </div>

      {!summary && !isLoading && (
        <Card variant="bordered" className="bg-white/5 border-white/10">
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No daily brief generated yet
            </h3>
            <p className="text-gray-400 mb-6">
              Generate an AI-powered summary of today's top AI news
            </p>
            <Button onClick={onGenerate} variant="primary" size="lg">
              <Sparkles className="w-5 h-5" />
              Generate Daily Brief
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card variant="bordered" className="bg-white/5 border-white/10">
          <CardContent className="text-center py-12">
            <Spinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Generating your daily brief...
            </h3>
            <p className="text-gray-400">This may take a few moments</p>
          </CardContent>
        </Card>
      )}

      {summary && !isLoading && (
        <div className="space-y-6">
          <Card variant="bordered" className="bg-white/5 border-white/10">
            <CardHeader className="border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{summary.date}</h2>
                <Button onClick={onGenerate} variant="outline" size="sm">
                  <Sparkles className="w-4 h-4" />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-lg leading-relaxed">{summary.content}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="bordered" className="bg-white/5 border-white/10">
              <CardHeader className="border-white/10">
                <h3 className="font-bold text-white text-lg">Key Highlights</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card variant="bordered" className="bg-white/5 border-white/10">
              <CardHeader className="border-white/10">
                <h3 className="font-bold text-white text-lg">Key Trends</h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {summary.keyTrends.map((trend, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium"
                    >
                      {trend}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyBrief;
