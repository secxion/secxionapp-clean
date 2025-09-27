import BlogNote from "../models/systemBlogModel.js";

export const createBlogNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const newNote = new BlogNote({ title, content });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    error.message = 'Could not create blog note. Please try again later.';
    next(error);
  }
};

export const getAllBlogNotes = async (req, res, next) => {
  try {
    const notes = await BlogNote.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    error.message = 'Unable to fetch blog notes at this time.';
    next(error);
  }
};

export const updateBlogNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const updatedNote = await BlogNote.findByIdAndUpdate(
      id,
      { title, content, updatedAt: Date.now() },
      { new: true }
    );
    if (!updatedNote) {
      const err = new Error('Blog note not found.');
      err.status = 404;
      return next(err);
    }
    res.status(200).json(updatedNote);
  } catch (error) {
    error.message = 'Could not update blog note. Please try again.';
    next(error);
  }
};

export const deleteBlogNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedNote = await BlogNote.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!deletedNote) {
      const err = new Error('Blog note not found.');
      err.status = 404;
      return next(err);
    }
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    error.message = 'Could not delete blog note. Please try again.';
    next(error);
  }
};
