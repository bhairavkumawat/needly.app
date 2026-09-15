package com.aistudio.needly.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.needly.model.RentalRequest
import com.aistudio.needly.model.RequestStatus
import com.aistudio.needly.model.ServiceBooking
import com.aistudio.needly.ui.MarketplaceViewModel
import com.aistudio.needly.ui.theme.*

@Composable
fun RequestsScreen(
    viewModel: MarketplaceViewModel,
    modifier: Modifier = Modifier
) {
    val requests by viewModel.requests.collectAsState()
    val bookings by viewModel.bookings.collectAsState()

    var selectedTab by remember { mutableStateOf(0) } // 0: Rentals, 1: Services

    Scaffold(
        topBar = {
            Surface(
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 2.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = "My Bookings & Orders",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp,
                        color = SlateTextPrimary
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    TabRow(
                        selectedTabIndex = selectedTab,
                        containerColor = SlateBackground,
                        contentColor = TealPrimary,
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .height(44.dp)
                    ) {
                        Tab(
                            selected = selectedTab == 0,
                            onClick = { selectedTab = 0 },
                            text = { Text("Product Rentals (${requests.size})", fontWeight = FontWeight.SemiBold) }
                        )
                        Tab(
                            selected = selectedTab == 1,
                            onClick = { selectedTab = 1 },
                            text = { Text("Service Bookings (${bookings.size})", fontWeight = FontWeight.SemiBold) }
                        )
                    }
                }
            }
        },
        modifier = modifier.fillMaxSize().testTag("requests_screen_scaffold")
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp, bottom = 80.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            if (selectedTab == 0) {
                if (requests.isEmpty()) {
                    item {
                        EmptyBookingsState("No rental requests yet.", "Explore camera gear, projectors and tools on Home.")
                    }
                } else {
                    items(requests) { req ->
                        RentalRequestCard(req)
                    }
                }
            } else {
                if (bookings.isEmpty()) {
                    item {
                        EmptyBookingsState("No service bookings yet.", "Book home cleaning, electricians or photographers on Home.")
                    }
                } else {
                    items(bookings) { booking ->
                        ServiceBookingCard(booking)
                    }
                }
            }
        }
    }
}

@Composable
fun RentalRequestCard(req: RentalRequest) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth().testTag("rental_request_${req.id}")
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Rental #${req.id.takeLast(5).uppercase()}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateTextSecondary
                )
                StatusChip(req.status)
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = req.listingTitle,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = SlateTextPrimary
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Owner: ${req.ownerName}", fontSize = 12.sp, color = SlateTextSecondary)
                Text("Duration: ${req.totalDays} days", fontSize = 12.sp, color = SlateTextSecondary)
            }

            Spacer(modifier = Modifier.height(6.dp))

            Divider(color = SlateBorder, thickness = 0.8.dp)

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Total Amount", fontSize = 11.sp, color = SlateTextSecondary)
                    Text("₹${req.totalAmount.toInt()}", fontSize = 16.sp, fontWeight = FontWeight.Black, color = TealPrimary)
                }
                if (req.securityDeposit > 0) {
                    Column(horizontalAlignment = Alignment.End) {
                        Text("Deposit Held", fontSize = 11.sp, color = SlateTextSecondary)
                        Text("₹${req.securityDeposit.toInt()}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = SlateTextPrimary)
                    }
                }
            }
        }
    }
}

@Composable
fun ServiceBookingCard(booking: ServiceBooking) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth().testTag("service_booking_${booking.id}")
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Booking #${booking.id.takeLast(5).uppercase()}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateTextSecondary
                )
                StatusChip(booking.status)
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = booking.listingTitle,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = SlateTextPrimary
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.DateRange, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "${booking.scheduledDate} • ${booking.scheduledTime}",
                    fontSize = 12.sp,
                    color = SlateTextSecondary,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Address: ${booking.serviceAddress}",
                fontSize = 12.sp,
                color = SlateTextSecondary
            )

            Spacer(modifier = Modifier.height(8.dp))

            Divider(color = SlateBorder, thickness = 0.8.dp)

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Service Fee", fontSize = 11.sp, color = SlateTextSecondary)
                    Text("₹${booking.totalAmount.toInt()}", fontSize = 16.sp, fontWeight = FontWeight.Black, color = TealPrimary)
                }
                Text("Provider: ${booking.providerName}", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = TealDark)
            }
        }
    }
}

@Composable
fun StatusChip(status: RequestStatus) {
    val (bgColor, textColor) = when (status) {
        RequestStatus.PENDING -> AmberLight to AmberAccent
        RequestStatus.ACCEPTED -> TealContainer to TealDark
        RequestStatus.ACTIVE -> Color(0xFFE0F2FE) to Color(0xFF0284C7)
        RequestStatus.COMPLETED -> Color(0xFFDCFCE7) to Color(0xFF16A34A)
        RequestStatus.REJECTED, RequestStatus.CANCELLED -> Color(0xFFFEE2E2) to Color(0xFFDC2626)
    }

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = bgColor
    ) {
        Text(
            text = status.label,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        )
    }
}

@Composable
fun EmptyBookingsState(title: String, subtitle: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 40.dp, horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(title, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = SlateTextPrimary)
        Spacer(modifier = Modifier.height(6.dp))
        Text(subtitle, fontSize = 13.sp, color = SlateTextSecondary, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
    }
}
