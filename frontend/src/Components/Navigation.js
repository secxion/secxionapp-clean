import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Info, FileText, Mail, User, UserPlus, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import LogoShimmer from './LogoShimmer';

const Navigation = ({ currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Define all navigation items
  const allNavItems = [
    { id: 'home', name: 'Home', href: '/', icon: Home },
    { id: 'about', name: 'About Us', href: '/about-us', icon: Info },
    { id: 'privacy', name: 'Privacy', href: '/privacy', icon: Shield },
    { id: 'terms', name: 'Terms', href: '/terms', icon: FileText },
    { id: 'contact', name: 'Contact', href: '/contact-us', icon: Mail },
    { id: 'signin', name: 'Sign In', href: '/login', icon: User },
    { id: 'dashboard', name: 'Create Account', href: '/sign-up', icon: UserPlus }
  ];

  // Filter out the current page from navigation items
  const navItems = allNavItems.filter(item => item.id !== currentPage);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Brand color palette
  const activeGradient = "bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-700";
  const hoverGradient = "hover:bg-yellow-900/20";
  const textActive = "text-yellow-200";
  const textInactive = "text-gray-200 hover:text-yellow-400";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-yellow-700/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">

           {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group relative z-50">
            <div className="flex items-center">
              <span className="relative">
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-2xl blur-sm opacity-60"></span>
                <span className="relative z-10">
                </span>
              </span>
            </div>
            <span className="ml-2 font-extrabold text-lg text-yellow-200 tracking-wide group-hover:text-yellow-400 transition-colors">Secxion</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 border border-transparent
                    ${isActive ? `${activeGradient} ${textActive} shadow-md border-yellow-700` : `${hoverGradient} ${textInactive}`}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-yellow-300" : "text-yellow-500 group-hover:text-yellow-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden z-50 absolute top-4 right-4">
            <button
              onClick={toggleMenu}
              className={` rounded-xl bg-black border border-yellow-700/40
                ${isOpen ? "bg-black" : "text-yellow-400 hover:bg-yellow-900/20"}
              `}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <X className="w-7 h-7 text-yellow-400" />
              ) : (
                <Menu className="w-7 h-7 text-yellow-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed top-0 left-0 right-0 bottom-0 bg-gray-800 border-b border-yellow-700/20 shadow-2xl z-40"
            >
              {/* Close button inside menu for accessibility */}
              <div className="flex justify-end pt-6 pr-7">
                <button
                  onClick={closeMenu}
                  className=""
                  aria-label="Close menu"
                >
                </button>
              </div>
              <div className="flex flex-col left-0 right-0 bg-gray-950/90 backdrop-blur-xl mt-10 border-b border-yellow-700/20 shadow-lg items-center space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-6 py-4 mt-2 rounded-xl font-semibold w-11/12 justify-center border border-transparent
                        ${isActive ? `${activeGradient} ${textActive} shadow-md border-yellow-700` : `${hoverGradient} ${textInactive}`}
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-yellow-300" : "text-yellow-500 group-hover:text-yellow-400"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Subtle animated underline */}
      <div className="absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700 animate-pulse opacity-60"></div>
    </nav>
  );
};

export default Navigation;