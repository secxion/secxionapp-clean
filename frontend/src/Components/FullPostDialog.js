import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { MdClose } from 'react-icons/md';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import SummaryApi from '../common';

const FullPostDialog = ({ post, onClose, onCommentAdded }) => {
  const { user } = useSelector((state) => state.user);
  const [dialogCommentContent, setDialogCommentContent] = useState('');
  const [isCommentingInDialog, setIsCommentingInDialog] = useState(false);

  const handleAddCommentInDialog = useCallback(async () => {
    if (!user) {
      toast.error('Please log in to comment.');
      return;
    }
    if (!dialogCommentContent.trim()) return;
    setIsCommentingInDialog(true);
    try {
      const response = await fetch(SummaryApi.addComment(post._id).url, {
        method: SummaryApi.addComment(post._id).method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: dialogCommentContent })
      });
      const data = await response.json();
      if (data.success) {
        setDialogCommentContent('');
        onCommentAdded(post._id, data.data);
      } else {
        toast.error(data.message || 'Failed to add comment.');
      }
    } catch (err) {
      toast.error('Error adding comment.');
    } finally {
      setIsCommentingInDialog(false);
    }
  }, [user, post._id, dialogCommentContent, setIsCommentingInDialog, toast, SummaryApi, onCommentAdded]);

  const formattedContent = post.content ? post.content.replace(/\n/g, '<br />') : '';

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-lg shadow-xl p-6 w-full max-w-lg relative overflow-y-auto max-h-[80vh]"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-300 hover:text-gray-100 focus:outline-none">
          <MdClose size={24} />
        </button>
        <p className="font-semibold text-gray-100 mb-2">{post.userId?.name || 'Anonymous'}</p>
        <div className="text-gray-300 mb-4" dangerouslySetInnerHTML={{ __html: formattedContent }} />
        {post.feedImage && (
          <img src={post.feedImage} alt='' className="mt-2 rounded-md max-w-full h-auto" />
        )}
        <p className="text-gray-400 text-xs mt-2">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </p>

        {/* Comment Section in Dialog */}
        <div className="mt-4">
          <h6 className="text-sm font-semibold text-gray-200 mb-2">Comments:</h6>
          {post.comments?.map(comment => (
            <div key={comment._id} className="p-3 mb-2 bg-gray-800 rounded-md text-sm flex items-start space-x-2">
              {comment.userId?.profilePic ? (
                <img src={comment.userId.profilePic} alt={comment.userId.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
                  {comment.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <p className="text-gray-100 font-semibold">{comment.userId?.name || 'Anonymous'}</p>
                <p className="text-gray-300">{comment.content}</p>
                {comment.feedImage && <img src={comment.feedImage} alt='' className="mt-1 rounded-md max-w-full h-auto" />}
                <p className="text-gray-400 text-xs mt-0.5">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          {user && (
            <div className="mt-2">
              <textarea
                value={dialogCommentContent}
                onChange={(e) => setDialogCommentContent(e.target.value)}
                placeholder="Add your comment..."
                className="w-full p-2 border rounded bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <button
                onClick={handleAddCommentInDialog}
                disabled={isCommentingInDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm mt-1 focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-blue-300"
              >
                {isCommentingInDialog ? 'Commenting...' : 'Comment'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FullPostDialog;