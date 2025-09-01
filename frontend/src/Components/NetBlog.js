import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SummaryApi from '../common';
import SecxionLoader from './SecxionLoader';
import { formatDistanceToNow } from 'date-fns';
import { FaCircle, FaExternalLinkAlt } from 'react-icons/fa';
import FullBlogDialog from './FullBlogDialog';
import { useNavigate } from 'react-router-dom';

const blogCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const NetBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [visibleBlogs, setVisibleBlogs] = useState(6);
  const [showBlogs, setShowBlogs] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [errorBlogs, setErrorBlogs] = useState(null);
  const [communityFeedData, setCommunityFeedData] = useState(null);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [errorFeed, setErrorFeed] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoadingBlogs(true);
      setErrorBlogs(null);
      try {
        const response = await fetch(SummaryApi.getBlogs.url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setBlogs(data);
      } catch (e) {
        setErrorBlogs(e.message);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, []);

  const fetchCommunityFeedData = async () => {
    setLoadingFeed(true);
    setErrorFeed(null);
    try {
      const response = await fetch(SummaryApi.getApprovedPosts.url, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch community posts');
      const data = await response.json();
      setCommunityFeedData(data.data);
    } catch (err) {
      setErrorFeed(err.message);
    } finally {
      setLoadingFeed(false);
    }
  };

  const handleCommunityFeedClick = () => {
    const isMobile = window.innerWidth <= 768;

    // 🔍 Track clicks (you can replace this with a real analytics call)
    console.log('Community Feed Clicked:', {
      time: new Date().toISOString(),
      platform: isMobile ? 'Mobile' : 'Web',
    });

    // 🎯 Smooth animation effect
    const delay = 100;
    setTimeout(() => {
      if (isMobile) {
        navigate("/community-feed");
      } else {
        window.open('/community-feed', '_blank', 'noopener,noreferrer');
      }
    }, delay);
  };

  const toggleBlogVisibility = () => setShowBlogs((prev) => !prev);
  const toggleMoreBlogs = () => setVisibleBlogs((prev) => (prev === 6 ? blogs.length : 6));

  if (loadingBlogs) {
    return <SecxionLoader size="medium" message="Loading latest updates..." />;
  }

  if (errorBlogs) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-300 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">{errorBlogs}</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-6 text-center">
        <p className="text-gray-600">No blog posts available at the moment.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto mt-32 px-4 max-w-7xl"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onMouseEnter={fetchCommunityFeedData}
          onClick={handleCommunityFeedClick}
          className="relative group px-5 py-2 text-white font-semibold items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-xs bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:brightness-110 flex items-center gap-2 border-4 border-yellow-500 glossy-text" // Applied glossy-text
        >
          <span className="hidden sm:inline">Community</span> Feed

          <FaExternalLinkAlt className="text-white text-[10px] hidden sm:inline" />

          <span className="absolute bottom-full mb-1 hidden sm:group-hover:flex px-2 py-1 text-[10px] bg-black text-white rounded">
            Opens in new tab
          </span>
        </motion.button>

        <div className="flex gap-2">
          <button
            onClick={toggleBlogVisibility}
            className="text-sm font-semibold text-gray-700 border-4 border-yellow-500 px-4 py-1 rounded-full transition glossy-text" // Applied glossy-text
          >
            {showBlogs ? 'Hide Blogs' : 'Show Blogs'}
          </button>
        </div>
      </div>

      {blogs.length > 0 && showBlogs ? (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {blogs.slice(0, visibleBlogs).map((blog) => (
              <motion.div
                key={blog._id}
                variants={blogCardVariants}
                className="rounded-2xl overflow-hidden shadow-lg bg-white  border-4 border-yellow-500 transition-all duration-300 hover:scale-[1.015] glossy-text"
              >
                <div className="p-6 minecraft-font text-xs">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold line-clamp-2 text-gray-800 glossy-heading"> {/* Applied glossy-heading */}
                      {blog.title}
                    </h3>
                    {blog.isActive && (
                      <span className="flex items-center text-green-500 text-xs">
                        <FaCircle className="mr-1 animate-pulse" />
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-xs line-clamp-3 glossy-text"> 
                    {blog.content || 'No content available.'}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-3 glossy-text"> {/* Applied glossy-text */}
                    Published {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                  </p>
                  <button
                    onClick={() => setSelectedBlog(blog)}
                    className="mt-3 text-xs font-medium text-pink-500 hover:text-pink-400 transition-colors focus:outline-none glossy-text border-2 border-black rounded-md px-2 py-1"
                  >
                    Read More →
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {blogs.length > 6 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={toggleMoreBlogs}
                className="px-4 py-2 text-xs font-semibold bg-pink-500 text-white rounded-full hover:bg-pink-600 transition border-4 border-yellow-500 glossy-text" // Applied glossy-text
              >
                {visibleBlogs === 6 ? 'Show More' : 'Show Less'}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-12 text-sm minecraft-font glossy-text border-2 border-black"> {/* Applied glossy-text */}
          No blog posts available yet.
        </p>
      )}

      {selectedBlog && (
        <FullBlogDialog blog={selectedBlog} onClose={() => setSelectedBlog(null)} />
      )}
    </motion.div>
  );
};

export default NetBlog;