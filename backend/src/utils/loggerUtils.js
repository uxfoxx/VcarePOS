/**
 * Enhanced logging utilities for the VcarePOS backend
 */
const { logger, maskSensitiveData, createChildLogger } = require('./logger');
const os = require('os');
const process = require('process');

// Create component-specific loggers
const dbLogger = createChildLogger('database');
const authLogger = createChildLogger('authentication');
const apiLogger = createChildLogger('api');
const systemLogger = createChildLogger('system');

/**
 * Log API request details for debugging
 * @param {Object} req - Express request object 
 * @param {String} context - Context information about where this log is coming from
 */
const logRequestDetails = (req, context = 'API') => {
  apiLogger.debug(`${context} Request Details:`, {
    requestId: req.requestId || 'unknown',
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: maskSensitiveData(req.query),
    body: maskSensitiveData(req.body),
    headers: {
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type'],
      acceptLanguage: req.headers['accept-language'],
      authorization: req.headers.authorization ? 'Present (redacted)' : 'None'
    },
    user: req.user ? { id: req.user.id, role: req.user.role } : 'unauthenticated',
    sessionId: req.sessionID || 'unknown'
  });
};

/**
 * Log database query details for debugging
 * @param {String} query - SQL query or database operation description 
 * @param {Object} params - Parameters passed to the query
 * @param {String} context - Additional context about the operation
 * @param {Object} options - Additional options (e.g., duration, success)
 */
const logDatabaseOperation = (query, params = {}, context = 'Database', options = {}) => {
  // Only log detailed params in debug mode
  const includeParams = process.env.LOG_LEVEL === 'debug';
  
  // Default log level based on success/failure
  const level = options.error ? 'error' : (options.warn ? 'warn' : 'debug');
  
  // Get the operation type from the query (SELECT, INSERT, etc.)
  const operation = query.trim().split(' ')[0].toUpperCase();
  
  // Create a more concise message
  let message;
  
  if (options.error) {
    message = `DB Error [${operation}]: ${options.error.message}`;
  } else if (options.duration) {
    // For successful queries, include duration
    message = `DB ${operation} ${options.duration}ms`;
    if (options.rowCount !== undefined) {
      message += ` (${options.rowCount} rows)`;
    }
  } else {
    message = `DB ${operation}`;
  }
  
  // Create minimal log metadata
  const logMeta = {
    duration: options.duration
  };
  
  // Only include query details in debug mode or on errors
  if (level === 'debug' || level === 'error') {
    // Truncate the query if it's too long
    logMeta.query = query.replace(/\s+/g, ' ').trim().substring(0, 100);
    
    // Include parameters only if explicitly asked for
    if (includeParams) {
      logMeta.params = maskSensitiveData(params);
    }
  }
  
  // Include error information for error logs
  if (options.error) {
    logMeta.error = options.error.message;
  }
  
  // Log the operation
  dbLogger[level](message, logMeta);
  
  // Separate log for slow queries at warn level
  if (!options.error && options.duration && options.duration > 1000) {
    dbLogger.warn(`Slow query: ${options.duration}ms ${operation}`, {
      duration: options.duration,
      query: query.replace(/\s+/g, ' ').trim().substring(0, 100)
    });
  }
};

/**
 * Log authentication events
 * @param {String} userId - User ID attempting authentication
 * @param {Boolean} success - Whether authentication was successful
 * @param {String} method - Authentication method used
 * @param {Object} metadata - Additional information
 */
const logAuthEvent = (userId, success, method = 'password', metadata = {}) => {
  const level = success ? 'info' : 'warn';
  
  // Create a more concise message
  const message = success 
    ? `Auth success: ${userId}` 
    : `Auth failed: ${userId} (${metadata.reason || 'unknown reason'})`;
  
  // Only include essential metadata
  const logMeta = {
    success,
    ip: metadata.ip
  };
  
  // Add reason only if authentication failed
  if (!success && metadata.reason) {
    logMeta.reason = metadata.reason;
  }
  
  authLogger[level](message, logMeta);
};

/**
 * Log system metrics for monitoring
 * @param {Boolean} detailed - Whether to log detailed metrics
 */
