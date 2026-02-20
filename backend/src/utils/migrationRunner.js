const { pool } = require('./db');
const { createChildLogger } = require('./logger');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const logger = createChildLogger('MigrationRunner');

/**
 * Enhanced Migration Runner with Rollback Support
 * Provides comprehensive migration management with batch tracking, rollback, and validation
 */
class MigrationRunner {
  constructor() {
    this.migrationsDir = path.join(__dirname, '..', '..', '..', 'supabase', 'migrations');
    this.downMigrationsDir = path.join(__dirname, '..', '..', 'migrations', 'down');
  }

  /**
   * Initialize migration tracking table
   */
  async initializeMigrationTable() {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS migration_history (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          batch INTEGER NOT NULL DEFAULT 1,
          applied_at TIMESTAMPTZ DEFAULT now(),
          rolled_back_at TIMESTAMPTZ,
          execution_time_ms INTEGER,
          status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'rolled_back', 'failed')),
          error_message TEXT,
          checksum TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_migration_history_name ON migration_history(name);
        CREATE INDEX IF NOT EXISTS idx_migration_history_batch ON migration_history(batch);
        CREATE INDEX IF NOT EXISTS idx_migration_history_status ON migration_history(status);
        CREATE INDEX IF NOT EXISTS idx_migration_history_applied_at ON migration_history(applied_at);

