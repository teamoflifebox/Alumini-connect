import pool from '../../core/config/db';

export class AuthRepository {
  async findUserByEmail(email: string) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async createUser(userData: any) {
    const { email, passwordHash, name } = userData;
    const query = `
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name;
    `;
    const result = await pool.query(query, [email, passwordHash, name]);
    return result.rows[0];
  }
}

export const authRepository = new AuthRepository();
