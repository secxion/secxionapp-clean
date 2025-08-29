import React, { lazy, Suspense, useEffect } from "react";
import { Outlet, Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails, setLoading } from "./store/userSlice";
import Context, { ContextProvider } from "./Context";
import { useQuery } from "@tanstack/react-query";
import {
    fetchUserDetailsAPI,
    fetchMarketDataAPI,
    fetchBlogsAPI,
    fetchWalletBalanceAPI,
    signinUserAPI,
} from "./services/apiService";
import Shimmer from "./Components/Shimmer";
import { AnimatePresence } from "framer-motion";
import { persistor } from "./store/store"; // already imported in index.js

function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

const Header = lazy(() => import("./Components/Header"));
const Net = lazy(() => import("./Components/Net"));

function Loader() {
    return (
       <div className="min-h-screen bg-white py-6 flex flex-col justify-center sm:py-12 border-2 border-black"> {/* Changed to white background and black border */}
                       <style>{`
                           .glossy-text {
                               text-shadow:
                                   -1px -1px 0 #fff,
                                   1px -1px 0 #fff,
                                   -1px 1px 0 #fff,
                                   1px 1px 0 #fff,
                                   2px 2px 5px rgba(0,0,0,0.5);
                               -webkit-text-stroke: 0.5px #000;
                               color: #000;
                           }
                           .glossy-heading {
                               text-shadow:
                                   0 0 5px rgba(255,255,255,0.7),
                                   0 0 10px rgba(255,255,255,0.5),
                                   2px 2px 5px rgba(0,0,0,0.3);
                               -webkit-text-stroke: 0.7px #333;
                               color: #000;
                           }
                       `}</style>
                       <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                           <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 rounded-3xl border-4 border-yellow-700"></div> {/* Yellow border */}
                           <div className="relative px-4 py-10 bg-white shadow-lg rounded-3xl sm:p-20 border-4 border-yellow-700"> {/* White background and yellow border */}
                               <div className="animate-pulse">
                                   <Shimmer type="heading" />
                                   <div className="mt-6 grid grid-cols-1 gap-6">
                                       <Shimmer type="paragraph" />
                                       <Shimmer type="paragraph" />
                                       <Shimmer type="paragraph" />
                                       <Shimmer type="button" />
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>
    );
}

function globalLogout() {
  localStorage.clear();
  sessionStorage.clear();
  if (window && window.indexedDB) {
    window.indexedDB.deleteDatabase('localforage');
  }
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
  });
  // Purge redux-persist state
  if (persistor && persistor.purge) persistor.purge();
  // Optionally call backend logout endpoint here
  // Redirect to login page
  window.location.replace("/login");
}

function App() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);

        return () => {
            window.removeEventListener('resize', setViewportHeight);
        };
    }, []);

    // Add a check for authentication before rendering protected components
    useEffect(() => {
        // Example: If user is not authenticated, redirect to login
        // Optionally, check for a valid token/session here
        // if (!user) window.location.replace("/login");
    }, [user]);

    const { refetch: fetchUserDetails, isLoading: isUserLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            dispatch(setLoading(true));
            const res = await fetchUserDetailsAPI();
            dispatch(setLoading(false));

            if (res.success) {
                dispatch(setUserDetails(res.data));
                return res.data;
            } else {
                dispatch(setUserDetails(null));
                return null;
            }
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: marketData, refetch: fetchMarketData, isLoading: isMarketLoading } = useQuery({
        queryKey: ["marketData"],
        queryFn: fetchMarketDataAPI,
        staleTime: 5 * 60 * 1000,
    });

    const { data: walletBalance, refetch: fetchWalletBalance, isLoading: isWalletLoading } = useQuery({
        queryKey: ["walletBalance"],
        queryFn: fetchWalletBalanceAPI,
        staleTime: 5 * 60 * 1000,
    });

    const { data: blogs, refetch: fetchBlogs, isLoading: isBlogsLoading } = useQuery({
        queryKey: ["blogs"],
        queryFn: fetchBlogsAPI,
        staleTime: 5 * 60 * 1000,
    });

    // Move conditional return after all hooks
    if (isUserLoading || isMarketLoading || isBlogsLoading || isWalletLoading) {
        return <Loader />;
    }

    return (

        <ContextProvider>
            
        <Context.Provider value={{ fetchUserDetails, fetchMarketData, marketData, user, fetchBlogs, blogs, walletBalance, fetchWalletBalance, signinUserAPI }}>
            <div className="global-container">
                <Suspense fallback={<Loader />}>
                    <AnimatePresence mode="wait">
                        {user && <Net blogs={blogs} fetchBlogs={fetchBlogs} />}
                        <main className="main-content">
                            {user && <Header />}
                            <div>
                                <Outlet />
                            </div>
                        </main>
                    </AnimatePresence>
                </Suspense>
                <ToastContainer
                    position="top-center"
                    autoClose={1000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
            </div>
        </Context.Provider>
        </ContextProvider>
    );
}

export default App;