import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FaPaperclip, FaTimes, FaSmile, FaClock } from 'react-icons/fa';
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
  const [pendingPosts, setPendingPosts] = useState([]);

  // Fetch user's pending posts
  const fetchPendingPosts = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(SummaryApi.myposts.url, {
        method: SummaryApi.myposts.method,
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        const pending = data.data.filter((post) => post.status === 'pending');
        setPendingPosts(pending);
      }
    } catch (err) {
      console.error('Error fetching pending posts:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchPendingPosts();
  }, [fetchPendingPosts]);

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
        setNewPostContent('');
        setUploadedImage('');
        fetchPendingPosts(); // Refresh pending posts to show the new one
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
      className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-brand-dark-elevated/70 via-brand-dark-base/75 to-black/25 p-5 text-white shadow-[0_0_24px_rgba(0,0,0,0.25)]"
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
          className="mb-3 w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white placeholder-gray-600 break-words focus:border-brand-gold/40 focus:outline-none"
          rows={3}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <label className="mr-3 flex cursor-pointer items-center gap-1 text-gray-500 transition-colors hover:text-brand-gold">
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
              className="mr-3 text-gray-500 transition-colors hover:text-brand-gold focus:outline-none"
            >
              <FaSmile className="text-xl" />
            </button>
            {uploadedImage && (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="h-12 w-12 rounded-lg border border-white/10 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveUploadedImage}
                  className="absolute -mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs text-white focus:outline-none top-0 right-0"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="rounded-xl bg-brand-gold px-5 py-2.5 font-spaceGrotesk text-[10px] font-black uppercase tracking-widest text-brand-dark-base transition-colors duration-300 hover:bg-brand-gold-light focus:outline-none disabled:opacity-40"
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
              className="absolute z-[1050] mt-2 rounded-2xl border border-brand-gold/30 bg-brand-dark-base p-4 shadow-[0_0_24px_rgba(0,0,0,0.35)]"
              style={{
                top: '100%', // Position below the input field
                left: '0', // Align with the left edge of the input field
              }}
            >
              {/* Branded Close Button */}
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="absolute top-2 right-2 rounded-full border-2 border-white/20 bg-red-600/90 p-2 text-white shadow-md transition-all duration-200 hover:scale-110 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50"
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

      {/* Pending Posts Notification */}
      <AnimatePresence>
        {pendingPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10 mt-3 rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-3"
          >
            <div className="flex items-center space-x-2">
              <FaClock className="animate-pulse text-brand-gold" />
              <p className="text-sm text-brand-gold-light">
                <span className="font-semibold">
                  {pendingPosts.length} post{pendingPosts.length > 1 ? 's' : ''}
                </span>{' '}
                pending review. Your post{pendingPosts.length > 1 ? 's' : ''}{' '}
                will appear once approved by admin.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
};

export default CreatePostCard;
