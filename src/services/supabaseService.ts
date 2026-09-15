import { supabase, SUPABASE_PROJECT_ID } from '../lib/supabase';
import { 
  ProductListing, 
  ServiceListing, 
  NeedPost, 
  RentalRequest, 
  ServiceBooking, 
  Review, 
  Conversation, 
  Message, 
  UserProfile,
  RequestStatus
} from '../types';

export interface SupabaseStatusResult {
  connected: boolean;
  tablesExist: boolean;
  missingTables: string[];
  details: string;
}

const REQUIRED_TABLES = [
  'profiles',
  'products',
  'services',
  'needs',
  'rental_requests',
  'service_bookings',
  'reviews',
  'conversations',
  'messages',
  'wishlists'
];

/**
 * Check if the Supabase project is accessible and required tables are created
 */
export async function checkSupabaseStatus(): Promise<SupabaseStatusResult> {
  const missing: string[] = [];
  try {
    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        // PGRST205 / PGRST116 means table does not exist in schema cache
        missing.push(table);
      }
    }

    if (missing.length === 0) {
      return {
        connected: true,
        tablesExist: true,
        missingTables: [],
        details: `Connected to Supabase (${SUPABASE_PROJECT_ID}). All 10 tables are ready and synced.`,
      };
    } else {
      return {
        connected: true,
        tablesExist: false,
        missingTables: missing,
        details: `Connected to Supabase, but ${missing.length} table(s) need to be created via SQL Editor.`,
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      tablesExist: false,
      missingTables: REQUIRED_TABLES,
      details: err?.message || 'Failed to connect to Supabase.',
    };
  }
}

// ----------------------------------------------------------------------
// DATA TRANSFORMERS (DB Snake_Case <-> App CamelCase)
// ----------------------------------------------------------------------

export function mapProductToDb(p: ProductListing) {
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    subcategory: p.subcategory || null,
    description: p.description,
    condition: p.condition,
    images: p.images || [],
    owner_id: p.ownerId,
    owner_name: p.ownerName,
    owner_avatar: p.ownerAvatar,
    owner_rating: p.ownerRating,
    owner_review_count: p.ownerReviewCount,
    is_owner_verified: p.isOwnerVerified,
    price_per_unit: p.pricePerUnit,
    unit: p.unit,
    security_deposit: p.securityDeposit || 0,
    location: p.location,
    distance_km: p.distanceKm || 1.0,
    available: p.available ?? true,
    features: p.features || [],
    rules: p.rules || [],
    times_rented: p.timesRented || 0,
    created_at: p.createdAt || new Date().toISOString(),
  };
}

export function mapProductFromDb(row: any): ProductListing {
  return {
    id: row.id,
    type: 'product',
    title: row.title,
    category: row.category,
    subcategory: row.subcategory || undefined,
    description: row.description,
    condition: row.condition,
    images: row.images || [],
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    ownerAvatar: row.owner_avatar,
    ownerRating: Number(row.owner_rating) || 5.0,
    ownerReviewCount: Number(row.owner_review_count) || 0,
    isOwnerVerified: Boolean(row.is_owner_verified),
    pricePerUnit: Number(row.price_per_unit),
    unit: row.unit,
    securityDeposit: Number(row.security_deposit) || 0,
    location: row.location,
    distanceKm: Number(row.distance_km) || 1.0,
    available: Boolean(row.available),
    features: row.features || [],
    rules: row.rules || [],
    timesRented: Number(row.times_rented) || 0,
    createdAt: row.created_at,
  };
}

