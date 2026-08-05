import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import PostCard from './PostCard';
import SecxionSpinner from './SecxionSpinner';

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const preloadedData = location.state?.preloadedData;
  const [refreshFeed, setRefreshFeed] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (preloadedData && !refreshFeed) {
      setPosts(preloadedData);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(SummaryApi.getApprovedPosts.url, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch community posts');
      }
      const data = await response.json();
      setPosts(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshFeed(false);
    }
  }, [preloadedData, refreshFeed]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const handleNewPost = () => {
      setRefreshFeed(true);
    };

    window.addEventListener('newPostCreated', handleNewPost);

    return () => {
      window.removeEventListener('newPostCreated', handleNewPost);
    };
  }, [fetchPosts]);

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(SummaryApi.deletePost(postId).url, {
        method: SummaryApi.deletePost(postId).method,
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Post deleted successfully.');
        setPosts((currentPosts) =>
          currentPosts.filter((post) => post._id !== postId),
        );
      } else {
        toast.error(data.message || 'Failed to delete post.');
      }
    } catch (err) {
      toast.error('Error deleting post.');
    }
  };

  const handleCommentAdded = useCallback((postId, newComment) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post._id === postId
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post,
      ),
    );
  }, []);

  if (loading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <SecxionSpinner size="large" message="" />
      </div>
    );
  if (error)
    return (
      <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-rose-500/20 bg-rose-500/5 px-6 py-8 text-center">
        <p className="text-sm font-semibold text-rose-300">
          We could not load the community feed right now.
        </p>
        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-rose-400/80">
          {error}
        </p>
      </div>
    );

  return (
    <motion.div
      className="w-full px-2 py-4 sm:px-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto sm:px-2">
        <motion.ul
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handleDeletePost}
              onCommentAdded={handleCommentAdded}
            />
          ))}
        </motion.ul>

        {posts.length === 0 && !loading && (
          <motion.p
            className="mt-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            No community posts yet. Be the first to share!
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default CommunityFeed;
