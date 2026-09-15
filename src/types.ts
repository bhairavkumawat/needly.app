export type ItemType = 'product' | 'service';

export type ProductCondition = 'like_new' | 'excellent' | 'good' | 'fair';

export type RentalPeriodUnit = 'hour' | 'day' | 'week' | 'month';

export type RequestStatus = 'pending' | 'accepted' | 'active' | 'completed' | 'rejected' | 'cancelled' | 'expired';

export type NavigationTab = 'home' | 'inbox' | 'create' | 'requests' | 'activity' | 'profile';

export type ProfileSectionTab = 'listings' | 'bookings' | 'wishlist' | 'messages' | 'settings' | 'help';
export type CreateScreenType = 'choose' | 'product' | 'service';
export type ActiveModalType = 'wishlist' | 'notifications' | 'location' | 'supabase' | 'chatList' | 'providerProfile' | null;

export interface NavSnapshot {
  tab: NavigationTab;
  listingId: string | null;
  conversationId: string | null;
  modal: ActiveModalType;
  profileSection?: ProfileSectionTab | null;
  createType?: CreateScreenType | null;
}

export interface LocationInfo {
  city: string;
  area: string;
  state: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

export type PortfolioPlatform = 'instagram' | 'website' | 'youtube' | 'behance' | 'linkedin' | 'facebook' | 'github' | 'other';

export interface PortfolioItem {
  id: string;
  title: string;
  platform?: PortfolioPlatform | string;
  description?: string;
  url?: string;
  link?: string;
  category?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: LocationInfo;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  memberSince: string;
  bio?: string;
  responseRate?: string;
  activeRole?: 'customer' | 'provider' | 'owner' | 'both';
  experienceYears?: number | string;
  experienceSummary?: string;
  skills?: string[];
  knowledge?: string;
  portfolio?: PortfolioItem[];
  isBanned?: boolean;
}

export interface ProductListing {
  id: string;
  type: 'product';
  title: string;
  category: string;
  subcategory?: string;
  description: string;
  condition: ProductCondition;
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerRating: number;
  ownerReviewCount: number;
  isOwnerVerified: boolean;
  pricePerUnit: number;
  unit: RentalPeriodUnit;
  securityDeposit: number;
  location: LocationInfo;
  distanceKm: number;
  available: boolean;
  features: string[];
  rules?: string[];
  createdAt: string;
  timesRented: number;
}

export interface ServicePackage {
  id?: string;
  name: string;
  price: number;
  description: string;
  unit?: string;
  includes?: string[];
  isActive?: boolean;
}

export interface ServiceListing {
  id: string;
  type: 'service';
  title: string;
  category: string;
  subcategory?: string;
  description: string;
  images: string[];
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerRating: number;
  providerReviewCount: number;
  isProviderVerified: boolean;
  startingPrice: number;
  unit: 'visit' | 'hour' | 'project' | 'session';
  serviceArea: string;
  location?: LocationInfo;
  distanceKm: number;
  available: boolean;
  skills: string[];
  packages?: ServicePackage[];
  createdAt: string;
  jobsCompleted?: number;
  portfolio?: PortfolioItem[];
  isFeatured?: boolean;
  featuredAt?: string;
}

export type ListingItem = ProductListing | ServiceListing;

export interface RentalRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  ownerId: string;
  ownerName: string;
  renterId: string;
  renterName: string;
  renterAvatar: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRate: number;
  totalAmount: number;
  securityDeposit: number;
  status: RequestStatus;
  pickupPreference: 'pickup' | 'delivery';
  deliveryAddress?: string;
  customerNote?: string;
  createdAt: string;
  hasReviewed?: boolean;
  termsAcknowledged?: boolean;
  acknowledgedAt?: string;
}

export interface ServiceBooking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  providerId: string;
  providerName: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  scheduledDate: string;
  scheduledTime: string;
  packageId?: string;
  packageName?: string;
  packagePrice?: number;
  totalAmount: number;
  serviceAddress: string;
  status: RequestStatus;
  customerNotes?: string;
  createdAt: string;
  hasReviewed?: boolean;
  termsAcknowledged?: boolean;
  termsVersion?: string;
  acknowledgedAt?: string;
}

export interface ServiceTermsAcknowledgement {
  id: string;
  requestId: string;
  userId: string;
  termsAcknowledged: boolean;
  termsVersion: string;
  acknowledgedAt: string;
}

export interface Review {
  id: string;
  transactionId: string;
  listingId?: string;
  listingTitle: string;
  targetUserId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  itemType: ItemType;
  verifiedRental: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachmentUrl?: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  listingPrice: string;
  itemType: ItemType;
  participantIds: string[];
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSenderId?: string;
  unreadCount: number;
  messages: Message[];
  updatedAt?: number | string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'rental_request' | 'booking_confirmed' | 'request_accepted' | 'request_rejected' | 'message' | 'reminder' | 'review' | 'need_response';
  timestamp: string;
  read: boolean;
  actionTargetId?: string;
  targetScreen?: string;
}

export interface NeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  description: string;
  type: ItemType;
  category: string;
  subcategory?: string;
  budget: number;
  neededDate: string;
  location: LocationInfo;
  createdAt: string;
  responsesCount: number;
  status: 'open' | 'fulfilled';
}

export interface UnifiedCategory {
  id: string;
  name: string;
  iconName: string;
  photoUrl?: string;
  image?: string;
  animatedIcon?: string;
  color: string;
  description: string;
  productSubcategories: string[];
  serviceSubcategories: string[];
}

export type CategoryOption = UnifiedCategory;