export function mapServiceToDb(s: ServiceListing) {
  return {
    id: s.id,
    title: s.title,
    category: s.category,
    subcategory: s.subcategory || null,
    description: s.description,
    images: s.images || [],
    provider_id: s.providerId,
    provider_name: s.providerName,
    provider_avatar: s.providerAvatar,
    provider_rating: s.providerRating,
    provider_review_count: s.providerReviewCount,
    is_provider_verified: s.isProviderVerified,
    starting_price: s.startingPrice,
    unit: s.unit,
    service_area: s.serviceArea || 'Udaipur City',
    location: s.location || null,
    distance_km: s.distanceKm || 1.0,
    available: s.available ?? true,
    skills: s.skills || [],
    packages: s.packages || [],
    jobs_completed: s.jobsCompleted || 0,
    created_at: s.createdAt || new Date().toISOString(),
  };
}

export function mapServiceFromDb(row: any): ServiceListing {
  return {
    id: row.id,
    type: 'service',
    title: row.title,
    category: row.category,
    subcategory: row.subcategory || undefined,
    description: row.description,
    images: row.images || [],
    providerId: row.provider_id,
    providerName: row.provider_name,
    providerAvatar: row.provider_avatar,
    providerRating: Number(row.provider_rating) || 5.0,
    providerReviewCount: Number(row.provider_review_count) || 0,
    isProviderVerified: Boolean(row.is_provider_verified),
    startingPrice: Number(row.starting_price),
    unit: row.unit,
    serviceArea: row.service_area || 'Udaipur City',
    location: row.location,
    distanceKm: Number(row.distance_km) || 1.0,
    available: Boolean(row.available),
    skills: row.skills || [],
    packages: row.packages || [],
    jobsCompleted: Number(row.jobs_completed) || 0,
    createdAt: row.created_at,
  };
}

export function mapNeedToDb(n: NeedPost) {
  return {
    id: n.id,
    user_id: n.userId,
    user_name: n.userName,
    user_avatar: n.userAvatar,
    title: n.title,
    description: n.description,
    type: n.type,
    category: n.category,
    subcategory: n.subcategory || null,
    budget: n.budget,
    needed_date: n.neededDate,
    location: n.location,
    responses_count: n.responsesCount || 0,
    status: n.status,
    created_at: n.createdAt || new Date().toISOString(),
  };
}

export function mapNeedFromDb(row: any): NeedPost {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userAvatar: row.user_avatar,
    title: row.title,
    description: row.description,
    type: row.type,
    category: row.category,
    subcategory: row.subcategory || undefined,
    budget: Number(row.budget) || 0,
    neededDate: row.needed_date,
    location: row.location,
    responsesCount: Number(row.responses_count) || 0,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapRentalRequestToDb(r: RentalRequest) {
  return {
    id: r.id,
    listing_id: r.listingId,
    listing_title: r.listingTitle,
    listing_image: r.listingImage,
    owner_id: r.ownerId,
    owner_name: r.ownerName,
    renter_id: r.renterId,
    renter_name: r.renterName,
    renter_avatar: r.renterAvatar,
    start_date: r.startDate,
    end_date: r.endDate,
    total_days: r.totalDays,
    daily_rate: r.dailyRate,
    total_amount: r.totalAmount,
    security_deposit: r.securityDeposit || 0,
    status: r.status,
    pickup_preference: r.pickupPreference,
    delivery_address: r.deliveryAddress || null,
    customer_note: r.customerNote || null,
    has_reviewed: r.hasReviewed || false,
    created_at: r.createdAt || new Date().toISOString(),
  };
}

export function mapRentalRequestFromDb(row: any): RentalRequest {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    listingImage: row.listing_image,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    renterId: row.renter_id,
    renterName: row.renter_name,
    renterAvatar: row.renter_avatar,
    startDate: row.start_date,
    endDate: row.end_date,
    totalDays: Number(row.total_days) || 1,
    dailyRate: Number(row.daily_rate) || 0,
    totalAmount: Number(row.total_amount) || 0,
    securityDeposit: Number(row.security_deposit) || 0,
    status: row.status,
    pickupPreference: row.pickup_preference,
    deliveryAddress: row.delivery_address || undefined,
    customerNote: row.customer_note || undefined,
    hasReviewed: Boolean(row.has_reviewed),
    createdAt: row.created_at,
  };
}

