import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import {
  FiHome,
  FiTrendingUp,
  FiSettings,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi'; // Using Feather Icons
import './Sidebar.css';

const DialogCal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current route location

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    closeSidebar(); // Close sidebar on logout (optional, depending on your UX)
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="container fixed top-4 left-4 bg-primary-500 text-white rounded-md p-2 z-20 lg:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 shadow-lg z-10 transition-transform duration-300 ease-in-out w-64 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:block hidden`}
      >
        {/* Sidebar Header */}
        <div
          className={`flex items-center justify-center h-16 bg-primary-600 dark:bg-gray-800 text-white ${
            isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'
          } transition-opacity duration-300`}
        >
          {isOpen && (
            <span className="font-semibold text-lg">My Dashboard</span>
          )}
          {!isOpen && <FiMenu size={24} />} {/* Show menu icon when closed */}
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className={`flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 ${
                  location.pathname === '/'
                    ? 'bg-gray-200 dark:bg-gray-700 font-semibold'
                    : ''
                }`}
                onClick={closeSidebar}
              >
                <FiHome className="mr-3" size={18} />
                <span
                  className={`${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'} transition-opacity duration-300`}
                >
                  Home
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/trending"
                className={`flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 ${
                  location.pathname === '/trending'
                    ? 'bg-gray-200 dark:bg-gray-700 font-semibold'
                    : ''
                }`}
                onClick={closeSidebar}
              >
                <FiTrendingUp className="mr-3" size={18} />
                <span
                  className={`${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'} transition-opacity duration-300`}
                >
                  Trending
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 ${
                  location.pathname === '/settings'
                    ? 'bg-gray-200 dark:bg-gray-700 font-semibold'
                    : ''
                }`}
                onClick={closeSidebar}
              >
                <FiSettings className="mr-3" size={18} />
                <span
                  className={`${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'} transition-opacity duration-300`}
                >
                  Settings
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className={`flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 ${
                  location.pathname === '/profile'
                    ? 'bg-gray-200 dark:bg-gray-700 font-semibold'
                    : ''
                }`}
                onClick={closeSidebar}
              >
                <FiUser className="mr-3" size={18} />
                <span
                  className={`${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'} transition-opacity duration-300`}
                >
                  Profile
                </span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div
          className={`absolute bottom-0 left-0 w-full p-4 border-t border-gray-200 dark:border-gray-700 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'} transition-opacity duration-300`}
        >
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <FiLogOut className="mr-3" size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DialogCal;
