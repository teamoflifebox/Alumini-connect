import pool from '../src/core/config/db';

async function main() {
  const tables = await pool.query(
    `SELECT table_name FROM information_schema.tables 
     WHERE table_schema = 'public' 
     ORDER BY table_name`
  );
  
  console.log('\n=== All Tables in Database ===\n');
  
  for (const row of tables.rows) {
    const tableName = row.table_name;
    console.log(`\n📋 Table: ${tableName}`);
    
    // Get column info
    const columns = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_name = $1
       ORDER BY ordinal_position`,
      [tableName]
    );
    
    console.log('   Columns:');
    columns.rows.forEach(col => {
      console.log(`     - ${col.column_name} (${col.data_type})`);
    });
    
    // Get row count
    const count = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
    console.log(`   Rows: ${count.rows[0].count}`);
  }
  
  await pool.end();
}

main().catch(console.error);
