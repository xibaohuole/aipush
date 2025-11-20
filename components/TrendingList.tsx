import React, { useState } from 'react';
import { NewsItem, NewsCategory } from '../types';
import { ExternalLink, TrendingUp, ArrowUpRight, BarChart3, Link2, Copy } from 'lucide-react';

interface TrendingListProps {
  items: NewsItem[];
}

const TrendingList: React.FC<TrendingListProps> = ({ items }) => {
  const [activeFilter, setActiveFilter] = useState<NewsCategory | 'All'>('All');

  const filterTabs = [
    { label: 'All', value: 'All' },
    { label: 'Finance', value: NewsCategory.FINANCE },
    { label: 'Lifestyle', value: NewsCategory.LIFESTYLE },
    { label: 'Entertainment', value: NewsCategory.ENTERTAINMENT },
    { label: 'Robotics', value: NewsCategory.ROBOTICS },
    { label: 'Tech & Product', value: NewsCategory.PRODUCT },
    { label: 'Research', value: NewsCategory.RESEARCH },
  ];

  const filteredItems = activeFilter === 'All' 
    ? items 
    : items.filter(item => item.category === activeFilter);
    
  const sortedItems = [...filteredItems].sort((a, b) => b.impactScore - a.impactScore);

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="glass-panel rounded-xl p-8 text-white mb-6 shadow-lg relative overflow-hidden border border-cyan-500/20">
         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10"></div>
         <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
             <TrendingUp size={200} className="text-cyan-500" />
         </div>
         <div className="relative z-10">
           <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white">Global AI Heatmap: Top 100</h1>
           <p className="text-cyan-100/80">The most critical stories shaping the industry right now, ranked by AI Impact Score.</p>
         </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === tab.value
                ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)]'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-slate-400 uppercase tracking-wider font-semibold text-xs">
                <th className="px-6 py-4 w-16 text-center">Rank</th>
                <th className="px-6 py-4">Headline & Source Trace</th>
                <th className="px-6 py-4 w-32">Category</th>
                <th className="px-6 py-4 w-32 text-center">Impact</th>
                <th className="px-6 py-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedItems.length === 0 ? (
                 <tr>
                     <td colSpan={5} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                         <BarChart3 className="w-8 h-8 text-slate-600 mb-2" />
                         <span>No trending news found for this category.</span>
                     </td>
                 </tr>
              ) : (
                sortedItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-white/5 transition group">
                    <td className="px-6 py-4 text-center align-top pt-5">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold shadow-lg ${
                            index === 0 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/50 shadow-amber-500/20' :
                            index === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/50' :
                            index === 2 ? 'bg-orange-400/20 text-orange-400 border border-orange-400/50' :
                            'text-slate-500'
                        }`}>
                            {index + 1}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-semibold text-slate-100 text-base mb-1 group-hover:text-cyan-300 transition leading-tight">
                                {item.title}
                            </span>
                            <span className="text-slate-500 text-xs line-clamp-1 mb-2">
                                {item.summary}
                            </span>
                            
                            {/* Source Tracing Section */}
                            <div className="bg-black/20 border border-white/5 rounded-md p-2 mt-1 flex items-center justify-between max-w-2xl group-hover:border-white/10 transition">
                                <div className="flex items-center text-xs text-slate-500 truncate mr-2">
                                    <Link2 className="w-3 h-3 mr-2 text-slate-600 flex-shrink-0" />
                                    <span className="font-mono text-slate-600 select-all truncate">
                                        {item.url}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded">
                                        {item.source}
                                     </span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 align-top pt-5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10 whitespace-nowrap">
                            {item.category}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center align-top pt-5">
                        <div className="flex items-center justify-center space-x-1">
                            <BarChart3 className={`w-4 h-4 ${
                                item.impactScore >= 8 ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 
                                item.impactScore >= 5 ? 'text-amber-400' : 'text-slate-600'
                            }`} />
                            <span className="font-bold text-slate-200">{item.impactScore}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center align-top pt-5">
                        <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-400 transition border border-transparent hover:border-cyan-500/20"
                        >
                            <ArrowUpRight className="w-4 h-4" />
                        </a>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrendingList;