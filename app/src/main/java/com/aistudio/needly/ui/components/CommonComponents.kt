package com.aistudio.needly.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.needly.model.UnifiedCategory
import com.aistudio.needly.ui.MarketplaceFilter
import com.aistudio.needly.ui.NavTab
import com.aistudio.needly.ui.theme.*

@Composable
fun NeedlyTopBar(
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    locationName: String = "Fatehsagar, Udaipur",
    onWishlistClick: () -> Unit = {}
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp)
        ) {
            // Location and Brand Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(TealPrimary),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "N",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Needly",
                            fontWeight = FontWeight.Black,
                            fontSize = 18.sp,
                            color = TealDark
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = "Location",
                                tint = TealPrimary,
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(modifier = Modifier.width(3.dp))
                            Text(
                                text = locationName,
                                fontSize = 12.sp,
                                color = SlateTextSecondary,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                IconButton(
                    onClick = onWishlistClick,
                    modifier = Modifier.testTag("wishlist_header_button")
                ) {
                    Icon(
                        imageVector = Icons.Outlined.FavoriteBorder,
                        contentDescription = "Wishlist",
                        tint = SlateTextPrimary
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Search Box
            OutlinedTextField(
                value = searchQuery,
                onValueChange = onSearchChange,
                placeholder = {
                    Text(
                        "Search rentals, cameras, repairs...",
                        fontSize = 14.sp,
                        color = SlateTextSecondary
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = TealPrimary
                    )
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { onSearchChange("") }) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Clear search",
                                tint = SlateTextSecondary
                            )
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .testTag("search_bar_input"),
                shape = RoundedCornerShape(24.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TealPrimary,
                    unfocusedBorderColor = SlateBorder,
                    focusedContainerColor = SlateBackground,
                    unfocusedContainerColor = SlateBackground
                ),
                singleLine = true
            )
        }
    }
}

@Composable
fun CategoryPillsRow(
    categories: List<UnifiedCategory>,
    selectedCategory: String,
    onSelectCategory: (String) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        categories.forEach { category ->
            val isSelected = selectedCategory == category.id
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = if (isSelected) TealPrimary else SlateSurface,
                border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .clickable { onSelectCategory(category.id) }
                    .testTag("category_pill_${category.id}")
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = category.name,
                        color = if (isSelected) Color.White else SlateTextPrimary,
                        fontSize = 13.sp,
                        fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
                    )
                }
            }
        }
    }
}

@Composable
fun MarketplaceFilterRow(
    currentFilter: MarketplaceFilter,
    onFilterSelect: (MarketplaceFilter) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        val filters = listOf(
            MarketplaceFilter.ALL to "All",
            MarketplaceFilter.PRODUCTS to "Rentals",
            MarketplaceFilter.SERVICES to "Services",
            MarketplaceFilter.NEEDS to "Needs"
        )
        filters.forEach { (filter, label) ->
            val isSelected = currentFilter == filter
            Button(
                onClick = { onFilterSelect(filter) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isSelected) TealPrimary else SlateSurface,
                    contentColor = if (isSelected) Color.White else SlateTextSecondary
                ),
                border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(38.dp)
                    .testTag("filter_${label.lowercase()}"),
                contentPadding = PaddingValues(horizontal = 4.dp, vertical = 0.dp)
            ) {
                Text(
                    text = label,
                    fontSize = 12.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                )
            }
        }
    }
}

@Composable
fun BottomNavBar(
    currentTab: NavTab,
    onTabSelected: (NavTab) -> Unit,
    modifier: Modifier = Modifier
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp,
        modifier = modifier.testTag("bottom_navigation_bar")
    ) {
        NavigationBarItem(
            selected = currentTab == NavTab.HOME,
            onClick = { onTabSelected(NavTab.HOME) },
            icon = {
                Icon(
                    imageVector = if (currentTab == NavTab.HOME) Icons.Filled.Home else Icons.Outlined.Home,
                    contentDescription = "Home"
                )
            },
            label = { Text("Home", fontSize = 11.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = TealPrimary,
                selectedTextColor = TealPrimary,
                indicatorColor = TealContainer
            ),
            modifier = Modifier.testTag("nav_tab_home")
        )

        NavigationBarItem(
            selected = currentTab == NavTab.REQUESTS,
            onClick = { onTabSelected(NavTab.REQUESTS) },
            icon = {
                Icon(
                    imageVector = if (currentTab == NavTab.REQUESTS) Icons.Filled.DateRange else Icons.Outlined.DateRange,
                    contentDescription = "Requests"
                )
            },
            label = { Text("Bookings", fontSize = 11.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = TealPrimary,
                selectedTextColor = TealPrimary,
                indicatorColor = TealContainer
            ),
            modifier = Modifier.testTag("nav_tab_requests")
        )

        NavigationBarItem(
            selected = currentTab == NavTab.CREATE,
            onClick = { onTabSelected(NavTab.CREATE) },
            icon = {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(TealPrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Add,
                        contentDescription = "Create",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
            },
            label = { Text("Post", fontSize = 11.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = TealPrimary,
                selectedTextColor = TealPrimary,
                indicatorColor = Color.Transparent
            ),
            modifier = Modifier.testTag("nav_tab_create")
        )

        NavigationBarItem(
            selected = currentTab == NavTab.INBOX,
            onClick = { onTabSelected(NavTab.INBOX) },
            icon = {
                Icon(
                    imageVector = if (currentTab == NavTab.INBOX) Icons.Filled.Email else Icons.Outlined.Email,
                    contentDescription = "Inbox"
                )
            },
            label = { Text("Inbox", fontSize = 11.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = TealPrimary,
                selectedTextColor = TealPrimary,
                indicatorColor = TealContainer
            ),
            modifier = Modifier.testTag("nav_tab_inbox")
        )

        NavigationBarItem(
            selected = currentTab == NavTab.PROFILE,
            onClick = { onTabSelected(NavTab.PROFILE) },
            icon = {
                Icon(
                    imageVector = if (currentTab == NavTab.PROFILE) Icons.Filled.Person else Icons.Outlined.Person,
                    contentDescription = "Profile"
                )
            },
            label = { Text("Profile", fontSize = 11.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = TealPrimary,
                selectedTextColor = TealPrimary,
                indicatorColor = TealContainer
            ),
            modifier = Modifier.testTag("nav_tab_profile")
        )
    }
}
