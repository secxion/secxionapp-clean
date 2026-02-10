import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { MdClose, MdDelete } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import FullPostDialog from './FullPostDialog';
import './PostCard.css';

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const PostCard = ({ post, onDelete, onCommentAdded }) => {
  const { user } = useSelector((state) => state.user);
  const [commentContent, setCommentContent] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showFullPost, setShowFullPost] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please log in to comment.');
      return;
    }
    if (!commentContent.trim()) return;
    setIsCommenting(true);
    try {
      const response = await fetch(SummaryApi.addComment(post._id).url, {
        method: SummaryApi.addComment(post._id).method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent }),
      });
      const data = await response.json();
      if (data.success) {
        setCommentContent('');
        onCommentAdded(post._id, data.data);
      } else {
        toast.error(data.message || 'Failed to add comment.');
      }
    } catch (err) {
      toast.error('Error adding comment.');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(SummaryApi.deletePost(postId).url, {
        method: SummaryApi.deletePost(postId).method,
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Post deleted successfully');
        onDelete(postId);
      } else {
        toast.error(data.message || 'Failed to delete post.');
      }
    } catch (err) {
      toast.error('Error deleting post.');
    }
  };

  const openFullPostDialog = () => setShowFullPost(true);
  const closeFullPostDialog = () => setShowFullPost(false);
  const openImageFullscreen = () => setIsImageFullscreen(true);
  const closeImageFullscreen = () => setIsImageFullscreen(false);

  const formattedContent = post.content
    ? post.content.replace(/\n/g, '<br />')
    : '';
  const isLongPost = post.content && post.content.length > 150;
  const truncatedContent = isLongPost
    ? truncateText(post.content, 150)
    : formattedContent;

  return (
    <motion.div
      key={post._id}
      className="postcard-container mb-6 px-4 py-5 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 shadow-lg rounded-lg border border-gray-700 transition-shadow duration-300 text-white hover:shadow-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <div className="flex flex-col sm:flex-row gap-4 break-words">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {post.userId?.profilePic ? (
            <img
              src={post.userId.profilePic}
              alt={post.userId.name}
              className="w-12 h-12 sm:w-10 sm:h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg">
              {post.userId?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="flex-grow text-sm">
          <p className="font-semibold text-gray-100">
            {post.userId?.name || 'Anonymous'}
          </p>

          <div
            className="text-gray-300 mt-1 text-sm whitespace-pre-line break-words"
            dangerouslySetInnerHTML={{
              __html: showFullPost ? formattedContent : truncatedContent,
            }}
          />

          {/* View More */}
          {isLongPost && !showFullPost && (
            <button
              onClick={openFullPostDialog}
              className="text-blue-600 hover:underline text-xs mt-1 focus:outline-none"
            >
              View More
            </button>
          )}

          {/* Image Preview */}
          {post.feedImage && !imageError && (
            <img
              src={post.feedImage}
              alt="Post"
              onError={() => setImageError(true)}
              className="mt-3 rounded-md max-w-full w-full sm:w-60 h-auto cursor-pointer object-cover"
              onClick={openImageFullscreen}
            />
          )}

          {/* Time & Actions */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <p>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>

            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <button
                onClick={() => setShowComments((prev) => !prev)}
                className="hover:text-indigo-600 focus:outline-none"
              >
                {post.comments?.length > 0
                  ? `${post.comments.length} Comments`
                  : 'Comment'}
              </button>

              {user?.id === post.userId?._id && (
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="text-red-500 hover:text-red-700 flex items-center focus:outline-none"
                >
                  <MdDelete className="mr-1" /> Delete
                </button>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                className="postcard-comments mt-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h6 className="text-xs font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  Comments:
                </h6>
                <div className="space-y-3">
                  {post.comments?.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex items-start gap-2 p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-xs"
                    >
                      {comment.userId?.profilePic ? (
                        <img
                          src={comment.userId.profilePic}
                          alt={comment.userId.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                          {comment.userId?.name?.charAt(0)?.toUpperCase() ||
                            '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {comment.userId?.name || 'Anonymous'}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                        {comment.feedImage && (
                          <img
                            src={comment.feedImage}
                            alt=""
                            className="mt-1 rounded-md max-w-full h-auto"
                          />
                        )}
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] mt-1">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {user && (
                  <div className="mt-3">
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={isCommenting}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm mt-2 focus:outline-none transition-all duration-300 disabled:bg-blue-300"
                    >
                      {isCommenting ? 'Commenting...' : 'Comment'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Full Post Modal */}
      <AnimatePresence>
        {showFullPost && (
          <FullPostDialog
            post={post}
            onClose={closeFullPostDialog}
            onCommentAdded={onCommentAdded}
          />
        )}
      </AnimatePresence>

      {/* Fullscreen Image View */}
      <AnimatePresence>
        {isImageFullscreen && post.feedImage && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 z-50 flex items-center justify-center cursor-pointer"
            onClick={closeImageFullscreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={post.feedImage}
              alt="Full Post Image"
              className="max-w-full max-h-full object-contain"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            />
            <motion.button
              onClick={closeImageFullscreen}
              className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MdClose size={30} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
