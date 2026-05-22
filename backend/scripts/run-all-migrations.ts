import fs from 'fs';
import path from 'path';
import pool from '../src/config/database';

/**
 * Runs all SQL migrations in order from the database/migrations folder.
 * Skips files that are empty / already applied (best-effort via IF NOT EXISTS).
 * Run: ts-node scripts/run-all-migrations.ts
 */
async function runAllMigrations() {
  const migrationsDir = path.join(__dirname, '../../database/migrations');
  const client = await pool.connect();

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files\n`);

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8').trim();

      if (!sql || sql.startsWith('-- This migration is now handled')) {
        console.log(`⏭  Skipped (empty/stub): ${file}`);
        continue;
      }

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`✅ Applied: ${file}`);
      } catch (err: any) {
        await client.query('ROLLBACK');
        // Ignore "already exists" errors so re-runs are safe
        if (
          err.code === '42701' || // duplicate_column
          err.code === '42P07' || // duplicate_table
          err.code === '23505' || // unique_violation
          err.message?.includes('already exists')
        ) {
          console.log(`⚠  Already applied (skipped): ${file} — ${err.message}`);
        } else {
          console.error(`❌ Failed: ${file}\n   ${err.message}`);
          // Continue with remaining migrations instead of aborting
        }
      }
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n✅ All migrations processed.');
}

runAllMigrations().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
