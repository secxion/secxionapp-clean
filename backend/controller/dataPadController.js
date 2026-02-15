import DataPad from "../models/dataPad.js";

export const getAllDataPads = async (req, res) => {
  try {
    // Use populate instead of N+1 queries for user details
    const allDataPads = await DataPad.find()
      .populate("userId", "name email profilePic")
      .sort({ createdAt: -1 })
      .lean();

    // Transform to match the expected format
    const dataPadsWithUserDetails = allDataPads.map((entry) => ({
      ...entry,
      userDetails: entry.userId,
      userId: entry.userId?._id || entry.userId,
    }));

    res.json({
      message: "Fetched all DataPad entries successfully",
      success: true,
      error: false,
      data: dataPadsWithUserDetails,
    });
  } catch (err) {
    console.error("Error fetching DataPad entries:", err);
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

export const createDataPad = async (req, res) => {
  try {
    const { title, content, media, tags } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
        error: true,
        success: false,
      });
    }

    if (!title && !content && !media) {
      return res.status(400).json({
        message: "Cannot create an empty DataPad entry",
        error: true,
        success: false,
      });
    }

    const newEntry = new DataPad({
      userId,
      title,
      content,
      media,
      tags: tags || [],
    });

    await newEntry.save();

    res.json({
      message: "DataPad entry created successfully",
      success: true,
      error: false,
      data: newEntry,
    });
  } catch (err) {
    console.error("Error creating DataPad entry:", err);
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

export const updateDataPad = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, media, tags } = req.body;
    const userId = req.userId;

    const dataPad = await DataPad.findById(id);

    if (!dataPad) {
      return res.status(404).json({
        message: "DataPad entry not found",
        error: true,
        success: false,
      });
    }

    if (dataPad.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized: You can only edit your own Data entries",
        error: true,
        success: false,
      });
    }

    const updatedEntry = await DataPad.findByIdAndUpdate(
      id,
      { title, content, media, tags: tags || [] },
      { new: true },
    );

    res.json({
      message: "DataPad entry updated successfully",
      success: true,
      error: false,
      data: updatedEntry,
    });
  } catch (err) {
    console.error("Error updating DataPad entry:", err);
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

export const deleteDataPad = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const dataPad = await DataPad.findById(id);

    if (!dataPad) {
      return res.status(404).json({
        message: "Data not found",
        error: true,
        success: false,
      });
    }

    if (dataPad.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized: You can only delete your own Data entries",
        error: true,
        success: false,
      });
    }

    await DataPad.findByIdAndDelete(id);

    res.json({
      message: "Data deleted successfully",
      success: true,
      error: false,
    });
  } catch (err) {
    console.error("Error deleting Data:", err);
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};
