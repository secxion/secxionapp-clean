import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import Comment from './Comment'; // And we will create this final component

const CommentSection = ({ postId, comments, onCommentUpdate }) => {
  const { user } = useSelector((state) => state.user);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to comment.');
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(SummaryApi.addComment.url, {
        method: SummaryApi.addComment.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, text: newComment }),
      });
      const data = await response.json();
      if (data.success) {
        onCommentUpdate(postId, data.comments);
        setNewComment('');
      } else {
        toast.error(data.message || 'Failed to add comment.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-700 p-4">
      <form onSubmit={handleCommentSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-2 border rounded-md dark:bg-gray-600 dark:text-white"
          rows="2"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2 hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
      <div className="space-y-4">
        {comments &&
          comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              postId={postId}
              onCommentUpdate={onCommentUpdate}
            />
          ))}
      </div>
    </div>
  );
};

export default CommentSection;
