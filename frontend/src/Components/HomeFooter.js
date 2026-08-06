import { FaNairaSign, FaEthereum } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import NairaButtonImg from '../app/Buttons/nairabutton.png';
import EthereumButtonImg from '../app/Buttons/ethereumbutton.png';

const CONNECTIVITY_CHECK_URL = 'https://www.gstatic.com/generate_204';
const CONNECTIVITY_TIMEOUT_MS = 3000;
const CONNECTIVITY_POLL_MS = 4000;

const HomeFooter = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [imagesLoaded, setImagesLoaded] = useState({
    naira: false,
    eth: false,
  });

  const { user } = useSelector((state) => state.user);
  const { profilePic } = user || {};

  useEffect(() => {
    let isMounted = true;
    let isChecking = false;

    const checkConnectivity = async () => {
      if (!navigator.onLine) {
        if (isMounted) setIsOnline(false);
        return;
      }

      if (isChecking) return;
      isChecking = true;

      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        CONNECTIVITY_TIMEOUT_MS,
      );

      try {
        await fetch(`${CONNECTIVITY_CHECK_URL}?t=${Date.now()}`, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal,
        });

        if (isMounted) setIsOnline(true);
      } catch {
        if (isMounted) setIsOnline(false);
      } finally {
        clearTimeout(timeout);
        isChecking = false;
      }
    };

    const handleOnline = () => {
      void checkConnectivity();
    };

    const handleOffline = () => {
      if (isMounted) setIsOnline(false);
    };

    // Immediate check on mount.
    void checkConnectivity();

    // React instantly to browser connectivity events.
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Polling keeps status fresh if browser events are delayed/missed.
    const interval = setInterval(() => {
      void checkConnectivity();
    }, CONNECTIVITY_POLL_MS);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-brand-dark-base/90 backdrop-blur-2xl py-3 border-t border-white/5 shadow-2xl w-full">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        <Link
          to="/profile"
          className="flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 h-14 w-14 rounded-2xl border border-white/10 bg-white/5 group"
          aria-label="Profile"
        >
          <div className="relative">
            <img
              src={profilePic}
              alt="Profile"
              className="w-10 h-10 object-cover rounded-xl border-2 border-brand-dark-base group-hover:border-brand-gold transition-colors"
            />
            <div
              className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-brand-dark-base ${
                isOnline
                  ? 'bg-emerald-400 shadow-emerald-400'
                  : 'bg-rose-500 shadow-rose-500'
              }`}
              title={isOnline ? 'Online' : 'Offline'}
              aria-label={isOnline ? 'Online' : 'Offline'}
            ></div>
          </div>
        </Link>

        {/* Naira Wallet */}
        <Link
          to="/mywallet"
          className="flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 h-14 w-14 rounded-2xl border border-white/10 bg-white/5 hover:border-brand-gold/30"
          aria-label="Naira Wallet"
        >
          {imagesLoaded.naira ? (
            <img
              src={NairaButtonImg}
              alt="Naira Wallet"
              className="h-10 w-10 object-contain"
              style={{ display: 'block' }}
            />
          ) : (
            <FaNairaSign className="text-brand-gold text-2xl" />
          )}
          <img
            src={NairaButtonImg}
            alt=""
            className="hidden"
            onLoad={() => setImagesLoaded((prev) => ({ ...prev, naira: true }))}
          />
        </Link>

        {/* Ethereum */}
        <Link
          to="/eth"
          className="flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 h-14 w-14 rounded-2xl border border-white/10 bg-white/5 hover:border-brand-gold/30"
          aria-label="Ethereum"
        >
          {imagesLoaded.eth ? (
            <img
              src={EthereumButtonImg}
              alt="Ethereum"
              className="h-10 w-10 object-contain"
              style={{ display: 'block' }}
            />
          ) : (
            <FaEthereum className="text-brand-gold text-2xl" />
          )}
          <img
            src={EthereumButtonImg}
            alt=""
            className="hidden"
            onLoad={() => setImagesLoaded((prev) => ({ ...prev, eth: true }))}
          />
        </Link>
      </div>
    </footer>
  );
};

export default HomeFooter;
