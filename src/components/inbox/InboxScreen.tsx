import React, { useState, useMemo, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  X, 
  ChevronRight, 
  Package, 
  Wrench, 
  Star, 
  CheckCheck, 
  Clock,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Conversation } from '../../types';
import { useDragScroll } from '../../hooks/useDragScroll';
import { sortConversationsByRecent } from '../../utils/conversationUtils';

export const InboxScreen: React.FC = () => {
  const { 
    currentUser,
    conversations, 
    setSelectedConversation, 
    setActiveTab, 
    unreadMessagesCount,
    deleteConversation,
    t
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'product' | 'service'>('all');
  const [activeActionChat, setActiveActionChat] = useState<Conversation | null>(null);
  const [chatToDelete, setChatToDelete] = useState<Conversation | null>(null);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const filterPillsDragScroll = useDragScroll<HTMLDivElement>({ dragSpeed: 1.3 });

  // Long press refs
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressActiveRef = useRef<boolean>(false);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStart = (conv: Conversation, e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    isLongPressActiveRef.current = false;
    clearLongPressTimer();

    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch {}
      }
      setActiveActionChat(conv);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
    if (dx > 8 || dy > 8) {
      clearLongPressTimer();
    }
  };

  const handleTouchEnd = () => {
    clearLongPressTimer();
    // Keep flag true briefly so synthetic click event won't trigger chat opening
    setTimeout(() => {
      isLongPressActiveRef.current = false;
    }, 150);
  };

  const handleMouseDown = (conv: Conversation, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only main left click
    touchStartPosRef.current = { x: e.clientX, y: e.clientY };
    isLongPressActiveRef.current = false;
    clearLongPressTimer();

    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      setActiveActionChat(conv);
    }, 500);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!touchStartPosRef.current) return;
    const dx = Math.abs(e.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(e.clientY - touchStartPosRef.current.y);
    if (dx > 8 || dy > 8) {
      clearLongPressTimer();
    }
  };

  const handleMouseUp = () => {
    clearLongPressTimer();
    setTimeout(() => {
      isLongPressActiveRef.current = false;
    }, 150);
  };

  const handleContextMenu = (conv: Conversation, e: React.MouseEvent) => {
    e.preventDefault();
    clearLongPressTimer();
    isLongPressActiveRef.current = true;
    setActiveActionChat(conv);
    setTimeout(() => {
      isLongPressActiveRef.current = false;
    }, 150);
  };

  const handleChatClick = (conv: Conversation) => {
    if (isLongPressActiveRef.current) {
      return;
    }
    setSelectedConversation(conv);
  };

  // Helper to reliably check if a conversation has unread messages for the current user
  const isConvUnread = (conv: Conversation): boolean => {
    if ((conv.unreadCount || 0) > 0) return true;
    if (conv.messages && conv.messages.length > 0) {
      return conv.messages.some(m => {
        const isFromOther = !currentUser?.id || m.senderId !== currentUser.id;
        const isUnread = m.isRead === false || (m as any).read === false;
        return isFromOther && isUnread;
      });
    }
    return false;
  };

  const unreadConversationsCount = useMemo(() => {
    return conversations.filter(isConvUnread).length;
  }, [conversations, currentUser?.id]);

  const filteredConversations = useMemo(() => {
    const filtered = conversations.filter((conv) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          conv.otherUser.name.toLowerCase().includes(q) ||
          conv.listingTitle.toLowerCase().includes(q) ||
          conv.lastMessage.toLowerCase().includes(q) ||
          conv.messages.some(m => m.text.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Filter tabs
      if (filterType === 'unread') {
        if (!isConvUnread(conv)) return false;
      }
      if (filterType === 'product' && conv.itemType !== 'product') return false;
      if (filterType === 'service' && conv.itemType !== 'service') return false;

      return true;
    });

    // Ensure the most recent chat is always on top
    return sortConversationsByRecent(filtered);
  }, [conversations, searchQuery, filterType, currentUser?.id]);

  return (
    <div id="needly-inbox-screen" className="space-y-4 pb-20">
      {/* Top Banner / Heading */}
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-normal text-slate-900 leading-tight">
                {t('inbox.title', 'Inbox')}
              </h1>
              {unreadMessagesCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-medium bg-yellow-400 text-slate-900 rounded-full shadow-xs">
                  {unreadMessagesCount} {t('inbox.unread_badge', 'unread')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('inbox.subtitle', 'Direct chats with nearby owners & local service providers')}
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('inbox.search_placeholder', 'Search conversations, names, or items...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-100 border border-transparent focus:border-teal-500 focus:bg-white rounded-xl focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-slate-200 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills with drag scroll */}
        <div 
          {...filterPillsDragScroll.dragProps}
          className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 select-none cursor-grab active:cursor-grabbing ${
            filterPillsDragScroll.isDragging ? 'cursor-grabbing' : ''
          }`}
        >
          <button
            id="inbox-filter-all-btn"
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border select-none cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              filterType === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{t('inbox.filter_all', 'All')}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-semibold ${
              filterType === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {conversations.length}
            </span>
          </button>
          <button
            id="inbox-filter-unread-btn"
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border select-none cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              filterType === 'unread'
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs ring-1 ring-teal-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {unreadConversationsCount > 0 && filterType !== 'unread' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
            )}
            <span>{t('inbox.filter_unread', 'Unread')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-semibold transition-colors ${
                filterType === 'unread'
                  ? 'bg-white/20 text-white'
                  : unreadConversationsCount > 0
                    ? 'bg-amber-100 text-amber-900 border border-amber-200/80'
                    : 'bg-slate-100 text-slate-500'
              }`}
            >
              {unreadConversationsCount}
            </span>
          </button>
          <button
            id="inbox-filter-product-btn"
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setFilterType('product')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border flex items-center gap-1.5 select-none cursor-pointer active:scale-95 ${
              filterType === 'product'
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t('inbox.filter_products', 'Rentals')}</span>
          </button>
          <button
            id="inbox-filter-service-btn"
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setFilterType('service')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border flex items-center gap-1.5 select-none cursor-pointer active:scale-95 ${
              filterType === 'service'
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{t('inbox.filter_services', 'Services')}</span>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="px-4 space-y-2.5">
        {filteredConversations.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-normal text-slate-900">
                {filterType === 'unread'
                  ? 'No unread messages'
                  : searchQuery
                    ? 'No matching conversations'
                    : 'No messages here yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {filterType === 'unread'
                  ? "You're all caught up! There are no unread messages in your conversations."
                  : searchQuery
                    ? 'Try checking for typos or clear your search query to see all conversations.'
                    : 'Start a conversation by contacting an item owner or local service provider on the Home page.'}
              </p>
            </div>
            {filterType === 'unread' ? (
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                View All Conversations
              </button>
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-normal rounded-xl transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-normal rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Browse Listings Nearby
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const hasUnread = isConvUnread(conv);

            const displayUnreadCount = Math.max(
              conv.unreadCount || 0,
              (conv.messages || []).filter(m => (!m.isRead || (m as any).read === false) && m.senderId !== currentUser?.id).length
            );

            const fallbackAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80';
            const fallbackListingImage = conv.itemType === 'service'
              ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80'
              : 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=300&q=80';
            const listingPhoto = conv.listingImage || fallbackListingImage;
            const otherUser = conv.otherUser || {};
            const otherAvatar = otherUser.avatar || fallbackAvatar;
            const otherName = otherUser.name || 'Neighbor';
            const otherRating = otherUser.rating ?? 4.9;

            // Determine who sent the last message
            const lastMsg = (conv.messages && conv.messages.length > 0)
              ? conv.messages[conv.messages.length - 1]
              : null;
            const lastSenderId = lastMsg?.senderId || conv.lastMessageSenderId;
            const isLastMsgFromMe = Boolean(lastSenderId && lastSenderId === currentUser?.id);
            const isLastMsgSeen = lastMsg ? Boolean(lastMsg.isRead) : false;

            let senderPrefix = '';
            if (lastSenderId) {
              if (isLastMsgFromMe) {
                senderPrefix = 'You: ';
              } else {
                senderPrefix = `${otherName}: `;
              }
            }

            return (
              <div
                key={conv.id}
                id={`conversation-item-${conv.id}`}
                onClick={() => handleChatClick(conv)}
                onTouchStart={(e) => handleTouchStart(conv, e)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onMouseDown={(e) => handleMouseDown(conv, e)}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={(e) => handleContextMenu(conv, e)}
                title="Tap to open, or press & hold for options"
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group select-none ${
                  hasUnread
                    ? 'bg-amber-50/40 border-amber-300/80 hover:border-amber-400 shadow-xs ring-1 ring-amber-400/20'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Product/Service Photo (Primary) & User Avatar (Corner Badge) */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={listingPhoto}
                      alt={conv.listingTitle}
                      className={`w-13 h-13 rounded-2xl object-cover border shadow-xs bg-slate-100 ${
                        hasUnread ? 'border-amber-300 ring-1 ring-amber-400/30' : 'border-slate-200'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src={otherAvatar}
                      alt={otherName}
                      className="w-6 h-6 rounded-full object-cover absolute -bottom-1 -right-1 ring-2 ring-white border border-slate-300 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Conversation Meta - Product/Service highlighted as main title */}
                  <div className="min-w-0 space-y-0.5">
                    {/* Primary Row: Product/Service Title */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {hasUnread && (
                        <span 
                          className="w-2 h-2 rounded-full bg-yellow-400 ring-1 ring-yellow-500/30 shrink-0 inline-block" 
                          title="Unread message"
                        />
                      )}
                      <h3 className={`text-xs truncate ${hasUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>
                        {conv.listingTitle}
                      </h3>
                      {conv.listingPrice && (
                        <span className="text-[10px] text-slate-400 font-normal shrink-0">
                          • {conv.listingPrice}
                        </span>
                      )}
                    </div>

                    {/* Secondary Row: User Name & Rating */}
                    <div className="flex items-center gap-1 text-[11px] font-normal text-teal-700 truncate">
                      <span className="truncate font-medium">{otherName}</span>
                      <div className="flex items-center gap-0.5 text-[10px] text-amber-500 font-normal shrink-0">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{otherRating}</span>
                      </div>
                    </div>

                    <p className={`text-xs truncate leading-snug ${
                      hasUnread ? 'font-medium text-slate-900' : 'text-slate-500'
                    }`}>
                      {senderPrefix && (
                        <span className={hasUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}>
                          {senderPrefix}
                        </span>
                      )}
                      <span>{conv.lastMessage || 'No messages yet'}</span>
                    </p>
                  </div>
                </div>

                {/* Right Meta (Time, Unread Badge, Tick, Arrow) */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
                  <span className={`text-[10px] ${hasUnread ? 'font-semibold text-amber-700' : 'text-slate-400'}`}>
                    {conv.lastMessageTime}
                  </span>

                  <div className="flex items-center gap-1">
                    {hasUnread ? (
                      <span className="px-2 py-0.5 bg-yellow-400 text-slate-900 text-[10px] font-semibold rounded-full shadow-xs">
                        {displayUnreadCount > 0 ? displayUnreadCount : 1}
                      </span>
                    ) : isLastMsgFromMe ? (
                      <span 
                        id={`msg-status-tick-${conv.id}`}
                        title={isLastMsgSeen ? 'Seen' : 'Sent, not seen yet'}
                        className="inline-flex items-center"
                      >
                        <CheckCheck 
                          className={`w-3.5 h-3.5 transition-colors duration-150 ${
                            isLastMsgSeen ? 'text-green-700' : 'text-slate-400'
                          }`} 
                        />
                      </span>
                    ) : null}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Long-Press Action Sheet / Options Modal */}
      {activeActionChat && (
        <div 
          id="chat-actions-overlay"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveActionChat(null)}
        >
          <div 
            id="chat-actions-sheet"
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Small drag bar for mobile */}
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto sm:hidden" />

            {/* Chat preview */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="relative shrink-0">
                <img 
                  src={activeActionChat.listingImage || (activeActionChat.itemType === 'service'
                    ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80'
                    : 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=300&q=80')}
                  alt={activeActionChat.listingTitle || 'Listing'}
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                  referrerPolicy="no-referrer"
                />
                <img
                  src={activeActionChat.otherUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80'}
                  alt={activeActionChat.otherUser?.name || 'Neighbor'}
                  className="w-4.5 h-4.5 rounded-full object-cover absolute -bottom-1 -right-1 ring-2 ring-white border border-slate-300 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-normal text-slate-900 truncate">
                  {activeActionChat.listingTitle}
                </h3>
                <p className="text-xs text-teal-700 font-normal truncate">
                  {activeActionChat.otherUser?.name || 'Neighbor'}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {activeActionChat.lastMessage}
                </p>
              </div>
            </div>

            {/* Actions list */}
            <div className="space-y-2">
              <button
                id="action-sheet-delete-chat-btn"
                type="button"
                onClick={() => {
                  const targetChat = activeActionChat;
                  setActiveActionChat(null);
                  setChatToDelete(targetChat);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-normal text-xs flex items-center justify-center gap-2 border border-rose-200/70 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Chat</span>
              </button>

              <button
                id="action-sheet-cancel-btn"
                type="button"
                onClick={() => setActiveActionChat(null)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-normal text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Delete Selected Chat */}
      {chatToDelete && (
        <div 
          id="delete-chat-confirm-overlay" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => !isDeletingChat && setChatToDelete(null)}
        >
          <div 
            id="delete-chat-confirm-dialog"
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-normal text-slate-900">
                Delete Chat?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove this conversation with <span className="font-normal text-slate-800">{chatToDelete.otherUser?.name || 'this neighbor'}</span> from your inbox? This will delete the chat only for you — the other user will still keep their conversation.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                id="cancel-delete-single-chat-btn"
                type="button"
                disabled={isDeletingChat}
                onClick={() => setChatToDelete(null)}
                className="flex-1 py-2.5 px-4 text-xs font-normal text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-single-chat-btn"
                type="button"
                disabled={isDeletingChat}
                onClick={async () => {
                  setIsDeletingChat(true);
                  try {
                    await deleteConversation(chatToDelete.id);
                    setChatToDelete(null);
                  } finally {
                    setIsDeletingChat(false);
                  }
                }}
                className="flex-1 py-2.5 px-4 text-xs font-normal text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeletingChat ? (
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isDeletingChat ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