export const SERVICE_REQUEST_TERMS_VERSION = 'service_request_terms_v1';

export function mapServiceBookingToDb(b: ServiceBooking) {
  return {
    id: b.id,
    listing_id: b.listingId,
    listing_title: b.listingTitle,
    listing_image: b.listingImage,
    provider_id: b.providerId,
    provider_name: b.providerName,
    customer_id: b.customerId,
    customer_name: b.customerName,
    customer_avatar: b.customerAvatar,
    scheduled_date: b.scheduledDate,
    scheduled_time: b.scheduledTime,
    package_id: b.packageId || null,
    package_name: b.packageName || null,
    package_price: b.packagePrice || null,
    total_amount: b.totalAmount,
    service_address: b.serviceAddress,
    status: b.status,
    customer_notes: b.customerNotes || null,
    has_reviewed: b.hasReviewed || false,
    terms_acknowledged: b.termsAcknowledged ?? true,
    terms_version: b.termsVersion || SERVICE_REQUEST_TERMS_VERSION,
    acknowledged_at: b.acknowledgedAt || new Date().toISOString(),
    created_at: b.createdAt || new Date().toISOString(),
  };
}

export function mapServiceBookingFromDb(row: any): ServiceBooking {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    listingImage: row.listing_image,
    providerId: row.provider_id,
    providerName: row.provider_name,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerAvatar: row.customer_avatar,
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time,
    packageId: row.package_id || undefined,
    packageName: row.package_name || undefined,
    packagePrice: row.package_price ? Number(row.package_price) : undefined,
    totalAmount: Number(row.total_amount) || 0,
    serviceAddress: row.service_address,
    status: row.status,
    customerNotes: row.customer_notes || undefined,
    hasReviewed: Boolean(row.has_reviewed),
    termsAcknowledged: row.terms_acknowledged !== undefined ? Boolean(row.terms_acknowledged) : true,
    termsVersion: row.terms_version || SERVICE_REQUEST_TERMS_VERSION,
    acknowledgedAt: row.acknowledged_at || row.created_at,
    createdAt: row.created_at,
  };
}

export function mapReviewToDb(r: Review) {
  return {
    id: r.id,
    transaction_id: r.transactionId || null,
    listing_id: r.listingId || null,
    listing_title: r.listingTitle,
    target_user_id: r.targetUserId || null,
    author_id: r.authorId,
    author_name: r.authorName,
    author_avatar: r.authorAvatar,
    rating: r.rating,
    comment: r.comment,
    item_type: r.itemType,
    verified_rental: r.verifiedRental,
    created_at: r.createdAt || new Date().toISOString(),
  };
}

export function mapReviewFromDb(row: any): Review {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    targetUserId: row.target_user_id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    rating: Number(row.rating) || 5.0,
    comment: row.comment,
    itemType: row.item_type,
    verifiedRental: Boolean(row.verified_rental),
    createdAt: row.created_at,
  };
}

export function mapProfileToDb(u: UserProfile) {
  return {
    id: u.id,
    name: u.name,
    email: u.email || null,
    phone: u.phone || null,
    avatar: u.avatar,
    location: u.location,
    is_verified: u.isVerified,
    rating: u.rating,
    review_count: u.reviewCount,
    member_since: u.memberSince,
    bio: u.bio || null,
    response_rate: u.responseRate || '100%',
    active_role: u.activeRole || 'both',
  };
}

export function mapProfileFromDb(row: any): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    avatar: row.avatar || '',
    location: row.location,
    isVerified: Boolean(row.is_verified),
    rating: Number(row.rating) || 5.0,
    reviewCount: Number(row.review_count) || 0,
    memberSince: row.member_since || 'March 2024',
    bio: row.bio || '',
    responseRate: row.response_rate || '100%',
    activeRole: row.active_role || 'both',
  };
}

