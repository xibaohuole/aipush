import React, { useState } from 'react';
import { X } from 'lucide-react';
import { NewsCategory, NewsItem, Region } from '../types';

interface AddNewsModalProps {
  onClose: () => void;
  onAdd: (item: NewsItem) => void;
}

const AddNewsModal: React.FC<AddNewsModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    summary: '',
    whyItMatters: '',
    category: NewsCategory.OTHER,
    region: Region.GLOBAL,
    source: 'User Submitted'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: NewsItem = {
      id: `custom-${Date.now()}`,
      title: formData.title,
      url: formData.url,
      summary: formData.summary || 'No summary provided.',
      whyItMatters: formData.whyItMatters || 'User submitted bookmark.',
      category: formData.category,
      region: formData.region,
      source: formData.source,
      timestamp: new Date().toISOString(),
      impactScore: 5, // Default score for manual entry
      isCustom: true
    };

    onAdd(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="glass-panel rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 border border-slate-600">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-white">Add Custom Bookmark</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Headline / Title</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition placeholder-slate-600"
              placeholder="e.g. Interesting AI Article"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">URL</label>
            <input 
              required
              type="url" 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition placeholder-slate-600"
              placeholder="https://..."
              value={formData.url}
              onChange={e => setFormData({...formData, url: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as NewsCategory})}
              >
                {Object.values(NewsCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Region</label>
              <select 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                value={formData.region}
                onChange={e => setFormData({...formData, region: e.target.value as Region})}
              >
                {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Summary (Optional)</label>
            <textarea 
              rows={2}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition placeholder-slate-600"
              placeholder="Brief description or personal note..."
              value={formData.summary}
              onChange={e => setFormData({...formData, summary: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Why it Matters (Optional)</label>
            <input 
              type="text" 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition placeholder-slate-600"
              placeholder="Impact in one sentence..."
              value={formData.whyItMatters}
              onChange={e => setFormData({...formData, whyItMatters: e.target.value})}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-400 font-medium hover:text-white hover:bg-white/5 rounded-lg mr-2 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.4)] transition"
            >
              Add Bookmark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewsModal;