import React, { useState, useEffect } from 'react';
import { UserSettings, NewsCategory } from '../types';
import { Bell, Mail, Smartphone, Check, Globe, Languages, Type } from 'lucide-react';

interface SettingsProps {
  currentLanguage: string;
  currentFont: string;
  onLanguageChange: (lang: string) => void;
  onFontChange: (font: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentLanguage, currentFont, onLanguageChange, onFontChange }) => {
  const [settings, setSettings] = useState<UserSettings>({
    emailNotification: true,
    pushNotification: false,
    frequency: 'daily',
    categories: [NewsCategory.RESEARCH, NewsCategory.PRODUCT],
    language: currentLanguage,
    font: currentFont
  });
  
  const [saved, setSaved] = useState(false);

  // Sync local state if prop changes
  useEffect(() => {
    setSettings(prev => ({ 
      ...prev, 
      language: currentLanguage,
      font: currentFont 
    }));
  }, [currentLanguage, currentFont]);

  const toggleCategory = (cat: NewsCategory) => {
    setSettings(prev => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists 
          ? prev.categories.filter(c => c !== cat)
          : [...prev.categories, cat]
      };
    });
  };

  const handleSave = () => {
    onLanguageChange(settings.language);
    onFontChange(settings.font);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto glass-panel rounded-xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">Preferences</h2>

      {/* Language & Font Settings */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-cyan-400" /> Appearance & Region
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Language */}
          <div className="p-4 border border-white/10 rounded-lg bg-white/5">
             <div className="flex flex-col space-y-2">
               <div className="flex items-center space-x-2 mb-1">
                 <Languages className="w-5 h-5 text-slate-400" />
                 <span className="font-medium text-slate-200">Language</span>
               </div>
               <select 
                 value={settings.language}
                 onChange={(e) => setSettings({...settings, language: e.target.value})}
                 className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 outline-none"
               >
                 <option value="English">English (US)</option>
                 <option value="Chinese">Chinese (中文)</option>
                 <option value="Spanish">Spanish</option>
                 <option value="Japanese">Japanese</option>
                 <option value="German">German</option>
                 <option value="French">French</option>
               </select>
               <p className="text-xs text-slate-500 mt-1">
                 Sets the language for UI and AI summaries.
               </p>
             </div>
          </div>

          {/* Font */}
          <div className="p-4 border border-white/10 rounded-lg bg-white/5">
             <div className="flex flex-col space-y-2">
               <div className="flex items-center space-x-2 mb-1">
                 <Type className="w-5 h-5 text-slate-400" />
                 <span className="font-medium text-slate-200">Font Style</span>
               </div>
               <select 
                 value={settings.font}
                 onChange={(e) => setSettings({...settings, font: e.target.value})}
                 className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 outline-none"
               >
                 <option value="sans">Modern Sans (Default)</option>
                 <option value="serif">Elegant Serif</option>
                 <option value="mono">Developer Mono</option>
               </select>
               <p className="text-xs text-slate-500 mt-1">
                 Choose your preferred reading typography.
               </p>
             </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-cyan-400" /> Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/20 p-2 rounded-md"><Mail className="w-5 h-5 text-blue-400" /></div>
              <div>
                <p className="font-medium text-slate-200">Email Digest</p>
                <p className="text-sm text-slate-500">Receive the daily brief in your inbox</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.emailNotification}
                onChange={e => setSettings({...settings, emailNotification: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500/20 p-2 rounded-md"><Smartphone className="w-5 h-5 text-purple-400" /></div>
              <div>
                <p className="font-medium text-slate-200">App Push</p>
                <p className="text-sm text-slate-500">Real-time alerts for high impact news (Score 8+)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.pushNotification}
                onChange={e => setSettings({...settings, pushNotification: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Frequency */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Digest Frequency</h3>
        <div className="grid grid-cols-3 gap-4">
            {['realtime', 'daily', 'weekly'].map((freq) => (
               <button
                key={freq}
                onClick={() => setSettings({...settings, frequency: freq as any})}
                className={`py-2 px-4 rounded-lg text-sm font-medium border transition ${
                  settings.frequency === freq 
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                  : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
               >
                 {freq.charAt(0).toUpperCase() + freq.slice(1)}
               </button>
            ))}
        </div>
      </section>

      {/* Interests */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {Object.values(NewsCategory).map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition border border-transparent ${
                settings.categories.includes(cat)
                  ? 'bg-white text-slate-900 shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 border border-white/10 ${
            saved ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
          }`}
        >
          {saved ? (
            <span className="flex items-center"><Check className="w-5 h-5 mr-2" /> Saved</span>
          ) : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings;