import React, { useState, useEffect } from 'react';
import SummaryApi from '../common';
import UserDatapadCard from '../Components/UserDatapadCard';
import { FaMobileAlt } from 'react-icons/fa';

const AdminGetAllData = () => {
  const [usersWithData, setUsersWithData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsersWithData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(SummaryApi.adminAllData.url, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsersWithData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersWithData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent mr-3"></div>
        <span className="text-slate-400">Loading Datapad data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 lg:m-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
        Error fetching users: {error}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-yellow-500/10 rounded-xl">
          <FaMobileAlt className="text-yellow-500 text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">User Datapad</h1>
          <p className="text-slate-400 text-sm">
            View all users' stored Datapad information
          </p>
        </div>
      </div>

      {usersWithData.length > 0 ? (
        <div className="space-y-4">
          {usersWithData.map((user) => (
            <UserDatapadCard key={user._id} user={user} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <FaMobileAlt className="text-4xl mb-3" />
          <p>No users have stored information in their Datapad yet.</p>
        </div>
      )}
    </div>
  );
};

export default AdminGetAllData;
