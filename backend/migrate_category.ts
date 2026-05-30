import pool from './src/core/config/db';

async function run() {
  try {
    await pool.query(`ALTER TABLE success_stories ADD COLUMN category VARCHAR DEFAULT 'story';`);
    console.log('Migration successful');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
