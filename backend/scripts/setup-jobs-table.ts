import pool from '../src/config/database';

async function setupJobsTable() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        company     VARCHAR(255),
        location    VARCHAR(255),
        type        VARCHAR(50),
        salary_range VARCHAR(100),
        requirements TEXT[],
        application_url TEXT,
        posted_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
        is_active   BOOLEAN DEFAULT TRUE,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_jobs_posted_by  ON jobs(posted_by)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_jobs_is_active   ON jobs(is_active)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_jobs_created_at  ON jobs(created_at DESC)`);

    await client.query('COMMIT');
    console.log('✅ jobs table created');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupJobsTable();
