import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log the error
  logger.error(
    `${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  if (err.stack) {
    logger.error(err.stack);
  }

  // Send response — hide internal error details in production
  const isProduction = process.env.NODE_ENV === "production";
  res.status(err.statusCode).json({
    status: err.status,
    message:
      isProduction && !err.isOperational
        ? "An unexpected error occurred"
        : err.message,
    stack: !isProduction ? err.stack : undefined,
  });
};

export default errorHandler;
