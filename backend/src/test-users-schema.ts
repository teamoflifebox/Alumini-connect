import pool from './config/database';

async function main() {
  try {
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log('users columns:', cols.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
main();
