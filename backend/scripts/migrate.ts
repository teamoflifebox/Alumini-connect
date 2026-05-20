import fs from 'fs';
import path from 'path';
import pool from '../src/core/config/db';

const migrationsDir = path.join(__dirname, '../../database/migrations');

async function run() {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running ${file}...`);
    await pool.query(sql);
    console.log(`Done: ${file}`);
  }

  await pool.end();
}

run().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
