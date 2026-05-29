import pool from './config/database';

async function main() {
  try {
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log(tables.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
main();
