import { FaCaretUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import NairaButtonImg from "../app/Buttons/nairabutton.png";
import EthereumButtonImg from "../app/Buttons/ethereumbutton.png";

const HomeFooter = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

 const { user } = useSelector((state) => state.user);
                            const { profilePic} = user || {};
                        
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 py-2 shadow-lg w-full">
      <div className="flex justify-around items-center text-gray-300 dark:text-gray-100 text-xl h-16">

        <Link
          to="/profile"
          className="flex flex-col bg-transparent items-center text-blue-400 outline-none ring-2 ring-blue-400 ring-offset-1 transition-colors duration-300 ease-in-out border-4 border-yellow-500 rounded-lg p-2 glossy-text h-12 w-12"
          aria-label="Profile"
        >
          <div className="relative">
            <img
              src={profilePic}
              alt="Profile"
              className="w-8 h-8 object-cover rounded-full"
            />
            <FaCaretUp className="absolute -top-2 -right-2 text-yellow-400 text-sm" />
          </div>
        </Link>

        {/* Naira Wallet */}
        <Link
          to="/mywallet"
          className="flex flex-col items-center justify-center transition-colors duration-300 ease-in-out h-12 w-16 hover:scale-105"
          aria-label="Naira Wallet"
        >
          <img
            src={NairaButtonImg}
            alt="Naira Wallet"
            className="h-20 w-auto object-contain"
            style={{ display: "block" }}
          />
        </Link>

        {/* Ethereum */}
        <Link
          to="/eth"
          className="flex flex-col items-center justify-center transition-colors duration-300 ease-in-out h-12 w-16 hover:scale-105"
          aria-label="Ethereum"
        >
          <img
            src={EthereumButtonImg}
            alt="Ethereum"
            className="h-20 w-auto object-contain"
            style={{ display: "block" }}
          />
        </Link>
        
      </div>
    </footer>
  );
};

export default HomeFooter;
