import React from 'react';
import { Home, MessageSquare, Plus, Sparkles, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { scrollToTop } from '../../utils/scrollUtils';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, unreadMessagesCount, t, createType } = useApp();

  // Hide footer tabs when user clicks on list a product or offer a service in create tab
  if (activeTab === 'create' && (createType === 'product' || createType === 'service')) {
    return null;
  }

  const handleTabClick = (tab: NavigationTab) => {
    const isCurrent = activeTab === tab || (tab === 'requests' && activeTab === 'activity');
    if (isCurrent) {
      scrollToTop();
    }
    setActiveTab(tab);
  };

  return (
    <nav
      id="needly-bottom-navigation"
      aria-label="Main Navigation"
      className="fixed bottom-2.5 inset-x-2 sm:inset-x-4 z-30 bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl px-2 sm:px-4 py-1.5 w-auto max-w-[480px] mx-auto shadow-[0_12px_36px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-around w-full">
        {/* Home */}
        <button
          id="nav-tab-home"
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer relative ${
            activeTab === 'home'
              ? 'text-teal-600 font-normal'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${activeTab === 'home' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">{t('nav.home', 'Home')}</span>
          {activeTab === 'home' && (
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 mt-0.5" />
          )}
        </button>

        {/* Inbox / Chat */}
        <button
          id="nav-tab-inbox"
          onClick={() => handleTabClick('inbox')}
          className={`relative flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'inbox'
              ? 'text-teal-600 font-normal'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <div className="relative inline-flex items-center justify-center">
            <MessageSquare className={`w-5 h-5 transition-transform ${activeTab === 'inbox' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {unreadMessagesCount > 0 && (
              <span
                id="inbox-unread-badge"
                className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-yellow-400 rounded-full ring-2 ring-white shadow-xs"
                title={`${unreadMessagesCount} unread message${unreadMessagesCount > 1 ? 's' : ''}`}
              />
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">{t('nav.inbox', 'Inbox')}</span>
          {activeTab === 'inbox' && (
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 mt-0.5" />
          )}
        </button>

        {/* Create (Emphasized Center Plus button) */}
        <button
          id="nav-tab-create"
          onClick={() => handleTabClick('create')}
          className="relative -top-3 flex flex-col items-center group focus:outline-none cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-600/30 flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95 border-2 border-white">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className={`text-[10px] sm:text-[11px] font-medium tracking-tight -mt-0.5 ${activeTab === 'create' ? 'text-teal-600 font-normal' : 'text-slate-600'}`}>
            {t('nav.create', 'Create')}
          </span>
        </button>

        {/* Requests (Replaced Activity) */}
        <button
          id="nav-tab-requests"
          onClick={() => handleTabClick('requests')}
          className={`relative flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'requests' || activeTab === 'activity'
              ? 'text-teal-600 font-normal'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Sparkles className={`w-5 h-5 transition-transform ${activeTab === 'requests' || activeTab === 'activity' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">{t('nav.requests', 'Requests')}</span>
          {(activeTab === 'requests' || activeTab === 'activity') && (
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 mt-0.5" />
          )}
        </button>

        {/* Profile */}
        <button
          id="nav-tab-profile"
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-teal-600 font-normal'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <User className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">{t('nav.profile', 'Profile')}</span>
          {activeTab === 'profile' && (
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
