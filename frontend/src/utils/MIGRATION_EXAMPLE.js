/**
 * Example: How to migrate a component to use the global API interceptor
 * 
 * This example shows proper error handling for the EthWallet component
 * that previously displayed raw error messages to users.
 * 
 * Key changes:
 * 1. Import the global interceptor
 * 2. Replace raw fetch() with apiFetch()
 * 3. Process responses with handleApiResponse()
 * 4. Only show user-friendly errors
 */

// ❌ BEFORE - BAD ERROR HANDLING
// ================================
/*
const refreshWalletData = async () => {
  try {
    const res = await fetch('/api/eth-price');
    const data = await res.json();
    
    if (!res.ok) {
      // BAD: Shows "Failed to fetch ETH price: 401" to users
      setNotification({ type: 'error', message: `Failed to fetch ETH price: ${res.status}` });
      return;
    }
    setEthRate(data.ethereum.ngn);
  } catch (error) {
    // BAD: Shows raw error message
    setNotification({ type: 'error', message: error.message });
  }
};
*/

// ✅ AFTER - GOOD ERROR HANDLING  
// ================================
import { apiFetch, handleApiResponse } from '../utils/apiInterceptor';
import SummaryApi from '../common';

const refreshWalletData = async () => {
  try {
    // Step 1: Use apiFetch instead of raw fetch()
    const response = await apiFetch(SummaryApi.fetchEthPrice.url, {
      method: SummaryApi.fetchEthPrice.method,
    });

    // Step 2: Process with global error handler
    const data = await handleApiResponse(response);

    // Step 3: Check for success, not status code
    if (data.success && data.ethereum) {
      setEthRate(data.ethereum.ngn);
      setNotification({ type: 'success', message: 'ETH rate updated' });
    } else {
      // Step 4: Show user-friendly error message (already prepared by interceptor)
      const friendlyError = data.error || 'Failed to fetch ETH rate. Please try again.';
      showNotification('error', friendlyError, 5000);
    }
  } catch (error) {
    // Step 5: Only log raw error, don't show to user
    console.error('[EthWallet] Wallet refresh failed:', error);
    showNotification('error', 'An unexpected error occurred. Please try again.', 5000);
  }
};

// ANOTHER EXAMPLE: Market List Component
// =========================================

const fetchMarketData = async (page = 1) => {
  try {
    setLoading(true);
    setError(null);

    // Step 1: apiFetch handles Authorization header automatically
    const response = await apiFetch(SummaryApi.myMarket.url, {
      method: 'GET',
    });

    // Step 2: Centralized error handling
    const data = await handleApiResponse(response);

    // Step 3: If 401, interceptor already logged out user
    // This code won't even reach here if was 401
    if (data.success) {
      setMarkets(data.data);
      setTotalPages(data.totalPages || 1);
    } else {
      // Step 4: User-friendly error
      setError(data.error || 'Failed to load markets');
    }
  } catch (error) {
    // Step 5: Log for debugging only
    console.error('[MarketList] Fetch error:', error);
    setError('An error occurred while loading markets');
  } finally {
    setLoading(false);
  }
};

// IMPORTANT NOTES:
// ================
// 1. STOP using raw error messages like: `"Failed to fetch: ${res.status}"`
// 2. STOP showing HTTP status codes to users: never show "401", "429", etc
// 3. START using apiFetch() for all authenticated API calls
// 4. START Processing with handleApiResponse() for consistent error handling
// 5. START checking if interceptor handles logout (no need to manually check 401)
// 
// The interceptor AUTOMATICALLY:
// ✅ Adds Authorization headers
// ✅ Handles 401 errors (logs out user)
// ✅ Clears user state from Redux
// ✅ Redirects to login page
// ✅ Provides user-friendly error messages
//
// You just need to:
// 1. Use apiFetch() instead of fetch()
// 2. Process with handleApiResponse()
// 3. Check data.success
// 4. Show data.error to users (already friendly)

export { refreshWalletData, fetchMarketData };
