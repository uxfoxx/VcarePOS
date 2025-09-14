/**
 * Example file showing how to use the database wrapper with logging
 */
const { executeQuery, executeTransaction } = require('./dbLogger');
const { logError } = require('./loggerUtils');

/**
 * Example function to get a user by ID with logging
 * @param {string} userId - The user ID to retrieve
 * @returns {Promise<Object>} - User object
 */
async function getUserById(userId) {
  try {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await executeQuery(query, [userId], {
      context: 'User Service'
    });
    
    return result.rows[0];
  } catch (error) {
    logError(error, 'User Service', { operation: 'getUserById', userId });
    throw error;
  }
}

/**
 * Example function to create a user with transaction and logging
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - Created user
 */
async function createUser(userData) {
  try {
    return await executeTransaction(async (client) => {
      // Insert user
      const insertUserQuery = `
        INSERT INTO users (username, email, password, first_name, last_name, role) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const userResult = await client.query(insertUserQuery, [
        userData.username,
        userData.email,
        userData.password, // Assume this is already hashed
        userData.firstName,
        userData.lastName,
        userData.role || 'user'
      ]);
      
      // Insert user profile
      const insertProfileQuery = `
        INSERT INTO user_profiles (user_id, phone, address) 
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      await client.query(insertProfileQuery, [
        userResult.rows[0].id,
        userData.phone || null,
        userData.address || null
      ]);
      
      return userResult.rows[0];
    }, {
      context: 'User Creation'
    });
  } catch (error) {
    logError(error, 'User Service', { 
      operation: 'createUser',
      username: userData.username,
      email: userData.email
    });
    throw error;
  }
}

module.exports = {
  getUserById,
  createUser
};
