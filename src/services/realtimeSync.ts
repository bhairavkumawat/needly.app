import { supabase } from '../lib/supabase';
import { 
  UserProfile, 
  ProductListing, 
  ServiceListing, 
  NeedPost, 
  RentalRequest, 
  ServiceBooking, 
  Message, 
  Review,
  Conversation,
  RequestStatus
} from '../types';

export type RealtimeSyncEvent = 
  | { type: 'PROFILE_UPDATED'; profile: UserProfile }
  | { type: 'PRODUCT_UPSERTED'; product: ProductListing }
  | { type: 'PRODUCT_DELETED'; productId: string }
  | { type: 'SERVICE_UPSERTED'; service: ServiceListing }
  | { type: 'SERVICE_DELETED'; serviceId: string }
  | { type: 'NEED_UPSERTED'; need: NeedPost }
  | { type: 'NEED_DELETED'; needId: string }
  | { type: 'RENTAL_REQUEST_UPSERTED'; request: RentalRequest }
  | { type: 'SERVICE_BOOKING_UPSERTED'; booking: ServiceBooking }
  | { type: 'MESSAGE_SENT'; conversationId: string; message: Message; conversationSummary?: Conversation }
  | { type: 'MESSAGE_UPDATED'; conversationId: string; message: Message }
  | { type: 'MESSAGES_READ'; conversationId: string; readerId: string }
  | { type: 'CONVERSATION_UPSERTED'; conversation: Conversation }
  | { type: 'CONVERSATION_DELETED'; conversationId: string; userId?: string }
  | { type: 'CONVERSATIONS_CLEARED' }
  | { type: 'REVIEW_ADDED'; review: Review }
  | { type: 'WISHLIST_TOGGLED'; userId: string; listingId: string; add: boolean }
  | { type: 'FORCE_REFRESH'; timestamp: number };

export type WrappedSyncEnvelope = RealtimeSyncEvent & {
  _eventId?: string;
  _originTabId?: string;
  _ts?: number;
};

type SyncListener = (event: RealtimeSyncEvent) => void;

class RealtimeSyncManager {
  private listeners: Set<SyncListener> = new Set();
  private supabaseChannel: any = null;
  private localBroadcastChannel: BroadcastChannel | null = null;
  private isSubscribed: boolean = false;
  private tabId: string;
  private seenEventIds: Set<string> = new Set();
  private reconnectTimer: any = null;
  private pendingBroadcasts: WrappedSyncEnvelope[] = [];

  constructor() {
    this.tabId = typeof window !== 'undefined'
      ? `tab_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`
      : 'tab_node';
    
    this.initLocalBroadcast();
    this.initStorageListener();
    this.initSupabaseRealtime();
  }

  public getTabId(): string {
    return this.tabId;
  }

  private initLocalBroadcast() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localBroadcastChannel = new BroadcastChannel('needly_cross_tab_sync');
        this.localBroadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type) {
            this.handleIncomingEnvelope(event.data as WrappedSyncEnvelope);
          }
        };
      } catch (err) {
        console.warn('[RealtimeSync] BroadcastChannel init error:', err);
      }
    }
  }

  private initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'needly_cross_tab_sync_event' && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            if (parsed && parsed.type) {
              this.handleIncomingEnvelope(parsed as WrappedSyncEnvelope);
            }
          } catch {
            // Ignore malformed storage events
          }
        }
      });
    }
  }

  public initSupabaseRealtime() {
    if (this.supabaseChannel) {
      try {
        supabase.removeChannel(this.supabaseChannel);
      } catch {
        // ignore
      }
      this.supabaseChannel = null;
      this.isSubscribed = false;
    }

    try {
      this.supabaseChannel = supabase.channel('needly-global-realtime', {
        config: {
          broadcast: { self: false } // don't echo back to origin connection
        }
      });

      this.supabaseChannel
        .on('broadcast', { event: 'needly_sync' }, (payload: any) => {
          const envelope = payload?.payload || payload?.data || payload;
          if (envelope && envelope.type) {
            this.handleIncomingEnvelope(envelope as WrappedSyncEnvelope);
          }
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            this.isSubscribed = true;
            console.log(`[RealtimeSync] Live multi-tab & multi-device channel connected (${this.tabId})`);
            // Flush any pending broadcasts that occurred before connection was ready
            if (this.pendingBroadcasts.length > 0) {
              const toFlush = [...this.pendingBroadcasts];
              this.pendingBroadcasts = [];
              for (const queued of toFlush) {
                this.supabaseChannel.send({
                  type: 'broadcast',
                  event: 'needly_sync',
                  payload: queued
                }).catch(() => {});
              }
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            this.isSubscribed = false;
            if (!this.reconnectTimer) {
              this.reconnectTimer = setTimeout(() => {
                this.reconnectTimer = null;
                this.initSupabaseRealtime();
              }, 3000);
            }
          }
        });
    } catch (err) {
      console.warn('[RealtimeSync] Supabase channel error:', err);
    }
  }

  private handleIncomingEnvelope(envelope: WrappedSyncEnvelope) {
    // 1. Ignore if sent by this exact tab instance
    if (envelope._originTabId && envelope._originTabId === this.tabId) {
      return;
    }

    // 2. Deduplicate if this event ID was already processed
    if (envelope._eventId) {
      if (this.seenEventIds.has(envelope._eventId)) {
        return;
      }
      this.seenEventIds.add(envelope._eventId);

      // Clean up cache to prevent memory leaks (keep last 200 events)
      if (this.seenEventIds.size > 200) {
        const first = this.seenEventIds.values().next().value;
        if (first) this.seenEventIds.delete(first);
      }
    }

    // Strip internal envelope metadata before passing to listeners
    const { _eventId, _originTabId, _ts, ...event } = envelope;
    this.notifyListeners(event as RealtimeSyncEvent);
  }

  private notifyListeners(event: RealtimeSyncEvent) {
    this.listeners.forEach(fn => {
      try {
        fn(event);
      } catch (err) {
        console.error('[RealtimeSync] Listener callback error:', err);
      }
    });
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async broadcast(event: RealtimeSyncEvent) {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const envelope: WrappedSyncEnvelope = {
      ...event,
      _eventId: eventId,
      _originTabId: this.tabId,
      _ts: Date.now()
    };

    // Mark as seen on this tab so we never reprocess it
    this.seenEventIds.add(eventId);

    // 1. Broadcast locally to other tabs via BroadcastChannel (0ms latency)
    if (this.localBroadcastChannel) {
      try {
        this.localBroadcastChannel.postMessage(envelope);
      } catch (err) {
        console.warn('[RealtimeSync] BroadcastChannel post error:', err);
      }
    }

    // 2. Broadcast to other tabs via localStorage storage event (100% universal across browsers)
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('needly_cross_tab_sync_event', JSON.stringify(envelope));
      } catch {
        // storage quota or disabled
      }
    }

    // 3. Broadcast globally to all other devices & browsers via Supabase Realtime channel
    if (this.supabaseChannel) {
      if (this.isSubscribed) {
        try {
          await this.supabaseChannel.send({
            type: 'broadcast',
            event: 'needly_sync',
            payload: envelope
          });
        } catch (err) {
          console.warn('[RealtimeSync] Supabase broadcast error, queueing:', err);
          this.pendingBroadcasts.push(envelope);
        }
      } else {
        // Channel connecting; queue for immediate dispatch once SUBSCRIBED
        this.pendingBroadcasts.push(envelope);
      }
    }
  }
}

export const realtimeSync = new RealtimeSyncManager();
