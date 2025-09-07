import React, { useState, Fragment } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  GlobeAltIcon,
  UserIcon,
  InformationCircleIcon,
  WalletIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  ShoppingBagIcon,
  ClockIcon,
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import Clock from 'react-live-clock';
import timezones from '../helpers/timeZones';
import './Header.css';
import SecxionLogo from "../app/slogo.png";

const SidePanel = ({ open, setOpen, handleLogout, loading, onCloseMenu }) => {
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [showTimezones, setShowTimezones] = useState(false);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleTimezones = () => setShowTimezones(!showTimezones);
  const handleTimezoneChange = (newTimezone) => {
    setTimezone(newTimezone);
    setShowTimezones(false);
  };
  const getSelectedTimezoneLabel = () => {
    const selected = timezones.find((tz) => tz.value === timezone);
    return selected ? selected.label : '';
  };
  const handleLinkClick = () => {
    onCloseMenu?.();
    setOpen(false);
  };
  const handleLogoutClick = async () => {
    if (!loading) {
      handleLogout();
      setOpen(false);
      navigate('/login');
    }
  };

  const hideTradeStatus = location.pathname === "/record";
  const hideDataPad = location.pathname === "/datapad";
  const hideWallet = location.pathname === "/mywallet";
  const hideHome = location.pathname === "/home";
  const hideProfile = location.pathname === "/profile";
  const hideConnect = location.pathname === "/report";
  const hideMarketplace = location.pathname === "/section";


   const navigationItems = [
    { path: '/home', icon: HomeIcon, label: 'Home', gradient: 'from-blue-500 to-cyan-400', hide: hideHome },
    { path: '/profile', icon: UserIcon, label: 'Profile', gradient: 'from-green-500 to-emerald-400' , hide: hideProfile },
    { path: '/record', icon: InformationCircleIcon, label: 'Trade Status', gradient: 'from-orange-500 to-yellow-400', hide: hideTradeStatus },
    { path: '/mywallet', icon: WalletIcon, label: 'Wallet', gradient: 'from-indigo-500 to-purple-400' , hide: hideWallet },
    { path: '/datapad', icon: DocumentTextIcon, label: 'DataPad', gradient: 'from-teal-500 to-cyan-400', hide: hideDataPad  },
    { path: '/report', icon: ChatBubbleBottomCenterTextIcon, label: 'Connect with us', gradient: 'from-rose-500 to-pink-400', hide: hideConnect },
    { path: '/section', icon: ShoppingBagIcon, label: 'Marketplace', gradient: 'from-purple-500 to-pink-400', hide: hideMarketplace },
  ];

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 md:hidden" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="transform ease-in-out duration-200"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transform ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <Dialog.Panel className="relative flex flex-col w-full max-w-sm h-full overflow-hidden bg-white text-black shadow-xl ">
            <div className="relative z-10 flex flex-col w-full h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-2 mt-6 pt-4 border-b border-gray-200">
                <motion.button
                  onClick={() => setOpen(false)}
                  className="fixed top-14 right-6 z-[10000] bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500/50 border-2 border-white/20"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20,
                    delay: 0.1 
                  }}
                  whileHover={{ 
                    rotate: 90,
                    boxShadow: "0 0 30px rgba(239, 68, 68, 0.5)"
                  }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close side panel"
                >
                  <FaTimes className="w-6 h-6" />
                </motion.button>
                {/* Replace LogoShimmer with SecxionLogo */}
                <Link to="/home" className="relative">
                  <div className="flex py-1 flex-col justify-center">
                    <div className="relative py-2 sm:mx-auto">
                      <img
                        src={SecxionLogo}
                        alt="Secxion Official Logo"
                        className="w-14 h-14 object-contain rounded-2xl"
                        style={{ display: "block" }}
                      />
                    </div>
                  </div>
                </Link>
                <button
                  onClick={handleLogoutClick}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs font-medium py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 glossy-text border-4 border-yellow-500"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
                {navigationItems.map(({ path, icon: Icon, label, gradient, hide }) =>
                  !hide && (
                    <Link
                      key={label}
                      to={path}
                      onClick={handleLinkClick}
                      className="group flex items-center px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 border-4 border-yellow-500 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${gradient} mr-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-gray-800 group-hover:text-black font-medium text-sm transition-colors duration-200 glossy-text">
                        {label}
                      </span>
                    </Link>
                  )
                )}
              </nav>
              {/* Timezone Selector */}
              <div className="px-4 py-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={toggleTimezones}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 border-4 border-yellow-500 rounded-xl text-gray-800 hover:text-black transition-all duration-300 group"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 mr-3">
                      <GlobeAltIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium glossy-text">
                      {getSelectedTimezoneLabel() || 'Select Timezone'}
                    </span>
                  </div>
                  <ChevronDownIcon className={`h-5 w-5 text-gray-500 transform transition-transform duration-300 ${showTimezones ? 'rotate-180' : ''} group-hover:text-black glossy-text`} />
                </button>
                {showTimezones && (
                  <div className="mt-3 bg-gray-100 border-4 border-yellow-500 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    <ul className="py-2">
                      {timezones.map((tz) => (
                        <li key={tz.value}>
                          <button
                            onClick={() => handleTimezoneChange(tz.value)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-200 transition-colors duration-200 text-sm ${
                              timezone === tz.value ? 'text-cyan-700 font-semibold bg-gray-200' : 'text-gray-800 hover:text-black'
                            } glossy-text`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{tz.label}</span>
                              {timezone === tz.value && <CheckIcon className="h-4 w-4 text-cyan-600 glossy-text" />}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Clock Display */}
              <div className="px-4 py-6 text-center border-t border-gray-200">
                <div className="bg-gray-100 border-4 border-yellow-500 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-2">
                    <ClockIcon className="h-5 w-5 text-cyan-600 mr-2 glossy-text" />
                    <span className="text-gray-600 text-xs uppercase tracking-wide font-medium glossy-text">Current Time</span>
                  </div>
                  <Clock
                    format={'HH:mm:ss'}
                    ticking={true}
                    timezone={timezone}
                    className="text-2xl font-bold text-black mb-1 tabular-nums glossy-heading"
                  />
                  <Clock
                    format={'dddd, MMMM Do YYYY'}
                    ticking={true}
                    timezone={timezone}
                    className="text-sm text-gray-600 font-medium glossy-text"
                  />
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
};

export default SidePanel;