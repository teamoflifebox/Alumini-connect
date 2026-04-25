import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ status: 'error', message: 'Email already highly registered.' });
    }

    // Hash Password natively
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store in PostgreSQL
    const newUser = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, first_name, last_name, email, role, avatar_url, profile_setup_completed`,
      [firstName, lastName, email, hashedPassword, role]
    );

    // Mock an immediate JWT
    const token = jwt.sign(
      { userId: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.SECRET_KEY || 'default-premium-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser.rows[0] }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Sync Error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Fetch user from PostgreSQL
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials provided. User not found.' });
    }

    const user = userQuery.rows[0];

    // Securely verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials provided. Incorrect password.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.SECRET_KEY || 'default-premium-secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'success',
      token,
      data: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url,
        onboardingCompleted: user.profile_setup_completed
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error during verification' });
  }
};
