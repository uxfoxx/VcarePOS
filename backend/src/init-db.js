const { pool } = require('./utils/db');
const { runMigrations } = require('./utils/migrate');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Test database connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    console.log('Database connection successful');
    client.release();
    
    // Run migrations and seed data
    await runMigrations();
    
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();