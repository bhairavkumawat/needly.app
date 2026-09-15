import React from 'react';
import { ArrowLeft, Trash2, Bell, Sparkles, CheckCircle2, AlertCircle, MessageSquare, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';

export const NotificationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { notifications, markNotificationAsRead, clearAllNotifications, t } = useApp();

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'request_accepted':
      case 'booking_confirmed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'rental_request':
        return <Sparkles className="w-4 h-4 text-teal-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'review':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-teal-600" />;
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/40 backdrop-blur-xs">
      <div 
        id="notifications-screen-container"
        className="bg-white w-full max-w-lg h-full min-h-[100dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Mobile App Bar */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label={t('settings.back', 'Back')}
              className="p-2 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors active:scale-95 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-normal text-slate-900">{t('notif.title', 'Notifications')}</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-normal bg-teal-100 text-teal-800 rounded-full">
                    {unreadCount} {t('notif.new', 'New')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">{t('notif.subtitle', 'Activity and updates from your local network')}</p>
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              id="clear-all-notifications-btn"
              onClick={clearAllNotifications}
              className="text-xs font-normal text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('notif.clear_all', 'Clear all')}</span>
            </button>
          )}
        </div>

        {/* List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 bg-slate-50/50">
          {notifications.length === 0 ? (
            <div className="py-24 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                <Bell className="w-7 h-7 stroke-1" />
              </div>
              <div>
                <p className="text-xs font-normal text-slate-700">{t('notif.empty_title', 'No notifications yet')}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{t('notif.empty_desc', 'When neighbors book or message you, updates appear here')}</p>
              </div>
            </div>
          ) : (
            (() => {
              const seenIds = new Set<string>();
              const uniqueNotifs = notifications.filter((notif, idx) => {
                const uniqueKey = notif.id || `notif_idx_${idx}`;
                if (seenIds.has(uniqueKey)) return false;
                seenIds.add(uniqueKey);
                return true;
              });

              return uniqueNotifs.map((notif, idx) => (
                <div
                  key={notif.id ? `${notif.id}-${idx}` : `notif-${idx}`}
                  id={`notification-item-${notif.id || idx}`}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                    !notif.read
                      ? 'bg-teal-50/80 border-teal-200/90 shadow-xs hover:bg-teal-50'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${!notif.read ? 'bg-white shadow-xs' : 'bg-slate-100'}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-normal text-slate-900 truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              ));
            })()
          )}
        </div>
      </div>
    </div>
  );
};
