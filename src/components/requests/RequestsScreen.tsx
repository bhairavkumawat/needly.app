import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  X, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UNIFIED_CATEGORIES, getCategoryName } from '../../data/categories';
import { AnimatedCategoryIcon } from '../common/AnimatedCategoryIcon';
import { NeedPost } from '../../types';
import { PostNeedModal } from '../common/PostNeedModal';
import { RespondToNeedModal } from '../common/RespondToNeedModal';
import { RequestDetailModal } from './RequestDetailModal';
import { useDragScroll } from '../../hooks/useDragScroll';

export const RequestsScreen: React.FC = () => {
  const { 
    currentUser, 
    needs, 
    deleteNeed, 
    toggleNeedStatus, 
    currentLocation,
    setActiveTab,
    t
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'open' | 'my'>('all');
  const [showPostNeed, setShowPostNeed] = useState(false);
  const [selectedNeedToRespond, setSelectedNeedToRespond] = useState<NeedPost | null>(null);
  const [selectedNeedForDetails, setSelectedNeedForDetails] = useState<NeedPost | null>(null);

  const catDragScroll = useDragScroll<HTMLDivElement>({ dragSpeed: 1.3 });

  // Only service needs in the service marketplace
  const serviceNeeds = useMemo(() => {
    return needs.filter(n => n.type === 'service' || !n.type);
  }, [needs]);

  // Filtered requests list
  const filteredNeeds = useMemo(() => {
    return serviceNeeds.filter((need) => {
      // Filter tab
      if (filterType === 'open' && need.status !== 'open') return false;
      if (filterType === 'my' && need.userId !== currentUser.id) return false;

      // Category filter
      if (selectedCat !== 'all' && need.category !== selectedCat) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const catName = getCategoryName(need.category).toLowerCase();
        const sub = (need.subcategory || '').toLowerCase();
        const matches = 
          need.title.toLowerCase().includes(q) ||
          need.description.toLowerCase().includes(q) ||
          need.userName.toLowerCase().includes(q) ||
          need.location.displayName.toLowerCase().includes(q) ||
          catName.includes(q) ||
          sub.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [serviceNeeds, filterType, selectedCat, searchQuery, currentUser.id]);

  const myNeedsCount = serviceNeeds.filter(n => n.userId === currentUser.id).length;

  return (
    <div id="needly-requests-screen" className="space-y-4 pb-24">
      {/* Top Header Banner */}
      <div 
        className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 px-4 py-4 text-white shadow-md"
        style={{ paddingTop: '16px' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-xl shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <h1 className="text-lg sm:text-xl font-normal tracking-tight text-white">
                {t('requests.title', 'Community Requests')}
              </h1>
            </div>
            <p 
              className="text-xs text-teal-100/90 leading-relaxed w-[215px]"
              style={{ width: '215px' }}
            >
              {t('requests.subtitle', `Can't find what you need in ${currentLocation.city}? Broadcast a request or fulfill one from a neighbor!`)}
            </p>
          </div>

          <button
            id="requests-post-btn"
            onClick={() => setShowPostNeed(true)}
            style={{
              paddingLeft: '10px',
              paddingRight: '10px',
              paddingTop: '12px',
              paddingBottom: '12px',
              marginLeft: '226px',
              marginRight: '0px',
              marginTop: '-70px',
              marginBottom: '22px'
            }}
            className="self-start sm:self-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 active:scale-95 text-white text-xs font-normal rounded-xl shadow-md flex items-center gap-2 shrink-0 transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('requests.post_btn', 'Post Request')}</span>
          </button>
        </div>
      </div>

      {/* Search & Category Section */}
      <div className="px-4 space-y-2.5">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('requests.search_placeholder', 'Search requested tools, gears, services, or locations...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-xs bg-white border border-slate-200 focus:border-teal-500 rounded-xl focus:outline-none transition-colors shadow-xs text-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Segmented Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shadow-xs text-center">
          {[
            { id: 'all' as const, label: `All Requests (${serviceNeeds.length})` },
            { id: 'open' as const, label: `Open (${serviceNeeds.filter(n => n.status === 'open').length})` },
            { id: 'my' as const, label: `My Requests (${myNeedsCount})` },
          ].map((tab) => {
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`py-1.5 text-[11px] font-normal rounded-xl transition-all truncate cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 font-normal'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category horizontal scroll */}
        <div
          {...catDragScroll.dragProps}
          className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 select-none cursor-grab active:cursor-grabbing ${
            catDragScroll.isDragging ? 'cursor-grabbing' : ''
          }`}
        >
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-normal shrink-0 transition-all cursor-pointer ${
              selectedCat === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {t('home.all_categories', 'All Categories')}
          </button>
          {UNIFIED_CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-normal shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <AnimatedCategoryIcon
                  categoryId={cat.id}
                  size="xs"
                  className="shrink-0"
                />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests List */}
      <div className="px-4 space-y-3">
        {filteredNeeds.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[15px] font-normal text-slate-900">No requests found</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                {filterType === 'my' 
                  ? "You haven't posted any community requests yet. Broadcast what you're looking for to nearby neighbors and providers!"
                  : "No community requests match your current filters. Try changing category or post what you're looking for."}
              </p>
            </div>
            <button
              onClick={() => setShowPostNeed(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 active:scale-95 text-white text-[11px] font-normal rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Post a Need Request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNeeds.map((need) => {
              const isMyNeed = need.userId === currentUser.id;
              const isFulfilled = need.status === 'fulfilled';
              const categoryName = getCategoryName(need.category);

              return (
                <div
                  key={need.id}
                  id={`need-card-${need.id}`}
                  className={`p-3.5 rounded-2xl bg-white border transition-all shadow-xs flex flex-col gap-2 ${
                    isFulfilled 
                      ? 'border-slate-200 bg-slate-50/70 opacity-75' 
                      : isMyNeed 
                        ? 'border-teal-200/90 bg-teal-50/15' 
                        : 'border-slate-200/90 hover:border-teal-200 hover:shadow-xs'
                  }`}
                >
                  {/* Top row: Status on top-left, Category on top-right */}
                  <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px]">
                    <span 
                      id={`need-type-${need.id}`}
                      className={`px-2 py-0.5 rounded-md font-medium tracking-wide uppercase ${
                        isFulfilled
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-teal-50 text-teal-800 border border-teal-200/60'
                      }`}
                    >
                      {isFulfilled ? 'Fulfilled' : `Budget ₹${need.budget}`}
                    </span>

                    <span 
                      id={`need-category-${need.id}`}
                      className="text-slate-400 font-normal"
                    >
                      {categoryName}
                    </span>
                  </div>

                  {/* Main content row: Title, details and View details button */}
                  <div className="flex items-center justify-between gap-3 pt-0.5">
                    {/* Left content: Title, needed by date, and requesters location */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h3 
                        style={{ width: '310px', fontSize: '13px', marginTop: '-5px' }}
                        className="text-[13px] font-normal text-slate-900 leading-snug"
                      >
                        {need.title}
                      </h3>

                      <div 
                        style={{ fontSize: '10px' }}
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500"
                      >
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3 h-3 text-teal-600 shrink-0" />
                          <span>{t('requests.needed_by', 'Needed by:')} <span className="font-normal text-slate-700">{need.neededDate}</span></span>
                        </div>

                        <div 
                          style={{ marginTop: '-5px' }}
                          className="flex items-center gap-1.5 text-slate-500"
                        >
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{need.location.displayName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: View details button exactly matching reference image in gradient teal */}
                    <div className="flex items-center justify-end shrink-0">
                      <button
                        type="button"
                        id={`view-details-btn-${need.id}`}
                        style={{ marginTop: '20px' }}
                        onClick={() => setSelectedNeedForDetails(need)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 active:scale-95 text-white pl-3.5 pr-1.5 py-1.5 rounded-full flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
                      >
                        <span className="text-[11px] font-normal text-white">View</span>
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <ArrowUpRight className="w-3 h-3 stroke-[2.2]" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showPostNeed && (
        <PostNeedModal onClose={() => setShowPostNeed(false)} />
      )}

      {selectedNeedForDetails && (
        <RequestDetailModal
          need={selectedNeedForDetails}
          onClose={() => setSelectedNeedForDetails(null)}
          onRespond={(need) => {
            setSelectedNeedForDetails(null);
            setSelectedNeedToRespond(need);
          }}
          onToggleStatus={(id) => {
            toggleNeedStatus(id);
            setSelectedNeedForDetails(prev => prev && prev.id === id ? { ...prev, status: prev.status === 'open' ? 'fulfilled' : 'open' } : prev);
          }}
          onDelete={(id) => {
            deleteNeed(id);
            setSelectedNeedForDetails(null);
          }}
        />
      )}

      {selectedNeedToRespond && (
        <RespondToNeedModal
          need={selectedNeedToRespond}
          onClose={() => setSelectedNeedToRespond(null)}
        />
      )}
    </div>
  );
};
