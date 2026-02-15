import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  Info,
  FileText,
  Mail,
  User,
  UserPlus,
  Shield,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
    {
      id: 'dashboard',
      name: 'Create Account',
      href: '/sign-up',
      icon: UserPlus,
    },
  ];

  // Filter out the current page from navigation items
  const navItems = allNavItems.filter((item) => item.id !== currentPage);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-yellow-700/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="font-extrabold text-lg text-yellow-200 tracking-wide group-hover:text-yellow-400 transition-colors">
              Secxion
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-yellow-100 shadow-md'
                        : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-900/20'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-xl border border-yellow-700/40 bg-gray-900/80 text-yellow-400 hover:bg-yellow-900/30 transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-gray-950/98 border-t border-yellow-700/20"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-yellow-100 shadow-md'
                          : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-900/20'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
