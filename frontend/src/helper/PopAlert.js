import React, { useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PopAlert = ({ message = "", onClose }) => {
  const shouldTruncate = message.length > 100;
  const truncatedMessage = shouldTruncate ? message.slice(0, 100) + "..." : message;
  const navigate = useNavigate();
  const alertRef = useRef(null);

  const handleViewMoreClick = useCallback((e) => {
    e.stopPropagation();
    navigate('/notifications');
    if (onClose) onClose();
  }, [navigate, onClose]);

  const handleAlertClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const popup = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 sm:px-6 lg:px-8 bg-black bg-opacity-30 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={alertRef}
        className="bg-white max-w-md w-full rounded-xl p-6 border border-gray-200 relative"
        onClick={handleAlertClick}
      >
        <button
          className="absolute top-4 right-4 text-gray-400"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-black mb-2">Notification</h2>
        <p className="text-gray-800 text-sm leading-relaxed mb-4">
          {truncatedMessage}
          {shouldTruncate && (
            <>
              {' '}
              <button
                onClick={handleViewMoreClick}
                className="text-blue-600 font-medium text-sm underline"
              >
                View more
              </button>
            </>
          )}
        </p>
        {!shouldTruncate && (
          <button
            onClick={handleViewMoreClick}
            className="inline-block text-blue-600 hover:text-blue-800 font-medium text-sm underline"
          >
            View all notifications
          </button>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(popup, document.getElementById('portal-root'));
};

export default PopAlert;
