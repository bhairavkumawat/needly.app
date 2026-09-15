import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Heart, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Check, 
  Briefcase,
  Layers,
  ChevronRight,
  Trash2,
  Edit3,
  ExternalLink,
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceListing } from '../../types';
import { getCategoryName } from '../../data/categories';
import { LocationMapBox } from '../common/LocationMapBox';
import { ListingImageGallery } from '../common/ListingImageGallery';
import { EditListingModal } from './EditListingModal';
import { serverTimeService } from '../../services/serverTimeService';
import { PublicProfileModal } from '../profile/PublicProfileModal';
import { ServiceTermsModal } from '../common/ServiceTermsModal';
import { shareServiceListing } from '../../utils/shareUtils';

export const ServiceDetailModal: React.FC<{
  service: ServiceListing;
  onClose: () => void;
  isPublicPage?: boolean;
}> = ({ service, onClose, isPublicPage = false }) => {
  const { 
    currentUser, 
    allProfiles,
    services,
    bookings,
    currentLocation, 
    bookService, 
    updateBookingStatus,
    deleteServiceListing,
    toggleWishlist, 
    isWishlisted, 
    startConversationWithListing,
    setActiveTab,
    hasCompletedOnboarding,
    setShowOnboarding,
    t
  } = useApp();

  const activeService = services.find(s => s.id === service.id) || service;
  const providerProfile = (allProfiles || []).find(p => p.id === activeService.providerId);
  const portfolioItems = (activeService.portfolio && activeService.portfolio.length > 0)
    ? activeService.portfolio
    : (providerProfile?.portfolio || []);

  const [shareToast, setShareToast] = useState<string | null>(null);

  const handleShare = async () => {
    const res = await shareServiceListing(activeService);
    if (res.message) {
      setShareToast(res.message);
      setTimeout(() => setShareToast(null), 3000);
    }
  };

  const handleClose = () => {
    onClose();
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/service/')) {
      window.history.pushState({}, '', '/');
    }
  };

  // Check if current user has an active ongoing service booking for this service
  // Auto-expires when 48 hours are completed and restores normal action button
  const activeBooking = bookings.find(
    b => (b.listingId === activeService.id || b.listingId === service.id) &&
         b.customerId === currentUser.id &&
         b.status !== 'cancelled' &&
         b.status !== 'rejected' &&
         b.status !== 'completed' &&
         !serverTimeService.isRequestExpired(b.createdAt)
  );
  const isAlreadyRequested = Boolean(activeBooking);

  // Live ticker to ensure 48-hour timer updates every second and restores normal button immediately when 48h completes
  const [, setModalTimerTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setModalTimerTick(t => (t + 1) % 1000000), 1000);
    return () => clearInterval(id);
  }, []);

  const modalCountdown = activeBooking?.createdAt
    ? serverTimeService.formatRemainingCountdown(activeBooking.createdAt)
    : '48h';

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPublicProfile, setShowPublicProfile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const isOwner = Boolean(
    currentUser?.id && 
    (currentUser.id === activeService.providerId || currentUser.id === service.providerId)
  );

  const scrollToBookingEnd = () => {
    // Smoothly scroll container to the bottom so booking form is fully visible
    setTimeout(() => {
      bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 60);
  };

  useEffect(() => {
    if (showBookingForm) {
      scrollToBookingEnd();
    }
  }, [showBookingForm]);

  useEffect(() => {
    if (isAlreadyRequested && showBookingForm) {
      setShowBookingForm(false);
    }
  }, [isAlreadyRequested, showBookingForm]);

  const handleOpenBookingForm = () => {
    if (isAlreadyRequested) return;
    if (!hasCompletedOnboarding || !currentUser?.id) {
      setShowOnboarding(true);
      return;
    }
    setAcknowledgedTerms(false);
    setAckError(false);
    setShowBookingForm(true);
    scrollToBookingEnd();
  };
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [address, setAddress] = useState(`Flat 302, Lakeview Enclave, ${currentLocation.area || currentLocation.city}`);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acknowledgedTerms, setAcknowledgedTerms] = useState(false);
  const [ackError, setAckError] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const wishlisted = isWishlisted(service.id);

  const selectedPackage = service.packages ? service.packages[selectedPkgIndex] : null;
  const currentPrice = selectedPackage ? selectedPackage.price : service.startingPrice;

  const handleBookService = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAlreadyRequested || isSubmitting) return;
    if (!hasCompletedOnboarding || !currentUser?.id) {
      setShowOnboarding(true);
      return;
    }
    if (!acknowledgedTerms) {
      setAckError(true);
      return;
    }
    setAckError(false);
    setIsSubmitting(true);

    bookService({
      listing: service,
      scheduledDate,
      scheduledTime,
      packageId: selectedPackage?.id,
      packageName: selectedPackage?.name,
      packagePrice: selectedPackage?.price,
      totalAmount: currentPrice,
      serviceAddress: address.trim() || currentLocation.displayName,
      customerNotes: notes.trim() || undefined,
      termsAcknowledged: true,
      termsVersion: 'service_request_terms_v1',
      autoRedirectToChat: true
    });

    setIsSubmitting(false);
    setShowBookingForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/40 backdrop-blur-xs">
      <div 
        id="service-detail-screen-container"
        className="relative bg-white w-full max-w-lg h-full min-h-[100dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Floating Share Toast Notification */}
        {shareToast && (
          <div 
            id="service-share-toast"
            className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-slate-900/95 text-white text-xs font-medium rounded-full shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2 pointer-events-none border border-slate-700/50"
          >
            <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>{shareToast}</span>
          </div>
        )}

        {/* Floating Top Bar (Back, Wishlist, Share) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
          <button
            onClick={handleClose}
            aria-label="Back"
            className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-md text-slate-800 border border-white/70 hover:bg-white transition-all shadow-md active:scale-95 flex items-center justify-center pointer-events-auto cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Share Button */}
            <button
              id="share-service-btn"
              type="button"
              onClick={handleShare}
              aria-label="Share Service"
              title="Share service link"
              className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-md text-slate-800 border border-white/70 hover:bg-white transition-all shadow-md active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-700" />
            </button>

            <button
              onClick={() => toggleWishlist(service.id)}
              aria-label="Wishlist"
              className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-md text-slate-800 border border-white/70 hover:bg-white transition-all shadow-md active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scrollable Container (Image + Content scroll together) */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth">
          {/* Header Image Gallery with Swiping & Arrow Controls */}
          <ListingImageGallery
            images={activeService.images}
            title={activeService.title}
            aspectRatio="aspect-[16/10] sm:aspect-[16/11]"
            badge={
              <div className="w-[107px] h-[21px] bg-white/85 backdrop-blur-md rounded-full text-slate-900 flex items-center justify-center gap-1 shadow-md border border-white/70">
                <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                <span className="text-[11px] font-normal leading-none whitespace-nowrap">{activeService.distanceKm} kms away</span>
              </div>
            }
          />

          {/* Content */}
          <div className="p-4 space-y-4 text-slate-800">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-normal text-teal-600 uppercase tracking-wider text-[11px]">
                  {getCategoryName(activeService.category)}
                </span>
                {activeService.subcategory && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-normal border border-teal-200/60">
                    {activeService.subcategory}
                  </span>
                )}
              </div>

              {/* Share Action Badge */}
              <button
                id="share-service-action-btn"
                type="button"
                onClick={handleShare}
                aria-label="Share service"
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200/80 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 shrink-0"
              >
                <Share2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Share</span>
              </button>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-normal text-slate-900 leading-tight">
              {activeService.title}
            </h1>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{activeService.location?.displayName || activeService.location?.area || activeService.serviceArea || activeService.location?.city || 'Udaipur'}</span>
            </div>
          </div>

          {/* Provider card */}
          <div className="p-3.5 bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <img
                  src={activeService.providerAvatar}
                  alt={activeService.providerName}
                  className="w-11 h-11 rounded-2xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                {activeService.isProviderVerified && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1 truncate">
                  {activeService.providerName}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                  <span className="font-semibold text-slate-800">{activeService.providerRating}</span>
                  <span>({activeService.providerReviewCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* View Profile Action */}
            <button
              type="button"
              id="view-provider-profile-btn"
              onClick={() => setShowPublicProfile(true)}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-medium rounded-xl border border-teal-200/80 transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1 shadow-2xs"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h3 className="text-xs font-normal text-slate-900 uppercase tracking-wider">
              Service Scope
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeService.description}
            </p>
          </div>

          {/* Skills */}
          {activeService.skills && activeService.skills.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-normal text-slate-900 uppercase tracking-wider">
                Specializations
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {activeService.skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-teal-50 text-teal-800 text-[11px] font-normal rounded-lg border border-teal-100">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Packages */}
          {service.packages && service.packages.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-normal text-slate-900 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-600" /> Available Service Tiers
              </h3>
              <div className="space-y-2">
                {service.packages.map((pkg, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPkgIndex(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedPkgIndex === idx
                        ? 'bg-teal-50/80 border-teal-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-normal text-slate-900">{pkg.name}</h4>
                      <span className="text-xs font-normal text-teal-700">₹{pkg.price}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{pkg.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Showcase / Portfolio */}
          {portfolioItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-normal text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600" /> Work Showcase &amp; Portfolio
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {portfolioItems.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    {item.imageUrl && (
                      <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-200">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-medium text-slate-900 line-clamp-1">{item.title}</h4>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-teal-700 font-medium inline-flex items-center gap-1 hover:underline"
                      >
                        <span>View Proof</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Location & Coverage Map Box */}
          <LocationMapBox
            location={service.location}
            title={service.title}
            itemType="service"
            distanceKm={service.distanceKm}
          />

          {/* Booking Form Panel */}
          {showBookingForm && (
            <form onSubmit={handleBookService} className="p-4 bg-slate-100 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-normal text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" /> Appointment Details
                </h4>
                <span className="text-xs font-normal text-teal-700">₹{currentPrice}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-normal text-slate-500 uppercase block mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-normal text-slate-500 uppercase block mb-1">
                    Time Slot
                  </label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800"
                  >
                    <option value="09:00 AM">09:00 AM (Morning)</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM (Afternoon)</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="06:00 PM">06:00 PM (Evening)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-normal text-slate-500 uppercase block mb-1">
                  Service Address / Venue
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, flat/house number, landmark..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-normal text-slate-500 uppercase block mb-1">
                  Special Instructions
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please bring extra ladder or safety wire..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Selected Tier */}
              <div id="booking-selected-tier-card" className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-xs font-medium text-slate-900">
                      {selectedPackage ? selectedPackage.name : 'Standard Tier'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-teal-700">
                    ₹{currentPrice}
                  </span>
                </div>
                {selectedPackage?.description && (
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-5">
                    {selectedPackage.description}
                  </p>
                )}
              </div>

              {/* Service Request Terms & Conditions Acknowledgement (Mandatory) */}
              <div className="p-3 bg-teal-50/70 border border-teal-200/90 rounded-xl space-y-1.5">
                <label 
                  id="service-terms-acknowledgement-label"
                  className="flex items-start gap-2.5 cursor-pointer select-none"
                >
                  <input
                    id="service-terms-acknowledgement-checkbox"
                    type="checkbox"
                    checked={acknowledgedTerms}
                    onChange={(e) => {
                      setAcknowledgedTerms(e.target.checked);
                      if (e.target.checked) setAckError(false);
                    }}
                    className="w-4 h-4 mt-0.5 rounded border-teal-300 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0 accent-teal-600"
                  />
                  <span className="text-[11px] sm:text-xs text-teal-950 leading-relaxed">
                    I have read and agree to the Needly Service Request{' '}
                    <button
                      type="button"
                      id="open-service-terms-link"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowTermsModal(true);
                      }}
                      className="font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-2 cursor-pointer inline-flex items-center gap-0.5 hover:opacity-90"
                    >
                      Terms &amp; Conditions
                    </button>
                    .
                  </span>
                </label>

                {ackError && (
                  <p id="service-terms-ack-error" className="text-[11px] text-rose-600 font-medium pl-6">
                    You must actively agree to the Terms &amp; Conditions before sending your request.
                  </p>
                )}
              </div>

              {/* Send Request Button - Disabled until Terms Checkbox is Selected */}
              <button
                type="submit"
                id="send-service-request-btn"
                disabled={isSubmitting || isAlreadyRequested || !acknowledgedTerms}
                aria-disabled={isSubmitting || isAlreadyRequested || !acknowledgedTerms}
                className={`w-full py-3 text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isAlreadyRequested
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : !acknowledgedTerms
                    ? 'bg-slate-200 text-slate-400 border border-slate-300/80 cursor-not-allowed shadow-none select-none'
                    : isSubmitting
                    ? 'bg-teal-700 text-white cursor-wait'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white shadow-md active:scale-98 cursor-pointer'
                }`}
                title={!acknowledgedTerms ? 'Please accept the Terms & Conditions checkbox above to enable Send Request' : undefined}
              >
                {isAlreadyRequested
                  ? 'Requested'
                  : isSubmitting
                  ? 'Sending Request...'
                  : `Send Request (₹${currentPrice})`}
              </button>
            </form>
          )}

          {/* Anchor to scroll smoothly to the end */}
          <div ref={bottomAnchorRef} className="h-4" />
          </div>
        </div>

        {/* Bottom Action Bar */}
        {!showBookingForm && (
          <div className="p-3.5 bg-white/90 backdrop-blur-xl border-t border-white/80 flex items-center justify-between gap-3 shrink-0 shadow-[0_-8px_20px_rgba(0,0,0,0.03)]">
            <div>
              <div className="text-[10px] text-slate-400 font-medium leading-none">Starting Fee</div>
              <div className="text-lg font-normal text-slate-900 mt-0.5">
                ₹{currentPrice}
                <span className="text-xs font-normal text-slate-400">/{activeService.unit}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-[280px] sm:max-w-[320px]">
              {isOwner ? (
                <>
                  <button
                    id="edit-service-listing-btn"
                    onClick={() => setShowEditModal(true)}
                    className="flex-1 py-2.5 sm:py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-normal rounded-full shadow-md shadow-teal-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit listing</span>
                  </button>
                  <button
                    id="delete-service-listing-btn"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 py-2.5 sm:py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-normal rounded-full active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete listing</span>
                  </button>
                </>
              ) : isAlreadyRequested ? (
                <div className="w-full flex flex-col items-center gap-1.5">
                  <button
                    id="service-already-requested-btn"
                    disabled
                    title="Your service booking request is currently active or pending review by the provider"
                    className="w-full py-2 sm:py-2.5 bg-amber-50/90 text-amber-950 border border-amber-200/90 text-xs sm:text-sm font-medium rounded-full cursor-not-allowed flex items-center justify-center gap-2.5 shadow-none select-none"
                  >
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                    <span>{t('home.already_requested', 'Already Requested')}</span>
                    <span className="flex flex-col items-center justify-center leading-none bg-amber-200/80 border border-amber-300/70 px-2.5 py-1 rounded-md">
                      <span className="text-[11px] font-mono font-bold text-amber-950 tracking-tight">
                        {modalCountdown}
                      </span>
                      <span className="text-[8px] font-semibold text-amber-800 uppercase tracking-wider mt-0.5">
                        {t('details.remaining', 'Remaining')}
                      </span>
                    </span>
                  </button>
                  {activeBooking?.status === 'pending' && (
                    <button
                      id="service-cancel-request-btn"
                      type="button"
                      onClick={() => updateBookingStatus(activeBooking.id, 'cancelled')}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-medium cursor-pointer transition-colors py-0.5"
                    >
                      {t('details.cancel_request', 'Cancel Request')}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  id="book-service-btn"
                  onClick={handleOpenBookingForm}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-500 hover:opacity-95 text-white text-xs sm:text-sm font-normal rounded-full shadow-lg shadow-teal-600/30 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Service</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-100">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-base font-normal text-slate-900">Delete this service listing?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete <span className="font-normal text-slate-900">&ldquo;{activeService.title}&rdquo;</span>? This service will be immediately removed from the local marketplace.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-normal rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-delete-service-btn"
                  onClick={() => {
                    deleteServiceListing(activeService.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-normal rounded-xl shadow-md shadow-red-600/25 transition-all cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Listing Modal */}
        {showEditModal && (
          <EditListingModal
            listing={activeService}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
          />
        )}

        {/* Public Provider Profile Modal */}
        {showPublicProfile && (
          <PublicProfileModal
            userId={activeService.providerId}
            onClose={() => setShowPublicProfile(false)}
            onSelectService={(srv) => {
              setShowPublicProfile(false);
              // if selected different service, that service is opened
            }}
          />
        )}

        {/* Service Request Terms & Conditions Modal */}
        <ServiceTermsModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          onAccept={() => {
            setAcknowledgedTerms(true);
            setAckError(false);
          }}
          isAccepted={acknowledgedTerms}
        />
      </div>
    </div>
  );
};
