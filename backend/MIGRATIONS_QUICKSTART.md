# Migrations Quick Start

## New to Migrations?

Start here for a quick introduction to the migration system.

## What Are Migrations?

Migrations are version control for your database schema. They allow you to:

- Track database changes over time
- Share schema changes with your team
- Rollback changes if something goes wrong
- Maintain a clear history of database evolution

## Essential Commands

### Check What's Going On

```bash
npm run migrate:status
```

Shows which migrations have been applied and which are pending.

### Apply Pending Migrations

```bash
npm run migrate:up
```

Runs all migrations that haven't been applied yet.

### Undo Last Changes

```bash
npm run migrate:down
```

Rolls back the most recent batch of migrations.

### Create a New Migration

```bash
npm run migrate:make
```

Generates migration template files for you to fill in.

### Backup Your Database

```bash
npm run db:backup create
```

Creates a complete snapshot of your database.

## Quick Example

### 1. Create a New Table

```bash
# Generate migration files
npm run migrate:make
# Enter: "create products table"
```

### 2. Edit the Up Migration

File: `supabase/migrations/20260102_create_products_table.sql`

```sql
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

### 3. Edit the Down Migration

File: `backend/migrations/down/20260102_create_products_table_down.sql`

```sql
DROP TABLE IF EXISTS products CASCADE;
```

### 4. Apply the Migration

```bash
npm run migrate:up
```

### 5. Test the Rollback

```bash
npm run migrate:down
npm run migrate:up
```

## Common Tasks

### Before Deploying to Production

```bash
# 1. Create a backup
npm run db:backup create

# 2. Validate migrations
npm run migrate:validate

# 3. Check status
npm run migrate:status

# 4. Apply migrations
npm run migrate:up
```

### If Something Goes Wrong

```bash
# Rollback the last batch
npm run migrate:down

# Restore from backup if needed
npm run db:backup list
npm run db:backup restore <backup-file>
```

## Important Rules

1. **Never modify applied migrations** - Create a new migration instead
2. **Always test rollbacks** - Make sure your down migrations work
3. **Backup before big changes** - Especially in production
4. **Enable RLS on tables** - Security first
5. **Use IF EXISTS clauses** - Make migrations idempotent

## Need More Help?

Read the comprehensive guide: [docs/MIGRATIONS.md](./docs/MIGRATIONS.md)

## Troubleshooting

### "Migration file has been modified"

You changed a migration that was already applied. Don't do that! Create a new migration instead.

### "Down migration file not found"

You need to create a rollback script. Run `npm run migrate:make` and it will create both files for you.

### "pg_dump: command not found"

Install PostgreSQL client tools:
- Ubuntu: `sudo apt-get install postgresql-client`
- MacOS: `brew install postgresql`
- Windows: Download from postgresql.org

## Migration Status Symbols

When you run `npm run migrate:status`:

- `✓` = Migration applied successfully
- `○` = Migration pending (not yet applied)
- `↩` = Has rollback script available

## Next Steps

1. Run `npm run migrate:status` to see your current state
2. Try creating a test migration with `npm run migrate:make`
3. Read the full documentation at `docs/MIGRATIONS.md`
4. Practice rolling back migrations in development

## Quick Reference Card

| Task | Command |
|------|---------|
| Show status | `npm run migrate:status` |
| Apply migrations | `npm run migrate:up` |
| Rollback migrations | `npm run migrate:down` |
| Create migration | `npm run migrate:make` |
| Validate integrity | `npm run migrate:validate` |
| Create backup | `npm run db:backup create` |
| List backups | `npm run db:backup list` |
| Get help | `npm run migrate help` |
