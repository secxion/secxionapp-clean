import React, { lazy, Suspense, useEffect, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
import GlobalToastContainer from './Components/GlobalToastContainer';
import SummaryApi from './common';

function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function resetRouteScroll() {
  const targets = [
    window,
    document.getElementById('root'),
    document.scrollingElement,
    document.documentElement,
    document.body,
    document.querySelector('.main-content'),
  ].filter(Boolean);

  targets.forEach((target) => {
    if (typeof target.scrollTo === 'function') {
      target.scrollTo(0, 0);
    } else {
      target.scrollTop = 0;
      target.scrollLeft = 0;
    }
  });
}

const Header = lazy(() => import('./Components/Header'));
const Net = lazy(() => import('./Components/Net'));
const HiRateSlider = lazy(() => import('./Components/HiRateSlider'));

function Loader() {
  return <SecxionLoader size="large" message="Initializing Secxion..." />;
}

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const location = useLocation();

  // Admin panel has been moved to standalone app - no longer check isAdminRoute

  useEffect(() => {
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
    };
  }, []);

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    // Initialize CSRF token
    const fetchCsrf = async () => {
      try {
        const baseURL = SummaryApi?.baseURL || '';
        const url = `${baseURL}/api/csrf-token`;
        console.log('[CSRF] Initializing from:', url);

        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.csrfToken) {
            console.log('[CSRF] Successfully initialized');
            localStorage.setItem('csrfToken', data.csrfToken);
          }
        } else {
          console.warn(
            '[CSRF] Failed to fetch token, status:',
            response.status,
          );
        }
      } catch (err) {
        console.error('[CSRF] Initialization error:', err);
      }
    };

    if (!localStorage.getItem('csrfToken')) {
      fetchCsrf();
    }
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
    enabled: !!user,
  });

  const {
    data: marketData,
    refetch: fetchMarketData,
    isLoading: isMarketLoading,
  } = useQuery({
    queryKey: ['marketData'],
    queryFn: fetchMarketDataAPI,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  const {
    data: walletBalance,
    refetch: fetchWalletBalance,
    isLoading: isWalletLoading,
  } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: fetchWalletBalanceAPI,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  const {
    data: blogs,
    refetch: fetchBlogs,
    isLoading: isBlogsLoading,
  } = useQuery({
    queryKey: ['blogs'],
    queryFn: fetchBlogsAPI,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  const isAppLoading =
    isUserLoading || isMarketLoading || isBlogsLoading || isWalletLoading;
  const showRateSlider =
    Boolean(user) && ['/home', '/product-category'].includes(location.pathname);

  useLayoutEffect(() => {
    let animationFrameId = 0;
    let delayedFrameId = 0;

    const scrollToTop = () => {
      resetRouteScroll();
    };

    scrollToTop();
    animationFrameId = window.requestAnimationFrame(scrollToTop);
    delayedFrameId = window.setTimeout(scrollToTop, 50);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(delayedFrameId);
    };
  }, [location.pathname, location.search, isAppLoading]);

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
        {/* Regular app with header/nav */}
        <div className="global-container">
          <Suspense fallback={<Loader />}>
            {user && !isAppLoading && (
              <Net blogs={blogs} fetchBlogs={fetchBlogs} />
            )}
            <main className="main-content">
              {user && !isAppLoading && <Header />}
              <HiRateSlider visible={showRateSlider && !isAppLoading} />
              <div>{isAppLoading ? <Loader /> : <Outlet />}</div>
            </main>
          </Suspense>
          <InstallPrompt />
          <GlobalToastContainer />
        </div>
      </Context.Provider>
    </ContextProvider>
  );
}

export default App;
