import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SummaryApi from "../common";

const BlogForm = ({ onClose, fetchBlogs, editingBlog }) => {
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingBlog && editingBlog._id) {
      setFormData({ title: editingBlog.title || "", content: editingBlog.content || "" });
    }
  }, [editingBlog]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    const url = editingBlog ? `${SummaryApi.updateBlog.url}/${editingBlog._id}` : SummaryApi.createBlog.url;
    const method = editingBlog ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit the form");

      toast.success(editingBlog ? "Blog updated!" : "Blog created!");
      fetchBlogs();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container bg-white p-5 rounded-lg shadow-md mb-4">
      <h3 className="font-bold text-lg mb-3">{editingBlog ? "Edit Blog" : "Create Blog"}</h3>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block font-medium mb-1">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
            required
            aria-label="Blog title"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block font-medium mb-1">Content:</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="4"
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
            required
            aria-label="Blog content"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : editingBlog ? "Update Blog" : "Create Blog"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
