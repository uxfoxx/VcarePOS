const { logRequestTimeout } = require('../utils/logger');

/**
 * Middleware to handle request timeouts
 * @param {number} timeoutMs - Timeout duration in milliseconds (default: 60000ms = 60s)
 */
const timeoutMiddleware = (timeoutMs = 60000) => {
  return (req, res, next) => {
    // Set a timeout for the request
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        // Log the timeout with detailed context
        logRequestTimeout(req, timeoutMs);
        
        // Send timeout response
        res.status(408).json({
          error: true,
          message: 'Request timeout',
          timeout: true,
          timeoutMs,
          requestId: req.requestId
        });
      }
    }, timeoutMs);

    // Clear timeout when response is finished
    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    // Clear timeout when response is closed
    res.on('close', () => {
      clearTimeout(timeoutId);
    });

    next();
  };
};

/**
 * Middleware specifically for file upload endpoints with longer timeout
 * @param {number} timeoutMs - Timeout duration in milliseconds (default: 120000ms = 2min)
 */
const uploadTimeoutMiddleware = (timeoutMs = 120000) => {
  return timeoutMiddleware(timeoutMs);
};

/**
 * Middleware for database-heavy operations with longer timeout
 * @param {number} timeoutMs - Timeout duration in milliseconds (default: 90000ms = 1.5min)
 */
const dbTimeoutMiddleware = (timeoutMs = 90000) => {
  return timeoutMiddleware(timeoutMs);
};

module.exports = {
  timeoutMiddleware,
  uploadTimeoutMiddleware,
  dbTimeoutMiddleware
};
