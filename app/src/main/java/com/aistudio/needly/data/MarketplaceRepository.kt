package com.aistudio.needly.data

import com.aistudio.needly.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class MarketplaceRepository {

    val categories = listOf(
        UnifiedCategory("all", "All Needs", "Sparkles", 0xFF0D9488, "Browse all rentals & services", emptyList()),
        UnifiedCategory("photography", "Photography", "Camera", 0xFF8B5CF6, "Cameras, lenses, drones & shoots", listOf("DSLR Cameras", "Lenses", "Drones", "Videographers")),
        UnifiedCategory("electronics", "Electronics", "Tv", 0xFF6366F1, "Projectors, audio systems & gaming", listOf("Projectors", "Consoles", "Sound Systems", "Laptops")),
        UnifiedCategory("home", "Home Services", "Home", 0xFF10B981, "Cleaning, plumbing & electrical", listOf("Deep Cleaning", "Plumbing", "Electrical", "AC Repair")),
        UnifiedCategory("tools", "Tools & Equipment", "Wrench", 0xFFF59E0B, "Power drills, saws & lawnmowers", listOf("Power Tools", "Ladders", "Hand Tools")),
        UnifiedCategory("vehicles", "Vehicles & Bikes", "Car", 0xFFEC4899, "Self-drive cars, scooters & cycles", listOf("Scooters", "Mountain Bikes", "Cars")),
        UnifiedCategory("events", "Events & Party", "PartyPopper", 0xFFEF4444, "Lighting, tents & sound gear", listOf("Party Speakers", "Stage Lights", "Tents")),
        UnifiedCategory("fitness", "Sports & Fitness", "Dumbbell", 0xFF3B82F6, "Treadmills, weights & outdoor camping", listOf("Tents", "Dumbbells", "Bicycles"))
    )

    private val _products = MutableStateFlow(listOf(
        ProductListing(
            id = "prod_1",
            title = "Sony Alpha A7 IV Full-Frame Camera",
            category = "photography",
            subcategory = "DSLR Cameras",
            description = "33MP Full-frame sensor, 4K 60p video, with 24-70mm f/2.8 GM lens and 2 high-speed batteries. Perfect for weddings and commercial shoots.",
            condition = ProductCondition.LIKE_NEW,
            images = listOf("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop"),
            ownerId = "owner_1",
            ownerName = "Prakash Rathore",
            ownerAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            pricePerUnit = 1499.0,
            unit = RentalUnit.DAY,
            securityDeposit = 5000.0,
            distanceKm = 1.4,
            features = listOf("33MP Full-Frame", "24-70mm f/2.8 GM Lens", "2 Batteries + 128GB Card")
        ),
        ProductListing(
            id = "prod_2",
            title = "Epson Full HD 4K Home Cinema Projector",
            category = "electronics",
            subcategory = "Projectors",
            description = "3,000 lumens high brightness, ultra-sharp 4K HDR projection up to 150 inches with HDMI cables and portable fold stand.",
            condition = ProductCondition.EXCELLENT,
            images = listOf("https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop"),
            ownerId = "owner_2",
            ownerName = "Manish Vyas",
            ownerAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
            pricePerUnit = 699.0,
            unit = RentalUnit.DAY,
            securityDeposit = 2500.0,
            distanceKm = 2.1,
            features = listOf("3,000 Lumens", "120-inch Portable Screen", "HDMI & Bluetooth Audio")
        ),
        ProductListing(
            id = "prod_3",
            title = "Bosch Professional Hammer Drill Machine Set",
            category = "tools",
            subcategory = "Power Tools",
            description = "Heavy duty 750W impact drill with complete 45-piece masonry, wood and metal drill bit kit and sturdy carrying case.",
            condition = ProductCondition.LIKE_NEW,
            images = listOf("https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop"),
            ownerId = "owner_3",
            ownerName = "Arjun Singh",
            ownerAvatar = "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
            pricePerUnit = 299.0,
            unit = RentalUnit.DAY,
            securityDeposit = 1000.0,
            distanceKm = 0.8,
            features = listOf("750W Powerful Motor", "45-Piece Bit Set", "Depth Stop & Aux Handle")
        ),
        ProductListing(
            id = "prod_4",
            title = "Quechua 4-Person Waterproof Camping Tent",
            category = "fitness",
            subcategory = "Tents",
            description = "Easy 10-minute setup, windproof and thermal insulated. Includes 2 compact foam sleeping mats and battery lantern.",
            condition = ProductCondition.GOOD,
            images = listOf("https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop"),
            ownerId = "owner_4",
            ownerName = "Sneha Sharma",
            ownerAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            pricePerUnit = 450.0,
            unit = RentalUnit.DAY,
            securityDeposit = 1200.0,
            distanceKm = 3.5,
            features = listOf("Sleeps 4 Comfortably", "100% Waterproof", "Includes 2 Sleeping Mats")
        )
    ))
    val products: StateFlow<List<ProductListing>> = _products.asStateFlow()

    private val _services = MutableStateFlow(listOf(
        ServiceListing(
            id = "serv_1",
            title = "Full Home Deep Cleaning & Sanitization",
            category = "home",
            subcategory = "Deep Cleaning",
            description = "Thorough deep scrub of kitchen, degreasing exhaust, bathroom descaling, sofa vacuuming and floor scrubbing with organic eco-friendly disinfectants.",
            images = listOf("https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop"),
            providerId = "prov_1",
            providerName = "Kailash Meena",
            providerAvatar = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
            providerRating = 4.95,
            providerReviewCount = 48,
            startingPrice = 499.0,
            unit = "visit",
            serviceArea = "Udaipur (All Sectors & Fatehsagar)",
            distanceKm = 1.8,
            skills = listOf("Kitchen Degreasing", "Bathroom Descaling", "Sofa Shampooing"),
            packages = listOf(
                ServicePackage("pkg_1", "1 BHK / Studio Complete Clean", 1299.0, "Complete dust, scrub, bathroom sanitization", listOf("Floor Buffing", "Bathroom Clean", "Balcony Wash")),
                ServicePackage("pkg_2", "2-3 BHK Premium Deep Clean", 2499.0, "Full home deep scrub with machine sofa polish", listOf("Complete Kitchen", "2 Bathrooms", "Full Balcony & Windows"))
            ),
            isFeatured = true
        ),
        ServiceListing(
            id = "serv_2",
            title = "Emergency Electrical Repairs & Inverter Wiring",
            category = "home",
            subcategory = "Electrical",
            description = "30-minute rapid doorstep response for short circuits, tripped MCBs, fan capacitor replacement, light fixtures and inverter setup.",
            images = listOf("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop"),
            providerId = "prov_2",
            providerName = "Ramesh Sharma",
            providerAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            providerRating = 4.88,
            providerReviewCount = 65,
            startingPrice = 199.0,
            unit = "visit",
            serviceArea = "Udaipur & 15km Radius",
            distanceKm = 1.1,
            skills = listOf("Certified Wireman", "30-Min Rapid Arrival", "Brings Multimeter & Parts")
        ),
        ServiceListing(
            id = "serv_3",
            title = "Professional Cinematic Wedding & Event Photographer",
            category = "photography",
            subcategory = "Photographers",
            description = "Capturing spontaneous candid moments, pre-wedding destination shoots around Udaipur lakes and royal palace portraits.",
            images = listOf("https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&auto=format&fit=crop"),
            providerId = "prov_3",
            providerName = "Aman Sayyed",
            providerAvatar = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
            providerRating = 5.0,
            providerReviewCount = 38,
            startingPrice = 2999.0,
            unit = "session",
            serviceArea = "Fatehsagar, Lake Pichola & All Udaipur",
            distanceKm = 2.0,
            skills = listOf("Sony FX3 Cinema Rig", "Color Graded RAW Delivery", "Drone 4K Shoots")
        )
    ))
    val services: StateFlow<List<ServiceListing>> = _services.asStateFlow()

    private val _needs = MutableStateFlow(listOf(
        NeedPost(
            id = "need_1",
            userId = "user_101",
            userName = "Rohit Gehlot",
            userAvatar = "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
            title = "Need 85mm Portrait Lens for Weekend Shoot",
            description = "Looking to rent Sony E-mount 85mm f/1.4 or f/1.8 lens for 2 days (Saturday & Sunday). Can pickup anywhere near Sukhadia Circle.",
            type = "product",
            category = "photography",
            budget = 1200.0,
            neededDate = "This Weekend",
            responsesCount = 3
        ),
        NeedPost(
            id = "need_2",
            userId = "user_102",
            userName = "Pooja Mehta",
            userAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
            title = "Need AC Gas Refill & Jet Cleaning Urgently",
            description = "1.5 Ton Split AC is blowing warm air in Sector 4, Hiran Magri. Need technician today afternoon.",
            type = "service",
            category = "home",
            budget = 1500.0,
            neededDate = "Today, 3:00 PM",
            responsesCount = 5
        )
    ))
    val needs: StateFlow<List<NeedPost>> = _needs.asStateFlow()

    private val _requests = MutableStateFlow(listOf(
        RentalRequest(
            id = "req_1",
            listingId = "prod_1",
            listingTitle = "Sony Alpha A7 IV Full-Frame Camera",
            listingImage = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
            ownerId = "owner_1",
            ownerName = "Prakash Rathore",
            renterId = "user_current",
            renterName = "Bhairav Kumawat",
            startDate = "Tomorrow",
            endDate = "Day After",
            totalDays = 2,
            dailyRate = 1499.0,
            totalAmount = 2998.0,
            securityDeposit = 5000.0,
            status = RequestStatus.ACCEPTED,
            pickupPreference = "pickup"
        )
    ))
    val requests: StateFlow<List<RentalRequest>> = _requests.asStateFlow()

    private val _bookings = MutableStateFlow(listOf(
        ServiceBooking(
            id = "book_1",
            listingId = "serv_1",
            listingTitle = "Full Home Deep Cleaning & Sanitization",
            listingImage = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
            providerId = "prov_1",
            providerName = "Kailash Meena",
            customerId = "user_current",
            customerName = "Bhairav Kumawat",
            scheduledDate = "Saturday, 10:00 AM",
            scheduledTime = "10:00 AM - 1:00 PM",
            totalAmount = 1299.0,
            serviceAddress = "Panchwati, Udaipur",
            status = RequestStatus.ACTIVE
        )
    ))
    val bookings: StateFlow<List<ServiceBooking>> = _bookings.asStateFlow()

    private val _conversations = MutableStateFlow(listOf(
        Conversation(
            id = "conv_1",
            listingId = "prod_1",
            listingTitle = "Sony Alpha A7 IV Camera",
            otherUserName = "Prakash Rathore",
            otherUserAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            lastMessage = "Yes, you can pick it up tomorrow at 9:00 AM from Fatehsagar.",
            lastMessageTime = "10:45 AM",
            unreadCount = 1,
            messages = listOf(
                ChatMessage("m1", "user_current", "Hi Prakash, is the Sony A7 IV available for tomorrow?", "10:30 AM"),
                ChatMessage("m2", "owner_1", "Hello! Yes, it is fully charged and ready with two extra batteries.", "10:38 AM"),
                ChatMessage("m3", "owner_1", "Yes, you can pick it up tomorrow at 9:00 AM from Fatehsagar.", "10:45 AM")
            )
        ),
        Conversation(
            id = "conv_2",
            listingId = "serv_1",
            listingTitle = "Full Home Deep Cleaning",
            otherUserName = "Kailash Meena",
            otherUserAvatar = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
            lastMessage = "Our team will reach Panchwati by 10 AM.",
            lastMessageTime = "Yesterday",
            unreadCount = 0,
            messages = listOf(
                ChatMessage("m4", "user_current", "Booking confirmed for Saturday 10 AM.", "Yesterday"),
                ChatMessage("m5", "prov_1", "Our team will reach Panchwati by 10 AM.", "Yesterday")
            )
        )
    ))
    val conversations: StateFlow<List<Conversation>> = _conversations.asStateFlow()

    val currentUser = UserProfile()

    fun addProduct(product: ProductListing) {
        _products.value = listOf(product) + _products.value
    }

    fun addService(service: ServiceListing) {
        _services.value = listOf(service) + _services.value
    }

    fun addNeed(need: NeedPost) {
        _needs.value = listOf(need) + _needs.value
    }

    fun addRentalRequest(request: RentalRequest) {
        _requests.value = listOf(request) + _requests.value
    }

    fun addServiceBooking(booking: ServiceBooking) {
        _bookings.value = listOf(booking) + _bookings.value
    }

    fun sendMessage(convId: String, text: String) {
        _conversations.value = _conversations.value.map { conv ->
            if (conv.id == convId) {
                val newMsg = ChatMessage(
                    id = "msg_${System.currentTimeMillis()}",
                    senderId = "user_current",
                    text = text,
                    timestamp = "Just now"
                )
                conv.copy(
                    lastMessage = text,
                    lastMessageTime = "Just now",
                    messages = conv.messages + newMsg
                )
            } else {
                conv
            }
        }
    }
}
