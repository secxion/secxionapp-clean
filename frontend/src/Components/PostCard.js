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
      className="postcard-container mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-brand-dark-elevated/70 via-brand-dark-base/75 to-black/30 px-6 py-6 text-white shadow-[0_0_24px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-brand-gold/30"
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
              className="h-12 w-12 rounded-full border border-white/10 object-cover sm:h-10 sm:w-10"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-gold/10 text-lg font-black text-brand-gold sm:h-10 sm:w-10">
              {post.userId?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="flex-grow text-sm">
          <p className="font-spaceGrotesk text-sm font-black uppercase tracking-wide text-white">
            {post.userId?.name || 'Anonymous'}
          </p>

          <div
            className="mt-1 whitespace-pre-line break-words text-sm text-gray-300"
            dangerouslySetInnerHTML={{
              __html: showFullPost ? formattedContent : truncatedContent,
            }}
          />

          {/* View More */}
          {isLongPost && !showFullPost && (
            <button
              onClick={openFullPostDialog}
              className="mt-1 text-[10px] font-black uppercase tracking-widest text-brand-gold hover:text-white focus:outline-none"
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
              className="mt-3 h-auto w-full max-w-full cursor-pointer rounded-xl border border-white/10 object-cover sm:w-60"
              onClick={openImageFullscreen}
            />
          )}

          {/* Time & Actions */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
            <p>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>

            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <button
                onClick={() => setShowComments((prev) => !prev)}
                className="text-gray-400 transition-colors hover:text-brand-gold focus:outline-none"
              >
                {post.comments?.length > 0
                  ? `${post.comments.length} Comments`
                  : 'Comment'}
              </button>

              {user?.id === post.userId?._id && (
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="flex items-center text-rose-400 transition-colors hover:text-rose-300 focus:outline-none"
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
                <h6 className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Comments:
                </h6>
                <div className="space-y-3">
                  {post.comments?.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs"
                    >
                      {comment.userId?.profilePic ? (
                        <img
                          src={comment.userId.profilePic}
                          alt={comment.userId.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs text-white">
                          {comment.userId?.name?.charAt(0)?.toUpperCase() ||
                            '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white">
                          {comment.userId?.name || 'Anonymous'}
                        </p>
                        <p className="text-gray-300">{comment.content}</p>
                        {comment.feedImage && (
                          <img
                            src={comment.feedImage}
                            alt=""
                            className="mt-1 rounded-md max-w-full h-auto"
                          />
                        )}
                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
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
                      className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold/40"
                      rows={2}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={isCommenting}
                      className="mt-2 rounded-xl bg-brand-gold px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-dark-base transition-all duration-300 hover:bg-brand-gold-light focus:outline-none disabled:opacity-40"
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
