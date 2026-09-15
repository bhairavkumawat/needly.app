import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation as CapGeolocation } from '@capacitor/geolocation';
import { 
  UserProfile, 
  ProductListing, 
  ServiceListing, 
  RentalRequest, 
  ServiceBooking, 
  Conversation, 
  NotificationItem, 
  LocationInfo,
  NeedPost,
  Review,
  ListingItem,
  RequestStatus,
  Message,
  NavSnapshot,
  ProfileSectionTab,
  CreateScreenType,
  ActiveModalType,
  NavigationTab
} from '../types';
import { translate, Language } from '../i18n/translations';
import { 
  checkSupabaseStatus, 
  SupabaseStatusResult,
  fetchProductsFromSupabase,
  fetchServicesFromSupabase,
  fetchNeedsFromSupabase,
  fetchRequestsFromSupabase,
  fetchBookingsFromSupabase,
  fetchReviewsFromSupabase,
  fetchConversationsFromSupabase,
  fetchWishlistFromSupabase,
  fetchProfileFromSupabase,
  fetchAllProfilesFromSupabase,
  fetchConversationByIdFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  saveServiceToSupabase,
  deleteServiceFromSupabase,
  saveNeedToSupabase,
  deleteNeedFromSupabase,
  updateNeedStatusInSupabase,
  saveRentalRequestToSupabase,
  updateRentalRequestStatusInSupabase,
  saveServiceBookingToSupabase,
  updateServiceBookingStatusInSupabase,
  expirePendingRequestsInSupabase,
  saveReviewToSupabase,
  saveConversationToSupabase,
  saveMessageToSupabase,
  markConversationAsReadInSupabase,
  markMessagesAsReadInSupabase,
  toggleWishlistInSupabase,
  saveProfileToSupabase,
  deleteConversationFromSupabase,
  clearAllConversationsAndMessagesFromSupabase,
  syncAllLocalDataToSupabase,
  mapProductFromDb,
  mapServiceFromDb,
  mapNeedFromDb,
  mapRentalRequestFromDb,
  mapServiceBookingFromDb,
  mapProfileFromDb,
  mapReviewFromDb
} from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { realtimeSync } from '../services/realtimeSync';
import { serverTimeService } from '../services/serverTimeService';
import { 
  sortConversationsByRecent, 
  getDeterministicConversationId, 
  normalizeConversationForUser 
} from '../utils/conversationUtils';
import { scrollToTop } from '../utils/scrollUtils';
import { 
  CURRENT_USER, 
  OTHER_USERS, 
  LOCATIONS, 
  INITIAL_PRODUCTS, 
  INITIAL_SERVICES, 
  INITIAL_REQUESTS, 
  INITIAL_BOOKINGS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_REVIEWS, 
  INITIAL_NEEDS 
} from '../data/mockData';

interface AppContextType {
  currentUser: UserProfile;
  allProfiles: UserProfile[];
  switchUser: (user: UserProfile) => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
  loginWithPhone: (phone: string, otp: string) => boolean;
  loginWithGoogle: (name?: string, email?: string) => void;
  loginWithEmail: (email: string, passwordOrCode?: string) => { success: boolean; message?: string; user?: UserProfile };
  isAuthorizedEmail: (email: string) => boolean;
  isValidEmailFormat: (email: string) => boolean;
  registerNewUser: (data: {
    name: string;
    phone: string;
    email: string;
    city?: string;
    roleInterest?: 'renter' | 'owner' | 'both';
  }) => UserProfile;
  logout: () => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  
  currentLocation: LocationInfo;
  setCurrentLocation: (loc: LocationInfo) => void;
  detectGPSLocation: () => Promise<boolean>;
  
  products: ProductListing[];
  services: ServiceListing[];
  requests: RentalRequest[];
  bookings: ServiceBooking[];
  conversations: Conversation[];
  notifications: NotificationItem[];
  reviews: Review[];
  needs: NeedPost[];
  wishlist: string[];

  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  navigateTab: (tab: NavigationTab) => void;
  
  selectedListing: ListingItem | null;
  setSelectedListing: (item: ListingItem | null | ((prev: ListingItem | null) => ListingItem | null)) => void;
  openListing: (item: ListingItem) => void;
  closeListing: () => void;
  
  selectedConversation: Conversation | null;
  setSelectedConversation: (conv: Conversation | null | ((prev: Conversation | null) => Conversation | null)) => void;
  openConversation: (conv: Conversation) => void;
  closeConversation: () => void;

  activeModal: ActiveModalType;
  openModal: (modal: ActiveModalType) => void;
  closeModal: () => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isLocationOpen: boolean;
  setIsLocationOpen: (open: boolean) => void;
  isChatListOpen: boolean;
  setIsChatListOpen: (open: boolean) => void;

  profileSection: ProfileSectionTab;
  setProfileSection: (sec: ProfileSectionTab) => void;
  createType: CreateScreenType;
  setCreateType: (type: CreateScreenType) => void;

  historyStack: NavSnapshot[];
  canGoBack: boolean;
  goBack: (triggerBrowserBack?: boolean) => boolean;

  unreadNotifsCount: number;
  unreadMessagesCount: number;

  addProductListing: (listing: Omit<ProductListing, 'id' | 'createdAt' | 'timesRented' | 'distanceKm'>) => ProductListing;
  addServiceListing: (listing: Omit<ServiceListing, 'id' | 'createdAt' | 'jobsCompleted' | 'distanceKm'>) => ServiceListing;
  updateProductListing: (product: ProductListing) => void;
  updateServiceListing: (service: ServiceListing) => void;
  deleteProductListing: (productId: string) => void;
  deleteServiceListing: (serviceId: string) => void;
  
  requestRental: (params: {
    listing: ProductListing;
    startDate: string;
    endDate: string;
    totalDays: number;
    pickupPreference: 'pickup' | 'delivery';
    deliveryAddress?: string;
    customerNote?: string;
    termsAcknowledged?: boolean;
    autoRedirectToChat?: boolean;
  }) => RentalRequest;

  bookService: (params: {
    listing: ServiceListing;
    scheduledDate: string;
    scheduledTime: string;
    packageId?: string;
    packageName?: string;
    packagePrice?: number;
    totalAmount: number;
    serviceAddress: string;
    customerNotes?: string;
    termsAcknowledged?: boolean;
    termsVersion?: string;
    autoRedirectToChat?: boolean;
  }) => ServiceBooking;

  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  updateBookingStatus: (bookingId: string, status: RequestStatus) => void;

  startConversationWithListing: (listing: ListingItem, firstMsg?: string, autoOpen?: boolean) => Conversation;
  sendMessage: (conversationId: string, text: string) => void;

  toggleWishlist: (listingId: string) => void;
  isWishlisted: (listingId: string) => boolean;

  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  postNeed: (need: Omit<NeedPost, 'id' | 'createdAt' | 'responsesCount' | 'status' | 'userId' | 'userName' | 'userAvatar'>) => NeedPost;
  deleteNeed: (needId: string) => void;
  toggleNeedStatus: (needId: string) => void;
  respondToNeed: (need: NeedPost, offer: { message: string; quotePrice: number; listingId?: string }) => Conversation;

  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;

  supabaseStatus: SupabaseStatusResult | null;
  isSupabaseSyncModalOpen: boolean;
  setIsSupabaseSyncModalOpen: (val: boolean) => void;
  checkDatabaseStatus: () => Promise<SupabaseStatusResult>;
  syncDataToSupabase: () => Promise<{ success: boolean; inserted: Record<string, number>; errors: string[] }>;
  fetchFromSupabase: () => Promise<void>;

