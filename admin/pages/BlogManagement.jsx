
import React, { useEffect, useState, useContext } from 'react';
import BlogForm from '../components/BlogForm.jsx';
import BlogCard from '../components/BlogCard.jsx';
import SummaryApi from '../common';
import Context from '../Context/index.jsx';
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
    <div className="min-h-screen bg-gray-900 px-4 py-8 lg:px-16 lg:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-500/20 rounded-xl">
            <FaPenAlt className="text-yellow-500 text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Blog Management</h1>
            <p className="text-slate-400 text-base mt-1">
              Create and manage system blog posts
            </p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg shadow hover:bg-yellow-400 transition-colors text-lg"
          onClick={handleCreateBlog}
        >
          <FaPlus /> Create Blog
        </button>
      </div>

      {isCreating && (
        <div className="mb-8">
          <BlogForm
            onClose={() => setIsCreating(false)}
            fetchBlogs={fetchBlogs}
            editingBlog={editingBlog}
          />
        </div>
      )}

      {blogs && blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <FaPenAlt className="text-5xl mb-4" />
          <p className="text-xl">No Blogs Available.</p>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;