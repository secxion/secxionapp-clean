import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authToken = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const token = req.cookies?.token;

    if (!token) {
      console.warn("[AUTH] No token found in cookies");
      return res.status(401).json({
        message: "Please login to continue.",
        error: true,
        success: false,
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    console.log("[AUTH] Token verified in", Date.now() - startTime, "ms");

    // Set userId
    req.userId = decoded?._id;

    // Fetch full user info (excluding password)
    const dbStartTime = Date.now();
    const user = await User.findById(decoded._id).select("-password");
    const dbTime = Date.now() - dbStartTime;
    console.log("[AUTH] User lookup took", dbTime, "ms");

    if (!user) {
      console.warn("[AUTH] User not found for ID:", decoded._id);
      return res.status(401).json({
        message: "User not found.",
        error: true,
        success: false,
      });
    }

    // Attach full user to req.user
    req.user = user;

    console.log(
      "[AUTH] Complete auth check took",
      Date.now() - startTime,
      "ms",
    );
    next();
  } catch (err) {
    console.error(
      "[AUTH] Error:",
      err.message,
      "after",
      Date.now() - startTime,
      "ms",
    );
    return res.status(400).json({
      message: err.message || "Authentication error",
      error: true,
      success: false,
    });
  }
};

export default authToken;
