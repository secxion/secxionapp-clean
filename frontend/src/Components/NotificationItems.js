import React from 'react';
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
  onViewDetails,
}) => {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });
  const truncateLength = 60;
  const truncatedMessage =
    notification.message.length > truncateLength
      ? `${notification.message.substring(0, truncateLength)}...`
      : notification.message;

  const notificationIcon = getNotificationIcon(notification.type);

  return (
    <li
      className={clsx(
        'group relative border-b border-white/5 bg-transparent px-4 py-6 transition-all duration-300 md:px-6',
        notification.isRead ? 'opacity-80' : 'opacity-100',
      )}
    >
      <div className="flex justify-between items-start gap-6">
        <div className="flex-grow">
          <p className="flex items-center text-sm font-black text-white font-spaceGrotesk uppercase tracking-wide">
            {notificationIcon}
            {truncatedMessage}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {timeAgo}
          </p>

          {notification.isRead && (
            <span className="ml-1 mt-2 inline-flex items-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
              Read
            </span>
          )}

          {notification.message.length > truncateLength && (
            <button
              onClick={() => onViewDetails(notification)}
              className="mt-2 inline-flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:border-brand-gold/30 hover:text-brand-gold"
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
              className="rounded-full border border-emerald-500/20 bg-emerald-500/5 p-2 text-emerald-400 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
              title="Mark as Read"
            >
              <FaCheck size={12} />
            </button>
          )}
          <button
            onClick={() => onDelete(notification._id)}
            className="rounded-full border border-rose-500/20 bg-rose-500/5 p-2 text-rose-400 transition hover:border-rose-400/40 hover:bg-rose-500/10"
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
