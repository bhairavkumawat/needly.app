import React from 'react';
import { Bell, Heart, MapPin, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { scrollToTop } from '../../utils/scrollUtils';

export const Header: React.FC = () => {
  const { 
    unreadNotifsCount, 
    wishlist, 
    t, 
    currentLocation,
    setIsNotificationsOpen,
    setIsWishlistOpen,
    setIsLocationOpen
  } = useApp();

  const handleScrollToTop = () => {
    scrollToTop();
  };

  return (
    <header id="needly-main-header" className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/70 px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between gap-2">
        {/* App Brand Logo & Name (Needly) */}
        <div className="flex items-center">
          <button
            id="needly-logo-btn"
            type="button"
            onClick={handleScrollToTop}
            title="Needly"
            aria-label="Needly - Scroll to top"
            className="flex items-center gap-2 select-none text-left cursor-pointer focus:outline-none transition-transform active:scale-95 group"
          >
            {/* Needly Logo Icon */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/25 ring-1 ring-teal-600/20 shrink-0">
              <svg
                className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19V5l12 14V5" />
              </svg>
            </div>
            {/* Needly Wordmark */}
            <span className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors leading-none">
              Needly<span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 ml-0.5 align-baseline"></span>
            </span>
          </button>
        </div>

        {/* Quick Actions (Location, Wishlist & Notifications with Frosted Glassmorphism) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Location Pill Button */}
          <button
            id="header-location-picker-btn"
            type="button"
            onClick={() => setIsLocationOpen(true)}
            title={t('header.location', 'Location')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md hover:bg-white border border-slate-200/70 transition-all text-left text-slate-800 active:scale-95 cursor-pointer max-w-[125px] sm:max-w-[155px] shrink-0 shadow-2xs"
          >
            <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
            <span className="text-[11px] font-normal text-slate-800 truncate">
              {currentLocation.area || currentLocation.city}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* Action Icons (Wishlist & Notifications) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Wishlist Heart */}
            <button
              id="header-wishlist-btn"
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              aria-label={t('header.wishlist', 'Wishlist')}
              title={t('header.wishlist', 'Saved wishlist')}
              className="relative w-9 h-9 flex items-center justify-center text-slate-700 hover:text-rose-600 bg-white/80 backdrop-blur-md hover:bg-white border border-slate-200/60 rounded-full transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs"
            >
              <Heart className={`w-4 h-4 shrink-0 stroke-[2] transition-transform ${wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Notification Bell matching circular frosted button */}
            <button
              id="header-notifications-btn"
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              aria-label={t('header.notifications', 'Notifications')}
              title={t('header.notifications', 'Notifications')}
              className="relative w-9 h-9 flex items-center justify-center text-slate-700 hover:text-teal-600 bg-white/80 backdrop-blur-md hover:bg-white border border-slate-200/60 rounded-full transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs"
            >
              <Bell className="w-4 h-4 shrink-0 stroke-[2]" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-0.5 bg-rose-500 text-white text-[8px] font-normal rounded-full flex items-center justify-center ring-2 ring-white shadow-xs pointer-events-none">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