        CREATE TABLE IF NOT EXISTS migration_backups (
          id SERIAL PRIMARY KEY,
          migration_name TEXT NOT NULL,
          backup_timestamp TIMESTAMPTZ DEFAULT now(),
          backup_size_bytes BIGINT,
          backup_location TEXT,
          status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'failed')),
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `);

      logger.info('Migration tracking tables initialized');
    } catch (error) {
      logger.error('Error initializing migration tables:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Calculate SHA256 checksum of a file
   */
  calculateChecksum(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get list of migration files
   */
  getMigrationFiles() {
    if (!fs.existsSync(this.migrationsDir)) {
      fs.mkdirSync(this.migrationsDir, { recursive: true });
    }

    return fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql') && !file.includes('_down.sql'))
      .sort();
  }

  /**
   * Get list of applied migrations
   */
  async getAppliedMigrations() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT name, batch, status, checksum FROM migration_history WHERE status = $1 ORDER BY applied_at',
        ['applied']
      );
      return result.rows;
    } catch (error) {
      logger.error('Error getting applied migrations:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get current batch number
   */
  async getCurrentBatch() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT COALESCE(MAX(batch), 0) as max_batch FROM migration_history'
      );
      return result.rows[0].max_batch;
    } catch (error) {
      logger.error('Error getting current batch:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Validate migration file integrity
   */
  async validateMigration(fileName, expectedChecksum) {
    const filePath = path.join(this.migrationsDir, fileName);
    const actualChecksum = this.calculateChecksum(filePath);

    if (expectedChecksum && actualChecksum !== expectedChecksum) {
      throw new Error(`Migration file ${fileName} has been modified. Expected checksum: ${expectedChecksum}, actual: ${actualChecksum}`);
    }

    return actualChecksum;
  }

  /**
   * Apply a single migration
   */
  async applyMigration(fileName, batch) {
    const client = await pool.connect();
    const startTime = Date.now();

    try {
      const filePath = path.join(this.migrationsDir, fileName);
      const migrationSql = fs.readFileSync(filePath, 'utf8');
      const checksum = this.calculateChecksum(filePath);

      logger.info(`Applying migration: ${fileName} (batch ${batch})`);

      await client.query('BEGIN');

      // Execute migration
      await client.query(migrationSql);

      const executionTime = Date.now() - startTime;

      // Record migration
      await client.query(
        `INSERT INTO migration_history (name, batch, execution_time_ms, checksum, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [fileName, batch, executionTime, checksum, 'applied']
      );

      await client.query('COMMIT');

      logger.info(`Migration ${fileName} applied successfully in ${executionTime}ms`);

      return { success: true, executionTime };
    } catch (error) {
      await client.query('ROLLBACK');

      const executionTime = Date.now() - startTime;

      logger.error(`Error applying migration ${fileName}:`, error);

      // Record failed migration
      try {
        await client.query(
          `INSERT INTO migration_history (name, batch, execution_time_ms, checksum, status, error_message)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [fileName, batch, executionTime, '', 'failed', error.message]
        );
      } catch (recordError) {
        logger.error('Error recording failed migration:', recordError);
      }

      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Rollback a single migration
   */
  async rollbackMigration(migration) {
    const client = await pool.connect();
    const startTime = Date.now();

    try {
      const downFile = migration.name.replace('.sql', '_down.sql');
      const downFilePath = path.join(this.downMigrationsDir, downFile);

      if (!fs.existsSync(downFilePath)) {
        throw new Error(`Down migration file not found: ${downFile}`);
      }

      const rollbackSql = fs.readFileSync(downFilePath, 'utf8');

      logger.info(`Rolling back migration: ${migration.name}`);

      await client.query('BEGIN');

      // Execute rollback
      await client.query(rollbackSql);

      const executionTime = Date.now() - startTime;

      // Update migration record
      await client.query(
        `UPDATE migration_history
         SET status = 'rolled_back', rolled_back_at = now()
         WHERE name = $1`,
        [migration.name]
      );

      await client.query('COMMIT');

      logger.info(`Migration ${migration.name} rolled back successfully in ${executionTime}ms`);

      return { success: true, executionTime };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Error rolling back migration ${migration.name}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Run all pending migrations
   */
  async migrate() {
    try {
      await this.initializeMigrationTable();

      const migrationFiles = this.getMigrationFiles();
      const appliedMigrations = await this.getAppliedMigrations();
      const appliedNames = appliedMigrations.map(m => m.name);

      const pendingMigrations = migrationFiles.filter(file => !appliedNames.includes(file));

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations');
        return { success: true, migrationsRun: 0 };
      }

      const currentBatch = await this.getCurrentBatch();
      const newBatch = currentBatch + 1;

      logger.info(`Running ${pendingMigrations.length} migrations in batch ${newBatch}`);

      const results = [];

      for (const file of pendingMigrations) {
        const result = await this.applyMigration(file, newBatch);
        results.push({ file, ...result });
      }

      logger.info(`All migrations completed. Total execution time: ${results.reduce((sum, r) => sum + r.executionTime, 0)}ms`);

      return {
        success: true,
        migrationsRun: pendingMigrations.length,
        batch: newBatch,
        results
      };
    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Rollback last batch of migrations
   */
  async rollback(steps = 1) {
    try {
      const client = await pool.connect();

      try {
        const currentBatch = await this.getCurrentBatch();

        if (currentBatch === 0) {
          logger.info('No migrations to rollback');
          return { success: true, migrationsRolledBack: 0 };
        }

        const targetBatch = Math.max(0, currentBatch - steps + 1);

        const result = await client.query(
          `SELECT name, batch FROM migration_history
           WHERE status = 'applied' AND batch >= $1
           ORDER BY batch DESC, applied_at DESC`,
          [targetBatch]
        );

        const migrationsToRollback = result.rows;

        if (migrationsToRollback.length === 0) {
          logger.info('No migrations to rollback');
          return { success: true, migrationsRolledBack: 0 };
        }

        logger.info(`Rolling back ${migrationsToRollback.length} migrations from batch ${currentBatch}`);

        const results = [];

        for (const migration of migrationsToRollback) {
          const result = await this.rollbackMigration(migration);
          results.push({ migration: migration.name, ...result });
        }

        logger.info(`Rollback completed. Total execution time: ${results.reduce((sum, r) => sum + r.executionTime, 0)}ms`);

        return {
          success: true,
          migrationsRolledBack: migrationsToRollback.length,
          results
        };
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async status() {
    try {
      await this.initializeMigrationTable();

      const migrationFiles = this.getMigrationFiles();
      const appliedMigrations = await this.getAppliedMigrations();
      const appliedNames = appliedMigrations.map(m => m.name);

      const status = migrationFiles.map(file => {
        const applied = appliedMigrations.find(m => m.name === file);
        return {
          name: file,
          status: applied ? applied.status : 'pending',
          batch: applied ? applied.batch : null,
          hasRollback: fs.existsSync(path.join(this.downMigrationsDir, file.replace('.sql', '_down.sql')))
        };
      });

      return {
        total: migrationFiles.length,
        applied: appliedMigrations.length,
        pending: migrationFiles.length - appliedMigrations.length,
        migrations: status
      };
    } catch (error) {
      logger.error('Error getting migration status:', error);
      throw error;
    }
  }

  /**
   * Validate all migrations
   */
  async validate() {
    try {
      const appliedMigrations = await this.getAppliedMigrations();
      const errors = [];

      for (const migration of appliedMigrations) {
        try {
          await this.validateMigration(migration.name, migration.checksum);
        } catch (error) {
          errors.push({ migration: migration.name, error: error.message });
        }
      }

      if (errors.length > 0) {
        logger.error('Migration validation failed:', errors);
        return { valid: false, errors };
      }

      logger.info('All migrations validated successfully');
      return { valid: true };
    } catch (error) {
      logger.error('Error validating migrations:', error);
      throw error;
    }
  }
}

module.exports = { MigrationRunner };
