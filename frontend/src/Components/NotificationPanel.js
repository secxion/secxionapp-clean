import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './NotificationPanel.css';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([
    { id: 2, message: 'Hey! Got an update for you', link: '/chat' },
    { id: 3, message: 'Your transaction has been reviewed', link: '/chat' },
  ]);

  return (
    <div className="notification-panel">
      {notifications.length > 0 ? (
        notifications.map((notif) => (
          <Link key={notif.id} to={notif.link} className="notification-item">
            {notif.message}
          </Link>
        ))
      ) : (
        <p className="no-notifications">No new messages</p>
      )}
    </div>
  );
};

export default NotificationPanel;
