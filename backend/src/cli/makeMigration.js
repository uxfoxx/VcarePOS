#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function toSnakeCase(str) {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

function generateMigrationTemplate(name, description) {
  return `/*
  # ${name}

  1. Description
    - ${description}

  2. Changes
    - [List your changes here]

  3. Security
    - Enable RLS if creating new tables
    - Add appropriate policies for data access

  IMPORTANT: Follow these guidelines:
  - Use IF NOT EXISTS for CREATE statements
  - Use IF EXISTS for DROP statements
  - Always enable RLS on new tables
  - Create restrictive policies by default
  - Use meaningful default values
  - Add indexes for foreign keys and frequently queried columns
*/

-- Your migration SQL goes here

-- Example:
-- CREATE TABLE IF NOT EXISTS your_table (
--   id SERIAL PRIMARY KEY,
--   name TEXT NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT now()
-- );

-- ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view own data"
--   ON your_table
--   FOR SELECT
--   TO authenticated
--   USING (user_id = auth.uid()::text);
`;
}

function generateDownMigrationTemplate(name) {
  return `/*
  # Rollback: ${name}

  This file rolls back the changes made in the up migration.

  IMPORTANT: Write SQL that reverses the up migration:
  - DROP tables that were CREATE'd
  - CREATE tables that were DROP'd
  - Remove columns that were added
  - Add columns that were removed
  - Restore original constraints and indexes
*/

-- Your rollback SQL goes here

-- Example:
-- DROP TABLE IF EXISTS your_table CASCADE;
`;
}

async function main() {
  console.log('=== Migration Generator ===\n');

  const name = await question('Migration name (e.g., "create users table"): ');
  if (!name || name.trim() === '') {
    console.error('Error: Migration name is required');
    rl.close();
    process.exit(1);
  }

  const description = await question('Description: ');

  const timestamp = generateTimestamp();
  const snakeName = toSnakeCase(name.trim());
  const fileName = `${timestamp}_${snakeName}.sql`;
  const downFileName = `${timestamp}_${snakeName}_down.sql`;

  const migrationsDir = path.join(__dirname, '..', '..', '..', 'supabase', 'migrations');
  const downMigrationsDir = path.join(migrationsDir, 'down');

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  if (!fs.existsSync(downMigrationsDir)) {
    fs.mkdirSync(downMigrationsDir, { recursive: true });
  }

  const upPath = path.join(migrationsDir, fileName);
  const downPath = path.join(downMigrationsDir, downFileName);

  fs.writeFileSync(upPath, generateMigrationTemplate(name, description || 'No description provided'));
  fs.writeFileSync(downPath, generateDownMigrationTemplate(name));

  console.log('\n✓ Migration files created successfully:');
  console.log(`  Up:   ${upPath}`);
  console.log(`  Down: ${downPath}`);
  console.log('\nNext steps:');
  console.log('  1. Edit the migration files with your SQL');
  console.log('  2. Run: npm run migrate up');
  console.log('  3. To rollback: npm run migrate down');

  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
