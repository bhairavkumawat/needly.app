import React from 'react';
import { ArrowLeft, Heart, Trash2, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceListing } from '../../types';

export const WishlistModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { wishlist, services, toggleWishlist, openListing, t } = useApp();

  const wishlistedServices = services.filter(s => wishlist.includes(s.id));

  const handleItemClick = (item: ServiceListing) => {
    openListing(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/40 backdrop-blur-xs">
      <div 
        id="wishlist-screen-container"
        className="bg-white w-full max-w-lg h-full min-h-[100dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label={t('settings.back', 'Back')}
              className="p-2 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-slate-900">{t('wishlist.title', 'Saved Services')}</h2>
                {wishlistedServices.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-rose-100 text-rose-800 rounded-full">
                    {wishlistedServices.length}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Local services and talent you have saved for upcoming projects
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-slate-50/50">
          {wishlistedServices.length === 0 ? (
            <div className="py-24 text-center text-slate-400 space-y-3 px-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 flex items-center justify-center text-rose-400">
                <Heart className="w-7 h-7 stroke-1.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-slate-800">
                  Your saved services list is empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Tap the heart icon on any local service to bookmark it for quick access anytime.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-xl shadow-md shadow-teal-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            wishlistedServices.map((service) => (
              <div
                key={service.id}
                onClick={() => handleItemClick(service)}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 hover:shadow-md transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={service.images[0] || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=200&auto=format&fit=crop'}
                      alt={service.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -top-1 -left-1 px-1.5 py-0.5 bg-teal-800/90 backdrop-blur-xs text-white text-[9px] font-medium rounded-md uppercase tracking-wider">
                      Service
                    </span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h4 className="text-xs font-medium text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                      {service.title}
                    </h4>
                    <div className="text-[11px] font-semibold text-emerald-700">
                      Starting ₹{service.startingPrice} / {service.unit}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{service.serviceArea || service.location?.displayName || 'Udaipur'}</span>
                      <span>•</span>
                      <span>{service.providerRating ? `★ ${service.providerRating}` : 'New'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(service.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title={t('wishlist.remove', 'Remove')}
                    aria-label={t('wishlist.remove', 'Remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleItemClick(service)}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white text-xs font-medium rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
