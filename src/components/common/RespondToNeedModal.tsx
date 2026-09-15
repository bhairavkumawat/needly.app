import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NeedPost } from '../../types';
import { getCategoryName } from '../../data/categories';

interface RespondToNeedModalProps {
  need: NeedPost;
  onClose: () => void;
}

export const RespondToNeedModal: React.FC<RespondToNeedModalProps> = ({ need, onClose }) => {
  const { respondToNeed, setActiveTab, t } = useApp();
  const [quotePrice, setQuotePrice] = useState<string>(need.budget ? Math.round(need.budget).toString() : '100');
  const [message, setMessage] = useState<string>('');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery' | 'onsite'>('pickup');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Math.floor(Number(quotePrice));
    if (isNaN(priceNum) || priceNum <= 0) return;

    setIsSubmitting(true);

    const methodLabels: Record<string, string> = {
      pickup: 'Self Pickup',
      delivery: 'Delivery',
      onsite: 'On-site Visit'
    };
    const methodLabel = methodLabels[fulfillmentMethod] || 'Self Pickup';

    const trimmedNote = message.trim();
    let formattedMessage = `Hi ${need.userName}! I can provide your request for "${need.title}" for **₹${priceNum}**.\nHandover/Service Method: ${methodLabel}`;
    if (trimmedNote) {
      formattedMessage += `\nNote: ${trimmedNote}`;
    }

    setTimeout(() => {
      respondToNeed(need, {
        quotePrice: priceNum,
        message: formattedMessage
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        onClose();
      }, 1100);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="respond-need-modal-container"
        className="bg-white w-full max-w-lg h-full min-h-[100dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label="Back"
              className="p-1.5 -ml-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h2 className="text-base font-normal">Fulfill Community Request</h2>
              </div>
              <p className="text-[11px] text-teal-100 mt-0.5">
                Send your quote &amp; start a direct conversation
              </p>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-50 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-normal text-slate-900">Offer Sent Successfully!</h3>
              <p className="text-xs text-slate-600 max-w-xs">
                Your proposal has been delivered to <span className="font-normal text-slate-900">{need.userName}</span>. Redirecting to chat...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-slate-800 bg-slate-50/50">
            {/* Need Summary Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-teal-200/80 shadow-xs space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={need.userAvatar}
                    alt={need.userName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-xs font-normal text-slate-900 flex items-center gap-1">
                      {need.userName}
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Needed by {need.neededDate}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-normal">Budget</div>
                  <div className="text-sm font-normal text-teal-700">₹{need.budget}</div>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-normal rounded-md">
                    {getCategoryName(need.category)}{need.subcategory ? ` • ${need.subcategory}` : ''}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {need.location.displayName}
                  </span>
                </div>
                <h4 className="text-xs font-normal text-slate-900 leading-tight">
                  {need.title}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-3 bg-slate-50 p-2 rounded-xl">
                  &ldquo;{need.description}&rdquo;
                </p>
              </div>
            </div>

            {/* Quote Price Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-normal text-slate-700">
                  {t('respond.offered_price', 'Your Offered Price (₹) *')}
                </label>
                <span className="text-[10px] text-slate-500">
                  {t('respond.requester_budget', "Requester's Budget")}: ₹{need.budget}
                </span>
              </div>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-normal bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900 shadow-xs"
                />
              </div>

              {/* Quick adjustment buttons */}
              <div className="flex items-center gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setQuotePrice(Math.round(need.budget).toString())}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-[10px] font-normal text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  Match Budget (₹{need.budget})
                </button>
                <button
                  type="button"
                  onClick={() => setQuotePrice(Math.max(1, Math.round(need.budget * 0.9)).toString())}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-[10px] font-normal text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  -10% Discount (₹{Math.max(1, Math.round(need.budget * 0.9))})
                </button>
                <button
                  type="button"
                  onClick={() => setQuotePrice(Math.round(need.budget * 1.1).toString())}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-[10px] font-normal text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  Premium +10% (₹{Math.round(need.budget * 1.1)})
                </button>
              </div>
            </div>

            {/* Handover / Service Mode */}
            <div>
              <label className="text-xs font-normal text-slate-700 block mb-1">
                {t('respond.handover_method', 'Handover / Service Method')}
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'pickup' as const, label: t('respond.self_pickup', 'Self Pickup') },
                  { id: 'delivery' as const, label: t('respond.delivery', 'Delivery') },
                  { id: 'onsite' as const, label: t('respond.onsite', 'On-site Visit') },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFulfillmentMethod(m.id)}
                    className={`py-2 text-[11px] font-normal rounded-lg transition-all cursor-pointer ${
                      fulfillmentMethod === m.id
                        ? 'bg-white text-teal-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message to Requester */}
            <div>
              <label className="text-xs font-normal text-slate-700 block mb-1">
                {t('respond.message_label', `Note / Message (Optional)`)}
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('respond.message_placeholder', 'Add any note or specifics about your offer...')}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 resize-none text-slate-800 shadow-xs"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !quotePrice || Number(quotePrice) <= 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-normal rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending Proposal...' : `${t('respond.send_offer', 'Send Offer')} (₹${quotePrice})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
