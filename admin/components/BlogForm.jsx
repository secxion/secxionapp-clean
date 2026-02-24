import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import SummaryApi from '../common';

const BlogForm = ({ onClose, fetchBlogs, editingBlog }) => {
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingBlog && editingBlog._id) {
      setFormData({
        title: editingBlog.title || '',
        content: editingBlog.content || '',
      });
    }
  }, [editingBlog]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const url = editingBlog
      ? `${SummaryApi.updateBlog.url}/${editingBlog._id}`
      : SummaryApi.createBlog.url;
    const method = editingBlog ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit the form');

      toast.success(editingBlog ? 'Blog updated!' : 'Blog created!');
      fetchBlogs();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl max-w-lg w-full shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h3 className="text-lg font-bold text-white">
            {editingBlog ? 'Edit Blog' : 'Create Blog'}
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-xs text-slate-400 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50"
              placeholder="Enter blog title"
              required
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-xs text-slate-400 mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 resize-none"
              placeholder="Write your blog content..."
              required
            />
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:border-yellow-500/50 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-slate-900 font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Submitting...'
                : editingBlog
                  ? 'Update Blog'
                  : 'Create Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;
