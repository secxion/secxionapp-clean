import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authToken = async (req, res, next) => {
  const startTime = Date.now();
  try {
    // Check for token in cookies first, then Authorization header
    let token = req.cookies?.token;
    
    // If no cookie token, check Authorization header (for cross-origin admin panel)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
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
    const authDuration = Date.now() - startTime;
    const isJwtIssue =
      err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError";

    if (isJwtIssue) {
      // Clear bad token cookie so client can re-auth cleanly.
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      console.warn("[AUTH] Invalid token:", err.message, "after", authDuration, "ms");
      return res.status(401).json({
        message: "Session expired or invalid. Please login again.",
        error: true,
        success: false,
      });
    }

    console.error("[AUTH] Error:", err.message, "after", authDuration, "ms");
    return res.status(500).json({
      message: "Authentication error",
      error: true,
      success: false,
    });
  }
};

export default authToken;
