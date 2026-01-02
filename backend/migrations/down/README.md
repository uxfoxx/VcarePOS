# Down Migrations

This directory contains rollback scripts for database migrations.

## Structure

Each migration file `YYYYMMDDHHMMSS_migration_name.sql` should have a corresponding rollback file:
`YYYYMMDDHHMMSS_migration_name_down.sql`

## Usage

Down migrations are automatically executed when running:
```bash
npm run migrate down
```

## Writing Down Migrations

Down migrations should reverse the changes made in the up migration:

- If the up migration CREATE'd a table, the down migration should DROP it
- If the up migration ADD'd a column, the down migration should DROP it
- If the up migration DROP'd something, the down migration should CREATE it back
- Always use IF EXISTS / IF NOT EXISTS for safety

## Example

Up migration (20250101000000_create_users.sql):
```sql
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
);
```

Down migration (20250101000000_create_users_down.sql):
```sql
DROP TABLE IF EXISTS users CASCADE;
```

## Important Notes

- Down migrations are critical for production environments
- Always test your down migrations before deploying
- Use CASCADE carefully - it will drop dependent objects
- Keep down migrations as simple as possible
- Document any data loss that might occur during rollback
