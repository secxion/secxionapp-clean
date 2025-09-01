import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { FaCloudUploadAlt, FaTrash, FaArrowLeft, FaTag, FaImage, FaFileAlt, FaPalette, FaBars, FaTimes, FaEdit } from "react-icons/fa";
import { MdSend, MdClose, MdUpdate, MdEdit, MdSave, MdCancel, MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import SummaryApi from "../common";
import uploadImage from "../helpers/uploadImage";
import SecxionSpinner from "./SecxionSpinner";

const UploadData = ({ editingDataPad, closeUpload, refreshData }) => {
  const { user } = useSelector((state) => state.user);

  // Form data state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [showSidebar, setShowSidebar] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showWritingTips, setShowWritingTips] = useState(false);
  const [savedNotes, setSavedNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [originalData, setOriginalData] = useState(null); // Track original data

  // Fetch saved notes
  const fetchSavedNotes = useCallback(async () => {
    if (!user) return;
    
    setLoadingNotes(true);
    try {
      const response = await fetch(SummaryApi.allData.url, {
        method: SummaryApi.allData.method,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const userNotes = data.data.filter(
            (item) => item.userId === user?.id || item.userId === user?._id
          );
          setSavedNotes(userNotes.slice(0, 10)); // Show only first 10 notes
        }
      }
    } catch (error) {
      console.error("Error fetching saved notes:", error);
    } finally {
      setLoadingNotes(false);
    }
  }, [user]);

  // Load existing note data when editing
  useEffect(() => {
    if (editingDataPad) {
      const loadedTitle = editingDataPad.title || "";
      const loadedContent = editingDataPad.content || "";
      const loadedMedia = editingDataPad.media || [];
      
      setTitle(loadedTitle);
      setContent(loadedContent);
      setMedia(loadedMedia);
      
      // Store original data for comparison
      setOriginalData({
        title: loadedTitle,
        content: loadedContent,
        media: loadedMedia
      });
      
      // Fix: Set up previewImages for existing media
      if (editingDataPad.media && editingDataPad.media.length > 0) {
        const existingImages = editingDataPad.media.map(url => ({
          url: url,
          file: null,
          isUploading: false
        }));
        setPreviewImages(existingImages);
      } else {
        setPreviewImages([]);
      }
    } else {
      setTitle("");
      setContent("");
      setMedia([]);
      setPreviewImages([]);
      setOriginalData({
        title: "",
        content: "",
        media: []
      });
    }
    setHasUnsavedChanges(false);
  }, [editingDataPad]);

  // Fetch saved notes on component mount
  useEffect(() => {
    fetchSavedNotes();
  }, [fetchSavedNotes]);

  // Track unsaved changes - Simplified logic
  useEffect(() => {
    if (!originalData) return;

    const hasChanges = 
      title !== originalData.title ||
      content !== originalData.content ||
      JSON.stringify(media) !== JSON.stringify(originalData.media);

    setHasUnsavedChanges(hasChanges);
  }, [title, content, media, originalData]);

  // Update word count when content changes
  useEffect(() => {
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
  }, [content]);

  // Handle image selection with validation
  const handleImageSelection = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024;

      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`, {
          position: "top-right",
          autoClose: 3000,
        });
        return false;
      }

      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`, {
          position: "top-right",
          autoClose: 3000,
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    if (previewImages.length + validFiles.length > 10) {
      toast.error("Maximum 10 images allowed per note", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const previews = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
      isUploading: true
    }));

    setPreviewImages(prev => [...prev, ...previews]);
    uploadImages(validFiles);
  }, [previewImages.length]);

  // Upload images to the server with progress tracking
  const uploadImages = useCallback(async (files) => {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileId = `${Date.now()}-${index}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        try {
          const uploadResponse = await uploadImage(file);
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          return uploadResponse.url;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadProgress(prev => ({ ...prev, [fileId]: -1 }));
          throw error;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setMedia(prev => [...prev, ...uploadedUrls]);
      setPreviewImages(prev =>
        prev.map(img =>
          img.isUploading ? { ...img, isUploading: false } : img
        )
      );

      toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Some images failed to upload. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });

      setPreviewImages(prev => prev.filter(img => !img.isUploading));
    } finally {
      setUploadProgress({});
    }
  }, []);

  // Remove an image from preview & media array
  const removeImage = useCallback((index) => {
    const imageToRemove = previewImages[index];

    // Only revoke blob URLs (not server URLs)
    if (imageToRemove?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    const updatedPreviews = previewImages.filter((_, i) => i !== index);
    const updatedMedia = media.filter((_, i) => i !== index);

    setPreviewImages(updatedPreviews);
    setMedia(updatedMedia);

    toast.info("Image removed", {
      position: "top-right",
      autoClose: 2000,
    });
  }, [previewImages, media]);

  

  // Handle form submission with enhanced validation
  const handleSubmitDataPad = useCallback(async () => {
    if (!user) {
      toast.error("User not found. Please log in again.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle && !trimmedContent && media.length === 0) {
      toast.error("Please enter a title, content, or upload at least one image.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if (trimmedTitle.length > 200) {
      toast.error("Title must be less than 200 characters.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if (trimmedContent.length > 10000) {
      toast.error("Content must be less than 10,000 characters.", {
        position: "top-right",
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
        media: media.filter(url => url && url.trim()) // This should contain the URLs
      };

      const url = editingDataPad
        ? `${SummaryApi.updateData.url}/${editingDataPad._id}`
        : SummaryApi.createData.url;
      const method = editingDataPad
        ? SummaryApi.updateData.method
        : SummaryApi.createData.method;

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.success) {
        const successMessage = editingDataPad
          ? "Data updated successfully!"
          : "Data created successfully!";

        toast.success(successMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        previewImages.forEach(img => {
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
        throw new Error(responseData.message || "Failed to save data");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error(error.message || "Error submitting data. Please try again.", {
        position: "top-right",
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
  }, [user, title, content, media, editingDataPad, previewImages, refreshData, closeUpload]);

  // Handle close with unsaved changes warning - Simplified logic
  const handleClose = useCallback(() => {
    // Simple check against original data
    const currentHasChanges = originalData && (
      title !== originalData.title ||
      content !== originalData.content ||
      JSON.stringify(media) !== JSON.stringify(originalData.media)
    );

    if (currentHasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        previewImages.forEach(img => {
          if (img.url?.startsWith('blob:')) {
            URL.revokeObjectURL(img.url);
          }
        });
        closeUpload();
      }
    } else {
      closeUpload();
    }
  }, [title, content, media, originalData, previewImages, closeUpload]);

  // Handle content editing
  const handleContentEditToggle = useCallback(() => {
    setIsEditingContent(!isEditingContent);
  }, [isEditingContent]);

  const handleContentSave = useCallback(() => {
    setIsEditingContent(false);
    toast.info("Content saved", {
      position: "top-right",
      autoClose: 2000,
    });
  }, []);

  // Handle opening a saved note - Simplified logic
  const handleOpenSavedNote = useCallback((note) => {
    if (!note || !user?._id) {
      console.error('Note or user ID missing');
      return;
    }

    try {
      // Simple check - only show confirmation if actual changes exist
      const currentHasChanges = originalData && (
        title !== originalData.title ||
        content !== originalData.content ||
        JSON.stringify(media) !== JSON.stringify(originalData.media)
      );

      if (currentHasChanges) {
        const confirmLoad = window.confirm(
          'You have unsaved changes. Loading this note will discard them. Continue?'
        );
        if (!confirmLoad) {
          return;
        }
      }

      // Load the note data
      const newTitle = note.title || '';
      const newContent = note.content || '';
      const newMedia = note.media || [];

      setTitle(newTitle);
      setContent(newContent);
      setMedia(newMedia);
      
      // Update original data reference
      setOriginalData({
        title: newTitle,
        content: newContent,
        media: newMedia
      });
      
      // Handle media if present
      if (note.media && note.media.length > 0) {
        setPreviewImages(note.media.map(mediaItem => ({
          url: mediaItem.url || mediaItem,
          file: null,
          isUploading: false
        })));
      } else {
        setPreviewImages([]);
      }

      // Reset states
      setHasUnsavedChanges(false);
      setActiveTab('content');
      
    } catch (error) {
      console.error('Error loading saved note:', error);
      toast.error('Failed to load note');
    }
  }, [title, content, media, originalData, user?._id]);

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

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !media.includes(tag)) {
      setMedia(prev => [...prev, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setMedia(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Mobile-optimized tabs with better touch targets
  const tabs = [
    { id: 'content', label: 'Write', icon: <FaFileAlt className="w-4 h-4" />, color: 'blue' },
    { id: 'images', label: 'Photos', icon: <FaImage className="w-4 h-4" />, color: 'green' },
    { id: 'tags', label: 'Tags', icon: <FaTag className="w-4 h-4" />, color: 'purple' },
  ];

  const writingTips = [
    "💡 Start with a clear title",
    "📝 Use bullet points for lists", 
    "🔍 Add relevant tags for easy searching",
    "📸 Include images to make notes visual",
    "💭 Write as if explaining to a friend"
  ];

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-gray-900 text-white"
    >
      {/* Header - Fixed dark theme */}
      <div className="bg-gray-800 shadow-sm border-b mt-10 border-gray-700 sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClose}
              className="group bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2"
              title="Go back to your DataPad"
            >
              <FaArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-semibold">MyData</span>
            </button>
            
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title="Toggle menu"
            >
              {showSidebar ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left md:ml-4 md:border-l md:border-gray-600 md:pl-4">
            <h1 className="text-lg md:text-xl font-semibold text-white">
              {editingDataPad ? "Edit Note" : "New Note"}
            </h1>
            {hasUnsavedChanges && (
              <p className="text-sm text-orange-400 mt-1">
                Unsaved changes
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSubmitDataPad}
              disabled={loading || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center space-x-2 min-w-[80px] justify-center"
            >
              {loading ? (
                <SecxionSpinner size="small" message="" />
              ) : (
                <>
                  {editingDataPad ? <MdUpdate className="w-4 h-4" /> : <MdSend className="w-4 h-4" />}
                  <span className="hidden sm:inline">{editingDataPad ? "Update" : "Save"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Saved Notes Strip */}
        <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
              <span>Quick Access:</span>
              <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">
                Recent Notes
              </span>
            </span>
            {loadingNotes && (
              <div className="text-xs text-gray-500">Loading notes...</div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 pb-2">
            {savedNotes.map((note) => (
              <motion.button
                key={note._id}
                onClick={() => handleOpenSavedNote(note)}
                className="flex-shrink-0 bg-gray-700 hover:bg-blue-900/50 border border-gray-600 hover:border-blue-500 rounded-full px-3 py-1 text-xs font-medium text-gray-300 hover:text-blue-300 transition-all duration-200 flex items-center gap-1 max-w-[150px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaEdit className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {note.title || "Untitled"}
                </span>
              </motion.button>
            ))}
            {savedNotes.length === 0 && !loadingNotes && (
              <div className="text-xs text-gray-500 italic">No saved notes yet</div>
            )}
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden border-t border-gray-700 bg-gray-800/50">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700'
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
      <div className="flex-1 flex overflow-hidden bg-gray-900">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-64 bg-gray-800 border-r border-gray-700 flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-medium text-slate-800 mb-3">Note Sections</h2>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Desktop Stats */}
          <div className="p-4 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Characters:</span>
              <span className="font-medium">{(title + content).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Words:</span>
              <span className="font-medium">{wordCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Images:</span>
              <span className="font-medium">{previewImages.length}</span>
            </div>
          </div>

          {/* Writing Tips */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={() => setShowWritingTips(!showWritingTips)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2"
            >
              💡 Writing Tips
              <span className={`transform transition-transform ${showWritingTips ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            <AnimatePresence>
              {showWritingTips && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1 text-xs text-slate-600 overflow-hidden"
                >
                  {writingTips.map((tip, index) => (
                    <div key={index} className="py-1">{tip}</div>
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
                className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
                onClick={() => setShowSidebar(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="md:hidden fixed left-0 top-0 bottom-0 w-70 py-10 bg-white z-20 shadow-xl"
              >
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-medium text-slate-800">Note Info</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-1 text-slate-500 hover:text-slate-700"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Mobile Stats */}
                <div className="p-4 space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span className="font-medium">{(title + content).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-medium">{wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images:</span>
                    <span className="font-medium">{previewImages.length}</span>
                  </div>
                </div>

                {/* Mobile Writing Tips */}
                <div className="p-4 border-t border-slate-200">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">💡 Writing Tips</h3>
                  <div className="space-y-1 text-xs text-slate-600">
                    {writingTips.map((tip, index) => (
                      <div key={index} className="py-1">{tip}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">
          {/* Title Section */}
          <div className="border-b border-gray-700 bg-gray-800 px-4 md:px-6 py-4">
            <input
              type="text"
              className="w-full text-xl md:text-2xl font-semibold text-white placeholder-gray-400 border-none outline-none bg-transparent"
              placeholder="Untitled note..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>{title.length}/200 characters</span>
              <span className="md:hidden">{wordCount} words</span>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden bg-gray-900">
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
                    <div className="px-4 md:px-6 py-3 border-t border-gray-700 bg-gray-800/50 flex items-center justify-between text-xs text-gray-500">
                      <span>{content.length}/10,000 characters</span>
                      <span className="hidden md:inline">{wordCount} words</span>
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
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Upload Images ({previewImages.length}/10)
                    </label>
                    
                    {/* Mobile-optimized upload area */}
                    <label className="group relative block w-full border-2 border-dashed border-slate-300 rounded-xl p-6 md:p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer touch-manipulation">
                      <FaCloudUploadAlt className="mx-auto h-10 w-10 md:h-12 md:w-12 text-slate-400 group-hover:text-blue-500 transition-colors duration-200" />
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-700 group-hover:text-blue-600">
                          Tap to upload photos
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
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
                      <h3 className="text-sm font-medium text-slate-700 mb-3">
                        Uploaded Images
                      </h3>
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
                              <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 touch-manipulation">
                                <img
                                  src={imageData.url || imageData}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                                  onClick={() => setSelectedImage(imageData.url || imageData)}
                                />
                              </div>

                              {imageData.isUploading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                  <SecxionSpinner size="small" message="" />
                                </div>
                              )}

                              <button
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg touch-manipulation"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                disabled={imageData.isUploading}
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>

                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
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
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Add Tags
                    </label>
                    {/* Mobile-optimized tag input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' ? (e.preventDefault(), addTag()) : null}
                        className="flex-1 px-3 py-3 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 touch-manipulation"
                        placeholder="Enter a tag..."
                      />
                      <button
                        onClick={addTag}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 md:py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 touch-manipulation"
                      >
                        <FaTag className="w-4 h-4" />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </div>
                  </div>

                  {media.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-3">
                        Current Tags
                      </h3>
                      {/* Mobile-optimized tag display */}
                      <div className="flex flex-wrap gap-2">
                        {media.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm border border-blue-200 touch-manipulation"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 touch-manipulation"
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
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 touch-manipulation"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-4 mt-10 rounded-full transition-all duration-200 z-10 touch-manipulation"
              onClick={() => setSelectedImage(null)}
            >
              <MdClose className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selectedImage}
              alt="Full View"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UploadData;