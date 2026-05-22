import pool from '../src/core/config/db';

async function run() {
  const result = await pool.query('SELECT * FROM user_profiles');
  console.log(`There are ${result.rows.length} rows in user_profiles.`);
  if (result.rows.length > 0) {
    console.log(JSON.stringify(result.rows, null, 2));
  }
  
  const columnsResult = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'user_profiles';
  `);
  console.log('Columns:', columnsResult.rows.map(r => r.column_name).join(', '));
  
  await pool.end();
}

run().catch(console.error);
