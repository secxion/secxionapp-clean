import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import { useDispatch } from 'react-redux';
import { clearState, setUserDetails } from '../store/userSlice';
import SummaryApi from '../common';
import { persistor } from '../store/store';

const Context = createContext(null);

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');

    // Fallback to regular storage for compatibility
    const storedUser = adminUser || localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminDepartment');
      }
    }

    setLoading(false);
  }, []);

  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
    };
  }, []);

  const logout = useCallback(async () => {
    // Clear all auth storage
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminDepartment');
    setUser(null);
    setWalletBalance(null);
    dispatch(clearState());
    if (persistor) {
      await persistor.purge();
    }
    try {
      await fetch(SummaryApi.logout_user.url, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (err) {}
    window.location.replace('/login');
  }, [dispatch]);

  const makeAuthenticatedRequest = useCallback(
    async (url, options = {}) => {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
          credentials: 'include',
        });
        if (response.status === 401 || response.status === 403) {
          logout();
          return null;
        }
        return response;
      } catch (error) {
        throw error;
      }
    },
    [logout, getAuthHeaders],
  );

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest(
        SummaryApi.current_user.url,
        {
          method: SummaryApi.current_user.method,
        },
      );
      if (!response) return;
      const data = await response.json();
      if (response.ok && data && data._id) {
        setUser(data);
        dispatch(setUserDetails(data));
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  }, [makeAuthenticatedRequest, dispatch, logout]);

  const fetchWalletBalance = useCallback(async () => {
    if (!user?._id) return;
    try {
      let url = SummaryApi.walletBalance.url;
      let requestOptions = {
        method: SummaryApi.walletBalance.method,
      };
      url = `${url}?userId=${user._id}`;
      requestOptions.headers = { 'Content-Type': 'application/json' };
      const response = await makeAuthenticatedRequest(url, requestOptions);
      if (!response) return;
      const data = await response.json();
      if (response.ok && data.success) {
        setWalletBalance(data.balance);
      } else {
        setWalletBalance(null);
        if (response.status === 401 || response.status === 403) {
          logout();
        }
      }
    } catch (error) {
      setWalletBalance(null);
    }
  }, [user, makeAuthenticatedRequest, logout]);

  useEffect(() => {
    if (user) {
      fetchWalletBalance();
    }
    setLoading(false);
  }, [user, fetchWalletBalance]);

  const login = async (userData, userToken) => {
    if (!userData) {
      return;
    }
    localStorage.setItem('adminUser', JSON.stringify(userData));
    localStorage.setItem('adminAuth', 'true');
    setUser(userData);
    dispatch(setUserDetails(userData));
    fetchWalletBalance();
  };

  const token = null;
  const isLoggedIn = !!user;

  // --- Blog Management State & Methods ---
  const [blogs, setBlogs] = useState([]);
  const fetchBlogs = useCallback(async () => {
    try {
      const response = await fetch(SummaryApi.getBlogs.url, {
        method: SummaryApi.getBlogs.method,
        credentials: 'include',
      });
      if (!response.ok) {
        setBlogs([]);
        return;
      }
      const data = await response.json();
      // Backend returns array directly or { success, blogs } format
      if (Array.isArray(data)) {
        setBlogs(data);
      } else if (data.success && Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    }
  }, []);

  return (
    <Context.Provider
      value={{
        user,
        token,
        login,
        logout,
        getAuthHeaders,
        fetchUserDetails,
        isLoggedIn,
        loading,
        walletBalance,
        fetchWalletBalance,
        makeAuthenticatedRequest,
        blogs,
        fetchBlogs,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useAuth = () => useContext(Context);
export default Context;