// ----------------------------------------------------------------------
// DATA FETCHERS
// ----------------------------------------------------------------------

export async function fetchProductsFromSupabase(): Promise<ProductListing[] | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error || !data) return null;
  return data.map(mapProductFromDb);
}

export async function fetchServicesFromSupabase(): Promise<ServiceListing[] | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error || !data) return null;
  return data.map(mapServiceFromDb);
}

export async function fetchServiceByIdFromSupabase(serviceId: string): Promise<ServiceListing | null> {
  if (!serviceId) return null;
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .maybeSingle();

  if (error || !data) return null;
  return mapServiceFromDb(data);
}

export async function fetchNeedsFromSupabase(): Promise<NeedPost[] | null> {
  const { data, error } = await supabase
    .from('needs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error || !data) return null;
  return data.map(mapNeedFromDb);
}

export async function fetchRequestsFromSupabase(userId: string): Promise<RentalRequest[] | null> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('rental_requests')
    .select('*')
    .or(`renter_id.eq.${userId},owner_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (error || !data) return null;
  return data.map(mapRentalRequestFromDb);
}

export async function fetchBookingsFromSupabase(userId: string): Promise<ServiceBooking[] | null> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('service_bookings')
    .select('*')
    .or(`customer_id.eq.${userId},provider_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (error || !data) return null;
  return data.map(mapServiceBookingFromDb);
}

export async function fetchReviewsFromSupabase(): Promise<Review[] | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error || !data) return null;
  return data.map(mapReviewFromDb);
}

export async function fetchConversationsFromSupabase(userId: string): Promise<Conversation[] | null> {
  if (!userId) return [];
  const { data: convs, error: convErr } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .order('last_message_time', { ascending: false });

  if (convErr || !convs) return null;

  const convIds = convs.map(c => c.id);
  const msgsByConv: Record<string, Message[]> = {};

  if (convIds.length > 0) {
    const { data: allMsgs, error: msgErr } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: true });

    if (allMsgs && !msgErr) {
      for (const m of allMsgs) {
        if (!msgsByConv[m.conversation_id]) {
          msgsByConv[m.conversation_id] = [];
        }
        msgsByConv[m.conversation_id].push({
          id: m.id,
          senderId: m.sender_id,
          text: m.text,
          timestamp: m.timestamp,
          isRead: m.is_read,
          attachmentUrl: m.attachment_url,
        });
      }
    }
  }

  return convs.map(c => ({
    id: c.id,
    listingId: c.listing_id,
    listingTitle: c.listing_title,
    listingImage: c.listing_image,
    listingPrice: c.listing_price,
    itemType: c.item_type || 'product',
    participantIds: c.participant_ids || [],
    otherUser: (c.other_user && typeof c.other_user === 'object' && (c.other_user as any).avatar) ? c.other_user : undefined,
    lastMessage: c.last_message || '',
    lastMessageTime: c.last_message_time || '',
    lastMessageSenderId: (msgsByConv[c.id] && msgsByConv[c.id].length > 0)
      ? msgsByConv[c.id][msgsByConv[c.id].length - 1].senderId
      : undefined,
    unreadCount: c.unread_count || 0,
    messages: msgsByConv[c.id] || [],
  }));
}

export async function fetchWishlistFromSupabase(userId: string): Promise<string[] | null> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('wishlists')
    .select('listing_id')
    .eq('user_id', userId);
  
  if (error || !data) return null;
  return data.map(d => d.listing_id);
}

export async function fetchProfileFromSupabase(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  return mapProfileFromDb(data);
}

export async function fetchAllProfilesFromSupabase(): Promise<UserProfile[] | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error || !data) return null;
  return data.map(mapProfileFromDb);
}

