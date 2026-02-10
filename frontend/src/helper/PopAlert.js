import React, { useRef, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotificationTypeMetadata } from '../utils/notificationTypeHelper';
import './PopAlert.css';

const PopAlert = ({
  message = '',
  onClose,
  type = 'default',
  autoClose = true,
}) => {
  const navigate = useNavigate();
  const alertRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Get metadata for this notification type
  const metadata = getNotificationTypeMetadata(type);

  // Map priority to CSS class for colors
  const priorityClassMap = {
    critical: 'pop-alert-error',
    high: 'pop-alert-warning',
    medium: 'pop-alert-info',
    low: 'pop-alert-info',
  };

  const shouldTruncate = message.length > 120;
  const truncatedMessage = shouldTruncate
    ? message.slice(0, 120) + '...'
    : message;

  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Auto-close based on notification type
  useEffect(() => {
    if (autoClose) {
      closeTimeoutRef.current = setTimeout(() => {
        if (onClose) onClose();
      }, metadata.displayTime);
    }

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [autoClose, metadata.displayTime, onClose]);

  const handleViewMoreClick = useCallback(
    (e) => {
      e.stopPropagation();
      navigate('/notifications');
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (onClose) onClose();
    },
    [navigate, onClose],
  );

  const handleAlertClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleCloseClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (onClose) onClose();
    },
    [onClose],
  );

  const popup = (
    <div
      className="pop-alert-wrapper has-notification"
      aria-live="polite"
      aria-atomic="true"
      role="alert"
    >
      <div
        ref={alertRef}
        className={`pop-alert-container ${
          priorityClassMap[metadata.priority] || 'pop-alert-info'
        }`}
        onClick={handleAlertClick}
      >
        {/* Header with icon and close button */}
        <div className="pop-alert-header">
          <div className="pop-alert-icon-label">
            <div className="pop-alert-icon">{metadata.icon}</div>
            <h2 className="pop-alert-title">{metadata.label}</h2>
          </div>

          <button
            onClick={handleCloseClick}
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
                onClick={handleViewMoreClick}
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
                onClick={handleViewMoreClick}
                className="pop-alert-action-btn"
                aria-label="View all notifications"
              >
                View all →
              </button>
            )}
          </div>

          {/* Priority badge */}
          <span
            className="pop-alert-badge"
            style={{
              backgroundColor: metadata.badgeColor
                .split(' text-')[0]
                .replace('bg-', ''),
              color: metadata.badgeColor.split(' text-')[1] || 'white',
            }}
          >
            {metadata.priority === 'critical'
              ? '⚠️ Critical'
              : metadata.priority === 'high'
                ? '📌 Important'
                : 'Info'}
          </span>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(popup, document.getElementById('portal-root'));
};

export default PopAlert;
