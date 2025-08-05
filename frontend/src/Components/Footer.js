import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: "🏠 Home", path: "/home" },
    { name: "👛 My Wallet", path: "/mywallet" },
    { name: "🧑 Profile", path: "/profile" },
    { name: "Ξ ETH Wallet", path: "/eth" },
    { name: "₦ Naira Wallet", path: "/mywallet" },
    { name: "🚨 Report", path: "/report" },
  ];

  if (location.pathname === "/home") return null;

  const handleNavigate = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <footer className="fixed bottom-0 left-0 w-full bg-white/30 backdrop-blur-md py-3 z-50">
        <div className="flex justify-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-2xl text-indigo-600 hover:text-indigo-800 transition"
          >
            <FaBars />
          </button>
        </div>
      </footer>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-lg shadow-lg max-w-xs w-full text-white grid gap-4">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.path)}
                className="w-full py-2 px-4 rounded-lg bg-white/20 hover:bg-white/30 transition font-semibold"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