  resetToDemoData: () => void;
  deleteAccount: () => void;
  deleteConversation: (conversationId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USER: 'needly_user_v2',
  LOCATION: 'needly_location_v2',
  PRODUCTS: 'needly_products_v2',
  SERVICES: 'needly_services_v2',
  REQUESTS: 'needly_requests_v2',
  BOOKINGS: 'needly_bookings_v2',
  CONVERSATIONS: 'needly_conversations_v2',
  NOTIFICATIONS: 'needly_notifications_v2',
  REVIEWS: 'needly_reviews_v2',
  NEEDS: 'needly_needs_v2',
  WISHLIST: 'needly_wishlist_v2',
  ONBOARDING_COMPLETED: 'needly_onboarding_completed'
};

let _uniqueIdSeed = 0;
export const generateUniqueId = (prefix: string = 'id'): string => {
  _uniqueIdSeed += 1;
  const rand = Math.random().toString(36).substring(2, 9);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${_uniqueIdSeed}_${rand}`;
};

function safeSetStorage(key: string, value: unknown) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.warn(`[Needly Storage] Failed to persist ${key}:`, err);
  }
}

/**
 * Storage helpers for user-specific chat deletion.
 * Deleting a chat removes it ONLY from the current user's inbox/UI.
 * The conversation and its messages are NOT deleted from Supabase,
 * and the other participant continues to see the full chat normally.
 */
export const getDeletedConvIdsForUser = (userId: string): Set<string> => {
  if (!userId || typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(`needly_deleted_convs_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {}
  return new Set();
};

export const addDeletedConvIdForUser = (userId: string, conversationId: string) => {
  if (!userId || !conversationId || typeof localStorage === 'undefined') return;
  try {
    const set = getDeletedConvIdsForUser(userId);
    set.add(conversationId);
    localStorage.setItem(`needly_deleted_convs_${userId}`, JSON.stringify(Array.from(set)));
  } catch {}
};

export const removeDeletedConvIdForUser = (userId: string, conversationId: string) => {
  if (!userId || !conversationId || typeof localStorage === 'undefined') return;
  try {
    const set = getDeletedConvIdsForUser(userId);
    if (set.has(conversationId)) {
      set.delete(conversationId);
      localStorage.setItem(`needly_deleted_convs_${userId}`, JSON.stringify(Array.from(set)));
    }
  } catch {}
};

// Party popper animation completely removed per user request
const triggerConfetti = (_opts?: unknown): void => {};

function getStoredOrDefault<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(parsed)) {
      const seen = new Set<string>();
      return parsed.map((el, idx) => {
        if (el && typeof el === 'object' && 'id' in el) {
          if (!el.id || seen.has(el.id)) {
            return { ...el, id: `${el.id || 'item'}_${idx}_${Math.random().toString(36).substring(2, 7)}` };
          }
          seen.add(el.id);
        }
        return el;
      }) as unknown as T;
    }
    return parsed;
  } catch (e) {
    console.warn(`Error reading localStorage for ${key}`, e);
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => 
    getStoredOrDefault(STORAGE_KEYS.USER, CURRENT_USER)
  );

  const currentUserRef = useRef<UserProfile>(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(() => [
    CURRENT_USER,
    ...Object.values(OTHER_USERS)
  ]);

  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(() => 
    getStoredOrDefault(STORAGE_KEYS.LOCATION, LOCATIONS[0])
  );

  const [products, setProducts] = useState<ProductListing[]>(() => 
    getStoredOrDefault(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );

  const [services, setServices] = useState<ServiceListing[]>(() => 
    getStoredOrDefault(STORAGE_KEYS.SERVICES, INITIAL_SERVICES)
  );

  const [requests, setRequests] = useState<RentalRequest[]>(() => {
    const storedUser = getStoredOrDefault<UserProfile>(STORAGE_KEYS.USER, CURRENT_USER);
    if (!storedUser?.id) return [];
    const list = getStoredOrDefault<RentalRequest[]>(`${STORAGE_KEYS.REQUESTS}_${storedUser.id}`, storedUser.id === CURRENT_USER.id ? INITIAL_REQUESTS : []);
    return list.map((r) => {
      if (r.status === 'pending' && serverTimeService.isRequestExpired(r.createdAt)) {
        return { ...r, status: 'cancelled' as RequestStatus };
      }
      return r;
    });
  });

  const [bookings, setBookings] = useState<ServiceBooking[]>(() => {
    const storedUser = getStoredOrDefault<UserProfile>(STORAGE_KEYS.USER, CURRENT_USER);
    if (!storedUser?.id) return [];
    const list = getStoredOrDefault<ServiceBooking[]>(`${STORAGE_KEYS.BOOKINGS}_${storedUser.id}`, storedUser.id === CURRENT_USER.id ? INITIAL_BOOKINGS : []);
    return list.map((b) => {
      if (b.status === 'pending' && serverTimeService.isRequestExpired(b.createdAt)) {
        return { ...b, status: 'cancelled' as RequestStatus };
      }
      return b;
    });
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const storedUser = getStoredOrDefault<UserProfile>(STORAGE_KEYS.USER, CURRENT_USER);
    if (!storedUser?.id) return [];
    const deletedIds = getDeletedConvIdsForUser(storedUser.id);
    const cached = getStoredOrDefault<Conversation[]>(`${STORAGE_KEYS.CONVERSATIONS}_${storedUser.id}`, storedUser.id === CURRENT_USER.id ? INITIAL_CONVERSATIONS : []);
    const baseList = (cached && cached.length > 0) ? cached : (storedUser.id === CURRENT_USER.id ? INITIAL_CONVERSATIONS : []);
    const nonDeleted = baseList.filter((c: any) => !deletedIds.has(c.id));
    return sortConversationsByRecent(nonDeleted);
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const storedUser = getStoredOrDefault<UserProfile>(STORAGE_KEYS.USER, CURRENT_USER);
    if (!storedUser?.id) return [];
    return getStoredOrDefault(`${STORAGE_KEYS.NOTIFICATIONS}_${storedUser.id}`, storedUser.id === CURRENT_USER.id ? INITIAL_NOTIFICATIONS : []);
  });

  const [reviews, setReviews] = useState<Review[]>(() => 
    getStoredOrDefault(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS)
  );

  const [needs, setNeeds] = useState<NeedPost[]>(() => 
    getStoredOrDefault(STORAGE_KEYS.NEEDS, INITIAL_NEEDS)
  );

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const storedUser = getStoredOrDefault<UserProfile>(STORAGE_KEYS.USER, CURRENT_USER);
    if (!storedUser?.id) return [];
    return getStoredOrDefault(`${STORAGE_KEYS.WISHLIST}_${storedUser.id}`, storedUser.id === CURRENT_USER.id ? ['prod_1', 'serv_2'] : []);
  });

  // Navigation & History Stack State
  const [historyStack, setHistoryStack] = useState<NavSnapshot[]>([]);
  const historyStackRef = useRef<NavSnapshot[]>([]);
  useEffect(() => {
    historyStackRef.current = historyStack;
  }, [historyStack]);

  const [activeTab, setActiveTabState] = useState<NavigationTab>('home');
  const activeTabRef = useRef<NavigationTab>('home');
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const [selectedListing, setSelectedListingState] = useState<ListingItem | null>(null);
  const selectedListingRef = useRef<ListingItem | null>(null);
  useEffect(() => {
    selectedListingRef.current = selectedListing;
  }, [selectedListing]);

  const [selectedConversation, setSelectedConversationState] = useState<Conversation | null>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const activeModalRef = useRef<ActiveModalType>(null);
  useEffect(() => {
    activeModalRef.current = activeModal;
  }, [activeModal]);

  const [profileSection, setProfileSectionState] = useState<ProfileSectionTab>('listings');
  const profileSectionRef = useRef<ProfileSectionTab>('listings');
  useEffect(() => {
    profileSectionRef.current = profileSection;
  }, [profileSection]);

  const [createType, setCreateTypeState] = useState<CreateScreenType>('choose');
  const createTypeRef = useRef<CreateScreenType>('choose');
  useEffect(() => {
    createTypeRef.current = createType;
  }, [createType]);

  const productsRef = useRef(products);
  useEffect(() => { productsRef.current = products; }, [products]);
  const servicesRef = useRef(services);
  useEffect(() => { servicesRef.current = services; }, [services]);
  const conversationsRef = useRef(conversations);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  const isHandlingPopState = useRef(false);

  // Push current view snapshot to history
  const pushCurrentSnapshot = useCallback(() => {
    const snap: NavSnapshot = {
      tab: activeTabRef.current,
      listingId: selectedListingRef.current?.id || null,
      conversationId: selectedConversationRef.current?.id || null,
      modal: activeModalRef.current,
      profileSection: activeTabRef.current === 'profile' ? profileSectionRef.current : null,
      createType: activeTabRef.current === 'create' ? createTypeRef.current : null,
    };

    setHistoryStack(prev => {
      const last = prev[prev.length - 1];
      if (
        last &&
        last.tab === snap.tab &&
        last.listingId === snap.listingId &&
        last.conversationId === snap.conversationId &&
        last.modal === snap.modal &&
        last.profileSection === snap.profileSection &&
        last.createType === snap.createType
      ) {
        return prev;
      }
      return [...prev, snap];
    });

    try {
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({ needlyNav: true }, '');
      }
    } catch {}
  }, []);

  const restoreSnapshot = useCallback((targetSnapshot: NavSnapshot) => {
    setActiveTabState(targetSnapshot.tab);

    if (targetSnapshot.listingId) {
      const item = productsRef.current.find(p => p.id === targetSnapshot.listingId) ||
                   servicesRef.current.find(s => s.id === targetSnapshot.listingId);
      setSelectedListingState(item || null);
    } else {
      setSelectedListingState(null);
    }

    if (targetSnapshot.conversationId) {
      const conv = conversationsRef.current.find(c => c.id === targetSnapshot.conversationId);
      setSelectedConversationState(conv ? {
        ...normalizeConversationForUser(conv, currentUser.id, profilesMapRef.current),
        unreadCount: 0
      } : null);
    } else {
      setSelectedConversationState(null);
    }

    setActiveModal(targetSnapshot.modal);

    if (targetSnapshot.profileSection) {
      setProfileSectionState(targetSnapshot.profileSection);
    }
    if (targetSnapshot.createType) {
      setCreateTypeState(targetSnapshot.createType);
    }
  }, []);

  const goBack = useCallback((triggerBrowserBack = true): boolean => {
    const stack = historyStackRef.current;
    if (stack.length > 0) {
      const targetSnapshot = stack[stack.length - 1];
      setHistoryStack(prev => prev.slice(0, -1));
      restoreSnapshot(targetSnapshot);

      if (triggerBrowserBack && typeof window !== 'undefined' && window.history && window.history.state?.needlyNav) {
        isHandlingPopState.current = true;
        try {
          window.history.back();
        } catch {}
        setTimeout(() => {
          isHandlingPopState.current = false;
        }, 150);
      }
      return true;
    }

    // Fallback: If stack was empty but user is in a deeper state or modal
    if (selectedListingRef.current) {
      setSelectedListingState(null);
      return true;
    }
    if (selectedConversationRef.current) {
      setSelectedConversationState(null);
      return true;
    }
    if (activeModalRef.current) {
      setActiveModal(null);
      return true;
    }
    if (activeTabRef.current === 'profile' && profileSectionRef.current !== 'listings') {
      setProfileSectionState('listings');
      return true;
    }
    if (activeTabRef.current === 'create' && createTypeRef.current !== 'choose') {
      setCreateTypeState('choose');
      return true;
    }
    if (activeTabRef.current !== 'home') {
      setActiveTabState('home');
      return true;
    }

    return false; // Already at root Home screen
  }, [restoreSnapshot]);

  // Window popstate listener for browser back button / swipe back
  useEffect(() => {
    const handlePopState = () => {
      if (isHandlingPopState.current) {
        isHandlingPopState.current = false;
        return;
      }
      goBack(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [goBack]);

  const canGoBack = useMemo(() => {
    return (
      historyStack.length > 0 ||
      selectedListing !== null ||
      selectedConversation !== null ||
      activeModal !== null ||
      (activeTab === 'profile' && profileSection !== 'listings') ||
      (activeTab === 'create' && createType !== 'choose') ||
      activeTab !== 'home'
    );
  }, [historyStack.length, selectedListing, selectedConversation, activeModal, activeTab, profileSection, createType]);

  const navigateTab = useCallback((newTab: NavigationTab) => {
    const currentTab = activeTabRef.current;
    const isModalOrDetailOpen = 
      selectedListingRef.current !== null || 
      selectedConversationRef.current !== null || 
      activeModalRef.current !== null;

    if (newTab === currentTab && !isModalOrDetailOpen) {
      scrollToTop();
      return;
    }

    pushCurrentSnapshot();
    setActiveTabState(newTab);
    setSelectedListingState(null);
    setSelectedConversationState(null);
    setActiveModal(null);
  }, [pushCurrentSnapshot]);

  const setActiveTab = useCallback((tab: NavigationTab) => {
    navigateTab(tab);
  }, [navigateTab]);

  const openListing = useCallback((item: ListingItem) => {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string') return;
    pushCurrentSnapshot();
    setSelectedListingState(item);
    selectedListingRef.current = item;
    setSelectedConversationState(null);
    selectedConversationRef.current = null;
    setActiveModal(null);
    activeModalRef.current = null;
  }, [pushCurrentSnapshot]);

  const closeListing = useCallback(() => {
    goBack();
  }, [goBack]);

  const openConversation = useCallback((conv: Conversation) => {
    if (!conv || typeof conv !== 'object' || typeof conv.id !== 'string') return;
    pushCurrentSnapshot();
    const convId = conv.id;
    removeDeletedConvIdForUser(currentUser.id, convId);
    const normalizedConv = normalizeConversationForUser(conv, currentUser.id, profilesMapRef.current);
    const markedMessages = (normalizedConv.messages || []).map(m =>
      m.senderId !== currentUser.id ? { ...m, isRead: true } : m
    );
    const readNormalizedConv: Conversation = {
      ...normalizedConv,
      unreadCount: 0,
      messages: markedMessages
    };
    setConversations(prev => {
      const exists = prev.some(c => c.id === convId);
      if (!exists) {
        return sortConversationsByRecent([readNormalizedConv, ...prev]);
      }
      return prev.map(c => {
        if (c.id === convId) {
          return {
            ...c,
            unreadCount: 0,
            messages: (c.messages || []).map(m => m.senderId !== currentUser.id ? { ...m, isRead: true } : m)
          };
        }
        return c;
      });
    });
    markConversationAsReadInSupabase(convId);
    markMessagesAsReadInSupabase(convId, currentUser.id);
    realtimeSync.broadcast({ type: 'MESSAGES_READ', conversationId: convId, readerId: currentUser.id });

    // Also update any other participant's stored copy in localStorage for seamless multi-user testing in same browser
    const otherParticipantId = (normalizedConv.participantIds || []).find(id => id !== currentUser.id);
    if (otherParticipantId) {
      const otherKey = `${STORAGE_KEYS.CONVERSATIONS}_${otherParticipantId}`;
      const otherConvs = getStoredOrDefault<Conversation[]>(otherKey, []);
      if (otherConvs.length > 0) {
        const updatedOtherConvs = otherConvs.map(c => {
          if (c.id === convId) {
            return {
              ...c,
              messages: (c.messages || []).map(m => m.senderId === otherParticipantId ? { ...m, isRead: true } : m)
            };
          }
          return c;
        });
        safeSetStorage(otherKey, updatedOtherConvs);
      }
    }

    setSelectedConversationState(readNormalizedConv);
    setSelectedListingState(null);
    setActiveModal(null);
  }, [pushCurrentSnapshot, currentUser.id]);

  const closeConversation = useCallback(() => {
    goBack();
  }, [goBack]);

  const setSelectedListing = useCallback((itemOrUpdater: ListingItem | null | ((prev: ListingItem | null) => ListingItem | null)) => {
    if (typeof itemOrUpdater === 'function') {
      setSelectedListingState(itemOrUpdater);
      return;
    }
    if (itemOrUpdater) {
      openListing(itemOrUpdater);
    } else {
      goBack();
    }
  }, [openListing, goBack]);

  const setSelectedConversation = useCallback((convOrUpdater: Conversation | null | ((prev: Conversation | null) => Conversation | null)) => {
    if (typeof convOrUpdater === 'function') {
      setSelectedConversationState(convOrUpdater);
      return;
    }
    if (convOrUpdater) {
      openConversation(convOrUpdater);
    } else {
      goBack();
    }
  }, [openConversation, goBack]);

  const openModal = useCallback((modal: ActiveModalType) => {
    if (!modal) {
      goBack();
      return;
    }
    pushCurrentSnapshot();
    setActiveModal(modal);
    setSelectedListingState(null);
    setSelectedConversationState(null);
  }, [pushCurrentSnapshot, goBack]);

  const closeModal = useCallback(() => {
    goBack();
  }, [goBack]);

  const isWishlistOpen = activeModal === 'wishlist';
  const setIsWishlistOpen = useCallback((open: boolean) => {
    if (open) openModal('wishlist');
    else if (activeModalRef.current === 'wishlist') goBack();
  }, [openModal, goBack]);

  const isNotificationsOpen = activeModal === 'notifications';
  const setIsNotificationsOpen = useCallback((open: boolean) => {
    if (open) openModal('notifications');
    else if (activeModalRef.current === 'notifications') goBack();
  }, [openModal, goBack]);

  const isLocationOpen = activeModal === 'location';
  const setIsLocationOpen = useCallback((open: boolean) => {
    if (open) openModal('location');
    else if (activeModalRef.current === 'location') goBack();
  }, [openModal, goBack]);

  const isChatListOpen = activeModal === 'chatList';
  const setIsChatListOpen = useCallback((open: boolean) => {
    if (open) openModal('chatList');
    else if (activeModalRef.current === 'chatList') goBack();
  }, [openModal, goBack]);

  const isSupabaseSyncModalOpen = activeModal === 'supabase';
  const setIsSupabaseSyncModalOpen = useCallback((open: boolean) => {
    if (open) openModal('supabase');
    else if (activeModalRef.current === 'supabase') goBack();
  }, [openModal, goBack]);

  const setProfileSection = useCallback((sec: ProfileSectionTab) => {
    if (sec === profileSectionRef.current) return;
    pushCurrentSnapshot();
    setProfileSectionState(sec);
  }, [pushCurrentSnapshot]);

  const setCreateType = useCallback((type: CreateScreenType) => {
    if (type === createTypeRef.current) return;
    pushCurrentSnapshot();
    setCreateTypeState(type);
  }, [pushCurrentSnapshot]);

  // Profiles lookup map for fast user resolution and normalization
  const profilesMap = useMemo(() => {
    const map: Record<string, UserProfile> = {};
    for (const p of allProfiles) {
      map[p.id] = p;
    }
    return map;
  }, [allProfiles]);

  const profilesMapRef = useRef(profilesMap);
  useEffect(() => {
    profilesMapRef.current = profilesMap;
  }, [profilesMap]);

  const handleSetSelectedConversation = useCallback((conv: Conversation | null) => {
    if (conv) {
      const normalizedConv = normalizeConversationForUser(conv, currentUser.id, profilesMapRef.current);
      const convId = normalizedConv.id;
      const markedMessages = (normalizedConv.messages || []).map(m =>
        m.senderId !== currentUser.id ? { ...m, isRead: true } : m
      );
      const readNormalizedConv: Conversation = {
        ...normalizedConv,
        unreadCount: 0,
        messages: markedMessages
      };
      setConversations(prev => prev.map(c => {
        if (c.id === convId) {
          return {
            ...c,
            unreadCount: 0,
            messages: (c.messages || []).map(m => m.senderId !== currentUser.id ? { ...m, isRead: true } : m)
          };
        }
        return c;
      }));
      markConversationAsReadInSupabase(convId);
      markMessagesAsReadInSupabase(convId, currentUser.id);
      realtimeSync.broadcast({ type: 'MESSAGES_READ', conversationId: convId, readerId: currentUser.id });
      setSelectedConversation(readNormalizedConv);
    } else {
      setSelectedConversation(null);
    }
  }, [currentUser.id]);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('needly_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [language, setLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem('needly_language') || 'en';
    } catch {
      return 'en';
    }
  });

  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('needly_onboarding_completed') === 'true';
    } catch {
      return false;
    }
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem('needly_onboarding_completed') !== 'true';
    } catch {
      return true;
    }
  });

  const setHasCompletedOnboarding = (completed: boolean) => {
    setHasCompletedOnboardingState(completed);
    setShowOnboarding(!completed);
    try {
      localStorage.setItem('needly_onboarding_completed', String(completed));
    } catch (e) {
      console.warn('Could not save onboarding status:', e);
    }
  };

  const t = (key: string, fallback?: string): string => {
    return translate(key, (language as Language) || 'en', fallback);
  };

  // Synchronize Dark Mode to HTML document
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      localStorage.setItem('needly_dark_mode', String(darkMode));
    } catch (e) {
      console.warn('Could not sync dark mode:', e);
    }
  }, [darkMode]);

  // Synchronize Language and Hindi Font to HTML document
  useEffect(() => {
    try {
      document.documentElement.setAttribute('lang', language);
      if (language === 'hi') {
        document.documentElement.classList.add('lang-hi');
        document.body.classList.add('lang-hi');
      } else {
        document.documentElement.classList.remove('lang-hi');
        document.body.classList.remove('lang-hi');
      }
      localStorage.setItem('needly_language', language);
    } catch (e) {
      console.warn('Could not sync language:', e);
    }
  }, [language]);

  // Clean up legacy unscoped keys and clear stale conversation caches
  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.REQUESTS);
        localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
        localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
        localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
        localStorage.removeItem(STORAGE_KEYS.WISHLIST);
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith(STORAGE_KEYS.CONVERSATIONS) || key.includes('conversation'))) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch {}
  }, []);

  // Safe Sync to localStorage (Public / Global state)
  useEffect(() => { safeSetStorage(STORAGE_KEYS.USER, currentUser); }, [currentUser]);
  useEffect(() => { safeSetStorage(STORAGE_KEYS.LOCATION, currentLocation); }, [currentLocation]);
  useEffect(() => { safeSetStorage(STORAGE_KEYS.PRODUCTS, products); }, [products]);
  useEffect(() => { safeSetStorage(STORAGE_KEYS.SERVICES, services); }, [services]);
  useEffect(() => { safeSetStorage(STORAGE_KEYS.REVIEWS, reviews); }, [reviews]);
  useEffect(() => { safeSetStorage(STORAGE_KEYS.NEEDS, needs); }, [needs]);

  // STRICT USER-ISOLATED STORAGE PERSISTENCE (prevents cross-user data leaking)
  useEffect(() => {
    if (currentUser?.id) {
      safeSetStorage(`${STORAGE_KEYS.REQUESTS}_${currentUser.id}`, requests);
    }
  }, [requests, currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      safeSetStorage(`${STORAGE_KEYS.BOOKINGS}_${currentUser.id}`, bookings);
    }
  }, [bookings, currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      safeSetStorage(`${STORAGE_KEYS.CONVERSATIONS}_${currentUser.id}`, conversations);
    }
  }, [conversations, currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      safeSetStorage(`${STORAGE_KEYS.NOTIFICATIONS}_${currentUser.id}`, notifications);
    }
  }, [notifications, currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      safeSetStorage(`${STORAGE_KEYS.WISHLIST}_${currentUser.id}`, wishlist);
    }
  }, [wishlist, currentUser?.id]);

  // =========================================================================
  // SUPABASE DATABASE INTEGRATION & REALTIME REPLICATION
  // =========================================================================
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatusResult | null>(null);

  const checkDatabaseStatus = async (): Promise<SupabaseStatusResult> => {
    const res = await checkSupabaseStatus();
    setSupabaseStatus(res);
    return res;
  };

  const fetchFromSupabase = async (targetUserId?: string) => {
    const activeUserId = targetUserId || currentUserRef.current?.id;
    try {
      const [p, s, n, rev, profs] = await Promise.all([
        fetchProductsFromSupabase(),
        fetchServicesFromSupabase(),
        fetchNeedsFromSupabase(),
        fetchReviewsFromSupabase(),
        fetchAllProfilesFromSupabase(),
      ]);

      if (profs && profs.length > 0) {
        setAllProfiles(prev => {
          const map = new Map<string, UserProfile>();
          prev.forEach(item => map.set(item.id, item));
          profs.forEach(item => map.set(item.id, item));
          return Array.from(map.values());
        });
        if (activeUserId) {
          const currentInDb = profs.find(u => u.id === activeUserId);
          // Only update attributes if user is still currently active on this same profile ID
          if (currentInDb && currentUserRef.current?.id === activeUserId) {
            setCurrentUser(prev => prev.id === activeUserId ? { ...prev, ...currentInDb } : prev);
            currentUserRef.current = { ...currentUserRef.current, ...currentInDb };
          }
        }
      }

      if (p && p.length > 0) setProducts(p);
      if (s && s.length > 0) setServices(s);
      if (n && n.length > 0) setNeeds(n);
      if (rev && rev.length > 0) setReviews(rev);

      // Strictly query user-scoped private collections
      const currentActiveId = currentUserRef.current?.id || activeUserId;
      if (currentActiveId) {
        const [r, b, c, wl] = await Promise.all([
          fetchRequestsFromSupabase(currentActiveId),
          fetchBookingsFromSupabase(currentActiveId),
          fetchConversationsFromSupabase(currentActiveId),
          fetchWishlistFromSupabase(currentActiveId),
        ]);

        // Guard against race conditions when user switched while fetching
        if (currentUserRef.current?.id === currentActiveId) {
          if (r !== null) {
            setRequests(r.map((req: RentalRequest) => {
              if (req.status === 'pending' && serverTimeService.isRequestExpired(req.createdAt)) {
                return { ...req, status: 'cancelled' as RequestStatus };
              }
              return req;
            }));
          }
          if (b !== null) {
            setBookings(b.map((book: ServiceBooking) => {
              if (book.status === 'pending' && serverTimeService.isRequestExpired(book.createdAt)) {
                return { ...book, status: 'cancelled' as RequestStatus };
              }
              return book;
            }));
          }
          if (c !== null) {
            const deletedIds = getDeletedConvIdsForUser(currentActiveId);
            const nonDeleted = c.filter(conv => !deletedIds.has(conv.id));
            const normalized = nonDeleted.map(conv => normalizeConversationForUser(conv, currentActiveId, profilesMapRef.current));
            setConversations(sortConversationsByRecent(normalized));
          }
          if (wl !== null) setWishlist(wl);
        }
      } else {
        setRequests([]);
        setBookings([]);
        setConversations([]);
        setWishlist([]);
      }
    } catch (err) {
      console.warn('[Needly] Failed to fetch data from Supabase:', err);
    }
  };

  const syncDataToSupabase = async () => {
    const combinedProfiles = [...allProfiles];
    const currentIdx = combinedProfiles.findIndex(u => u.id === currentUser.id);
    if (currentIdx >= 0) {
      combinedProfiles[currentIdx] = currentUser;
    } else {
      combinedProfiles.push(currentUser);
    }

    const res = await syncAllLocalDataToSupabase({
      profiles: combinedProfiles,
      products,
      services,
      needs,
      requests,
      bookings,
      reviews,
      conversations,
      wishlist,
      currentUserId: currentUser.id
    });

    if (res.success) {
      await checkDatabaseStatus();
    }
    return res;
  };

  // Initial Supabase verification & authentication session check
  useEffect(() => {
    let isMounted = true;
    checkDatabaseStatus().then(status => {
      if (!isMounted) return;
      if (status.tablesExist) {
        fetchFromSupabase(currentUserRef.current?.id);
      }
    });

    // Sync with active Supabase Auth session if present
    // Only adopt auth session on startup if the user hasn't actively switched to another profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        const authUser = session.user;
        const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.USER) : null;
        if (!stored) {
          fetchProfileFromSupabase(authUser.id).then(profile => {
            if (!isMounted) return;
            if (profile) {
              setCurrentUser(profile);
              currentUserRef.current = profile;
              safeSetStorage(STORAGE_KEYS.USER, profile);
              fetchFromSupabase(profile.id);
            }
          });
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Do not auto-revert if the user has explicitly switched to another demo profile
        const active = currentUserRef.current;
        if (active && active.id !== session.user.id && active.id !== CURRENT_USER.id) {
          return;
        }
        const profile = await fetchProfileFromSupabase(session.user.id);
        if (profile && isMounted) {
          setCurrentUser(profile);
          currentUserRef.current = profile;
          safeSetStorage(STORAGE_KEYS.USER, profile);
          fetchFromSupabase(profile.id);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // -------------------------------------------------------------
  // REAL-TIME SYNCHRONIZATION HANDLERS (MULTI-TAB & MULTI-USER)
  // -------------------------------------------------------------
  const handleRealtimeProfileUpdated = useCallback((updated: UserProfile) => {
    // 1. Update allProfiles directory
    setAllProfiles(prev => {
      const exists = prev.some(p => p.id === updated.id);
      if (exists) {
        return prev.map(p => p.id === updated.id ? { ...p, ...updated } : p);
      }
      return [...prev, updated];
    });

    // 2. If this tab is currently acting as this user, update currentUser immediately
    setCurrentUser(prev => {
      if (prev.id === updated.id) {
        const merged = { ...prev, ...updated };
        safeSetStorage(STORAGE_KEYS.USER, merged);
        return merged;
      }
      return prev;
    });

    // 3. Update all listings owned by this user
    setProducts(prev => prev.map(prod => prod.ownerId === updated.id ? {
      ...prod,
      ownerName: updated.name,
      ownerAvatar: updated.avatar,
      ownerRating: updated.rating ?? prod.ownerRating,
      ownerReviewCount: updated.reviewCount ?? prod.ownerReviewCount,
    } : prod));

    // 4. Update all services provided by this user
    setServices(prev => prev.map(serv => serv.providerId === updated.id ? {
      ...serv,
      providerName: updated.name,
      providerAvatar: updated.avatar,
      providerRating: updated.rating ?? serv.providerRating,
      providerReviewCount: updated.reviewCount ?? serv.providerReviewCount,
    } : serv));

    // 5. Update community needs
    setNeeds(prev => prev.map(need => need.userId === updated.id ? {
      ...need,
      userName: updated.name,
      userAvatar: updated.avatar,
    } : need));

    // 6. Update rental requests
    setRequests(prev => prev.map(req => {
      let r = { ...req };
      if (req.renterId === updated.id) {
        r.renterName = updated.name;
        r.renterAvatar = updated.avatar;
      }
      if (req.ownerId === updated.id) {
        r.ownerName = updated.name;
      }
      return r;
    }));

    // 7. Update service bookings
    setBookings(prev => prev.map(book => {
      let b = { ...book };
      if (book.customerId === updated.id) {
        b.customerName = updated.name;
        b.customerAvatar = updated.avatar;
      }
      if (book.providerId === updated.id) {
        b.providerName = updated.name;
      }
      return b;
    }));

    // 8. Update reviews
    setReviews(prev => prev.map(rev => rev.authorId === updated.id ? {
      ...rev,
      authorName: updated.name,
      authorAvatar: updated.avatar,
    } : rev));

    // 9. Update conversations list
    setConversations(prev => prev.map(conv => {
      if (conv.otherUser && conv.otherUser.id === updated.id) {
        return {
          ...conv,
          otherUser: {
            ...conv.otherUser,
            name: updated.name,
            avatar: updated.avatar,
            rating: updated.rating || conv.otherUser.rating
          }
        };
      }
      return conv;
    }));

    // 10. Update active selectedListing if open
    setSelectedListing(prev => {
      if (!prev) return prev;
      if (prev.type === 'product' && prev.ownerId === updated.id) {
        return { ...prev, ownerName: updated.name, ownerAvatar: updated.avatar, ownerRating: updated.rating ?? prev.ownerRating };
      }
      if (prev.type === 'service' && prev.providerId === updated.id) {
        return { ...prev, providerName: updated.name, providerAvatar: updated.avatar, providerRating: updated.rating ?? prev.providerRating };
      }
      return prev;
    });

    // 11. Update active selectedConversation if open
    setSelectedConversation(prev => {
      if (!prev || !prev.otherUser || prev.otherUser.id !== updated.id) return prev;
      return {
        ...prev,
        otherUser: {
          ...prev.otherUser,
          name: updated.name,
          avatar: updated.avatar,
          rating: updated.rating || prev.otherUser.rating
        }
      };
    });
  }, []);

  const handleRealtimeProductUpserted = useCallback((product: ProductListing) => {
    setProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? product : p);
      }
      return [product, ...prev];
    });
    setSelectedListing(prev => prev && prev.id === product.id ? product : prev);
  }, []);

  const handleRealtimeProductDeleted = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setWishlist(prev => prev.filter(id => id !== productId));
    setSelectedListing(prev => prev && prev.id === productId ? null : prev);
  }, []);

  const handleRealtimeServiceUpserted = useCallback((service: ServiceListing) => {
    setServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.map(s => s.id === service.id ? service : s);
      }
      return [service, ...prev];
    });
    setSelectedListing(prev => prev && prev.id === service.id ? service : prev);
  }, []);

  const handleRealtimeServiceDeleted = useCallback((serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    setWishlist(prev => prev.filter(id => id !== serviceId));
    setSelectedListing(prev => prev && prev.id === serviceId ? null : prev);
  }, []);

  const handleRealtimeNeedUpserted = useCallback((need: NeedPost) => {
    setNeeds(prev => {
      const exists = prev.some(n => n.id === need.id);
      if (exists) {
        return prev.map(n => n.id === need.id ? need : n);
      }
      // New need broadcasted by another user
      if (need.userId !== currentUser.id) {
        const notif: NotificationItem = {
          id: generateUniqueId('notif'),
          userId: currentUser.id,
          title: 'New Community Need Broadcast 📢',
          message: `${need.userName} is looking for "${need.title}" (Budget: ₹${need.budget}).`,
          type: 'need_response',
          timestamp: 'Just now',
          read: false,
          actionTargetId: need.id,
          targetScreen: 'requests'
        };
        setNotifications(n => [notif, ...n.filter(item => item.id !== notif.id)]);
      }
      return [need, ...prev];
    });
  }, [currentUser.id]);

  const handleRealtimeNeedDeleted = useCallback((needId: string) => {
    setNeeds(prev => prev.filter(n => n.id !== needId));
  }, []);

  const handleRealtimeRequestUpserted = useCallback((req: RentalRequest) => {
    // Only accept if current user is owner or renter!
    if (req.ownerId !== currentUser.id && req.renterId !== currentUser.id) {
      return;
    }

    setRequests(prev => {
      const exists = prev.some(r => r.id === req.id);
      if (exists) {
        return prev.map(r => r.id === req.id ? req : r);
      }
      return [req, ...prev];
    });

    // Notify if current user is owner (new request) or renter (status update)
    if (req.ownerId === currentUser.id && req.status === 'pending') {
      triggerConfetti({ particleCount: 50, spread: 60 });
      const notif: NotificationItem = {
        id: generateUniqueId('notif'),
        userId: currentUser.id,
        title: 'New Rental Request Received! 📦',
        message: `${req.renterName} requested to rent "${req.listingTitle}". Review in Activity.`,
        type: 'rental_request',
        timestamp: 'Just now',
        read: false,
        actionTargetId: req.id,
        targetScreen: 'activity'
      };
      setNotifications(n => [notif, ...n.filter(item => item.id !== notif.id)]);
    } else if (req.renterId === currentUser.id) {
      const isAccepted = req.status === 'accepted';
      if (isAccepted) {
        triggerConfetti({ particleCount: 60, spread: 70 });
      }
      const notif: NotificationItem = {
        id: generateUniqueId('notif'),
        userId: currentUser.id,
        title: req.status === 'accepted' ? 'Rental Request Accepted! ✅' : `Rental ${req.status}`,
        message: `${req.ownerName} updated the status of "${req.listingTitle}" to ${req.status}.`,
        type: isAccepted ? 'request_accepted' : 'rental_request',
        timestamp: 'Just now',
        read: false,
        actionTargetId: req.id,
        targetScreen: 'activity'
      };
      setNotifications(n => [notif, ...n.filter(item => item.id !== notif.id)]);
    }
  }, [currentUser.id]);

  const handleRealtimeBookingUpserted = useCallback((booking: ServiceBooking) => {
    // Only accept if current user is provider or customer!
    if (booking.providerId !== currentUser.id && booking.customerId !== currentUser.id) {
      return;
    }

    setBookings(prev => {
      const exists = prev.some(b => b.id === booking.id);
      if (exists) {
        return prev.map(b => b.id === booking.id ? booking : b);
      }
      return [booking, ...prev];
    });

    if (booking.providerId === currentUser.id && booking.status === 'pending') {
      triggerConfetti({ particleCount: 50, spread: 60 });
      const notif: NotificationItem = {
        id: generateUniqueId('notif'),
        userId: currentUser.id,
        title: 'New Service Booking Received! 💼',
        message: `${booking.customerName} requested an appointment for "${booking.listingTitle}" on ${booking.scheduledDate}.`,
        type: 'booking_confirmed',
        timestamp: 'Just now',
        read: false,
        actionTargetId: booking.id,
        targetScreen: 'activity'
      };
      setNotifications(n => [notif, ...n.filter(item => item.id !== notif.id)]);
    } else if (booking.customerId === currentUser.id) {
      const isAccepted = booking.status === 'accepted';
      if (isAccepted) {
        triggerConfetti({ particleCount: 50, spread: 60 });
      }
      const notif: NotificationItem = {
        id: generateUniqueId('notif'),
        userId: currentUser.id,
        title: isAccepted ? 'Service Booking Confirmed! ✅' : `Booking ${booking.status}`,
        message: `Your booking for "${booking.listingTitle}" with ${booking.providerName} is now ${booking.status}.`,
        type: 'booking_confirmed',
        timestamp: 'Just now',
        read: false,
        actionTargetId: booking.id,
        targetScreen: 'activity'
      };
      setNotifications(n => [notif, ...n.filter(item => item.id !== notif.id)]);
    }
  }, [currentUser.id]);

  const handleRealtimeMessageSent = useCallback((
    conversationId: string, 
    message: Message,
    conversationSummary?: Conversation
  ) => {
    // If sent by me on this client, state was already updated optimistically in sendMessage
    if (message.senderId === currentUser.id) return;

    // Strict participant check: if conversationSummary is given and does not include currentUser, ignore
    if (conversationSummary && !conversationSummary.participantIds.includes(currentUser.id)) {
      return;
    }

    // If new message arrives from other participant, unhide conversation for current user
    removeDeletedConvIdForUser(currentUser.id, conversationId);

    const isCurrentOpen = selectedConversationRef.current?.id === conversationId;
    const effectiveMsg: Message = {
      ...message,
      isRead: isCurrentOpen ? true : message.isRead
    };

    if (isCurrentOpen) {
      markMessagesAsReadInSupabase(conversationId, currentUser.id);
      realtimeSync.broadcast({ type: 'MESSAGES_READ', conversationId, readerId: currentUser.id });
    }

    setConversations(prev => {
      const existsIndex = prev.findIndex(c => c.id === conversationId);

      if (existsIndex >= 0) {
        const target = prev[existsIndex];
        // Security check: only update if current user is an actual participant
        if (!target.participantIds.includes(currentUser.id)) {
          return prev;
        }

        // Deduplicate message: if this exact message is already in conversation, skip
        if (target.messages.some(m => m.id === effectiveMsg.id)) {
          return prev;
        }

        const updatedTarget: Conversation = {
          ...target,
          lastMessage: effectiveMsg.text,
          lastMessageSenderId: effectiveMsg.senderId,
          lastMessageTime: effectiveMsg.timestamp || 'Just now',
          updatedAt: Date.now(),
          unreadCount: isCurrentOpen ? 0 : (target.unreadCount || 0) + 1,
          messages: [...target.messages, effectiveMsg]
        };

        const others = prev.filter((_, idx) => idx !== existsIndex);
        return sortConversationsByRecent([updatedTarget, ...others]);
      }

      // If conversation is brand-new to this client, construct from conversationSummary or fetch
      if (conversationSummary) {
        if (!conversationSummary.participantIds.includes(currentUser.id)) return prev;
        const normalized = normalizeConversationForUser(conversationSummary, currentUser.id, profilesMapRef.current);
        const newConv: Conversation = {
          ...normalized,
          lastMessage: effectiveMsg.text,
          lastMessageSenderId: effectiveMsg.senderId,
          lastMessageTime: effectiveMsg.timestamp || 'Just now',
          updatedAt: Date.now(),
          unreadCount: isCurrentOpen ? 0 : 1,
          messages: normalized.messages.some(m => m.id === effectiveMsg.id)
            ? normalized.messages
            : [...normalized.messages, effectiveMsg]
        };
        return sortConversationsByRecent([newConv, ...prev.filter(c => c.id !== newConv.id)]);
      }

      // Fallback: fetch from Supabase and only set if user is a participant
      fetchConversationByIdFromSupabase(conversationId).then(fetched => {
        if (fetched && fetched.participantIds.includes(currentUser.id)) {
          const normalized = normalizeConversationForUser(fetched, currentUser.id, profilesMapRef.current);
          const convWithMsg: Conversation = {
            ...normalized,
            lastMessage: effectiveMsg.text,
            lastMessageSenderId: effectiveMsg.senderId,
            lastMessageTime: effectiveMsg.timestamp || 'Just now',
            updatedAt: Date.now(),
            unreadCount: isCurrentOpen ? 0 : 1,
            messages: normalized.messages.some(m => m.id === effectiveMsg.id)
              ? normalized.messages
              : [...normalized.messages, effectiveMsg]
          };
          setConversations(cList => sortConversationsByRecent([convWithMsg, ...cList.filter(c => c.id !== convWithMsg.id)]));
        }
      });

      return prev;
    });

    // Update active open modal immediately only if relevant
    setSelectedConversation(prev => {
      if (prev && prev.id === conversationId && prev.participantIds.includes(currentUser.id)) {
        if (prev.messages.some(m => m.id === effectiveMsg.id)) return prev;
        return {
          ...prev,
          lastMessage: effectiveMsg.text,
          lastMessageSenderId: effectiveMsg.senderId,
          lastMessageTime: effectiveMsg.timestamp || 'Just now',
          updatedAt: Date.now(),
          messages: [...prev.messages, effectiveMsg]
        };
      }
      return prev;
    });

    // Notify recipient in-app ONLY if this user participates in the conversation
    const targetConv = conversationsRef.current.find(c => c.id === conversationId) || conversationSummary;
    if (targetConv && targetConv.participantIds.includes(currentUser.id)) {
      const sender = profilesMapRef.current[message.senderId];
      const senderName = sender?.name || 'Neighbor';
      const notif: NotificationItem = {
        id: generateUniqueId('notif'),
        userId: currentUser.id,
        title: `New message from ${senderName} 💬`,
        message: message.text,
        type: 'message',
        timestamp: 'Just now',
        read: false,
        actionTargetId: conversationId,
        targetScreen: 'inbox'
      };
      setNotifications(n => [notif, ...n.filter(item => item.id !== notif.id)]);
    }
  }, [currentUser.id]);

  const handleRealtimeMessageUpdated = useCallback((conversationId: string, updatedMsg: Message) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      return {
        ...c,
        messages: (c.messages || []).map(m => m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m)
      };
    }));
    setSelectedConversationState(prev => {
      if (!prev || prev.id !== conversationId) return prev;
      return {
        ...prev,
        messages: (prev.messages || []).map(m => m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m)
      };
    });
  }, []);

  const handleRealtimeMessagesRead = useCallback((conversationId: string, readerId: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      return {
        ...c,
        messages: (c.messages || []).map(m => m.senderId !== readerId ? { ...m, isRead: true } : m)
      };
    }));
    setSelectedConversationState(prev => {
      if (!prev || prev.id !== conversationId) return prev;
      return {
        ...prev,
        messages: (prev.messages || []).map(m => m.senderId !== readerId ? { ...m, isRead: true } : m)
      };
    });
  }, []);

  const handleRealtimeConversationUpserted = useCallback((conversation: Conversation) => {
    // Only process if current user is a participant
    if (conversation.participantIds && conversation.participantIds.length > 0 && !conversation.participantIds.includes(currentUser.id)) {
      return;
    }

    // Do not restore if this conversation was deleted by the current user
    const deletedIds = getDeletedConvIdsForUser(currentUser.id);
    if (deletedIds.has(conversation.id)) {
      return;
    }

    const normalized = normalizeConversationForUser(conversation, currentUser.id, profilesMapRef.current);

    setConversations(prev => {
      const existing = prev.find(c => c.id === normalized.id);
      if (existing) {
        // Merge messages without duplicating
        const msgIds = new Set(existing.messages.map(m => m.id));
        const merged = [...existing.messages];
        for (const m of normalized.messages) {
          if (!msgIds.has(m.id)) {
            merged.push(m);
            msgIds.add(m.id);
          }
        }
        const existingTime = typeof existing.updatedAt === 'number' ? existing.updatedAt : (existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0);
        const normalizedTime = typeof normalized.updatedAt === 'number' ? normalized.updatedAt : (normalized.updatedAt ? new Date(normalized.updatedAt).getTime() : Date.now());
        const updated: Conversation = {
          ...existing,
          ...normalized,
          messages: merged,
          unreadCount: existing.unreadCount,
          updatedAt: Math.max(Number.isFinite(existingTime) ? existingTime : 0, Number.isFinite(normalizedTime) ? normalizedTime : 0)
        };
        return sortConversationsByRecent([updated, ...prev.filter(c => c.id !== updated.id)]);
      }
      return sortConversationsByRecent([normalized, ...prev.filter(c => c.id !== normalized.id)]);
    });
  }, [currentUser.id]);

  const handleRealtimeReviewAdded = useCallback((review: Review) => {
    setReviews(prev => {
      const exists = prev.some(r => r.id === review.id);
      if (exists) return prev;
      return [review, ...prev];
    });

    // Mark request / booking as reviewed
    if (review.itemType === 'product') {
      setRequests(prev => prev.map(r => r.id === review.transactionId ? { ...r, hasReviewed: true } : r));
    } else {
      setBookings(prev => prev.map(b => b.id === review.transactionId ? { ...b, hasReviewed: true } : b));
    }
  }, []);

  const handleRealtimeWishlistToggled = useCallback((userId: string, listingId: string, add: boolean) => {
    if (userId === currentUser.id) {
      setWishlist(prev => {
        if (add && !prev.includes(listingId)) return [...prev, listingId];
        if (!add) return prev.filter(id => id !== listingId);
        return prev;
      });
    }
  }, [currentUser.id]);

  // Unified Realtime Sync Manager (BroadcastChannel + Storage Events + Supabase Realtime Broadcast)
  useEffect(() => {
    const unsubscribe = realtimeSync.subscribe((event) => {
      switch (event.type) {
        case 'PROFILE_UPDATED':
          handleRealtimeProfileUpdated(event.profile);
          break;
        case 'PRODUCT_UPSERTED':
          handleRealtimeProductUpserted(event.product);
          break;
        case 'PRODUCT_DELETED':
          handleRealtimeProductDeleted(event.productId);
          break;
        case 'SERVICE_UPSERTED':
          handleRealtimeServiceUpserted(event.service);
          break;
        case 'SERVICE_DELETED':
          handleRealtimeServiceDeleted(event.serviceId);
          break;
        case 'NEED_UPSERTED':
          handleRealtimeNeedUpserted(event.need);
          break;
        case 'NEED_DELETED':
          handleRealtimeNeedDeleted(event.needId);
          break;
        case 'RENTAL_REQUEST_UPSERTED':
          handleRealtimeRequestUpserted(event.request);
          break;
        case 'SERVICE_BOOKING_UPSERTED':
          handleRealtimeBookingUpserted(event.booking);
          break;
        case 'MESSAGE_SENT':
          handleRealtimeMessageSent(event.conversationId, event.message, event.conversationSummary);
          break;
        case 'MESSAGE_UPDATED':
          handleRealtimeMessageUpdated(event.conversationId, event.message);
          break;
        case 'MESSAGES_READ':
          handleRealtimeMessagesRead(event.conversationId, event.readerId);
          break;
        case 'CONVERSATION_UPSERTED':
          handleRealtimeConversationUpserted(event.conversation);
          break;
        case 'CONVERSATION_DELETED':
          // Only remove if this event was specifically targeted for the current user's session
          if (event.userId && event.userId === currentUserRef.current?.id) {
            setConversations(prev => prev.filter(c => c.id !== event.conversationId));
            setSelectedConversation(prev => (prev && prev.id === event.conversationId ? null : prev));
          }
          break;
        case 'CONVERSATIONS_CLEARED':
          // Deprecated/removed per requirement: "Remove the 'Clear All' option completely."
          break;
        case 'REVIEW_ADDED':
          handleRealtimeReviewAdded(event.review);
          break;
        case 'WISHLIST_TOGGLED':
          handleRealtimeWishlistToggled(event.userId, event.listingId, event.add);
          break;
        case 'FORCE_REFRESH':
          fetchFromSupabase();
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [
    handleRealtimeProfileUpdated,
    handleRealtimeProductUpserted,
    handleRealtimeProductDeleted,
    handleRealtimeServiceUpserted,
    handleRealtimeServiceDeleted,
    handleRealtimeNeedUpserted,
    handleRealtimeNeedDeleted,
    handleRealtimeRequestUpserted,
    handleRealtimeBookingUpserted,
    handleRealtimeMessageSent,
    handleRealtimeConversationUpserted,
    handleRealtimeReviewAdded,
    handleRealtimeWishlistToggled
  ]);

  // Tab visibility & focus change synchronization
  useEffect(() => {
    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        try {
          const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed && parsed.id) {
              setCurrentUser(prev => {
                if (prev.id === parsed.id && (prev.name !== parsed.name || prev.avatar !== parsed.avatar || prev.bio !== parsed.bio)) {
                  currentUserRef.current = parsed;
                  return parsed;
                }
                return prev;
              });
            }
          }
        } catch {
          // ignore
        }
        if (supabaseStatus?.tablesExist) {
          fetchFromSupabase(currentUserRef.current?.id);
        }
      }
    };

    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);
    return () => {
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
    };
  }, [supabaseStatus?.tablesExist]);

  // Periodic background check every 12 seconds when active
  useEffect(() => {
    if (!supabaseStatus?.tablesExist) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchFromSupabase(currentUserRef.current?.id);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [supabaseStatus?.tablesExist]);

  // 48-hour timer authoritative synchronization runner
  // Maintains server time synchronization and auto-expires requests when 48 hours are completed
  const checkAndExpirePendingRequests = useCallback(async () => {
    // 1. Sync time with server to ensure accurate countdown calculations
    await serverTimeService.syncWithServer().catch(() => {});

    // 2. Automatically expire pending requests in state if 48h has elapsed
    setRequests(prev => {
      let changed = false;
      const updated = prev.map(req => {
        if (req.status === 'pending' && serverTimeService.isRequestExpired(req.createdAt)) {
          changed = true;
          return { ...req, status: 'cancelled' as RequestStatus };
        }
        return req;
      });
      return changed ? updated : prev;
    });

    // 3. Automatically expire pending bookings in state if 48h has elapsed
    setBookings(prev => {
      let changed = false;
      const updated = prev.map(b => {
        if (b.status === 'pending' && serverTimeService.isRequestExpired(b.createdAt)) {
          changed = true;
          return { ...b, status: 'cancelled' as RequestStatus };
        }
        return b;
      });
      return changed ? updated : prev;
    });

    // 4. Also trigger backend and Supabase expiration checks
    try {
      await serverTimeService.triggerServerExpireCheck().catch(() => {});
      const fortyEightHoursAgoIso = new Date(serverTimeService.getServerTime() - (48 * 3600 * 1000)).toISOString();
      await expirePendingRequestsInSupabase(fortyEightHoursAgoIso).catch(() => {});
    } catch {}
  }, []);

  // 48-Hour Timer Expiration Check runner (every 1s & on visibility/focus)
  useEffect(() => {
    checkAndExpirePendingRequests();
    const interval = setInterval(checkAndExpirePendingRequests, 1000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        checkAndExpirePendingRequests();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [checkAndExpirePendingRequests]);

  // Supabase Realtime channel for live multi-device & two-account synchronization
  useEffect(() => {
    if (!supabaseStatus?.tablesExist) return;

    const channel = supabase
      .channel('needly-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updated = mapProfileFromDb(payload.new);
          setAllProfiles(prev => {
            const exists = prev.some(p => p.id === updated.id);
            if (exists) {
              return prev.map(p => p.id === updated.id ? updated : p);
            }
            return [...prev, updated];
          });

          if (updated.id === currentUserRef.current?.id) {
            setCurrentUser(updated);
            currentUserRef.current = updated;
            safeSetStorage(STORAGE_KEYS.USER, updated);
          }

          // Update listings owned or provided by this user
          setProducts(prev => prev.map(prod => prod.ownerId === updated.id ? {
            ...prod,
            ownerName: updated.name,
            ownerAvatar: updated.avatar,
            ownerRating: updated.rating,
            ownerReviewCount: updated.reviewCount
          } : prod));

          setServices(prev => prev.map(serv => serv.providerId === updated.id ? {
            ...serv,
            providerName: updated.name,
            providerAvatar: updated.avatar,
            providerRating: updated.rating,
            providerReviewCount: updated.reviewCount
          } : serv));

          setNeeds(prev => prev.map(need => need.userId === updated.id ? {
            ...need,
            userName: updated.name,
            userAvatar: updated.avatar
          } : need));

          setRequests(prev => prev.map(req => {
            let r = { ...req };
            if (req.renterId === updated.id) {
              r.renterName = updated.name;
              r.renterAvatar = updated.avatar;
            }
            if (req.ownerId === updated.id) {
              r.ownerName = updated.name;
            }
            return r;
          }));

          setBookings(prev => prev.map(book => {
            let b = { ...book };
            if (book.customerId === updated.id) {
              b.customerName = updated.name;
              b.customerAvatar = updated.avatar;
            }
            if (book.providerId === updated.id) {
              b.providerName = updated.name;
            }
            return b;
          }));

          setConversations(prev => prev.map(conv => {
            if (conv.otherUser && conv.otherUser.id === updated.id) {
              return {
                ...conv,
                otherUser: {
                  ...conv.otherUser,
                  name: updated.name,
                  avatar: updated.avatar,
                  rating: updated.rating || conv.otherUser.rating
                }
              };
            }
            return conv;
          }));

          setSelectedListing(prev => {
            if (!prev) return prev;
            if (prev.type === 'product' && prev.ownerId === updated.id) {
              return { ...prev, ownerName: updated.name, ownerAvatar: updated.avatar, ownerRating: updated.rating };
            }
            if (prev.type === 'service' && prev.providerId === updated.id) {
              return { ...prev, providerName: updated.name, providerAvatar: updated.avatar, providerRating: updated.rating };
            }
            return prev;
          });

          setSelectedConversation(prev => {
            if (!prev || !prev.otherUser || prev.otherUser.id !== updated.id) return prev;
            return {
              ...prev,
              otherUser: {
                ...prev.otherUser,
                name: updated.name,
                avatar: updated.avatar,
                rating: updated.rating || prev.otherUser.rating
              }
            };
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMsgRow = payload.new as any;
          const newMsg: Message = {
            id: newMsgRow.id,
            senderId: newMsgRow.sender_id,
            text: newMsgRow.text,
            timestamp: newMsgRow.timestamp || 'Just now',
            isRead: Boolean(newMsgRow.is_read),
            attachmentUrl: newMsgRow.attachment_url,
          };
          handleRealtimeMessageSent(newMsgRow.conversation_id, newMsg);
        } else if (payload.eventType === 'UPDATE') {
          const updatedRow = payload.new as any;
          const updatedMsg: Message = {
            id: updatedRow.id,
            senderId: updatedRow.sender_id,
            text: updatedRow.text,
            timestamp: updatedRow.timestamp || 'Just now',
            isRead: Boolean(updatedRow.is_read),
            attachmentUrl: updatedRow.attachment_url,
          };
          handleRealtimeMessageUpdated(updatedRow.conversation_id, updatedMsg);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, async (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const row = payload.new as any;
          fetchConversationByIdFromSupabase(row.id).then(newConv => {
            if (newConv) {
              handleRealtimeConversationUpserted(newConv);
            }
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_requests' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newReq = mapRentalRequestFromDb(payload.new);
          // Only add to state if current user is the renter or owner
          if (newReq.renterId !== currentUser.id && newReq.ownerId !== currentUser.id) {
            return;
          }
          setRequests(prev => [newReq, ...prev.filter(r => r.id !== newReq.id)]);

          // If current user is the owner, fire celebration & notification!
          if (newReq.ownerId === currentUser.id) {
            triggerConfetti({ particleCount: 50, spread: 60 });
            const notif: NotificationItem = {
              id: generateUniqueId('notif'),
              userId: currentUser.id,
              title: 'New Rental Request Received! 📦',
              message: `${newReq.renterName} requested to rent "${newReq.listingTitle}". Review in Activity.`,
              type: 'rental_request',
              timestamp: 'Just now',
              read: false,
              actionTargetId: newReq.id,
              targetScreen: 'activity'
            };
            setNotifications(n => [notif, ...n.filter(item => item.id !== notif.id)]);
          }
        } else if (payload.eventType === 'UPDATE') {
          const updated = mapRentalRequestFromDb(payload.new);
          // Only update state if current user is the renter or owner
          if (updated.renterId !== currentUser.id && updated.ownerId !== currentUser.id) {
            return;
          }
          setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));

          // If current user is the renter, notify about status change!
          if (updated.renterId === currentUser.id) {
            const isAccepted = updated.status === 'accepted';
            if (isAccepted) {
              triggerConfetti({ particleCount: 60, spread: 70 });
            }
            const statusLabel = updated.status === 'accepted' ? 'Rental Request Accepted! ✅' :
                                updated.status === 'active' ? 'Rental Active & Handed Over 🔄' :
                                updated.status === 'completed' ? 'Rental Completed 🏁' :
                                updated.status === 'rejected' ? 'Rental Request Declined ❌' : 'Rental Status Updated';
            const notif: NotificationItem = {
              id: generateUniqueId('notif'),
              userId: currentUser.id,
              title: statusLabel,
              message: `${updated.ownerName} updated the status of "${updated.listingTitle}" to ${updated.status}.`,
              type: isAccepted ? 'request_accepted' : 'rental_request',
              timestamp: 'Just now',
              read: false,
              actionTargetId: updated.id,
              targetScreen: 'activity'
            };
            setNotifications(n => [notif, ...n.filter(item => item.id !== notif.id)]);
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_bookings' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newBooking = mapServiceBookingFromDb(payload.new);
          // Only add to state if current user is customer or provider
          if (newBooking.customerId !== currentUser.id && newBooking.providerId !== currentUser.id) {
            return;
          }
          setBookings(prev => [newBooking, ...prev.filter(b => b.id !== newBooking.id)]);

          // If current user is provider, notify!
          if (newBooking.providerId === currentUser.id) {
            triggerConfetti({ particleCount: 50, spread: 60 });
            const notif: NotificationItem = {
              id: generateUniqueId('notif'),
              userId: currentUser.id,
              title: 'New Service Booking Received! 💼',
              message: `${newBooking.customerName} requested an appointment for "${newBooking.listingTitle}" on ${newBooking.scheduledDate}.`,
              type: 'booking_confirmed',
              timestamp: 'Just now',
              read: false,
              actionTargetId: newBooking.id,
              targetScreen: 'activity'
            };
            setNotifications(n => [notif, ...n.filter(item => item.id !== notif.id)]);
          }
        } else if (payload.eventType === 'UPDATE') {
          const updated = mapServiceBookingFromDb(payload.new);
          // Only update state if current user is customer or provider
          if (updated.customerId !== currentUser.id && updated.providerId !== currentUser.id) {
            return;
          }
          setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));

          // If current user is customer, notify!
          if (updated.customerId === currentUser.id) {
            const isAccepted = updated.status === 'accepted';
            if (isAccepted) {
              triggerConfetti({ particleCount: 50, spread: 60 });
            }
            const notif: NotificationItem = {
              id: generateUniqueId('notif'),
              userId: currentUser.id,
              title: isAccepted ? 'Service Booking Confirmed! ✅' : `Booking ${updated.status}`,
              message: `Your booking for "${updated.listingTitle}" with ${updated.providerName} is now ${updated.status}.`,
              type: 'booking_confirmed',
              timestamp: 'Just now',
              read: false,
              actionTargetId: updated.id,
              targetScreen: 'activity'
            };
            setNotifications(n => [notif, ...n.filter(item => item.id !== notif.id)]);
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'needs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newNeed = mapNeedFromDb(payload.new);
          setNeeds(prev => [newNeed, ...prev.filter(n => n.id !== newNeed.id)]);

          if (newNeed.userId !== currentUser.id) {
            const notif: NotificationItem = {
              id: generateUniqueId('notif'),
              userId: currentUser.id,
              title: 'New Community Need Broadcast 📢',
              message: `${newNeed.userName} is looking for "${newNeed.title}" (Budget: ₹${newNeed.budget}).`,
              type: 'need_response',
              timestamp: 'Just now',
              read: false,
              actionTargetId: newNeed.id,
              targetScreen: 'requests'
            };
            setNotifications(n => [notif, ...n.filter(item => item.id !== notif.id)]);
          }
        } else if (payload.eventType === 'UPDATE') {
          const updated = mapNeedFromDb(payload.new);
          setNeeds(prev => prev.map(n => n.id === updated.id ? updated : n));
        } else if (payload.eventType === 'DELETE') {
          setNeeds(prev => prev.filter(n => n.id !== (payload.old as any).id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newProd = mapProductFromDb(payload.new);
          setProducts(prev => [newProd, ...prev.filter(p => p.id !== newProd.id)]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = mapProductFromDb(payload.new);
          setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
          setSelectedListing(prev => prev && prev.id === updated.id ? updated : prev);
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== (payload.old as any).id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newServ = mapServiceFromDb(payload.new);
          setServices(prev => [newServ, ...prev.filter(s => s.id !== newServ.id)]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = mapServiceFromDb(payload.new);
          setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
          setSelectedListing(prev => prev && prev.id === updated.id ? updated : prev);
        } else if (payload.eventType === 'DELETE') {
          setServices(prev => prev.filter(s => s.id !== (payload.old as any).id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newRev = mapReviewFromDb(payload.new);
          setReviews(prev => [newRev, ...prev.filter(r => r.id !== newRev.id)]);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlists' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new as any;
          if (row.user_id === currentUser.id) {
            setWishlist(prev => prev.includes(row.listing_id) ? prev : [...prev, row.listing_id]);
          }
        } else if (payload.eventType === 'DELETE') {
          const row = payload.old as any;
          if (row.user_id === currentUser.id) {
            setWishlist(prev => prev.filter(id => id !== row.listing_id));
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseStatus?.tablesExist, currentUser.id, allProfiles]);

  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const unreadMessagesCount = useMemo(() => {
    return conversations.reduce((acc, conv) => {
      if (conv.messages && conv.messages.length > 0) {
        const unreadFromMsgs = conv.messages.filter(m => !m.isRead && m.senderId !== currentUser.id).length;
        return acc + Math.max(unreadFromMsgs, conv.unreadCount || 0);
      }
      return acc + (conv.unreadCount || 0);
    }, 0);
  }, [conversations, currentUser.id]);

  const switchUser = async (newUser: UserProfile) => {
    // 1. Immediately update ref, state, and storage
    currentUserRef.current = newUser;
    setCurrentUser(newUser);
    safeSetStorage(STORAGE_KEYS.USER, newUser);

    // 2. Wipe previous user's private data from in-memory state
    setRequests([]);
    setBookings([]);
    setConversations([]);
    setNotifications([]);
    setWishlist([]);
    setSelectedConversation(null);
    setSelectedListing(null);

    // 3. Load user-scoped local cached data specifically for newUser
    const rawCachedRequests = getStoredOrDefault<RentalRequest[]>(`${STORAGE_KEYS.REQUESTS}_${newUser.id}`, newUser.id === CURRENT_USER.id ? INITIAL_REQUESTS : []);
    const cachedRequests = rawCachedRequests.map(r => {
      if (r.status === 'pending' && serverTimeService.isRequestExpired(r.createdAt)) {
        return { ...r, status: 'cancelled' as RequestStatus };
      }
      return r;
    });
    const rawCachedBookings = getStoredOrDefault<ServiceBooking[]>(`${STORAGE_KEYS.BOOKINGS}_${newUser.id}`, newUser.id === CURRENT_USER.id ? INITIAL_BOOKINGS : []);
    const cachedBookings = rawCachedBookings.map(b => {
      if (b.status === 'pending' && serverTimeService.isRequestExpired(b.createdAt)) {
        return { ...b, status: 'cancelled' as RequestStatus };
      }
      return b;
    });
    const cachedConversations = getStoredOrDefault<Conversation[]>(`${STORAGE_KEYS.CONVERSATIONS}_${newUser.id}`, newUser.id === CURRENT_USER.id ? INITIAL_CONVERSATIONS : []);
    const baseConvList = (cachedConversations && cachedConversations.length > 0) ? cachedConversations : (newUser.id === CURRENT_USER.id ? INITIAL_CONVERSATIONS : []);
    const newUserDeletedIds = getDeletedConvIdsForUser(newUser.id);
    const nonDeletedCached = baseConvList.filter((c: any) => !newUserDeletedIds.has(c.id));
    const cachedNotifications = getStoredOrDefault(`${STORAGE_KEYS.NOTIFICATIONS}_${newUser.id}`, newUser.id === CURRENT_USER.id ? INITIAL_NOTIFICATIONS : []);
    const cachedWishlist = getStoredOrDefault(`${STORAGE_KEYS.WISHLIST}_${newUser.id}`, newUser.id === CURRENT_USER.id ? ['prod_1', 'serv_2'] : []);

    setRequests(cachedRequests);
    setBookings(cachedBookings);
    setConversations(sortConversationsByRecent(nonDeletedCached.map(c => normalizeConversationForUser(c, newUser.id, profilesMapRef.current))));
    setNotifications(cachedNotifications);
    setWishlist(cachedWishlist);

    // 4. Ensure demo profile is in Supabase
    try {
      saveProfileToSupabase(newUser);
    } catch {}

    // 5. Fetch live data for newUser from Supabase
    if (supabaseStatus?.tablesExist) {
      try {
        const [fresh, reqs, bks, convs, wl] = await Promise.all([
          fetchProfileFromSupabase(newUser.id),
          fetchRequestsFromSupabase(newUser.id),
          fetchBookingsFromSupabase(newUser.id),
          fetchConversationsFromSupabase(newUser.id),
          fetchWishlistFromSupabase(newUser.id),
        ]);

        // Guard against race condition: only update if user hasn't switched away while fetching
        if (currentUserRef.current?.id === newUser.id) {
          if (fresh) {
            setCurrentUser(fresh);
            currentUserRef.current = fresh;
            safeSetStorage(STORAGE_KEYS.USER, fresh);
          }
          if (reqs !== null) {
            setRequests(reqs.map((r: RentalRequest) => {
              if (r.status === 'pending' && serverTimeService.isRequestExpired(r.createdAt)) {
                return { ...r, status: 'cancelled' as RequestStatus };
              }
              return r;
            }));
          }
          if (bks !== null) {
            setBookings(bks.map((b: ServiceBooking) => {
              if (b.status === 'pending' && serverTimeService.isRequestExpired(b.createdAt)) {
                return { ...b, status: 'cancelled' as RequestStatus };
              }
              return b;
            }));
          }
          if (convs !== null) {
            const currentDeleted = getDeletedConvIdsForUser(newUser.id);
            const nonDeletedLive = convs.filter(c => !currentDeleted.has(c.id));
            const normalizedList = nonDeletedLive.map(c => normalizeConversationForUser(c, newUser.id, profilesMapRef.current));
            setConversations(sortConversationsByRecent(normalizedList));
          }
          if (wl !== null) setWishlist(wl);
        }
      } catch (err) {
        console.warn('[Needly] Failed to fetch switchUser data:', err);
      }
    }
  };

  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    safeSetStorage(STORAGE_KEYS.USER, updatedUser);

    setAllProfiles(prev => {
      const exists = prev.some(p => p.id === currentUser.id);
      if (exists) {
        return prev.map(p => p.id === currentUser.id ? updatedUser : p);
      }
      return [...prev, updatedUser];
    });

    const newName = updates.name;
    const newAvatar = updates.avatar;

    if (newName !== undefined || newAvatar !== undefined) {
      // 1. Update previous and existing products owned by user
      setProducts(prev => prev.map(prod => {
        if (prod.ownerId === currentUser.id) {
          return {
            ...prod,
            ownerName: newName !== undefined ? newName : prod.ownerName,
            ownerAvatar: newAvatar !== undefined ? newAvatar : prod.ownerAvatar,
          };
        }
        return prod;
      }));

      // 2. Update previous and existing services provided by user
      setServices(prev => prev.map(serv => {
        if (serv.providerId === currentUser.id) {
          return {
            ...serv,
            providerName: newName !== undefined ? newName : serv.providerName,
            providerAvatar: newAvatar !== undefined ? newAvatar : serv.providerAvatar,
          };
        }
        return serv;
      }));

      // 3. Update requests/needs posted by user
      setNeeds(prev => prev.map(need => {
        if (need.userId === currentUser.id) {
          return {
            ...need,
            userName: newName !== undefined ? newName : need.userName,
            userAvatar: newAvatar !== undefined ? newAvatar : need.userAvatar,
          };
        }
        return need;
      }));

      // 4. Update rental requests where user is renter or owner
      setRequests(prev => prev.map(req => {
        let updated = { ...req };
        if (req.renterId === currentUser.id) {
          updated.renterName = newName !== undefined ? newName : req.renterName;
          updated.renterAvatar = newAvatar !== undefined ? newAvatar : req.renterAvatar;
        }
        if (req.ownerId === currentUser.id) {
          updated.ownerName = newName !== undefined ? newName : req.ownerName;
        }
        return updated;
      }));

      // 5. Update bookings where user is customer or provider
      setBookings(prev => prev.map(book => {
        let updated = { ...book };
        if (book.customerId === currentUser.id) {
          updated.customerName = newName !== undefined ? newName : book.customerName;
          updated.customerAvatar = newAvatar !== undefined ? newAvatar : book.customerAvatar;
        }
        if (book.providerId === currentUser.id) {
          updated.providerName = newName !== undefined ? newName : book.providerName;
        }
        return updated;
      }));

      // 6. Update reviews authored by user
      setReviews(prev => prev.map(rev => {
        if (rev.authorId === currentUser.id) {
          return {
            ...rev,
            authorName: newName !== undefined ? newName : rev.authorName,
            authorAvatar: newAvatar !== undefined ? newAvatar : rev.authorAvatar,
          };
        }
        return rev;
      }));

      // 7. Update conversations where other user is user or participant
      setConversations(prev => prev.map(conv => {
        let updated = { ...conv };
        if (conv.otherUser && conv.otherUser.id === currentUser.id) {
          updated.otherUser = {
            ...conv.otherUser,
            name: newName !== undefined ? newName : conv.otherUser.name,
            avatar: newAvatar !== undefined ? newAvatar : conv.otherUser.avatar,
          };
        }
        return updated;
      }));

      // 8. Update selectedListing if it is owned/provided by current user
      setSelectedListing(prev => {
        if (!prev) return prev;
        if (prev.type === 'product' && prev.ownerId === currentUser.id) {
          return {
            ...prev,
            ownerName: newName !== undefined ? newName : prev.ownerName,
            ownerAvatar: newAvatar !== undefined ? newAvatar : prev.ownerAvatar,
          };
        }
        if (prev.type === 'service' && prev.providerId === currentUser.id) {
          return {
            ...prev,
            providerName: newName !== undefined ? newName : prev.providerName,
            providerAvatar: newAvatar !== undefined ? newAvatar : prev.providerAvatar,
          };
        }
        return prev;
      });

      // 9. Update selectedConversation if it references the current user
      setSelectedConversation(prev => {
        if (!prev) return prev;
        let updated = { ...prev };
        if (prev.otherUser && prev.otherUser.id === currentUser.id) {
          updated.otherUser = {
            ...prev.otherUser,
            name: newName !== undefined ? newName : prev.otherUser.name,
            avatar: newAvatar !== undefined ? newAvatar : prev.otherUser.avatar,
          };
        }
        return updated;
      });
    }

    saveProfileToSupabase(updatedUser);
    realtimeSync.broadcast({
      type: 'PROFILE_UPDATED',
      profile: updatedUser
    });
  };

  const isValidEmailFormat = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(trimmed);
  };

  const isAuthorizedEmail = (email: string): boolean => {
    if (!isValidEmailFormat(email)) return false;
    const normalized = email.trim().toLowerCase();
    if (normalized === 'sayyedamaan2004@gmail.com') return true;
    return allProfiles.some(p => p.email && p.email.trim().toLowerCase() === normalized);
  };

  const loginWithEmail = (email: string, _passwordOrCode?: string): { success: boolean; message?: string; user?: UserProfile } => {
    const normalized = (email || '').trim().toLowerCase();
    if (!isValidEmailFormat(normalized)) {
      return {
        success: false,
        message: 'Invalid email address format. Please enter a valid email (e.g. name@domain.com).'
      };
    }

    if (!isAuthorizedEmail(normalized)) {
      return {
        success: false,
        message: 'No account found with this email. Please check your spelling or sign up below.'
      };
    }

    let targetUser = allProfiles.find(p => p.email && p.email.trim().toLowerCase() === normalized);
    if (!targetUser) {
      if (normalized === 'sayyedamaan2004@gmail.com') {
        targetUser = {
          ...currentUser,
          name: currentUser.name || 'Aarav Sharma',
          email: 'sayyedamaan2004@gmail.com',
          isVerified: true
        };
      }
    }

    if (targetUser) {
      switchUser(targetUser);
      saveProfileToSupabase(targetUser);
      realtimeSync.broadcast({
        type: 'PROFILE_UPDATED',
        profile: targetUser
      });
      setHasCompletedOnboarding(true);
      setShowOnboarding(false);
      return { success: true, user: targetUser };
    }

    return {
      success: false,
      message: 'Failed to authenticate profile. Please try again.'
    };
  };

  const loginWithPhone = (phone: string, _otp: string) => {
    const formatted = phone.startsWith('+91') ? phone : `+91 ${phone}`;
    const existing = allProfiles.find(p => p.phone === formatted);
    const updatedUser = existing ? { ...existing, isVerified: true } : {
      ...currentUser,
      phone: formatted,
      isVerified: true
    };
    switchUser(updatedUser);
    saveProfileToSupabase(updatedUser);
    realtimeSync.broadcast({
      type: 'PROFILE_UPDATED',
      profile: updatedUser
    });
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
    return true;
  };

  const loginWithGoogle = (name = 'Aarav Sharma', email = 'sayyedamaan2004@gmail.com') => {
    const normalized = (email || '').trim().toLowerCase();
    if (!isValidEmailFormat(normalized)) {
      throw new Error('Invalid email format for Google login.');
    }
    const existing = allProfiles.find(p => p.email && p.email.trim().toLowerCase() === normalized);
    const updatedUser: UserProfile = existing ? { ...existing, isVerified: true } : {
      id: generateUniqueId('user'),
      name: name || currentUser.name,
      phone: '+91 98765 43210',
      email: normalized,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'user')}`,
      location: currentLocation,
      isVerified: true,
      rating: 5.0,
      reviewCount: 0,
      memberSince: 'Just now',
      bio: 'Verified community member',
      responseRate: '100%',
      activeRole: 'both'
    };
    if (!existing) {
      setAllProfiles(prev => [updatedUser, ...prev]);
    }
    switchUser(updatedUser);
    saveProfileToSupabase(updatedUser);
    realtimeSync.broadcast({
      type: 'PROFILE_UPDATED',
      profile: updatedUser
    });
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  const registerNewUser = (data: {
    name: string;
    phone: string;
    email: string;
    city?: string;
    roleInterest?: 'renter' | 'owner' | 'both';
  }): UserProfile => {
    const cleanName = data.name.trim() || 'Neighbor';
    const cleanEmail = (data.email || '').trim().toLowerCase();

    if (!isValidEmailFormat(cleanEmail)) {
      throw new Error('A valid email address is required for registration.');
    }

    const formattedPhone = data.phone.trim().startsWith('+91') ? data.phone.trim() : `+91 ${data.phone.trim()}`;

    // Check if user with email already exists
    const existing = allProfiles.find(p => p.email && p.email.trim().toLowerCase() === cleanEmail);
    if (existing) {
      switchUser(existing);
      setHasCompletedOnboarding(true);
      setShowOnboarding(false);
      return existing;
    }

    const newUser: UserProfile = {
      id: generateUniqueId('user'),
      name: cleanName,
      phone: formattedPhone,
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
      location: data.city ? { ...currentLocation, city: data.city, displayName: `${data.city}, Rajasthan` } : currentLocation,
      isVerified: true,
      rating: 5.0,
      reviewCount: 0,
      memberSince: 'Just now',
      bio: 'Active local community member on Needly.',
      responseRate: '100%',
      activeRole: 'both'
    };

    setAllProfiles(prev => [newUser, ...prev]);
    saveProfileToSupabase(newUser);
    realtimeSync.broadcast({
      type: 'PROFILE_UPDATED',
      profile: newUser
    });
    switchUser(newUser);
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
    return newUser;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error signing out from Supabase Auth:', err);
    }

    // Clean user-specific storage keys
    if (currentUser?.id) {
      try {
        localStorage.removeItem(`${STORAGE_KEYS.REQUESTS}_${currentUser.id}`);
        localStorage.removeItem(`${STORAGE_KEYS.BOOKINGS}_${currentUser.id}`);
        localStorage.removeItem(`${STORAGE_KEYS.CONVERSATIONS}_${currentUser.id}`);
        localStorage.removeItem(`${STORAGE_KEYS.NOTIFICATIONS}_${currentUser.id}`);
        localStorage.removeItem(`${STORAGE_KEYS.WISHLIST}_${currentUser.id}`);
      } catch {}
    }

    // Clean global user storage keys
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.REQUESTS);
      localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
      localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.WISHLIST);
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    } catch {}

    // Reset all private state immediately
    setRequests([]);
    setBookings([]);
    setConversations([]);
    setNotifications([]);
    setWishlist([]);
    setSelectedConversation(null);
    setSelectedListing(null);

    const guestUser: UserProfile = {
      id: generateUniqueId('user'),
      name: '',
      phone: '',
      email: '',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
      location: LOCATIONS[0],
      isVerified: false,
      rating: 5.0,
      reviewCount: 0,
      memberSince: 'Just now',
      bio: '',
      responseRate: '100%',
      activeRole: 'both'
    };

    setCurrentUser(guestUser);
    setHasCompletedOnboarding(false);
    setShowOnboarding(true);
    setActiveTabState('home');
  };

  const reverseGeocodeCoords = async (lat: number, lng: number) => {
    let cityName = 'Detected City';
    let areaName = 'Current GPS Location';
    let stateName = 'Near You';

    const gmapsKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;

    // Reverse geocode via Google Maps Geocoding API if key is available
    if (gmapsKey) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${gmapsKey}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const components = data.results[0].address_components;
            const locality = components.find((c: any) => c.types.includes('locality'))?.long_name;
            const sublocality = components.find((c: any) => c.types.includes('sublocality'))?.long_name;
            const state = components.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name;
            if (locality) cityName = locality;
            if (sublocality) areaName = sublocality;
            if (state) stateName = state;
          }
        }
      } catch {
        // Fallback to coordinates
      }
    }

    return {
      city: cityName,
      area: areaName,
      state: stateName,
      latitude: lat,
      longitude: lng,
      displayName: areaName !== 'Current GPS Location' ? `${areaName}, ${cityName}` : `GPS: ${lat.toFixed(2)}, ${lng.toFixed(2)}`
    };
  };

  const detectGPSLocation = async (): Promise<boolean> => {
    // 1. Native Android execution via Capacitor Geolocation
    if (Capacitor.isNativePlatform()) {
      try {
        const perm = await CapGeolocation.checkPermissions();
        if (perm.location !== 'granted') {
          const req = await CapGeolocation.requestPermissions();
          if (req.location !== 'granted') {
            console.warn('Native Android location permission denied');
            return false;
          }
        }
        const capPos = await CapGeolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000
        });
        const detectedLoc = await reverseGeocodeCoords(capPos.coords.latitude, capPos.coords.longitude);
        setCurrentLocation(detectedLoc);
        return true;
      } catch (nativeErr) {
        console.warn('Native GPS error, trying browser fallback', nativeErr);
      }
    }

    // 2. Browser standard fallback
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        return await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const detectedLoc = await reverseGeocodeCoords(pos.coords.latitude, pos.coords.longitude);
              setCurrentLocation(detectedLoc);
              resolve(true);
            },
            async (err) => {
              console.warn('GPS location request error (e.g. timeout or denied):', err);
              // Fallback to free IP geolocation if device GPS is blocked or timed out
              try {
                const ipRes = await fetch('https://ipapi.co/json/');
                if (ipRes.ok) {
                  const ipData = await ipRes.json();
                  if (ipData.latitude && ipData.longitude) {
                    const fallbackLoc = {
                      city: ipData.city || 'Detected City',
                      area: ipData.region || 'Nearby',
                      state: ipData.region || 'Local',
                      latitude: ipData.latitude,
                      longitude: ipData.longitude,
                      displayName: `${ipData.city || 'Nearby'}, ${ipData.region || ''}`
                    };
                    setCurrentLocation(fallbackLoc);
                    resolve(true);
                    return;
                  }
                }
              } catch {
                // Ignore IP fallback error
              }
              resolve(false);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        });
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return false;
  };

  const addProductListing = (data: Omit<ProductListing, 'id' | 'createdAt' | 'timesRented' | 'distanceKm'>): ProductListing => {
    const newProduct: ProductListing = {
      ...data,
      id: generateUniqueId('prod'),
      createdAt: new Date().toISOString().split('T')[0],
      timesRented: 0,
      distanceKm: 0.1
    };
    setProducts(prev => [newProduct, ...prev]);
    saveProductToSupabase(newProduct);
    realtimeSync.broadcast({ type: 'PRODUCT_UPSERTED', product: newProduct });

    // Confetti celebration
    triggerConfetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    // Add notification
    const newNotif: NotificationItem = {
      id: generateUniqueId('notif'),
      userId: currentUser.id,
      title: 'Product Listed Successfully! 🚀',
      message: `Your listing for "${newProduct.title}" is now visible to people nearby in ${currentLocation.displayName}.`,
      type: 'rental_request',
      timestamp: 'Just now',
      read: false,
      actionTargetId: newProduct.id,
      targetScreen: 'home'
    };
    setNotifications(prev => {
      const seen = new Set<string>();
      return [newNotif, ...prev].filter(n => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
    });

    return newProduct;
  };

  const addServiceListing = (data: Omit<ServiceListing, 'id' | 'createdAt' | 'jobsCompleted' | 'distanceKm'>): ServiceListing => {
    const newService: ServiceListing = {
      ...data,
      id: generateUniqueId('serv'),
      createdAt: new Date().toISOString().split('T')[0],
      jobsCompleted: 0,
      distanceKm: 0.1
    };
    setServices(prev => [newService, ...prev]);
    saveServiceToSupabase(newService);
    realtimeSync.broadcast({ type: 'SERVICE_UPSERTED', service: newService });

    triggerConfetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    const newNotif: NotificationItem = {
      id: generateUniqueId('notif'),
      userId: currentUser.id,
      title: 'Service Published! 💼',
      message: `Your service "${newService.title}" is now live and ready to receive bookings in ${currentLocation.displayName}.`,
      type: 'booking_confirmed',
      timestamp: 'Just now',
      read: false,
      actionTargetId: newService.id,
      targetScreen: 'home'
    };
    setNotifications(prev => {
      const seen = new Set<string>();
      return [newNotif, ...prev].filter(n => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
    });

    return newService;
  };

  const updateProductListing = (updatedProduct: ProductListing) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    saveProductToSupabase(updatedProduct);
    realtimeSync.broadcast({ type: 'PRODUCT_UPSERTED', product: updatedProduct });
    if (selectedListing && selectedListing.id === updatedProduct.id) {
      setSelectedListing(updatedProduct);
    }
  };

  const updateServiceListing = (updatedService: ServiceListing) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    saveServiceToSupabase(updatedService);
    realtimeSync.broadcast({ type: 'SERVICE_UPSERTED', service: updatedService });
    if (selectedListing && selectedListing.id === updatedService.id) {
      setSelectedListing(updatedService);
    }
  };

  const deleteProductListing = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setWishlist(prev => prev.filter(id => id !== productId));
    deleteProductFromSupabase(productId);
    realtimeSync.broadcast({ type: 'PRODUCT_DELETED', productId });
    if (selectedListing && selectedListing.id === productId) {
      setSelectedListing(null);
    }
  };

  const deleteServiceListing = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    setWishlist(prev => prev.filter(id => id !== serviceId));
    deleteServiceFromSupabase(serviceId);
    realtimeSync.broadcast({ type: 'SERVICE_DELETED', serviceId });
    if (selectedListing && selectedListing.id === serviceId) {
      setSelectedListing(null);
    }
  };

  const requestRental = (params: {
    listing: ProductListing;
    startDate: string;
    endDate: string;
    totalDays: number;
    pickupPreference: 'pickup' | 'delivery';
    deliveryAddress?: string;
    customerNote?: string;
    termsAcknowledged?: boolean;
    autoRedirectToChat?: boolean;
  }): RentalRequest => {
    const totalAmount = params.listing.pricePerUnit * params.totalDays;
    const newReq: RentalRequest = {
      id: generateUniqueId('req'),
      listingId: params.listing.id,
      listingTitle: params.listing.title,
      listingImage: params.listing.images[0] || '',
      ownerId: params.listing.ownerId,
      ownerName: params.listing.ownerName,
      renterId: currentUser.id,
      renterName: currentUser.name,
      renterAvatar: currentUser.avatar,
      startDate: params.startDate,
      endDate: params.endDate,
      totalDays: params.totalDays,
      dailyRate: params.listing.pricePerUnit,
      totalAmount,
      securityDeposit: params.listing.securityDeposit,
      status: 'pending',
      pickupPreference: params.pickupPreference,
      deliveryAddress: params.deliveryAddress,
      customerNote: params.customerNote,
      createdAt: new Date().toISOString(),
      hasReviewed: false,
      termsAcknowledged: params.termsAcknowledged !== undefined ? params.termsAcknowledged : true,
      acknowledgedAt: new Date().toISOString()
    };

    setRequests(prev => [newReq, ...prev]);
    saveRentalRequestToSupabase(newReq);
    realtimeSync.broadcast({ type: 'RENTAL_REQUEST_UPSERTED', request: newReq });

    triggerConfetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    // Add in-app notification
    const notif: NotificationItem = {
      id: generateUniqueId('notif'),
      userId: currentUser.id,
      title: 'Rental Request Acknowledged & Sent ⏳',
      message: `Your request for "${params.listing.title}" was acknowledged and sent to ${params.listing.ownerName}. Awaiting confirmation.`,
      type: 'rental_request',
      timestamp: 'Just now',
      read: false,
      actionTargetId: newReq.id,
      targetScreen: 'activity'
    };
    setNotifications(prev => {
      const seen = new Set<string>();
      return [notif, ...prev].filter(n => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
    });

    // Send conversation message (with autoOpen controlled by autoRedirectToChat, defaulting to true to immediately redirect to chat with publisher)
    const shouldAutoOpen = params.autoRedirectToChat !== false;
    startConversationWithListing(
      params.listing, 
      `Hi ${params.listing.ownerName}! I have submitted a rental request for ${params.totalDays} day(s) from ${params.startDate} to ${params.endDate}.${params.customerNote ? ` Note: ${params.customerNote}` : ''}`,
      shouldAutoOpen
    );

    return newReq;
  };

  const bookService = (params: {
    listing: ServiceListing;
    scheduledDate: string;
    scheduledTime: string;
    packageId?: string;
    packageName?: string;
    packagePrice?: number;
    totalAmount: number;
    serviceAddress: string;
    customerNotes?: string;
    termsAcknowledged?: boolean;
    termsVersion?: string;
    autoRedirectToChat?: boolean;
  }): ServiceBooking => {
    // Strict enforcement: reject request creation if acknowledgement is missing or false
    if (!params.termsAcknowledged) {
      throw new Error('Service request rejected: Terms and Conditions must be explicitly acknowledged before sending a request.');
    }

    const newBooking: ServiceBooking = {
      id: generateUniqueId('book'),
      listingId: params.listing.id,
      listingTitle: params.listing.title,
      listingImage: params.listing.images[0] || '',
      providerId: params.listing.providerId,
      providerName: params.listing.providerName,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerAvatar: currentUser.avatar,
      scheduledDate: params.scheduledDate,
      scheduledTime: params.scheduledTime,
      packageId: params.packageId,
      packageName: params.packageName,
      packagePrice: params.packagePrice,
      totalAmount: params.totalAmount,
      serviceAddress: params.serviceAddress,
      status: 'pending',
      customerNotes: params.customerNotes,
      createdAt: new Date().toISOString(),
      hasReviewed: false,
      termsAcknowledged: true,
      termsVersion: params.termsVersion || 'service_request_terms_v1',
      acknowledgedAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);
    saveServiceBookingToSupabase(newBooking);
    realtimeSync.broadcast({ type: 'SERVICE_BOOKING_UPSERTED', booking: newBooking });

    triggerConfetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    const notif: NotificationItem = {
      id: generateUniqueId('notif'),
      userId: currentUser.id,
      title: 'Service Booking Acknowledged & Sent ⏳',
      message: `Your booking for "${params.listing.title}" with ${params.listing.providerName} is acknowledged and pending confirmation.`,
      type: 'booking_confirmed',
      timestamp: 'Just now',
      read: false,
      actionTargetId: newBooking.id,
      targetScreen: 'activity'
    };
    setNotifications(prev => {
      const seen = new Set<string>();
      return [notif, ...prev].filter(n => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
    });

    const shouldAutoOpen = params.autoRedirectToChat !== false;
    startConversationWithListing(
      params.listing, 
      `Hi ${params.listing.providerName}! I requested a service booking for ${params.scheduledDate} at ${params.scheduledTime}. Location: ${params.serviceAddress}${params.customerNotes ? `. Note: ${params.customerNotes}` : ''}`,
      shouldAutoOpen
    );

    return newBooking;
  };

  const updateRequestStatus = (requestId: string, newStatus: RequestStatus) => {
    updateRentalRequestStatusInSupabase(requestId, newStatus);
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updated = { ...req, status: newStatus };
        realtimeSync.broadcast({ type: 'RENTAL_REQUEST_UPSERTED', request: updated });
        
        // Add notification based on status
        let notifTitle = 'Request Updated';
        let notifMsg = `Rental status changed to: ${newStatus}`;
        if (newStatus === 'accepted') {
          notifTitle = 'Rental Accepted! ✅';
          notifMsg = `Rental for "${req.listingTitle}" was accepted. Pickup coordinate is active.`;
        } else if (newStatus === 'active') {
          notifTitle = 'Rental Active 🔄';
          notifMsg = `Product handed over! Enjoy using "${req.listingTitle}".`;
        } else if (newStatus === 'completed') {
          notifTitle = 'Rental Completed 🏁';
          notifMsg = `Product returned safely. Security deposit release processed. Please leave a review!`;
        } else if (newStatus === 'rejected') {
          notifTitle = 'Request Declined ❌';
          notifMsg = `Owner was unable to fulfill request for "${req.listingTitle}".`;
        }

        const notif: NotificationItem = {
          id: generateUniqueId('notif'),
          userId: req.renterId === currentUser.id ? req.ownerId : req.renterId,
          title: notifTitle,
          message: notifMsg,
          type: newStatus === 'accepted' ? 'request_accepted' : 'reminder',
          timestamp: 'Just now',
          read: false,
          actionTargetId: req.id,
          targetScreen: 'activity'
        };
        setNotifications(n => {
          const seen = new Set<string>();
          return [notif, ...n].filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
        });

        return updated;
      }
      return req;
    }));
  };

  const updateBookingStatus = (bookingId: string, newStatus: RequestStatus) => {
    updateServiceBookingStatusInSupabase(bookingId, newStatus);
    setBookings(prev => prev.map(book => {
      if (book.id === bookingId) {
        const updated = { ...book, status: newStatus };
        realtimeSync.broadcast({ type: 'SERVICE_BOOKING_UPSERTED', booking: updated });
        
        const notif: NotificationItem = {
          id: generateUniqueId('notif'),
          userId: book.customerId,
          title: `Booking ${newStatus.toUpperCase()}`,
          message: `Your booking for "${book.listingTitle}" has been updated to ${newStatus}.`,
          type: 'booking_confirmed',
          timestamp: 'Just now',
          read: false,
          actionTargetId: book.id,
          targetScreen: 'activity'
        };
        setNotifications(n => {
          const seen = new Set<string>();
          return [notif, ...n].filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
        });

        return updated;
      }
      return book;
    }));
  };

  const startConversationWithListing = (listing: ListingItem, firstMsg?: string, autoOpen: boolean = true): Conversation => {
    const isProd = listing.type === 'product';
    const otherUserId = isProd ? (listing as ProductListing).ownerId : (listing as ServiceListing).providerId;
    const otherUserName = isProd ? (listing as ProductListing).ownerName : (listing as ServiceListing).providerName;
    const otherUserAvatar = isProd ? (listing as ProductListing).ownerAvatar : (listing as ServiceListing).providerAvatar;
    const otherUserRating = isProd ? (listing as ProductListing).ownerRating : (listing as ServiceListing).providerRating;
    const priceText = isProd 
      ? `₹${(listing as ProductListing).pricePerUnit}/${(listing as ProductListing).unit}`
      : `From ₹${(listing as ServiceListing).startingPrice}`;

    // Prevent creating/opening a conversation with oneself for one's own listing
    if (otherUserId === currentUser.id) {
      return null as unknown as Conversation;
    }

    // Deterministic ID ensures one unique conversation thread per product/service between two users
    const deterministicId = getDeterministicConversationId(listing.id, currentUser.id, otherUserId);

    // Check if an existing conversation exists for this exact listing and participants
    const existing = conversations.find(c => 
      c.id === deterministicId || 
      (c.listingId === listing.id && 
       c.participantIds.includes(currentUser.id) && 
       (c.participantIds.includes(otherUserId) || c.otherUser?.id === otherUserId))
    );

    if (existing) {
      if (autoOpen) {
        openConversation(existing);
      }
      if (firstMsg) {
        sendMessage(existing.id, firstMsg);
      }
      return existing;
    }

    const newMessages: Message[] = firstMsg ? [{
      id: generateUniqueId('msg'),
      senderId: currentUser.id,
      text: firstMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    }] : [];

    const newConv: Conversation = {
      id: deterministicId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingImage: listing.images[0] || '',
      listingPrice: priceText,
      itemType: listing.type,
      participantIds: [currentUser.id, otherUserId],
      otherUser: {
        id: otherUserId,
        name: otherUserName,
        avatar: otherUserAvatar,
        rating: otherUserRating
      },
      lastMessage: firstMsg || '',
      lastMessageSenderId: firstMsg ? currentUser.id : undefined,
      lastMessageTime: 'Just now',
      updatedAt: Date.now(),
      unreadCount: 0,
      messages: newMessages
    };

    setConversations(prev => sortConversationsByRecent([newConv, ...prev.filter(c => c.id !== newConv.id)]));
    if (autoOpen) {
      openConversation(newConv);
    }
    saveConversationToSupabase(newConv);
    realtimeSync.broadcast({ type: 'CONVERSATION_UPSERTED', conversation: newConv });

    if (newMessages.length > 0) {
      saveMessageToSupabase(newMessages[0], newConv.id, newConv);
      realtimeSync.broadcast({ 
        type: 'MESSAGE_SENT', 
        conversationId: newConv.id, 
        message: newMessages[0],
        conversationSummary: newConv
      });
    }
    return newConv;
  };

  const sendMessage = (conversationId: string, text: string) => {
    removeDeletedConvIdForUser(currentUser.id, conversationId);
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: generateUniqueId('msg'),
      senderId: currentUser.id,
      text,
      timestamp: timestampStr,
      isRead: false
    };

    let targetConvSnapshot: Conversation | null = null;

    setConversations(prev => {
      let updatedConv: Conversation | null = null;
      const others = prev.filter(conv => {
        if (conv.id === conversationId) {
          const msgExists = conv.messages.some(m => m.id === newMsg.id);
          updatedConv = {
            ...conv,
            lastMessage: text,
            lastMessageSenderId: currentUser.id,
            lastMessageTime: 'Just now',
            updatedAt: Date.now(),
            messages: msgExists ? conv.messages : [...conv.messages, newMsg]
          };
          return false;
        }
        return true;
      });

      if (updatedConv) {
        targetConvSnapshot = updatedConv;
        return sortConversationsByRecent([updatedConv, ...others]);
      }
      return prev;
    });

    setSelectedConversation(prev => {
      if (prev && prev.id === conversationId) {
        const msgExists = prev.messages.some(m => m.id === newMsg.id);
        return {
          ...prev,
          lastMessage: text,
          lastMessageSenderId: currentUser.id,
          lastMessageTime: 'Just now',
          updatedAt: Date.now(),
          messages: msgExists ? prev.messages : [...prev.messages, newMsg]
        };
      }
      return prev;
    });

    // Save to Supabase and broadcast
    saveMessageToSupabase(newMsg, conversationId, targetConvSnapshot || undefined);
    realtimeSync.broadcast({
      type: 'MESSAGE_SENT',
      conversationId,
      message: newMsg,
      conversationSummary: targetConvSnapshot || undefined
    });
  };

  const toggleWishlist = (listingId: string) => {
    const isAdding = !wishlist.includes(listingId);
    toggleWishlistInSupabase(currentUser.id, listingId, isAdding);
    realtimeSync.broadcast({ type: 'WISHLIST_TOGGLED', userId: currentUser.id, listingId, add: isAdding });
    setWishlist(prev => {
      if (prev.includes(listingId)) {
        return prev.filter(id => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });
  };

  const isWishlisted = (listingId: string) => wishlist.includes(listingId);

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: generateUniqueId('rev'),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setReviews(prev => [newReview, ...prev]);
    saveReviewToSupabase(newReview);
    realtimeSync.broadcast({ type: 'REVIEW_ADDED', review: newReview });

    // Mark request / booking as reviewed
    if (reviewData.itemType === 'product') {
      setRequests(prev => prev.map(r => r.id === reviewData.transactionId ? { ...r, hasReviewed: true } : r));
    } else {
      setBookings(prev => prev.map(b => b.id === reviewData.transactionId ? { ...b, hasReviewed: true } : b));
    }

    triggerConfetti({ particleCount: 40, spread: 50 });
  };

  const postNeed = (needData: Omit<NeedPost, 'id' | 'createdAt' | 'responsesCount' | 'status' | 'userId' | 'userName' | 'userAvatar'>): NeedPost => {
    const newNeed: NeedPost = {
      ...needData,
      id: generateUniqueId('need'),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      createdAt: new Date().toISOString(),
      responsesCount: 0,
      status: 'open'
    };

    setNeeds(prev => [newNeed, ...prev]);
    saveNeedToSupabase(newNeed);
    realtimeSync.broadcast({ type: 'NEED_UPSERTED', need: newNeed });

    triggerConfetti({ particleCount: 50, spread: 60 });

    const notif: NotificationItem = {
      id: generateUniqueId('notif'),
      userId: currentUser.id,
      title: 'Need Broadcasted Locally 📢',
      message: `Your request "${newNeed.title}" is now broadcasting to verified owners & providers in ${currentLocation.displayName}.`,
      type: 'reminder',
      timestamp: 'Just now',
      read: false,
      actionTargetId: newNeed.id,
      targetScreen: 'home'
    };
    setNotifications(prev => {
      const seen = new Set<string>();
      return [notif, ...prev].filter(n => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
    });

    return newNeed;
  };

  const deleteNeed = (needId: string) => {
    setNeeds(prev => prev.filter(n => n.id !== needId));
    deleteNeedFromSupabase(needId);
    realtimeSync.broadcast({ type: 'NEED_DELETED', needId });
  };

  const toggleNeedStatus = (needId: string) => {
    const targetNeed = needs.find(n => n.id === needId);
    if (targetNeed) {
      const nextStatus = targetNeed.status === 'open' ? 'fulfilled' : 'open';
      updateNeedStatusInSupabase(needId, nextStatus);
      const updatedNeed: NeedPost = { ...targetNeed, status: nextStatus };
      realtimeSync.broadcast({ type: 'NEED_UPSERTED', need: updatedNeed });
    }
    setNeeds(prev => prev.map(n => {
      if (n.id === needId) {
        const nextStatus = n.status === 'open' ? 'fulfilled' : 'open';
        return { ...n, status: nextStatus };
      }
      return n;
    }));
  };

  const respondToNeed = (need: NeedPost, offer: { message: string; quotePrice: number; listingId?: string }): Conversation => {
    // Increment responses count on the need
    setNeeds(prev => prev.map(n => n.id === need.id ? { ...n, responsesCount: (n.responsesCount || 0) + 1 } : n));

    const priceText = `Offered: ₹${offer.quotePrice} (Budget: ₹${need.budget})`;
    const initialText = offer.message?.trim() || `Hi ${need.userName}! I can provide your request for "${need.title}" for **₹${offer.quotePrice}**.`;

    const newMsg: Message = {
      id: generateUniqueId('msg'),
      senderId: currentUser.id,
      text: initialText,
      timestamp: 'Just now',
      isRead: false
    };

    const deterministicId = getDeterministicConversationId(need.id, currentUser.id, need.userId);

    // Check if conversation already exists with this requester for this need
    const existing = conversations.find(c => 
      c.id === deterministicId || 
      (c.listingId === need.id && 
       c.participantIds.includes(currentUser.id) && 
       (c.participantIds.includes(need.userId) || c.otherUser?.id === need.userId))
    );
    if (existing) {
      sendMessage(existing.id, initialText);
      handleSetSelectedConversation(existing);
      return existing;
    }

    const newConv: Conversation = {
      id: deterministicId,
      listingId: need.id,
      listingTitle: `Request: ${need.title}`,
      listingImage: need.userAvatar,
      listingPrice: priceText,
      itemType: need.type,
      participantIds: [currentUser.id, need.userId],
      otherUser: {
        id: need.userId,
        name: need.userName,
        avatar: need.userAvatar,
        rating: 4.9
      },
      lastMessage: initialText,
      lastMessageSenderId: currentUser.id,
      lastMessageTime: 'Just now',
      updatedAt: Date.now(),
      unreadCount: 0,
      messages: [newMsg]
    };

    setConversations(prev => sortConversationsByRecent([newConv, ...prev.filter(c => c.id !== newConv.id)]));
    handleSetSelectedConversation(newConv);
    saveConversationToSupabase(newConv);
    saveMessageToSupabase(newMsg, newConv.id, newConv);
    realtimeSync.broadcast({ type: 'CONVERSATION_UPSERTED', conversation: newConv });
    realtimeSync.broadcast({ 
      type: 'MESSAGE_SENT', 
      conversationId: newConv.id, 
      message: newMsg,
      conversationSummary: newConv
    });

    const notif: NotificationItem = {
      id: generateUniqueId('notif'),
      userId: currentUser.id,
      title: 'Offer Sent for Local Request 🤝',
      message: `You sent a ₹${offer.quotePrice} proposal to ${need.userName} for "${need.title}". Open your chat to coordinate details.`,
      type: 'rental_request',
      timestamp: 'Just now',
      read: false,
      actionTargetId: newConv.id,
      targetScreen: 'inbox'
    };

    setNotifications(prev => {
      const seen = new Set<string>();
      return [notif, ...prev].filter(n => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
    });

    triggerConfetti({ particleCount: 50, spread: 65 });

    return newConv;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const resetToDemoData = () => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    } catch (e) {
      console.warn('Error clearing localStorage:', e);
    }
    setCurrentUser(CURRENT_USER);
    setCurrentLocation(LOCATIONS[0]);
    setProducts(INITIAL_PRODUCTS);
    setServices(INITIAL_SERVICES);
    setRequests(INITIAL_REQUESTS);
    setBookings(INITIAL_BOOKINGS);
    setConversations(INITIAL_CONVERSATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setReviews(INITIAL_REVIEWS);
    setNeeds(INITIAL_NEEDS);
    setWishlist(['prod_1', 'serv_2']);
  };

  const deleteAccount = () => {
    const deletedUserId = currentUser.id;
    // Clean deleted user's storage keys
    if (deletedUserId) {
      try {
        localStorage.removeItem(`${STORAGE_KEYS.REQUESTS}_${deletedUserId}`);
        localStorage.removeItem(`${STORAGE_KEYS.BOOKINGS}_${deletedUserId}`);
        localStorage.removeItem(`${STORAGE_KEYS.CONVERSATIONS}_${deletedUserId}`);
        localStorage.removeItem(`${STORAGE_KEYS.NOTIFICATIONS}_${deletedUserId}`);
        localStorage.removeItem(`${STORAGE_KEYS.WISHLIST}_${deletedUserId}`);
        localStorage.removeItem(`needly_deleted_convs_${deletedUserId}`);
      } catch {}
    }

    // 1. Remove user-owned products & services
    setProducts(prev => prev.filter(p => p.ownerId !== deletedUserId));
    setServices(prev => prev.filter(s => s.providerId !== deletedUserId));
    // 2. Remove user-created community needs
    setNeeds(prev => prev.filter(n => n.userId !== deletedUserId));
    // 3. Remove rental requests & bookings where user participated
    setRequests(prev => prev.filter(r => r.renterId !== deletedUserId && r.ownerId !== deletedUserId));
    setBookings(prev => prev.filter(b => b.customerId !== deletedUserId && b.providerId !== deletedUserId));
    // 4. Remove conversations involving user
    setConversations(prev => prev.filter(c => !c.participantIds.includes(deletedUserId)));
    // 5. Remove from wishlist
    setWishlist([]);

    // 6. Select fallback user from other profiles
    const remaining = allProfiles.filter(p => p.id !== deletedUserId);
    const fallbackUser = remaining.length > 0 ? remaining[0] : CURRENT_USER;
    setAllProfiles(remaining.length > 0 ? remaining : [CURRENT_USER]);
    switchUser(fallbackUser);

    // 7. System notification
    const notif: NotificationItem = {
      id: generateUniqueId('notif'),
      userId: fallbackUser.id,
      title: 'Account Deleted',
      message: 'Your profile and associated listings have been removed from Needly.',
      type: 'reminder',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const deleteConversation = async (conversationId: string) => {
    const currentUserId = currentUserRef.current?.id;
    if (!currentUserId || !conversationId) return;

    // 1. Store the deletion specifically for THIS user in persistent storage
    addDeletedConvIdForUser(currentUserId, conversationId);

    // 2. Remove ONLY from current user's local UI state
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    setSelectedConversation(prev => (prev && prev.id === conversationId ? null : prev));

    // 3. Update localStorage cached conversations specifically for this user
    try {
      if (typeof localStorage !== 'undefined') {
        const userConvKey = `${STORAGE_KEYS.CONVERSATIONS}_${currentUserId}`;
        const saved = localStorage.getItem(userConvKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              const updated = parsed.filter((c: any) => c.id !== conversationId);
              localStorage.setItem(userConvKey, JSON.stringify(updated));
            }
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Error updating localStorage for user deleted conversation:', e);
    }

    // NOTE:
    // - We intentionally do NOT delete the chat or messages from Supabase/database
    // - The other participant will continue to see the complete chat normally
    // - We only broadcast to other tabs of the SAME user session so only this user's views sync
    realtimeSync.broadcast({
      type: 'CONVERSATION_DELETED',
      conversationId,
      userId: currentUserId
    });
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      allProfiles,
      switchUser,
      updateCurrentUserProfile,
      loginWithPhone,
      loginWithGoogle,
      loginWithEmail,
      isAuthorizedEmail,
      isValidEmailFormat,
      registerNewUser,
      logout,
      deleteAccount,
      hasCompletedOnboarding,
      setHasCompletedOnboarding,
      showOnboarding,
      setShowOnboarding,
      currentLocation,
      setCurrentLocation,
      detectGPSLocation,
      products,
      services,
      requests,
      bookings,
      conversations,
      notifications,
      reviews,
      needs,
      wishlist,
      activeTab,
      setActiveTab,
      navigateTab,
      selectedListing,
      setSelectedListing,
      openListing,
      closeListing,
      selectedConversation,
      setSelectedConversation,
      openConversation,
      closeConversation,
      activeModal,
      openModal,
      closeModal,
      isWishlistOpen,
      setIsWishlistOpen,
      isNotificationsOpen,
      setIsNotificationsOpen,
      isLocationOpen,
      setIsLocationOpen,
      isChatListOpen,
      setIsChatListOpen,
      profileSection,
      setProfileSection,
      createType,
      setCreateType,
      historyStack,
      canGoBack,
      goBack,
      unreadNotifsCount,
      unreadMessagesCount,
      addProductListing,
      addServiceListing,
      updateProductListing,
      updateServiceListing,
      deleteProductListing,
      deleteServiceListing,
      requestRental,
      bookService,
      updateRequestStatus,
      updateBookingStatus,
      startConversationWithListing,
      sendMessage,
      toggleWishlist,
      isWishlisted,
      addReview,
      postNeed,
      deleteNeed,
      toggleNeedStatus,
      respondToNeed,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      darkMode,
      setDarkMode,
      language,
      setLanguage,
      t,
      supabaseStatus,
      isSupabaseSyncModalOpen,
      setIsSupabaseSyncModalOpen,
      checkDatabaseStatus,
      syncDataToSupabase,
      fetchFromSupabase,
      resetToDemoData,
      deleteConversation
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
