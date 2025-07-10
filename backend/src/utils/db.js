const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a new pool instance with connection details
let pool;

try {
  // Try to connect using environment variables
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'vcare_pos',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });
  
  console.log('Database connection pool created');
} catch (error) {
  console.error('Error creating database connection pool:', error);
  
  // Fallback to default values
  pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'vcare_pos',
    user: 'postgres',
    password: 'postgres',
  });
}

// Export the pool for use in other modules
module.exports = { pool };