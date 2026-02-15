import React, { lazy, Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDetails, setLoading } from './store/userSlice';
import Context, { ContextProvider } from './Context';
import { useQuery } from '@tanstack/react-query';
import {
  fetchUserDetailsAPI,
  fetchMarketDataAPI,
  fetchBlogsAPI,
  fetchWalletBalanceAPI,
  signinUserAPI,
} from './services/apiService';
import SecxionLoader from './Components/SecxionLoader';
import InstallPrompt from './Components/InstallPrompt';

function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

const Header = lazy(() => import('./Components/Header'));
const Net = lazy(() => import('./Components/Net'));

function Loader() {
  return <SecxionLoader size="large" message="Initializing Secxion..." />;
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

  const { refetch: fetchUserDetails, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
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
    enabled: !!user, // Only fetch if user is logged in
  });

  const {
    data: marketData,
    refetch: fetchMarketData,
    isLoading: isMarketLoading,
  } = useQuery({
    queryKey: ['marketData'],
    queryFn: fetchMarketDataAPI,
    staleTime: 5 * 60 * 1000,
    enabled: !!user, // Only fetch if user is logged in
  });

  const {
    data: walletBalance,
    refetch: fetchWalletBalance,
    isLoading: isWalletLoading,
  } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: fetchWalletBalanceAPI,
    staleTime: 5 * 60 * 1000,
    enabled: !!user, // Only fetch if user is logged in
  });

  const {
    data: blogs,
    refetch: fetchBlogs,
    isLoading: isBlogsLoading,
  } = useQuery({
    queryKey: ['blogs'],
    queryFn: fetchBlogsAPI,
    staleTime: 5 * 60 * 1000,
    enabled: !!user, // Only fetch if user is logged in
  });

  if (isUserLoading || isMarketLoading || isBlogsLoading || isWalletLoading) {
    return <Loader />;
  }

  return (
    <ContextProvider>
      <Context.Provider
        value={{
          fetchUserDetails,
          fetchMarketData,
          marketData,
          user,
          fetchBlogs,
          blogs,
          walletBalance,
          fetchWalletBalance,
          signinUserAPI,
        }}
      >
        <div className="global-container">
          <Suspense fallback={<Loader />}>
            {user && <Net blogs={blogs} fetchBlogs={fetchBlogs} />}
            <main className="main-content">
              {user && <Header />}
              <div>
                <Outlet />
              </div>
            </main>
          </Suspense>
          <InstallPrompt />
        </div>
      </Context.Provider>
    </ContextProvider>
  );
}

export default App;
