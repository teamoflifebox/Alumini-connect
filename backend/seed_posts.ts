import pool from './src/core/config/db';

async function seedPosts() {
  try {
    const users = await pool.query('SELECT id FROM users LIMIT 3');
    if (users.rows.length === 0) return;

    const author1 = users.rows[0].id;
    const author2 = users.rows[1]?.id || author1;
    const author3 = users.rows[2]?.id || author1;

    const query = `
      INSERT INTO community_posts (author_id, content, likes_count, comments_count)
      VALUES 
      ($1, 'Just finished my first week at Google as a Backend Engineer! Huge thanks to the alumni network for the referral and guidance during my interview prep. Feel free to reach out if you need resume reviews! 🚀', 124, 15),
      ($2, 'I''m putting together a comprehensive roadmap for cracking system design interviews in 2026. What are the key topics you struggle with the most? Drop them below and I''ll make sure to cover them! 👇', 89, 42),
      ($3, 'Attended a fascinating tech talk on AI and the future of LLMs today. The capabilities of models are expanding faster than we can adapt our software engineering practices. What are your thoughts on AI-assisted coding?', 256, 88),
      ($1, 'We are hiring! My team is looking for 2 entry-level frontend developers. Must know React and have a solid grasp of web performance. DM me your resumes if you are from the 2025/2026 batch!', 310, 112)
      ON CONFLICT DO NOTHING;
    `;

    await pool.query(query, [author1, author2, author3]);
    console.log('Successfully seeded LinkedIn-style posts!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedPosts();
