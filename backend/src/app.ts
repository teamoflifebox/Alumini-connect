import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './core/middlewares/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';

const app: Express = express();

// Global Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// Domain Routes Mount
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);

// Error Handling Middleware (must be after routes)
app.use(errorHandler);

export default app;
