import { useEffect, useState, useCallback } from 'react';
import { PiBell } from 'react-icons/pi';
import SummaryApi from '../../common';

export default function Notifications() {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch(SummaryApi.notificationCount.url, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) setCount(data.count);
    } catch {}
  }, []);

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 5000);
    return () => clearInterval(id);
  }, [fetchCount]);

  return (
    <div className="relative">
      <PiBell className="text-2xl hover:text-white transition" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}
