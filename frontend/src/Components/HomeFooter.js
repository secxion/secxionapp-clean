import { FaNairaSign, FaEthereum } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import NairaButtonImg from '../app/Buttons/nairabutton.png';
import EthereumButtonImg from '../app/Buttons/ethereumbutton.png';

const HomeFooter = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [imagesLoaded, setImagesLoaded] = useState({
    naira: false,
    eth: false,
  });

  const { user } = useSelector((state) => state.user);
  const { profilePic } = user || {};

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-brand-dark-base shadow-emerald-400"></div>
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
