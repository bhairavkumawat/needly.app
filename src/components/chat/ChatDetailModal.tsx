import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Send, 
  MapPin, 
  Star, 
  ExternalLink, 
  CheckCheck, 
  Sparkles, 
  Phone, 
  ShieldCheck,
  Lock,
  Clock,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Conversation, Message, ListingItem, RentalRequest, ServiceBooking } from '../../types';
import { useDragScroll } from '../../hooks/useDragScroll';
import { BookingFlowCard } from '../common/BookingFlowCard';
import { markConversationAsReadInSupabase, markMessagesAsReadInSupabase } from '../../services/supabaseService';
import { realtimeSync } from '../../services/realtimeSync';

export const ChatDetailModal: React.FC<{
  conversation: Conversation;
  onClose: () => void;
}> = ({ conversation, onClose }) => {
  const { currentUser, sendMessage, setSelectedListing, products, services, requests, bookings, conversations } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const promptDragScroll = useDragScroll<HTMLDivElement>({ dragSpeed: 1.3 });

  const liveConv = conversations.find(c => c.id === conversation?.id) || conversation;
  const messagesList = Array.isArray(liveConv?.messages) ? liveConv.messages : [];

  // Mark all messages as read upon opening this chat
  useEffect(() => {
    if (conversation?.id && currentUser?.id) {
      markConversationAsReadInSupabase(conversation.id);
      markMessagesAsReadInSupabase(conversation.id, currentUser.id);
      realtimeSync.broadcast({
        type: 'MESSAGES_READ',
        conversationId: conversation.id,
        readerId: currentUser.id
      });
    }
  }, [conversation?.id, currentUser?.id]);

  // Keep incoming messages read while chat is open
  useEffect(() => {
    if (conversation?.id && currentUser?.id) {
      const hasUnread = messagesList.some(m => !m.isRead && m.senderId !== currentUser.id);
      if (hasUnread) {
        markConversationAsReadInSupabase(conversation.id);
        markMessagesAsReadInSupabase(conversation.id, currentUser.id);
        realtimeSync.broadcast({
          type: 'MESSAGES_READ',
          conversationId: conversation.id,
          readerId: currentUser.id
        });
      }
    }
  }, [conversation?.id, currentUser?.id, messagesList]);

  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80';

  // Defensive extraction for otherUser and its attributes
  const otherUser = conversation?.otherUser;
  const safeAvatar = (otherUser && typeof otherUser === 'object' && otherUser.avatar) 
    ? otherUser.avatar 
    : DEFAULT_AVATAR;
  const safeName = (otherUser && typeof otherUser === 'object' && otherUser.name) 
    ? otherUser.name 
    : 'Neighbor';
  const safeRating = (otherUser && typeof otherUser === 'object' && typeof otherUser.rating === 'number') 
    ? otherUser.rating 
    : 4.9;
  const safeUserId = (otherUser && typeof otherUser === 'object' && otherUser.id)
    ? otherUser.id
    : (conversation?.participantIds?.find(id => id && id !== currentUser?.id) || 'neighbor');

  // Find related rental request or service booking for this conversation thread
  const relatedBooking = useMemo(() => {
    if (!conversation?.listingId) return null;

    // 1. Check rental requests
    const matchedRequest = requests.find(r => 
      r.listingId === conversation.listingId &&
      ((r.renterId === currentUser.id && r.ownerId === safeUserId) ||
       (r.ownerId === currentUser.id && r.renterId === safeUserId))
    );
    if (matchedRequest) {
      return { item: matchedRequest, isService: false };
    }

    // 2. Check service bookings
    const matchedBooking = bookings.find(b =>
      b.listingId === conversation.listingId &&
      ((b.customerId === currentUser.id && b.providerId === safeUserId) ||
       (b.providerId === currentUser.id && b.customerId === safeUserId))
    );
    if (matchedBooking) {
      return { item: matchedBooking, isService: true };
    }

    return null;
  }, [conversation?.listingId, safeUserId, currentUser.id, requests, bookings]);

  const bookingStatus = relatedBooking?.item.status;
  const isPending = Boolean(relatedBooking && bookingStatus === 'pending');
  const isDeclined = Boolean(relatedBooking && (bookingStatus === 'rejected' || bookingStatus === 'cancelled'));
  const isChatActive = !isPending && !isDeclined;

  const isOwner = Boolean(
    relatedBooking &&
    (relatedBooking.isService
      ? (relatedBooking.item as ServiceBooking).providerId === currentUser.id
      : (relatedBooking.item as RentalRequest).ownerId === currentUser.id)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesList.length]);

  if (!conversation) {
    return null;
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChatActive) return;
    if (!inputText.trim() || !conversation?.id) return;
    sendMessage(conversation.id, inputText.trim());
    setInputText('');
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!isChatActive) return;
    if (!conversation?.id) return;
    sendMessage(conversation.id, prompt);
  };

  const handleViewListing = () => {
    const listingId = conversation.listingId;
    let item: ListingItem | undefined = products.find(p => p.id === listingId);
    if (!item) {
      item = services.find(s => s.id === listingId);
    }
    if (!item && conversation.itemType === 'product') {
      item = products.find(p => p.title?.toLowerCase() === conversation.listingTitle?.toLowerCase());
    } else if (!item && conversation.itemType === 'service') {
      item = services.find(s => s.title?.toLowerCase() === conversation.listingTitle?.toLowerCase());
    }

    // Fallback if deleted or custom
    if (!item) {
      if (conversation.itemType === 'service') {
        item = {
          id: conversation.listingId || 'service_item',
          type: 'service',
          title: conversation.listingTitle || 'Service',
          category: 'home',
          description: `Service listing for ${conversation.listingTitle || 'Service'}.`,
          images: [conversation.listingImage || DEFAULT_AVATAR],
          providerId: safeUserId,
          providerName: safeName,
          providerAvatar: safeAvatar,
          providerRating: safeRating,
          providerReviewCount: 12,
          isProviderVerified: true,
          startingPrice: 499,
          unit: 'visit',
          serviceArea: 'Udaipur & nearby',
          available: true,
          skills: ['Verified', 'Experienced', 'Local'],
          packages: [{ name: 'Standard Service', price: 499, description: 'Standard visit' }],
          createdAt: '2026-08-20',
          jobsCompleted: 15,
          distanceKm: 1.2
        };
      } else {
        item = {
          id: conversation.listingId || 'product_item',
          type: 'product',
          title: conversation.listingTitle || 'Item for Rent',
          category: 'electronics',
          description: `Product listing for ${conversation.listingTitle || 'Item'}.`,
          images: [conversation.listingImage || DEFAULT_AVATAR],
          ownerId: safeUserId,
          ownerName: safeName,
          ownerAvatar: safeAvatar,
          ownerRating: safeRating,
          ownerReviewCount: 14,
          isOwnerVerified: true,
          pricePerUnit: 350,
          unit: 'day',
          securityDeposit: 500,
          location: currentUser?.location || 'Local Area',
          condition: 'excellent',
          available: true,
          features: ['Tested & working', 'Complete accessories'],
          rules: ['Return in original condition', 'ID verification required'],
          createdAt: '2026-08-20',
          timesRented: 8,
          distanceKm: 1.2
        };
      }
    }

    if (item) {
      setSelectedListing(item);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/40 backdrop-blur-xs">
      <div 
        id="chat-screen-container"
        className="bg-white w-full max-w-lg h-full min-h-[100dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              aria-label="Back"
              className="p-1.5 -ml-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src={safeAvatar}
              alt={safeName}
              className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-normal truncate">{safeName}</h3>
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-300">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                <span>{safeRating}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block ml-1"></span>
                <span>Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Listing Context Ribbon */}
        <div 
          onClick={handleViewListing}
          className="px-3.5 py-2.5 bg-teal-50 border-b border-teal-100 flex items-center justify-between gap-3 cursor-pointer hover:bg-teal-100/70 transition-colors shrink-0 shadow-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {conversation.listingImage && (
              <img
                src={conversation.listingImage}
                alt={conversation.listingTitle || 'Listing'}
                className="w-9 h-9 rounded-lg object-cover border border-teal-200 shrink-0"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="min-w-0">
              <h4 className="text-[11px] font-normal text-slate-900 truncate">
                {conversation.listingTitle || 'Chat Conversation'}
              </h4>
              <div className="text-[10px] font-normal text-teal-700">
                {conversation.listingPrice || ''}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-normal text-teal-700 bg-white px-2 py-1 rounded-md border border-teal-200 flex items-center gap-0.5 shrink-0 shadow-xs">
            View Listing <ExternalLink className="w-3 h-3" />
          </span>
        </div>

        {/* Minimal, Clean, Aesthetic Booking Flow & OTP Bar */}
        {relatedBooking && (
          <div className="px-3 py-2 bg-slate-50/60 border-b border-slate-200/70 shrink-0">
            <BookingFlowCard
              booking={relatedBooking.item}
              isService={relatedBooking.isService}
              compact={true}
            />
          </div>
        )}

        {/* Messages Stream */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-slate-50">
          <div className="text-center my-1">
            <span className="text-[10px] font-normal text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs">
              🔒 End-to-End Encrypted Hyperlocal Chat
            </span>
          </div>

          {messagesList.length === 0 && (
            <div className="py-10 flex flex-col items-center justify-center text-center px-4 space-y-2 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <MessageSquare className="w-6 h-6 stroke-[1.8]" />
              </div>
              <p className="text-xs font-normal text-slate-700">Direct conversation with {safeName}</p>
              <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                Type your message below to inquire about this listing, check availability, or discuss pickup details.
              </p>
            </div>
          )}

          {messagesList.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                    isMe
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs shadow-sm font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {msg.text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return (
                        <strong key={i} className={`font-normal ${isMe ? 'text-amber-200' : 'text-teal-700'}`}>
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    return part;
                  })}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <span 
                      id={`msg-status-tick-${msg.id}`}
                      title={msg.isRead ? 'Seen' : 'Sent, not seen yet'}
                      className="inline-flex items-center"
                    >
                      <CheckCheck 
                        className={`w-3.5 h-3.5 transition-colors duration-150 ${
                          msg.isRead ? 'text-green-700' : 'text-slate-400'
                        }`} 
                      />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Prompts (Only available when chat is active) */}
        {isChatActive && (
          <div 
            {...promptDragScroll.dragProps}
            className={`px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none cursor-grab active:cursor-grabbing ${
              promptDragScroll.isDragging ? 'cursor-grabbing' : ''
            }`}
          >
            {[
              'Is this available tomorrow?',
              'Can I pick it up at 10 AM?',
              'Do you provide delivery?',
              'What is the security deposit?'
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt)}
                className="text-[11px] font-normal text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 px-3 py-1.5 rounded-xl shrink-0 border border-slate-200 transition-colors select-none active:scale-95 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Chat Lock Banner when pending or declined */}
        {!isChatActive && (
          <div className={`px-4 py-2 border-t flex items-center gap-2 text-xs shrink-0 ${
            isPending 
              ? 'bg-amber-50/90 border-amber-200 text-amber-900' 
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            {isPending ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-medium">
                  {isOwner 
                    ? 'Accept the booking request above to enable real-time chat.' 
                    : `Chat will activate automatically once ${safeName} accepts your request.`}
                </span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="font-medium">Booking request was closed. Chat messaging is unavailable.</span>
              </>
            )}
          </div>
        )}

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            disabled={!isChatActive}
            placeholder={
              !isChatActive 
                ? (isPending ? (isOwner ? 'Accept request above to chat...' : 'Awaiting owner acceptance...') : 'Chat messaging closed') 
                : 'Type a message to discuss rental...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-slate-100 border border-transparent focus:border-teal-500 focus:bg-white rounded-xl focus:outline-none transition-colors text-slate-900 disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isChatActive || !inputText.trim()}
            className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 disabled:opacity-40 text-white rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
