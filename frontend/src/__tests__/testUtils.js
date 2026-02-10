/**
 * Test Utilities for React Components
 * Provides custom render function and common test helpers
 */

import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { ContextProvider } from '../Context';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../store/userSlice';
import walletReducer from '../store/walletSlice';

/**
 * Custom render function that includes Redux Provider, Router, and Context
 */
export function render(
  ui,
  {
    initialState = {},
    store = configureStore({
      reducer: {
        user: userReducer,
        wallet: walletReducer,
      },
      preloadedState: initialState,
    }),
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <Router>
          <ContextProvider>{children}</ContextProvider>
        </Router>
      </Provider>
    );
  }
  return { ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }), store };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { render };

/**
 * Mock data generators for common test scenarios
 */
export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  name: 'Test User',
  role: 'GENERAL',
  isVerified: true,
  profilePic: 'https://example.com/profile.jpg',
};

export const mockProduct = {
  _id: '507f1f77bcf86cd799439012',
  productName: 'Test Product',
  category: 'Electronics',
  price: 5000,
  description: 'Test product description',
  images: ['https://example.com/image1.jpg'],
  seller: mockUser._id,
};

export const mockNotification = {
  _id: '507f1f77bcf86cd799439013',
  userId: mockUser._id,
  message: 'Test notification',
  type: 'transactionSuccess',
  isRead: false,
  createdAt: new Date(),
};

/**
 * Wait for async operations in tests
 */
export const waitForLoadingToFinish = async (screen) => {
  const loaders = screen.queryAllByRole('progressbar');
  if (loaders.length > 0) {
    await rtlRender.waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  }
};
