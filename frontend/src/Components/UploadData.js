import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  FaCloudUploadAlt,
  FaTrash,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaTag,
  FaImage,
  FaFileAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { MdSend, MdUpdate } from 'react-icons/md';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import SummaryApi from '../common';
import uploadImage from '../helpers/uploadImage';
import SecxionSpinner from './SecxionSpinner';
import BackButton from './BackButton';

const UploadData = ({ editingDataPad, closeUpload, refreshData }) => {
  const { user } = useSelector((state) => state.user);

  // Form data state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [tags, setTags] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [showSidebar, setShowSidebar] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showWritingTips, setShowWritingTips] = useState(false);
  const [originalData, setOriginalData] = useState(null); // Track original data

  // Load existing note data when editing
  useEffect(() => {
    if (editingDataPad) {
      const loadedTitle = editingDataPad.title || '';
      const loadedContent = editingDataPad.content || '';
      const loadedMedia = editingDataPad.media || [];
      const loadedTags = editingDataPad.tags || [];

      setTitle(loadedTitle);
      setContent(loadedContent);
      setMedia(loadedMedia);
      setTags(loadedTags);

      // Store original data for comparison
      setOriginalData({
        title: loadedTitle,
        content: loadedContent,
        media: loadedMedia,
        tags: loadedTags,
      });

      // Fix: Set up previewImages for existing media
      if (editingDataPad.media && editingDataPad.media.length > 0) {
        const existingImages = editingDataPad.media.map((url) => ({
          url: url,
          file: null,
          isUploading: false,
        }));
        setPreviewImages(existingImages);
      } else {
        setPreviewImages([]);
      }
    } else {
      setTitle('');
      setContent('');
      setMedia([]);
      setTags([]);
      setPreviewImages([]);
      setOriginalData({
        title: '',
        content: '',
        media: [],
        tags: [],
      });
    }
    setHasUnsavedChanges(false);
  }, [editingDataPad]);

  // Track unsaved changes - Simplified logic
  useEffect(() => {
    if (!originalData) return;

    const hasChanges =
      title !== originalData.title ||
      content !== originalData.content ||
      JSON.stringify(media) !== JSON.stringify(originalData.media) ||
      JSON.stringify(tags) !== JSON.stringify(originalData.tags);

    setHasUnsavedChanges(hasChanges);
  }, [title, content, media, tags, originalData]);

  // Update word count when content changes
  useEffect(() => {
    const words = content.split(/\s+/).filter((word) => word.length > 0).length;
    setWordCount(words);
  }, [content]);

  // Upload images to the server and sync the preview state when complete.
  const uploadImages = useCallback(async (files) => {
    try {
      const uploadPromises = files.map(async (file) => {
        try {
          const uploadResponse = await uploadImage(file);
          return uploadResponse.url;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          throw error;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setMedia((prev) => [...prev, ...uploadedUrls]);
      setPreviewImages((prev) =>
        prev.map((img) =>
          img.isUploading ? { ...img, isUploading: false } : img,
        ),
      );

      toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`, {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Some images failed to upload. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });

      setPreviewImages((prev) => prev.filter((img) => !img.isUploading));
    }
  }, []);

  // Handle image selection with validation
  const handleImageSelection = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      const validFiles = files.filter((file) => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 10 * 1024 * 1024;

        if (!isValidType) {
          toast.error(`${file.name} is not a valid image file`, {
            position: 'top-right',
            autoClose: 3000,
          });
          return false;
        }

        if (!isValidSize) {
          toast.error(`${file.name} is too large. Maximum size is 10MB`, {
            position: 'top-right',
            autoClose: 3000,
          });
          return false;
        }

        return true;
      });

      if (validFiles.length === 0) return;

      if (previewImages.length + validFiles.length > 10) {
        toast.error('Maximum 10 images allowed per note', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      const previews = validFiles.map((file) => ({
        url: URL.createObjectURL(file),
        file: file,
        isUploading: true,
      }));

      setPreviewImages((prev) => [...prev, ...previews]);
      uploadImages(validFiles);
    },
    [previewImages.length, uploadImages],
  );

  // Remove an image from preview & media array
  const removeImage = useCallback(
    (index) => {
      const imageToRemove = previewImages[index];

      // Only revoke blob URLs (not server URLs)
      if (imageToRemove?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      const updatedPreviews = previewImages.filter((_, i) => i !== index);
      const updatedMedia = media.filter((_, i) => i !== index);

      if (selectedImageIndex !== null) {
        if (updatedPreviews.length === 0) {
          setSelectedImageIndex(null);
        } else if (index < selectedImageIndex) {
          setSelectedImageIndex(selectedImageIndex - 1);
        } else if (index === selectedImageIndex) {
          setSelectedImageIndex(
            Math.min(selectedImageIndex, updatedPreviews.length - 1),
          );
        }
      }

      setPreviewImages(updatedPreviews);
      setMedia(updatedMedia);

      toast.info('Image removed', {
        position: 'top-right',
        autoClose: 2000,
      });
    },
    [previewImages, media, selectedImageIndex],
  );

  const openImageReview = useCallback((index) => {
    setSelectedImageIndex(index);
  }, []);

  const closeImageReview = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const showPreviousImage = useCallback(() => {
    if (!previewImages.length || selectedImageIndex === null) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? previewImages.length - 1 : prev - 1,
    );
  }, [previewImages.length, selectedImageIndex]);

  const showNextImage = useCallback(() => {
    if (!previewImages.length || selectedImageIndex === null) return;
    setSelectedImageIndex((prev) =>
      prev === previewImages.length - 1 ? 0 : prev + 1,
    );
  }, [previewImages.length, selectedImageIndex]);

  // Handle form submission with enhanced validation
  const handleSubmitDataPad = useCallback(async () => {
    if (!user) {
      toast.error('User not found. Please log in again.', {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle && !trimmedContent && media.length === 0) {
      toast.error(
        'Please enter a title, content, or upload at least one image.',
        {
          position: 'top-right',
          autoClose: 5000,
        },
      );
      return;
    }

    if (trimmedTitle.length > 200) {
      toast.error('Title must be less than 200 characters.', {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }

    if (trimmedContent.length > 10000) {
      toast.error('Content must be less than 10,000 characters.', {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      // Fix: Use the media array directly (it contains the URLs)
      const noteData = {
        userId: user.id || user._id,
        title: trimmedTitle,
        content: trimmedContent,
        media: media.filter((url) => url && url.trim()), // This should contain the URLs
        tags: tags.filter((tag) => tag && tag.trim()), // Separate tags array
      };

      const url = editingDataPad
        ? `${SummaryApi.updateData.url}/${editingDataPad._id}`
        : SummaryApi.createData.url;
      const method = editingDataPad
        ? SummaryApi.updateData.method
        : SummaryApi.createData.method;

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.success) {
        const successMessage = editingDataPad
          ? 'Data updated successfully!'
          : 'Data created successfully!';

        toast.success(successMessage, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        previewImages.forEach((img) => {
          if (img.url?.startsWith('blob:')) {
            URL.revokeObjectURL(img.url);
          }
        });

        setHasUnsavedChanges(false);

        if (refreshData) {
          refreshData();
        }
        closeUpload();
      } else {
        throw new Error(responseData.message || 'Failed to save data');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error(error.message || 'Error submitting data. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  }, [
    user,
    title,
    content,
    media,
    tags,
    editingDataPad,
    previewImages,
    refreshData,
    closeUpload,
  ]);

  // Handle close with unsaved changes warning - Simplified logic
  const handleClose = useCallback(() => {
    // Simple check against original data
    const currentHasChanges =
      originalData &&
      (title !== originalData.title ||
        content !== originalData.content ||
        JSON.stringify(media) !== JSON.stringify(originalData.media) ||
        JSON.stringify(tags) !== JSON.stringify(originalData.tags));

    if (currentHasChanges) {
      if (
        window.confirm(
          'You have unsaved changes. Are you sure you want to close?',
        )
      ) {
        previewImages.forEach((img) => {
          if (img.url?.startsWith('blob:')) {
            URL.revokeObjectURL(img.url);
          }
        });
        closeUpload();
      }
    } else {
      closeUpload();
    }
  }, [title, content, media, tags, originalData, previewImages, closeUpload]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          if (!isSubmitting) {
            handleSubmitDataPad();
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmitDataPad, handleClose, isSubmitting]);

  useEffect(() => {
    const handleImageReviewKeys = (e) => {
      if (selectedImageIndex === null) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPreviousImage();
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        showNextImage();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeImageReview();
      }
    };

    document.addEventListener('keydown', handleImageReviewKeys);
    return () => document.removeEventListener('keydown', handleImageReviewKeys);
  }, [selectedImageIndex, showPreviousImage, showNextImage, closeImageReview]);

  const selectedImage =
    selectedImageIndex !== null && previewImages[selectedImageIndex]
      ? previewImages[selectedImageIndex].url ||
        previewImages[selectedImageIndex]
      : null;

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Mobile-optimized tabs with better touch targets
  const tabs = [
    {
      id: 'content',
      label: 'Write',
      icon: <FaFileAlt className="w-4 h-4" />,
      color: 'blue',
    },
    {
      id: 'images',
      label: 'Photos',
      icon: <FaImage className="w-4 h-4" />,
      color: 'green',
    },
    {
      id: 'tags',
      label: 'Tags',
      icon: <FaTag className="w-4 h-4" />,
      color: 'purple',
    },
  ];

  const writingTips = [
    '💡 Start with a clear title',
    '📝 Use bullet points for lists',
    '🔍 Add relevant tags for easy searching',
    '📸 Include images to make notes visual',
    '💭 Write as if explaining to a friend',
  ];

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-none bg-brand-dark-base text-white"
    >
      {/* Header - Fixed dark theme */}
      <div className="sticky top-0 z-20 mt-10 border-b border-white/8 bg-brand-dark-elevated/95 shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <BackButton
              onClick={handleClose}
              label="MyData"
              ariaLabel="Go back to your DataPad"
              className="rounded-2xl border-brand-gold/20 bg-brand-gold px-3.5 py-2 text-brand-dark-base hover:bg-brand-gold-light hover:text-brand-dark-base"
            />

            <button
              onClick={toggleSidebar}
              className="inline-flex h-10 w-10 min-w-10 max-w-10 shrink-0 basis-10 items-center justify-center rounded-xl border border-white/8 bg-white/5 p-0 text-gray-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
              title="Toggle menu"
            >
              {showSidebar ? (
                <FaTimes className="h-4 w-4 shrink-0" />
              ) : (
                <FaBars className="h-4 w-4 shrink-0" />
              )}
            </button>
          </div>

          <div className="flex-1 text-center md:ml-4 md:border-l md:border-white/10 md:pl-4 md:text-left">
            <h1 className="text-lg font-semibold text-white md:text-xl">
              {editingDataPad ? 'Edit Note' : 'New Note'}
            </h1>
            {hasUnsavedChanges && (
              <p className="mt-1 text-sm text-brand-gold">Unsaved changes</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSubmitDataPad}
              disabled={loading || isSubmitting}
              className="inline-flex min-w-[80px] items-center justify-center gap-2 rounded-2xl border border-brand-gold/20 bg-brand-gold px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.24em] text-brand-dark-base shadow-brand-gold transition-all duration-200 hover:bg-brand-gold-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <SecxionSpinner size="small" message="" />
              ) : (
                <>
                  {editingDataPad ? (
                    <MdUpdate className="w-4 h-4" />
                  ) : (
                    <MdSend className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {editingDataPad ? 'Update' : 'Save'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="border-t border-white/8 bg-white/5 md:hidden">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 px-2 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-brand-gold bg-brand-gold/10 text-brand-gold'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area - Fixed dark theme */}
      <div className="flex flex-1 overflow-hidden bg-brand-dark-base">
        {/* Desktop Sidebar */}
        <div className="hidden w-64 flex-col border-r border-white/8 bg-brand-dark-elevated md:flex">
          <div className="border-b border-white/8 p-4">
            <h2 className="mb-3 font-medium text-gray-200">Note Sections</h2>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border border-brand-gold/20 bg-brand-gold/10 text-brand-gold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Desktop Stats */}
          <div className="space-y-3 p-4 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Characters:</span>
              <span className="font-medium text-gray-200">
                {(title + content).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Words:</span>
              <span className="font-medium text-gray-200">{wordCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Images:</span>
              <span className="font-medium text-gray-200">
                {previewImages.length}
              </span>
            </div>
          </div>

          {/* Writing Tips */}
          <div className="border-t border-white/8 p-4">
            <button
              onClick={() => setShowWritingTips(!showWritingTips)}
              className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300"
            >
              💡 Writing Tips
              <span
                className={`transform transition-transform ${showWritingTips ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </button>
            <AnimatePresence>
              {showWritingTips && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1 overflow-hidden text-xs text-gray-400"
                >
                  {writingTips.map((tip, index) => (
                    <div key={index} className="py-1">
                      {tip}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {showSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10 bg-black/50 md:hidden"
                onClick={() => setShowSidebar(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="fixed bottom-0 left-0 top-0 z-20 w-70 bg-brand-dark-elevated py-10 shadow-xl md:hidden"
              >
                <div className="flex items-center justify-between border-b border-white/8 p-4">
                  <h2 className="font-medium text-gray-200">Note Info</h2>
                  <motion.button
                    onClick={() => setShowSidebar(false)}
                    className="rounded-full border-2 border-white/20 bg-red-600/90 p-2 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close note info"
                  >
                    <FaTimes className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Mobile Stats */}
                <div className="space-y-3 p-4 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span className="font-medium text-gray-200">
                      {(title + content).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-medium text-gray-200">
                      {wordCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images:</span>
                    <span className="font-medium text-gray-200">
                      {previewImages.length}
                    </span>
                  </div>
                </div>

                {/* Mobile Writing Tips */}
                <div className="border-t border-white/8 p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    💡 Writing Tips
                  </h3>
                  <div className="space-y-1 text-xs text-gray-400">
                    {writingTips.map((tip, index) => (
                      <div key={index} className="py-1">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden bg-brand-dark-base">
          {/* Title Section */}
          <div className="border-b border-white/8 bg-brand-dark-elevated px-4 py-4 md:px-6">
            <input
              type="text"
              className="w-full border-none bg-transparent text-xl font-semibold text-white outline-none placeholder-gray-500 md:text-2xl"
              placeholder="Untitled note..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
              <span>{title.length}/200 characters</span>
              <span className="md:hidden">{wordCount} words</span>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden bg-brand-dark-base">
            <AnimatePresence mode="wait">
              {activeTab === 'content' && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <div className="h-full flex flex-col">
                    <div className="flex-1 p-4 md:p-6">
                      <div className="h-full">
                        <textarea
                          className="w-full h-full resize-none border-none outline-none text-gray-300 placeholder-gray-500 text-base leading-relaxed bg-transparent"
                          placeholder="Start writing your note..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          maxLength={10000}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/8 bg-white/5 px-4 py-3 text-xs text-gray-500 md:px-6">
                      <span>{content.length}/10,000 characters</span>
                      <span className="hidden md:inline">
                        {wordCount} words
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'images' && (
                <motion.div
                  key="images"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full p-4 md:p-6 overflow-y-auto"
                >
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Upload Images ({previewImages.length}/10)
                    </label>

                    {/* Mobile-optimized upload area */}
                    <label className="group relative block w-full cursor-pointer rounded-[28px] border-2 border-dashed border-white/10 bg-white/5 p-6 text-center transition-all duration-200 hover:border-brand-gold/40 hover:bg-white/10 md:p-8 touch-manipulation">
                      <FaCloudUploadAlt className="mx-auto h-10 w-10 text-gray-500 transition-colors duration-200 group-hover:text-brand-gold md:h-12 md:w-12" />
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-300 group-hover:text-brand-gold">
                          Tap to upload photos
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelection}
                        disabled={previewImages.length >= 10}
                      />
                    </label>
                  </div>

                  {previewImages.length > 0 && (
                    <div>
                      <h3 className="mb-1 text-sm font-medium text-gray-300">
                        Uploaded Images
                      </h3>
                      <p className="mb-3 text-xs text-gray-500">
                        Tap image or use the preview button to review in full
                        size.
                      </p>
                      {/* Mobile-optimized grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-4">
                        <AnimatePresence>
                          {previewImages.map((imageData, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="relative group"
                            >
                              <div className="aspect-square overflow-hidden rounded-2xl border border-white/8 bg-white/5 touch-manipulation">
                                <img
                                  src={imageData.url || imageData}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                                  onClick={() => openImageReview(index)}
                                />
                              </div>

                              {imageData.isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                                  <SecxionSpinner size="small" message="" />
                                </div>
                              )}

                              <button
                                className="absolute right-2 top-2 rounded-full border border-red-400/20 bg-red-500 p-2 text-white opacity-100 shadow-lg transition-opacity duration-200 hover:bg-red-600 md:opacity-0 group-hover:opacity-100 touch-manipulation"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                disabled={imageData.isUploading}
                                aria-label={`Remove image ${index + 1}`}
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>

                              <button
                                className="absolute bottom-2 right-2 rounded-full border border-brand-gold/20 bg-brand-gold p-2 text-brand-dark-base opacity-100 shadow-lg transition-opacity duration-200 hover:bg-brand-gold-light md:opacity-0 group-hover:opacity-100 touch-manipulation"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openImageReview(index);
                                }}
                                disabled={imageData.isUploading}
                                aria-label={`Preview image ${index + 1}`}
                              >
                                <FaEye className="w-3 h-3" />
                              </button>

                              <div className="absolute bottom-2 left-2 rounded-full bg-black/75 px-2 py-1 text-xs text-white">
                                {index + 1}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'tags' && (
                <motion.div
                  key="tags"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full p-4 md:p-6 overflow-y-auto"
                >
                  <div className="mb-6">
                    <label className="mb-3 block text-sm font-medium text-gray-300">
                      Add Tags
                    </label>
                    {/* Mobile-optimized tag input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === 'Enter'
                            ? (e.preventDefault(), addTag())
                            : null
                        }
                        className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-gray-200 outline-none transition-colors duration-200 placeholder-gray-500 focus:border-brand-gold/40 focus:ring-2 focus:ring-brand-gold/10 md:py-2 touch-manipulation"
                        placeholder="Enter a tag..."
                      />
                      <button
                        onClick={addTag}
                        className="inline-flex items-center gap-2 rounded-2xl border border-brand-gold/20 bg-brand-gold px-4 py-3 text-[9px] font-black uppercase tracking-[0.22em] text-brand-dark-base transition-colors duration-200 hover:bg-brand-gold-light md:py-2 touch-manipulation"
                      >
                        <FaTag className="w-4 h-4" />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </div>
                  </div>

                  {tags.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-medium text-gray-300">
                        Current Tags
                      </h3>
                      {/* Mobile-optimized tag display */}
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-2 text-sm text-brand-gold touch-manipulation"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="p-1 text-brand-gold/80 transition-colors duration-200 hover:text-white touch-manipulation"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile-optimized Full Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 touch-manipulation"
            onClick={closeImageReview}
          >
            <motion.button
              className="absolute right-6 top-14 z-10 rounded-full border-2 border-white/20 bg-red-600/90 p-2 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 touch-manipulation"
              onClick={closeImageReview}
              aria-label="Close image review"
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes className="w-5 h-5" />
            </motion.button>

            {previewImages.length > 1 && (
              <>
                <button
                  className="absolute left-4 z-10 rounded-full bg-white/20 p-3 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/30 touch-manipulation md:left-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPreviousImage();
                  }}
                  aria-label="Previous image"
                >
                  <FaChevronLeft className="w-6 h-6" />
                </button>

                <button
                  className="absolute right-4 z-10 rounded-full bg-white/20 p-3 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/30 touch-manipulation md:right-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNextImage();
                  }}
                  aria-label="Next image"
                >
                  <FaChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {selectedImageIndex !== null && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-full border border-white/20 backdrop-blur-md">
                {selectedImageIndex + 1} / {previewImages.length}
              </div>
            )}

            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={selectedImage}
              alt={`Photo ${selectedImageIndex !== null ? selectedImageIndex + 1 : 1}`}
              className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UploadData;
