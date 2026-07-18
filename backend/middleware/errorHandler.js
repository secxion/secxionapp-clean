// Centralized error handling middleware for API responses.
export default function errorHandler(err, req, res, next) {
  const isApiRequest = req.originalUrl?.startsWith("/api");

  if (!isApiRequest) {
    return next(err);
  }

  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    status = 400;
    message = err.message;
  } else if (err.name === "MongoError" || err.name === "MongoServerError") {
    status = 500;
    message = "Database Error";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID format";
  }

  if (err.name === "UnauthorizedError" || err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid or expired token";
  } else if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }

  console.error("❌ API Error:", {
    status,
    message,
    path: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Always ensure we return JSON for API requests or when explicitly requested
  const acceptsJson = req.headers.accept?.includes("application/json") || isApiRequest;

  if (acceptsJson || !res.headersSent) {
    return res.status(status).json({
      success: false,
      status,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Fallback for non-JSON requests if headers not sent
  return res.status(status).send(message);
}
