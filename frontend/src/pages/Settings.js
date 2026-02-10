import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaUser,
  FaEnvelope,
  FaTelegram,
  FaTag,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaUpload,
  FaTrash,
  FaEdit,
  FaLock,
} from 'react-icons/fa';
import { PiUserSquare } from 'react-icons/pi';
import SummaryApi from '../common';
import { setUserDetails } from '../store/userSlice';
import uploadImage from '../helpers/uploadImage';
import SecxionShimmer from '../Components/SecxionShimmer';

const Settings = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    telegramNumber: '',
    email: '',
    profilePic: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Load initial data
  useEffect(() => {
    const stateData = location.state;
    const initialData = {
      name: stateData?.name || user?.name || '',
      tag: stateData?.tag || user?.tag || '',
      telegramNumber: stateData?.telegramNumber || user?.telegramNumber || '',
      email: stateData?.email || user?.email || '',
      profilePic: stateData?.profilePic || user?.profilePic || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    setFormData(initialData);
    setOriginalData(initialData);
  }, [location.state, user]);

  // Track changes
  useEffect(() => {
    const profileChanged =
      formData.name !== originalData.name ||
      formData.tag !== originalData.tag ||
      formData.telegramNumber !== originalData.telegramNumber ||
      formData.profilePic !== originalData.profilePic;

    const passwordChanged =
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword;

    setHasChanges(profileChanged || passwordChanged);
  }, [formData, originalData]);

  // Validation
  const validateForm = useCallback(() => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Tag validation
    if (formData.tag && !/^[a-zA-Z0-9_]+$/.test(formData.tag)) {
      errors.tag = 'Tag can only contain letters, numbers, and underscores';
    }

    // Telegram validation
    if (
      formData.telegramNumber &&
      !/^\+?[1-9]\d{1,14}$/.test(formData.telegramNumber)
    ) {
      errors.telegramNumber = 'Invalid telegram number format';
    }

    // Password validation
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword =
          'Current password is required to change password';
      }
      if (formData.newPassword.length < 6) {
        errors.newPassword = 'New password must be at least 6 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadImage(file);
      handleInputChange('profilePic', result.url);
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        tag: formData.tag.trim() || undefined,
        telegramNumber: formData.telegramNumber.trim() || undefined,
        profilePic: formData.profilePic || undefined,
      };

      // Add password data if changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch(SummaryApi.updateUser.url, {
        method: SummaryApi.updateUser.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        // Update Redux store
        dispatch(setUserDetails({ ...user, ...updateData }));

        // Reset password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));

        // Update original data
        setOriginalData((prev) => ({ ...prev, ...updateData }));

        toast.success(data.message || 'Profile updated successfully');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          'You have unsaved changes. Are you sure you want to leave?',
        )
      ) {
        navigate('/profile');
      }
    } else {
      navigate('/profile');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: FaUser },
    { id: 'security', label: 'Security', icon: FaLock },
  ];

  if (isLoading && !formData.name) {
    return (
      <div className="mt-20 p-4 sm:p-6 max-w-4xl mx-auto">
        <SecxionShimmer type="profile" count={1} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-20 p-4 sm:p-6 max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl border border-gray-700 rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-600">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Edit Profile
            </h1>
            <p className="text-gray-400 mt-1">
              Update your account information and settings
            </p>
          </div>
        </div>
        {hasChanges && (
          <div className="flex items-center space-x-2 text-yellow-400">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Unsaved changes</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-yellow-500 text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Profile Picture Section */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-yellow-500/30">
                      {formData.profilePic ? (
                        <img
                          src={formData.profilePic}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <PiUserSquare size={48} className="text-gray-900" />
                      )}
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Profile Picture
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Upload a new profile picture. JPG, PNG or GIF (max 5MB)
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex items-center px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors duration-200 cursor-pointer font-medium">
                      <FaUpload className="w-4 h-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    {formData.profilePic && (
                      <button
                        type="button"
                        onClick={() => handleInputChange('profilePic', '')}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        <FaTrash className="w-4 h-4 mr-2" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange('name', e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200 text-white placeholder-gray-400 ${
                        validationErrors.name
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {validationErrors.name && (
                    <p className="text-red-400 text-sm mt-1">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                {/* Email (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                      placeholder="Email cannot be changed"
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Contact support to change your email
                  </p>
                </div>

                {/* Tag */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username/Tag
                  </label>
                  <div className="relative">
                    <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={(e) => handleInputChange('tag', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200 text-white placeholder-gray-400 ${
                        validationErrors.tag
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                      placeholder="@username"
                    />
                  </div>
                  {validationErrors.tag && (
                    <p className="text-red-400 text-sm mt-1">
                      {validationErrors.tag}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Letters, numbers, and underscores only
                  </p>
                </div>

                {/* Telegram */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telegram Number
                  </label>
                  <div className="relative">
                    <FaTelegram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={formData.telegramNumber}
                      onChange={(e) =>
                        handleInputChange('telegramNumber', e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200 text-white placeholder-gray-400 ${
                        validationErrors.telegramNumber
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                      placeholder="+1234567890"
                    />
                  </div>
                  {validationErrors.telegramNumber && (
                    <p className="text-red-400 text-sm mt-1">
                      {validationErrors.telegramNumber}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <h3 className="text-yellow-400 font-medium mb-2">
                  Change Password
                </h3>
                <p className="text-yellow-300/80 text-sm">
                  Leave password fields empty if you don't want to change your
                  password.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 max-w-md">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) =>
                        handleInputChange('currentPassword', e.target.value)
                      }
                      className={`w-full pl-4 pr-12 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200 text-white placeholder-gray-400 ${
                        validationErrors.currentPassword
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPasswords.current ? (
                        <FaEyeSlash className="w-4 h-4" />
                      ) : (
                        <FaEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.currentPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {validationErrors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) =>
                        handleInputChange('newPassword', e.target.value)
                      }
                      className={`w-full pl-4 pr-12 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200 text-white placeholder-gray-400 ${
                        validationErrors.newPassword
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPasswords.new ? (
                        <FaEyeSlash className="w-4 h-4" />
                      ) : (
                        <FaEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.newPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {validationErrors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange('confirmPassword', e.target.value)
                      }
                      className={`w-full pl-4 pr-12 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200 text-white placeholder-gray-400 ${
                        validationErrors.confirmPassword
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPasswords.confirm ? (
                        <FaEyeSlash className="w-4 h-4" />
                      ) : (
                        <FaEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-gray-600">
          <motion.button
            type="submit"
            disabled={isLoading || !hasChanges}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold transition-colors duration-200 ${
              hasChanges && !isLoading
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 shadow-lg hover:shadow-xl'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </motion.button>

          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-3 border-2 border-gray-600 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 hover:border-gray-500 transition-colors duration-200"
          >
            <FaTimes className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Settings;
