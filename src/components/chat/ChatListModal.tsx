import React, { useMemo } from 'react';
import { ArrowLeft, MessageSquare, Star, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Conversation } from '../../types';
import { sortConversationsByRecent } from '../../utils/conversationUtils';

export const ChatListModal: React.FC<{
  onClose: () => void;
  onSelectConversation: (conv: Conversation) => void;
}> = ({ onClose, onSelectConversation }) => {
  const { conversations } = useApp();

  const sortedConversations = useMemo(() => {
    return sortConversationsByRecent(conversations);
  }, [conversations]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/40 backdrop-blur-xs">
      <div 
        id="chat-list-screen-container"
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
              <div className="flex items-center gap-2">
                <h2 className="text-base font-normal text-slate-900">Messages</h2>
                <span className="px-2 py-0.5 text-[10px] font-normal bg-teal-100 text-teal-800 rounded-full">
                  {conversations.length} Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Direct inquiries with local owners and providers</p>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 bg-slate-50/50">
          {conversations.length === 0 ? (
            <div className="py-24 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                <MessageSquare className="w-7 h-7 stroke-1" />
              </div>
              <div>
                <p className="text-xs font-normal text-slate-700">No active chats yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Reach out to any product owner or provider to start a conversation</p>
              </div>
            </div>
          ) : (
            sortedConversations.map((conv) => {
              const fallbackAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80';
              const fallbackListingImage = conv.itemType === 'service'
                ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80'
                : 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=300&q=80';
              const listingPhoto = conv.listingImage || fallbackListingImage;
              const otherUser = conv.otherUser || {};
              const otherAvatar = otherUser.avatar || fallbackAvatar;
              const otherName = otherUser.name || 'Neighbor';

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={listingPhoto}
                        alt={conv.listingTitle}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs bg-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <img
                        src={otherAvatar}
                        alt={otherName}
                        className="w-5 h-5 rounded-full object-cover absolute -bottom-1 -right-1 ring-2 ring-white border border-slate-300 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-normal text-slate-900 truncate">
                          {conv.listingTitle}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <div className="text-[10px] font-normal text-teal-700 truncate mt-0.5">
                        {otherName}
                      </div>

                      <p className="text-xs text-slate-600 truncate mt-0.5">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-yellow-400 text-slate-900 text-[10px] font-semibold rounded-full flex items-center justify-center shadow-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
