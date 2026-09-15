import { Conversation } from '../types';

/**
 * Parses approximate or standard date/time strings into a numeric timestamp in milliseconds.
 */
export function parseTimestampToMs(rawTime?: string | null): number {
  if (!rawTime) return 0;
  const trimmed = rawTime.trim();
  if (!trimmed) return 0;

  const lower = trimmed.toLowerCase();

  // Instant / recent tags
  if (lower.includes('just now') || lower.includes('moments ago') || lower.includes('moment ago')) {
    return Date.now();
  }

  // Relative minutes / hours / days
  const minsMatch = lower.match(/(\d+)\s*(?:min|minute)s?\s*ago/);
  if (minsMatch) {
    return Date.now() - parseInt(minsMatch[1], 10) * 60 * 1000;
  }
  const hoursMatch = lower.match(/(\d+)\s*(?:hour|hr)s?\s*ago/);
  if (hoursMatch) {
    return Date.now() - parseInt(hoursMatch[1], 10) * 60 * 60 * 1000;
  }
  const daysMatch = lower.match(/(\d+)\s*(?:day)s?\s*ago/);
  if (daysMatch) {
    return Date.now() - parseInt(daysMatch[1], 10) * 24 * 60 * 60 * 1000;
  }

  // "Yesterday" or "Yesterday 3:00 PM"
  if (lower.startsWith('yesterday')) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const timePortion = trimmed.replace(/yesterday/i, '').trim();
    if (timePortion) {
      const timeParsed = parseTimeOfDay(timePortion, yesterday);
      if (timeParsed) return timeParsed.getTime();
    }
    yesterday.setHours(12, 0, 0, 0);
    return yesterday.getTime();
  }

  // "10:45 AM" or "2:30 PM" (assumed today or recent)
  const timeToday = parseTimeOfDay(trimmed, new Date());
  if (timeToday) {
    return timeToday.getTime();
  }

  // Standard Date parse fallback (e.g. ISO string or standard date)
  const standardDate = new Date(trimmed).getTime();
  if (!isNaN(standardDate)) {
    return standardDate;
  }

  return 0;
}

function parseTimeOfDay(timeStr: string, baseDate: Date): Date | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[4]?.toLowerCase();

  if (meridiem === 'pm' && hours < 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;

  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  // If parsed time is ahead of now, it likely was earlier today or yesterday
  if (d.getTime() > Date.now()) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

/**
 * Calculates the most accurate sorting time for a conversation based on:
 * 1. Explicit conv.updatedAt
 * 2. Last message timestamp
 * 3. conv.lastMessageTime preview
 * The highest timestamp wins to guarantee that newer messages immediately bubble the chat to top.
 */
export function getConversationSortTime(conv: Conversation): number {
  let maxTime = 0;

  if (conv.updatedAt) {
    if (typeof conv.updatedAt === 'number') {
      maxTime = Math.max(maxTime, conv.updatedAt);
    } else {
      const parsed = new Date(conv.updatedAt).getTime();
      if (!isNaN(parsed)) {
        maxTime = Math.max(maxTime, parsed);
      }
    }
  }

  // Check last message timestamp if available
  const lastMsg = conv.messages && conv.messages.length > 0
    ? conv.messages[conv.messages.length - 1]
    : null;

  if (lastMsg) {
    const msgTime = parseTimestampToMs(lastMsg.timestamp);
    if (msgTime > maxTime) {
      maxTime = msgTime;
    }
  }

  if (conv.lastMessageTime) {
    const rawTime = parseTimestampToMs(conv.lastMessageTime);
    if (rawTime > maxTime) {
      maxTime = rawTime;
    }
  }

  return maxTime;
}

/**
 * Sorts conversations descending so the newest message or newest conversation is always at the top.
 */
export function sortConversationsByRecent(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => {
    const timeB = getConversationSortTime(b);
    const timeA = getConversationSortTime(a);
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    // Secondary deterministic sort by ID to prevent flicker
    return b.id.localeCompare(a.id);
  });
}

/**
 * Generates a deterministic unique conversation ID based on the listing ID and both participants.
 * Guarantees a single unique conversation thread for any product/service between two users,
 * completely preventing duplicate conversations.
 */
export function getDeterministicConversationId(
  listingId: string,
  userAId: string,
  userBId: string
): string {
  const sortedUsers = [userAId, userBId].sort();
  const cleanListingId = (listingId || 'item').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `conv_${cleanListingId}_${sortedUsers[0]}_${sortedUsers[1]}`;
}

/**
 * Normalizes a conversation object from the perspective of the current user.
 * Ensures otherUser correctly reflects the counterpart in the conversation,
 * rather than the user themselves or stale data.
 */
export function normalizeConversationForUser(
  conv: Conversation,
  currentUserId: string,
  profilesMap?: Record<string, { id: string; name: string; avatar: string; rating?: number }>
): Conversation {
  if (!conv || typeof conv !== 'object' || typeof conv.id !== 'string') {
    return conv;
  }

  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80';

  // Find the other participant's ID
  const otherId = conv.participantIds?.find(id => id && id !== currentUserId)
    || (conv.otherUser && conv.otherUser.id && conv.otherUser.id !== currentUserId ? conv.otherUser.id : '');

  let otherUser = conv.otherUser;

  // If otherUser is missing, an empty object, missing avatar/name, or pointing to currentUser, resolve it
  const isInvalidOtherUser = !otherUser || 
    typeof otherUser !== 'object' || 
    !otherUser.id || 
    !otherUser.avatar || 
    otherUser.id === currentUserId;

  if (isInvalidOtherUser) {
    if (otherId && profilesMap && profilesMap[otherId]) {
      const p = profilesMap[otherId];
      otherUser = {
        id: p.id,
        name: p.name || 'Neighbor',
        avatar: p.avatar || DEFAULT_AVATAR,
        rating: p.rating || 4.9
      };
    } else if (otherId) {
      otherUser = {
        id: otherId,
        name: otherUser?.name && otherUser?.id === otherId ? otherUser.name : 'Neighbor',
        avatar: otherUser?.avatar && otherUser?.id === otherId
          ? otherUser.avatar
          : DEFAULT_AVATAR,
        rating: otherUser?.rating || 4.9
      };
    } else {
      otherUser = {
        id: otherUser?.id || 'user_neighbor',
        name: otherUser?.name || 'Neighbor',
        avatar: otherUser?.avatar || DEFAULT_AVATAR,
        rating: otherUser?.rating || 4.9
      };
    }
  }

  const safeOtherUser = {
    id: otherUser?.id || otherId || 'user_neighbor',
    name: otherUser?.name || 'Neighbor',
    avatar: otherUser?.avatar || DEFAULT_AVATAR,
    rating: otherUser?.rating || 4.9
  };

  const lastMsg = conv.messages && conv.messages.length > 0
    ? conv.messages[conv.messages.length - 1]
    : null;

  return {
    ...conv,
    messages: conv.messages || [],
    otherUser: safeOtherUser,
    lastMessage: lastMsg?.text || conv.lastMessage || '',
    lastMessageTime: lastMsg?.timestamp || conv.lastMessageTime || 'Just now',
    lastMessageSenderId: lastMsg?.senderId || (conv as any).lastMessageSenderId || (conv as any).last_message_sender_id,
    updatedAt: conv.updatedAt || (lastMsg ? parseTimestampToMs(lastMsg.timestamp) : Date.now())
  };
}
