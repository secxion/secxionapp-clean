import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import {
  FaTachometerAlt,
  FaUsers,
  FaBoxOpen,
  FaMoneyBillAlt,
  FaShoppingCart,
  FaMobileAlt,
  FaPenAlt,
  FaFileAlt,
  FaUserSecret,
  FaChartBar,
  FaCog,
} from 'react-icons/fa'; // Import more icons

const AdminPanel = () => {
  const user = useSelector((state) => state?.user?.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [isUserInfoExpanded, setIsUserInfoExpanded] = useState(false);
  const menuRef = useRef(null);

  const handleTabClick = (path) => {
    setActiveTab(path);
    navigate(path);
  };

  const toggleUserInfo = () => {
    setIsUserInfoExpanded(!isUserInfoExpanded);
  };

  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.scrollLeft = 0;
    }
  }, [location.pathname]);

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  const menuItems = [
    { path: 'all-users', label: 'Users', icon: <FaUsers className="mr-2" /> },
    {
      path: 'all-products',
      label: 'Products',
      icon: <FaBoxOpen className="mr-2" />,
    },
    {
      path: 'admin-rpr',
      label: 'RPR',
      icon: <FaMoneyBillAlt className="mr-2" />,
    },
    {
      path: 'users-market',
      label: 'Market',
      icon: <FaShoppingCart className="mr-2" />,
    },
    {
      path: 'users-datapad',
      label: 'Datapad',
      icon: <FaMobileAlt className="mr-2" />,
    },
    { path: 'system-blog', label: 'Blog', icon: <FaPenAlt className="mr-2" /> },
    {
      path: 'admin-report',
      label: 'Reports',
      icon: <FaFileAlt className="mr-2" />,
    },
    {
      path: 'anonymous-report',
      label: 'Anonymous',
      icon: <FaUserSecret className="mr-2" />,
    },
    {
      path: 'community-feeds',
      label: 'Community',
      icon: <FaChartBar className="mr-2" />,
    },
    { path: 'settings', label: 'Settings', icon: <FaCog className="mr-2" /> },
  ];

  const minMenuWidth = `${menuItems.length * 10}px`;

  return (
    <div className="container min-h-screen bg-gray-100">
      <nav className="pt-28 bg-white shadow-md w-full overflow-x-auto scrollbar-hide fixed top-0 left-0 right-0 z-30 flex items-center justify-between py-2 px-4">
        <div
          className="flex items-center cursor-pointer"
          onClick={toggleUserInfo}
        >
          <div className="rounded-full bg-gray-300 h-10 w-10 flex items-center justify-center mr-3">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
            {isUserInfoExpanded && (
              <p className="text-xs text-gray-600">{user?.role}</p>
            )}
          </div>
          <div className="ml-2">
            {isUserInfoExpanded ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>

        <ul
          ref={menuRef}
          className="flex items-center space-x-4 overflow-x-auto scrollbar-hidden"
          style={{ minWidth: minMenuWidth }}
        >
          {menuItems.map(({ path, label, icon }) => (
            <li key={path}>
              <button
                onClick={() => handleTabClick(path)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap focus:outline-none flex items-center ${
                  location.pathname.includes(path)
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {icon}
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-20 p-6 md:p-8 h-full overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-5 flex items-center">
          <FaTachometerAlt className="mr-3 text-gray-600" /> Admin Dashboard
        </h1>
        <div className="h-full overflow-y-auto bg-white rounded-md shadow">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
