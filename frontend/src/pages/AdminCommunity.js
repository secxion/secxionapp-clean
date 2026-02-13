import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
// ...existing code...
import SummaryApi from '../common';
import { useNotification } from '../common/NotificationProvider';

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
      notifyUser.error('Please log in to access this page.');
    }
  }, [user, fetchPendingPosts]);

  const handleApprove = async (postId) => {
    setIsApprovingOrRejecting(true);
      const { showNotification } = useNotification();
    try {
      const response = await fetch(SummaryApi.approvePost(postId).url, {
        method: SummaryApi.approvePost(postId).method,
        credentials: 'include',
      });
          showNotification('Please log in to access this page.', 'error');
      if (data.success) {
        notifyUser.success('Post approved.');
        fetchPendingPosts();
      } else {
        notifyUser.error(data.message || 'Failed to approve post.');
      }
    } catch (err) {
      notifyUser.error('Error approving post.');
    } finally {
      setIsApprovingOrRejecting(false);
    }
  };
            showNotification('Post approved.', 'success');
  const handleReject = async (postId) => {
    if (!rejectionReason.trim()) {
            showNotification(data.message || 'Failed to approve post.', 'error');
      return;
    }
          showNotification('Error approving post.', 'error');
    try {
      const response = await fetch(SummaryApi.rejectPost(postId).url, {
        method: SummaryApi.rejectPost(postId).method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
          showNotification('Rejection reason is required.', 'error');
      if (data.success) {
        notifyUser.success('Post rejected.');
        fetchPendingPosts();
        setRejectionReason('');
        setSelectedPostId(null);
      } else {
        notifyUser.error(data.message || 'Failed to reject post.');
      }
    } catch (err) {
      notifyUser.error('Error rejecting post.');
    } finally {
      setIsApprovingOrRejecting(false);
            showNotification('Post rejected.', 'success');
  };

  const handleOpenRejectModal = (postId) => {
    setSelectedPostId(postId);
            showNotification(data.message || 'Failed to reject post.', 'error');
  };

          showNotification('Error rejecting post.', 'error');
    setSelectedPostId(null);
    setRejectionReason('');
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        Loading pending posts...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-red-500">
        Error loading pending posts: {error}
      </div>
    );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-red-500">
        Please log in to access this page.
      </div>
    );
  }

  return (
    <div className="container min-h-screen bg-gray-100 dark:bg-gray-900 py-6">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          Pending Community Posts
        </h2>
        {pendingPosts.length > 0 ? (
          <ul>
            {pendingPosts.map((post) => (
              <li
                key={post._id}
                className="mb-4 p-4 bg-white dark:bg-gray-800 shadow rounded-md border-b border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start space-x-3">
                  {post.userId?.profilePict && (
                    <img
                      src={post.userId.profilePic}
                      alt={post.userId.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  {!post.userId?.profilePic && (
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm">
                      {post.userId?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {post.userId?.name || 'Anonymous'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {post.content}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 rounded-md max-w-full h-auto">
                      {post.feedImage}
                    </p>

                    {post.feedImage && (
                      <img
                        src={post.feedImage}
                        alt={post.feedImage}
                        className="mt-2 rounded-md max-w-full h-auto"
                      />
                    )}
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                      Submitted{' '}
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleApprove(post._id)}
                        className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isApprovingOrRejecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isApprovingOrRejecting}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleOpenRejectModal(post._id)}
                        className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isApprovingOrRejecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isApprovingOrRejecting}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center">
            No pending community posts.
          </p>
        )}

        {/* Rejection Modal */}
        {selectedPostId && (
          <div
            className="fixed z-10 inset-0 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
              ></div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white dark:bg-gray-700 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white dark:bg-gray-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100"
                    id="modal-title"
                  >
                    Reject Post
                  </h3>
                  <div className="mt-2">
                    <label
                      htmlFor="rejectionReason"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Rejection Reason:
                    </label>
                    <textarea
                      id="rejectionReason"
                      className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-500 rounded-md dark:bg-gray-600 dark:text-white"
                      rows="3"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-600 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => handleReject(selectedPostId)}
                    disabled={isApprovingOrRejecting}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleCloseRejectModal}
                    disabled={isApprovingOrRejecting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommunity;
