import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SummaryApi from '../common';

const Comment = ({ comment, postId, onCommentUpdate }) => {
  const { user } = useSelector((state) => state.user);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to reply.');
      return;
    }
    if (!replyText.trim()) return;

    setIsReplying(true);
    try {
      const response = await fetch(SummaryApi.addReplyToComment.url, {
        method: SummaryApi.addReplyToComment.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          commentId: comment._id,
          text: replyText,
        }),
      });
      const data = await response.json();
      if (data.success) {
        onCommentUpdate(postId, data.comments);
        setReplyText('');
        setShowReplyForm(false);
      } else {
        toast.error(data.message || 'Failed to post reply.');
      }
    } catch (error) {
      toast.error('An error occurred while replying.');
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
      <div className="flex items-start">
        <img
          src={comment.author?.profilePic}
          alt="author"
          className="w-8 h-8 rounded-full mr-3"
        />
        <div className="flex-1">
          <p className="font-semibold text-sm dark:text-white">
            {comment.author?.name}
          </p>
          <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs text-blue-500 mt-1"
          >
            Reply
          </button>
        </div>
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="ml-11 mt-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="w-full p-2 border rounded-md dark:bg-gray-700"
            rows="1"
          />
          <button
            type="submit"
            disabled={isReplying}
            className="bg-blue-400 text-white px-3 py-1 text-sm rounded-md mt-1 hover:bg-blue-500"
          >
            {isReplying ? 'Replying...' : 'Submit'}
          </button>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 mt-3 space-y-3 border-l-2 border-gray-200 pl-3">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              postId={postId}
              onCommentUpdate={onCommentUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
