import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  Star, 
  Heart, 
  Wrench, 
  Camera, 
  Tv, 
  Music, 
  GraduationCap, 
  ArrowUpDown,
  X,
  Package,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  Car,
  PartyPopper,
  Dumbbell,
  Shirt,
  Sprout,
  Compass,
  Plane,
  ChevronRight,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UNIFIED_CATEGORIES, getCategoryName } from '../../data/categories';
import { useDragScroll } from '../../hooks/useDragScroll';
import { AnimatedCategoryIcon } from '../common/AnimatedCategoryIcon';
import { serverTimeService } from '../../services/serverTimeService';

const iconMap: Record<string, React.ReactNode> = {
  Camera: <Camera className="w-4 h-4" />,
  Tv: <Tv className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
  PartyPopper: <PartyPopper className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />,
  Plane: <Plane className="w-4 h-4" />,
  Dumbbell: <Dumbbell className="w-4 h-4" />,
  GraduationCap: <GraduationCap className="w-4 h-4" />,
  Shirt: <Shirt className="w-4 h-4" />,
  Sprout: <Sprout className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Music: <Music className="w-4 h-4" />
};

export const HomeScreen: React.FC = () => {
  const { 
    currentUser, 
    currentLocation, 
    products, 
    services, 
    requests,
    bookings,
    setSelectedListing, 
    toggleWishlist, 
    isWishlisted,
    setActiveTab,
    t,
    language
  } = useApp();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedSubcat, setSelectedSubcat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'distance' | 'price_asc' | 'price_desc' | 'rating'>('recommended');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);

  // Live ticker to ensure 48-hour timers stay live and never get removed while requested
  const [, setTimerTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTimerTick(t => (t + 1) % 1000000), 1000);
    return () => clearInterval(id);
  }, []);

  // Drag-to-scroll hook for horizontal categories
  const categoryDragScroll = useDragScroll<HTMLDivElement>({ dragSpeed: 1.3 });
  const featuredDragScroll = useDragScroll<HTMLDivElement>({ dragSpeed: 1.3 });

  // Select category
  const handleSelectCategory = (catId: string) => {
    setShowAllProducts(false);
    setShowAllServices(false);
    if (selectedCat === catId) {
      setSelectedCat('all');
      setSelectedSubcat('all');
    } else {
      setSelectedCat(catId);
      setSelectedSubcat('all');
    }
  };

  // Basic Sorting Options Definitions (No icons, clean & direct)
  const sortOptions = [
    { 
      id: 'recommended' as const, 
      label: t('home.sort_recommended', 'Recommended'), 
    },
    { 
      id: 'distance' as const, 
      label: t('home.sort_nearest', 'Distance: Nearest first'), 
    },
    { 
      id: 'price_asc' as const, 
      label: t('home.sort_price_low', 'Price: Low to High'), 
    },
    { 
      id: 'price_desc' as const, 
      label: t('home.sort_price_high', 'Price: High to Low'), 
    },
    { 
      id: 'rating' as const, 
      label: t('home.sort_rating', 'Highest Rated'), 
    },
  ];

  // Search Suggestion structure
  interface SearchSuggestion {
    id: string;
    type: 'category' | 'subcategory' | 'product' | 'service';
    title: string;
    subtitle: string;
    searchTerm: string;
  }

  // Dynamic Search Suggestions matching product, service, or category name
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: SearchSuggestion[] = [];
    const seenTitles = new Set<string>();

    // 1. Categories & Subcategories
    for (const cat of UNIFIED_CATEGORIES) {
      const localizedCatName = getCategoryName(cat.id, language);
      if (localizedCatName.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) {
        const key = localizedCatName.toLowerCase();
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          results.push({
            id: `cat-${cat.id}`,
            type: 'category',
            title: localizedCatName,
            subtitle: 'Category',
            searchTerm: localizedCatName,
          });
        }
      }

      // Subcategories
      const subcats = cat.serviceSubcategories || [];
      for (const sub of subcats) {
        if (sub.toLowerCase().includes(q)) {
          const key = sub.toLowerCase();
          if (!seenTitles.has(key)) {
            seenTitles.add(key);
            results.push({
              id: `subcat-${cat.id}-${sub}`,
              type: 'subcategory',
              title: sub,
              subtitle: `${localizedCatName} service`,
              searchTerm: sub,
            });
          }
        }
      }
    }

    // 2. Services
    for (const s of services) {
      if (s.title.toLowerCase().includes(q) || (s.skills && s.skills.some(sk => sk.toLowerCase().includes(q)))) {
        const key = s.title.toLowerCase();
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          results.push({
            id: `serv-${s.id}`,
            type: 'service',
            title: s.title,
            subtitle: `Starting ₹${s.startingPrice}/${s.unit || 'visit'} • ${s.subcategory || getCategoryName(s.category, language)}`,
            searchTerm: s.title,
          });
        }
      }
    }

    // Sort by prefix match first
    results.sort((a, b) => {
      const aStarts = a.title.toLowerCase().startsWith(q);
      const bStarts = b.title.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

    return results.slice(0, 7);
  }, [searchQuery, services, language]);

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.searchTerm);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Active filters count
  const activeFiltersCount = 
    (selectedCat !== 'all' ? 1 : 0) +
    (selectedSubcat !== 'all' ? 1 : 0) +
    (sortBy !== 'recommended' ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCat('all');
    setSelectedSubcat('all');
    setSortBy('recommended');
    setShowAllProducts(false);
    setShowAllServices(false);
  };

  // Filtered & Sorted Services
  const filteredServices = useMemo(() => {
    return services
      .filter((s) => {
        if (s.available === false) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const catName = getCategoryName(s.category, language).toLowerCase();
          const subcat = (s.subcategory || '').toLowerCase();
          const matches = 
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q) ||
            catName.includes(q) ||
            subcat.includes(q) ||
            s.providerName.toLowerCase().includes(q) ||
            s.skills.some(sk => sk.toLowerCase().includes(q));
          if (!matches) return false;
        }
        if (selectedCat !== 'all' && s.category !== selectedCat) return false;
        if (selectedSubcat !== 'all' && s.subcategory !== selectedSubcat) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
        if (sortBy === 'price_asc') return a.startingPrice - b.startingPrice;
        if (sortBy === 'price_desc') return b.startingPrice - a.startingPrice;
        if (sortBy === 'rating') return b.providerRating - a.providerRating;
        return (b.providerRating || 0) - (a.providerRating || 0);
      });
  }, [services, searchQuery, selectedCat, selectedSubcat, sortBy, language]);

  const displayedServices = useMemo(() => {
    if (!showAllServices && filteredServices.length > 8) {
      return filteredServices.slice(0, 8);
    }
    return filteredServices;
  }, [showAllServices, filteredServices]);

  const featuredServices = useMemo(() => {
    const explicitlyFeatured = services.filter(s => s.isFeatured && s.available !== false);
    if (explicitlyFeatured.length > 0) return explicitlyFeatured;
    return services.slice(0, 4);
  }, [services]);

  const totalResults = filteredServices.length;

  const handleShowMoreCategories = () => {
    const el = categoryDragScroll.containerRef.current;
    if (!el) return;
    if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 20) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      categoryDragScroll.scrollByAmount(240);
    }
  };

  return (
    <div id="needly-home-screen" className="space-y-4 pb-24">
      {/* Search & Sort Bar with Greeting */}
      <div className="px-4 pt-2.5 space-y-2.5">
        <h1 className="font-serif text-lg sm:text-xl font-normal text-slate-900 tracking-tight">
          {language === 'hi' ? 'आज आपको क्या चाहिए?' : 'What do you need today?'}
        </h1>
        <div ref={searchWrapperRef} className="relative">
          <div className="relative flex items-center bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="home-search-input"
              type="text"
              placeholder="search for products or services"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape' || e.key === 'Enter') {
                  setShowSuggestions(false);
                }
              }}
              className="w-full pl-10 pr-16 py-2.5 text-xs sm:text-sm bg-transparent border-0 focus:outline-none placeholder:text-slate-400 text-slate-900"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                id="home-sort-toggle-btn"
                type="button"
                onClick={() => {
                  setShowFilterDrawer(!showFilterDrawer);
                  setShowSuggestions(false);
                }}
                title={t('home.sort_by', 'SORT BY')}
                aria-label={t('home.sort_by', 'SORT BY')}
                className={`w-9 h-9 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                  sortBy !== 'recommended'
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white border-transparent shadow-sm shadow-teal-600/25'
                    : 'bg-white/80 border-slate-200/70 text-slate-600 hover:text-slate-900 hover:bg-white shadow-2xs'
                }`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Suggestions Dropdown - Directly below search bar */}
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div
              id="search-suggestions-dropdown"
              className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/80 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
            >
              {searchSuggestions.length > 0 ? (
                <div>
                  <div className="px-3.5 py-2 text-[10px] font-normal text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <span>Suggestions</span>
                    <span className="text-[9px] font-medium text-slate-400 lowercase">{searchSuggestions.length} found</span>
                  </div>
                  <div className="max-h-[290px] overflow-y-auto divide-y divide-slate-100/80">
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSuggestion(suggestion);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <div className={`p-1.5 rounded-xl shrink-0 ${
                          suggestion.type === 'category' || suggestion.type === 'subcategory'
                            ? 'bg-teal-50 text-teal-600' 
                            : suggestion.type === 'product'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {suggestion.type === 'category' || suggestion.type === 'subcategory' ? (
                            <Sparkles className="w-3.5 h-3.5" />
                          ) : suggestion.type === 'product' ? (
                            <Package className="w-3.5 h-3.5" />
                          ) : (
                            <Wrench className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-normal text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                            {suggestion.title}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                            {suggestion.subtitle}
                          </div>
                        </div>
                        <span className={`text-[9px] font-normal px-1.5 py-0.5 rounded-md uppercase shrink-0 ${
                          suggestion.type === 'category' || suggestion.type === 'subcategory'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                            : suggestion.type === 'product'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        }`}>
                          {suggestion.type === 'subcategory' ? 'category' : suggestion.type}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 text-center text-xs text-slate-500">
                  No direct matches for &quot;{searchQuery}&quot;. Press enter to search all listings.
                </div>
              )}
            </div>
          )}

          {/* Sort Dialog Box Overlay - Placed directly below the sort icon */}
          {showFilterDrawer && (
            <>
              {/* Transparent click-catcher to dismiss outside clicks without background blur */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowFilterDrawer(false)}
              />
              <div
                id="home-sort-dialog"
                className="absolute right-0 top-full mt-2 z-50 w-52 bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="SORT BY"
              >
                {/* Header matching reference filter style */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
                  <span className="font-serif text-xs font-normal text-slate-900 tracking-tight">
                    SORT BY
                  </span>
                  <button
                    type="button"
                    id="home-sort-dialog-close-btn"
                    onClick={() => setShowFilterDrawer(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                    aria-label="Close sort dialog"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sort Options List */}
                <div className="space-y-1">
                  {sortOptions.map((opt) => {
                    const isSelected = sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        id={`sort-option-${opt.id}`}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.id);
                          setShowFilterDrawer(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-normal shadow-sm shadow-teal-600/20'
                            : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900 font-medium'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <span className="text-xs font-normal text-white">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

          {/* Active Filter Chips bar (if any filter is applied) */}
          {(activeFiltersCount > 0 || searchQuery) && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-normal text-slate-500">
                {language === 'hi' ? 'फ़िल्टर:' : 'Filters:'}
              </span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-normal rounded-lg">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCat !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-normal rounded-lg capitalize">
                  {getCategoryName(selectedCat, language)}
                  <button onClick={() => { setSelectedCat('all'); setSelectedSubcat('all'); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSubcat !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-normal rounded-lg">
                  {language === 'hi' ? 'उपश्रेणी:' : 'Subcategory:'} {selectedSubcat}
                  <button onClick={() => setSelectedSubcat('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {sortBy !== 'recommended' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-normal rounded-lg">
                  {language === 'hi' ? 'क्रम:' : 'Sort:'} {sortOptions.find(o => o.id === sortBy)?.label || sortBy}
                  <button onClick={() => setSortBy('recommended')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

      {/* Unified Parent Category Selector (Horizontal Scrolling Carousel with Drag-to-Scroll) */}
      <div className="space-y-1">
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className="font-serif text-base sm:text-lg font-normal text-slate-900 tracking-tight">
              {t('home.browse_categories', 'Browse Categories')}
            </h2>
            <span className="text-[10px] font-normal text-slate-400 bg-white/80 border border-slate-200/60 px-2 py-0.5 rounded-full shadow-2xs">
              {UNIFIED_CATEGORIES.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="categories-header-show-more-btn"
              onClick={handleShowMoreCategories}
              className="inline-flex items-center gap-0.5 px-2.5 py-1 text-[10px] font-normal text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/60 rounded-full transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="Scroll categories"
            >
              <span>{language === 'hi' ? 'और देखें' : 'Show more'}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Category Icons with drag scroll matching Inbox tab */}
        <div className="px-4">
          <div 
            {...categoryDragScroll.dragProps}
            className={`flex items-start gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar pt-1 pb-1 px-0.5 select-none cursor-grab active:cursor-grabbing ${
              categoryDragScroll.isDragging ? 'cursor-grabbing' : ''
            }`}
          >
            {/* Unified Parent Categories - Clean floating SVG icons without boxes */}
            {UNIFIED_CATEGORIES.map((cat) => {
              const isSelected = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className="w-[72px] sm:w-[80px] shrink-0 flex flex-col items-center select-none group text-center focus:outline-none cursor-pointer pt-0.5"
                >
                  <AnimatedCategoryIcon
                    categoryId={cat.id}
                    iconName={cat.iconName}
                    size="md"
                    isSelected={isSelected}
                  />
                  <span className={`text-[11px] leading-tight transition-colors line-clamp-2 max-w-full px-0.5 mt-2 ${
                    isSelected ? 'font-semibold text-slate-900' : 'font-medium text-slate-600 group-hover:text-slate-900'
                  }`}>
                    {getCategoryName(cat.id, language)}
                  </span>
                  {/* Active indicator line */}
                  {isSelected ? (
                    <div className="w-8 h-1 bg-gradient-to-r from-teal-600 to-emerald-500 rounded-full mx-auto mt-1 shadow-xs" />
                  ) : (
                    <div className="w-8 h-1 bg-transparent rounded-full mx-auto mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Animated Results Container - Smooth fade + slide-up transition (250-350ms) for Category selection */}
      <motion.div
        key={`listings-${selectedCat}`}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-4"
      >
        {/* Zero Results State */}
        {totalResults === 0 && (
        <div className="px-4">
          <div className="py-12 bg-white rounded-2xl border border-slate-200/80 p-6 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-normal text-slate-900">
                {t('home.no_items', 'No items match your criteria')}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {selectedCat !== 'all' 
                  ? (language === 'hi'
                      ? `${getCategoryName(selectedCat, language)} में अभी कोई लिस्टिंग उपलब्ध नहीं है।`
                      : `No listings currently found in ${getCategoryName(selectedCat, language)}${selectedSubcat !== 'all' ? ` > ${selectedSubcat}` : ''}.`)
                  : (language === 'hi'
                      ? 'कृपया अपनी खोज दूरी बढ़ाएं, अन्य श्रेणी चुनें या फ़िल्टर रीसेट करें।'
                      : 'Try expanding your search radius, selecting a different category, or resetting filters.')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-normal rounded-xl transition-colors cursor-pointer"
              >
                {t('home.reset_filters', 'Reset Filters')}
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-normal rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {t('home.view_community_requests', 'View Community Requests →')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Featured Services Carousel Section - Prominent Homepage Feature */}
      {featuredServices.length > 0 && selectedCat === 'all' && !searchQuery.trim() && (
        <div id="home-featured-services-section" className="space-y-2 pt-0.5">
          <div className="px-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              </div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-serif text-sm sm:text-base font-normal text-slate-900 tracking-tight">
                  {language === 'hi' ? 'विशेष सेवाएं' : 'Featured Services'}
                </h2>
                <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded-full bg-amber-100/90 text-amber-800 border border-amber-300/80 shadow-2xs">
                  Handpicked
                </span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">
              {featuredServices.length} {language === 'hi' ? 'विशेष' : 'featured'}
            </span>
          </div>

          {/* Carousel */}
          <div className="px-4">
            <div 
              {...featuredDragScroll.dragProps}
              className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar pb-1.5 pt-0.5 cursor-grab active:cursor-grabbing select-none"
            >
              {featuredServices.map((service) => (
                <div
                  key={`feat-${service.id}`}
                  onClick={() => setSelectedListing(service)}
                  className="w-[180px] sm:w-[200px] shrink-0 bg-white rounded-xl border border-amber-200/80 shadow-xs hover:shadow-md transition-all p-2 flex flex-col justify-between cursor-pointer group hover:border-amber-400 relative overflow-hidden"
                >
                  {/* Subtle top amber highlight banner */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500" />

                  <div>
                    {/* Cover image & badges */}
                    <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                      <img
                        src={service.images[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                        <span className="px-1.5 py-0.2 bg-amber-500 text-amber-950 font-medium text-[9px] rounded-full flex items-center gap-0.5 shadow-xs">
                          <Sparkles className="w-2 h-2 fill-amber-950 text-amber-950" />
                          <span>Featured</span>
                        </span>
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 px-1 py-0.2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] rounded flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{service.providerRating?.toFixed(1) || '5.0'}</span>
                      </div>
                    </div>

                    {/* Category pill */}
                    <div className="mb-0.5">
                      <span className="text-[9px] font-medium text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100">
                        {service.subcategory || service.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-medium text-slate-900 line-clamp-1 leading-snug group-hover:text-teal-700 transition-colors">
                      {service.title}
                    </h3>
                  </div>

                  {/* Provider & Price Footer */}
                  <div className="pt-1.5 mt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      <img
                        src={service.providerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                        alt={service.providerName}
                        className="w-4 h-4 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <span className="text-[10px] text-slate-600 truncate max-w-[70px]">
                        {service.providerName}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-semibold text-teal-700">
                        ₹{service.startingPrice}/{service.unit}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Services Near You (2 listings in a row) */}
      {filteredServices.length > 0 && (
        <div className="space-y-3">
          <div className="px-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500"></span>
                <h2 className="font-serif text-base sm:text-lg font-normal text-slate-900 tracking-tight">
                  {t('home.trusted_services', 'Trusted Local Services')}
                </h2>
              </div>
              <p className="text-[11px] text-slate-500">
                {language === 'hi' ? 'आपके आसपास कुशल पेशेवर' : `${currentLocation.area || currentLocation.city} • Verified & skilled`}
              </p>
            </div>
            <span className="text-xs font-normal text-slate-500 bg-white/80 border border-slate-200/60 px-2.5 py-0.5 rounded-full shadow-2xs">
              {filteredServices.length} {language === 'hi' ? 'सेवाएं' : 'services'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-3.5 px-4">
            {displayedServices.map((service) => {
              const wishlisted = isWishlisted(service.id);
              const parentCatName = getCategoryName(service.category, language);

              return (
                <div
                  key={service.id}
                  id={`service-card-${service.id}`}
                  onClick={() => setSelectedListing(service)}
                  className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-1 sm:p-1.5 shadow-xs hover:shadow-md hover:border-teal-300/80 transition-all cursor-pointer flex flex-col group relative"
                >
                  {/* Image container with all 4 curved corners */}
                  <div className="relative aspect-[4/3] w-full rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-md text-slate-800 text-[9px] sm:text-[10px] font-normal rounded-full flex items-center gap-1 border border-white/80 shadow-xs">
                      <MapPin className="w-2.5 h-2.5 text-teal-600" />
                      <span>{service.distanceKm} kms away</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(service.id);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 hover:text-rose-500 rounded-full transition-all flex items-center justify-center border border-white/80 shadow-xs active:scale-90 cursor-pointer"
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div className="pt-2 px-0.5 pb-0.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 mb-1 gap-1">
                        <span className="font-normal text-teal-600 truncate max-w-[85px]" title={`${parentCatName}${service.subcategory ? ` • ${service.subcategory}` : ''}`}>
                          {service.subcategory || parentCatName}
                        </span>
                        {service.providerRating ? (
                          <div className="flex items-center gap-0.5 font-normal text-slate-700 shrink-0">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{service.providerRating}</span>
                          </div>
                        ) : null}
                      </div>

                      <h3 className="text-[13px] sm:text-[15px] font-normal text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors leading-snug">
                        {service.title}
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 mt-1 min-w-0">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {service.location?.displayName || service.location?.area || service.serviceArea || service.location?.city || 'Udaipur'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1.5 pt-1.5 mb-1 sm:mb-1.5 -translate-y-0.5 sm:-translate-y-1 border-t border-slate-100/80 flex items-center justify-between gap-1.5">
                      <div className="min-w-0 flex-1 pr-1">
                        <div className="text-[9px] text-slate-400 leading-none mb-0.5">
                          {language === 'hi' ? 'शुरुआती कीमत' : 'Starting'}
                        </div>
                        <div className="text-sm sm:text-base text-slate-900 leading-tight whitespace-nowrap price-bold" data-price="bold">
                          <span>₹{service.startingPrice}</span>
                          <span className="text-[10px] text-slate-500 font-normal ml-0.5">/{service.unit}</span>
                        </div>
                      </div>
                      {(() => {
                        const activeBooking = bookings.find(
                          b => b.listingId === service.id &&
                               b.customerId === currentUser?.id &&
                               b.status !== 'cancelled' &&
                               b.status !== 'rejected' &&
                               b.status !== 'completed' &&
                               !serverTimeService.isRequestExpired(b.createdAt)
                        );
                        const isServiceRequested = Boolean(activeBooking);
                        return (
                          <button
                            id={`book-service-${service.id}`}
                            disabled={isServiceRequested}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isServiceRequested) return;
                              setSelectedListing(service);
                            }}
                            className={`py-1 rounded-full text-[10px] sm:text-[11px] font-medium shadow-xs transition-all text-center shrink-0 whitespace-nowrap flex items-center justify-center gap-1.5 ${
                              isServiceRequested
                                ? 'px-2.5 sm:px-3 bg-amber-50 text-amber-900 border border-amber-200/90 cursor-not-allowed'
                                : 'pl-2.5 sm:pl-3 pr-1 bg-gradient-to-r from-teal-600 to-emerald-500 hover:opacity-95 text-white shadow-teal-600/20 active:scale-95 cursor-pointer'
                            }`}
                            title={isServiceRequested ? (language === 'hi' ? 'अनुरोध भेजा गया' : 'Requested') : undefined}
                          >
                            {isServiceRequested ? (
                              <span className="leading-none">{t('home.requested', 'Requested')}</span>
                            ) : (
                              <>
                                <span className="leading-none">{t('home.view', 'View')}</span>
                                <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-black/25 flex items-center justify-center shrink-0">
                                  <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white stroke-[2.5]" />
                                </span>
                              </>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View More Services Button */}
          {filteredServices.length > 8 && (
            <div className="flex justify-center pt-1">
              <button
                id="view-more-services-btn"
                onClick={() => setShowAllServices((prev) => !prev)}
                className="px-4 py-1.5 bg-white/80 hover:bg-white text-teal-700 border border-slate-200/80 text-xs font-normal rounded-full transition-all flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
              >
                <span>{showAllServices ? t('home.view_less', 'View Less') : t('home.view_more', 'View More')}</span>
                {showAllServices ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
      </motion.div>
    </div>
  );
};
