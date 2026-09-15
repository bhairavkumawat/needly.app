package com.aistudio.needly.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.needly.ui.MarketplaceViewModel
import com.aistudio.needly.ui.theme.*

@Composable
fun CreateListingScreen(
    viewModel: MarketplaceViewModel,
    modifier: Modifier = Modifier
) {
    var listingType by remember { mutableStateOf(0) } // 0: Product Rental, 1: Service, 2: Post Need
    var title by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("photography") }
    var price by remember { mutableStateOf("") }
    var deposit by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var skillInput by remember { mutableStateOf("") }
    var dateInput by remember { mutableStateOf("Tomorrow") }

    val categories = viewModel.categories.filter { it.id != "all" }

    Scaffold(
        topBar = {
            Surface(color = MaterialTheme.colorScheme.surface, shadowElevation = 2.dp) {
                Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                    Text(
                        text = "Create on Needly",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp,
                        color = SlateTextPrimary
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    TabRow(
                        selectedTabIndex = listingType,
                        containerColor = SlateBackground,
                        contentColor = TealPrimary,
                        modifier = Modifier.clip(RoundedCornerShape(12.dp)).height(42.dp)
                    ) {
                        Tab(selected = listingType == 0, onClick = { listingType = 0 }, text = { Text("Rent Item", fontSize = 12.sp) })
                        Tab(selected = listingType == 1, onClick = { listingType = 1 }, text = { Text("Offer Service", fontSize = 12.sp) })
                        Tab(selected = listingType == 2, onClick = { listingType = 2 }, text = { Text("Post Need", fontSize = 12.sp) })
                    }
                }
            }
        },
        modifier = modifier.fillMaxSize().testTag("create_screen_scaffold")
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp, bottom = 80.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Title Input
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = {
                    Text(
                        when (listingType) {
                            0 -> "Item Title (e.g. Sony A7 IV Camera)"
                            1 -> "Service Title (e.g. Professional AC Deep Cleaning)"
                            else -> "What do you need? (e.g. Need 4K Projector for Party)"
                        }
                    )
                },
                modifier = Modifier.fillMaxWidth().testTag("input_title"),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TealPrimary,
                    unfocusedBorderColor = SlateBorder
                )
            )

            // Category selector buttons
            Text("Select Category", fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = SlateTextPrimary)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                categories.take(3).forEach { cat ->
                    val isSelected = category == cat.id
                    FilterChip(
                        selected = isSelected,
                        onClick = { category = cat.id },
                        label = { Text(cat.name, fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = TealPrimary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            // Price / Budget Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = price,
                    onValueChange = { price = it },
                    label = { Text(if (listingType == 2) "Budget (₹)" else "Price / Rate (₹)") },
                    modifier = Modifier.weight(1f).testTag("input_price"),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TealPrimary,
                        unfocusedBorderColor = SlateBorder
                    )
                )

                if (listingType == 0) {
                    OutlinedTextField(
                        value = deposit,
                        onValueChange = { deposit = it },
                        label = { Text("Security Deposit (₹)") },
                        modifier = Modifier.weight(1f).testTag("input_deposit"),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = TealPrimary,
                            unfocusedBorderColor = SlateBorder
                        )
                    )
                } else if (listingType == 2) {
                    OutlinedTextField(
                        value = dateInput,
                        onValueChange = { dateInput = it },
                        label = { Text("Needed By") },
                        modifier = Modifier.weight(1f).testTag("input_date"),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = TealPrimary,
                            unfocusedBorderColor = SlateBorder
                        )
                    )
                }
            }

            // Description
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Description & Details") },
                modifier = Modifier.fillMaxWidth().height(120.dp).testTag("input_description"),
                shape = RoundedCornerShape(12.dp),
                maxLines = 5,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TealPrimary,
                    unfocusedBorderColor = SlateBorder
                )
            )

            if (listingType == 1) {
                OutlinedTextField(
                    value = skillInput,
                    onValueChange = { skillInput = it },
                    label = { Text("Key Skills (comma-separated, e.g. Licensed, 5+ yrs exp)") },
                    modifier = Modifier.fillMaxWidth().testTag("input_skills"),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TealPrimary,
                        unfocusedBorderColor = SlateBorder
                    )
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Submit Button
            val isFormValid = title.isNotBlank() && price.toDoubleOrNull() != null && description.isNotBlank()

            Button(
                onClick = {
                    val p = price.toDoubleOrNull() ?: 0.0
                    val dep = deposit.toDoubleOrNull() ?: 0.0
                    when (listingType) {
                        0 -> viewModel.addProductListing(title, category, p, dep, description)
                        1 -> {
                            val skills = skillInput.split(",").map { it.trim() }.filter { it.isNotEmpty() }
                            viewModel.addServiceListing(title, category, p, description, skills)
                        }
                        2 -> viewModel.addNeedPost(title, category, p, dateInput, description)
                    }
                    title = ""
                    price = ""
                    deposit = ""
                    description = ""
                    skillInput = ""
                },
                enabled = isFormValid,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("publish_listing_button"),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
            ) {
                Text(
                    text = when (listingType) {
                        0 -> "Publish Rental Item"
                        1 -> "Publish Service Offering"
                        else -> "Post Community Need"
                    },
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