export async function fetchConversationByIdFromSupabase(convId: string): Promise<Conversation | null> {
  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', convId)
    .single();

  if (convErr || !conv) return null;

  const { data: msgs } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true });

  return {
    id: conv.id,
    listingId: conv.listing_id,
    listingTitle: conv.listing_title,
    listingImage: conv.listing_image,
    listingPrice: conv.listing_price,
    itemType: conv.item_type || 'product',
    participantIds: conv.participant_ids || [],
    otherUser: (conv.other_user && typeof conv.other_user === 'object' && (conv.other_user as any).avatar) ? conv.other_user : undefined,
    lastMessage: conv.last_message || '',
    lastMessageTime: conv.last_message_time || '',
    lastMessageSenderId: (msgs && msgs.length > 0) ? msgs[msgs.length - 1].sender_id : undefined,
    unreadCount: conv.unread_count || 0,
    messages: (msgs || []).map(m => ({
      id: m.id,
      senderId: m.sender_id,
      text: m.text,
      timestamp: m.timestamp,
      isRead: m.is_read,
      attachmentUrl: m.attachment_url,
    })),
  };
}

// ----------------------------------------------------------------------
// DATA MUTATIONS (Live writing to Supabase)
// ----------------------------------------------------------------------

export async function saveProductToSupabase(product: ProductListing): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').upsert(mapProductToDb(product));
    if (error) console.error('[Supabase] saveProduct error:', error);
    return !error;
  } catch (err) {
    console.error('[Supabase] saveProduct exception:', err);
    return false;
  }
}

export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function saveServiceToSupabase(service: ServiceListing): Promise<boolean> {
  try {
    const { error } = await supabase.from('services').upsert(mapServiceToDb(service));
    if (error) console.error('[Supabase] saveService error:', error);
    return !error;
  } catch (err) {
    console.error('[Supabase] saveService exception:', err);
    return false;
  }
}

export async function deleteServiceFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('services').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function saveNeedToSupabase(need: NeedPost): Promise<boolean> {
  try {
    const { error } = await supabase.from('needs').upsert(mapNeedToDb(need));
    if (error) console.error('[Supabase] saveNeed error:', error);
    return !error;
  } catch (err) {
    console.error('[Supabase] saveNeed exception:', err);
    return false;
  }
}

