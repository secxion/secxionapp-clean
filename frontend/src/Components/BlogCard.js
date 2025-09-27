import React from "react";

const BlogCard = ({ blog, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      onDelete(blog._id);
    }
  };

  return (
    <div className="container p-4 rounded-lg shadow-neon w-full max-w-xs transition-all hover:shadow-lg bg-gradient-to-br from-neon-purple via-neon-blue to-neon-pink text-neon-white">
      <h4 className="font-semibold text-lg truncate neon-heading">{blog.title}</h4>
      <p className="text-neon-white text-sm line-clamp-2">
        {blog.content.length > 100 ? `${blog.content.substring(0, 100)}...` : blog.content}
      </p>
      <div className="flex justify-between mt-4">
        <button 
          onClick={() => onEdit(blog)} 
          className="neon-btn px-3 py-1 text-sm font-semibold"
          aria-label="Edit blog"
        >
          Edit
        </button>
        <button 
          onClick={handleDelete} 
          className="neon-btn px-3 py-1 text-sm font-semibold bg-gradient-to-r from-neon-pink to-neon-purple"
          aria-label="Delete blog"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default BlogCard;
