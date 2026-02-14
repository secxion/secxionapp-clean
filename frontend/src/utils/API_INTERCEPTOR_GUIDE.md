# Frontend Error Management & 401 Interceptor Guide

## Overview
This guide explains the new global error handling system that automatically logs out users when their session expires (401 errors) instead of showing raw error messages.

---

## What Was Changed

### 1. **New Global API Interceptor** (`src/utils/apiInterceptor.js`)
- ✅ Wraps all API calls with centralized error handling
- ✅ Detects 401 (Unauthorized) errors automatically
- ✅ Automatically logs out users and clears tokens
- ✅ Provides user-friendly error messages
- ✅ Prevents showing raw console errors to users

### 2. **Updated API Service** (`src/services/apiService.js`)
- ✅ Uses new `apiFetch()` wrapper instead of raw `fetch()`
- ✅ All API calls go through `handleApiResponse()` for centralized error handling

---

## How It Works

### **When User Logs Out in Tab A:**
1. Tab A makes logout request → server clears session
2. User navigates to Tab B (still logged in locally)
3. Tab B makes API call (e.g., fetch market data)
4. Server returns **401 Unauthorized**
5. **Interceptor detects 401:**
   - Clears user from Redux store
   - Clears tokens from localStorage
   - Clears sessionStorage
   - Redirects to `/login?session=expired`
6. User sees clean redirect instead of error messages

---

## Usage in Components

### **Before (❌ Breaking):**
```javascript
const response = await fetch(SummaryApi.getMarket.url, {
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` },
  credentials: 'include',
});

const data = await response.json();
// If 401: Shows "Failed to fetch last market status: 401" to user
```

### **After (✅ Clean):**
```javascript
import { apiFetch, handleApiResponse } from '../utils/apiInterceptor';

const response = await apiFetch(SummaryApi.getMarket.url, {
  method: 'GET',
});

const data = await handleApiResponse(response);

if (data.success) {
  // Use data
} else {
  // Only show user-friendly message, user auto-logged out if 401
  console.error(data.error); // Logged, not shown to user
}
```

---

## API Interceptor Functions

### **`apiFetch(url, options)`**
Enhanced fetch wrapper that:
- Automatically adds `Authorization` header
- Sets credentials to 'include'
- Handles 401 errors globally

```javascript
const response = await apiFetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(payload),
});
```

### **`handleApiResponse(response)`**
Processes fetch response with error handling:
- Checks for 401 → auto logout
- Parses JSON
- Returns standardized response object

```javascript
const data = await handleApiResponse(response);
// Returns: { success: true, ...data } or { success: false, error: '...' }
```

### **`handleUnauthorized()`**
Called automatically on 401:
- Clears Redux user state
- Clears localStorage/sessionStorage
- Redirects to login

```javascript
// Usually called automatically, but can be called manually:
import { handleUnauthorized } from '../utils/apiInterceptor';
handleUnauthorized();
```

### **`isUnauthorized(response)`**
Check if response is 401

```javascript
if (isUnauthorized(response)) {
  // Handle 401
}
```

### **`getErrorMessage(status, defaultMessage)`**
Returns user-friendly error message for HTTP status code

```javascript
const msg = getErrorMessage(401); // "Your session has expired..."
const msg = getErrorMessage(429); // "Too many requests..."
```

---

## Common Error Messages

| Status | Message |
|--------|---------|
| 400 | Invalid request. Please check your input. |
| 401 | Your session has expired. Please log in again. |
| 403 | You do not have permission to access this resource. |
| 404 | Resource not found. |
| 429 | Too many requests. Please wait a moment and try again. |
| 500 | Server error. Please try again later. |
| 503 | Service unavailable. Please try again later. |

---

## Migrating Existing Components

### **Step 1: Replace raw fetch calls**

**Before:**
```javascript
const response = await fetch(SummaryApi.myMarket.url, {
  headers: { Authorization: `Bearer ${token}` },
  credentials: 'include',
});
const data = await response.json();
```

**After:**
```javascript
import { apiFetch, handleApiResponse } from '../../../utils/apiInterceptor';

const response = await apiFetch(SummaryApi.myMarket.url);
const data = await handleApiResponse(response);
```

### **Step 2: Remove manual error display for 401s**

**Before:**
```javascript
catch (error) {
  setError('Failed to fetch last market status: 401. Check server logs...');
}
```

**After:**
```javascript
catch (error) {
  // Error handled automatically by interceptor
  // Only log, don't display raw error
  console.error('error:', error.message);
}
```

### **Step 3: Only show user-friendly errors**

```javascript
const data = await handleApiResponse(response);
if (!data.success) {
  // Use user-friendly message from interceptor
  showNotification('error', data.error || 'An error occurred', 5000);
}
```

---

## Error Logging

All errors are logged to browser console with `[API]` prefix:
```
[API] User unauthorized (401) - Logging out...
[API] Error 500: Internal Server Error
[API] Fetch error: Network timeout
```

**These logs are for developers only**, never shown to users.

---

## Testing the System

### **Test Case 1: Session Expired**
1. Open app, log in (Tab A)
2. Open same URL in Tab B (automatically logged in)
3. In Tab A, click logout
4. In Tab B, refresh page or click any API-dependent action
5. **Expected:** Tab B auto-redirects to `/login?session=expired`

### **Test Case 2: Multiple Tabs**
1. Log in on Tab A
2. Log in on Tab B
3. Logout on Tab A
4. Tab B makes API call
5. **Expected:** Tab B automatically redirects to login

### **Test Case 3: Error Messages**
1. Make invalid API call (wrong endpoint)
2. **Expected:** Only console shows error, not UI

---

## Best Practices

1. ✅ **Always use `apiFetch()`** instead of raw `fetch()` for authenticated endpoints
2. ✅ **Always use `handleApiResponse()`** to process responses
3. ✅ **Only display user-friendly errors** to the UI
4. ✅ **Log raw errors** to console for debugging, never to user UI
5. ✅ **Never display raw HTTP status codes** like "401" or "429" to users
6. ✅ **Trust the interceptor** - it handles 401s automatically

---

## Files Modified

| File | Changes |
|------|---------|
| [`src/utils/apiInterceptor.js`](src/utils/apiInterceptor.js) | **NEW** - Global error handler |
| [`src/services/apiService.js`](src/services/apiService.js) | Updated to use global interceptor |

---

## Future Improvements

- [ ] Add token refresh (401 → try refresh → retry request)
- [ ] Add retry logic for network errors
- [ ] Add request timeout configuration
- [ ] Add request/response logging middleware
- [ ] Integrate with analytics for error tracking

---

## Questions?

When migrating components:
1. Replace raw `fetch()` with `apiFetch()`
2. Process response with `handleApiResponse()`
3. Check `data.success` instead of `response.ok`
4. Show `data.error` to users (already user-friendly)

That's it! Component errors will no longer break the app. 🎉
