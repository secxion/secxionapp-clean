/**
 * Global API Interceptor for handling 401 errors
 * - Automatically logs out user when token expires
 * - Prevents showing raw error messages to users
 * - Redirects to login page on unauthorized access
 */

import { store } from '../store/store';
import { logout, setUserDetails } from '../store/userSlice';

/**
 * Enhanced fetch wrapper with automatic 401 handling
 * @param {string} url - API endpoint URL
 * @param {object} options - fetch options
 * @returns {Promise<Response>} - fetch response
 */
export const apiFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized - Token expired or invalid
    if (response.status === 401) {
      handleUnauthorized();
      // Return error response instead of throwing
      return response;
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      console.warn('[API] Access forbidden (403)');
      return response;
    }

    // Handle 500+ server errors
    if (response.status >= 500) {
      console.error(`[API] Server error (${response.status})`);
    }

    return response;
  } catch (error) {
    console.error('[API] Fetch error:', error.message);
    throw error;
  }
};

/**
 * Handle unauthorized (401) response
 * - Clear user state
 * - Clear localStorage
 * - Redirect to login
 */
export const handleUnauthorized = () => {
  console.warn('[API] User unauthorized (401) - Logging out...');

  // Dispatch logout action to Redux
  store.dispatch(logout());
  store.dispatch(setUserDetails(null));

  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userData');

  // Clear any session-related data
  sessionStorage.clear();

  // Redirect to login page
  if (
    window.location.pathname !== '/login' &&
    window.location.pathname !== '/signup'
  ) {
    window.location.href = '/login?session=expired';
  }
};

/**
 * Check if response is a 401 error
 * @param {Response} response - fetch response
 * @returns {boolean}
 */
export const isUnauthorized = (response) => {
  return response?.status === 401;
};

/**
 * Check if response is successful
 * @param {Response} response - fetch response
 * @returns {boolean}
 */
export const isSuccess = (response) => {
  return response?.ok || (response?.status >= 200 && response?.status < 300);
};

/**
 * Get user-friendly error message based on status code
 * @param {number} status - HTTP status code
 * @param {string} defaultMessage - default error message
 * @returns {string}
 */
export const getErrorMessage = (
  status,
  defaultMessage = 'An error occurred',
) => {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict: This resource already exists.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return defaultMessage;
  }
};

/**
 * Centralized API response handler
 * @param {Response} response - fetch response
 * @returns {Promise<object>} - parsed response or error object
 */
export const handleApiResponse = async (response) => {
  // Handle 401 first - don't parse body, just log out
  if (isUnauthorized(response)) {
    handleUnauthorized();
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const data = await response.json();

    if (isSuccess(response)) {
      return data;
    } else {
      // API returned error status with message
      const errorMessage = data?.message || getErrorMessage(response.status);
      console.error(`[API] Error ${response.status}:`, errorMessage);
      return { success: false, error: errorMessage, status: response.status };
    }
  } catch (error) {
    console.error('[API] Failed to parse response:', error.message);
    return {
      success: false,
      error: 'Failed to parse server response',
      status: response.status,
    };
  }
};

/**
 * Example usage in components:
 *
 * const response = await apiFetch('/api/endpoint', {
 *   method: 'GET',
 * });
 *
 * const data = await handleApiResponse(response);
 *
 * if (data.success) {
 *   // Handle success
 * } else {
 *   // Handle error (without showing raw error)
 *   console.error(data.error);
 * }
 */

export default {
  apiFetch,
  handleUnauthorized,
  isUnauthorized,
  isSuccess,
  getErrorMessage,
  handleApiResponse,
};
