import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import SummaryApi from '../common';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import notificationSound from '../Assets/notification.mp3';
import NotificationStack from './NotificationStack';
import { useSound } from '../Context/SoundContext';
import {
  getNotificationTypeMetadata,
  getVibrationPattern,
  getSoundVolume,
} from '../utils/notificationTypeHelper';

const MAX_STORED_SHOWN_IDS = 250;
const USER_ACTION_POPUP_BLOCKLIST = new Set([
  'transaction:debit',
  'transaction:withdrawal',
  'market_upload:PROCESSING',
]);

const getStorageKey = (userId) => `secxion:shown-notifications:${userId}`;

const shouldShowPopupNotification = (notification) => {
  const type = notification?.type || 'default';

  if (USER_ACTION_POPUP_BLOCKLIST.has(type)) {
    return false;
  }

  return true;
};

const NotificationBadge = () => {
  const NOTIFICATION_POLL_MS = 10000;
  const UNREAD_COUNT_POLL_MS = 15000;
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [popupNotifications, setPopupNotifications] = useState([]);
  const { user } = useSelector((state) => state.user);
  const { soundEnabled, volume } = useSound();
  const audioRef = useRef(null);
  const pendingSoundPriorityRef = useRef(null);
  const isSoundUnlockedRef = useRef(false);
  const lastShownIdsRef = useRef(new Set());
  const queuedIdsRef = useRef(new Set());
  const lastNotificationFetchAtRef = useRef(Date.now() - 10 * 60 * 1000);
  const lastSoundTimeRef = useRef(0);
  const notificationCooldownUntilRef = useRef(0);
  const unreadCooldownUntilRef = useRef(0);
  const SOUND_COOLDOWN_MS = 3000; // Minimum time between sounds

  const compactCount =
    unreadNotificationCount > 99 ? '99+' : unreadNotificationCount;

  const playNotificationSound = useCallback(
    (priority = 'medium', options = {}) => {
      if (!soundEnabled || volume <= 0) {
        return;
      }

      const { force = false } = options;

      const now = Date.now();
      // Prevent rapid successive sounds - enforce cooldown
      if (!force && now - lastSoundTimeRef.current < SOUND_COOLDOWN_MS) {
        return;
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        const targetVolume = Math.max(
          0,
          Math.min(1, getSoundVolume(priority) * volume),
        );
        audioRef.current.volume = targetVolume;
        audioRef.current
          .play()
          .then(() => {
            // Apply cooldown only when playback really starts.
            lastSoundTimeRef.current = Date.now();
          })
          .catch((err) => {
            // Browser blocked autoplay: queue one pending sound to play
            // on next real user interaction.
            pendingSoundPriorityRef.current = priority;
            if (err?.name !== 'NotAllowedError') {
              console.warn('Notification sound failed:', err);
            }
          });
      }
    },
    [soundEnabled, volume],
  );

  useEffect(() => {
    if (!soundEnabled) {
      pendingSoundPriorityRef.current = null;
    }
  }, [soundEnabled]);

  useEffect(() => {
    const unlockAndPlayPending = () => {
      isSoundUnlockedRef.current = true;

      const pendingPriority = pendingSoundPriorityRef.current;
      if (!pendingPriority) return;

      pendingSoundPriorityRef.current = null;
      // Play immediately after a trusted user interaction.
      playNotificationSound(pendingPriority, { force: true });
    };

    window.addEventListener('pointerdown', unlockAndPlayPending, {
      passive: true,
    });
    window.addEventListener('keydown', unlockAndPlayPending);

    return () => {
      window.removeEventListener('pointerdown', unlockAndPlayPending);
      window.removeEventListener('keydown', unlockAndPlayPending);
    };
  }, [playNotificationSound]);

  const triggerVibration = useCallback((priority = 'medium') => {
    if (navigator.vibrate) {
      const pattern = getVibrationPattern(priority);
      navigator.vibrate(pattern);
    }
  }, []);

  const persistShownIds = useCallback(() => {
    if (!user?._id) return;
    try {
      const allIds = Array.from(lastShownIdsRef.current);
      const trimmed = allIds.slice(-MAX_STORED_SHOWN_IDS);
      sessionStorage.setItem(getStorageKey(user._id), JSON.stringify(trimmed));
    } catch (error) {
      console.warn('Failed to persist shown notification IDs:', error);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) {
      lastShownIdsRef.current = new Set();
      queuedIdsRef.current = new Set();
      return;
    }

    try {
      const raw = sessionStorage.getItem(getStorageKey(user._id));
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        lastShownIdsRef.current = new Set(parsed.slice(-MAX_STORED_SHOWN_IDS));
      } else {
        lastShownIdsRef.current = new Set();
      }
    } catch (error) {
      console.warn('Failed to hydrate shown notification IDs:', error);
      lastShownIdsRef.current = new Set();
    }
  }, [user?._id]);

  useEffect(() => {
    queuedIdsRef.current = new Set(popupNotifications.map((n) => n.id));
  }, [popupNotifications]);

  const fetchUnreadCount = useCallback(async () => {
    if (user?._id) {
      if (Date.now() < unreadCooldownUntilRef.current) {
        return;
      }

      try {
        const response = await fetch(SummaryApi.notificationCount.url, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 429) {
          unreadCooldownUntilRef.current = Date.now() + 60000;
          return;
        }

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
      if (Date.now() < notificationCooldownUntilRef.current) {
        return;
      }

      try {
        const since = lastNotificationFetchAtRef.current;
        const response = await fetch(
          `${SummaryApi.getNewNotifications.url}?since=${since}`,
          {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (response.status === 429) {
          notificationCooldownUntilRef.current = Date.now() + 60000;
          return;
        }

        const data = await response.json();
        lastNotificationFetchAtRef.current = Date.now();

        if (data.success && Array.isArray(data.newNotifications)) {
          const seenInBatch = new Set();

          // Process all new notifications, not just the latest
          // Exclude ETH notifications - ETH wallet has its own local notification system
          const newNotifications = data.newNotifications.filter((notif) => {
            const notifId = notif?._id;

            if (!notifId) return false;

            // Only show popup/sound for pushed account updates, not user-initiated actions.
            if (!shouldShowPopupNotification(notif)) return false;

            // Skip duplicates from the same server payload
            if (seenInBatch.has(notifId)) return false;
            seenInBatch.add(notifId);

            // Skip already shown
            if (lastShownIdsRef.current.has(notifId)) return false;

            // Skip if already visible/queued in popup stack
            if (queuedIdsRef.current.has(notifId)) return false;

            return true;
          });

          if (newNotifications.length > 0) {
            // Add all IDs to the Set FIRST to prevent race conditions
            newNotifications.forEach((notif) => {
              lastShownIdsRef.current.add(notif._id);
            });
            persistShownIds();

            // Find highest priority for sound/vibration (play once per batch)
            let highestPriority = 'low';
            const priorityOrder = { low: 0, medium: 1, high: 2 };

            // Add notifications to popup queue
            const newPopups = newNotifications.map((notification) => {
              const metadata = getNotificationTypeMetadata(
                notification.type || 'default',
              );

              // Track highest priority
              if (
                priorityOrder[metadata.priority] >
                priorityOrder[highestPriority]
              ) {
                highestPriority = metadata.priority;
              }

              return {
                id: notification._id,
                message: notification.message || 'New notification received!',
                type: notification.type || 'default',
                relatedObjectId: notification.relatedObjectId,
                autoClose: true,
              };
            });

            if (newPopups.length === 0) {
              return;
            }

            setPopupNotifications((prev) => {
              const existingIds = new Set(prev.map((item) => item.id));
              const uniqueIncoming = newPopups.filter(
                (item) => !existingIds.has(item.id),
              );

              if (uniqueIncoming.length === 0) {
                return prev;
              }

              return [...prev, ...uniqueIncoming];
            });

            // Keep counter in sync with server right after new popup payload arrives.
            fetchUnreadCount();

            // Play sound and vibrate only ONCE per batch
            playNotificationSound(highestPriority);
            triggerVibration(highestPriority);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching new notifications:', error);
      }
    }
  }, [
    user?._id,
    playNotificationSound,
    triggerVibration,
    persistShownIds,
    fetchUnreadCount,
  ]);

  useEffect(() => {
    // Only poll for notifications if user is logged in
    if (!user?._id) return;

    const shouldPoll = () => document.visibilityState === 'visible';

    const pollUnreadCount = () => {
      if (shouldPoll()) {
        fetchUnreadCount();
      }
    };

    const pollNewNotifications = () => {
      if (shouldPoll()) {
        fetchNewNotifications();
      }
    };

    pollUnreadCount();
    pollNewNotifications();

    const handleVisibilityOrFocus = () => {
      if (shouldPoll()) {
        pollUnreadCount();
        pollNewNotifications();
      }
    };

    const handleOnline = () => {
      pollUnreadCount();
      pollNewNotifications();
    };

    const unreadCountIntervalId = setInterval(
      pollUnreadCount,
      UNREAD_COUNT_POLL_MS,
    );
    const newNotificationsIntervalId = setInterval(
      pollNewNotifications,
      NOTIFICATION_POLL_MS,
    );

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(unreadCountIntervalId);
      clearInterval(newNotificationsIntervalId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [user?._id, fetchUnreadCount, fetchNewNotifications]);

  const handleRemoveNotification = useCallback((id) => {
    queuedIdsRef.current.delete(id);
    setPopupNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  return (
    <>
      <div className="relative flex items-center">
        <Link
          to="/notifications"
          className="relative flex h-6 w-6 items-center justify-center text-brand-dark-base transition-colors duration-200 hover:text-black"
          title="View all notifications"
          aria-label="Open notifications"
        >
          <FaBell className="h-4 w-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full border border-red-200/30 bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-black leading-none text-white shadow-[0_0_12px_rgba(239,68,68,0.55)]">
              {compactCount}
            </span>
          )}
        </Link>
        <audio
          ref={audioRef}
          src={notificationSound}
          preload="auto"
          playsInline
        />
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