const logSystemMetrics = (detailed = false) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  // Simple metrics for regular logging
  const metrics = {
    uptime: formatUptime(uptime),
    memory: `${formatBytes(memoryUsage.heapUsed)}/${formatBytes(memoryUsage.heapTotal)}`,
    cpu: `user:${Math.round(process.cpuUsage().user/1000)}ms sys:${Math.round(process.cpuUsage().system/1000)}ms`
  };
  
  // Only add detailed metrics when explicitly requested
  if (detailed) {
    metrics.memoryDetailed = {
      rss: formatBytes(memoryUsage.rss),
      heapTotal: formatBytes(memoryUsage.heapTotal),
      heapUsed: formatBytes(memoryUsage.heapUsed),
      external: formatBytes(memoryUsage.external)
    };
    
    metrics.os = {
      platform: process.platform,
      loadavg: os.loadavg().map(v => v.toFixed(2)),
      freemem: formatBytes(os.freemem()),
      totalmem: formatBytes(os.totalmem()),
      cpus: os.cpus().length
    };
  }
  
  systemLogger.info(`System status: up ${metrics.uptime}, mem ${metrics.memory}`, metrics);
  return metrics;
};

/**
 * Log an error with full details
 * @param {Error} error - The error object
 * @param {String} context - Additional context about where the error occurred
 * @param {Object} metadata - Any additional data to include
 */
const logError = (error, context = 'General', metadata = {}) => {
  const errorLogger = createChildLogger(context.toLowerCase());
  
  errorLogger.error(`Error in ${context}: ${error.message}`, {
    error: error.message,
    stack: error.stack,
    code: error.code,
    ...metadata,
    timestamp: new Date().toISOString()
  });
};

/**
 * Format bytes to a human-readable string
 * @param {Number} bytes - The number of bytes
 * @returns {String} - Formatted string (e.g., "1.23 MB")
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format uptime to a human-readable string
 * @param {Number} seconds - Uptime in seconds
 * @returns {String} - Formatted string (e.g., "1d 2h 3m 4s")
 */
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  
  return parts.join(' ');
};

/**
 * Create a timer for measuring operation duration
 * @returns {Object} - Timer object with stop method
 */
const createTimer = () => {
  const start = process.hrtime();
  
  return {
    stop: () => {
      const diff = process.hrtime(start);
      return Math.round((diff[0] * 1e3) + (diff[1] / 1e6)); // Return milliseconds
    }
  };
};

/**
 * Enhanced error handler for routes
 * @param {Error} error - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} context - Context about where the error occurred
 * @param {number} statusCode - HTTP status code to return (default: 500)
 */
const handleRouteError = (error, req, res, context = 'Route', statusCode = 500) => {
  // Generate error ID
  const errorId = `err_${Date.now().toString(36)}`;
  
  // Log the error with full context
  const errorDetails = {
    id: errorId,
    requestFailure: true,
    reqId: req.requestId,
    context,
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get ? req.get('User-Agent') : undefined,
    user: req.user ? { 
      id: req.user.id, 
      role: req.user.role,
      email: req.user.email 
    } : null,
    requestBody: maskSensitiveData(req.body),
    queryParams: maskSensitiveData(req.query),
    routeParams: req.params,
    timestamp: new Date().toISOString()
  };

  logger.error(`${context} Error [${errorId}]: ${error.message}`, errorDetails);
  
  // Send error response
  res.status(statusCode).json({
    error: true,
    message: process.env.NODE_ENV === 'production' ? 'Server error' : error.message,
    errorId,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
  });
  
  return errorId;
};

/**
 * Create an async error wrapper for route handlers
 * @param {Function} fn - Async route handler function
 * @param {string} context - Context for error logging
 */
const asyncHandler = (fn, context = 'Route') => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      handleRouteError(error, req, res, context);
    });
  };
};

module.exports = {
  logRequestDetails,
  logDatabaseOperation,
  logAuthEvent,
  logSystemMetrics,
  logError,
  createTimer,
  handleRouteError,
  asyncHandler,
  dbLogger,
  authLogger,
  apiLogger,
  systemLogger
};
