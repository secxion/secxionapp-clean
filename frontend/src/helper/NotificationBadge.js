import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PiBell } from 'react-icons/pi';
import SummaryApi from '../common';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import notificationSound from '../Assets/notification.mp3';
import NotificationStack from './NotificationStack';
import {
  getNotificationTypeMetadata,
  getVibrationPattern,
  getSoundVolume,
} from '../utils/notificationTypeHelper';

const NotificationBadge = () => {
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [popupNotifications, setPopupNotifications] = useState([]);
  const { user } = useSelector((state) => state.user);
  const audioRef = useRef(null);
  const lastShownIdsRef = useRef(new Set());

  const playNotificationSound = useCallback((priority = 'medium') => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = getSoundVolume(priority);
      audioRef.current.play().catch((err) => {
        console.warn('Notification sound failed:', err);
      });
    }
  }, []);

  const triggerVibration = useCallback((priority = 'medium') => {
    if (navigator.vibrate) {
      const pattern = getVibrationPattern(priority);
      navigator.vibrate(pattern);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (user?._id) {
      try {
        const response = await fetch(SummaryApi.notificationCount.url, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (data.success) {
          setUnreadNotificationCount(data.count);
        }
      } catch (error) {
        console.error('❌ Error fetching unread count:', error);
      }
    }
  }, [user?._id]);

  const fetchNewNotifications = useCallback(async () => {
    if (user?._id) {
      try {
        const response = await fetch(SummaryApi.getNewNotifications.url, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (data.success && Array.isArray(data.newNotifications)) {
          // Process all new notifications, not just the latest
          // Exclude ETH notifications - ETH wallet has its own local notification system
          const newNotifications = data.newNotifications.filter((notif) => {
            // Skip already shown
            if (lastShownIdsRef.current.has(notif._id)) return false;

            // Skip ETH processed notifications
            if (notif.type === 'transaction:eth_processed') return false;

            // Skip ETH withdrawal debit notifications (link points to /eth-withdrawals or message contains ETH)
            if (
              notif.type === 'transaction:debit' &&
              (notif.link === '/eth-withdrawals' ||
                notif.message?.includes('ETH'))
            ) {
              return false;
            }

            return true;
          });

          if (newNotifications.length > 0) {
            // Add new notifications to the stack
            newNotifications.forEach((notification) => {
              lastShownIdsRef.current.add(notification._id);

              // Get metadata for this notification type
              const metadata = getNotificationTypeMetadata(
                notification.type || 'default',
              );

              // Add to popup queue
              setPopupNotifications((prev) => [
                ...prev,
                {
                  id: notification._id,
                  message: notification.message || 'New notification received!',
                  type: notification.type || 'default',
                  autoClose: true,
                },
              ]);

              // Use priority-aware sound and vibration
              playNotificationSound(metadata.priority);
              triggerVibration(metadata.priority);
            });
          }
        }
      } catch (error) {
        console.error('❌ Error fetching new notifications:', error);
      }
    }
  }, [user?._id, playNotificationSound, triggerVibration]);

  useEffect(() => {
    fetchUnreadCount();
    fetchNewNotifications();

    const unreadCountIntervalId = setInterval(fetchUnreadCount, 5000);
    const newNotificationsIntervalId = setInterval(fetchNewNotifications, 5000);

    return () => {
      clearInterval(unreadCountIntervalId);
      clearInterval(newNotificationsIntervalId);
    };
  }, [fetchUnreadCount, fetchNewNotifications]);

  const handleRemoveNotification = useCallback((id) => {
    setPopupNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  return (
    <>
      <div className="relative flex items-center">
        <Link
          to="/notifications"
          className="relative text-2xl text-gray-800 hover:text-black transition-colors"
          title="View all notifications"
        >
          <PiBell />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-0.5 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
              {unreadNotificationCount}
            </span>
          )}
        </Link>
        <audio ref={audioRef} src={notificationSound} preload="auto" />
      </div>

      {popupNotifications.length > 0 && (
        <NotificationStack
          notifications={popupNotifications}
          onRemove={handleRemoveNotification}
        />
      )}
    </>
  );
};

export default NotificationBadge;
