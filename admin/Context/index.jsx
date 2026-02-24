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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const dispatch = useDispatch();

  const isTokenExpired = useCallback((token) => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (!isTokenExpired(storedToken)) {
          setUser(parsedUser);
          setToken(storedToken);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setLoading(false);
  }, [isTokenExpired]);

  const getAuthHeaders = useCallback(() => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  const logout = useCallback(async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
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
      if (!token || isTokenExpired(token)) {
        logout();
        return null;
      }
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
    [token, isTokenExpired, logout, getAuthHeaders],
  );

  const fetchUserDetails = useCallback(async () => {
    if (!token) return;
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
  }, [makeAuthenticatedRequest, dispatch, token, logout]);

  const fetchWalletBalance = useCallback(async () => {
    if (!token && !user?._id) return;
    try {
      let url = SummaryApi.walletBalance.url;
      let requestOptions = {
        method: SummaryApi.walletBalance.method,
      };
      if (!token) {
        url = `${url}?userId=${user._id}`;
        requestOptions.headers = { 'Content-Type': 'application/json' };
      }
      const response = token
        ? await makeAuthenticatedRequest(url, requestOptions)
        : await fetch(url, { ...requestOptions, credentials: 'include' });
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
  }, [token, user, makeAuthenticatedRequest, logout]);

  useEffect(() => {
    if (!token) return;
    const validateToken = () => {
      if (isTokenExpired(token)) {
        logout();
      }
    };
    const interval = setInterval(validateToken, 5 * 60 * 1000);
    window.addEventListener('focus', validateToken);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', validateToken);
    };
  }, [token, isTokenExpired, logout]);

  useEffect(() => {
    if (token || user) {
      fetchWalletBalance();
    }
    setLoading(false);
  }, [token, user, fetchWalletBalance]);

  const login = async (userData, userToken) => {
    if (!userData || !userToken) {
      return;
    }
    if (isTokenExpired(userToken)) {
      return;
    }
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setUser(userData);
    setToken(userToken);
    dispatch(setUserDetails(userData));
    fetchWalletBalance();
  };

  const isLoggedIn = !!user && !!token && !isTokenExpired(token);

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
