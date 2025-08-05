import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPaperclip, FaTimes, FaSmile } from 'react-icons/fa';
import { MdSend } from 'react-icons/md';
import uploadImage from '../helpers/uploadImage';
import { toast } from 'react-toastify';
import Picker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import SummaryApi from '../common';

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
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Upload failed.");
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
      toast.error('Message or image required to post.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(SummaryApi.submitNewPost.url, {
        method: SummaryApi.submitNewPost.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostContent, feedImage: uploadedImage }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Post submitted, await approval');
        setNewPostContent('');
        setUploadedImage("");
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
      className=" bg-white dark:bg-gray-800 shadow-sm p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <textarea
        value={newPostContent}
        onChange={(e) => setNewPostContent(e.target.value)} 
        placeholder={`What's on your mind, ${user?.name || 'guest'}?`}
        className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm break-words"
        rows={3}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <label className="cursor-pointer flex items-center gap-1 text-gray-500 hover:text-indigo-600 mr-3">
            <FaPaperclip className="mr-1" />
            <span>Attach</span>
            <input type="file" className="hidden" onChange={handleUploadImage} accept="image/*" />
          </label>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)} 
            className="text-gray-500 hover:text-blue-600 focus:outline-none mr-3"
          >
            <FaSmile className="text-xl" />
          </button>
          {uploadedImage && (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-12 h-12 object-cover rounded-md border border-gray-300"
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-300"
          disabled={isSubmitting || loading}
        >
          <MdSend className="inline-block mr-1" /> {isSubmitting || loading ? 'Posting...' : 'Post'}
        </button>
      </div>

      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 z-10 bg-white shadow-md rounded-md mt-2"
            style={{ transform: 'translateY(100%)' }}
          >
            <Picker onEmojiClick={handleEmojiClick} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
};

export default CreatePostCard;
