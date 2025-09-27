import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchUserDetailsAPI,
  fetchMarketDataAPI,
  fetchBlogsAPI,
  fetchWalletBalanceAPI,
} from '../services/apiService';

export const fetchUserDetails = createAsyncThunk(
  'user/fetchUserDetails',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchUserDetailsAPI();
      if (res.success) {
        return res.data;
      } else {
        return rejectWithValue(res.message || 'Failed to fetch user details');
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchMarketData = createAsyncThunk(
  'user/fetchMarketData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchMarketDataAPI();
      if (res.success) {
        return res.data;
      } else {
        return rejectWithValue(res.message || 'Failed to fetch market data');
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchBlogs = createAsyncThunk(
  'user/fetchBlogs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchBlogsAPI();
      // fetchBlogsAPI returns array directly on success
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchWalletBalance = createAsyncThunk(
  'user/fetchWalletBalance',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchWalletBalanceAPI();
      if (res.success) {
        return res.balance;
      } else {
        return rejectWithValue(res.message || 0);
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Initial state
const initialState = {
  user: null,
  isLoggedIn: false,
  marketData: [],
  blogs: [],
  walletBalance: 0,

  status: {
    user: 'idle',
    market: 'idle',
    blogs: 'idle',
    wallet: 'idle',
  },

  error: {
    user: null,
    market: null,
    blogs: null,
    wallet: null,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.marketData = [];
      state.blogs = [];
      state.walletBalance = 0;
    },
    clearState: () => initialState,
  },
  extraReducers: (builder) => {
    // User details
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.status.user = 'loading';
        state.error.user = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, { payload }) => {
        state.status.user = 'succeeded';
        state.user = payload;
        state.isLoggedIn = !!payload;
      })
      .addCase(fetchUserDetails.rejected, (state, { payload }) => {
        state.status.user = 'failed';
        state.error.user = payload;
        state.user = null;
        state.isLoggedIn = false;
      })

      // Market data
      .addCase(fetchMarketData.pending, (state) => {
        state.status.market = 'loading';
        state.error.market = null;
      })
      .addCase(fetchMarketData.fulfilled, (state, { payload }) => {
        state.status.market = 'succeeded';
        state.marketData = payload;
      })
      .addCase(fetchMarketData.rejected, (state, { payload }) => {
        state.status.market = 'failed';
        state.error.market = payload;
      })

      // Blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.status.blogs = 'loading';
        state.error.blogs = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, { payload }) => {
        state.status.blogs = 'succeeded';
        state.blogs = payload;
      })
      .addCase(fetchBlogs.rejected, (state, { payload }) => {
        state.status.blogs = 'failed';
        state.error.blogs = payload;
      })

      // Wallet balance
      .addCase(fetchWalletBalance.pending, (state) => {
        state.status.wallet = 'loading';
        state.error.wallet = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, { payload }) => {
        state.status.wallet = 'succeeded';
        state.walletBalance = payload;
      })
      .addCase(fetchWalletBalance.rejected, (state, { payload }) => {
        state.status.wallet = 'failed';
        state.error.wallet = payload;
      });
  },
});

export const { setUserDetails, logout, clearState } = userSlice.actions;
export default userSlice.reducer;
