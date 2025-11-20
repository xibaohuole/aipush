import React, { useState } from 'react';
import { ExternalLink, Bookmark, MessageSquare, Share2, Zap, PlayCircle, MoreHorizontal, Save, MessageCircle, Pin, Languages } from 'lucide-react';
import { NewsItem, NewsCategory, Region } from '../types';
import { translateText } from '../services/geminiService';
import { UI_TRANSLATIONS } from '../constants';

interface NewsCardProps {
  item: NewsItem;
  targetLanguage: string;
  isBookmarked: boolean;
  viewMode: 'CARD' | 'LIST';
  onToggleBookmark: (id: string) => void;
  onAsk: (item: NewsItem) => void;
}

const getCategoryGradient = (cat: NewsCategory) => {
  switch (cat) {
    case NewsCategory.RESEARCH: return 'from-cyan-500 to-blue-500';
    case NewsCategory.PRODUCT: return 'from-emerald-500 to-teal-400';
    case NewsCategory.FINANCE: return 'from-amber-500 to-yellow-400';
    case NewsCategory.POLICY: return 'from-rose-500 to-pink-500';
    case NewsCategory.MEME: return 'from-purple-500 to-fuchsia-500';
    default: return 'from-slate-500 to-gray-400';
  }
};

const NewsCard: React.FC<NewsCardProps> = ({ 
  item, 
  targetLanguage, 
  isBookmarked, 
  viewMode,
  onToggleBookmark,
  onAsk
}) => {
  const t = UI_TRANSLATIONS[targetLanguage]?.actions || UI_TRANSLATIONS['English'].actions;
  const [savedToNotion, setSavedToNotion] = useState(false);
  
  // Translation State
  const [translatedData, setTranslatedData] = useState<{title: string, summary: string, whyItMatters: string} | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleSaveNotion = () => {
    setSavedToNotion(true);
    setTimeout(() => setSavedToNotion(false), 2000);
  };

  const handleTranslate = async () => {
    if (translatedData) {
      setTranslatedData(null); // Toggle off
      return;
    }
    
    setIsTranslating(true);
    // If the target language is English, default to Chinese for demonstration, 
    // otherwise use the selected target language.
    const langToUse = targetLanguage === 'English' ? 'Chinese' : targetLanguage;
    
    try {
      const [tTitle, tSummary, tWhy] = await Promise.all([
        translateText(item.title, langToUse),
        translateText(item.summary, langToUse),
        translateText(item.whyItMatters, langToUse)
      ]);
      
      setTranslatedData({
        title: tTitle,
        summary: tSummary,
        whyItMatters: tWhy
      });
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const isList = viewMode === 'LIST';

  // Pinned comment simulation
  const pinnedComment = item.comments?.find(c => c.isPinned);

  // Display Logic
  const displayTitle = translatedData ? translatedData.title : item.title;
  const displaySummary = translatedData ? translatedData.summary : item.summary;
  const displayWhy = translatedData ? translatedData.whyItMatters : item.whyItMatters;

  return (
    <div className={`glass-card rounded-xl overflow-hidden transition-all group relative ${isList ? 'flex flex-row items-stretch h-40' : 'flex flex-col'}`}>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>

      {/* Visual Header (AI Art Placeholder) */}
      <div className={`relative overflow-hidden ${isList ? 'w-40' : 'h-32'}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(item.category)} opacity-20 group-hover:opacity-30 transition duration-500`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Abstract AI Art simulation */}
            <div className="w-full h-full opacity-40 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <span className="font-bold text-4xl text-white/10 tracking-widest uppercase drop-shadow-lg">{item.category.substring(0,3)}</span>
        </div>
        <div className="absolute top-3 left-3">
             <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase text-white bg-black/40 backdrop-blur-md border border-white/10 shadow-lg`}>
              {item.category}
            </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col relative z-10">
        {/* Title & Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className={`font-bold text-slate-100 leading-tight group-hover:text-cyan-300 transition duration-300 ${isList ? 'text-lg line-clamp-2' : 'text-xl'}`}>
            {displayTitle}
          </h3>
          {!isList && (
            <div className="flex space-x-1 ml-2">
               <button onClick={() => onToggleBookmark(item.id)} className="text-slate-500 hover:text-yellow-400 transition p-1">
                 <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`} />
               </button>
            </div>
          )}
        </div>

        {/* Why It Matters (Critical Feature) */}
        <div className="mb-4 bg-indigo-900/20 border-l-2 border-indigo-500 pl-3 py-1 rounded-r backdrop-blur-sm">
           <p className="text-xs font-semibold text-indigo-300 uppercase mb-0.5 flex items-center shadow-black/50 drop-shadow-sm">
             <Zap className="w-3 h-3 mr-1" /> {t.why}
           </p>
           <p className="text-sm text-indigo-100/90 italic leading-snug">
             {displayWhy}
           </p>
        </div>
        
        {/* Minimal Body */}
        <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-3 flex-grow">
          {displaySummary}
        </p>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex items-center space-x-3">
             {/* Original Source Link */}
             <a href={item.url} target="_blank" rel="noopener" className="flex items-center text-xs text-slate-500 hover:text-cyan-300 transition truncate max-w-[120px]">
                <ExternalLink className="w-3 h-3 mr-1" />
                {item.source}
             </a>
             
             {/* Ask AI Button */}
             <button 
               onClick={() => onAsk(item)}
               className="flex items-center text-xs font-medium text-cyan-300 hover:text-white bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20 hover:bg-cyan-500/30 transition shadow-[0_0_10px_rgba(6,182,212,0.1)]"
             >
               <MessageCircle className="w-3 h-3 mr-1" />
               {t.ask}
             </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Translate Button */}
            <button 
              onClick={handleTranslate}
              disabled={isTranslating}
              className={`transition ${translatedData ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`} 
              title={`Translate to ${targetLanguage === 'English' ? 'Chinese' : targetLanguage}`}
            >
               <Languages className={`w-4 h-4 ${isTranslating ? 'animate-spin' : ''}`} />
            </button>

            <button className="text-slate-500 hover:text-white transition" title={t.listen}>
               <PlayCircle className="w-4 h-4" />
            </button>
            
            <button 
              onClick={handleSaveNotion}
              className={`text-slate-500 hover:text-white transition ${savedToNotion ? 'text-green-400' : ''}`} 
              title={t.saveNotion}
            >
               <Save className="w-4 h-4" />
            </button>

            <button className="text-slate-500 hover:text-white transition">
               <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pinned Comment Section (Growth Feature) */}
        {!isList && pinnedComment && (
          <div className="mt-4 pt-3 bg-black/30 rounded-lg p-3 flex items-start space-x-3 border border-white/5">
             <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
               {pinnedComment.avatar}
             </div>
             <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                   <span className="text-xs font-bold text-slate-300">{pinnedComment.user}</span>
                   <Pin className="w-3 h-3 text-slate-500 rotate-45" />
                </div>
                <p className="text-xs text-slate-400 leading-tight">"{pinnedComment.content}"</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsCard;