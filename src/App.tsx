import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app';
import { Loader2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { InboxScreen } from './components/inbox/InboxScreen';
import { CreateScreen } from './components/create/CreateScreen';
import { RequestsScreen } from './components/requests/RequestsScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { ServiceDetailModal } from './components/details/ServiceDetailModal';
import { ChatDetailModal } from './components/chat/ChatDetailModal';
import { ChatListModal } from './components/chat/ChatListModal';
import { SupabaseSyncModal } from './components/common/SupabaseSyncModal';
import { LocationModal } from './components/common/LocationModal';
import { NotificationModal } from './components/common/NotificationModal';
import { WishlistModal } from './components/common/WishlistModal';
import { AppInitialization } from './components/onboarding/AppInitialization';
import { ServiceUnavailableScreen } from './components/common/ServiceUnavailableScreen';
import { fetchServiceByIdFromSupabase } from './services/supabaseService';
import { INITIAL_SERVICES } from './data/mockData';
import { ServiceListing } from './types';

const MainAppContent: React.FC = () => {
  const { 
    activeTab, 
    selectedListing, 
    selectedConversation, 
    isChatListOpen,
    setSelectedConversation,
    isSupabaseSyncModalOpen,
    isLocationOpen,
    setIsLocationOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    showOnboarding,
    setShowOnboarding,
    setHasCompletedOnboarding,
    services,
    goBack
  } = useApp();

  // Public website deep linking for /service/:serviceId
  const [routeServiceId, setRouteServiceId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/service/')) {
      const match = window.location.pathname.match(/^\/service\/([^/?#]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    }
    return null;
  });
  const [routeService, setRouteService] = useState<ServiceListing | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/service/')) {
      return true;
    }
    return false;
  });
  const [isRouteNotFound, setIsRouteNotFound] = useState<boolean>(false);

  // Sync route on popstate (browser back / forward button)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const match = window.location.pathname.match(/^\/service\/([^/?#]+)/);
        const nextId = match ? decodeURIComponent(match[1]) : null;
        setRouteServiceId(nextId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch or resolve service whenever routeServiceId changes
  useEffect(() => {
    if (!routeServiceId) {
      setRouteService(null);
      setIsRouteLoading(false);
      setIsRouteNotFound(false);
      return;
    }

    let isMounted = true;
    setIsRouteLoading(true);
    setIsRouteNotFound(false);

    async function loadService() {
      // 1. Check in-memory services
      const existing = services.find(s => s.id === routeServiceId);
      if (existing) {
        if (isMounted) {
          setRouteService(existing);
          setIsRouteLoading(false);
          setIsRouteNotFound(false);
        }
        return;
      }

      // 2. Try Supabase lookup
      try {
        const fetched = await fetchServiceByIdFromSupabase(routeServiceId!);
        if (!isMounted) return;
        if (fetched) {
          setRouteService(fetched);
          setIsRouteLoading(false);
          setIsRouteNotFound(false);
          return;
        }
      } catch (err) {
        console.warn('[Router] Supabase service fetch error:', err);
      }

      // 3. Fallback to mock services
      const mock = INITIAL_SERVICES.find(s => s.id === routeServiceId);
      if (!isMounted) return;
      if (mock) {
        setRouteService(mock);
        setIsRouteLoading(false);
        setIsRouteNotFound(false);
      } else {
        setRouteService(null);
        setIsRouteLoading(false);
        setIsRouteNotFound(true);
      }
    }

    loadService();

    return () => {
      isMounted = false;
    };
  }, [routeServiceId, services]);

  // Synchronize browser URL when in-app service modal opens/closes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedListing && selectedListing.type === 'service') {
      const targetPath = `/service/${encodeURIComponent(selectedListing.id)}`;
      if (window.location.pathname !== targetPath) {
        window.history.replaceState({}, '', targetPath);
      }
    } else if (!selectedListing && !routeServiceId && window.location.pathname.startsWith('/service/')) {
      window.history.replaceState({}, '', '/');
    }
  }, [selectedListing, routeServiceId]);

  // Native Android Status Bar & Back Button Handling
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#0f766e' }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backHandler = CapApp.addListener('backButton', () => {
      if (routeServiceId) {
        if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
        setRouteServiceId(null);
        return;
      }
      const handled = goBack();
      if (!handled) {
        CapApp.exitApp();
      }
    });

    return () => {
      backHandler.then((listener) => listener.remove()).catch(() => {});
    };
  }, [goBack, routeServiceId]);

  // If user hasn't completed onboarding, but is NOT viewing a public service link
  if (showOnboarding && !routeServiceId) {
    return (
      <AppInitialization 
        onComplete={() => setHasCompletedOnboarding(true)}
      />
    );
  }

  // Direct Public Service Route: Loading State
  if (routeServiceId && isRouteLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 shadow-xl border border-slate-100 min-h-[400px]">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold text-slate-800">Loading service details...</h2>
            <p className="text-xs text-slate-500">Connecting to Needly local marketplace</p>
          </div>
        </div>
      </div>
    );
  }

  // Direct Public Service Route: Not Found / Deleted / Unavailable
  if (routeServiceId && isRouteNotFound) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4">
        <ServiceUnavailableScreen
          serviceId={routeServiceId}
          onGoHome={() => {
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/');
            }
            setRouteServiceId(null);
            setIsRouteNotFound(false);
          }}
          onExploreServices={() => {
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/');
            }
            setRouteServiceId(null);
            setIsRouteNotFound(false);
          }}
        />
      </div>
    );
  }

  // Direct Public Service Route: Resolved Service Screen
  if (routeServiceId && routeService) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4">
        <ServiceDetailModal
          service={routeService}
          isPublicPage={true}
          onClose={() => {
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/');
            }
            setRouteServiceId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start selection:bg-teal-500 selection:text-white font-sans antialiased">
      {/* Main App Container */}
      <div 
        id="needly-app-container"
        className="w-full max-w-lg bg-white text-slate-900 min-h-screen shadow-md relative flex flex-col"
      >
        {/* Global Header - Home Tab Only */}
        {activeTab === 'home' && <Header />}

        {/* Active Screen Tab View */}
        <main className="flex-1 no-scrollbar">
          {activeTab === 'home' && (
            <HomeScreen />
          )}
          {activeTab === 'inbox' && (
            <InboxScreen />
          )}
          {activeTab === 'create' && (
            <CreateScreen />
          )}
          {(activeTab === 'requests' || activeTab === 'activity') && (
            <RequestsScreen />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Location Modal */}
        {isLocationOpen && (
          <LocationModal onClose={() => setIsLocationOpen(false)} />
        )}

        {/* Notification Modal */}
        {isNotificationsOpen && (
          <NotificationModal onClose={() => setIsNotificationsOpen(false)} />
        )}

        {/* Wishlist Modal */}
        {isWishlistOpen && (
          <WishlistModal onClose={() => setIsWishlistOpen(false)} />
        )}

        {/* Chat List Drawer / Modal (if opened via quick actions) */}
        {isChatListOpen && (
          <ChatListModal
            onClose={() => goBack()}
            onSelectConversation={(conv) => setSelectedConversation(conv)}
          />
        )}

        {/* Chat Detail Conversation Modal */}
        {selectedConversation && (
          <ChatDetailModal
            conversation={selectedConversation}
            onClose={() => goBack()}
          />
        )}

        {/* Service Detail Modal */}
        {selectedListing && (
          <ServiceDetailModal
            service={selectedListing as ServiceListing}
            onClose={() => goBack()}
          />
        )}

        {/* Supabase Database & Migration Modal */}
        <SupabaseSyncModal
          isOpen={isSupabaseSyncModalOpen}
          onClose={() => goBack()}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
