import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Heart, 
  ShieldCheck, 
  Calendar, 
  IndianRupee, 
  Check, 
  Clock, 
  AlertCircle,
  Share2,
  ChevronRight,
  Trash2,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductListing } from '../../types';
import { getCategoryName } from '../../data/categories';
import { LocationMapBox } from '../common/LocationMapBox';
import { ListingImageGallery } from '../common/ListingImageGallery';
import { EditListingModal } from './EditListingModal';
import { serverTimeService } from '../../services/serverTimeService';

export const ProductDetailModal: React.FC<{
  product: ProductListing;
  onClose: () => void;
}> = ({ product, onClose }) => {
  const { 
    currentUser, 
    products,
    requests,
    requestRental, 
    updateRequestStatus,
    deleteProductListing,
    toggleWishlist, 
    isWishlisted, 
    startConversationWithListing,
    setActiveTab,
    t
  } = useApp();

  const activeProduct = products.find(p => p.id === product.id) || product;

  // Check if current user has an active ongoing rental request for this product
  // Auto-expires when 48 hours are completed and restores normal action button
  const activeRequest = requests.find(
    r => (r.listingId === activeProduct.id || r.listingId === product.id) &&
         r.renterId === currentUser.id &&
         r.status !== 'cancelled' &&
         r.status !== 'rejected' &&
         r.status !== 'completed' &&
         !serverTimeService.isRequestExpired(r.createdAt)
  );
  const isAlreadyRequested = Boolean(activeRequest);

  // Live ticker to ensure 48-hour timer updates every second and restores normal button immediately when 48h completes
  const [, setModalTimerTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setModalTimerTick(t => (t + 1) % 1000000), 1000);
    return () => clearInterval(id);
  }, []);

  const modalCountdown = activeRequest?.createdAt
    ? serverTimeService.formatRemainingCountdown(activeRequest.createdAt)
    : '48h';

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const isOwner = Boolean(
    currentUser?.id && 
    (currentUser.id === activeProduct.ownerId || currentUser.id === product.ownerId)
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
    setAcknowledgedTerms(false);
    setAckError(false);
    setShowBookingForm(true);
    scrollToBookingEnd();
  };
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [pickupType, setPickupType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acknowledgedTerms, setAcknowledgedTerms] = useState(false);
  const [ackError, setAckError] = useState(false);

  const wishlisted = isWishlisted(product.id);

  // Calculate days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(1, end.getTime() - start.getTime());
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalRent = product.pricePerUnit * diffDays;

  const handleRequestRental = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAlreadyRequested || isSubmitting) return;
    if (!acknowledgedTerms) {
      setAckError(true);
      return;
    }
    setAckError(false);
    setIsSubmitting(true);

    requestRental({
      listing: product,
      startDate,
      endDate,
      totalDays: diffDays,
      pickupPreference: pickupType,
      deliveryAddress: pickupType === 'delivery' ? deliveryAddress : undefined,
      customerNote: note.trim() || undefined,
      termsAcknowledged: true,
      autoRedirectToChat: true
    });

    setIsSubmitting(false);
    setShowBookingForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/40 backdrop-blur-xs">
      <div 
        id="product-detail-screen-container"
        className="relative bg-white w-full max-w-lg h-full min-h-[100dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Floating Top Bar (Back, Title & Wishlist) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
          <button
            onClick={onClose}
            aria-label="Back"
            className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-md text-slate-800 border border-white/70 hover:bg-white transition-all flex items-center justify-center shadow-md active:scale-95 pointer-events-auto cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label="Wishlist"
              className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-md text-slate-800 border border-white/70 hover:bg-white transition-all shadow-md active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scrollable Container (Image + Details scroll together) */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth">
          {/* Header Image Gallery with Swiping & Arrow Controls */}
          <ListingImageGallery
            images={activeProduct.images}
            title={activeProduct.title}
            aspectRatio="aspect-[16/10] sm:aspect-[16/11]"
            badge={
              <div className="w-[107px] h-[21px] bg-white/85 backdrop-blur-md rounded-full text-slate-900 flex items-center justify-center gap-1 shadow-md border border-white/70">
                <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                <span className="text-[11px] font-normal leading-none whitespace-nowrap">{activeProduct.distanceKm} kms away</span>
              </div>
            }
          />

          {/* Details & Description */}
          <div className="p-4 space-y-4 text-slate-800">
          {/* Title & Category */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-normal text-teal-600 uppercase tracking-wider text-[11px]">
                  {getCategoryName(activeProduct.category)}
                </span>
                {activeProduct.subcategory && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-normal border border-teal-200/60">
                    {activeProduct.subcategory}
                  </span>
                )}
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-normal capitalize shrink-0 border border-slate-200/60">
                Condition: {activeProduct.condition.replace('_', ' ')}
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-normal text-slate-900 leading-tight">
              {activeProduct.title}
            </h1>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{activeProduct.location?.displayName || activeProduct.location?.area || activeProduct.location?.city || 'Udaipur'}</span>
            </div>
          </div>

          {/* Pricing & Deposit Card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl shadow-sm">
            <div>
              <div className="text-[10px] font-normal text-teal-700 uppercase">Rental Rate</div>
              <div className="text-xl font-normal text-slate-900">
                ₹{activeProduct.pricePerUnit}
                <span className="text-xs font-medium text-slate-400">/{activeProduct.unit}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-normal text-slate-400 uppercase">Refundable Deposit</div>
              <div className="text-base font-normal text-slate-800">
                ₹{activeProduct.securityDeposit}
              </div>
              <div className="text-[10px] text-slate-400">Released on safe return</div>
            </div>
          </div>

          {/* Owner Profile Card */}
          <div className="p-3.5 bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeProduct.ownerAvatar}
                  alt={activeProduct.ownerName}
                  className="w-11 h-11 rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
                {activeProduct.isOwnerVerified && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-normal text-slate-900 flex items-center gap-1">
                  {activeProduct.ownerName}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                  <span className="font-normal text-slate-800">{activeProduct.ownerRating}</span>
                  <span>({activeProduct.ownerReviewCount} rentals)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="font-serif text-sm font-normal text-slate-900 tracking-tight">
              Product Overview
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeProduct.description}
            </p>
          </div>

          {/* Features */}
          {activeProduct.features && activeProduct.features.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-serif text-sm font-normal text-slate-900 tracking-tight">
                Included Features & Accessories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {activeProduct.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Handover rules */}
          {product.rules && product.rules.length > 0 && (
            <div className="space-y-1.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
              <div className="font-normal text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Owner Handover Guidelines
              </div>
              <ul className="list-disc list-inside text-amber-800/90 text-[11px] space-y-0.5">
                {product.rules.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Location Map Box */}
          <LocationMapBox
            location={product.location}
            title={product.title}
            itemType="product"
            distanceKm={product.distanceKm}
          />

          {/* Booking / Rental Request Panel */}
          {showBookingForm && (
            <form onSubmit={handleRequestRental} className="p-4 bg-slate-100 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-normal text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" /> Select Rental Dates
                </h4>
                <span className="text-xs font-normal text-teal-700">{diffDays} Day(s)</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-normal text-slate-500 uppercase block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-normal text-slate-500 uppercase block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Pickup vs Delivery */}
              <div>
                <label className="text-[10px] font-normal text-slate-500 uppercase block mb-1">
                  Handover Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPickupType('pickup')}
                    className={`py-1.5 text-xs font-normal rounded-xl border transition-all ${
                      pickupType === 'pickup' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Self Pickup (Near {product.location.area})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickupType('delivery')}
                    className={`py-1.5 text-xs font-normal rounded-xl border transition-all ${
                      pickupType === 'delivery' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Request Delivery
                  </button>
                </div>
              </div>

              {pickupType === 'delivery' && (
                <input
                  type="text"
                  placeholder="Enter delivery address..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              )}

              {/* Note to owner */}
              <div>
                <label className="text-[10px] font-normal text-slate-500 uppercase block mb-1">
                  Note to Owner (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Planning a rooftop shoot, will bring my own SD card"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Total Summary */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">Total Rent ({diffDays} days @ ₹{product.pricePerUnit}/day):</span>
                <span className="font-normal text-sm text-slate-900">₹{totalRent}</span>
              </div>

              {/* Rental Safety & Terms Acknowledgement */}
              <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Rental Safety &amp; Terms Acknowledgement</span>
                </div>

                <div className="space-y-1 text-[11px] text-teal-800/90 pl-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-teal-600 font-bold">•</span>
                    <span><strong>Handover OTP:</strong> Both parties must verify a 6-digit OTP in-person before handover.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-teal-600 font-bold">•</span>
                    <span><strong>Care &amp; Return:</strong> Keep in original working order and return by end date.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-teal-600 font-bold">•</span>
                    <span><strong>Deposit (₹{product.securityDeposit}):</strong> Held securely and released upon return verification.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-teal-600 font-bold">•</span>
                    <span><strong>48h Response:</strong> Auto-cancels if owner does not accept within 48 hours.</span>
                  </div>
                </div>

                <label className="flex items-start gap-2 pt-2 border-t border-teal-200/70 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acknowledgedTerms}
                    onChange={(e) => {
                      setAcknowledgedTerms(e.target.checked);
                      if (e.target.checked) setAckError(false);
                    }}
                    className="w-4 h-4 mt-0.5 rounded border-teal-300 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] text-teal-950 font-medium leading-snug">
                    I acknowledge the rental terms, in-person OTP verification, and deposit guidelines.
                  </span>
                </label>
                {ackError && (
                  <p className="text-[11px] text-rose-600 font-medium pl-6">
                    Please agree to the acknowledgement terms before submitting your request.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isAlreadyRequested}
                className={`w-full py-3 text-xs font-normal rounded-xl transition-all ${
                  isAlreadyRequested
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white shadow-md active:scale-98 cursor-pointer'
                }`}
              >
                {isAlreadyRequested
                  ? 'Requested'
                  : isSubmitting
                  ? 'Sending Request...'
                  : `Submit Rental Request (₹${totalRent})`}
              </button>
            </form>
          )}

          {/* Anchor to scroll smoothly to the end */}
          <div ref={bottomAnchorRef} className="h-4" />
          </div>
        </div>

        {/* Bottom Fixed Action Bar */}
        {!showBookingForm && (
          <div className="p-3.5 bg-white/90 backdrop-blur-xl border-t border-white/80 flex items-center justify-between gap-3 shrink-0 shadow-[0_-8px_20px_rgba(0,0,0,0.03)]">
            <div>
              <div className="text-[10px] text-slate-400 font-medium leading-none">Rental Price</div>
              <div className="text-lg font-normal text-slate-900 mt-0.5">
                ₹{activeProduct.pricePerUnit}
                <span className="text-xs font-normal text-slate-400">/{activeProduct.unit}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-[280px] sm:max-w-[320px]">
              {isOwner ? (
                <>
                  <button
                    id="edit-product-listing-btn"
                    onClick={() => setShowEditModal(true)}
                    className="flex-1 py-2.5 sm:py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-normal rounded-full shadow-md shadow-teal-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit listing</span>
                  </button>
                  <button
                    id="delete-product-listing-btn"
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
                    id="product-already-requested-btn"
                    disabled
                    title="Your rental request is currently active or pending review by the owner"
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
                  {activeRequest?.status === 'pending' && (
                    <button
                      id="product-cancel-request-btn"
                      type="button"
                      onClick={() => updateRequestStatus(activeRequest.id, 'cancelled')}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-medium cursor-pointer transition-colors py-0.5"
                    >
                      {t('details.cancel_request', 'Cancel Request')}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  id="request-to-rent-btn"
                  onClick={handleOpenBookingForm}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-500 hover:opacity-95 text-white text-xs sm:text-sm font-normal rounded-full shadow-lg shadow-teal-600/30 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request to Rent</span>
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
                <h3 className="text-base font-normal text-slate-900">Delete this listing?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete <span className="font-normal text-slate-900">&ldquo;{activeProduct.title}&rdquo;</span>? This listing will be immediately removed from the local marketplace.
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
                  id="confirm-delete-product-btn"
                  onClick={() => {
                    deleteProductListing(activeProduct.id);
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
            listing={activeProduct}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </div>
    </div>
  );
};
