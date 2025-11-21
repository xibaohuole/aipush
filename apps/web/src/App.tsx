import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import NewsCard from './components/NewsCard';
import DailyBrief from './components/DailyBrief';
import Settings from './components/Settings';
import TrendingList from './components/TrendingList';
import AddNewsModal from './components/AddNewsModal';
import { ViewState, NewsItem, DailySummary, NewsCategory, Region, ViewMode } from './types';
import { fetchRealtimeNews, generateDailyBriefing, askAI } from './services/geminiService';
import { Search, Filter, RefreshCw, Menu, X, Globe, Plus, Bookmark, Clock, Zap, FileText, User, Settings as SettingsIcon, LogOut, LayoutList, LayoutGrid, MessageCircle, Send } from 'lucide-react';
import { UI_TRANSLATIONS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // Filters & View Settings
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'All'>('All');
  const [selectedRegion, setSelectedRegion] = useState<Region | 'All'>('All');
  const [targetLanguage, setTargetLanguage] = useState<string>('English');
  const [viewMode, setViewMode] = useState<ViewMode>('CARD');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  
  // Modals & Menus
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // Ask AI Modal State
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [activeNewsItem, setActiveNewsItem] = useState<NewsItem | null>(null);
  const [askQuestion, setAskQuestion] = useState('');
  const [askAnswer, setAskAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Data
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState('');

  const t = UI_TRANSLATIONS[targetLanguage] || UI_TRANSLATIONS['English'];
  const profileRef = useRef<HTMLDivElement>(null);

  // Countdown Timer Logic
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(20, 0, 0, 0); // 8 PM
      if (now.getHours() >= 20) tomorrow.setDate(tomorrow.getDate() + 1);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    const timer = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsProcessing(true);
      const items = await fetchRealtimeNews();
      setNewsItems(items);
      setIsProcessing(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = async () => {
    setIsProcessing(true);
    const items = await fetchRealtimeNews();
    const customItems = newsItems.filter(n => n.isCustom);
    setNewsItems([...customItems, ...items]);
    setIsProcessing(false);
  };

  const handleAskAI = async () => {
    if (!activeNewsItem || !askQuestion.trim()) return;
    setIsAsking(true);
    const answer = await askAI(askQuestion, activeNewsItem);
    setAskAnswer(answer);
    setIsAsking(false);
  };

  const openAskModal = (item: NewsItem) => {
    setActiveNewsItem(item);
    setAskQuestion('');
    setAskAnswer('');
    setAskModalOpen(true);
  };

  const filteredNews = newsItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesRegion = selectedRegion === 'All' || item.region === selectedRegion;
    const matchesBookmark = showBookmarksOnly ? bookmarkedItems.has(item.id) : true;
    return matchesCategory && matchesRegion && matchesBookmark;
  });

  return (
    <div className="flex min-h-screen cosmic-bg font-sans text-slate-100 relative">
      
      {/* Background Grid Overlay */}
      <div className="cosmic-grid"></div>

      {/* Ask AI Modal */}
      {askModalOpen && activeNewsItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
           <div className="glass-panel rounded-xl w-full max-w-lg shadow-2xl border border-slate-600/50">
              <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
                 <h3 className="font-bold text-white flex items-center">
                   <Zap className="w-4 h-4 text-cyan-400 mr-2" />
                   {t.actions.ask}
                 </h3>
                 <button onClick={() => setAskModalOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
              </div>
              <div className="p-4">
                 <p className="text-sm text-slate-300 mb-4 italic border-l-2 border-cyan-500/50 pl-2">
                   Re: {activeNewsItem.title}
                 </p>
                 <div className="bg-slate-950/50 rounded-lg p-3 mb-4 min-h-[100px] max-h-[200px] overflow-y-auto text-sm text-slate-200 shadow-inner">
                    {isAsking ? (
                      <div className="flex items-center text-cyan-400"><RefreshCw className="w-4 h-4 animate-spin mr-2" /> Thinking...</div>
                    ) : (
                      askAnswer || "Ask me anything about this article. I can explain technical terms, implications, or background."
                    )}
                 </div>
                 <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={askQuestion}
                      onChange={(e) => setAskQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                      placeholder="e.g. How does this affect NVIDIA's stock?"
                      className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none placeholder-slate-500"
                    />
                    <button 
                      onClick={handleAskAI}
                      disabled={isAsking}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg shadow-lg shadow-cyan-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showAddModal && (
        <AddNewsModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={(item) => {
            setNewsItems(prev => [item, ...prev]);
            setShowAddModal(false);
          }} 
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-white/5 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
            currentView={currentView} 
            setView={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} 
            language={targetLanguage}
        />
        
        {/* Growth Widget: Sponsors */}
        <div className="absolute bottom-0 w-full p-4 border-t border-white/5 bg-slate-900/30 backdrop-blur">
           <div className="mb-4">
             <h4 className="text-[10px] font-bold text-cyan-400/80 uppercase mb-2 tracking-wider">{t.growth.sponsors}</h4>
             <div className="space-y-2">
                {['Acme AI', 'TechVentures', 'DataFlow'].map((s, i) => (
                   <div key={i} className="flex items-center justify-between text-sm text-slate-300">
                      <span>{i+1}. {s}</span>
                      <span className="text-amber-400 text-xs font-mono drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">🏆</span>
                   </div>
                ))}
             </div>
           </div>
           <button className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-xs font-bold text-white hover:brightness-110 transition shadow-lg shadow-cyan-500/20 border border-white/10">
              {t.growth.invite} <br/>
              <span className="text-[10px] font-normal opacity-80">{t.growth.inviteDesc}</span>
           </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Header */}
        <header className="glass-panel border-b border-white/5 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <span className="ml-2 font-bold text-lg text-white tracking-tight">AI Pulse</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition" />
                <input 
                  type="text" 
                  placeholder={t.header.searchPlaceholder} 
                  className="bg-slate-900/50 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 w-80 transition-all placeholder-slate-600"
                />
             </div>
             
             {/* Countdown Timer */}
             <div className="flex flex-col text-right">
                 <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{t.header.nextUpdate}</span>
                 <span className="text-sm font-mono font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">{timeLeft}</span>
             </div>
          </div>

          <div className="flex items-center space-x-3">
             <button className="hidden lg:flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition">
                <FileText className="w-4 h-4 mr-2" />
                {t.header.generateReport}
             </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-transparent hover:ring-cyan-400/50 transition"
              >
                JD
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 glass-panel rounded-xl shadow-2xl py-2 z-50">
                  <button 
                    onClick={() => setTargetLanguage(l => l === 'English' ? 'Chinese' : 'English')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 flex justify-between items-center transition"
                  >
                    <span>Lang: {targetLanguage}</span>
                    <Globe className="w-3 h-3 text-cyan-400" />
                  </button>
                  <button 
                     onClick={() => {setCurrentView(ViewState.SETTINGS); setProfileMenuOpen(false)}}
                     className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition"
                  >
                     {t.nav.settings}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {currentView === ViewState.DASHBOARD && (
            <>
              <div className="sticky top-0 z-20 glass-panel border-b border-white/5 px-6 py-4 shadow-lg shadow-black/20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{t.header.title}</h1>
                    <p className="text-sm text-slate-400">{t.header.subtitle}</p>
                  </div>

                  <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
                     {/* View Toggle */}
                     <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-700">
                        <button 
                          onClick={() => setViewMode('CARD')} 
                          className={`p-1.5 rounded transition ${viewMode === 'CARD' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                           <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setViewMode('LIST')} 
                          className={`p-1.5 rounded transition ${viewMode === 'LIST' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                           <LayoutList className="w-4 h-4" />
                        </button>
                     </div>

                     <select 
                        className="bg-slate-900/50 text-sm font-medium text-slate-300 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 hover:border-slate-600 transition"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as any)}
                     >
                       <option value="All">{t.filters.categories}</option>
                       {Object.values(NewsCategory).map(c => <option key={c} value={c}>{c}</option>)}
                     </select>

                     <button 
                      onClick={handleRefresh}
                      disabled={isProcessing}
                      className="flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-bold rounded-lg hover:bg-cyan-500 transition shadow-[0_0_15px_rgba(8,145,178,0.3)] border border-cyan-400/20"
                     >
                       <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                       {isProcessing ? t.filters.syncing : t.filters.refresh}
                     </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {newsItems.length === 0 && !isProcessing ? (
                  <div className="text-center py-20">
                    <p className="text-slate-500">{t.empty.noNews}</p>
                  </div>
                ) : (
                  <div className={`grid gap-6 pb-10 ${viewMode === 'LIST' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {filteredNews.length === 0 ? (
                      <div className="col-span-full text-center py-20 text-slate-500 italic">
                        {t.empty.noMatch}
                      </div>
                    ) : (
                      filteredNews.map(item => (
                        <NewsCard 
                          key={item.id} 
                          item={item} 
                          targetLanguage={targetLanguage}
                          isBookmarked={bookmarkedItems.has(item.id)}
                          viewMode={viewMode}
                          onToggleBookmark={(id) => setBookmarkedItems(prev => {
                             const newSet = new Set(prev);
                             newSet.has(id) ? newSet.delete(id) : newSet.add(id);
                             return newSet;
                          })}
                          onAsk={openAskModal}
                        />
                      ))
                    )}
                    {isProcessing && (
                      [1,2,3].map(i => (
                        <div key={i} className="glass-card rounded-xl p-5 h-64 animate-pulse"></div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Other Views */}
          <div className="p-6">
            {currentView === ViewState.TRENDING && <TrendingList items={newsItems} />}
            {currentView === ViewState.DAILY_BRIEF && (
               <DailyBrief 
                 summary={dailySummary} 
                 isLoading={isGeneratingSummary} 
                 onGenerate={() => {setIsGeneratingSummary(true); generateDailyBriefing(newsItems, targetLanguage).then(s => {setDailySummary(s); setIsGeneratingSummary(false)})}} 
               />
            )}
            {currentView === ViewState.SETTINGS && <Settings currentLanguage={targetLanguage} currentFont="sans" onLanguageChange={setTargetLanguage} onFontChange={() => {}} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;