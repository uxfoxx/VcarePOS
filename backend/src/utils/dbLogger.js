/**
 * Database wrapper with built-in logging
 */
const { pool } = require('./db');
const { logDatabaseOperation, createTimer } = require('./loggerUtils');

/**
 * Execute a database query with logging
 * @param {String} query - SQL query to execute
 * @param {Array|Object} params - Query parameters
 * @param {Object} options - Additional options for logging
 * @returns {Promise<Object>} - Query result
 */
const executeQuery = async (query, params = [], options = {}) => {
  const timer = createTimer();
  const client = await pool.connect();
  
  try {
    const result = await client.query(query, params);
    const duration = timer.stop();
    
    // Log the successful query with duration
    logDatabaseOperation(query, params, options.context || 'DB Query', {
      duration,
      rowCount: result.rowCount
    });
    
    return result;
  } catch (error) {
    const duration = timer.stop();
    
    // Log the failed query
    logDatabaseOperation(query, params, options.context || 'DB Query', {
      duration,
      error
    });
    
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Execute a database transaction with logging
 * @param {Function} callback - Function that receives a client and executes queries
 * @param {Object} options - Additional options for logging
 * @returns {Promise<any>} - Result from the callback
 */
const executeTransaction = async (callback, options = {}) => {
  const timer = createTimer();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const result = await callback(client);
    
    await client.query('COMMIT');
    const duration = timer.stop();
    
    logDatabaseOperation('TRANSACTION', {}, options.context || 'DB Transaction', {
      duration,
      success: true
    });
    
    return result;
  } catch (error) {
    const duration = timer.stop();
    
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logDatabaseOperation('ROLLBACK', {}, options.context || 'DB Transaction', {
        error: rollbackError,
        originalError: error
      });
    }
    
    logDatabaseOperation('TRANSACTION', {}, options.context || 'DB Transaction', {
      duration,
      error,
      success: false
    });
    
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  executeQuery,
  executeTransaction,
  pool // Still export the original pool for direct access if needed
};
