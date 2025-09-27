// hooks/useRealTimeUpdates.js
import { useState, useEffect, useRef } from 'react';
import {
  fetchMarketDataAPI,
  fetchWalletBalanceAPI,
} from '../services/apiService';

export const useRealTimeUpdates = (userId) => {
  const [marketData, setMarketData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRefs = useRef({});
  const lastFetchTimes = useRef({});

  // Configuration for different data types
  const POLLING_INTERVALS = {
    marketData: 30000, // 30 seconds
    walletBalance: 60000, // 1 minute
    notifications: 15000, // 15 seconds
  };

  // Exponential backoff for failed requests
  const getBackoffDelay = (attempts) => {
    return Math.min(1000 * Math.pow(2, attempts), 30000);
  };

  // Generic polling function with error handling
  const startPolling = (key, fetchFunction, interval, onSuccess, onError) => {
    let attempts = 0;

    const poll = async () => {
      try {
        const data = await fetchFunction();
        if (data) {
          onSuccess(data);
          attempts = 0; // Reset attempts on success
          setIsConnected(true);
        }
      } catch (error) {
        attempts++;
        console.error(`Polling error for ${key}:`, error);
        onError?.(error);

        if (attempts >= 3) {
          setIsConnected(false);
          // Use exponential backoff
          setTimeout(() => {
            attempts = 0;
            poll();
          }, getBackoffDelay(attempts));
          return;
        }
      }

      lastFetchTimes.current[key] = Date.now();
    };

    // Initial fetch
    poll();

    // Set up interval
    intervalRefs.current[key] = setInterval(poll, interval);
  };

  // Start polling when user is available
  useEffect(() => {
    if (!userId) return;

    // Market data polling
    startPolling(
      'marketData',
      fetchMarketDataAPI,
      POLLING_INTERVALS.marketData,
      (data) => setMarketData(data),
      (error) => console.error('Market data fetch failed:', error),
    );

    // Wallet balance polling
    startPolling(
      'walletBalance',
      fetchWalletBalanceAPI,
      POLLING_INTERVALS.walletBalance,
      (data) => setWalletBalance(data),
      (error) => console.error('Wallet balance fetch failed:', error),
    );

    // Cleanup function
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
      intervalRefs.current = {};
    };
  }, [userId]);

  // Pause polling when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clear all intervals when tab is hidden
        Object.values(intervalRefs.current).forEach(clearInterval);
      } else {
        // Restart polling when tab becomes visible
        if (userId) {
          // Restart with a short delay to avoid overwhelming the server
          setTimeout(() => {
            Object.values(intervalRefs.current).forEach(clearInterval);
            intervalRefs.current = {};

            startPolling(
              'marketData',
              fetchMarketDataAPI,
              POLLING_INTERVALS.marketData,
              (data) => setMarketData(data),
            );

            startPolling(
              'walletBalance',
              fetchWalletBalanceAPI,
              POLLING_INTERVALS.walletBalance,
              (data) => setWalletBalance(data),
            );
          }, 1000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userId]);

  // Manual refresh function
  const refreshData = async (dataType) => {
    try {
      switch (dataType) {
        case 'marketData':
          const market = await fetchMarketDataAPI();
          setMarketData(market);
          break;
        case 'walletBalance':
          const wallet = await fetchWalletBalanceAPI();
          setWalletBalance(wallet);
          break;
        case 'all':
          const [marketRes, walletRes] = await Promise.allSettled([
            fetchMarketDataAPI(),
            fetchWalletBalanceAPI(),
          ]);

          if (marketRes.status === 'fulfilled') setMarketData(marketRes.value);
          if (walletRes.status === 'fulfilled')
            setWalletBalance(walletRes.value);
          break;
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  return {
    marketData,
    walletBalance,
    isConnected,
    refreshData,
    lastFetchTimes: lastFetchTimes.current,
  };
};

// hooks/useNotificationPolling.js
export const useNotificationPolling = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/get-new-notifications', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/unread-notificationCount', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // Set up polling
    intervalRef.current = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 15000); // Poll every 15 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId]);

  // Pause/resume based on document visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else if (userId) {
        fetchNotifications();
        fetchUnreadCount();
        intervalRef.current = setInterval(() => {
          fetchNotifications();
          fetchUnreadCount();
        }, 15000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `/api/tr-notifications/read/${notificationId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, read: true } : notif,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/tr-notifications/read-all', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true })),
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
