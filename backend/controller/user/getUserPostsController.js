import CommunityPost from "../../models/CommunityPost.js";

const getUserPostsController = async (req, res) => {
  if (!req.userId && !(req.user && req.user._id)) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized! Please login to view your posts.",
    });
  }

  const userId = req.userId || req.user._id;

  try {
    const posts = await CommunityPost.find({ userId })
      .populate('userId', 'name profilePic')
      .populate('content.userId', 'name profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch your posts",
    });
  }
};

export default getUserPostsController;
