import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authToken = async (req, res, next) => {
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

    // Treat placeholder bearer values as missing tokens
    if (token === 'null' || token === 'undefined' || token === '') {
      token = null;
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

    // Set userId
    req.userId = decoded?._id;

    // Fetch full user info (excluding password)
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      console.warn("[AUTH] User not found during auth");
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
    const isJwtIssue =
      err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError";

    if (isJwtIssue) {
      const isProduction = process.env.NODE_ENV === "production";

      // Clear bad token cookie so client can re-auth cleanly.
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        path: "/",
      });

      console.warn("[AUTH] Invalid or expired token");
      return res.status(401).json({
        message: "Session expired or invalid. Please login again.",
        error: true,
        success: false,
      });
    }

    console.error("[AUTH] Authentication middleware error");
    return res.status(500).json({
      message: "Authentication error",
      error: true,
      success: false,
    });
  }
};

export default authToken;
