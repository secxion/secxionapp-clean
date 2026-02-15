import LiveScript from "../models/liveScriptModel.js";

// Create a new LiveScript request (user)
export const createLiveScriptRequest = async (req, res, next) => {
  try {
    const { title, description, category, budget, urgency } = req.body;
    const userId = req.userId;

    if (!title || !description) {
      const err = new Error("Title and description are required.");
      err.status = 400;
      throw err;
    }

    // Get user info from request (set by authToken middleware)
    const user = req.user;
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      throw err;
    }

    const newRequest = new LiveScript({
      userId,
      userName: user.name,
      userEmail: user.email,
      title,
      description,
      category: category || "other",
      budget: budget || "negotiable",
      urgency: urgency || "medium",
    });

    const savedRequest = await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Your custom development request has been submitted successfully! Our team will review it shortly.",
      data: savedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's own LiveScript requests
export const getUserLiveScriptRequests = async (req, res, next) => {
  try {
    const userId = req.userId;

    const requests = await LiveScript.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// Get single LiveScript request by ID (user - only their own)
export const getLiveScriptRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const request = await LiveScript.findOne({ _id: id, userId });

    if (!request) {
      const err = new Error("Request not found.");
      err.status = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user's own LiveScript request (only if pending)
export const deleteLiveScriptRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const request = await LiveScript.findOne({ _id: id, userId });

    if (!request) {
      const err = new Error("Request not found.");
      err.status = 404;
      throw err;
    }

    if (request.status !== "pending") {
      const err = new Error("Cannot delete a request that is already being processed.");
      err.status = 400;
      throw err;
    }

    await LiveScript.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Request deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ========== ADMIN FUNCTIONS ==========

// Get all LiveScript requests (admin)
export const getAllLiveScriptRequests = async (req, res, next) => {
  try {
    const requests = await LiveScript.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// Update LiveScript request status (admin)
export const updateLiveScriptStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ["pending", "in_review", "accepted", "in_progress", "completed", "rejected"];
    
    if (status && !validStatuses.includes(status)) {
      const err = new Error("Invalid status.");
      err.status = 400;
      throw err;
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updatedRequest = await LiveScript.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      const err = new Error("Request not found.");
      err.status = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: "Request updated successfully.",
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};
