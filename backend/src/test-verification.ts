import pool from './config/database';

async function main() {
  try {
    const totalQuery = await pool.query('SELECT COUNT(*) FROM referral_applications');
    const verifiedQuery = await pool.query("SELECT COUNT(*) FROM referral_applications WHERE current_status = 'approved' OR current_status = 'verified'");
    console.log('total:', totalQuery.rows[0].count);
    console.log('verified:', verifiedQuery.rows[0].count);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
main();
