import React, { useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotificationTypeMetadata } from '../utils/notificationTypeHelper';
import './PopAlert.css';

/**
 * NotificationStack Component
 * Manages multiple notifications displayed as a stack
 * Max 3 notifications visible at once
 */
const NotificationStack = ({ notifications = [], onRemove = () => {} }) => {
  const navigate = useNavigate();
  const closeTimeoutsRef = useRef({});

  // Auto-close logic for each notification
  useEffect(() => {
    const timeoutRegistry = closeTimeoutsRef.current;

    notifications.forEach((notification) => {
      if (notification.autoClose && !timeoutRegistry[notification.id]) {
        const metadata = getNotificationTypeMetadata(notification.type);
        timeoutRegistry[notification.id] = setTimeout(() => {
          onRemove(notification.id);
          delete timeoutRegistry[notification.id];
        }, metadata.displayTime);
      }
    });

    return () => {
      Object.values(timeoutRegistry).forEach(clearTimeout);
    };
  }, [notifications, onRemove]);

  const handleClose = useCallback(
    (id) => {
      if (closeTimeoutsRef.current[id]) {
        clearTimeout(closeTimeoutsRef.current[id]);
        delete closeTimeoutsRef.current[id];
      }
      onRemove(id);
    },
    [onRemove],
  );

  const handleViewMore = useCallback(
    (notification) => {
      const isReportReply =
        notification.type === 'report_reply' && notification.relatedObjectId;

      navigate(
        isReportReply
          ? `/chat/${notification.relatedObjectId}`
          : '/notifications',
      );
      handleClose(notification.id);
    },
    [navigate, handleClose],
  );

  if (notifications.length === 0) {
    return null;
  }

  // Limit to max 3 visible notifications
  const visibleNotifications = notifications.slice(0, 3);

  const popup = (
    <div
      className="pop-alert-wrapper has-notification"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="pop-alert-stack" style={{ perspective: '1000px' }}>
        {visibleNotifications.map((notification, index) => {
          const metadata = getNotificationTypeMetadata(notification.type);
          const shouldTruncate = notification.message.length > 120;
          const truncatedMessage = shouldTruncate
            ? notification.message.slice(0, 120) + '...'
            : notification.message;

          const priorityClassMap = {
            critical: 'pop-alert-error',
            high: 'pop-alert-warning',
            medium: 'pop-alert-info',
            low: 'pop-alert-info',
          };

          // Stagger effect with subtle depth only (no intrusive overlay shifts)
          const offsetY = index * 8;
          const scale = 1 - index * 0.015;

          return (
            <div
              key={notification.id}
              className={`pop-alert-container ${priorityClassMap[metadata.priority] || 'pop-alert-info'}`}
              role="alert"
              style={{
                transform: `translateY(${offsetY}px) scale(${scale})`,
                transformOrigin: 'top right',
                zIndex: visibleNotifications.length - index,
                position: index === 0 ? 'relative' : 'absolute',
                top: index === 0 ? 'auto' : `${index * 10}px`,
                left: 0,
                right: 0,
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Header with icon and close button */}
              <div className="pop-alert-header">
                <div className="pop-alert-icon-label">
                  <div className="pop-alert-icon">{metadata.icon}</div>
                  <h2 className="pop-alert-title">{metadata.label}</h2>
                </div>

                <button
                  onClick={() => handleClose(notification.id)}
                  className="pop-alert-close-btn"
                  aria-label="Close notification (press Esc)"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message */}
              <p className="pop-alert-message">
                {truncatedMessage}
                {shouldTruncate && (
                  <>
                    {' '}
                    <button
                      onClick={() => handleViewMore(notification)}
                      aria-label="View full notification details"
                    >
                      View more
                    </button>
                  </>
                )}
              </p>

              {/* Footer with action and badge */}
              <div className="pop-alert-footer">
                <div className="pop-alert-actions">
                  {!shouldTruncate && (
                    <button
                      onClick={() => handleViewMore(notification)}
                      className="pop-alert-action-btn"
                      aria-label={
                        notification.type === 'report_reply'
                          ? 'Open report chat'
                          : 'View all notifications'
                      }
                    >
                      View all →
                    </button>
                  )}
                </div>

                {/* Priority badge */}
                <span
                  className="pop-alert-badge"
                  style={{
                    backgroundColor: metadata.badgeBg,
                    color: metadata.badgeText,
                  }}
                >
                  {metadata.priority === 'critical'
                    ? '⚠️ Critical'
                    : metadata.priority === 'high'
                      ? '📌 Important'
                      : 'Info'}
                </span>

                {/* Notification count badge */}
                {index === 0 && notifications.length > 1 && (
                  <span className="ml-auto rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-gray-300">
                    +{notifications.length - 1} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return ReactDOM.createPortal(popup, document.getElementById('portal-root'));
};

export default NotificationStack;
