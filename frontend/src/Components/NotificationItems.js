import React, { useState } from 'react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import {
  FaCheck,
  FaTrash,
  FaExternalLinkAlt,
  FaCommentDots,
  FaExclamationTriangle,
  FaInfoCircle,
  FaShoppingCart,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaNewspaper,
  FaEthereum,
} from 'react-icons/fa';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'report_reply':
      return <FaCommentDots className="h-3 w-3 mr-1" />;
    case 'transaction:debit':
      return <span className="mr-1">⬇️</span>;
    case 'transaction:credit':
      return <span className="mr-1">⬆️</span>;
    case 'new_blog':
      return <FaNewspaper className="h-3 w-3 mr-1 text-blue-500" />;
    case 'transaction:withdrawal':
      return <FaShoppingCart className="h-3 w-3 mr-1" />;
    case 'transaction:payment_completed':
      return <FaCheckCircle className="h-3 w-3 mr-1" />;
    case 'transaction:rejected':
      return <FaExclamationTriangle className="h-3 w-3 mr-1 text-red-600" />;
    case 'market_upload:DONE':
      return <FaCheckCircle className="h-3 w-3 mr-1 text-green-600" />;
    case 'market_upload:CANCEL':
      return <FaTimesCircle className="h-3 w-3 mr-1 text-red-600" />;
    case 'market_upload:PROCESSING':
      return <FaClock className="h-3 w-3 mr-1 text-yellow-600" />;
    case 'transaction:eth_processed':
      return <FaEthereum className="h-3 w-3 mr-1 text-purple-600" />;
    default:
      return <FaInfoCircle className="h-3 w-3 mr-1 text-gray-400" />;
  }
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onViewDetails
}) => {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
  const truncateLength = 60;
  const truncatedMessage =
    notification.message.length > truncateLength
      ? `${notification.message.substring(0, truncateLength)}...`
      : notification.message;

  const notificationIcon = getNotificationIcon(notification.type);

  return (
    <li
      className={clsx(
        'px-4 py-8 hover:bg-gray-50 transition duration-150 ease-in-out rounded-md shadow-sm border',
        notification.isRead ? 'bg-gray-100' : 'bg-white'
      )}
    >
      <div className="flex justify-between items-start gap-6">
        <div className="flex-grow">
          <p className="text-sm font-medium text-black flex items-center">
            {notificationIcon}
            {truncatedMessage}
          </p>
          <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>

          {notification.isRead && (
            <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">
              Read
            </span>
          )}

          {notification.message.length > truncateLength && (
            <button
              onClick={() => onViewDetails(notification)}
              className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-100 transition"
            >
              <FaExternalLinkAlt className="mr-1 h-3 w-3" />
              View More
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 mt-1">
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification._id)}
              className="text-green-600 hover:text-green-800 p-2 rounded-full border border-green-200 hover:bg-green-100 transition"
              title="Mark as Read"
            >
              <FaCheck size={12} />
            </button>
          )}
          <button
            onClick={() => onDelete(notification._id)}
            className="text-red-600 hover:text-red-800 p-2 rounded-full border border-red-200 hover:bg-red-100 transition"
            title="Delete"
          >
            <FaTrash size={12} />
          </button>
        </div>
      </div>
    </li>
  );
};


export default NotificationItem;