export async function deleteNeedFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('needs').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function updateNeedStatusInSupabase(id: string, status: 'open' | 'fulfilled'): Promise<boolean> {
  try {
    const { error } = await supabase.from('needs').update({ status }).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function saveRentalRequestToSupabase(request: RentalRequest): Promise<boolean> {
  try {
    const { error } = await supabase.from('rental_requests').upsert(mapRentalRequestToDb(request));
    return !error;
  } catch {
    return false;
  }
}

export async function updateRentalRequestStatusInSupabase(id: string, status: RequestStatus): Promise<boolean> {
  try {
    const { error } = await supabase.from('rental_requests').update({ status }).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function saveServiceBookingToSupabase(booking: ServiceBooking): Promise<boolean> {
  // Backend validation: reject request creation if acknowledgement is missing or false
  if (!booking.termsAcknowledged) {
    console.error('Service request rejected: terms_acknowledged must be true.');
    return false;
  }

  try {
    const { error } = await supabase.from('service_bookings').upsert(mapServiceBookingToDb(booking));
    
    // Store associated acknowledgement audit record in database
    try {
      await supabase.from('service_terms_acknowledgements').upsert({
        id: `ack-${booking.id}`,
        request_id: booking.id,
        user_id: booking.customerId,
        terms_acknowledged: true,
        terms_version: booking.termsVersion || SERVICE_REQUEST_TERMS_VERSION,
        acknowledged_at: booking.acknowledgedAt || new Date().toISOString(),
      });
    } catch {
      // Non-blocking if table not yet run in manual migration
    }

    return !error;
  } catch {
    return false;
  }
}

export async function updateServiceBookingStatusInSupabase(id: string, status: RequestStatus): Promise<boolean> {
  try {
    const { error } = await supabase.from('service_bookings').update({ status }).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function expirePendingRequestsInSupabase(fortyEightHoursAgoIso: string): Promise<{ expiredRentalIds: string[]; expiredBookingIds: string[] }> {
  try {
    const { data: expiredRentals } = await supabase
      .from('rental_requests')
      .update({ status: 'cancelled' })
      .eq('status', 'pending')
      .lte('created_at', fortyEightHoursAgoIso)
      .select('id');

    const { data: expiredBookings } = await supabase
      .from('service_bookings')
      .update({ status: 'cancelled' })
      .eq('status', 'pending')
      .lte('created_at', fortyEightHoursAgoIso)
      .select('id');

    return {
      expiredRentalIds: (expiredRentals || []).map((r: any) => r.id),
      expiredBookingIds: (expiredBookings || []).map((b: any) => b.id)
    };
  } catch {
    return { expiredRentalIds: [], expiredBookingIds: [] };
  }
}

export async function saveReviewToSupabase(review: Review): Promise<boolean> {
  try {
    const { error } = await supabase.from('reviews').upsert(mapReviewToDb(review));
    return !error;
  } catch {
    return false;
  }
}

export async function saveConversationToSupabase(conv: Conversation): Promise<boolean> {
  try {
    const { error: convErr } = await supabase.from('conversations').upsert({
      id: conv.id,
      listing_id: conv.listingId,
      listing_title: conv.listingTitle,
      listing_image: conv.listingImage,
      listing_price: conv.listingPrice,
      item_type: conv.itemType,
      participant_ids: conv.participantIds,
      other_user: conv.otherUser,
      last_message: conv.lastMessage,
      last_message_time: conv.lastMessageTime,
      unread_count: conv.unreadCount,
    });
    return !convErr;
  } catch {
    return false;
  }
}

export async function saveMessageToSupabase(
  message: Message, 
  conversationId: string, 
  conv?: Conversation
): Promise<boolean> {
  try {
    // If the conversation object is supplied, ensure the parent conversation row exists in Supabase
    // to satisfy the foreign key constraint: REFERENCES public.conversations(id)
    if (conv) {
      await saveConversationToSupabase(conv);
    }

    const { error } = await supabase.from('messages').upsert({
      id: message.id,
      conversation_id: conversationId,
      sender_id: message.senderId,
      text: message.text,
      timestamp: message.timestamp,
      is_read: message.isRead,
      attachment_url: message.attachmentUrl || null,
    });

    if (!error) {
      await supabase.from('conversations').update({
        last_message: message.text,
        last_message_time: message.timestamp,
      }).eq('id', conversationId);
    }
    return !error;
  } catch {
    return false;
  }
}

export async function markConversationAsReadInSupabase(conversationId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('conversations').update({
      unread_count: 0
    }).eq('id', conversationId);
    return !error;
  } catch {
    return false;
  }
}

export async function markMessagesAsReadInSupabase(conversationId: string, currentUserId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId);
    return !error;
  } catch {
    return false;
  }
}

export async function toggleWishlistInSupabase(userId: string, listingId: string, add: boolean): Promise<boolean> {
  try {
    if (add) {
      const { error } = await supabase.from('wishlists').upsert({
        id: `wl_${userId}_${listingId}`,
        user_id: userId,
        listing_id: listingId,
      });
      return !error;
    } else {
      const { error } = await supabase.from('wishlists').delete().match({ user_id: userId, listing_id: listingId });
      return !error;
    }
  } catch {
    return false;
  }
}

export async function saveProfileToSupabase(profile: UserProfile): Promise<boolean> {
  try {
    const { error } = await supabase.from('profiles').upsert(mapProfileToDb(profile));
    if (error) {
      console.error('[Supabase] saveProfile error:', error);
      return false;
    }

    // Cascade name & avatar updates across all relevant tables
    await Promise.allSettled([
      supabase.from('products').update({
        owner_name: profile.name,
        owner_avatar: profile.avatar,
        owner_rating: profile.rating,
        owner_review_count: profile.reviewCount
      }).eq('owner_id', profile.id),

      supabase.from('services').update({
        provider_name: profile.name,
        provider_avatar: profile.avatar,
        provider_rating: profile.rating,
        provider_review_count: profile.reviewCount
      }).eq('provider_id', profile.id),

      supabase.from('needs').update({
        user_name: profile.name,
        user_avatar: profile.avatar
      }).eq('user_id', profile.id),

      supabase.from('rental_requests').update({
        renter_name: profile.name,
        renter_avatar: profile.avatar
      }).eq('renter_id', profile.id),

      supabase.from('rental_requests').update({
        owner_name: profile.name
      }).eq('owner_id', profile.id),

      supabase.from('service_bookings').update({
        customer_name: profile.name,
        customer_avatar: profile.avatar
      }).eq('customer_id', profile.id),

      supabase.from('service_bookings').update({
        provider_name: profile.name
      }).eq('provider_id', profile.id),

      supabase.from('reviews').update({
        author_name: profile.name,
        author_avatar: profile.avatar
      }).eq('author_id', profile.id),
    ]);

    return true;
  } catch (err) {
    console.error('[Supabase] saveProfile exception:', err);
    return false;
  }
}

export async function deleteConversationFromSupabase(conversationId: string): Promise<boolean> {
  try {
    const { error: msgErr } = await supabase.from('messages').delete().eq('conversation_id', conversationId);
    if (msgErr) console.warn('[Supabase] Error deleting messages for conversation:', msgErr);
    const { error: convErr } = await supabase.from('conversations').delete().eq('id', conversationId);
    if (convErr) console.warn('[Supabase] Error deleting conversation:', convErr);
    return !msgErr && !convErr;
  } catch (err) {
    console.error('[Supabase] deleteConversation exception:', err);
    return false;
  }
}

export async function clearAllConversationsAndMessagesFromSupabase(): Promise<boolean> {
  try {
    const { error: msgErr } = await supabase.from('messages').delete().neq('id', '____');
    if (msgErr) console.warn('[Supabase] Error deleting messages:', msgErr);
    const { error: convErr } = await supabase.from('conversations').delete().neq('id', '____');
    if (convErr) console.warn('[Supabase] Error deleting conversations:', convErr);
    return !msgErr && !convErr;
  } catch (err) {
    console.error('[Supabase] clearAllConversationsAndMessages exception:', err);
    return false;
  }
}

// ----------------------------------------------------------------------
// DATA MIGRATION: TRANSFER ENTIRE APPLICATION STATE TO SUPABASE
// ----------------------------------------------------------------------

export async function syncAllLocalDataToSupabase(data: {
  profiles: UserProfile[];
  products: ProductListing[];
  services: ServiceListing[];
  needs: NeedPost[];
  requests: RentalRequest[];
  bookings: ServiceBooking[];
  reviews: Review[];
  conversations: Conversation[];
  wishlist: string[];
  currentUserId: string;
}): Promise<{ success: boolean; inserted: Record<string, number>; errors: string[] }> {
  const inserted: Record<string, number> = {};
  const errors: string[] = [];

  // 1. Upload Profiles
  try {
    const rows = data.profiles.map(mapProfileToDb);
    const { error } = await supabase.from('profiles').upsert(rows);
    if (error) errors.push(`Profiles: ${error.message}`);
    else inserted.profiles = rows.length;
  } catch (err: any) {
    errors.push(`Profiles: ${err.message}`);
  }

  // 2. Upload Products
  try {
    const rows = data.products.map(mapProductToDb);
    const { error } = await supabase.from('products').upsert(rows);
    if (error) errors.push(`Products: ${error.message}`);
    else inserted.products = rows.length;
  } catch (err: any) {
    errors.push(`Products: ${err.message}`);
  }

  // 3. Upload Services
  try {
    const rows = data.services.map(mapServiceToDb);
    const { error } = await supabase.from('services').upsert(rows);
    if (error) errors.push(`Services: ${error.message}`);
    else inserted.services = rows.length;
  } catch (err: any) {
    errors.push(`Services: ${err.message}`);
  }

  // 4. Upload Needs
  try {
    const rows = data.needs.map(mapNeedToDb);
    const { error } = await supabase.from('needs').upsert(rows);
    if (error) errors.push(`Needs: ${error.message}`);
    else inserted.needs = rows.length;
  } catch (err: any) {
    errors.push(`Needs: ${err.message}`);
  }

  // 5. Upload Rental Requests
  try {
    const rows = data.requests.map(mapRentalRequestToDb);
    const { error } = await supabase.from('rental_requests').upsert(rows);
    if (error) errors.push(`Rental Requests: ${error.message}`);
    else inserted.rental_requests = rows.length;
  } catch (err: any) {
    errors.push(`Rental Requests: ${err.message}`);
  }

  // 6. Upload Service Bookings
  try {
    const rows = data.bookings.map(mapServiceBookingToDb);
    const { error } = await supabase.from('service_bookings').upsert(rows);
    if (error) errors.push(`Service Bookings: ${error.message}`);
    else inserted.service_bookings = rows.length;
  } catch (err: any) {
    errors.push(`Service Bookings: ${err.message}`);
  }

  // 7. Upload Reviews
  try {
    const rows = data.reviews.map(mapReviewToDb);
    const { error } = await supabase.from('reviews').upsert(rows);
    if (error) errors.push(`Reviews: ${error.message}`);
    else inserted.reviews = rows.length;
  } catch (err: any) {
    errors.push(`Reviews: ${err.message}`);
  }

  // 8. Upload Conversations and Messages
  try {
    const convRows = data.conversations.map(c => ({
      id: c.id,
      listing_id: c.listingId,
      listing_title: c.listingTitle,
      listing_image: c.listingImage,
      listing_price: c.listingPrice,
      item_type: c.itemType,
      participant_ids: c.participantIds,
      other_user: c.otherUser,
      last_message: c.lastMessage,
      last_message_time: c.lastMessageTime,
      unread_count: c.unreadCount,
    }));
    const { error: convErr } = await supabase.from('conversations').upsert(convRows);
    if (convErr) {
      errors.push(`Conversations: ${convErr.message}`);
    } else {
      inserted.conversations = convRows.length;
      // Messages
      const msgRows: any[] = [];
      for (const conv of data.conversations) {
        for (const m of conv.messages) {
          msgRows.push({
            id: m.id,
            conversation_id: conv.id,
            sender_id: m.senderId,
            text: m.text,
            timestamp: m.timestamp,
            is_read: m.isRead,
            attachment_url: m.attachmentUrl || null,
          });
        }
      }
      if (msgRows.length > 0) {
        const { error: msgErr } = await supabase.from('messages').upsert(msgRows);
        if (msgErr) errors.push(`Messages: ${msgErr.message}`);
        else inserted.messages = msgRows.length;
      }
    }
  } catch (err: any) {
    errors.push(`Conversations/Messages: ${err.message}`);
  }

  // 9. Upload Wishlist
  try {
    const wlRows = data.wishlist.map(listingId => ({
      id: `wl_${data.currentUserId}_${listingId}`,
      user_id: data.currentUserId,
      listing_id: listingId,
    }));
    if (wlRows.length > 0) {
      const { error: wlErr } = await supabase.from('wishlists').upsert(wlRows);
      if (wlErr) errors.push(`Wishlist: ${wlErr.message}`);
      else inserted.wishlist = wlRows.length;
    }
  } catch (err: any) {
    errors.push(`Wishlist: ${err.message}`);
  }

  return {
    success: errors.length === 0,
    inserted,
    errors,
  };
}
