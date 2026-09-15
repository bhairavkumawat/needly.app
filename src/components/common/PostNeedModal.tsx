import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  CheckCircle2,
  Tag,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UNIFIED_CATEGORIES, getSubcategoriesForCategory } from '../../data/categories';
import { ItemType } from '../../types';

const POPULAR_SERVICE_TEMPLATES = [
  {
    label: '⚡ AC Point & Wiring',
    title: 'Need Certified Electrician for Heavy 16A AC Socket Installation',
    category: 'tools',
    subcategory: 'Electricians & Wiring',
    budget: '500',
    description: 'Need skilled electrician to lay cable and install a dedicated 16A MCB box in bedroom.'
  },
  {
    label: '📸 Event Photographer',
    title: 'Looking for Event Photographer for 3-Hour Family Celebration',
    category: 'photography-media',
    subcategory: 'Portrait & Event Photographers',
    budget: '3500',
    description: 'Need high-res candid photos and quick highlights for a family gathering.'
  },
  {
    label: '🧹 Full Home Deep Cleaning',
    title: 'Need 2 Cleaners for 3BHK Deep Cleaning & Kitchen Degreasing',
    category: 'home-appliances',
    subcategory: 'Deep Cleaning & Sanitization',
    budget: '2200',
    description: 'Moving into a new flat, need bathrooms, kitchen, and balcony thoroughly scrubbed.'
  },
  {
    label: '🚰 Emergency Plumber',
    title: 'Urgent Plumber Needed for Under-Sink Pipe Leak',
    category: 'tools',
    subcategory: 'Plumbers & Fitting',
    budget: '400',
    description: 'Kitchen sink pipe joint is leaking water continuously. Immediate visit requested.'
  },
  {
    label: '💻 Laptop SSD Upgrade',
    title: 'Need Computer Technician to Install 1TB NVMe SSD & Clone OS',
    category: 'electronics-gadgets',
    subcategory: 'Computer & Mobile Technicians',
    budget: '800',
    description: 'Already purchased Kingston NVMe drive. Need OS cloned without data loss.'
  }
];

export const PostNeedModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentLocation, postNeed } = useApp();
  const [title, setTitle] = useState('');
  const type: ItemType = 'service';
  const [category, setCategory] = useState('tools');
  const [subcategory, setSubcategory] = useState('Electricians & Wiring');
  const [budget, setBudget] = useState('500');
  const [neededDate, setNeededDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const availableSubcategories = useMemo(() => {
    return getSubcategoriesForCategory(category, 'service');
  }, [category]);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const subcats = getSubcategoriesForCategory(newCat, 'service');
    setSubcategory(subcats[0] || 'General');
  };

  const applyTemplate = (t: typeof POPULAR_SERVICE_TEMPLATES[0]) => {
    setTitle(t.title);
    setCategory(t.category);
    setSubcategory(t.subcategory);
    setBudget(t.budget);
    setDescription(t.description);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      postNeed({
        title: title.trim(),
        description: description.trim() || `Looking for ${title.trim()} around ${currentLocation.displayName}.`,
        type: 'service',
        category,
        subcategory,
        budget: Number(budget) || 500,
        neededDate,
        location: currentLocation
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        onClose();
        const boardEl = document.getElementById('community-requests-board');
        if (boardEl) {
          boardEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 900);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="post-need-screen-container"
        className="bg-white w-full max-w-lg h-full min-h-[100dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Mobile Header */}
        <div className="p-4 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label="Back"
              className="p-1.5 -ml-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h2 className="text-base font-normal">Post a Service Request</h2>
              </div>
              <p className="text-[11px] text-teal-100 mt-0.5">
                Broadcast your service needs directly to verified local pros in {currentLocation.city}
              </p>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-50 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-normal text-slate-900">Request Broadcasted Live! 📢</h3>
              <p className="text-xs text-slate-600 max-w-xs">
                Your request is now live in <span className="font-normal text-slate-900">{currentLocation.displayName}</span>. Local service providers will reach out.
              </p>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-slate-800 bg-slate-50/40">
            {/* Quick Templates */}
            <div>
              <label className="text-[11px] font-normal text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-teal-600" />
                Popular Quick Templates
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                {POPULAR_SERVICE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyTemplate(tmpl)}
                    className="px-2.5 py-1.5 bg-white hover:bg-teal-50 hover:border-teal-300 border border-slate-200 rounded-xl text-xs font-normal text-slate-700 shrink-0 whitespace-nowrap transition-colors shadow-xs active:scale-95 cursor-pointer"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                What service are you looking for? *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Need professional sofa cleaning for 5-seater"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 shadow-xs"
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 shadow-xs text-slate-800"
                >
                  {UNIFIED_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Subcategory
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 shadow-xs text-slate-800"
                >
                  {availableSubcategories.map((sub, idx) => (
                    <option key={idx} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-teal-600" />
                  Estimated Budget (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 800"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  Needed By Date
                </label>
                <input
                  type="date"
                  required
                  value={neededDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNeededDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 shadow-xs"
                />
              </div>
            </div>

            {/* Location Display */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Service Location
              </label>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center justify-between">
                <span>{currentLocation.displayName}</span>
                <span className="text-[10px] text-teal-700 font-medium">GPS Active</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Detailed Job Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention specific equipment requirements, job duration, or timing preferences..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 shadow-xs resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-95 active:scale-[0.99] text-white text-xs font-medium rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>{isSubmitting ? 'Broadcasting...' : 'Broadcast Service Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
