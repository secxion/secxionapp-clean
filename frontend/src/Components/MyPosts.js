import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import './PostCard.css';

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const MyPosts = () => {
  const { user } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrorIds, setImageErrorIds] = useState([]);

  const fetchMyPosts = async () => {
    try {
      const response = await fetch(SummaryApi.myposts.url, {
        method: SummaryApi.myposts.method,
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
      } else {
        toast.error(data.message || "Failed to load your posts.");
      }
    } catch (error) {
      toast.error("Something went wrong while loading posts.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (postId) => {
    setImageErrorIds((prev) => [...prev, postId]);
  };

  useEffect(() => {
    if (user) {
      fetchMyPosts();
    }
  }, [user]);

  if (loading) {
    return <div className="text-center mt-6 text-gray-600 dark:text-gray-300">Loading your posts...</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Posts</h2>

      {posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300">You haven't posted anything yet.</p>
      ) : (
        posts.map((post) => {
          const isLong = post.content && post.content.length > 150;
          const truncatedContent = truncateText(post.content, 150);

          return (
            <div
              key={post._id}
              className="postcard-container mb-6 px-4 py-5 bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 break-words"
            >
              <div className="flex flex-col sm:flex-row gap-4 break-words">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className="w-12 h-12 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                {/* Post Body */}
                <div className="flex-grow text-sm">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.name || 'You'}</p>

                  <div className="text-gray-700 dark:text-gray-300 mt-1 text-sm whitespace-pre-line break-words line-clamp-4">
                    {isLong ? truncatedContent : post.content}
                  </div>

                  {/* Image */}
                  {post.feedImage && !imageErrorIds.includes(post._id) && (
                    <img
                      src={post.feedImage}
                      alt="Post"
                      className="mt-3 rounded-md max-w-full w-full sm:w-60 h-auto cursor-pointer object-cover"
                      onError={() => handleImageError(post._id)}
                    />
                  )}

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <p>Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                    <span
                      className={`text-sm font-semibold mt-2 sm:mt-0 ${
                        post.status === 'approved'
                          ? 'text-green-600'
                          : post.status === 'rejected'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      Status: {post.status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyPosts;
