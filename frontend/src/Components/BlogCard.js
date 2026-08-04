import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const BlogCard = ({ blog, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      onDelete(blog._id);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-dark-elevated/70 via-brand-dark-base/70 to-black/30 p-4 shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all hover:border-brand-gold/30 hover:shadow-[0_0_26px_rgba(212,175,55,0.12)]">
      <h4 className="mb-2 truncate font-spaceGrotesk text-lg font-semibold text-white">
        {blog.title}
      </h4>
      <p className="mb-4 line-clamp-3 text-sm text-gray-400">
        {blog.content.length > 100
          ? `${blog.content.substring(0, 100)}...`
          : blog.content}
      </p>
      <div className="flex justify-between gap-2">
        <button
          onClick={() => onEdit(blog)}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-brand-gold/40 hover:text-white"
        >
          <FaEdit className="text-brand-gold" /> Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300 transition-colors hover:bg-rose-500/20"
        >
          <FaTrash /> Delete
        </button>
      </div>
    </div>
  );
};

export default BlogCard;
