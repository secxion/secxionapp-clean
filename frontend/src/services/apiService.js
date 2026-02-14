import SummaryApi from '../common';
import {
  apiFetch,
  handleApiResponse,
  isUnauthorized,
} from '../utils/apiInterceptor';

export const fetchUserDetailsAPI = async () => {
  try {
    const response = await apiFetch(SummaryApi.current_user.url, {
      method: SummaryApi.current_user.method,
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('[fetchUserDetailsAPI] Error:', error.message);
    return { success: false };
  }
};

export const fetchMarketDataAPI = async () => {
  try {
    const response = await apiFetch(SummaryApi.myMarket.url, {
      method: 'GET',
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('[fetchMarketDataAPI] Error:', error.message);
    return { success: false };
  }
};

export const fetchBlogsAPI = async () => {
  try {
    const response = await apiFetch(SummaryApi.getBlogs.url);

    if (isUnauthorized(response)) {
      return [];
    }

    return await handleApiResponse(response);
  } catch (error) {
    console.error('[fetchBlogsAPI] Error:', error.message);
    return [];
  }
};

export const fetchWalletBalanceAPI = async () => {
  try {
    const response = await apiFetch(SummaryApi.walletBalance.url, {
      method: 'GET',
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('[fetchWalletBalanceAPI] Error:', error.message);
    return { success: false, balance: 0 };
  }
};

export const signinUserAPI = async (userData) => {
  try {
    const response = await fetch(SummaryApi.signIn.url, {
      method: SummaryApi.signIn.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('[signinUserAPI] Error:', error.message);
    return { success: false, message: 'Signin failed.' };
  }
};
