import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const authToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Please login to continue.",
        error: true,
        success: false,
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    // Set userId
    req.userId = decoded?._id;

    // Fetch full user info (excluding password)
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
        error: true,
        success: false,
      });
    }

    // Attach full user to req.user
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(400).json({
      message: err.message || "Authentication error",
      error: true,
      success: false,
    });
  }
};

export default authToken;
