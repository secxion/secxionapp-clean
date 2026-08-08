import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser,
  FaEnvelope,
  FaTelegram,
  FaTag,
  FaSave,
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaLock,
} from 'react-icons/fa';
import { PiUserSquare } from 'react-icons/pi';
import SummaryApi from '../common';
import { setUserDetails } from '../store/userSlice';
import uploadImage from '../helpers/uploadImage';
import SecxionShimmer from '../Components/SecxionShimmer';
import { notifyUser } from '../utils/toastConfig';
import BackButton from '../Components/BackButton';

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
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Load initial data
  useEffect(() => {
    const stateData = location.state;
    const initialData = {
      name: user?.name ?? stateData?.name ?? '',
      tag: user?.tag ?? stateData?.tag ?? '',
      telegramNumber: user?.telegramNumber ?? stateData?.telegramNumber ?? '',
      email: user?.email ?? stateData?.email ?? '',
      profilePic: user?.profilePic ?? stateData?.profilePic ?? '',
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
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notifyUser.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadImage(file);
      handleInputChange('profilePic', result.url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaveSuccessMessage('');
    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        tag: formData.tag.trim(),
        telegramNumber: formData.telegramNumber.trim(),
        profilePic: formData.profilePic ?? '',
      };

      // Add password data if changing password
      if (formData.newPassword) {
        updateData.password = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch(SummaryApi.profileEdit.url, {
        method: SummaryApi.profileEdit.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        const persistedProfile = {
          name: updateData.name,
          tag: updateData.tag,
          telegramNumber: updateData.telegramNumber,
          profilePic: updateData.profilePic,
        };

        dispatch(setUserDetails({ ...user, ...persistedProfile }));

        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));

        setOriginalData((prev) => ({ ...prev, ...persistedProfile }));
        setSaveSuccessMessage(
          data.message || 'Your profile changes were saved successfully.',
        );
        // Clear stale route state so freshly saved values stay in sync.
        navigate('/settings', { replace: true, state: null });
        notifyUser.success(
          data.message || 'Your profile changes were saved successfully.',
          'Profile Updated',
        );
      } else {
        setSaveSuccessMessage('');
        notifyUser.error(data.message || 'Unable to update profile');
      }
    } catch (error) {
      setSaveSuccessMessage('');
      notifyUser.error('Unable to update profile. Please try again.');
      console.error('Update error:', error);
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
      <div className="mx-auto mt-28 w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        <SecxionShimmer type="profile" count={1} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto mt-28 w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6"
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6 sm:mb-10 sm:pb-8">
        <div className="flex items-center space-x-6">
          <BackButton
            iconOnly
            onClick={handleCancel}
            ariaLabel="Back to profile"
            className="rounded-full p-3"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-spaceGrotesk uppercase tracking-tighter">
              Profile Settings
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
              Update your account details
            </p>
          </div>
        </div>
        {hasChanges && (
          <div className="hidden sm:flex items-center space-x-3 text-brand-gold bg-brand-gold/10 px-4 py-2 rounded-full border border-brand-gold/20 shadow-brand-gold">
            <div className="w-1.5 h-1.5 bg-brand-gold rounded-full shadow-[0_0_8px_#D4AF37]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] font-spaceGrotesk">
              Modified
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-8 flex space-x-2 rounded-2xl border border-white/5 bg-black/20 p-1.5 sm:mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-3 py-3.5 px-4 rounded-xl font-black font-spaceGrotesk uppercase text-[10px] tracking-[0.2em] transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-brand-gold text-brand-dark-base shadow-brand-gold'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {saveSuccessMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-center sm:text-left">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-300">
            {saveSuccessMessage}
          </p>
        </div>
      )}

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
              <div className="flex flex-col space-y-6 rounded-3xl border border-white/5 bg-white/5 p-6 sm:flex-row sm:items-center sm:space-x-8 sm:space-y-0">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                    <div className="w-full h-full rounded-2xl bg-brand-dark-elevated flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-brand-gold/10">
                      {formData.profilePic ? (
                        <img
                          src={formData.profilePic}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PiUserSquare size={56} className="text-brand-gold" />
                      )}
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 bg-brand-dark-base/80 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <div className="animate-spin w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full shadow-brand-gold"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-white font-spaceGrotesk">
                    Profile Photo
                  </h3>
                  <p className="mb-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    PNG, JPG, or GIF up to 5MB
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                    <label className="inline-flex items-center px-6 py-2.5 bg-brand-gold text-brand-dark-base rounded-xl hover:bg-brand-gold-light transition-all duration-300 cursor-pointer font-black font-spaceGrotesk text-[10px] uppercase tracking-widest shadow-brand-gold active:scale-95">
                      <FaUpload className="w-3.5 h-3.5 mr-2" />
                      {isUploading ? 'Uploading...' : 'Change Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="group">
                  <label className="block text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.2em] mb-3 group-focus-within:text-white transition-colors">
                    Full Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange('name', e.target.value)
                      }
                      className={`w-full pl-11 pr-4 py-4 bg-black/20 border rounded-2xl focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all duration-300 text-sm font-medium text-white placeholder-gray-600 ${
                        validationErrors.name
                          ? 'border-red-500/50'
                          : 'border-white/10'
                      }`}
                      placeholder="Node Designation"
                    />
                  </div>
                  {validationErrors.name && (
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2 px-1">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                {/* Email (readonly) */}
                <div className="group opacity-70">
                  <label className="block text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.2em] mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Tag */}
                <div className="group">
                  <label className="block text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.2em] mb-3 group-focus-within:text-white transition-colors">
                    System Identifier (Tag)
                  </label>
                  <div className="relative">
                    <FaTag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={(e) => handleInputChange('tag', e.target.value)}
                      className={`w-full pl-11 pr-4 py-4 bg-black/20 border rounded-2xl focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all duration-300 text-sm font-medium text-white placeholder-gray-600 ${
                        validationErrors.tag
                          ? 'border-red-500/50'
                          : 'border-white/10'
                      }`}
                      placeholder="@handle"
                    />
                  </div>
                  {validationErrors.tag && (
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2 px-1">
                      {validationErrors.tag}
                    </p>
                  )}
                </div>

                {/* Telegram */}
                <div className="group">
                  <label className="block text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.2em] mb-3 group-focus-within:text-white transition-colors">
                    Telegram Uplink
                  </label>
                  <div className="relative">
                    <FaTelegram className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                    <input
                      type="tel"
                      value={formData.telegramNumber}
                      onChange={(e) =>
                        handleInputChange('telegramNumber', e.target.value)
                      }
                      className={`w-full pl-11 pr-4 py-4 bg-black/20 border rounded-2xl focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all duration-300 text-sm font-medium text-white placeholder-gray-600 ${
                        validationErrors.telegramNumber
                          ? 'border-red-500/50'
                          : 'border-white/10'
                      }`}
                      placeholder="+XXXXXXXXXXX"
                    />
                  </div>
                  {validationErrors.telegramNumber && (
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2 px-1">
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
              className="space-y-8"
            >
              <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-6">
                <h3 className="text-xs font-black text-brand-gold mb-2 uppercase tracking-[0.2em] font-spaceGrotesk">
                  Update Password
                </h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  Leave fields blank to maintain current password.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 max-w-md">
                {/* Current Password */}
                <div className="group">
                  <label className="block text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.2em] mb-3 group-focus-within:text-white transition-colors">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) =>
                        handleInputChange('currentPassword', e.target.value)
                      }
                      className={`w-full pl-4 pr-12 py-4 bg-black/20 border rounded-2xl focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all duration-300 text-sm font-medium text-white placeholder-gray-600 ${
                        validationErrors.currentPassword
                          ? 'border-red-500/50'
                          : 'border-white/10'
                      }`}
                      placeholder="Verify Current Password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-brand-gold transition-colors"
                    >
                      {showPasswords.current ? (
                        <FaEyeSlash className="w-4 h-4" />
                      ) : (
                        <FaEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.currentPassword && (
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2 px-1">
                      {validationErrors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="group">
                  <label className="block text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.2em] mb-3 group-focus-within:text-white transition-colors">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) =>
                        handleInputChange('newPassword', e.target.value)
                      }
                      className={`w-full pl-4 pr-12 py-4 bg-black/20 border rounded-2xl focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all duration-300 text-sm font-medium text-white placeholder-gray-600 ${
                        validationErrors.newPassword
                          ? 'border-red-500/50'
                          : 'border-white/10'
                      }`}
                      placeholder="Enter New Password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-brand-gold transition-colors"
                    >
                      {showPasswords.new ? (
                        <FaEyeSlash className="w-4 h-4" />
                      ) : (
                        <FaEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.newPassword && (
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2 px-1">
                      {validationErrors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="group">
                  <label className="block text-[10px] font-black font-spaceGrotesk text-brand-gold uppercase tracking-[0.2em] mb-3 group-focus-within:text-white transition-colors">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange('confirmPassword', e.target.value)
                      }
                      className={`w-full pl-4 pr-12 py-4 bg-black/20 border rounded-2xl focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all duration-300 text-sm font-medium text-white placeholder-gray-600 ${
                        validationErrors.confirmPassword
                          ? 'border-red-500/50'
                          : 'border-white/10'
                      }`}
                      placeholder="Re-enter New Password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-brand-gold transition-colors"
                    >
                      {showPasswords.confirm ? (
                        <FaEyeSlash className="w-4 h-4" />
                      ) : (
                        <FaEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2 px-1">
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 pt-10 mt-12 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !hasChanges}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center px-10 py-4 rounded-2xl font-black font-spaceGrotesk text-xs uppercase tracking-widest transition-all duration-300 ${
              hasChanges && !isLoading
                ? 'bg-brand-gold text-brand-dark-base shadow-[0_10px_30px_rgba(212,175,55,0.2)]'
                : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
            }`}
          >
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-brand-dark-base border-t-transparent rounded-full"></div>
            ) : (
              <>
                <FaSave className="w-3.5 h-3.5 mr-2" />
                Save Changes
              </>
            )}
          </motion.button>

          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-10 py-4 rounded-2xl border border-white/10 bg-white/5 text-gray-400 font-black font-spaceGrotesk text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all duration-300 active:scale-95"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Settings;
