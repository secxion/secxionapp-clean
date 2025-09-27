import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaEdit, FaImage, FaCalendarAlt, FaEye } from 'react-icons/fa';
import { MdMoreVert } from 'react-icons/md';

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatLastUpdated = (updatedAt, createdAt) => {
  const updateDate = new Date(updatedAt || createdAt);
  const createDate = new Date(createdAt);

  if (updatedAt && updateDate > createDate) {
    return `Updated ${formatDate(updatedAt)}`;
  }
  return `Created ${formatDate(createdAt)}`;
};

const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

const NoteCard = ({ dataPad, onEdit, onDelete, onView }) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(
    async (e) => {
      e.stopPropagation();
      setIsDeleting(true);
      try {
        await onDelete(dataPad._id);
      } catch (error) {
        console.error('Error deleting note:', error);
      } finally {
        setIsDeleting(false);
      }
    },
    [dataPad._id, onDelete],
  );

  const handleEdit = useCallback(
    (e) => {
      e.stopPropagation();
      onEdit(dataPad);
    },
    [dataPad, onEdit],
  );

  const handleView = useCallback(() => {
    onView(dataPad);
  }, [dataPad, onView]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-yellow-700/30 transition-all duration-200 cursor-pointer group"
      onClick={handleView}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Gradient Signature Loader (top left) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring' }}
        className="absolute top-0 left-0 px-4 py-2"
        style={{ zIndex: 2 }}
      >
        <div className="flex flex-col items-start">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full w-full"
          ></motion.div>
        </div>
      </motion.div>

      <div className="p-5 pt-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 truncate group-hover:text-yellow-700 dark:group-hover:text-yellow-400 transition-colors duration-200">
              {dataPad.title || 'Untitled Note'}
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {formatLastUpdated(dataPad.updatedAt, dataPad.createdAt)}
            </p>
          </div>

          <div className="relative ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 text-yellow-500 "
            >
              <MdMoreVert className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-black dark:via-gray-900 dark:to-yellow-900 rounded-xl shadow-xl border border-yellow-700/30 py-2 z-10"
                  onMouseLeave={() => setShowActions(false)}
                >
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 text-left text-sm text-yellow-900 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900 flex items-center space-x-3"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span>Edit Note</span>
                  </button>
                  <button
                    onClick={handleView}
                    className="w-full px-4 py-2 text-left text-sm text-yellow-900 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900 flex items-center space-x-3"
                  >
                    <FaEye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  <hr className="my-2 border-yellow-200 dark:border-yellow-800" />
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 disabled:opacity-50"
                  >
                    <FaTrash className="w-4 h-4" />
                    <span>{isDeleting ? 'Deleting...' : 'Delete Note'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content Preview */}
        {dataPad.content && (
          <p className="text-yellow-900 dark:text-yellow-100 text-sm mb-4 leading-relaxed">
            {truncateText(dataPad.content)}
          </p>
        )}

        {/* Tags */}
        {dataPad.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {dataPad.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 text-yellow-900 dark:bg-gradient-to-r dark:from-yellow-900 dark:via-yellow-800 dark:to-yellow-700 dark:text-yellow-100"
              >
                {tag}
              </span>
            ))}
            {dataPad.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                +{dataPad.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Media Info */}
        {dataPad.media?.length > 0 && (
          <div className="flex items-center text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            <FaImage className="w-4 h-4 mr-2" />
            <span>
              {dataPad.media.length} image
              {dataPad.media.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-yellow-100 dark:border-yellow-900">
          <div className="flex items-center text-xs text-yellow-700 dark:text-yellow-300">
            <FaCalendarAlt className="w-3 h-3 mr-1" />
            <span>{new Date(dataPad.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="p-2 text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-300 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors duration-200"
              title="Edit note"
            >
              <FaEdit className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:text-red-700 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50"
              title="Delete note"
            >
              <FaTrash className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-gradient-move {
          background-size: 200% 200%;
          animation: gradientMove 2s linear infinite alternate;
        }
      `}</style>
    </motion.div>
  );
};

export default NoteCard;
