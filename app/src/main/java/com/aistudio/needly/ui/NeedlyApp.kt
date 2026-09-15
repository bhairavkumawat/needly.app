package com.aistudio.needly.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aistudio.needly.ui.components.BottomNavBar
import com.aistudio.needly.ui.screens.*
import com.aistudio.needly.ui.theme.NeedlyTheme
import kotlinx.coroutines.launch

@Composable
fun NeedlyApp(
    viewModel: MarketplaceViewModel = viewModel()
) {
    val currentTab by viewModel.currentTab.collectAsState()
    val selectedProduct by viewModel.selectedProduct.collectAsState()
    val selectedService by viewModel.selectedService.collectAsState()
    val selectedNeed by viewModel.selectedNeed.collectAsState()
    val successMessage by viewModel.bookingSuccessMessage.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(successMessage) {
        successMessage?.let { msg ->
            coroutineScope.launch {
                snackbarHostState.showSnackbar(msg)
                viewModel.clearSuccessMessage()
            }
        }
    }

    NeedlyTheme {
        Scaffold(
            snackbarHost = { SnackbarHost(snackbarHostState) },
            bottomBar = {
                // Bottom bar is visible unless viewing detail or chatting
                BottomNavBar(
                    currentTab = currentTab,
                    onTabSelected = { viewModel.selectTab(it) }
                )
            },
            modifier = Modifier.fillMaxSize().testTag("needly_app_root")
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                when (currentTab) {
                    NavTab.HOME -> HomeScreen(viewModel = viewModel)
                    NavTab.REQUESTS -> RequestsScreen(viewModel = viewModel)
                    NavTab.CREATE -> CreateListingScreen(viewModel = viewModel)
                    NavTab.INBOX -> InboxScreen(viewModel = viewModel)
                    NavTab.PROFILE -> ProfileScreen(viewModel = viewModel)
                }

                // Modals & BottomSheets
                selectedProduct?.let { prod ->
                    ProductDetailSheet(
                        product = prod,
                        onDismiss = { viewModel.closeProductDetail() },
                        onBook = { days, note ->
                            viewModel.createRentalBooking(prod, days, note)
                        }
                    )
                }

                selectedService?.let { serv ->
                    ServiceDetailSheet(
                        service = serv,
                        onDismiss = { viewModel.closeServiceDetail() },
                        onBook = { date, time, address ->
                            viewModel.createServiceBooking(serv, date, time, address)
                        }
                    )
                }

                selectedNeed?.let { need ->
                    NeedDetailSheet(
                        need = need,
                        onDismiss = { viewModel.closeNeedDetail() },
                        onOfferHelp = {
                            viewModel.closeNeedDetail()
                            viewModel.selectTab(NavTab.INBOX)
                        }
                    )
                }
            }
        }
    }
}
