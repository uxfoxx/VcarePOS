# VcarePOS Backend Logging System

This document explains the logging system implemented in the VcarePOS backend.

## Overview

The logging system uses Winston for structured logging with multiple transports:
- Console logging for development
- File logging for all environments
- Separate log files for errors, combined logs, unhandled exceptions, and promise rejections

## Log Files

Log files are stored in the `logs` directory in the project root:
- `error.log`: Contains all logs of level 'error' and below
- `combined.log`: Contains all logs of all levels
- `exceptions.log`: Contains all unhandled exceptions
- `rejections.log`: Contains all unhandled promise rejections

## Log Levels

The logging system uses the following levels (from highest to lowest priority):
1. error: For critical errors that require immediate attention
2. warn: For issues that should be reviewed but aren't critical
3. info: For important application events
4. http: For HTTP request/response logging
5. debug: For detailed debugging information

## Using the Logger

Import the logger in your files:

```javascript
const { logger } = require('./utils/logger');
```

Basic usage:

```javascript
// Different log levels
logger.error('Critical error occurred', { userId: '123', error: err.message });
logger.warn('Something suspicious', { userId: '123', action: 'login' });
logger.info('Operation successful', { userId: '123', operation: 'create' });
logger.debug('Detailed debug info', { data: someData });
```

## Utility Functions

Several utility functions are available in `utils/loggerUtils.js`:

```javascript
const { logRequestDetails, logDatabaseOperation, logAuthEvent } = require('./utils/loggerUtils');

// Log API request details
logRequestDetails(req, 'User API');

// Log database operation
logDatabaseOperation('SELECT * FROM users WHERE id = $1', { id: '123' });

// Log authentication events
logAuthEvent(userId, true, 'password', { ip: req.ip });
```

## Error Handling

The system includes global error handling middleware that logs errors and returns appropriate responses to clients:

- `notFound`: For 404 errors
- `errorHandler`: For all other errors

## Debug Mode

To increase log verbosity for debugging, set the `LOG_LEVEL` environment variable:

```
LOG_LEVEL=debug npm run dev
```

## Production Configuration

In production, console logs are disabled to optimize performance. Only file logging is active.
