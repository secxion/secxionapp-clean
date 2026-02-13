import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

// Basic CSS for notification (can be moved to a CSS file)
// .notification { position: fixed; top: 20px; right: 20px; padding: 12px 24px; border-radius: 6px; background: #222; color: #fff; z-index: 9999; box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 16px; }
// .notification-info { background: #222; }
// .notification-success { background: #2ecc40; }
// .notification-error { background: #e74c3c; }
// .notification-warning { background: #f1c40f; color: #222; }
