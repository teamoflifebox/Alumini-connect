import pool from './config/database';

async function main() {
  try {
    const res = await pool.query('SELECT DISTINCT current_status FROM referral_applications');
    console.log('statuses:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
main();
