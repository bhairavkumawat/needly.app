package com.aistudio.needly.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.needly.ui.MarketplaceFilter
import com.aistudio.needly.ui.MarketplaceViewModel
import com.aistudio.needly.ui.components.*
import com.aistudio.needly.ui.theme.SlateTextPrimary
import com.aistudio.needly.ui.theme.SlateTextSecondary
import com.aistudio.needly.ui.theme.TealPrimary

@Composable
fun HomeScreen(
    viewModel: MarketplaceViewModel,
    modifier: Modifier = Modifier
) {
    val categories by remember { mutableStateOf(viewModel.categories) }
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val marketplaceFilter by viewModel.marketplaceFilter.collectAsState()
    val products by viewModel.products.collectAsState()
    val services by viewModel.services.collectAsState()
    val needs by viewModel.needs.collectAsState()
    val wishlist by viewModel.wishlist.collectAsState()

    // Filtered lists
    val filteredProducts = remember(products, selectedCategory, searchQuery) {
        products.filter { p ->
            (selectedCategory == "all" || p.category == selectedCategory) &&
            (searchQuery.isEmpty() || p.title.contains(searchQuery, ignoreCase = true) || p.description.contains(searchQuery, ignoreCase = true))
        }
    }

    val filteredServices = remember(services, selectedCategory, searchQuery) {
        services.filter { s ->
            (selectedCategory == "all" || s.category == selectedCategory) &&
            (searchQuery.isEmpty() || s.title.contains(searchQuery, ignoreCase = true) || s.description.contains(searchQuery, ignoreCase = true))
        }
    }

    val filteredNeeds = remember(needs, selectedCategory, searchQuery) {
        needs.filter { n ->
            (selectedCategory == "all" || n.category == selectedCategory) &&
            (searchQuery.isEmpty() || n.title.contains(searchQuery, ignoreCase = true) || n.description.contains(searchQuery, ignoreCase = true))
        }
    }

    Scaffold(
        topBar = {
            NeedlyTopBar(
                searchQuery = searchQuery,
                onSearchChange = { viewModel.setSearchQuery(it) }
            )
        },
        modifier = modifier.fillMaxSize().testTag("home_screen_scaffold")
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(bottom = 80.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Horizontal categories rail
            item {
                CategoryPillsRow(
                    categories = categories,
                    selectedCategory = selectedCategory,
                    onSelectCategory = { viewModel.selectCategory(it) }
                )
            }

            // Filter Tabs: All / Rentals / Services / Needs
            item {
                MarketplaceFilterRow(
                    currentFilter = marketplaceFilter,
                    onFilterSelect = { viewModel.setMarketplaceFilter(it) }
                )
            }

            // PRODUCTS SECTION
            if (marketplaceFilter == MarketplaceFilter.ALL || marketplaceFilter == MarketplaceFilter.PRODUCTS) {
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Featured Rentals",
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = SlateTextPrimary
                        )
                        Text(
                            text = "${filteredProducts.size} available",
                            fontSize = 12.sp,
                            color = TealPrimary,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                if (filteredProducts.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("No rental products match your filters.", color = SlateTextSecondary, fontSize = 13.sp)
                        }
                    }
                } else {
                    items(filteredProducts) { product ->
                        ProductCard(
                            product = product,
                            isWishlisted = wishlist.contains(product.id),
                            onWishlistToggle = { viewModel.toggleWishlist(product.id) },
                            onClick = { viewModel.openProductDetail(product) },
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                    }
                }
            }

            // SERVICES SECTION
            if (marketplaceFilter == MarketplaceFilter.ALL || marketplaceFilter == MarketplaceFilter.SERVICES) {
                item {
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Verified Local Experts",
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = SlateTextPrimary
                        )
                        Text(
                            text = "${filteredServices.size} pros",
                            fontSize = 12.sp,
                            color = TealPrimary,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                if (filteredServices.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("No services found in this category.", color = SlateTextSecondary, fontSize = 13.sp)
                        }
                    }
                } else {
                    items(filteredServices) { service ->
                        ServiceCard(
                            service = service,
                            isWishlisted = wishlist.contains(service.id),
                            onWishlistToggle = { viewModel.toggleWishlist(service.id) },
                            onClick = { viewModel.openServiceDetail(service) },
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                    }
                }
            }

            // COMMUNITY NEEDS SECTION
            if (marketplaceFilter == MarketplaceFilter.ALL || marketplaceFilter == MarketplaceFilter.NEEDS) {
                item {
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Community Requests",
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = SlateTextPrimary
                        )
                        Text(
                            text = "${filteredNeeds.size} open needs",
                            fontSize = 12.sp,
                            color = TealPrimary,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                if (filteredNeeds.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("No open community needs found.", color = SlateTextSecondary, fontSize = 13.sp)
                        }
                    }
                } else {
                    items(filteredNeeds) { need ->
                        NeedListingCard(
                            need = need,
                            onClick = { viewModel.openNeedDetail(need) },
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                    }
                }
            }
        }
    }
}
