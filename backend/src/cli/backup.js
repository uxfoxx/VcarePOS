#!/usr/bin/env node

const { pool } = require('../utils/db');
const { createLogger } = require('../utils/logger');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);
const logger = createLogger('BackupCLI');

const command = process.argv[2];
const args = process.argv.slice(3);

async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', '..', 'backups');

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);

    console.log('Creating database backup...');
    logger.info('Starting database backup');

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'vcare_pos',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    };

    const pgDumpCommand = `PGPASSWORD="${dbConfig.password}" pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F p -f "${backupFile}"`;

    try {
      await execPromise(pgDumpCommand);

      const stats = fs.statSync(backupFile);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO migration_backups (migration_name, backup_location, backup_size_bytes, status, notes)
           VALUES ($1, $2, $3, $4, $5)`,
          ['manual_backup', backupFile, stats.size, 'completed', 'Manual backup created via CLI']
        );
      } finally {
        client.release();
      }

      console.log(`\n✓ Backup created successfully`);
      console.log(`Location: ${backupFile}`);
      console.log(`Size: ${fileSizeMB} MB`);

      logger.info(`Backup created: ${backupFile} (${fileSizeMB} MB)`);

      cleanOldBackups(backupDir);
    } catch (error) {
      if (error.message.includes('pg_dump: command not found') || error.message.includes('not recognized')) {
        console.error('\n✗ Error: pg_dump command not found');
        console.error('Please ensure PostgreSQL client tools are installed:');
        console.error('  - Ubuntu/Debian: sudo apt-get install postgresql-client');
        console.error('  - MacOS: brew install postgresql');
        console.error('  - Windows: Install PostgreSQL from https://www.postgresql.org/download/');
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.error('Backup failed:', error);
    console.error('\n✗ Backup failed:', error.message);
    process.exit(1);
  }
}

async function listBackups() {
  try {
    const backupDir = path.join(__dirname, '..', '..', 'backups');

    if (!fs.existsSync(backupDir)) {
      console.log('No backups found');
      return;
    }

    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          created: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created);

    console.log('\nDatabase Backups:');
    console.log('=================\n');

    if (files.length === 0) {
      console.log('No backups found');
      return;
    }

    files.forEach((file, index) => {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const date = file.created.toLocaleString();
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   Size: ${sizeMB} MB`);
      console.log(`   Created: ${date}`);
      console.log(`   Path: ${file.path}\n`);
    });

    console.log(`Total backups: ${files.length}`);
  } catch (error) {
    logger.error('Error listing backups:', error);
    console.error('\n✗ Error listing backups:', error.message);
    process.exit(1);
  }
}

async function restoreBackup(backupFile) {
  try {
    if (!fs.existsSync(backupFile)) {
      console.error(`✗ Backup file not found: ${backupFile}`);
      process.exit(1);
    }

    console.log('WARNING: This will restore the database from backup.');
    console.log('All current data will be replaced!');
    console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...');

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\nRestoring database from backup...');
    logger.info(`Restoring database from: ${backupFile}`);

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'vcare_pos',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    };

    const psqlCommand = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -f "${backupFile}"`;

    await execPromise(psqlCommand);

    console.log('\n✓ Database restored successfully');
    logger.info('Database restored successfully');
  } catch (error) {
    logger.error('Restore failed:', error);
    console.error('\n✗ Restore failed:', error.message);
    process.exit(1);
  }
}

function cleanOldBackups(backupDir, keepCount = 10) {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        created: fs.statSync(path.join(backupDir, file)).mtime
      }))
      .sort((a, b) => b.created - a.created);

    if (files.length > keepCount) {
      const filesToDelete = files.slice(keepCount);
      console.log(`\nCleaning up old backups (keeping ${keepCount} most recent)...`);

      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`  Deleted: ${file.name}`);
      });

      logger.info(`Cleaned up ${filesToDelete.length} old backups`);
    }
  } catch (error) {
    logger.warn('Error cleaning old backups:', error);
  }
}

async function main() {
  try {
    switch (command) {
      case 'create':
        await createBackup();
        break;

      case 'list':
        await listBackups();
        break;

      case 'restore':
        const backupFile = args[0];
        if (!backupFile) {
          console.error('✗ Error: Backup file path is required');
          console.error('Usage: npm run db:backup restore <backup-file-path>');
          process.exit(1);
        }
        await restoreBackup(backupFile);
        break;

      case 'help':
      default:
        console.log(`
Database Backup CLI Tool

Usage:
  npm run db:backup <command> [options]

Commands:
  create              Create a new database backup
  list                List all available backups
  restore <file>      Restore database from backup file
  help                Show this help message

Examples:
  npm run db:backup create
  npm run db:backup list
  npm run db:backup restore ./backups/backup_2026-01-02T10-30-00.sql

Notes:
  - Backups are stored in backend/backups directory
  - Old backups are automatically cleaned (keeps 10 most recent)
  - Requires PostgreSQL client tools (pg_dump, psql) to be installed
  - Restore operations will overwrite all current data
        `);
        break;
    }

    process.exit(0);
  } catch (error) {
    logger.error('Backup command failed:', error);
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

main();
