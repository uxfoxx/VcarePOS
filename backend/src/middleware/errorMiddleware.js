const { logger } = require('../utils/logger');

/**
 * Global error handler for Express
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Create a shorter error identifier
  const errorId = `err_${Date.now().toString(36)}`;
  
  // Log error with essential information only
  logger.error(`Error [${errorId}]: ${err.message}`, {
    id: errorId,
    url: req.originalUrl,
    method: req.method,
    code: statusCode,
    userId: req.user?.id,
    stack: err.stack
  });
  
  res.status(statusCode).json({
    error: true,
    message: err.message,
    errorId, // Include error ID so it can be referenced in logs
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

/**
 * Middleware for handling 404 errors
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  
  // Simple log for 404 errors
  logger.warn(`404: ${req.method} ${req.originalUrl}`, {
    ip: req.ip
  });
  
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
