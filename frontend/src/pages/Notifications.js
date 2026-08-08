import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaBell,
  FaEnvelopeOpen,
  FaCheckDouble,
  FaSpinner,
  FaInbox,
} from 'react-icons/fa';
import NotificationItem from '../Components/NotificationItems';
import NotificationDetails from '../Components/NotificationDetails';
import SummaryApi from '../common';
import { toUserSafeMessage } from '../utils/userSafeMessage';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [, setIsMarkingAllRead] = useState(false);
  const [, setIsDeletingAll] = useState(false);

  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const syncInFlightRef = useRef(false);

  const fetchNotifications = useCallback(async (options = {}) => {
    const { showLoading = false, surfaceError = false } = options;

    if (syncInFlightRef.current) return;
    syncInFlightRef.current = true;

    if (showLoading) setLoading(true);
    if (surfaceError) setError('');

    try {
      const [transactionRes, reportRes, marketRes] = await Promise.all([
        fetch(SummaryApi.getTransactionNotifications.url, {
          method: SummaryApi.getTransactionNotifications.method,
          credentials: 'include',
        }),
        fetch(SummaryApi.getReportNotifications.url, {
          method: SummaryApi.getReportNotifications.method,
          credentials: 'include',
        }),
        fetch(SummaryApi.getMarketNotifications.url, {
          method: 'GET',
          credentials: 'include',
        }),
      ]);

      const [transactionData, reportData, marketData] = await Promise.all([
        transactionRes.json(),
        reportRes.json(),
        marketRes.json(),
      ]);

      if (transactionData.success && reportData.success && marketData.success) {
        const filteredTxns = transactionData.data.filter((n) =>
          [
            'transaction:debit',
            'transaction:credit',
            'transaction:payment_completed',
            'transaction:withdrawal',
            'transaction:rejected',
            'transaction:eth_processed',
          ].includes(n.type),
        );

        const all = [
          ...filteredTxns,
          ...reportData.data,
          ...marketData.data,
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setNotifications(all);
        setError('');
      } else {
        const errorMessage =
          [transactionData.message, reportData.message, marketData.message]
            .filter(Boolean)
            .join(' ') || 'Failed to fetch notifications.';
        if (surfaceError) {
          setError(
            toUserSafeMessage(errorMessage, 'Failed to fetch notifications.'),
          );
        }
      }
    } catch (err) {
      console.error('[Fetch Notifications Error]', err);
      if (surfaceError) {
        setError(
          toUserSafeMessage(
            err?.message,
            'An unexpected error occurred while fetching notifications.',
          ),
        );
      }
    } finally {
      syncInFlightRef.current = false;
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchNotifications({ showLoading: true, surfaceError: true });
      const interval = setInterval(() => fetchNotifications(), 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user?._id, fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(
        `${SummaryApi.markNotificationAsRead.url}/${id}`,
        {
          method: SummaryApi.markNotificationAsRead.method,
          credentials: 'include',
        },
      );
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === id ? { ...n, isRead: true, read: 'READ' } : n,
          ),
        );
        toast.success(data.message || 'Marked as read');
      } else {
        toast.error(data.message || 'Failed to mark as read');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark notification as read.');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const res = await fetch(`${SummaryApi.deleteNotification.url}/${id}`, {
        method: SummaryApi.deleteNotification.method,
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        toast.success(data.message || 'Notification deleted.');
      } else {
        toast.error(data.message || 'Failed to delete notification.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete notification.');
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      const res = await fetch(SummaryApi.markAllNotificationsAsRead.url, {
        method: SummaryApi.markAllNotificationsAsRead.method,
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, read: 'READ' })),
        );
        toast.success(data.message || 'All notifications marked as read.');
      } else {
        toast.error(data.message || 'Failed to mark all as read.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark all as read.');
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete all notifications? This action cannot be undone.',
      )
    ) {
      return;
    }

    setIsDeletingAll(true);
    try {
      const res = await fetch(SummaryApi.deleteAllNotifications.url, {
        method: SummaryApi.deleteAllNotifications.method,
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setNotifications([]);
        toast.success(data.message || 'All notifications deleted.');
      } else {
        toast.error(data.message || 'Failed to delete all notifications.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete all notifications.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleOpenReportReply = (notification) => {
    navigate(`/chat/${notification.relatedObjectId}`);
    if (!notification.isRead) handleMarkAsRead(notification._id);
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setIsDetailsOpen(true);
  };

  const handleOpenMarketDetails = (marketId) => {
    const item = notifications.find(
      (n) => n.relatedObjectId === marketId && n.onModel === 'userproduct',
    );
    if (item) {
      setSelectedNotification(item);
      setIsDetailsOpen(true);
    }
  };

  const handleViewCreditDetails = (notification) => {
    setSelectedNotification(notification);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedNotification(null);
    setIsDetailsOpen(false);
  };

  const filteredNotifications = () => {
    if (filter === 'unread') return notifications.filter((n) => !n.isRead);
    if (filter === 'read') return notifications.filter((n) => n.isRead);
    return notifications;
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  // Loading State Component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <FaSpinner className="mb-4 animate-spin text-4xl text-brand-gold" />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
        Loading notifications...
      </p>
    </div>
  );

  // Error State Component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 text-5xl text-rose-400">⚠️</div>
      <p className="mb-2 font-spaceGrotesk text-lg font-black uppercase tracking-tight text-rose-300">
        Error Loading Notifications
      </p>
      <p className="mb-4 text-sm text-gray-500">{error}</p>
      <button
        onClick={() =>
          fetchNotifications({ showLoading: true, surfaceError: true })
        }
        className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-rose-300 transition-colors hover:bg-rose-500/20"
      >
        Try Again
      </button>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <FaInbox className="mb-4 text-6xl text-gray-700" />
      <p className="mb-2 font-spaceGrotesk text-lg font-black uppercase tracking-tight text-white">
        No notifications yet
      </p>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
        You're all caught up.
      </p>
    </div>
  );

  if (!user?._id) {
    return (
      <div className="premium-bg min-h-screen py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Please log in to view your notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-bg min-h-screen pb-24 pt-[var(--total-content-offset)]">
      <div className="h-full px-2 sm:px-4">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 mb-6 flex-shrink-0 p-4 md:p-8">
            <h2 className="mb-8 font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">
              Notifications
            </h2>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              {['all', 'unread', 'read'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 font-spaceGrotesk text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    filter === tab
                      ? 'border-brand-gold bg-brand-gold text-brand-dark-base shadow-brand-gold'
                      : 'border-white/10 bg-white/5 text-gray-500 hover:border-brand-gold/30 hover:text-white'
                  }`}
                >
                  {tab === 'all' && <FaBell className="h-3.5 w-3.5" />}
                  {tab === 'unread' && (
                    <FaEnvelopeOpen className="h-3.5 w-3.5" />
                  )}
                  {tab === 'read' && <FaCheckDouble className="h-3.5 w-3.5" />}
                  <span>{tab}</span>
                </button>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <span>{filteredNotifications().length} visible records</span>
              <button
                onClick={handleDeleteAll}
                className="text-rose-400 transition-colors hover:text-rose-300"
              >
                Delete All
              </button>
              {hasUnread && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sky-400 transition-colors hover:text-sky-300"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          <div className="min-h-96 overflow-hidden px-4 pb-10 md:px-8">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState />
            ) : filteredNotifications().length > 0 ? (
              <ul className="space-y-1">
                {filteredNotifications().map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    onOpenReportReply={handleOpenReportReply}
                    onViewDetails={handleViewDetails}
                    onOpenMarketDetails={handleOpenMarketDetails}
                    onViewCreditDetails={handleViewCreditDetails}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {/* Notification Details Modal */}
      {isDetailsOpen && selectedNotification && (
        <NotificationDetails
          notification={selectedNotification}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
