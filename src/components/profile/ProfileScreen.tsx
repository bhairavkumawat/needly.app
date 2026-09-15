import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  MapPin, 
  ChevronRight, 
  Edit3, 
  Clock, 
  Briefcase,
  CheckCircle2, 
  PlusCircle,
  Settings,
  XCircle,
  Sparkles,
  Trash2,
  MessageSquare,
  Calendar,
  Camera,
  Mail,
  Heart,
  Eye,
  EyeOff,
  Layers,
  ShieldAlert,
  Star
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RequestStatus, ServiceListing, ProfileSectionTab } from '../../types';
import { getCategoryName } from '../../data/categories';
import { PostNeedModal } from '../common/PostNeedModal';
import { SettingsModal } from './SettingsModal';
import { EditProfileModal } from './EditProfileModal';
import { ChangePhotoModal } from './ChangePhotoModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { PortfolioManager } from './PortfolioManager';
import { AdminDashboard } from '../admin/AdminDashboard';

const ADMIN_EMAILS = [
  'sayyedamaan2004@gmail.com',
  'bhairavgk999@gmail.com',
  'needlyudaipur@gmail.com'
];

export const ProfileScreen: React.FC = () => {
  const { 
    currentUser, 
    updateCurrentUserProfile, 
    deleteAccount,
    services, 
    updateServiceListing,
    deleteServiceListing,
    bookings, 
    startConversationWithListing,
    setSelectedListing, 
    setActiveTab,
    t,
    wishlist,
    toggleWishlist,
    profileSection: activeSection,
    setProfileSection: setActiveSection,
    activeModal,
    openModal,
    goBack
  } = useApp();

  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<ServiceListing | null>(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');

  // Check admin authorization
  const userEmailNormalized = (currentUser?.email || '').toLowerCase().trim();
  const isAuthorizedAdmin = ADMIN_EMAILS.includes(userEmailNormalized);

  // Helper flags mapped to centralized activeModal for back stack support
  const showEditProfileModal = activeModal === 'editProfile';
  const showChangePhotoModal = activeModal === 'changePhoto';
  const showDeleteAccountModal = activeModal === 'deleteAccount';
  const showPostNeed = activeModal === 'postNeed';
  const showSettingsModal = activeModal === 'settings';

  const setShowEditProfileModal = (open: boolean) => {
    if (open) openModal('editProfile');
    else if (activeModal === 'editProfile') goBack();
  };
  const setShowChangePhotoModal = (open: boolean) => {
    if (open) openModal('changePhoto');
    else if (activeModal === 'changePhoto') goBack();
  };
  const setShowDeleteAccountModal = (open: boolean) => {
    if (open) openModal('deleteAccount');
    else if (activeModal === 'deleteAccount') goBack();
  };
  const setShowPostNeed = (open: boolean) => {
    if (open) openModal('postNeed');
    else if (activeModal === 'postNeed') goBack();
  };
  const setShowSettingsModal = (open: boolean) => {
    if (open) openModal('settings');
    else if (activeModal === 'settings') goBack();
  };

  // My services provided by currentUser
  const myServices = services.filter(s => s.providerId === currentUser.id);

  // Saved / Wishlisted services
  const wishlistedServices = services.filter(s => wishlist.includes(s.id));

  // My service bookings (as customer or provider)
  const myServiceBookings = bookings.filter(b => 
    (b.customerId === currentUser.id || b.providerId === currentUser.id) &&
    b.status !== 'cancelled' && b.status !== 'rejected' && b.status !== 'expired'
  );

  const BOOKING_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
  ];

  const getFilterCount = (filterId: string) => {
    if (filterId === 'all') return myServiceBookings.length;
    return myServiceBookings.filter(b => b.status === filterId).length;
  };

  const filteredBookings = myServiceBookings.filter(b => {
    if (bookingStatusFilter === 'all') return true;
    return b.status === bookingStatusFilter;
  });

  const getStatusBadge = (status: RequestStatus, id?: string) => {
    switch (status) {
      case 'pending':
        return (
          <span 
            id={id}
            className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <Clock className="w-2.5 h-2.5 text-amber-600" /> Pending
          </span>
        );
      case 'accepted':
        return (
          <span 
            id={id}
            className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <CheckCircle2 className="w-2.5 h-2.5 text-teal-600" /> Accepted
          </span>
        );
      case 'active':
        return (
          <span 
            id={id}
            className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> Active
          </span>
        );
      case 'completed':
        return (
          <span 
            id={id}
            className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Completed
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span 
            id={id}
            className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-rose-50 text-rose-800 border border-rose-200/80 flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <XCircle className="w-2.5 h-2.5 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleMessageUser = (listingId: string) => {
    const item = services.find(s => s.id === listingId);
    if (item) {
      startConversationWithListing(item);
    } else {
      setActiveTab('inbox');
    }
  };

  const handleDeleteListing = (listingId: string) => {
    deleteServiceListing(listingId);
    setListingToDelete(null);
  };

  const handleToggleListingStatus = (item: ServiceListing) => {
    const newAvailable = item.available === false ? true : false;
    updateServiceListing({
      ...item,
      available: newAvailable
    });
  };

  // Local state for 4 tabs: listings, bookings, portfolio, wishlist
  const [localTab, setLocalTab] = useState<'listings' | 'bookings' | 'portfolio' | 'wishlist'>('listings');

  return (
    <div id="needly-profile-screen" className="min-h-full pb-28 space-y-4 bg-slate-50/70">
      
      {/* 1. GREEN HERO BANNER & PROFILE INFO */}
      <div 
        id="profile-hero-banner"
        className="relative bg-gradient-to-b from-teal-700 via-teal-800 to-emerald-900 text-white rounded-b-[2.25rem] sm:rounded-b-[2.75rem] shadow-xl pt-4 pb-6 px-4 sm:px-6 overflow-hidden"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none" />

        {/* Top App Bar inside banner */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-medium tracking-tight text-white drop-shadow-xs ml-2">
              Provider Profile
            </h1>
            {currentUser.isVerified && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/20 text-teal-100 border border-white/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-300" />
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Admin Dashboard Button (Only for authorized admin emails) */}
            {isAuthorizedAdmin && (
              <button
                id="open-admin-dashboard-btn"
                type="button"
                onClick={() => setShowAdminDashboard(true)}
                className="px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-medium text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                title="Needly Admin Management Portal"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-slate-900" />
                <span>Admin Portal</span>
              </button>
            )}

            {/* Settings button */}
            <button
              id="profile-open-settings-btn"
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white backdrop-blur-md border border-white/20 shadow-xs cursor-pointer"
              title="Open Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div id="profile-hero-user-info" className="relative z-10">
          <div className="flex items-center gap-4 ml-2">
            {/* Left: Profile Picture with Camera Action */}
            <div className="relative shrink-0">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-2 ring-white/95 shadow-md overflow-hidden bg-teal-900/40 cursor-pointer group"
                onClick={() => setShowChangePhotoModal(true)}
                title="Change Photo"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  referrerPolicy="no-referrer"
                />
              </div>

              <button
                id="profile-change-photo-btn"
                type="button"
                onClick={() => setShowChangePhotoModal(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-teal-800 shadow-md flex items-center justify-center ring-2 ring-teal-700 hover:bg-teal-50 active:scale-95 transition-all cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5 text-teal-700" />
              </button>
            </div>

            {/* Right: User Name, Email, Edit Profile */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-medium tracking-tight text-white truncate">
                  {currentUser.name}
                </h2>
                {currentUser.rating && (
                  <span className="flex items-center gap-0.5 text-xs text-amber-300 font-medium">
                    <Star className="w-3 h-3 fill-amber-300" /> {currentUser.rating}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-teal-100 font-normal">
                <Mail className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                <span className="truncate">
                  {currentUser.email || 'sayyedamaan2004@gmail.com'}
                </span>
              </div>

              <div className="pt-0.5 flex items-center gap-2">
                <button
                  id="profile-edit-details-btn"
                  type="button"
                  onClick={() => setShowEditProfileModal(true)}
                  className="px-2.5 py-1 text-[11px] font-normal text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3 h-3 text-teal-200" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION TABS (My Services, My Bookings, Portfolio Showcase, Saved) */}
      <div className="px-3 sm:px-6">
        <div 
          id="profile-section-navigation"
          className="max-w-md mx-auto grid grid-cols-4 gap-1.5 sm:gap-2"
        >
          {/* My Services */}
          <button
            type="button"
            onClick={() => setLocalTab('listings')}
            className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none text-center active:scale-[0.98] ${
              localTab === 'listings'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-[10px] sm:text-[11px] font-normal whitespace-nowrap">
              Services
            </span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
              localTab === 'listings' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {myServices.length}
            </span>
          </button>

          {/* My Bookings */}
          <button
            type="button"
            onClick={() => setLocalTab('bookings')}
            className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none text-center active:scale-[0.98] ${
              localTab === 'bookings'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-[10px] sm:text-[11px] font-normal whitespace-nowrap">
              Bookings
            </span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
              localTab === 'bookings' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {myServiceBookings.length}
            </span>
          </button>

          {/* Portfolio Showcase */}
          <button
            type="button"
            onClick={() => setLocalTab('portfolio')}
            className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none text-center active:scale-[0.98] ${
              localTab === 'portfolio'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px] sm:text-[11px] font-normal whitespace-nowrap">
              Portfolio
            </span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
              localTab === 'portfolio' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {(currentUser.portfolio || []).length}
            </span>
          </button>

          {/* Saved Services */}
          <button
            type="button"
            onClick={() => setLocalTab('wishlist')}
            className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none text-center active:scale-[0.98] ${
              localTab === 'wishlist'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span className="text-[10px] sm:text-[11px] font-normal whitespace-nowrap">
              Saved
            </span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
              localTab === 'wishlist' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {wishlistedServices.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. ACTIVE SECTION BODY */}
      <div className="px-4 sm:px-6">
        <AnimatePresence mode="wait">
          
          {/* SECTION 1: MY SERVICES */}
          {localTab === 'listings' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Services Offered by You ({myServices.length})
                </h3>
                <button
                  onClick={() => setActiveTab('create')}
                  className="text-xs text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Offer New</span>
                </button>
              </div>

              {myServices.length === 0 ? (
                <div className="py-14 px-4 bg-white rounded-3xl border border-slate-200/80 text-center text-slate-400 space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
                    <Briefcase className="w-6 h-6 stroke-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">No services listed yet</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Offer your cleaning, photography, tutoring, fitness training, or technical skills to neighbors in Udaipur.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-medium rounded-xl shadow-md cursor-pointer transition-all active:scale-95 inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>List a Service</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {myServices.map((item) => (
                    <div
                      key={item.id}
                      id={`listing-item-${item.id}`}
                      className={`p-3.5 bg-white rounded-2xl border transition-all shadow-2xs ${
                        item.available === false 
                          ? 'border-amber-200/80 bg-amber-50/15' 
                          : 'border-slate-200/80 hover:border-teal-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div 
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                          onClick={() => setSelectedListing(item)}
                        >
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0 shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-teal-50 text-teal-800 border border-teal-200/60 shrink-0">
                                {item.subcategory || getCategoryName(item.category)}
                              </span>
                            </div>
                            <h4 
                              className="text-xs sm:text-sm font-semibold text-slate-900 truncate leading-snug hover:text-teal-700 transition-colors"
                              title={item.title}
                            >
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 flex-wrap">
                              <span className="font-semibold text-emerald-700 whitespace-nowrap">
                                Starting ₹{item.startingPrice}/{item.unit}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch py-0.5 min-w-[76px] gap-2">
                          <div className="flex items-center gap-1">
                            {item.available !== false ? (
                              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                                Paused
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setListingToDelete(item);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleListingStatus(item);
                            }}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95 border ${
                              item.available !== false
                                ? 'text-amber-800 bg-amber-50 hover:bg-amber-100/80 active:bg-amber-100 border-amber-200/80'
                                : 'text-teal-800 bg-teal-50 hover:bg-teal-100/80 active:bg-teal-100 border-teal-200/80'
                            }`}
                          >
                            {item.available !== false ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                <span>Resume</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* SECTION 2: MY BOOKINGS */}
          {localTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className="space-y-3"
            >
              {/* Filter */}
              <div className="flex items-stretch gap-1 w-full overflow-x-auto no-scrollbar py-1">
                {BOOKING_FILTERS.map((st) => {
                  const isSelected = bookingStatusFilter === st.id;
                  const count = getFilterCount(st.id);
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setBookingStatusFilter(st.id)}
                      className={`px-2 py-1.5 rounded-xl text-center border shrink-0 flex-1 min-w-[60px] text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{st.label} ({count})</span>
                    </button>
                  );
                })}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="py-14 px-4 bg-white rounded-3xl border border-slate-200/80 text-center text-slate-400 space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
                    <Calendar className="w-6 h-6 stroke-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">No service bookings found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Discover and hire vetted service professionals right in your neighborhood.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-medium rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Browse Services
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredBookings.map((book) => {
                    const price = book.totalAmount ?? (book as any).agreedPrice ?? 0;
                    return (
                      <div
                        key={book.id}
                        className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-teal-300 transition-all"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={book.listingImage}
                              alt={book.listingTitle}
                              className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0 shadow-2xs"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                                {book.listingTitle}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{book.scheduledDate}</span>
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="font-semibold text-emerald-700">₹{price}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 truncate">{book.providerName}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-between self-stretch shrink-0 py-0.5 gap-2">
                            {getStatusBadge(book.status)}
                            <button
                              type="button"
                              onClick={() => handleMessageUser(book.listingId)}
                              className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                              <span>Chat</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* SECTION 3: PORTFOLIO SHOWCASE */}
          {localTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
            >
              <PortfolioManager />
            </motion.div>
          )}

          {/* SECTION 4: SAVED SERVICES */}
          {localTab === 'wishlist' && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className="space-y-3"
            >
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Saved Services ({wishlistedServices.length})
              </h3>

              {wishlistedServices.length === 0 ? (
                <div className="py-14 px-4 bg-white rounded-3xl border border-slate-200/80 text-center text-slate-400 space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                    <Heart className="w-6 h-6 stroke-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">No saved services</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Tap the heart icon on any local service to bookmark it for upcoming visits.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-medium rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Discover Services
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {wishlistedServices.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div 
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                          onClick={() => setSelectedListing(item)}
                        >
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0 shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 flex-wrap">
                              <span className="font-semibold text-emerald-700">
                                Starting ₹{item.startingPrice}/{item.unit}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">{item.providerName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(item.id);
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Heart className="w-4 h-4 fill-rose-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedListing(item)}
                            className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. MODALS & POPUPS */}
      {showEditProfileModal && (
        <EditProfileModal
          currentUser={currentUser}
          onSave={(updates) => updateCurrentUserProfile(updates)}
          onClose={() => setShowEditProfileModal(false)}
          onOpenChangePhoto={() => setShowChangePhotoModal(true)}
        />
      )}

      {showChangePhotoModal && (
        <ChangePhotoModal
          currentAvatar={currentUser.avatar}
          userName={currentUser.name}
          onSave={(newAvatarUrl) => updateCurrentUserProfile({ avatar: newAvatarUrl })}
          onClose={() => setShowChangePhotoModal(false)}
        />
      )}

      {showDeleteAccountModal && (
        <DeleteAccountModal
          currentUser={currentUser}
          onConfirmDelete={() => deleteAccount()}
          onClose={() => setShowDeleteAccountModal(false)}
        />
      )}

      {showPostNeed && (
        <PostNeedModal onClose={() => setShowPostNeed(false)} />
      )}

      {showSettingsModal && (
        <SettingsModal 
          onClose={() => setShowSettingsModal(false)} 
          onOpenEditProfile={() => {
            setShowSettingsModal(false);
            setShowEditProfileModal(true);
          }}
        />
      )}

      {/* Admin Dashboard Modal */}
      {showAdminDashboard && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}

      {/* Delete Service Confirmation Dialog */}
      <AnimatePresence>
        {listingToDelete && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            onClick={() => setListingToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-100 relative text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setListingToDelete(null)}
                className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border border-rose-100/80 flex items-center justify-center text-rose-600 mb-3 shadow-2xs">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-base font-medium text-slate-900">
                Delete Service Listing?
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed px-2">
                Are you sure you want to delete &ldquo;{listingToDelete.title}&rdquo;? This listing will be permanently removed from the community directory.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <button
                  type="button"
                  onClick={() => setListingToDelete(null)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteListing(listingToDelete.id)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
