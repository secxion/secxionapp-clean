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
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-gradient-to-br from-brand-dark-base via-brand-dark-elevated to-black shadow-[0_0_36px_rgba(0,0,0,0.35)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h3 className="font-spaceGrotesk text-lg font-bold uppercase tracking-wide text-white">
            {editingBlog ? 'Edit Blog' : 'Create Blog'}
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-brand-gold disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-xs font-spaceGrotesk uppercase tracking-widest text-gray-400"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-white placeholder-gray-600 focus:border-brand-gold/50 focus:outline-none"
              placeholder="Enter blog title"
              required
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="mb-2 block text-xs font-spaceGrotesk uppercase tracking-widest text-gray-400"
            >
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              className="w-full resize-none rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-white placeholder-gray-600 focus:border-brand-gold/50 focus:outline-none"
              placeholder="Write your blog content..."
              required
            />
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-gray-300 transition-colors hover:border-brand-gold/40 hover:text-white disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-gold px-4 py-2 font-medium text-brand-dark-base transition-colors hover:bg-brand-gold-light disabled:cursor-not-allowed disabled:opacity-50"
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
