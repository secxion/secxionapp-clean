import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SummaryApi from '../common';
import SecxionLoader from './SecxionLoader';
import { formatDistanceToNow } from 'date-fns';
import { FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BLOG_CACHE_KEY = 'home:latest-updates:blogs';
const BLOG_CACHE_TTL_MS = 10 * 60 * 1000;
const BLOG_FETCH_TIMEOUT_MS = 8000;

const readBlogsCache = () => {
  try {
    const raw = localStorage.getItem(BLOG_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const isExpired = Date.now() - parsed.timestamp > BLOG_CACHE_TTL_MS;

    if (isExpired) {
      localStorage.removeItem(BLOG_CACHE_KEY);
      return [];
    }

    return Array.isArray(parsed.data) ? parsed.data : [];
  } catch (err) {
    localStorage.removeItem(BLOG_CACHE_KEY);
    return [];
  }
};

const writeBlogsCache = (blogs) => {
  if (!Array.isArray(blogs)) return;

  try {
    localStorage.setItem(
      BLOG_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: blogs,
      }),
    );
  } catch (err) {
    // Ignore cache write errors (quota/private mode).
  }
};

const normalizeBlogsPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const blogCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const NetBlog = () => {
  const [blogs, setBlogs] = useState(() => readBlogsCache());
  const [visibleBlogs, setVisibleBlogs] = useState(6);
  const [showBlogs, setShowBlogs] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(() => blogs.length === 0);
  const [errorBlogs, setErrorBlogs] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cachedBeforeFetch = readBlogsCache();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, BLOG_FETCH_TIMEOUT_MS);

    const fetchBlogs = async () => {
      if (cachedBeforeFetch.length === 0) {
        setLoadingBlogs(true);
      }
      setErrorBlogs(null);

      try {
        const response = await fetch(SummaryApi.getBlogs.url, {
          signal: controller.signal,
          credentials: 'include',
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const normalizedBlogs = normalizeBlogsPayload(data);
        setBlogs(normalizedBlogs);
        writeBlogsCache(normalizedBlogs);
      } catch (e) {
        if (e.name !== 'AbortError') {
          setErrorBlogs(e.message);
        } else if (cachedBeforeFetch.length === 0) {
          setErrorBlogs('Timed out while loading updates.');
        }
      } finally {
        setLoadingBlogs(false);
        clearTimeout(timeoutId);
      }
    };

    fetchBlogs();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const fetchCommunityFeedData = async () => {
    try {
      const response = await fetch(SummaryApi.getApprovedPosts.url, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch community posts');
    } catch (err) {
      // Ignore warmup errors because this call is only used to prefetch.
    }
  };

  const handleCommunityFeedClick = () => {
    const isMobile = window.innerWidth <= 768;

    // 🎯 Smooth animation effect
    const delay = 100;
    setTimeout(() => {
      if (isMobile) {
        navigate('/community-feed');
      } else {
        window.open('/community-feed', '_blank', 'noopener,noreferrer');
      }
    }, delay);
  };

  const toggleBlogVisibility = () => setShowBlogs((prev) => !prev);
  const toggleMoreBlogs = () =>
    setVisibleBlogs((prev) => (prev === 6 ? blogs.length : 6));

  if (loadingBlogs) {
    return <SecxionLoader size="medium" message="Loading latest updates..." />;
  }

  if (errorBlogs) {
    return (
      <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-6 text-center backdrop-blur-sm">
        <p className="font-spaceGrotesk text-xs font-bold uppercase tracking-wider text-rose-300">
          {errorBlogs}
        </p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm">
        <p className="font-spaceGrotesk text-xs font-bold uppercase tracking-wider text-gray-300">
          No blog posts available at the moment.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 max-w-7xl mt-20"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-6">
        <h2 className="text-xl sm:text-2xl font-black font-spaceGrotesk text-white uppercase tracking-tight">
          Latest Updates
        </h2>

        <div className="flex flex-wrap gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onMouseEnter={fetchCommunityFeedData}
            onClick={handleCommunityFeedClick}
            className="flex items-center gap-3 rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-6 py-2.5 font-spaceGrotesk text-[10px] font-black uppercase tracking-widest text-brand-gold-light shadow-[0_0_20px_rgba(212,175,55,0.12)] transition-all duration-300 hover:bg-brand-gold/20 hover:text-white"
          >
            <span>Community Feed</span>
            <FaExternalLinkAlt className="text-brand-gold w-2.5 h-2.5" />
          </motion.button>

          <button
            onClick={toggleBlogVisibility}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-2.5 font-spaceGrotesk text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all duration-300 hover:border-brand-gold/30 hover:bg-white/[0.06] hover:text-white"
          >
            {showBlogs ? 'Hide Records' : 'Show Records'}
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
                className="group rounded-3xl border border-white/10 bg-gradient-to-br from-brand-dark-elevated/70 via-brand-dark-base/70 to-black/20 p-8 shadow-[0_0_24px_rgba(0,0,0,0.22)] transition-all duration-500 hover:border-brand-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight group-hover:text-brand-gold transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    {blog.isActive && (
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#4ade80]" />
                    )}
                  </div>

                  <p className="line-clamp-3 text-xs font-medium leading-relaxed text-gray-400">
                    {blog.content || 'No description provided.'}
                  </p>

                  <div className="pt-4 flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                      {formatDistanceToNow(new Date(blog.createdAt), {
                        addSuffix: true,
                      }).toUpperCase()}
                    </span>

                    <button
                      onClick={() => setSelectedBlog(blog)}
                      className="flex items-center gap-2 font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold transition-colors hover:text-white"
                    >
                      View Blog <span className="text-xs">→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {blogs.length > 6 && (
            <div className="flex justify-center mt-12">
              <button
                onClick={toggleMoreBlogs}
                className="rounded-2xl border border-brand-gold/30 bg-brand-gold/10 px-12 py-4 font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold-light transition-all hover:bg-brand-gold/20 hover:text-white active:scale-95"
              >
                {visibleBlogs === 6 ? 'Expand Data' : 'Collapse Data'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
            No system updates found.
          </p>
        </div>
      )}

      {selectedBlog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-2xl rounded-3xl border border-brand-gold/20 bg-gradient-to-br from-brand-dark-base via-brand-dark-elevated to-black p-10 shadow-[0_0_40px_rgba(212,175,55,0.12)]">
            {/* Close Button */}
            <motion.button
              onClick={() => setSelectedBlog(null)}
              className="absolute -right-4 -top-4 rounded-2xl border border-white/15 bg-black/40 p-3 text-gray-400 shadow-2xl transition-all duration-200 hover:border-brand-gold/40 hover:text-brand-gold"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close"
            >
              <FaTimes className="w-5 h-5" />
            </motion.button>

            {/* Blog Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">
                  Official Blog
                </span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  ID: {selectedBlog._id.toUpperCase()}
                </span>
              </div>
              <h2 className="text-3xl font-black text-white font-spaceGrotesk uppercase tracking-tighter leading-tight">
                {selectedBlog.title}
              </h2>
              <div className="h-px bg-white/5" />
              <p className="max-h-[50vh] overflow-y-auto pr-4 text-sm font-medium leading-relaxed text-gray-300 scrollbar-hide">
                {selectedBlog.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default NetBlog;
