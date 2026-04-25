import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import pool from './config/db';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Basic Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'AlumniConnect API is running smoothly.' });
});

// Core API Routes
app.use('/api/auth', authRoutes);
// app.use('/api/scholarships', scholarshipRoutes);
// app.use('/api/jobs', jobRoutes);
// app.use('/api/mentorship', mentorshipRoutes);

// Database connection test and Server Init
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connection stable at:', res.rows[0].now);
  } catch (err) {
    console.error('Database connection failed:', err);
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});
