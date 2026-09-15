package com.aistudio.needly.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Star
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
import com.aistudio.needly.model.NeedPost
import com.aistudio.needly.model.ProductListing
import com.aistudio.needly.model.ServiceListing
import com.aistudio.needly.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailSheet(
    product: ProductListing,
    onDismiss: () -> Unit,
    onBook: (days: Int, note: String) -> Unit
) {
    var rentalDays by remember { mutableStateOf(2) }
    var customerNote by remember { mutableStateOf("") }

    val totalRent = product.pricePerUnit * rentalDays
    val totalEstimated = totalRent + product.securityDeposit

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 10.dp)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 30.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header Image Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(TealContainer),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = product.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = TealDark,
                    modifier = Modifier.padding(16.dp)
                )
            }

            // Title & Condition
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = product.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = SlateTextPrimary,
                    modifier = Modifier.weight(1f)
                )
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = TealContainer
                ) {
                    Text(
                        text = product.condition.label,
                        color = OnTealContainer,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }

            // Owner row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(TealPrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = product.ownerName.take(1),
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = product.ownerName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(14.dp))
                    }
                    Text(
                        text = "Verified Lender • ${product.distanceKm} km from you",
                        fontSize = 11.sp,
                        color = SlateTextSecondary
                    )
                }
            }

            Text("About this item", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SlateTextPrimary)
            Text(product.description, fontSize = 13.sp, color = SlateTextSecondary, lineHeight = 18.sp)

            // Duration selector
            Text("Select Rental Duration", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SlateTextPrimary)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(1, 2, 3, 5, 7).forEach { days ->
                    val isSelected = rentalDays == days
                    OutlinedButton(
                        onClick = { rentalDays = days },
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = if (isSelected) TealPrimary else SlateSurface,
                            contentColor = if (isSelected) Color.White else SlateTextPrimary
                        ),
                        border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("${days}d", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }

            // Price Breakdown Card
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = SlateBackground,
                border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Daily Rate (₹${product.pricePerUnit.toInt()} x $rentalDays days)", fontSize = 12.sp, color = SlateTextSecondary)
                        Text("₹${totalRent.toInt()}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = SlateTextPrimary)
                    }
                    if (product.securityDeposit > 0) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Refundable Security Deposit", fontSize = 12.sp, color = SlateTextSecondary)
                            Text("₹${product.securityDeposit.toInt()}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = SlateTextPrimary)
                        }
                    }
                    Divider(color = SlateBorder, thickness = 0.8.dp, modifier = Modifier.padding(vertical = 4.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Total Payable", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = SlateTextPrimary)
                        Text("₹${totalEstimated.toInt()}", fontSize = 16.sp, fontWeight = FontWeight.Black, color = TealPrimary)
                    }
                }
            }

            // Note input
            OutlinedTextField(
                value = customerNote,
                onValueChange = { customerNote = it },
                placeholder = { Text("Add pickup note or request delivery...", fontSize = 13.sp) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            // Submit Button
            Button(
                onClick = { onBook(rentalDays, customerNote) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .testTag("confirm_rental_button"),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
            ) {
                Text(
                    text = "Request to Rent for ₹${totalRent.toInt()}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ServiceDetailSheet(
    service: ServiceListing,
    onDismiss: () -> Unit,
    onBook: (date: String, time: String, address: String) -> Unit
) {
    var selectedDate by remember { mutableStateOf("Tomorrow") }
    var selectedTime by remember { mutableStateOf("10:00 AM") }
    var address by remember { mutableStateOf("Fatehsagar, Udaipur") }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 10.dp)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 30.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Text(
                text = service.title,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = SlateTextPrimary
            )

            // Provider Info
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(TealPrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = service.providerName.take(1),
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(service.providerName, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(14.dp))
                    }
                    Text("${service.providerRating} Rating (${service.providerReviewCount} verified jobs)", fontSize = 12.sp, color = SlateTextSecondary)
                }
            }

            Text("Service Scope", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SlateTextPrimary)
            Text(service.description, fontSize = 13.sp, color = SlateTextSecondary, lineHeight = 18.sp)

            // Skills
            Text("Specializations", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SlateTextPrimary)
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                service.skills.forEach { skill ->
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = TealContainer
                    ) {
                        Text(
                            text = skill,
                            color = OnTealContainer,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }

            // Booking Schedule
            Text("Schedule Doorstep Visit", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SlateTextPrimary)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("Today", "Tomorrow", "Weekend").forEach { d ->
                    val isSelected = selectedDate == d
                    OutlinedButton(
                        onClick = { selectedDate = d },
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = if (isSelected) TealPrimary else SlateSurface,
                            contentColor = if (isSelected) Color.White else SlateTextPrimary
                        ),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(d, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            // Address
            OutlinedTextField(
                value = address,
                onValueChange = { address = it },
                label = { Text("Service Address in Udaipur") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            // Submit Button
            Button(
                onClick = { onBook(selectedDate, selectedTime, address) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .testTag("confirm_service_booking"),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
            ) {
                Text(
                    text = "Confirm Booking for ₹${service.startingPrice.toInt()}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NeedDetailSheet(
    need: NeedPost,
    onDismiss: () -> Unit,
    onOfferHelp: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 10.dp)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 30.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = need.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = SlateTextPrimary,
                    modifier = Modifier.weight(1f)
                )
                Surface(shape = RoundedCornerShape(12.dp), color = TealContainer) {
                    Text(
                        text = "Budget: ₹${need.budget.toInt()}",
                        color = OnTealContainer,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Text(
                text = "Posted by ${need.userName} • Needed by ${need.neededDate}",
                fontSize = 12.sp,
                color = SlateTextSecondary
            )

            Divider(color = SlateBorder, thickness = 0.8.dp)

            Text("Request Description", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text(need.description, fontSize = 13.sp, color = SlateTextSecondary, lineHeight = 18.sp)

            Button(
                onClick = onOfferHelp,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .testTag("offer_help_button"),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
            ) {
                Text("Send Offer / Contact ${need.userName}", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
        }
    }
}
