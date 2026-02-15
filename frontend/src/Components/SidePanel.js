import React, { useState, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import Clock from 'react-live-clock';
import timezones from '../helpers/timeZones';
import './Header.css';
import SecxionLogo from '../app/slogo.png';

const SidePanel = ({
  open,
  setOpen,
  handleLogout,
  loading,
  onCloseMenu,
  onOpenLiveScript,
}) => {
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

  const hideTradeStatus = location.pathname === '/record';
  const hideDataPad = location.pathname === '/datapad';
  const hideWallet = location.pathname === '/mywallet';
  const hideHome = location.pathname === '/home';
  const hideProfile = location.pathname === '/profile';
  const hideConnect = location.pathname === '/report';
  const hideMarketplace = location.pathname === '/section';

  const navigationItems = [
    {
      path: '/home',
      icon: HomeIcon,
      label: 'Home',
      gradient: 'from-blue-500 to-cyan-400',
      hide: hideHome,
    },
    {
      path: '/profile',
      icon: UserIcon,
      label: 'Profile',
      gradient: 'from-green-500 to-emerald-400',
      hide: hideProfile,
    },
    {
      path: '/record',
      icon: InformationCircleIcon,
      label: 'Trade Status',
      gradient: 'from-orange-500 to-yellow-400',
      hide: hideTradeStatus,
    },
    {
      path: '/mywallet',
      icon: WalletIcon,
      label: 'Wallet',
      gradient: 'from-indigo-500 to-purple-400',
      hide: hideWallet,
    },
    {
      path: '/datapad',
      icon: DocumentTextIcon,
      label: 'DataPad',
      gradient: 'from-teal-500 to-cyan-400',
      hide: hideDataPad,
    },
    {
      path: '/report',
      icon: ChatBubbleBottomCenterTextIcon,
      label: 'Connect with us',
      gradient: 'from-rose-500 to-pink-400',
      hide: hideConnect,
    },
    {
      path: '/section',
      icon: ShoppingBagIcon,
      label: 'Marketplace',
      gradient: 'from-purple-500 to-pink-400',
      hide: hideMarketplace,
    },
  ];

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 md:hidden"
        onClose={() => setOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
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
          <Dialog.Panel className="relative flex flex-col w-full max-w-sm h-full overflow-hidden bg-gray-900 text-gray-200 shadow-xl">
            <div className="relative z-10 flex flex-col w-full h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 mt-6 pt-4 border-b border-gray-700">
                {/* Logo */}
                <Link
                  to="/home"
                  className="relative -ml-2"
                  onClick={handleLinkClick}
                >
                  <div className="flex py-1 flex-col justify-center">
                    <div className="relative py-2">
                      <img
                        src={SecxionLogo}
                        alt="Secxion Official Logo"
                        className="w-12 h-12 object-contain rounded-2xl"
                        style={{ display: 'block' }}
                      />
                    </div>
                  </div>
                </Link>
                {/* Close Button */}
                <motion.button
                  onClick={() => setOpen(false)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50 border-2 border-white/20"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close side panel"
                >
                  <FaTimes className="w-5 h-5" />
                </motion.button>
              </div>
              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
                {navigationItems.map(
                  ({ path, icon: Icon, label, gradient, hide }) =>
                    !hide && (
                      <Link
                        key={label}
                        to={path}
                        onClick={handleLinkClick}
                        className="group flex items-center px-4 py-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/70 border-2 border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${gradient} mr-4 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-white font-medium text-sm transition-colors duration-200 glossy-text">
                          {label}
                        </span>
                      </Link>
                    ),
                )}

                {/* LiveScript Button */}
                <button
                  onClick={() => {
                    onOpenLiveScript?.();
                    setTimeout(() => handleLinkClick(), 100);
                  }}
                  className="group flex items-center w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-900/50 to-purple-800/50 hover:from-purple-800/70 hover:to-purple-700/70 border-2 border-purple-500/50 hover:border-purple-400/70 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 mr-4 group-hover:scale-110 transition-transform duration-300">
                    <CodeBracketIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-medium text-sm transition-colors duration-200 glossy-text">
                    LiveScript
                  </span>
                  <span className="ml-auto text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full">
                    Custom Dev
                  </span>
                </button>
              </nav>
              {/* Timezone Selector */}
              <div className="px-4 py-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={toggleTimezones}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-700/70 border-2 border-yellow-500/30 hover:border-yellow-500/60 rounded-xl text-white transition-all duration-300 group"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 mr-3">
                      <GlobeAltIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium glossy-text">
                      {getSelectedTimezoneLabel() || 'Select Timezone'}
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ${showTimezones ? 'rotate-180' : ''} group-hover:text-white glossy-text`}
                  />
                </button>
                {showTimezones && (
                  <div className="mt-3 bg-gray-800 border-2 border-yellow-500/30 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    <ul className="py-2">
                      {timezones.map((tz) => (
                        <li key={tz.value}>
                          <button
                            onClick={() => handleTimezoneChange(tz.value)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-700/70 transition-colors duration-200 text-sm ${
                              timezone === tz.value
                                ? 'text-cyan-400 font-semibold bg-gray-700'
                                : 'text-gray-300 hover:text-white'
                            } glossy-text`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{tz.label}</span>
                              {timezone === tz.value && (
                                <CheckIcon className="h-4 w-4 text-cyan-400 glossy-text" />
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Clock Display */}
              <div className="px-4 py-6 text-center border-t border-gray-700">
                <div className="bg-gray-800/50 border-2 border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-2">
                    <ClockIcon className="h-5 w-5 text-cyan-400 mr-2 glossy-text" />
                    <span className="text-gray-400 text-xs uppercase tracking-wide font-medium glossy-text">
                      Current Time
                    </span>
                  </div>
                  <Clock
                    format={'HH:mm:ss'}
                    ticking={true}
                    timezone={timezone}
                    className="text-xl font-bold text-white mb-2 tabular-nums glossy-heading"
                  />
                  <Clock
                    format={'dddd, MMMM Do YYYY'}
                    ticking={true}
                    timezone={timezone}
                    className="text-xs text-gray-400 font-medium glossy-text"
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
