import React, { useState } from 'react';
import { 
  Plus, 
  ExternalLink, 
  Trash2, 
  Layers, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  AlertCircle,
  Sparkles,
  Camera,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PortfolioItem } from '../../types';

export const PortfolioManager: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useApp();
  const portfolio: PortfolioItem[] = currentUser.portfolio || [];

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a project title');
      return;
    }

    let validLink = link.trim();
    if (validLink) {
      if (!validLink.startsWith('http://') && !validLink.startsWith('https://')) {
        validLink = `https://${validLink}`;
      }
      try {
        new URL(validLink);
      } catch {
        setError('Please enter a valid URL link');
        return;
      }
    }

    const newItem: PortfolioItem = {
      id: `port-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: title.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      link: validLink || undefined,
      createdAt: new Date().toISOString()
    };

    const updatedPortfolio = [newItem, ...portfolio];
    updateCurrentUserProfile({ portfolio: updatedPortfolio });

    setTitle('');
    setDescription('');
    setImageUrl('');
    setLink('');
    setError('');
    setIsAdding(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  const handleDelete = (id: string) => {
    const updated = portfolio.filter(item => item.id !== id);
    updateCurrentUserProfile({ portfolio: updated });
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Trigger */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Work Portfolio Showcase</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Demonstrate quality &amp; past projects to prospective local clients.
          </p>
        </div>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-medium rounded-xl shadow-xs inline-flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Work</span>
          </button>
        )}
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Work sample added to your verified showcase!</span>
        </div>
      )}

      {/* Add Form Card */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 bg-white rounded-2xl border border-teal-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Add New Project / Work Sample</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setError('');
              }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Project / Work Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 3BHK Villa Complete Deep Sanitization"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Short Description / Results
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Removed years of grease from Italian kitchen tiles using high pressure steam."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-slate-400" />
                <span>Image URL (optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1 flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-slate-400" />
                <span>Live Project / Proof Link (optional)</span>
              </label>
              <input
                type="text"
                placeholder="instagram.com/p/... or drive.google.com/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-medium rounded-xl shadow-xs hover:opacity-95 cursor-pointer"
            >
              Save to Portfolio
            </button>
          </div>
        </form>
      )}

      {/* Portfolio Items List */}
      {portfolio.length === 0 && !isAdding ? (
        <div className="py-12 px-4 bg-white rounded-3xl border border-slate-200/80 text-center text-slate-400 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
            <Layers className="w-6 h-6 stroke-1" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">No portfolio items yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Showcase photos, case studies, or proof links of your work to gain trust and more bookings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-teal-600 text-white text-xs font-medium rounded-xl shadow-xs hover:bg-teal-700 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {portfolio.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div>
                {item.imageUrl && (
                  <div className="h-32 w-full bg-slate-100 overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">{item.title}</h4>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 text-[11px]">
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-800 font-medium inline-flex items-center gap-1"
                  >
                    <span>View Proof</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-400 text-[10px]">Verified showcase</span>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Remove from portfolio"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
