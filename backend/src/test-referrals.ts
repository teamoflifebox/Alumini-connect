import pool from './config/database';

async function main() {
  try {
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'referral_applications'
    `);
    console.log('referral_applications columns:', cols.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
main();
