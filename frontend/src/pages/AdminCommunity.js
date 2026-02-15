import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { FaUsers, FaTimes } from 'react-icons/fa';
import SummaryApi from '../common';

const AdminCommunity = () => {
  const { user } = useSelector((state) => state.user);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isApprovingOrRejecting, setIsApprovingOrRejecting] = useState(false);

  const fetchPendingPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(SummaryApi.getPendingPosts.url, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch pending posts');
      }
      const data = await response.json();
      setPendingPosts(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPendingPosts();
    } else {
      toast.error('Please log in to access this page.');
    }
  }, [user, fetchPendingPosts]);

  const handleApprove = async (postId) => {
    setIsApprovingOrRejecting(true);
    try {
      const response = await fetch(SummaryApi.approvePost(postId).url, {
        method: SummaryApi.approvePost(postId).method,
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Post approved.');
        fetchPendingPosts();
      } else {
        toast.error(data.message || 'Failed to approve post.');
      }
    } catch (err) {
      toast.error('Error approving post.');
    } finally {
      setIsApprovingOrRejecting(false);
    }
  };

  const handleReject = async (postId) => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    setIsApprovingOrRejecting(true);
    try {
      const response = await fetch(SummaryApi.rejectPost(postId).url, {
        method: SummaryApi.rejectPost(postId).method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Post rejected.');
        fetchPendingPosts();
        setRejectionReason('');
        setSelectedPostId(null);
      } else {
        toast.error(data.message || 'Failed to reject post.');
      }
    } catch (err) {
      toast.error('Error rejecting post.');
    } finally {
      setIsApprovingOrRejecting(false);
    }
  };

  const handleOpenRejectModal = (postId) => {
    setSelectedPostId(postId);
    setRejectionReason('');
  };

  const handleCloseRejectModal = () => {
    setSelectedPostId(null);
    setRejectionReason('');
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent mr-3"></div>
        <span className="text-slate-400">Loading pending posts...</span>
      </div>
    );
  if (error)
    return (
      <div className="m-4 lg:m-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
        Error loading pending posts: {error}
      </div>
    );

  if (!user) {
    return (
      <div className="m-4 lg:m-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-center">
        Please log in to access this page.
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-yellow-500/10 rounded-xl">
          <FaUsers className="text-yellow-500 text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            Pending Community Posts
          </h1>
          <p className="text-slate-400 text-sm">
            Review and moderate user submissions
          </p>
        </div>
      </div>

      {pendingPosts.length > 0 ? (
        <div className="space-y-4">
          {pendingPosts.map((post) => (
            <div
              key={post._id}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex items-start space-x-3">
                {post.userId?.profilePict && (
                  <img
                    src={post.userId.profilePic}
                    alt={post.userId.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-600"
                  />
                )}
                {!post.userId?.profilePic && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-slate-900 font-bold">
                    {post.userId?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">
                    {post.userId?.name || 'Anonymous'}
                  </p>
                  <p className="text-slate-300 mt-1">{post.content}</p>
                  {post.feedImage && (
                    <>
                      <p className="text-slate-500 text-xs mt-2 truncate">
                        {post.feedImage}
                      </p>
                      <img
                        src={post.feedImage}
                        alt={post.feedImage}
                        className="mt-2 rounded-lg max-w-full max-h-60 h-auto border border-slate-700"
                      />
                    </>
                  )}
                  <p className="text-slate-500 text-xs mt-2">
                    Submitted{' '}
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => handleApprove(post._id)}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isApprovingOrRejecting}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(post._id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isApprovingOrRejecting}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <FaUsers className="text-4xl mb-3" />
          <p>No pending community posts.</p>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <h3 className="text-lg font-bold text-white">Reject Post</h3>
              <button
                onClick={handleCloseRejectModal}
                disabled={isApprovingOrRejecting}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <label
                htmlFor="rejectionReason"
                className="block text-xs text-slate-400 mb-2"
              >
                Rejection Reason:
              </label>
              <textarea
                id="rejectionReason"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 resize-none"
                rows="3"
                placeholder="Enter the reason for rejecting this post..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              ></textarea>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-slate-700/50">
              <button
                type="button"
                className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:border-yellow-500/50 transition-colors disabled:opacity-50"
                onClick={handleCloseRejectModal}
                disabled={isApprovingOrRejecting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleReject(selectedPostId)}
                disabled={isApprovingOrRejecting}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommunity;
