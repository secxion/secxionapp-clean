import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * Security Middleware Suite
 * - CSRF Protection
 * - Rate Limiting
 * - Token Refresh
 */

// ============================================
// CSRF PROTECTION MIDDLEWARE
// ============================================

export const csrfProtection = (req, res, next) => {
  // Generate CSRF token if not present
  let csrfToken =
    req.headers["x-csrf-token"] || req.body?.csrfToken || req.query?.csrfToken;

  // If no token provided, generate a new one
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString("hex");
  }

  // Store token in response locals for this request
  res.locals.csrfToken = csrfToken;
  res.setHeader("X-CSRF-Token", csrfToken);

  // Skip CSRF verification for GET requests
  if (req.method === "GET") {
    return next();
  }

  // For POST/PUT/DELETE/PATCH, token must be in header
  const tokenFromHeader = req.headers["x-csrf-token"];

  if (!tokenFromHeader) {
    logger.logError(
      "CSRF",
      "CSRF token validation failed - no token in header",
      null,
      {
        userId: req.user?.id,
        endpoint: req.originalUrl,
        method: req.method,
      },
    );

    return res.status(403).json({
      success: false,
      message: "CSRF token validation failed",
      code: "CSRF_VALIDATION_FAILED",
    });
  }

  next();
};

// ============================================
// RATE LIMITING MIDDLEWARE
// ============================================

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/health";
  },
  handler: (req, res) => {
    logger.logError("RATE_LIMIT", "Rate limit exceeded", null, {
      ip: req.ip,
      endpoint: req.originalUrl,
      userId: req.user?.id,
    });

    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logAuth("LOGIN_ATTEMPT", "BRUTE_FORCE", "blocked", {
      ip: req.ip,
      email: req.body?.email,
      attempts: req.rateLimit.current,
    });

    res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again in 15 minutes.",
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

// Moderate rate limiter for signup
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 signup attempts per hour
  message: "Too many accounts created for this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logError("SIGNUP_RATE_LIMIT", "Signup rate limit exceeded", null, {
      ip: req.ip,
      email: req.body?.email,
    });

    res.status(429).json({
      success: false,
      message: "Too many signup attempts. Please try again in 1 hour.",
      code: "SIGNUP_RATE_LIMIT_EXCEEDED",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

// Rate limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 reset requests per hour
  message: "Too many password reset attempts.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logError(
      "PASSWORD_RESET_LIMIT",
      "Password reset rate limit exceeded",
      null,
      {
        ip: req.ip,
        email: req.body?.email,
      },
    );

    res.status(429).json({
      success: false,
      message: "Too many password reset attempts. Please try again in 1 hour.",
      code: "PASSWORD_RESET_RATE_LIMIT_EXCEEDED",
    });
  },
});

// ============================================
// TOKEN REFRESH MECHANISM
// ============================================

// Store refresh tokens in memory (in production, use Redis or database)
let refreshTokens = new Map();

/**
 * Generate new access token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} role - User role
 * @returns {string} JWT access token
 */
export const generateAccessToken = (userId, email, role = "GENERAL") => {
  const token = jwt.sign(
    {
      userId,
      email,
      role,
      type: "access",
    },
    process.env.TOKEN_SECRET_KEY,
    {
      expiresIn: "15m", // Short-lived access token
      issuer: "secxion",
      audience: "secxion-app",
    },
  );

  return token;
};

/**
 * Generate new refresh token
 * @param {string} userId - User ID
 * @returns {object} Refresh token and expiry
 */
export const generateRefreshToken = (userId) => {
  const tokenId = crypto.randomBytes(32).toString("hex");

  const token = jwt.sign(
    {
      userId,
      tokenId,
      type: "refresh",
    },
    process.env.TOKEN_SECRET_KEY,
    {
      expiresIn: "7d", // Long-lived refresh token
      issuer: "secxion",
      audience: "secxion-app",
    },
  );

  // Store refresh token with metadata
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  refreshTokens.set(tokenId, {
    userId,
    token,
    createdAt: new Date(),
    expiresAt,
    isRevoked: false,
  });

  logger.logAuth("REFRESH_TOKEN_GENERATED", userId, "success", { tokenId });

  return {
    refreshToken: token,
    expiresAt,
    expiresIn: "7d",
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.TOKEN_SECRET_KEY, {
      issuer: "secxion",
      audience: "secxion-app",
    });

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    // Check if token is revoked
    const storedToken = refreshTokens.get(decoded.tokenId);
    if (!storedToken || storedToken.isRevoked) {
      throw new Error("Refresh token has been revoked");
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      refreshTokens.delete(decoded.tokenId);
      throw new Error("Refresh token has expired");
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.userId, null, "GENERAL");

    logger.logAuth("TOKEN_REFRESHED", decoded.userId, "success", {
      tokenId: decoded.tokenId,
    });

    return {
      accessToken: newAccessToken,
      expiresIn: "15m",
    };
  } catch (error) {
    logger.logError("REFRESH_TOKEN", "Token refresh failed", error, {
      error: error.message,
    });

    throw {
      code: "INVALID_REFRESH_TOKEN",
      message: "Refresh token is invalid or expired",
    };
  }
};

/**
 * Revoke refresh token (logout)
 */
export const revokeRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.TOKEN_SECRET_KEY);

    const storedToken = refreshTokens.get(decoded.tokenId);
    if (storedToken) {
      storedToken.isRevoked = true;
      storedToken.revokedAt = new Date();
      logger.logAuth("TOKEN_REVOKED", decoded.userId, "success");
    }
  } catch (error) {
    logger.logError("REVOKE_TOKEN", "Failed to revoke token", error);
  }
};

/**
 * Cleanup expired refresh tokens (call periodically)
 */
export const cleanupExpiredTokens = () => {
  const now = new Date();
  let count = 0;

  for (const [tokenId, token] of refreshTokens.entries()) {
    if (now > token.expiresAt) {
      refreshTokens.delete(tokenId);
      count++;
    }
  }

  if (count > 0) {
    logger.info(`[TOKEN_CLEANUP] Removed ${count} expired refresh tokens`);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

export default {
  csrfProtection,
  apiLimiter,
  authLimiter,
  signupLimiter,
  passwordResetLimiter,
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  revokeRefreshToken,
  cleanupExpiredTokens,
};
