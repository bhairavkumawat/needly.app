import React, { useState } from 'react';
import { ArrowLeft, Star, ShieldCheck, Sparkles, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ItemType } from '../../types';

export const ReviewModal: React.FC<{
  transactionId: string;
  listingTitle: string;
  targetUserId: string;
  itemType: ItemType;
  onClose: () => void;
}> = ({ transactionId, listingTitle, targetUserId, itemType, onClose }) => {
  const { currentUser, addReview } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview({
      transactionId,
      listingTitle,
      targetUserId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      rating,
      comment: comment.trim(),
      itemType,
      verifiedRental: true
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/40 backdrop-blur-xs">
      <div 
        id="review-screen-container"
        className="bg-white w-full max-w-lg h-full min-h-[100dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Mobile App Bar */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label="Back"
              className="p-2 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors active:scale-95 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-normal text-slate-900">Rate Your Experience</h2>
              <p className="text-[11px] text-slate-500 line-clamp-1">{listingTitle}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1 bg-slate-50/50">
          {/* Star Selector Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col items-center justify-center space-y-2">
            <span className="text-[11px] font-normal text-slate-400 uppercase tracking-wider">Tap to Rate</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-9 h-9 ${
                        active
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-normal text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {rating === 5 && 'Outstanding! 🌟'}
              {rating === 4 && 'Very Good 👍'}
              {rating === 3 && 'Average'}
              {rating === 2 && 'Below Expectations'}
              {rating === 1 && 'Poor Experience'}
            </span>
          </div>

          {/* Comment text */}
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700 block">
              Share details for the community
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Was the item in great condition? Was the owner prompt & polite? Will you rent again?"
              className="w-full px-4 py-3 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-teal-500 resize-none text-slate-800 shadow-xs leading-relaxed"
            />
          </div>

          {/* Verified tag notice */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3 text-emerald-900 text-[11px] shadow-xs">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>This review will be tagged as <strong>Verified Transaction</strong> on their community profile.</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!comment.trim()}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-normal rounded-xl shadow-lg shadow-teal-600/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Publish Review
          </button>
        </form>
      </div>
    </div>
  );
};
