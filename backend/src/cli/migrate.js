#!/usr/bin/env node

const { MigrationRunner } = require('../utils/migrationRunner');
const { createLogger } = require('../utils/logger');

const logger = createLogger('MigrateCLI');

const command = process.argv[2];
const args = process.argv.slice(3);

const runner = new MigrationRunner();

async function main() {
  try {
    switch (command) {
      case 'up':
      case 'migrate':
        logger.info('Running migrations...');
        const migrateResult = await runner.migrate();
        console.log('\nMigration Summary:');
        console.log(`✓ Migrations run: ${migrateResult.migrationsRun}`);
        if (migrateResult.migrationsRun > 0) {
          console.log(`✓ Batch: ${migrateResult.batch}`);
          console.log('\nDetails:');
          migrateResult.results.forEach(r => {
            console.log(`  - ${r.file}: ${r.executionTime}ms`);
          });
        }
        break;

      case 'down':
      case 'rollback':
        const steps = parseInt(args[0]) || 1;
        logger.info(`Rolling back ${steps} batch(es)...`);
        const rollbackResult = await runner.rollback(steps);
        console.log('\nRollback Summary:');
        console.log(`✓ Migrations rolled back: ${rollbackResult.migrationsRolledBack}`);
        if (rollbackResult.migrationsRolledBack > 0) {
          console.log('\nDetails:');
          rollbackResult.results.forEach(r => {
            console.log(`  - ${r.migration}: ${r.executionTime}ms`);
          });
        }
        break;

      case 'status':
        logger.info('Checking migration status...');
        const statusResult = await runner.status();
        console.log('\nMigration Status:');
        console.log(`Total migrations: ${statusResult.total}`);
        console.log(`Applied: ${statusResult.applied}`);
        console.log(`Pending: ${statusResult.pending}`);
        console.log('\nDetails:');
        statusResult.migrations.forEach(m => {
          const status = m.status === 'applied' ? '✓' : '○';
          const rollback = m.hasRollback ? '↩' : ' ';
          const batch = m.batch ? `(batch ${m.batch})` : '';
          console.log(`  ${status} ${rollback} ${m.name} ${batch}`);
        });
        console.log('\nLegend: ✓ = applied, ○ = pending, ↩ = has rollback');
        break;

      case 'validate':
        logger.info('Validating migrations...');
        const validateResult = await runner.validate();
        if (validateResult.valid) {
          console.log('✓ All migrations are valid');
        } else {
          console.log('✗ Validation errors found:');
          validateResult.errors.forEach(e => {
            console.log(`  - ${e.migration}: ${e.error}`);
          });
          process.exit(1);
        }
        break;

      case 'fresh':
        logger.warn('WARNING: This will rollback ALL migrations!');
        console.log('Rolling back all migrations...');
        let batch = await runner.getCurrentBatch();
        while (batch > 0) {
          await runner.rollback(1);
          batch = await runner.getCurrentBatch();
        }
        console.log('Running migrations fresh...');
        await runner.migrate();
        console.log('✓ Database refreshed successfully');
        break;

      case 'help':
      default:
        console.log(`
Migration CLI Tool

Usage:
  npm run migrate <command> [options]

Commands:
  up, migrate           Run all pending migrations
  down, rollback [n]    Rollback last n batches (default: 1)
  status                Show migration status
  validate              Validate migration file integrity
  fresh                 Rollback all migrations and re-run them
  help                  Show this help message

Examples:
  npm run migrate up              # Run all pending migrations
  npm run migrate down            # Rollback last batch
  npm run migrate down 2          # Rollback last 2 batches
  npm run migrate status          # Show migration status
  npm run migrate validate        # Validate migration integrity
  npm run migrate fresh           # Refresh database (DANGEROUS!)
        `);
        break;
    }

    process.exit(0);
  } catch (error) {
    logger.error('Migration command failed:', error);
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

main();
