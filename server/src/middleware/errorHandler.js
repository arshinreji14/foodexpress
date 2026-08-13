class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Internal server error";

  if (!err.statusCode) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: message,
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = { ApiError, errorHandler };
