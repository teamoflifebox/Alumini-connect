import pool from '../../core/config/db';

export class UsersRepository {
  async findById(id: string) {
    const query = 'SELECT id, email, name, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async findAll() {
    const query = 'SELECT id, email, name, created_at FROM users';
    const result = await pool.query(query);
    return result.rows;
  }
}

export const usersRepository = new UsersRepository();
