const { pool } = require('./db');
const { seedDatabase } = require('./dataSeeder');
const fs = require('fs');
const path = require('path');

/**
 * Run database migrations
 */
async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migrations...');
    
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get applied migrations
    const appliedMigrationsResult = await client.query('SELECT name FROM migrations');
    const appliedMigrations = appliedMigrationsResult.rows.map(row => row.name);
    
    // Get migration files
    const migrationsDir = path.join(__dirname, '..', '..', '..', 'supabase', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir);
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    // Apply migrations
    for (const file of migrationFiles) {
      if (!appliedMigrations.includes(file)) {
        console.log(`Applying migration: ${file}`);
        
        const migrationPath = path.join(migrationsDir, file);
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        await client.query('BEGIN');
        
        try {
          await client.query(migrationSql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`Migration ${file} applied successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Error applying migration ${file}:`, error);
          throw error;
        }
      }
    }
    
    console.log('Migrations completed successfully');
    
    // Seed database with initial data
    await seedDatabase();
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { runMigrations };