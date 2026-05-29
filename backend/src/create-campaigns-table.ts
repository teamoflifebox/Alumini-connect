import pool from './config/database';

async function main() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        raised_amount INTEGER DEFAULT 0,
        target_amount INTEGER NOT NULL,
        donors_count INTEGER DEFAULT 0,
        image_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Seed the database if empty
    const { rowCount } = await pool.query('SELECT 1 FROM campaigns LIMIT 1');
    if (rowCount === 0) {
      await pool.query(`
        INSERT INTO campaigns (title, description, raised_amount, target_amount, donors_count, image_url)
        VALUES 
          ('Scholarship Fund 2026', 'Support underprivileged students with full-ride scholarships for the upcoming academic year.', 45000, 50000, 124, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop'),
          ('New Innovation Lab Building', 'Help us build a state-of-the-art AI & Robotics laboratory for computer science students.', 120000, 500000, 45, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop')
      `);
      console.log('Seeded campaigns table');
    }
    
    console.log('Campaigns table ready');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
main();
