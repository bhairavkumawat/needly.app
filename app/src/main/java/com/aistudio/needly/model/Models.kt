package com.aistudio.needly.model

data class LocationInfo(
    val city: String = "Udaipur",
    val area: String = "Fatehsagar & Panchwati",
    val state: String = "Rajasthan",
    val pincode: String = "313001",
    val latitude: Double = 24.5854,
    val longitude: Double = 73.7125,
    val displayName: String = "Fatehsagar, Udaipur"
)

enum class ProductCondition(val label: String) {
    LIKE_NEW("Like New"),
    EXCELLENT("Excellent"),
    GOOD("Good"),
    FAIR("Fair")
}

enum class RentalUnit(val label: String) {
    HOUR("hr"),
    DAY("day"),
    WEEK("week"),
    MONTH("mo")
}

enum class RequestStatus(val label: String) {
    PENDING("Pending"),
    ACCEPTED("Accepted"),
    ACTIVE("Active"),
    COMPLETED("Completed"),
    REJECTED("Rejected"),
    CANCELLED("Cancelled")
}

data class ProductListing(
    val id: String,
    val title: String,
    val category: String,
    val subcategory: String = "",
    val description: String,
    val condition: ProductCondition = ProductCondition.LIKE_NEW,
    val images: List<String> = emptyList(),
    val ownerId: String,
    val ownerName: String,
    val ownerAvatar: String = "",
    val ownerRating: Double = 4.9,
    val ownerReviewCount: Int = 18,
    val isOwnerVerified: Boolean = true,
    val pricePerUnit: Double,
    val unit: RentalUnit = RentalUnit.DAY,
    val securityDeposit: Double = 0.0,
    val location: LocationInfo = LocationInfo(),
    val distanceKm: Double = 1.2,
    val available: Boolean = true,
    val features: List<String> = emptyList(),
    val createdAt: String = ""
)

data class ServicePackage(
    val id: String,
    val name: String,
    val price: Double,
    val description: String,
    val includes: List<String> = emptyList()
)

data class ServiceListing(
    val id: String,
    val title: String,
    val category: String,
    val subcategory: String = "",
    val description: String,
    val images: List<String> = emptyList(),
    val providerId: String,
    val providerName: String,
    val providerAvatar: String = "",
    val providerRating: Double = 4.9,
    val providerReviewCount: Int = 24,
    val isProviderVerified: Boolean = true,
    val startingPrice: Double,
    val unit: String = "visit",
    val serviceArea: String = "Udaipur & nearby 15km",
    val location: LocationInfo = LocationInfo(),
    val distanceKm: Double = 2.4,
    val available: Boolean = true,
    val skills: List<String> = emptyList(),
    val packages: List<ServicePackage> = emptyList(),
    val jobsCompleted: Int = 42,
    val isFeatured: Boolean = false
)

data class NeedPost(
    val id: String,
    val userId: String,
    val userName: String,
    val userAvatar: String = "",
    val title: String,
    val description: String,
    val type: String = "service",
    val category: String,
    val budget: Double,
    val neededDate: String,
    val location: LocationInfo = LocationInfo(),
    val responsesCount: Int = 0,
    val status: String = "open"
)

data class RentalRequest(
    val id: String,
    val listingId: String,
    val listingTitle: String,
    val listingImage: String = "",
    val ownerId: String,
    val ownerName: String,
    val renterId: String,
    val renterName: String,
    val startDate: String,
    val endDate: String,
    val totalDays: Int = 1,
    val dailyRate: Double,
    val totalAmount: Double,
    val securityDeposit: Double,
    val status: RequestStatus = RequestStatus.PENDING,
    val pickupPreference: String = "pickup",
    val deliveryAddress: String = "",
    val customerNote: String = ""
)

data class ServiceBooking(
    val id: String,
    val listingId: String,
    val listingTitle: String,
    val listingImage: String = "",
    val providerId: String,
    val providerName: String,
    val customerId: String,
    val customerName: String,
    val scheduledDate: String,
    val scheduledTime: String,
    val totalAmount: Double,
    val serviceAddress: String,
    val status: RequestStatus = RequestStatus.PENDING,
    val customerNotes: String = ""
)

data class ChatMessage(
    val id: String,
    val senderId: String,
    val text: String,
    val timestamp: String,
    val isRead: Boolean = true
)

data class Conversation(
    val id: String,
    val listingId: String,
    val listingTitle: String,
    val otherUserName: String,
    val otherUserAvatar: String = "",
    val lastMessage: String,
    val lastMessageTime: String,
    val unreadCount: Int = 0,
    val messages: List<ChatMessage> = emptyList()
)

data class UserProfile(
    val id: String = "user_current",
    val name: String = "Bhairav Kumawat",
    val email: String = "bhairavgk999@gmail.com",
    val phone: String = "+91 98290 12345",
    val avatar: String = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    val location: LocationInfo = LocationInfo(),
    val isVerified: Boolean = true,
    val rating: Double = 4.95,
    val reviewCount: Int = 32,
    val memberSince: String = "January 2024",
    val activeRole: String = "both"
)

data class UnifiedCategory(
    val id: String,
    val name: String,
    val iconName: String,
    val colorHex: Long,
    val description: String,
    val subcategories: List<String>
)
