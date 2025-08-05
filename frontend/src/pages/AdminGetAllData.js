import React, { useState, useEffect } from 'react';
import SummaryApi from '../common';
import UserDatapadCard from '../Components/UserDatapadCard';

const AdminGetAllData = () => {
  const [usersWithData, setUsersWithData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsersWithData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching admin data from:', SummaryApi.adminAllData.url);
        const response = await fetch(SummaryApi.adminAllData.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Admin data received:', data);
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
    return <div>Loading users with Datapad data...</div>;
  }

  if (error) {
    return <div>Error fetching users: {error}</div>;
  }

  return (
    <div className='container pt-16'>
      <h2 className="text-xl font-semibold mb-4">Users and Their Datapad Information</h2>
      {usersWithData.length > 0 ? (
        usersWithData.map((user) => (
          <UserDatapadCard key={user._id} user={user} /> 
        ))
      ) : (
        <p>No users have stored information in their Datapad yet.</p>
      )}
    </div>
  );
};

export default AdminGetAllData;