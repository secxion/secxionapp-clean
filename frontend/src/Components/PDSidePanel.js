import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBell,
  faWallet,
  faUser,
  faFileAlt,
  faLockOpen,
  faSignOutAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import ROLE from '../common/role';

const PDSidePanel = ({ isSidePanelOpen, onCloseSidePanel, onLogout }) => {
  const { user } = useSelector((state) => state.user);

  return (
    <div
      className={`container fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg z-50 transition-transform duration-300 ease-in-out w-64 md:hidden ${
        isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={onCloseSidePanel}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
          >
            <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col space-y-3">
          <Link
            to="/home"
            onClick={onCloseSidePanel}
            className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-4 rounded-md focus:outline-none"
          >
            <FontAwesomeIcon icon={faHome} className="mr-3 w-5 h-5" />
            Home
          </Link>
          <Link
            to="/notification"
            onClick={onCloseSidePanel}
            className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-4 rounded-md focus:outline-none"
          >
            <FontAwesomeIcon icon={faBell} className="mr-3 w-5 h-5" />
            Notification
          </Link>
          <Link
            to="/mywallet"
            onClick={onCloseSidePanel}
            className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-4 rounded-md focus:outline-none"
          >
            <FontAwesomeIcon icon={faWallet} className="mr-3 w-5 h-5" />
            Wallet
          </Link>
          <Link
            to="/profile"
            onClick={onCloseSidePanel}
            className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-4 rounded-md focus:outline-none"
          >
            <FontAwesomeIcon icon={faUser} className="mr-3 w-5 h-5" />
            Profile
          </Link>
          <Link
            to="/record"
            onClick={onCloseSidePanel}
            className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-4 rounded-md focus:outline-none"
          >
            <FontAwesomeIcon icon={faFileAlt} className="mr-3 w-5 h-5" />
            Card Status
          </Link>
          {user?.role === ROLE.ADMIN && (
            <Link
              to="/admin-panel"
              onClick={onCloseSidePanel}
              className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-4 rounded-md focus:outline-none"
            >
              <FontAwesomeIcon icon={faLockOpen} className="mr-3 w-5 h-5" />
              Admin Panel
            </Link>
          )}
          <button
            onClick={() => {
              onCloseSidePanel();
              onLogout();
            }}
            className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-4 rounded-md focus:outline-none"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-5 h-5" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default PDSidePanel;
