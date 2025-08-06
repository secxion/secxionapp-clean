import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PiBell } from 'react-icons/pi';
import SummaryApi from '../common';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import notificationSound from '../Assets/notification.mp3';
import PopAlert from './PopAlert';

const NotificationBadge = () => {
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [animate, setAnimate] = useState(false);
  const { user } = useSelector((state) => state.user);
  const audioRef = useRef(null);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.warn("Notification sound failed:", err);
      });
    }
  };

  const triggerVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

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
        console.error("❌ Error fetching unread count:", error);
      }
    }
  }, [user?._id]);

  const fetchNewNotifications = useCallback(async () => {
    if (user?._id) {
      try {
        const response = await fetch(SummaryApi.getNewNotifications.url, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        if (data.success && Array.isArray(data.newNotifications)) {
          const latest = data.newNotifications[0];
          const lastShownId = localStorage.getItem('lastNotifiedId');

          if (latest && latest._id !== lastShownId) {
            localStorage.setItem('lastNotifiedId', latest._id);
            setPopupMessage(latest.message || "New notification received!");
            setShowPopup(true);
            setAnimate(true);
            playNotificationSound();
            triggerVibration();

            setTimeout(() => setAnimate(false), 1500);
            setTimeout(() => setShowPopup(false), 2500);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching new notifications:", error);
      }
    }
  }, [user?._id]);

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

  return (
    <>
      <div className="relative flex items-center">
        <Link to="/notifications" className="relative text-2xl text-gray-800 hover:text-black">
          <PiBell />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-0.5 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {unreadNotificationCount}
            </span>
          )}
        </Link>
        <audio ref={audioRef} src={notificationSound} preload="auto" />
      </div>

      {showPopup && (
        <PopAlert
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

export default NotificationBadge;
