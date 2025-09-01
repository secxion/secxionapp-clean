import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-yellow-400 mb-4">Recent Activity</h3>
    </div>
  );
};
