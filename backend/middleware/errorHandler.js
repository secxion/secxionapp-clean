// Centralized error handling middleware for Express
module.exports = function errorHandler(err, req, res, next) {
  // Log the error (could be enhanced to use a logger)
  console.error(err);

  // Set default status code and message
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose/MongoDB errors
  if (err.name === "ValidationError") {
    status = 400;
    message = err.message;
  } else if (err.name === "MongoError") {
    status = 500;
    message = "Database Error";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID format";
  }

  // JWT errors
  if (err.name === "UnauthorizedError" || err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid or expired token";
  } else if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }

  // Send error response
  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
