import { createContext, useState, useEffect, useCallback, useContext } from "react";
import { useDispatch } from "react-redux";
import { clearState, setUserDetails } from "../store/userSlice";
import SummaryApi from "../common";
import { persistor } from "../store/store";

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
            // console.error("Error checking token expiry:", error);
            return true;
        }
    }, []);

    // ✅ Safe localStorage rehydration
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);

                if (!isTokenExpired(storedToken)) {
                    setUser(parsedUser);
                    setToken(storedToken);
                } else {
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                }
            } catch (error) {
                // console.error("Error parsing user/token:", error);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }
        }

        setLoading(false);
    }, [isTokenExpired]);

    const getAuthHeaders = useCallback(() => {
        const headers = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    }, [token]);

    const logout = useCallback(async () => {
        // 1. Clear local storage
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        // 2. Clear component state
        setUser(null);
        setToken(null);
        setWalletBalance(null);

        // 3. Clear Redux state
        dispatch(clearState());

        // 4. Purge persisted Redux state (CRITICAL STEP)
        if (persistor) {
            await persistor.purge();
        }

        // 5. Call backend to clear httpOnly cookies/session (optional but good practice)
        try {
            await fetch(SummaryApi.logout_user.url, { method: 'GET', credentials: 'include' });
        } catch (err) {
            // Ignore errors, frontend state is already cleared
        }

        // 6. Force a full page reload and replace history state
        window.location.replace('/login');
    }, [dispatch]);

    const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
        if (!token || isTokenExpired(token)) {
            // console.warn("Token expired or missing, logging out...");
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
                credentials: "include",
            });

            if (response.status === 401 || response.status === 403) {
                // console.warn("Authentication failed, logging out...");
                logout();
                return null;
            }

            return response;
        } catch (error) {
            // console.error("Request failed:", error);
            throw error;
        }
    }, [token, isTokenExpired, logout, getAuthHeaders]);

    const fetchUserDetails = useCallback(async () => {
        if (!token) return;

        try {
            const response = await makeAuthenticatedRequest(SummaryApi.current_user.url, {
                method: SummaryApi.current_user.method,
            });

            if (!response) return;

            const data = await response.json();
            if (response.ok && data && data._id) {
                setUser(data);
                dispatch(setUserDetails(data));
            } else {
                // console.warn("Failed to fetch user details");
                logout();
            }
        } catch (error) {
            // console.error("Error fetching user details:", error);
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
                requestOptions.headers = { "Content-Type": "application/json" };
            }

            const response = token
                ? await makeAuthenticatedRequest(url, requestOptions)
                : await fetch(url, { ...requestOptions, credentials: "include" });

            if (!response) return;

            const data = await response.json();
            if (response.ok && data.success) {
                setWalletBalance(data.balance);
            } else {
                setWalletBalance(null);
                // console.warn("Wallet fetch failed:", data.message);

                if (response.status === 401 || response.status === 403) {
                    logout();
                }
            }
        } catch (error) {
            // console.error("Error fetching wallet:", error);
            setWalletBalance(null);
        }
    }, [token, user, makeAuthenticatedRequest, logout]);

    useEffect(() => {
        if (!token) return;

        const validateToken = () => {
            if (isTokenExpired(token)) {
                // console.warn("Token expired during session, logging out...");
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
            // console.error("Missing user or token in login()");
            return;
        }

        if (isTokenExpired(userToken)) {
            // console.error("Cannot login with expired token");
            return;
        }

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userToken);
        setUser(userData);
        setToken(userToken);
        dispatch(setUserDetails(userData));
        fetchWalletBalance();
    };

    const isLoggedIn = !!user && !!token && !isTokenExpired(token);

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
            }}
        >
            {children}
        </Context.Provider>
    );
};

export const useAuth = () => useContext(Context);
export default Context;