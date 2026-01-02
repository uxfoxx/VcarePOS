# Database Migration System

Comprehensive guide for the VCare POS database migration system with rollback support.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [CLI Commands](#cli-commands)
4. [Creating Migrations](#creating-migrations)
5. [Running Migrations](#running-migrations)
6. [Rollback System](#rollback-system)
7. [Database Backups](#database-backups)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

The migration system provides:

- **Batch Tracking**: Group related migrations together
- **Rollback Support**: Safely undo migrations
- **File Integrity**: SHA256 checksums prevent tampering
- **Execution Monitoring**: Track migration performance
- **Database Backups**: Create and restore database snapshots
- **Validation Tools**: Verify migration integrity

### Architecture

```
backend/
├── migrations/
│   └── down/              # Rollback scripts
│       ├── README.md
│       └── *_down.sql
├── src/
│   ├── cli/
│   │   ├── migrate.js     # Migration CLI
│   │   ├── makeMigration.js  # Migration generator
│   │   └── backup.js      # Backup CLI
│   └── utils/
│       └── migrationRunner.js  # Core migration engine
└── supabase/
    └── migrations/        # Up migrations
        └── *.sql
```

### Migration Tracking Tables

**migration_history**: Tracks all migrations
- `name`: Migration file name
- `batch`: Batch number for grouping
- `status`: applied | rolled_back | failed
- `checksum`: SHA256 hash for integrity
- `execution_time_ms`: Performance tracking
- `error_message`: Error details if failed

**migration_backups**: Tracks database backups
- `migration_name`: Associated migration
- `backup_location`: File path
- `backup_size_bytes`: Backup size
- `status`: in_progress | completed | failed

## Quick Start

### 1. Create a New Migration

```bash
cd backend
npm run migrate:make
```

Follow the prompts to create your migration files.

### 2. Run Migrations

```bash
npm run migrate:up
```

### 3. Check Status

```bash
npm run migrate:status
```

### 4. Rollback if Needed

```bash
npm run migrate:down
```

## CLI Commands

### Migration Commands

| Command | Description | Example |
|---------|-------------|---------|
| `npm run migrate` | Show help | |
| `npm run migrate:up` | Run all pending migrations | |
| `npm run migrate:down` | Rollback last batch | |
| `npm run migrate:down 2` | Rollback last 2 batches | `npm run migrate:down 2` |
| `npm run migrate:status` | Show migration status | |
| `npm run migrate:validate` | Validate file integrity | |
| `npm run migrate:fresh` | Rollback all and re-run | ⚠️ DESTRUCTIVE |
| `npm run migrate:make` | Create new migration | |

### Backup Commands

| Command | Description | Example |
|---------|-------------|---------|
| `npm run db:backup create` | Create database backup | |
| `npm run db:backup list` | List all backups | |
| `npm run db:backup restore <file>` | Restore from backup | `npm run db:backup restore ./backups/backup.sql` |

## Creating Migrations

### Using the Generator

```bash
npm run migrate:make
```

The generator will:
1. Ask for a migration name
2. Ask for a description
3. Create both up and down migration files
4. Add helpful templates and comments

### File Naming Convention

```
YYYYMMDDHHMMSS_migration_name.sql           # Up migration
YYYYMMDDHHMMSS_migration_name_down.sql      # Down migration
```

Example:
```
20260102103045_create_users_table.sql
20260102103045_create_users_table_down.sql
```

### Migration Template

**Up Migration** (`*_.sql`):
```sql
/*
  # Migration Name

  1. Description
    - What this migration does

  2. Changes
    - List of changes

  3. Security
    - RLS policies
    - Access controls
*/

-- Your SQL goes here
CREATE TABLE IF NOT EXISTS your_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON your_table
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);
```

**Down Migration** (`*_down.sql`):
```sql
/*
  # Rollback: Migration Name

  This reverses the changes in the up migration.
*/

-- Reverse the changes
DROP POLICY IF EXISTS "Users can view own data" ON your_table;
DROP TABLE IF EXISTS your_table CASCADE;
```

## Running Migrations

### Standard Migration Flow

```bash
# 1. Check current status
npm run migrate:status

# 2. Validate existing migrations
npm run migrate:validate

# 3. Run pending migrations
npm run migrate:up

# 4. Verify success
npm run migrate:status
```

### Migration Output

```
Migration Summary:
✓ Migrations run: 3
✓ Batch: 5

Details:
  - 20260102103045_create_users.sql: 127ms
  - 20260102103050_add_permissions.sql: 83ms
  - 20260102103055_create_indexes.sql: 45ms
```

### What Happens During Migration

1. **Initialization**: Creates tracking tables if needed
2. **File Discovery**: Scans migration directory
3. **Comparison**: Identifies pending migrations
4. **Batch Assignment**: Assigns new batch number
5. **Execution**: Runs each migration in transaction
6. **Recording**: Saves execution details
7. **Rollback**: Automatic rollback if any migration fails

## Rollback System

### How Rollback Works

Rollbacks operate on **batches** - groups of migrations run together.

```bash
# Rollback last batch
npm run migrate:down

# Rollback last 2 batches
npm run migrate:down 2

# Rollback everything (DANGEROUS!)
npm run migrate:fresh
```

### Rollback Process

1. Identifies migrations in target batches
2. Reverses them in reverse order (LIFO)
3. Executes down migration for each
4. Updates status to 'rolled_back'
5. Does NOT delete migration records (audit trail)

### Rollback Output

```
Rollback Summary:
✓ Migrations rolled back: 3

Details:
  - 20260102103055_create_indexes.sql: 23ms
  - 20260102103050_add_permissions.sql: 45ms
  - 20260102103045_create_users.sql: 67ms
```

### Writing Good Down Migrations

**DO:**
- Use IF EXISTS clauses
- Drop in reverse dependency order
- Drop policies before tables
- Use CASCADE when appropriate
- Document data loss

**DON'T:**
- Assume data preservation
- Skip CASCADE when needed
- Leave orphaned objects
- Forget to test

## Database Backups

### Creating Backups

```bash
# Manual backup
npm run db:backup create
```

Output:
```
✓ Backup created successfully
Location: backend/backups/backup_2026-01-02T10-30-00.sql
Size: 42.5 MB
```

### Listing Backups

```bash
npm run db:backup list
```

Output:
```
Database Backups:
=================

1. backup_2026-01-02T10-30-00.sql
   Size: 42.5 MB
   Created: 1/2/2026, 10:30:00 AM
   Path: /path/to/backups/backup_2026-01-02T10-30-00.sql

Total backups: 5
```

### Restoring from Backup

```bash
npm run db:backup restore ./backups/backup_2026-01-02T10-30-00.sql
```

⚠️ **WARNING**: This will overwrite all current data!

### Automatic Cleanup

The system automatically keeps the 10 most recent backups and deletes older ones.

### Requirements

Backups require PostgreSQL client tools:

- **Ubuntu/Debian**: `sudo apt-get install postgresql-client`
- **MacOS**: `brew install postgresql`
- **Windows**: Install from [postgresql.org](https://www.postgresql.org/download/)

## Best Practices

### Migration Development

1. **One Purpose Per Migration**
   - Don't mix unrelated changes
   - Keep migrations focused and atomic

2. **Always Use Safeguards**
   ```sql
   CREATE TABLE IF NOT EXISTS ...
   DROP TABLE IF EXISTS ...
   ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...
   ```

3. **Test Both Directions**
   ```bash
   npm run migrate:up
   npm run migrate:down
   npm run migrate:up
   ```

4. **Enable RLS on All Tables**
   ```sql
   ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
   ```

5. **Create Restrictive Policies**
   ```sql
   -- Good: Restrictive
   CREATE POLICY "Users view own data"
     ON users FOR SELECT
     TO authenticated
     USING (id = auth.uid()::text);

   -- Bad: Too permissive
   CREATE POLICY "Anyone can view"
     ON users FOR SELECT
     USING (true);
   ```

### Production Workflow

1. **Development**
   ```bash
   npm run migrate:make
   # Write migration
   npm run migrate:up
   npm run migrate:down  # Test rollback
   npm run migrate:up    # Re-apply
   ```

2. **Testing**
   ```bash
   npm run migrate:validate
   npm run migrate:status
   ```

3. **Backup Before Production**
   ```bash
   npm run db:backup create
   ```

4. **Deploy to Production**
   ```bash
   npm run migrate:up
   ```

5. **Verify**
   ```bash
   npm run migrate:status
   npm run migrate:validate
   ```

### Version Control

**DO commit:**
- All migration files (`*.sql`)
- Down migration files (`*_down.sql`)
- Documentation updates

**DON'T commit:**
- Database backups (`backend/backups/`)
- Local database files
- Environment variables

### Security Considerations

1. **Never expose passwords** in migration files
2. **Always use RLS** on tables with user data
3. **Validate checksums** before production deploys
4. **Test rollbacks** in staging first
5. **Audit migration history** regularly

## Troubleshooting

### Migration Fails

```bash
# Check the error
npm run migrate:status

# Validate integrity
npm run migrate:validate

# Check logs
tail -f logs/migration-*.log
```

### Checksum Mismatch

```
Error: Migration file has been modified
Expected: abc123...
Actual: def456...
```

**Fix**: Don't modify applied migrations. Create a new migration instead.

### Rollback Fails

```bash
# Check if down migration exists
ls backend/migrations/down/

# Try manual rollback
psql -d vcare_pos -f backend/migrations/down/YYYYMMDDHHMMSS_migration_down.sql
```

### Can't Find Down Migration

```
Error: Down migration file not found: 20260102103045_create_users_down.sql
```

**Fix**: Create the missing down migration manually.

### Backup/Restore Issues

**pg_dump not found**:
```bash
# Install PostgreSQL client tools
# Ubuntu/Debian
sudo apt-get install postgresql-client

# MacOS
brew install postgresql
```

**Permission denied**:
```bash
# Check database credentials in .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vcare_pos
DB_USER=postgres
DB_PASSWORD=your_password
```

### Database Connection Issues

```bash
# Test connection
psql -h localhost -p 5432 -U postgres -d vcare_pos

# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # MacOS
```

## Advanced Usage

### Programmatic API

```javascript
const { MigrationRunner } = require('./backend/src/utils/migrationRunner');

const runner = new MigrationRunner();

// Run migrations
await runner.migrate();

// Rollback
await runner.rollback(1);

// Get status
const status = await runner.status();

// Validate
const validation = await runner.validate();
```

### Custom Batch Numbers

Migrations are automatically assigned to batches. Each run of `migrate:up` creates a new batch.

### Migration Hooks

You can add pre/post migration hooks by modifying `migrationRunner.js`:

```javascript
async applyMigration(fileName, batch) {
  // Pre-migration hook
  await this.beforeMigration(fileName);

  // Migration logic...

  // Post-migration hook
  await this.afterMigration(fileName);
}
```

## Support

For issues or questions:

1. Check this documentation
2. Review migration logs in `logs/`
3. Check migration status: `npm run migrate:status`
4. Validate integrity: `npm run migrate:validate`
5. Review audit trail in `migration_history` table

## Changelog

### Version 1.0.0 (2026-01-02)

- Initial release
- Batch tracking system
- Rollback support
- File integrity checking
- Database backup/restore
- CLI tools
- Comprehensive documentation
