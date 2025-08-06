import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import { FaEdit } from 'react-icons/fa';
import { PiUserSquare } from "react-icons/pi";
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [errorProfile, setErrorProfile] = useState(null);
  const [profileData, setProfileData] = useState(user || null);

  const fetchUserProfile = useCallback(async () => {
    setErrorProfile(null);
    try {
      const response = await fetch(SummaryApi.getUserProfile.url, {
        method: SummaryApi.getUserProfile.method,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile data');
      }

      const data = await response.json();
      setProfileData(data.data);
    } catch (err) {
      setErrorProfile(err.message);
      toast.error(err.message);
    }
  }, []);

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setProfileData(data.data);
      } else {
        toast.error(data.message || "Failed to fetch updated user details.");
      }
    } catch (error) {
      toast.error("Error fetching updated user details.");
    }
  }, []);

  const handleEditProfile = () => {
    if (profileData) {
      navigate('/settings', {
        state: {
          name: profileData.name,
          tag: profileData.tag,
          telegramNumber: profileData.telegramNumber,
          email: profileData.email,
          profilePic: profileData.profilePic,
        },
      });
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  useEffect(() => {
    // Fetch profile data only if it's not already available from Redux
    if (!user?.name) {
      fetchUserProfile();
    }
    fetchUserDetails();
  }, [fetchUserProfile, fetchUserDetails, user?.name]);

  if (errorProfile) {
    return (
      <div className="mt-8 p-4 sm:p-6 max-w-4xl mx-auto bg-red-100 border border-red-300 text-red-800 rounded-xl shadow-md">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="font-semibold">Error loading profile</p>
            <p className="text-sm mt-1">{errorProfile}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="mt-8 p-4 sm:p-6 max-w-4xl mx-auto bg-gray-50 border border-gray-200 text-gray-600 rounded-xl shadow-md">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="font-semibold">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 p-4 sm:p-6 max-w-4xl mx-auto bg-white shadow-xl border border-gray-100">
      <div className="border-b border-gray-300 pb-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-yellow-200">
                {profileData?.profilePic ? (
                  <img
                    src={profileData.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <PiUserSquare size={48} className="text-yellow-700" />
                )}
              </div>
            </div>

            <div className="flex-grow min-w-0 text-center sm:text-left">
              <div className="space-y-2">
                <h2
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words leading-tight"
                  title={profileData.name || 'No Name'}
                >
                  <span className="block sm:hidden">{truncateText(profileData.name || 'No Name', 20)}</span>
                  <span className="hidden sm:block lg:hidden">{truncateText(profileData.name || 'No Name', 25)}</span>
                  <span className="hidden lg:block">{profileData.name || 'No Name'}</span>
                </h2>

                <div className="space-y-1 text-sm text-gray-700">
                  {profileData.email && (
                    <p className="flex items-center justify-center sm:justify-start">
                      <span className="font-medium mr-2">Email:</span>
                      <span className="break-all text-blue-600 hover:underline" title={profileData.email}>{profileData.email}</span>
                    </p>
                  )}

                  {profileData.tag && (
                    <p className="flex items-center justify-center sm:justify-start">
                      <span className="font-medium mr-2">Tag:</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">{profileData.tag}</span>
                    </p>
                  )}

                  {profileData.telegramNumber && (
                    <p className="flex items-center justify-center sm:justify-start">
                      <span className="font-medium mr-2">Telegram:</span>
                      <span>{profileData.telegramNumber}</span>
                    </p>
                  )}

                  {profileData.createdAt && (
                    <p className="flex items-center justify-center sm:justify-start text-gray-600">
                      <span className="font-medium mr-2">Member Since:</span>
                      <span>{moment(profileData.createdAt).format('MMM D, YYYY')}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex justify-center sm:justify-end">
            <button
              onClick={handleEditProfile}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            >
              <FaEdit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-yellow-50 rounded-xl p-5 shadow-sm border border-yellow-200">
          <div className="text-3xl font-extrabold text-yellow-800 mb-2">
            {profileData.createdAt ? moment().diff(moment(profileData.createdAt), 'days') : 0}
          </div>
          <div className="text-sm font-medium text-yellow-700 uppercase tracking-wide">Days Active</div>
        </div>

        <div className="bg-green-50 rounded-xl p-5 shadow-sm border border-green-200">
          <div className="text-3xl font-extrabold text-green-800 mb-2">
            {profileData.email ? '✓' : '✗'}
          </div>
          <div className="text-sm font-medium text-green-700 uppercase tracking-wide">Email Verified</div>
        </div>

        <div className="bg-blue-50 rounded-xl p-5 shadow-sm border border-blue-200">
          <div className="text-3xl font-extrabold text-blue-800 mb-2">
            {profileData.profilePic ? '✓' : '✗'}
          </div>
          <div className="text-sm font-medium text-blue-700 uppercase tracking-wide">Profile Picture</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;