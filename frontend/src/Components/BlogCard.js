import React from "react";

const BlogCard = ({ blog, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      onDelete(blog._id);
    }
  };

  return (
    <div className="container bg-white p-4 rounded-lg shadow-md w-full max-w-xs transition-all hover:shadow-lg">
      <h4 className="font-semibold text-lg truncate">{blog.title}</h4>
      <p className="text-gray-600 text-sm line-clamp-2">
        {blog.content.length > 100 ? `${blog.content.substring(0, 100)}...` : blog.content}
      </p>
      <div className="flex justify-between mt-4">
        <button 
          onClick={() => onEdit(blog)} 
          className="text-blue-500 hover:text-blue-700 transition"
          aria-label="Edit blog"
        >
          Edit
        </button>
        <button 
          onClick={handleDelete} 
          className="text-red-500 hover:text-red-700 transition"
          aria-label="Delete blog"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default BlogCard;
