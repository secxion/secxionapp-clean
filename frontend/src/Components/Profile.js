import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import { 
  FaEdit, 
  FaUser, 
  FaEnvelope, 
  FaTelegram, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle,
  FaUserShield,
  FaUserCheck,
  FaImage
} from 'react-icons/fa';
import { PiUserSquare } from "react-icons/pi";
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import SecxionShimmer from './SecxionShimmer';

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [errorProfile, setErrorProfile] = useState(null);
  const [profileData, setProfileData] = useState(user || null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    setErrorProfile(null);
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

  const getDaysActive = () => {
    if (!profileData?.createdAt) return 0;
    return moment().diff(moment(profileData.createdAt), 'days');
  };

  const getAccountAge = () => {
    if (!profileData?.createdAt) return 'Unknown';
    const duration = moment.duration(moment().diff(moment(profileData.createdAt)));
    const years = duration.years();
    const months = duration.months();
    const days = duration.days();

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ${days > 0 ? `, ${days} day${days > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  const isEmailVerified = () => {
    // Check multiple possible field names for email verification
    return profileData?.isEmailVerified === true || 
           profileData?.emailVerified === true || 
           profileData?.verified === true ||
           profileData?.isVerified === true ||
           profileData?.email_verified === true;
  };

  const hasCompletedProfile = () => {
    return !!(profileData?.name && profileData?.email && profileData?.tag);
  };

  useEffect(() => {
    if (!user?.name) {
      fetchUserProfile();
    } else {
      setProfileData(user);
      setIsLoading(false);
    }
    fetchUserDetails();
  }, [fetchUserProfile, fetchUserDetails, user?.name]);

  // Add debug logging to see what verification fields are available
  useEffect(() => {
    if (profileData) {
      console.log('Profile data verification fields:', {
        isEmailVerified: profileData.isEmailVerified,
        emailVerified: profileData.emailVerified,
        verified: profileData.verified,
        isVerified: profileData.isVerified,
        email_verified: profileData.email_verified,
        // Log the entire user object to see what fields exist
        allFields: Object.keys(profileData)
      });
    }
  }, [profileData]);

  if (isLoading) {
    return (
      <div className="mt-20 p-4 sm:p-6 max-w-4xl mx-auto">
        <SecxionShimmer type="profile" count={1} />
      </div>
    );
  }

  if (errorProfile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-20 p-6 max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-lg"
      >
        <div className="flex items-center justify-center">
          <div className="text-center">
            <FaTimesCircle className="mx-auto text-4xl mb-3 text-red-500" />
            <p className="font-semibold text-lg">Error loading profile</p>
            <p className="text-sm mt-1 text-red-600">{errorProfile}</p>
            <button
              onClick={fetchUserProfile}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!profileData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-20 p-6 max-w-4xl mx-auto bg-gray-50 border border-gray-200 text-gray-600 rounded-xl shadow-lg"
      >
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-3"></div>
            <p className="font-semibold">Loading profile...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-20 p-4 sm:p-6 max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 shadow-2xl border border-gray-100 rounded-2xl"
    >
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-6 sm:space-y-0 sm:space-x-8">
            {/* Profile Picture */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 mx-auto sm:mx-0"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-yellow-300/30">
                  {profileData?.profilePic ? (
                    <img
                      src={profileData.profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <PiUserSquare size={56} className="text-yellow-700" />
                  )}
                </div>
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </motion.div>

            {/* Profile Info */}
            <div className="flex-grow min-w-0 text-center sm:text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-center sm:justify-start space-x-3">
                  <h1
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words leading-tight"
                    title={profileData.name || 'No Name'}
                  >
                    {profileData.name || 'Unnamed User'}
                  </h1>
                  {hasCompletedProfile() && (
                    <FaUserCheck className="text-blue-500 text-xl" title="Profile Complete" />
                  )}
                </div>

                {/* User Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {profileData.email && (
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <FaEnvelope className="text-gray-500 flex-shrink-0" />
                      <span className="text-gray-600 break-all" title={profileData.email}>
                        {truncateText(profileData.email, 25)}
                      </span>
                      {isEmailVerified() ? (
                        <FaCheckCircle className="text-green-500 flex-shrink-0" title="Email Verified" />
                      ) : (
                        <FaTimesCircle className="text-red-500 flex-shrink-0" title="Email Not Verified" />
                      )}
                    </div>
                  )}

                  {profileData.tag && (
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <FaUser className="text-gray-500 flex-shrink-0" />
                      <span className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-300">
                        @{profileData.tag}
                      </span>
                    </div>
                  )}

                  {profileData.telegramNumber && (
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <FaTelegram className="text-blue-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{profileData.telegramNumber}</span>
                    </div>
                  )}

                  {profileData.createdAt && (
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <FaCalendarAlt className="text-gray-500 flex-shrink-0" />
                      <span className="text-gray-600">
                        Member for {getAccountAge()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex-shrink-0 flex justify-center lg:justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEditProfile}
              className="inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            >
              <FaEdit className="w-4 h-4" />
              <span>Edit Profile</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow-md border border-yellow-200 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <FaCalendarAlt className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-800">
                {getDaysActive()}
              </div>
              <div className="text-sm font-medium text-yellow-700 uppercase tracking-wide">
                Days Active
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md border border-green-200 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <FaUserShield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-800">
                {isEmailVerified() ? (
                  <FaCheckCircle className="inline text-green-600" />
                ) : (
                  <FaTimesCircle className="inline text-red-500" />
                )}
              </div>
              <div className="text-sm font-medium text-green-700 uppercase tracking-wide">
                Email Status
              </div>
              
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md border border-blue-200 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <FaImage className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-800">
                {profileData.profilePic ? (
                  <FaCheckCircle className="inline text-green-600" />
                ) : (
                  <FaTimesCircle className="inline text-red-500" />
                )}
              </div>
              <div className="text-sm font-medium text-blue-700 uppercase tracking-wide">
                Profile Picture
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-md border border-purple-200 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <FaUserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-800">
                {hasCompletedProfile() ? (
                  <FaCheckCircle className="inline text-green-600" />
                ) : (
                  <span className="text-orange-500">
                    {Math.round((Object.values(profileData || {}).filter(Boolean).length / 5) * 100)}%
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-purple-700 uppercase tracking-wide">
                Profile Complete
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Info Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaUser className="mr-2 text-gray-600" />
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Account Created:</span>
              <span className="ml-2 text-gray-800">
                {profileData.createdAt ? moment(profileData.createdAt).format('MMMM D, YYYY [at] h:mm A') : 'Unknown'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Last Updated:</span>
              <span className="ml-2 text-gray-800">
                {profileData.updatedAt ? moment(profileData.updatedAt).fromNow() : 'Unknown'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">User ID:</span>
              <span className="ml-2 text-gray-800 font-mono text-xs">
                {profileData._id ? `${profileData._id.slice(0, 8)}...${profileData._id.slice(-8)}` : 'Unknown'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Account Type:</span>
              <span className="ml-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {profileData.role || 'Standard User'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;