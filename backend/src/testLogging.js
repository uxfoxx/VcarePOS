/**
 * Test script for logging system
 */
const { logger } = require('./utils/logger');
const { logSystemMetrics, logAuthEvent, logError } = require('./utils/loggerUtils');

// Test different log levels
console.log('Testing logging system...');

// Test basic logs
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');
logger.debug('This is a debug message');

// Test system metrics
logSystemMetrics(false);  // Concise
logSystemMetrics(true);   // Detailed

// Test authentication logging
logAuthEvent('user123', true, 'password', { ip: '127.0.0.1' });
logAuthEvent('user456', false, 'password', { 
  ip: '192.168.1.1',
  reason: 'Invalid password'
});

// Test error logging
try {
  throw new Error('Test error');
} catch (err) {
  logError(err, 'Test Module', { userId: 'testUser' });
}

console.log('Log test complete. Check your logs directory for results.');
