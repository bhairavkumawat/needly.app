import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  Package, 
  Wrench, 
  Sparkles, 
  Trash2, 
  ShieldCheck,
  Clock
} from 'lucide-react';
import { NeedPost } from '../../types';
import { useApp } from '../../context/AppContext';
import { getCategoryName } from '../../data/categories';
import { AnimatedCategoryIcon } from '../common/AnimatedCategoryIcon';

interface RequestDetailModalProps {
  need: NeedPost;
  onClose: () => void;
  onRespond: (need: NeedPost) => void;
  onToggleStatus: (needId: string) => void;
  onDelete: (needId: string) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  need,
  onClose,
  onRespond,
  onToggleStatus,
  onDelete,
}) => {
  const { currentUser, t } = useApp();
  const isMyNeed = need.userId === currentUser.id;
  const isFulfilled = need.status === 'fulfilled';

  const categoryName = getCategoryName(need.category);

  return (
    <div 
      id="request-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="request-detail-modal-window"
        className="bg-white w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200"
      >
        {/* Top Window Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 px-5 py-4 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-xl shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-[15px] font-normal text-white">
                {t('requests.detail_title', 'Request Details')}
              </h2>
              <p className="text-[10px] text-teal-100/80">
                {need.type === 'product' ? t('requests.product_request', 'Product Request') : t('requests.service_request', 'Service Request')}
              </p>
            </div>
          </div>

          <button
            id="close-request-detail-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 no-scrollbar flex-1">
          {/* Requester Profile Section */}
          <div 
            id="requester-profile-card"
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-xs ${
              isMyNeed
                ? 'bg-gradient-to-r from-teal-50/50 via-white to-slate-50/40 border-teal-200/80'
                : 'bg-white border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src={need.userAvatar}
                alt={need.userName}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 border shrink-0 ${
                  isMyNeed 
                    ? 'ring-teal-500/20 border-teal-300/80' 
                    : 'ring-slate-100 border-slate-200/70'
                }`}
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                    {need.userName}
                  </span>
                  {isMyNeed && (
                    <span className="px-1.5 py-0.5 bg-teal-100/80 text-teal-800 text-[10px] font-medium rounded-md border border-teal-200 shrink-0">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 min-w-0">
                  <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isMyNeed ? 'text-teal-600' : 'text-emerald-600'}`} />
                  <span className="truncate text-[11px]">
                    {isMyNeed ? 'Your Broadcast Request' : 'Verified Requester'}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 pl-1">
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1.5 whitespace-nowrap border ${
                isFulfilled
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : isMyNeed
                    ? 'bg-teal-50 text-teal-700 border-teal-200/80'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              }`}>
                {isFulfilled ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Fulfilled</span>
                  </>
                ) : (
                  <>
                    <span className={`w-1.5 h-1.5 rounded-full ${isMyNeed ? 'bg-teal-500' : 'bg-emerald-500'} animate-pulse shrink-0`} />
                    <span>Active</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Title and Category */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 text-[11px] font-normal rounded-lg flex items-center gap-1.5 ${
                need.type === 'product'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-blue-50 text-blue-700 border border-blue-200/60'
              }`}>
                {need.type === 'product' ? <Package className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                <span>{need.type === 'product' ? t('requests.product_request', 'Product Request') : t('requests.service_request', 'Service Request')}</span>
              </span>

              {categoryName && (
                <span className="px-2.5 py-1 text-[11px] font-normal rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center gap-1.5">
                  <AnimatedCategoryIcon categoryId={need.category} size="xs" />
                  <span>{categoryName}</span>
                </span>
              )}
            </div>

            <h3 className="text-[17px] font-normal text-slate-900 leading-snug">
              {need.title}
            </h3>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 block">Needed By Date</span>
                <span className="text-[11px] font-normal text-slate-800">{need.neededDate}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 block">Location</span>
                <span className="text-[11px] font-normal text-slate-800 line-clamp-1">{need.location.displayName}</span>
              </div>
            </div>

            {need.budget ? (
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Target Budget</span>
                  <span className="text-[11px] font-normal text-emerald-700">₹{need.budget}</span>
                </div>
              </div>
            ) : null}

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 block">Responses Received</span>
                <span className="text-[11px] font-normal text-slate-800">{need.responsesCount || 0} response(s)</span>
              </div>
            </div>
          </div>

          {/* Full Description Section */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-normal text-slate-500 uppercase tracking-wider">
              {t('requests.description', 'Description')}
            </h4>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {need.description || 'No additional description provided.'}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          {isMyNeed ? (
            <div className="w-full flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onDelete(need.id);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl text-[11px] font-normal text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Request</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleStatus(need.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-[11px] font-normal bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
              >
                {isFulfilled ? t('requests.reopen', 'Reopen Request') : t('requests.mark_fulfilled', 'Mark as Fulfilled')}
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[11px] font-normal text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRespond(need);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 active:scale-95 text-white text-[11px] font-normal rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('requests.i_can_provide', 'I Can Provide This')}</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
