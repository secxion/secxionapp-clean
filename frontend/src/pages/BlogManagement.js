import React, { useEffect, useState, useContext } from 'react';
import BlogForm from '../Components/BlogForm';
import BlogCard from '../Components/BlogCard';
import SummaryApi from '../common';
import Context from '../Context';
import { toast } from 'react-toastify';
import { FaPenAlt, FaPlus } from 'react-icons/fa';

const BlogManagement = () => {
  const { fetchBlogs, blogs } = useContext(Context);
  const [isCreating, setIsCreating] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleCreateBlog = () => {
    setIsCreating(true);
    setEditingBlog(null);
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setIsCreating(true);
  };

  const handleDeleteBlog = async (id) => {
    try {
      const response = await fetch(`${SummaryApi.deleteBlog.url}/${id}`, {
        method: SummaryApi.deleteBlog.method,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      if (responseData.success) {
        await fetchBlogs();
        toast.success('Blog deleted successfully!');
      } else {
        toast.success('Blog deleted successfully!');
      }
    } catch (error) {
      toast.error('Failed to delete the blog. Please try again.');
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl border border-brand-gold/20 bg-brand-gold/10 p-2 shadow-[0_0_14px_rgba(212,175,55,0.14)]">
            <FaPenAlt className="text-brand-gold text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-spaceGrotesk font-bold uppercase tracking-wide text-white">
              Blog Management
            </h1>
            <p className="text-sm text-gray-400">
              Create and manage system blog posts
            </p>
          </div>
        </div>
        <button
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-4 py-2 font-medium text-brand-dark-base transition-colors hover:bg-brand-gold-light"
          onClick={handleCreateBlog}
        >
          <FaPlus /> Create Blog
        </button>
      </div>

      {isCreating && (
        <BlogForm
          onClose={() => setIsCreating(false)}
          fetchBlogs={fetchBlogs}
          editingBlog={editingBlog}
        />
      )}

      {blogs && blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onEdit={handleEditBlog}
              onDelete={handleDeleteBlog}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <FaPenAlt className="text-4xl mb-3" />
          <p className="font-spaceGrotesk text-xs font-bold uppercase tracking-widest">
            No Blogs Available.
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
