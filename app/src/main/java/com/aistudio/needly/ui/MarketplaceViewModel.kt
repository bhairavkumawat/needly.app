package com.aistudio.needly.ui

import androidx.lifecycle.ViewModel
import com.aistudio.needly.data.MarketplaceRepository
import com.aistudio.needly.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class NavTab {
    HOME,
    REQUESTS,
    CREATE,
    INBOX,
    PROFILE
}

enum class MarketplaceFilter {
    ALL,
    PRODUCTS,
    SERVICES,
    NEEDS
}

class MarketplaceViewModel(
    private val repository: MarketplaceRepository = MarketplaceRepository()
) : ViewModel() {

    val categories = repository.categories
    val products = repository.products
    val services = repository.services
    val needs = repository.needs
    val requests = repository.requests
    val bookings = repository.bookings
    val conversations = repository.conversations
    val currentUser = repository.currentUser

    private val _currentTab = MutableStateFlow(NavTab.HOME)
    val currentTab: StateFlow<NavTab> = _currentTab.asStateFlow()

    private val _selectedCategory = MutableStateFlow("all")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _marketplaceFilter = MutableStateFlow(MarketplaceFilter.ALL)
    val marketplaceFilter: StateFlow<MarketplaceFilter> = _marketplaceFilter.asStateFlow()

    private val _selectedProduct = MutableStateFlow<ProductListing?>(null)
    val selectedProduct: StateFlow<ProductListing?> = _selectedProduct.asStateFlow()

    private val _selectedService = MutableStateFlow<ServiceListing?>(null)
    val selectedService: StateFlow<ServiceListing?> = _selectedService.asStateFlow()

    private val _selectedNeed = MutableStateFlow<NeedPost?>(null)
    val selectedNeed: StateFlow<NeedPost?> = _selectedNeed.asStateFlow()

    private val _selectedConversation = MutableStateFlow<Conversation?>(null)
    val selectedConversation: StateFlow<Conversation?> = _selectedConversation.asStateFlow()

    private val _wishlist = MutableStateFlow<Set<String>>(setOf("prod_1", "serv_1"))
    val wishlist: StateFlow<Set<String>> = _wishlist.asStateFlow()

    private val _bookingSuccessMessage = MutableStateFlow<String?>(null)
    val bookingSuccessMessage: StateFlow<String?> = _bookingSuccessMessage.asStateFlow()

    fun selectTab(tab: NavTab) {
        _currentTab.value = tab
    }

    fun selectCategory(catId: String) {
        _selectedCategory.value = if (_selectedCategory.value == catId) "all" else catId
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setMarketplaceFilter(filter: MarketplaceFilter) {
        _marketplaceFilter.value = filter
    }

    fun openProductDetail(product: ProductListing) {
        _selectedProduct.value = product
    }

    fun closeProductDetail() {
        _selectedProduct.value = null
    }

    fun openServiceDetail(service: ServiceListing) {
        _selectedService.value = service
    }

    fun closeServiceDetail() {
        _selectedService.value = null
    }

    fun openNeedDetail(need: NeedPost) {
        _selectedNeed.value = need
    }

    fun closeNeedDetail() {
        _selectedNeed.value = null
    }

    fun openConversation(conversation: Conversation) {
        _selectedConversation.value = conversation
    }

    fun closeConversation() {
        _selectedConversation.value = null
    }

    fun toggleWishlist(id: String) {
        val current = _wishlist.value
        _wishlist.value = if (current.contains(id)) current - id else current + id
    }

    fun createRentalBooking(product: ProductListing, days: Int, note: String) {
        val request = RentalRequest(
            id = "req_${System.currentTimeMillis()}",
            listingId = product.id,
            listingTitle = product.title,
            listingImage = product.images.firstOrNull() ?: "",
            ownerId = product.ownerId,
            ownerName = product.ownerName,
            renterId = currentUser.id,
            renterName = currentUser.name,
            startDate = "Tomorrow",
            endDate = "$days days from tomorrow",
            totalDays = days,
            dailyRate = product.pricePerUnit,
            totalAmount = product.pricePerUnit * days,
            securityDeposit = product.securityDeposit,
            customerNote = note
        )
        repository.addRentalRequest(request)
        _bookingSuccessMessage.value = "Rental request sent to ${product.ownerName}!"
        closeProductDetail()
        selectTab(NavTab.REQUESTS)
    }

    fun createServiceBooking(service: ServiceListing, date: String, time: String, address: String) {
        val booking = ServiceBooking(
            id = "book_${System.currentTimeMillis()}",
            listingId = service.id,
            listingTitle = service.title,
            listingImage = service.images.firstOrNull() ?: "",
            providerId = service.providerId,
            providerName = service.providerName,
            customerId = currentUser.id,
            customerName = currentUser.name,
            scheduledDate = date,
            scheduledTime = time,
            totalAmount = service.startingPrice,
            serviceAddress = address.ifEmpty { "Fatehsagar, Udaipur" }
        )
        repository.addServiceBooking(booking)
        _bookingSuccessMessage.value = "Service booking confirmed with ${service.providerName}!"
        closeServiceDetail()
        selectTab(NavTab.REQUESTS)
    }

    fun addProductListing(title: String, category: String, price: Double, deposit: Double, desc: String) {
        val product = ProductListing(
            id = "prod_${System.currentTimeMillis()}",
            title = title,
            category = category,
            description = desc,
            pricePerUnit = price,
            securityDeposit = deposit,
            ownerId = currentUser.id,
            ownerName = currentUser.name,
            images = listOf("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800")
        )
        repository.addProduct(product)
        _bookingSuccessMessage.value = "Listing published successfully!"
        selectTab(NavTab.HOME)
    }

    fun addServiceListing(title: String, category: String, price: Double, desc: String, skills: List<String>) {
        val service = ServiceListing(
            id = "serv_${System.currentTimeMillis()}",
            title = title,
            category = category,
            description = desc,
            startingPrice = price,
            skills = skills,
            providerId = currentUser.id,
            providerName = currentUser.name,
            images = listOf("https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800")
        )
        repository.addService(service)
        _bookingSuccessMessage.value = "Service published successfully!"
        selectTab(NavTab.HOME)
    }

    fun addNeedPost(title: String, category: String, budget: Double, date: String, desc: String) {
        val need = NeedPost(
            id = "need_${System.currentTimeMillis()}",
            userId = currentUser.id,
            userName = currentUser.name,
            title = title,
            category = category,
            budget = budget,
            neededDate = date,
            description = desc
        )
        repository.addNeed(need)
        _bookingSuccessMessage.value = "Community need posted!"
        selectTab(NavTab.REQUESTS)
    }

    fun sendChatMessage(convId: String, text: String) {
        repository.sendMessage(convId, text)
    }

    fun clearSuccessMessage() {
        _bookingSuccessMessage.value = null
    }
}
