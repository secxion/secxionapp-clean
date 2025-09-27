import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPaperclip, FaTimes, FaSmile } from 'react-icons/fa';
import { MdSend } from 'react-icons/md';
import uploadImage from '../helpers/uploadImage';
import { toast } from 'react-toastify';
import Picker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import SummaryApi from '../common';
import SecxionLogo from '../app/slogo.png'; // Import Secxion-branded logo

const CreatePostCard = ({ onPostCreated, loading, error }) => {
  const { user } = useSelector((state) => state.user);
  const [newPostContent, setNewPostContent] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSubmitting(true);
    try {
      const uploadResponse = await uploadImage(file);
      setUploadedImage(uploadResponse.url);
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUploadedImage = () => {
    setUploadedImage('');
  };

  const handleEmojiClick = (emojiData) => {
    if (emojiData?.emoji) {
      setNewPostContent((prev) => prev + emojiData.emoji);
    }
    setShowEmojiPicker(false);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to post.');
      return;
    }
    if (!newPostContent && !uploadedImage) {
      toast.error('Please upload an image or write something to post.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(SummaryApi.submitNewPost.url, {
        method: SummaryApi.submitNewPost.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent,
          feedImage: uploadedImage,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Post submitted successfully!');
        setNewPostContent('');
        setUploadedImage('');
        window.dispatchEvent(new CustomEvent('newPostCreated'));
      } else {
        toast.error(data.message || 'Failed to submit post.');
      }
    } catch (err) {
      toast.error('Error submitting post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handlePostSubmit}
      className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 shadow-lg p-4 rounded-lg relative text-white"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Logo */}
      <div className="absolute inset-0 flex justify-center items-center opacity-10">
        <img
          src={SecxionLogo}
          alt="Secxion Logo"
          className="w-[250px] h-[250px] object-contain"
        />
      </div>

      <div className="relative z-10">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder={`What's on your mind, ${user?.name || 'guest'}?`}
          className="w-full p-3 border rounded bg-gray-800 text-white mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm break-words placeholder-gray-400"
          rows={3}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <label className="cursor-pointer flex items-center gap-1 text-gray-400 hover:text-indigo-400 mr-3">
              <FaPaperclip className="mr-1" />
              <span>Attach</span>
              <input
                type="file"
                className="hidden"
                onChange={handleUploadImage}
                accept="image/*"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-gray-400 hover:text-blue-400 focus:outline-none mr-3"
            >
              <FaSmile className="text-xl" />
            </button>
            {uploadedImage && (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="w-12 h-12 object-cover rounded-md border border-gray-600"
                />
                <button
                  type="button"
                  onClick={handleRemoveUploadedImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs -mt-1 -mr-1 focus:outline-none"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-indigo-300 transition-colors duration-300"
            disabled={isSubmitting || loading}
          >
            <MdSend className="inline-block mr-1" />{' '}
            {isSubmitting || loading ? 'Posting...' : 'Post'}
          </button>
        </div>

        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-[1050] bg-gray-900 shadow-lg rounded-lg mt-2 p-4 border-2"
              style={{
                top: '100%', // Position below the input field
                left: '0', // Align with the left edge of the input field
                borderImage: 'linear-gradient(135deg, #8b5cf6, #3b82f6) 1', // Gradient border
              }}
            >
              {/* Branded Close Button */}
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500/50 border-2 border-white/20"
                  aria-label="Close emoji picker"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              <Picker
                onEmojiClick={handleEmojiClick}
                pickerStyle={{
                  background: 'linear-gradient(135deg, #1f2937, #111827)', // Dark gradient background
                  borderRadius: '8px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  );
};

export default CreatePostCard;
