const winston = require('winston');
const path = require('path');
const fs = require('fs');
require('winston-daily-rotate-file');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Helper function to extract essential fields and omit verbose ones
const extractEssentialFields = (meta) => {
  // Fields to always include if they exist
  const essentialFields = ['requestId', 'userId', 'method', 'url', 'statusCode', 'ip', 'error'];
  
  // Fields to exclude for brevity
  const excludeFields = ['metadata', 'stack', 'service', 'userAgent', 'timestamp', 'level'];
  
  const result = {};
  
  // Include essential fields first
  essentialFields.forEach(field => {
    if (meta[field] !== undefined) {
      result[field] = meta[field];
    }
  });
  
  // Include other fields except excluded ones
  Object.keys(meta).forEach(key => {
    if (!excludeFields.includes(key) && !essentialFields.includes(key)) {
      result[key] = meta[key];
    }
  });
  
  // Include stack only for error logs and when explicitly needed
  if (meta.stack && meta.level === 'error') {
    result.stack = meta.stack;
  }
  
  return result;
};

// Define log formats
const consoleFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message, ...meta }) => {
      // Format essential metadata for console in a readable way
      const essentialMeta = extractEssentialFields(meta);
      const metaStr = Object.keys(essentialMeta).length 
        ? ' ' + JSON.stringify(essentialMeta)
        : '';
      
      return `${timestamp} ${level}: ${message}${metaStr}`;
    }
  )
);

// Custom format to clean up JSON logs
const cleanMetadata = winston.format((info) => {
  // Remove metadata field from output
  if (info.metadata) {
    delete info.metadata;
  }
  
  // Remove service field from all logs to reduce noise
  delete info.service;
  
  return info;
});

// Format for structured JSON logs in files
const fileFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  cleanMetadata(),
  winston.format.json()
);

// Create the Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { service: 'vcare-pos-backend' },
  transports: [
    // Daily rotate error logs
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d', // keep logs for 14 days
      format: fileFormat,
      zippedArchive: true,
    }),
    // Daily rotate all logs
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // keep logs for 14 days
      format: fileFormat,
      zippedArchive: true,
    }),
    // HTTP request logs
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d', // keep HTTP logs for 7 days
      format: fileFormat,
      zippedArchive: true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d', // keep exception logs longer
      format: fileFormat,
      zippedArchive: true,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d', // keep rejection logs longer
      format: fileFormat,
      zippedArchive: true,
    }),
  ],
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

/**
 * Masks sensitive fields in objects (password, credit card, etc.)
 * @param {Object} obj - Object to mask sensitive fields in
 * @returns {Object} - Object with masked sensitive fields
 */
const maskSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Deep clone to avoid modifying the original
  const masked = JSON.parse(JSON.stringify(obj));
  
  const sensitiveFields = [
    'password', 'passwordConfirmation', 'oldPassword', 'newPassword', 
    'creditCard', 'creditCardNumber', 'cardNumber', 'cvv', 'cvc', 
    'secret', 'token', 'accessToken', 'refreshToken', 'ssn', 'socialSecurity'
  ];
  
  const maskObject = (object) => {
    if (!object || typeof object !== 'object') return;
    
    Object.keys(object).forEach(key => {
      // If it's an object, recursively mask it
      if (object[key] && typeof object[key] === 'object') {
        maskObject(object[key]);
      } 
      // If it's a sensitive field, mask it
      else if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        object[key] = '[REDACTED]';
      }
    });
  };
  
  maskObject(masked);
  return masked;
};

// Create custom logging middleware for Express
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Generate a shorter, simpler requestId
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
  
  // Attach requestId to the request object for later use
  req.requestId = requestId;
  
  // Log the incoming request with masked sensitive data only in debug mode
  if (process.env.LOG_LEVEL === 'debug') {
    logger.debug(`${req.method} ${req.originalUrl}`, {
      reqId: requestId,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip
    });
  }
  
  // Once the request is processed, log the result
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Create a concise log message
    const message = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;
    
    // Minimal log metadata for regular logs
    const logMeta = {
      reqId: requestId,
      code: res.statusCode,
      ms: duration,
      user: req.user ? req.user.id : undefined
    };
    
    // Add IP address only for suspicious requests or errors
    if (res.statusCode >= 400) {
      logMeta.ip = req.ip;
    }
    
    // Log request info with appropriate level based on status code
    if (res.statusCode >= 500) {
      logger.error(message, logMeta);
    } else if (res.statusCode >= 400) {
      logger.warn(message, logMeta);
    } else {
      logger.info(message, logMeta);
    }
  });
  
  next();
};

// Create a child logger function for specific components
const createChildLogger = (component) => {
  return {
    error: (message, meta = {}) => logger.error(message, { component, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { component, ...meta }),
    info: (message, meta = {}) => logger.info(message, { component, ...meta }),
    http: (message, meta = {}) => logger.http(message, { component, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { component, ...meta }),
  };
};

module.exports = {
  logger,
  requestLogger,
  maskSensitiveData,
  createChildLogger,
  // Convenience methods
  error: (message, meta) => logger.error(message, meta),
  warn: (message, meta) => logger.warn(message, meta),
  info: (message, meta) => logger.info(message, meta),
  http: (message, meta) => logger.http(message, meta),
  debug: (message, meta) => logger.debug(message, meta),
};
