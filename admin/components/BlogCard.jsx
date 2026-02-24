import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const BlogCard = ({ blog, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      onDelete(blog._id);
    }
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-yellow-500/30 transition-all">
      <h4 className="font-semibold text-lg text-white truncate mb-2">
        {blog.title}
      </h4>
      <p className="text-slate-400 text-sm line-clamp-3 mb-4">
        {blog.content.length > 100
          ? `${blog.content.substring(0, 100)}...`
          : blog.content}
      </p>
      <div className="flex justify-between gap-2">
        <button
          onClick={() => onEdit(blog)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm hover:border-yellow-500/50 transition-colors"
        >
          <FaEdit className="text-yellow-500" /> Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm hover:bg-red-500/20 transition-colors"
        >
          <FaTrash /> Delete
        </button>
      </div>
    </div>
  );
};

export default BlogCard;
